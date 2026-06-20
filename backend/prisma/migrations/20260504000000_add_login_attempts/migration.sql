CREATE TABLE "login_attempts" (
  "id" UUID NOT NULL,
  "identifier" VARCHAR(255) NOT NULL,
  "client_ip" VARCHAR(64) NOT NULL,
  "failed_attempts" INTEGER NOT NULL DEFAULT 0,
  "locked_until" TIMESTAMP(3),
  "last_attempt_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "login_attempts_identifier_client_ip_key"
ON "login_attempts"("identifier", "client_ip");

CREATE INDEX "login_attempts_locked_until_idx"
ON "login_attempts"("locked_until");
