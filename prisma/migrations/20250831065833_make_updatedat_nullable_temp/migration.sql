/*
  Warnings:

  - The values [HIDDEN] on the enum `ProductStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `barcode` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `ProductImage` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ProductStatus_new" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
ALTER TABLE "public"."Product" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Product" ALTER COLUMN "status" TYPE "public"."ProductStatus_new" USING ("status"::text::"public"."ProductStatus_new");
ALTER TYPE "public"."ProductStatus" RENAME TO "ProductStatus_old";
ALTER TYPE "public"."ProductStatus_new" RENAME TO "ProductStatus";
DROP TYPE "public"."ProductStatus_old";
ALTER TABLE "public"."Product" ALTER COLUMN "status" SET DEFAULT 'PUBLISHED';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Brand" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "barcode",
DROP COLUMN "tags";

-- AlterTable
ALTER TABLE "public"."ProductImage" DROP COLUMN "order",
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Brand_name_idx" ON "public"."Brand"("name");

-- CreateIndex
CREATE INDEX "Category_name_idx" ON "public"."Category"("name");

-- CreateIndex
CREATE INDEX "Product_status_publishedAt_idx" ON "public"."Product"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Product_brandId_idx" ON "public"."Product"("brandId");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "public"."Product"("categoryId");

-- CreateIndex
CREATE INDEX "ProductImage_productId_position_idx" ON "public"."ProductImage"("productId", "position");
