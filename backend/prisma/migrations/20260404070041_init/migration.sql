/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "username_slug" VARCHAR(50) NOT NULL,
    "password_hash" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'google',
    "google_id" TEXT,
    "saldo_aktif" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "reset_token" VARCHAR(255),
    "reset_token_expires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "streamerId" TEXT NOT NULL,
    "nama_donatur" VARCHAR(100) NOT NULL DEFAULT 'Anonim',
    "pesan" TEXT,
    "jumlah" DECIMAL(15,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "payment_gateway_ref" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "overlay_settings" (
    "id" TEXT NOT NULL,
    "streamerId" TEXT NOT NULL,
    "min_donasi_alert" DECIMAL(15,2) NOT NULL DEFAULT 10000.00,

    CONSTRAINT "overlay_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_slug_key" ON "users"("username_slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_reset_token_key" ON "users"("reset_token");

-- CreateIndex
CREATE UNIQUE INDEX "donations_payment_gateway_ref_key" ON "donations"("payment_gateway_ref");

-- CreateIndex
CREATE INDEX "donations_streamerId_idx" ON "donations"("streamerId");

-- CreateIndex
CREATE UNIQUE INDEX "overlay_settings_streamerId_key" ON "overlay_settings"("streamerId");

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_streamerId_fkey" FOREIGN KEY ("streamerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overlay_settings" ADD CONSTRAINT "overlay_settings_streamerId_fkey" FOREIGN KEY ("streamerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
