/*
  Warnings:

  - You are about to drop the column `description` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Category` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Brand_name_idx";

-- DropIndex
DROP INDEX "public"."Category_name_idx";

-- AlterTable
ALTER TABLE "public"."Brand" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "public"."Category" DROP COLUMN "description";
