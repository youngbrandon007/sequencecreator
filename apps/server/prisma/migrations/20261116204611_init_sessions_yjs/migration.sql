-- CreateTable
CREATE TABLE "Session" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "YUpdate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "data" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "YUpdate_code_fkey" FOREIGN KEY ("code") REFERENCES "Session" ("code") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "YSnapshot" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "data" BLOB NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "YSnapshot_code_fkey" FOREIGN KEY ("code") REFERENCES "Session" ("code") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "YUpdate_code_idx" ON "YUpdate"("code");
