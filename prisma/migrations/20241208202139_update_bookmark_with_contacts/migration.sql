/*
  Warnings:

  - Made the column `externalId` on table `Contact` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Contact_externalId_key";

-- AlterTable
ALTER TABLE "Contact" ALTER COLUMN "externalId" SET NOT NULL;

-- CreateTable
CREATE TABLE "BookmarkContact" (
    "id" SERIAL NOT NULL,
    "bookmarkId" INTEGER NOT NULL,
    "contactId" TEXT NOT NULL,

    CONSTRAINT "BookmarkContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BookmarkContacts" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BookmarkContacts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookmarkContact_bookmarkId_contactId_key" ON "BookmarkContact"("bookmarkId", "contactId");

-- CreateIndex
CREATE INDEX "_BookmarkContacts_B_index" ON "_BookmarkContacts"("B");

-- AddForeignKey
ALTER TABLE "BookmarkContact" ADD CONSTRAINT "BookmarkContact_bookmarkId_fkey" FOREIGN KEY ("bookmarkId") REFERENCES "Bookmark"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookmarkContact" ADD CONSTRAINT "BookmarkContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookmarkContacts" ADD CONSTRAINT "_BookmarkContacts_A_fkey" FOREIGN KEY ("A") REFERENCES "Bookmark"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookmarkContacts" ADD CONSTRAINT "_BookmarkContacts_B_fkey" FOREIGN KEY ("B") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
