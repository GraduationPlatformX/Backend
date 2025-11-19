import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreateProjectDto, UpdateProjectDto } from "./dto";
import {
  Group,
  GroupMember,
  GroupRole,
  Project,
  Role,
  User,
} from "@prisma/client";
import { baseUserSelect } from "src/common/prisma/selects";

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, user: User) {
    const existingProject = await this.prisma.project.findFirst({
      where: { groupId: createProjectDto.groupId },
    });

    if (existingProject) {
      throw new BadRequestException("A project for this group already exists");
    }

    const groupMember = await this.prisma.groupMember.findUnique({
      where: {
        groupId_studentId: {
          groupId: createProjectDto.groupId,
          studentId: user.id,
        },
      },
    });

    if (groupMember?.role !== GroupRole.LEADER) {
      throw new ForbiddenException("Only group leader can create projects");
    }

    return this.prisma.project.create({
      data: {
        ...createProjectDto,
      },
    });
  }

  async getMyProject(user: User) {
    const groupMember = await this.prisma.groupMember.findFirst({
      where: { studentId: user.id },
    });
    if (!groupMember) {
      throw new NotFoundException("User is not a member of any group");
    }
    const project = await this.prisma.project.findFirst({
      where: { groupId: groupMember.groupId },
      include: {
        group: {
          include: {
            members: {include: {student: {select: baseUserSelect}}},
            supervisor: { select: baseUserSelect },
          },
        },
      },
    });
    if (!project) {
      throw new NotFoundException("Project not found for your group");
    }
    return project;
  }

  async getAllProject(user: User) {
    let whereClause = {};

    switch (user.role) {
      case Role.ADMIN:
        // Admin can see all projects
        break;
      case Role.SUPERVISOR:
        // Supervisor can see only assigned projects
        whereClause = {
          group: {
            supervisorId: user.id,
          },
        };
        break;
    }

    return this.prisma.project.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        group: {
          include: {
            members: {include: {student: {select: baseUserSelect}}},
            supervisor: { select: baseUserSelect },
          },
        },
      }
    });
  }

  async getProject(id: number, user: User) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        group: {
          include: {
            members: {include:{student:true}},
            supervisor: { select: baseUserSelect },
          },
        },
        milestones:{include:{submissions:true}}
      },
    });

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    // Check permissions
    this.checkProjectAccess(project, user.role, user.id);

    return project;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto, user: User) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { group: { include: { members: true, supervisor: true } } },
    });

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    if (user.role === Role.SUPERVISOR) {
      throw new ForbiddenException("Supervisors cannot update projects");
    }

    if (user.role === Role.STUDENT) {
      const isLeader = project.group.members.some(
        (member) =>
          member.role === GroupRole.LEADER && member.studentId === user.id
      );
      if (!isLeader) {
        throw new ForbiddenException(
          "Only the group leader can update the project"
        );
      }
    }

    // Check permissions
    this.checkProjectAccess(project, user.role, user.id);

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        group: {
          include: { members: true, supervisor: true },
        },
      },
    });
  }

  async remove(id: number, user: User) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { group: { include: { members: true, supervisor: true } } },
    });

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    if (user.role === Role.STUDENT) {
      const isLeader = project?.group.members.some(
        (member) =>
          member.role === GroupRole.LEADER && member.studentId === user.id
      );
      if (!isLeader) {
        throw new ForbiddenException(
          "Only the group leader can delete the project"
        );
      }
    }

    const deletedProject = await this.prisma.project.delete({
      where: { id },
    });

    return {
      message: "Project deleted successfully",
      project: deletedProject,
    };
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
}
