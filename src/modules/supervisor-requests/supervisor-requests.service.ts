import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { RequestStatus, Role, User } from "@prisma/client";
import { CreateSupervisorRequestDto } from "./dto";

@Injectable()
export class SupervisorRequestsService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: User) {
    return this.prisma.supervisorRequest.findMany({
      where: { supervisorId: user.id, status: RequestStatus.PENDING },
      include: {
        group: true,
      },
    });
  }

  async requestSupervisor(dto: CreateSupervisorRequestDto, user: User) {
    const existingRequest = await this.prisma.supervisorRequest.findFirst({
      where: {
        groupId: dto.groupId,
        supervisorId: dto.supervisorId,
      },
    });

    const group = await this.prisma.group.findUnique({
      where: { id: dto.groupId },
    });
    if (!group) {
      throw new NotFoundException("Group not found");
    }
    if (group.createdById !== user.id) {
      throw new ForbiddenException(
        "Only the group leader can request a supervisor"
      );
    }

    if (existingRequest) {
      throw new BadRequestException("You have already requested a supervisor");
    }

    const existingSupervisor = this.prisma.user.findUnique({
      where: { id: dto.supervisorId, role: Role.SUPERVISOR },
    });

    if (!existingSupervisor) {
      throw new NotFoundException("Supervisor not found");
    }
    const newRequest = await this.prisma.$transaction(async (tx) => {
      const r = await tx.supervisorRequest.create({
        data: {
          groupId: dto.groupId,
          supervisorId: dto.supervisorId,
          requestedById: user.id,
          message: dto.message,
        },
      });

      await tx.notification.create({
        data: {
          userId: dto.supervisorId,
          message: `You have got a new request from this group "${group.name}".`,
        },
      });

      return r;
    });
    return newRequest;
  }

  async acceptRequest(requestId: number, user: User) {
    const request = await this.prisma.supervisorRequest.findUnique({
      where: { id: requestId },
      include: { supervisor: true, group: true },
    });
    if (!request) {
      throw new NotFoundException("request not found for this group");
    }

    if (request.supervisorId !== user.id) {
      throw new ForbiddenException(
        "Only the requested supervisor can handle this request"
      );
    }

    if (request.status === RequestStatus.ACCEPTED) {
      throw new BadRequestException("Request has already been handled");
    }

    const result = await this.prisma.supervisorRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.ACCEPTED,
        updatedAt: new Date(),
      },
    });

    return await this.prisma.group.update({
      where: { id: request.groupId },
      data: {
        supervisorId: user.id,
      },
      include: { members: true, supervisor: true },
    });
  }

  async rejectRequest(requestId: number, user: User) {
    const request = await this.prisma.supervisorRequest.findUnique({
      where: { id: requestId },
      include: { supervisor: true, group: true },
    });
    if (!request) {
      throw new NotFoundException("request not found for this group");
    }

    if (request.supervisorId !== user.id) {
      throw new ForbiddenException(
        "Only the requested supervisor can handle this request"
      );
    }

    return this.prisma.supervisorRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.REJECTED,
        updatedAt: new Date(),
      },
    });
  }
}
