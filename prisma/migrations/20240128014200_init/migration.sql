-- CreateTable
CREATE TABLE "MoonPhase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "time" TEXT NOT NULL,
    "phase" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "MoonPhase_time_idx" ON "MoonPhase"("time");
