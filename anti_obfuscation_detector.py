import re
import unicodedata
from dataclasses import dataclass, field
from enum import Enum
from functools import lru_cache

# ---------------------------------------------------------------------------
# 1. Normalisasi Karakter (Aman - tidak pernah menggabungkan kata terpisah)
# ---------------------------------------------------------------------------

_ZERO_WIDTH = re.compile("[\u200b\u200c\u200d\u2060\ufeff\u00ad]")

_HOMOGLYPHS = {
    "а": "a", "е": "e", "о": "o", "р": "p", "с": "c", "у": "y",  # Cyrillic
    "Α": "a", "Β": "b", "Ε": "e", "Ζ": "z", "Ο": "o",             # Greek
    "ⓢ": "s", "ⓛ": "l", "ⓞ": "o", "ⓣ": "t",                      # circled
}

_LEET = {
    "4": "a", "@": "a", "(": "c", "3": "e", "€": "e",
    "1": "i", "!": "i", "|": "i", "0": "o", "5": "s", "$": "s",
    "+": "t"
}

def normalize_chars(raw: str) -> str:
    text = unicodedata.normalize("NFKC", raw)
    text = _ZERO_WIDTH.sub("", text)
    text = "".join(_HOMOGLYPHS.get(ch, ch) for ch in text)
    text = "".join(_LEET.get(ch, ch) for ch in text)
    return text.lower()

# ---------------------------------------------------------------------------
# 2. Pencocokan Keyword Fuzzy (Mendeteksi sisipan titik/spasi dengan aman)
# ---------------------------------------------------------------------------

_NOISE_CLASS = r"[\s\.\-_\*]{0,2}"  # toleransi 0-2 karakter noise antar huruf

@lru_cache(maxsize=256)
def _fuzzy_pattern(keyword: str) -> re.Pattern:
    # Memeriksa batas huruf saja, bukan angka. Karena judol sering pakai angka (gacor88)
    body = _NOISE_CLASS.join(re.escape(ch) for ch in keyword)
    return re.compile(rf"(?<![a-z]){body}(?![a-z])", re.I)

GAMBLING_KEYWORDS: dict[str, int] = {
    "judol": 60, "judi": 40, "slot": 35, "gacor": 35, "maxwin": 35,
    "togel": 40, "bandar": 25, "wd": 15, "deposit": 15, "rtp": 30,
    "linkalternatif": 30, "zeus": 25, "olympus": 25, "jp": 20
}

@dataclass
class RuleMatch:
    keyword: str
    score: int
    span: tuple[int, int]

def rule_based_score(normalized: str, raw_text: str) -> tuple[int, list[RuleMatch]]:
    matches: list[RuleMatch] = []
    total = 0
    for keyword, score in GAMBLING_KEYWORDS.items():
        m = _fuzzy_pattern(keyword).search(normalized)
        if m:
            matches.append(RuleMatch(keyword=keyword, score=score, span=m.span()))
            total += score
            
    # Deteksi Pola Brand Judol (Kata generik + Angka Sakti)
    # Contoh: pluto88, suhu99, naga138, raja88
    brand_pattern = re.compile(r'\b[a-z]{3,15}(?:88|77|99|138|89|69)\b', re.I)
    for m in brand_pattern.finditer(normalized):
        matches.append(RuleMatch(keyword=f"brand_{m.group(0)}", score=35, span=m.span()))
        total += 35
        
    # Deteksi Pola Emoji Spesifik Judi (Layer 0)
    if "🎰" in raw_text and ("💸" in raw_text or "💰" in raw_text or "🤑" in raw_text):
        matches.append(RuleMatch(keyword="emoji_slot_money", score=30, span=(0,0)))
        total += 30
        
    # Deteksi Emoji Zeus / Kakek Petir
    if ("⚡" in raw_text or "🌩️" in raw_text) and ("👴" in raw_text or "🔱" in raw_text):
        matches.append(RuleMatch(keyword="emoji_zeus", score=30, span=(0,0)))
        total += 30
        
    return min(total, 100), matches

# ---------------------------------------------------------------------------
# 3. Layer Anomali Metadata (Sinyal murah di luar teks pesan)
# ---------------------------------------------------------------------------

@dataclass
class DonationMetadata:
    donor_messages_last_10min: int = 0
    amount: int = 0
    url_domain: str | None = None
    is_round_amount: bool = False           
    donor_account_age_minutes: int | None = None

SAFE_DOMAINS = {"youtube.com", "youtu.be", "open.spotify.com", "spotify.com"}

def metadata_anomaly_score(meta: DonationMetadata) -> int:
    score = 0
    if meta.donor_messages_last_10min >= 5: score += 25
    
    if meta.url_domain:
        # Jika bukan domain aman, anggap berisiko tinggi (misal: bit.ly, s.id, dsb)
        if not any(safe in meta.url_domain.lower() for safe in SAFE_DOMAINS):
            score += 20
            
    if meta.is_round_amount and meta.amount <= 20_000: score += 10
    if meta.donor_account_age_minutes is not None and meta.donor_account_age_minutes < 2: score += 15
    return min(score, 100)

# ---------------------------------------------------------------------------
# 4. Keputusan Cascade (CLEAR / HOLD / BLOCK)
# ---------------------------------------------------------------------------

class Decision(str, Enum):
    CLEAR = "CLEAR"
    HOLD = "HOLD"      
    BLOCK = "BLOCK"

@dataclass
class DetectionResult:
    raw_text: str
    normalized_text: str
    rule_score: int
    metadata_score: int
    rule_matches: list[RuleMatch] = field(default_factory=list)
    decision: Decision = Decision.CLEAR
    needs_ml_review: bool = False

def evaluate_message(raw_text: str, metadata: DonationMetadata | None = None) -> DetectionResult:
    metadata = metadata or DonationMetadata()
    normalized = normalize_chars(raw_text)
    rule_score, matches = rule_based_score(normalized, raw_text)
    meta_score = metadata_anomaly_score(metadata)
    combined = min(rule_score + meta_score, 100)

    if combined >= 70:
        decision, needs_ml = Decision.BLOCK, False
    elif combined >= 30:
        decision, needs_ml = Decision.HOLD, True   
    else:
        decision, needs_ml = Decision.CLEAR, False

    return DetectionResult(
        raw_text=raw_text, normalized_text=normalized,
        rule_score=rule_score, metadata_score=meta_score,
        rule_matches=matches, decision=decision, needs_ml_review=needs_ml
    )

if __name__ == "__main__":
    samples = [
        "Makasih kak semangat terus!",
        "S1L4HK4N WD DI sl0t..g4c0r88, ya kak",
        "j u d o l itu dosa, jangan main yaa"
    ]
    for s in samples:
        r = evaluate_message(s)
        kw = [m.keyword for m in r.rule_matches]
        print(f"Pesan: {s!r:40} -> Keputusan: {r.decision.value:6} | Match: {kw}")
