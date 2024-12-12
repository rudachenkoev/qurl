-- DropForeignKey
ALTER TABLE "BookmarkContacts" DROP CONSTRAINT "BookmarkContacts_bookmarkId_fkey";

-- DropForeignKey
ALTER TABLE "BookmarkContacts" DROP CONSTRAINT "BookmarkContacts_contactId_fkey";

-- AddForeignKey
ALTER TABLE "BookmarkContacts" ADD CONSTRAINT "BookmarkContacts_bookmarkId_fkey" FOREIGN KEY ("bookmarkId") REFERENCES "Bookmark"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookmarkContacts" ADD CONSTRAINT "BookmarkContacts_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
