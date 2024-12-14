-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "icon" TEXT;

-- Updating the category isDefault
UPDATE "Category"
SET "icon" = CASE
                 WHEN "name" = 'Cafes and restaurants' THEN 'i-heroicons-cake'
                 WHEN "name" = 'Gifts' THEN 'i-heroicons-gift'
                 WHEN "name" = 'Entertainment' THEN 'i-heroicons-puzzle-piece'
                 WHEN "name" = 'Travel' THEN 'i-heroicons-globe-europe-africa'
                 WHEN "name" = 'Documents and Organizations' THEN 'i-heroicons-document-text'
                 WHEN "name" = 'Technology and equipment' THEN 'i-heroicons-wrench-screwdriver'
                 WHEN "name" = 'Home Goods' THEN 'i-heroicons-shopping-bag'
                 WHEN "name" = 'Series and movies' THEN 'i-heroicons-film'
                 WHEN "name" = 'Streaming platforms and videos' THEN 'i-heroicons-video-camera'
                 WHEN "name" = 'Beauty and Health' THEN 'i-heroicons-sparkles'
                 WHEN "name" = 'Other' THEN 'i-heroics-question-mark-circle'
                 ELSE NULL
    END
WHERE "isDefault" = true;

-- Set the value for all other records
UPDATE "Category"
SET "icon" = 'i-heroics-question-mark-circle'
WHERE "icon" IS NULL;
