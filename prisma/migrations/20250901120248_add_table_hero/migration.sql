-- CreateTable
CREATE TABLE "public"."HeroSlide" (
    "id" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "mobileUrl" TEXT NOT NULL,
    "desktopUrl" TEXT NOT NULL,
    "position" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);
