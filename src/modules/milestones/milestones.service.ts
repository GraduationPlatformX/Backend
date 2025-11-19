import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreateMilestoneDto, UpdateMilestoneDto } from "./dto";
import { Role, User } from "@prisma/client";

@Injectable()
export class MilestonesService {
  constructor(private prisma: PrismaService) {}

  async create(
    projectId: number,
    createMilestoneDto: CreateMilestoneDto,
    user: User
  ) {

    // Check if project exists and user has access
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { group: true },
    });

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    if (
      user.role === Role.SUPERVISOR &&
      project.group.supervisorId !== user.id
    ) {
      throw new ForbiddenException("Access denied");
    }

    const milestones = await this.prisma.milestone.findMany({
      where: { projectId },
      orderBy: { order: "desc" },
    });

    if (milestones) {
      if (
        new Date(milestones[0]?.deadline ?? project.createdAt) >=
        new Date(createMilestoneDto.deadline)
      ) {
        throw new ForbiddenException(
          "New milestone deadline must be after the last milestone deadline"
        );
      }
    }

    const order = milestones.length;

    return this.prisma.milestone.create({
      data: {
        ...createMilestoneDto,
        projectId,
        order,
      },
      include: {
        project: true,
      },
    });
  }

  async findAll(projectId: number, user) {
    // Check if project exists and user has access
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { group: { include: { members: true, supervisor: true } } },
    });

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    // Check permissions
    this.checkProjectAccess(project, user.role, user.id);

    return this.prisma.milestone.findMany({
      where: { projectId },
      include: {
        submissions: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        deadline: "asc",
      },
    });
  }

  async findOne(id: number, user: User) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            group: {
              include: {
                members: {
                  include: { student: { select: { id: true, name: true } } },
                },
                supervisor: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!milestone) {
      throw new NotFoundException("Milestone not found");
    }

    // Check permissions
    this.checkProjectAccess(milestone.project, user.role, user.id);

    return milestone;
  }

  async update(
    id: number,
    projectId: number,
    updateMilestoneDto: UpdateMilestoneDto,
    user: User
  ) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            group: {
              include: {
                members: {
                  include: { student: { select: { id: true, name: true } } },
                },
                supervisor: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!milestone) {
      throw new NotFoundException("Milestone not found");
    }

    // Check permissions
    this.checkProjectAccess(milestone.project, user.role, user.id);

    if (updateMilestoneDto.deadline) {
      const milestones = await this.prisma.milestone.findMany({
        where: { projectId },
        orderBy: { order: "asc" },
      });

      this.validateMilestoneDeadline(
        milestones,
        id,
        new Date(updateMilestoneDto.deadline)
      );
    }

    return this.prisma.milestone.update({
      where: { id },
      data: updateMilestoneDto,
    });
  }

  async remove(id: number, projectId: number, user: User) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            group: {
              include: {
                members: {
                  include: { student: { select: { id: true, name: true } } },
                },
                supervisor: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!milestone) {
      throw new NotFoundException("Milestone not found");
    }

    // Check permissions
    this.checkProjectAccess(milestone.project, user.role, user.id);

    return this.prisma.milestone.delete({
      where: { id },
    });
  }

  private checkProjectAccess(project: any, userRole: Role, userId: number) {
    switch (userRole) {
      case Role.ADMIN:
        // Admin can access all projects
        break;
      case Role.SUPERVISOR:
        // Supervisor can access only assigned projects
        if (project?.group.supervisor?.id !== userId) {
          throw new ForbiddenException("Access denied");
        }
        break;
      case Role.STUDENT:
        const isMember = project?.group.members.some(
          (member) => member.studentId === userId
        );
        if (!isMember) {
          throw new ForbiddenException("Access denied");
        }
        break;
    }
  }

  private validateMilestoneDeadline(
    milestones: { id: number; deadline: Date | null }[],
    milestoneId: number,
    newDeadline: Date
  ) {
    const index = milestones.findIndex((m) => m.id === milestoneId);
    if (index === -1) {
      throw new NotFoundException("Milestone not found in project");
    }

    const prev = milestones[index - 1];
    const next = milestones[index + 1];

    if (prev && newDeadline <= new Date(prev.deadline ?? "")) {
      throw new ForbiddenException(
        "Deadline must be after the previous milestone’s deadline"
      );
    }

    if (next && newDeadline >= new Date(next.deadline ?? "")) {
      throw new ForbiddenException(
        "Deadline must be before the next milestone’s deadline"
      );
    }
  }
}
