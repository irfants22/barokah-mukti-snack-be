/*
  Warnings:

  - Added the required column `packaging` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Packaging" AS ENUM ('TOPLES', 'BAL');

-- CreateEnum
CREATE TYPE "Weight" AS ENUM ('GRAM_250', 'GRAM_500', 'KG_1', 'KG_2');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "address" TEXT,
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "packaging" "Packaging" NOT NULL,
ADD COLUMN     "weight" "Weight" NOT NULL;
