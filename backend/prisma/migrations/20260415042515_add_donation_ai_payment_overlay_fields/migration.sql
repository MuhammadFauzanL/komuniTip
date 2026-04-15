-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'BASIC');

-- AlterTable
ALTER TABLE "donations" ADD COLUMN     "ai_reason" TEXT,
ADD COLUMN     "ai_status" VARCHAR(20),
ADD COLUMN     "email_donatur" VARCHAR(200),
ADD COLUMN     "paid_at" TIMESTAMP(3),
ADD COLUMN     "payment_method" VARCHAR(50);

-- AlterTable
ALTER TABLE "overlay_settings" ADD COLUMN     "ai_filter_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "amount_color" VARCHAR(9) NOT NULL DEFAULT '#3BA2FF',
ADD COLUMN     "banned_words" TEXT,
ADD COLUMN     "durasi_alert" INTEGER NOT NULL DEFAULT 8,
ADD COLUMN     "font_family" VARCHAR(50) NOT NULL DEFAULT 'Inter',
ADD COLUMN     "message_color" VARCHAR(9) NOT NULL DEFAULT '#FF914D',
ADD COLUMN     "nama_color" VARCHAR(9) NOT NULL DEFAULT '#FFFFFF',
ADD COLUMN     "sound_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "template_color" VARCHAR(9) NOT NULL DEFAULT '#2BBBA0',
ADD COLUMN     "template_text" TEXT NOT NULL DEFAULT '{name} baru saja memberikan {amount}',
ADD COLUMN     "tts_enabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "instagram" VARCHAR(100),
ADD COLUMN     "kategori" VARCHAR(50),
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'BASIC',
ADD COLUMN     "twitter" VARCHAR(100),
ADD COLUMN     "youtube" VARCHAR(200);

-- CreateIndex
CREATE INDEX "donations_status_idx" ON "donations"("status");
