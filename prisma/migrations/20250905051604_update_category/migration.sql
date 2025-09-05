-- CreateTable
CREATE TABLE "public"."ImageCategory" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "alt" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImageCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImageCategory_categoryId_idx" ON "public"."ImageCategory"("categoryId");

-- CreateIndex
CREATE INDEX "ImageCategory_isPrimary_idx" ON "public"."ImageCategory"("isPrimary");

-- AddForeignKey
ALTER TABLE "public"."ImageCategory" ADD CONSTRAINT "ImageCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
