/*
  Warnings:

  - The `volume` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "volumeUnit" TEXT,
DROP COLUMN "volume",
ADD COLUMN     "volume" INTEGER;
