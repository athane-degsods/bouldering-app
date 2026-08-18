-- Convert single imageKey to imageKeys text[].
ALTER TABLE "Ascent" ADD COLUMN "imageKeys" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "Ascent"
SET "imageKeys" = ARRAY["imageKey"]
WHERE "imageKey" IS NOT NULL AND "imageKey" <> '';

ALTER TABLE "Ascent" DROP COLUMN "imageKey";
