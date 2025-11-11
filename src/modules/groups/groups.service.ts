import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreateGroupDto, UpdateGroupDto } from "./dto";
import { GroupInvitationStatus, GroupRole, Role, User } from "@prisma/client";
import { baseUserSelect } from "src/common/prisma/selects";

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGroupDto, user: any) {
    const existingGroup = await this.prisma.group.findFirst({
      where: {
        members: {
          some: { id: user.id },
        },
      },
    });

    if (existingGroup) {
      throw new BadRequestException(
        "User is already a member of another group."
      );
    }

    const [group] = await this.prisma.$transaction(async (tx) => {
      const group = await tx.group.create({
        data: {
          ...dto,
          createdById: user.id,
        },
      });

      await tx.groupMember.create({
        data: {
          groupId: group.id,
          studentId: user.id,
          role: GroupRole.LEADER,
        },
      });

      await tx.groupChat.create({
        data: { groupId: group.id },
      });

      return [group];
    });

    return group;
  }

  async getMyGroup(user: User) {
    const group = await this.prisma.group.findFirst({
      where: {
        members: {
          some: { studentId: user.id },
        },
      },
      include: {
        members: { include: { student: { select: baseUserSelect } } },
        supervisor: { select: baseUserSelect },
      },
    });
    if (!group) {
      throw new NotFoundException("User is not a member of any group.");
    }
    return group;
  }

  async sendGroupInvitation(user: User, groupId: number, userId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });

    if (!group) {
      throw new NotFoundException("Group not found");
    }

    if (group.createdById !== user.id) {
      throw new ForbiddenException("Only the group leader can add members");
    }

    if (group.members.length >= group.maxMembers) {
      throw new BadRequestException(
        "Group already has maximum number of members"
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existingUser) {
      throw new NotFoundException("User not found");
    }

    if (existingUser.role !== Role.STUDENT) {
      throw new BadRequestException("Only students can be added to groups");
    }

    const isMember = await this.prisma.group.findFirst({
      where: {
        members: {
          some: { id: userId },
        },
      },
    });
    if (isMember) {
      throw new BadRequestException("User is already a member in a group");
    }

    const hasInvitation = await this.prisma.groupInvitation.findFirst({
      where: {
        groupId,
        status: GroupInvitationStatus.PENDING,
        receivedBy: userId,
        expiresAt: { gt: new Date() },
      },
    });

    if (hasInvitation) {
      throw new BadRequestException("User already has an invitation");
    }

    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Create a new GroupMember record
    const newInvitation = await this.prisma.$transaction(async (tx) => {
      const invitation = await this.prisma.groupInvitation.create({
        data: {
          groupId,
          receivedBy: userId,
          invitedBy: user.id,
          code,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }, // 7 days
      });

      await tx.notification.create({
        data: {
          userId: userId,
          message: `You have been invited to join the group "${group.name}". Use code: ${code}`,
        },
      });
      return invitation;
    });

    // Return updated group with members
    return newInvitation;
  }

  async joinGroupByCode(user: User, code: string) {
    const invite = await this.prisma.groupInvitation.findUnique({
      where: { code },
    });
    if (!invite) throw new Error("Invalid code");
    if (invite.expiresAt && invite.expiresAt < new Date())
      throw new Error("Code expired");
    if (invite.usedAt) throw new Error("Code already used");

    if (invite.receivedBy !== user.id)
      throw new ForbiddenException("This invitation is not for you");

    // Add to group members
    await this.prisma.$transaction(async (tx) => {
      await tx.groupMember.create({
        data: { groupId: invite.groupId, studentId: user.id },
      });

      await tx.groupInvitation.update({
        where: { id: invite.id },
        data: { status: GroupInvitationStatus.ACCEPTED, usedAt: new Date() },
      });

      await tx.notification.create({
        data: {
          userId: invite.invitedBy,
          message: `${user.name} has accepted your invitation to join the group.`,
        },
      });
    });

    return this.prisma.group.findUnique({ where: { id: invite.groupId } });
  }

  async removeMember(groupId: number, userId: number, user: User) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });
    if (!group) {
      throw new NotFoundException("Group not found");
    }
    if (group.createdById !== user.id) {
      throw new ForbiddenException("Only the group leader can remove members");
    }
    const isMember = group.members.some(
      (member) => member.studentId === userId
    );

    if (!isMember) {
      throw new BadRequestException("User is not a member of the group");
    }
    return this.prisma.group.update({
      where: { id: groupId },
      data: {
        members: {
          deleteMany: { studentId: userId },
        },
      },
      include: { members: true },
    });
  }

  async update(user: User, groupId: number, dto: UpdateGroupDto) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException("Group not found");
    }

    if (group.createdById !== user.id) {
      throw new ForbiddenException(
        "Only the group leader can update the group"
      );
    }

    return this.prisma.group.update({
      where: { id: groupId },
      data: dto,
      include: { members: true },
    });
  }

  async remove(user: User, groupId: number) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException("Group not found");
    }

    if (group.createdById !== user.id) {
      throw new ForbiddenException(
        "Only the group leader can delete the group"
      );
    }

    await this.prisma.group.delete({ where: { id: groupId } });
    return { message: "Group deleted successfully" };
  }
}
