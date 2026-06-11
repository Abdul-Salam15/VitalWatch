-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "caregiverName" TEXT NOT NULL DEFAULT '',
    "caregiverEmail" TEXT NOT NULL DEFAULT '',
    "accessToken" TEXT NOT NULL,
    "notifBrowser" BOOLEAN NOT NULL DEFAULT true,
    "notifEmailSummary" BOOLEAN NOT NULL DEFAULT true,
    "notifCaregiverAnomaly" BOOLEAN NOT NULL DEFAULT true,
    "notifMedReminderEmail" BOOLEAN NOT NULL DEFAULT true,
    "notifCaregiverMissedDose" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VitalLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hr" INTEGER NOT NULL,
    "spo2" INTEGER NOT NULL,
    "temp" DOUBLE PRECISION NOT NULL,
    "steps" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "anomalyFlag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VitalLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "customDays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "escalation" INTEGER NOT NULL DEFAULT 30,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoseRecord" (
    "id" TEXT NOT NULL,
    "reminderId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "takenAt" TIMESTAMP(3),
    "reminderEmailSentAt" TIMESTAMP(3),
    "escalationEmailSentAt" TIMESTAMP(3),

    CONSTRAINT "DoseRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_accessToken_key" ON "User"("accessToken");

-- CreateIndex
CREATE INDEX "VitalLog_userId_ts_idx" ON "VitalLog"("userId", "ts");

-- CreateIndex
CREATE INDEX "Reminder_userId_idx" ON "Reminder"("userId");

-- CreateIndex
CREATE INDEX "DoseRecord_reminderId_date_idx" ON "DoseRecord"("reminderId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DoseRecord_reminderId_date_key" ON "DoseRecord"("reminderId", "date");

-- AddForeignKey
ALTER TABLE "VitalLog" ADD CONSTRAINT "VitalLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoseRecord" ADD CONSTRAINT "DoseRecord_reminderId_fkey" FOREIGN KEY ("reminderId") REFERENCES "Reminder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
