-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('STUDENT', 'ADMIN', 'SUPERVISOR');

-- CreateEnum
CREATE TYPE "public"."GroupStatus" AS ENUM ('OPEN', 'CLOSED', 'PENDING');

-- CreateEnum
CREATE TYPE "public"."GroupRole" AS ENUM ('LEADER', 'MEMBER');

-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."MilestoneStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'REVIEWED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."GroupInvitationStatus" AS ENUM ('PENDING', 'REJECTED', 'ACCEPTED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerifiedAt" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'STUDENT',
    "phone" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdById" INTEGER NOT NULL,
    "supervisorId" INTEGER,
    "maxMembers" INTEGER NOT NULL DEFAULT 4,
    "status" "public"."GroupStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."group_member" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "role" "public"."GroupRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."supervisor_requests" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "supervisorId" INTEGER NOT NULL,
    "status" "public"."RequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "requestedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supervisor_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."projects" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "technologies" JSONB,
    "status" "public"."ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."milestones" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "deadline" TIMESTAMP(3),
    "status" "public"."MilestoneStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."submissions" (
    "id" SERIAL NOT NULL,
    "milestoneId" INTEGER NOT NULL,
    "submittedBy" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "feedback" TEXT[],
    "status" "public"."SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "grade" INTEGER,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT,
    "message" TEXT NOT NULL,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."group_chat" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."group_chat_message" (
    "id" SERIAL NOT NULL,
    "chatId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_chat_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."group_invitations" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "invitedBy" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "status" "public"."GroupInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "receivedBy" INTEGER,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "group_member_groupId_studentId_key" ON "public"."group_member"("groupId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "supervisor_requests_groupId_supervisorId_key" ON "public"."supervisor_requests"("groupId", "supervisorId");

-- CreateIndex
CREATE UNIQUE INDEX "projects_groupId_key" ON "public"."projects"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "group_chat_groupId_key" ON "public"."group_chat"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "group_invitations_code_key" ON "public"."group_invitations"("code");

-- AddForeignKey
ALTER TABLE "public"."groups" ADD CONSTRAINT "groups_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."groups" ADD CONSTRAINT "groups_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_member" ADD CONSTRAINT "group_member_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_member" ADD CONSTRAINT "group_member_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supervisor_requests" ADD CONSTRAINT "supervisor_requests_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supervisor_requests" ADD CONSTRAINT "supervisor_requests_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supervisor_requests" ADD CONSTRAINT "supervisor_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."milestones" ADD CONSTRAINT "milestones_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submissions" ADD CONSTRAINT "submissions_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "public"."milestones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submissions" ADD CONSTRAINT "submissions_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_chat" ADD CONSTRAINT "group_chat_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_chat_message" ADD CONSTRAINT "group_chat_message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."group_chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_chat_message" ADD CONSTRAINT "group_chat_message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_invitations" ADD CONSTRAINT "group_invitations_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_invitations" ADD CONSTRAINT "group_invitations_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_invitations" ADD CONSTRAINT "group_invitations_receivedBy_fkey" FOREIGN KEY ("receivedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
