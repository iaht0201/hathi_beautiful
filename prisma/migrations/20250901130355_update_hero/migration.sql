/*
  Warnings:

  - You are about to drop the column `desktopUrl` on the `HeroSlide` table. All the data in the column will be lost.
  - You are about to drop the column `mobileUrl` on the `HeroSlide` table. All the data in the column will be lost.
  - Added the required column `imageSlideId` to the `HeroSlide` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."HeroSlide" DROP COLUMN "desktopUrl",
DROP COLUMN "mobileUrl",
ADD COLUMN     "captionId" TEXT,
ADD COLUMN     "imageSlideId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."ImageSlide" (
    "id" TEXT NOT NULL,
    "mobileUrl" TEXT NOT NULL,
    "desktopUrl" TEXT NOT NULL,

    CONSTRAINT "ImageSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CaptionHeroSlide" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "ctaHref" TEXT,
    "ctaLabel" TEXT,

    CONSTRAINT "CaptionHeroSlide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeroSlide_active_startAt_endAt_idx" ON "public"."HeroSlide"("active", "startAt", "endAt");

-- CreateIndex
CREATE INDEX "HeroSlide_position_idx" ON "public"."HeroSlide"("position");

-- AddForeignKey
ALTER TABLE "public"."HeroSlide" ADD CONSTRAINT "HeroSlide_imageSlideId_fkey" FOREIGN KEY ("imageSlideId") REFERENCES "public"."ImageSlide"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HeroSlide" ADD CONSTRAINT "HeroSlide_captionId_fkey" FOREIGN KEY ("captionId") REFERENCES "public"."CaptionHeroSlide"("id") ON DELETE SET NULL ON UPDATE CASCADE;
