-- CreateEnum
CREATE TYPE "Role" AS ENUM ('learner', 'manager');

-- CreateEnum
CREATE TYPE "Technique" AS ENUM ('none', 'deformed_statistic', 'invented_quote', 'fake_urgency', 'dubious_source', 'spoofed_sender');

-- CreateEnum
CREATE TYPE "Verdict" AS ENUM ('reliable', 'suspicious');

-- CreateEnum
CREATE TYPE "ContentSource" AS ENUM ('llm', 'fallback');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('ready', 'rejected');

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teamId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "isReliable" BOOLEAN NOT NULL,
    "technique" "Technique" NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "highlights" JSONB NOT NULL DEFAULT '[]',
    "explanation" TEXT NOT NULL,
    "source" "ContentSource" NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'ready',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "verdict" "Verdict" NOT NULL,
    "technique" "Technique" NOT NULL,
    "explanation" TEXT NOT NULL,
    "highlights" JSONB NOT NULL DEFAULT '[]',
    "verdictCorrect" BOOLEAN NOT NULL,
    "techniqueCorrect" BOOLEAN NOT NULL,
    "explanationScore" INTEGER,
    "explanationFeedback" JSONB,
    "injectionFlag" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillRating" (
    "id" TEXT NOT NULL,
    "technique" "Technique" NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 1000,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SkillRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "XapiStatement" (
    "id" TEXT NOT NULL,
    "statement" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,

    CONSTRAINT "XapiStatement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SkillRating_userId_technique_key" ON "SkillRating"("userId", "technique");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillRating" ADD CONSTRAINT "SkillRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XapiStatement" ADD CONSTRAINT "XapiStatement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XapiStatement" ADD CONSTRAINT "XapiStatement_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
