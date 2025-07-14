-- AlterTable
ALTER TABLE "Dish" ADD COLUMN     "featuredOrder" INTEGER,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;
