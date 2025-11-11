export enum Role {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  SUPERVISOR = 'SUPERVISOR'
}

export enum GroupRole {
  LEADER = 'LEADER',
  MEMBER = 'MEMBER'
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  profilePicture?: string;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  maxMembers: number;
  createdById: number;
  supervisorId?: number;
  createdAt: Date;
  updatedAt: Date;
  members: GroupMember[];
  supervisor?: User;
  createdBy: User;
}

export interface GroupMember {
  id: number;
  groupId: number;
  studentId: number;
  role: GroupRole;
  student: User;
  group: Group;
}

export interface GroupChat {
  id: number;
  groupId: number;
  group: Group;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: number;
  content: string;
  senderId: number;
  chatId: number;
  createdAt: Date;
  updatedAt: Date;
  sender: User;
  chat: GroupChat;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  groupId: number;
  status: string;
  milestones:Milestone[];
  createdAt: Date;
  updatedAt: Date;
  group: Group;
}

export interface Milestone {
  id: number;
  title: string;
  description: string;
  dueDate: Date;
  projectId: number;
  createdAt: Date;
  updatedAt: Date;
  project: Project;
  submissions: Submission;
}

export interface Submission {
  id: number;
  content: string;
  fileUrl?: string;
  status: SubmissionStatus;
  feedback?: string;
  milestoneId: number;
  groupId: number;
  createdAt: Date;
  updatedAt: Date;
  milestone: Milestone;
  group: Group;
}