-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "noteAccuracy" DOUBLE PRECISION NOT NULL,
    "timingAccuracy" DOUBLE PRECISION NOT NULL,
    "rhythmScore" DOUBLE PRECISION NOT NULL,
    "overall" DOUBLE PRECISION NOT NULL,
    "grade" "Grade" NOT NULL,
    "hits" INTEGER NOT NULL,
    "misses" INTEGER NOT NULL,
    "totalNotes" INTEGER NOT NULL,
    "bpmPlayed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Score_userId_idx" ON "Score"("userId");

-- CreateIndex
CREATE INDEX "Score_lessonId_idx" ON "Score"("lessonId");

-- CreateIndex
CREATE INDEX "Score_userId_lessonId_idx" ON "Score"("userId", "lessonId");

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
