ALTER TABLE "donations"
ADD COLUMN "ai_risk_score" INTEGER,
ADD COLUMN "ai_confidence" DOUBLE PRECISION,
ADD COLUMN "ai_execution_path" VARCHAR(50),
ADD COLUMN "ai_matched_keywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "donations"
SET "ai_status" = CASE
  WHEN "ai_status" = 'SAFE' THEN 'CLEAR'
  WHEN "ai_status" = 'BLOCKED' THEN 'BLOCK'
  ELSE "ai_status"
END;
