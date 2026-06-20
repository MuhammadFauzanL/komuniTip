import requests
import json
import os

url = "http://127.0.0.1:8000/v1/evaluate"
api_key = os.getenv("API_KEY", "rahasia-komunitip-123")
headers = {"X-API-Key": api_key}

print("TEST 1: Gacor88 dengan leetspeak")
res1 = requests.post(url, json={
    "donation_id": "d_002",
    "raw_text": "ayo main di g.4.c.0.r88 bos",
    "donor_messages_last_10min": 6,
    "amount": 10000
}, headers=headers).json()
print(json.dumps(res1, indent=2))

print("\nTEST 2: Emoji Kombinasi")
res2 = requests.post(url, json={
    "donation_id": "d_003",
    "raw_text": "semoga hoki \U0001f3b0\U0001f4b8",
    "amount": 10000,
    "is_round_amount": True
}, headers=headers).json()
print(json.dumps(res2, indent=2))
