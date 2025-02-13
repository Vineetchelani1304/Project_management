/*
  Warnings:

  - You are about to drop the column `name` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `assigneeId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ownerId` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectName` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taskName` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_teamId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_userId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_assigneeId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_teamId_fkey";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "name",
DROP COLUMN "teamId",
DROP COLUMN "userId",
ADD COLUMN     "ownerId" INTEGER NOT NULL,
ADD COLUMN     "projectName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "assigneeId",
DROP COLUMN "name",
ADD COLUMN     "taskName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "teamId",
ALTER COLUMN "role" DROP NOT NULL;

-- DropTable
DROP TABLE "Team";

-- CreateTable
CREATE TABLE "_ProjectMembers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ProjectMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TaskAssignments" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TaskAssignments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProjectMembers_B_index" ON "_ProjectMembers"("B");

-- CreateIndex
CREATE INDEX "_TaskAssignments_B_index" ON "_TaskAssignments"("B");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectMembers" ADD CONSTRAINT "_ProjectMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectMembers" ADD CONSTRAINT "_ProjectMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskAssignments" ADD CONSTRAINT "_TaskAssignments_A_fkey" FOREIGN KEY ("A") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskAssignments" ADD CONSTRAINT "_TaskAssignments_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
