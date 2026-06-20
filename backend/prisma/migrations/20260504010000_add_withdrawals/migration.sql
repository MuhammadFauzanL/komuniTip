ALTER TABLE "users"
ADD COLUMN "saldo_tertahan" DECIMAL(15, 2) NOT NULL DEFAULT 0.00;

CREATE TYPE "WithdrawalStatus" AS ENUM (
  'PENDING',
  'PROCESSING',
  'SUCCESS',
  'FAILED',
  'CANCELLED'
);

CREATE TABLE "withdrawals" (
  "id" TEXT NOT NULL,
  "streamerId" TEXT NOT NULL,
  "amount" DECIMAL(15, 2) NOT NULL,
  "bank_name" VARCHAR(100) NOT NULL,
  "account_name" VARCHAR(150) NOT NULL,
  "account_number" VARCHAR(50) NOT NULL,
  "notes" TEXT,
  "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
  "processed_at" TIMESTAMP(3),
  "cancelled_at" TIMESTAMP(3),
  "failure_reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "withdrawals_streamerId_status_idx"
ON "withdrawals"("streamerId", "status");

ALTER TABLE "withdrawals"
ADD CONSTRAINT "withdrawals_streamerId_fkey"
FOREIGN KEY ("streamerId") REFERENCES "users"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
