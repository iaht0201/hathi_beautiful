/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Category` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN');

-- AlterTable
ALTER TABLE "public"."Brand" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "public"."Category" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "compareAtPrice" INTEGER,
ADD COLUMN     "ingredients" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "origin" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(6),
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "status" "public"."ProductStatus" NOT NULL DEFAULT 'PUBLISHED',
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "usage" TEXT,
ADD COLUMN     "volume" TEXT,
ALTER COLUMN "price" DROP DEFAULT;

-- CreateTable
CREATE TABLE "public"."ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Brand_name_idx" ON "public"."Brand"("name");

-- CreateIndex
CREATE INDEX "Category_name_idx" ON "public"."Category"("name");

-- AddForeignKey
ALTER TABLE "public"."ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
