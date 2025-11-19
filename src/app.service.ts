import { Injectable } from "@nestjs/common";
import { RequestStatus, Role, User } from "@prisma/client";
import { PrismaService } from "./modules/database/prisma.service";
import { baseUserSelect } from "./common/prisma/selects";

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  /**
   * Admin dashboard data
   */
  async getAdminData(user: User) {
    const [
      students,
      supervisors,
      supervisorRequests,
      projects,
      notificationCounts,
    ] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: Role.STUDENT },
        select: baseUserSelect,
      }),
      this.prisma.user.findMany({
        where: { role: Role.SUPERVISOR },
        select: baseUserSelect,
      }),
      this.prisma.supervisorRequest.findMany({
        include: {
          supervisor: { select: baseUserSelect },
          group: {
            include: {
              members: { include: { student: { select: baseUserSelect } } },
            },
          },
        },
      }),
      this.prisma.group.findMany({
        include: {
          project: { include: { milestones: true } },
          members: { include: { student: { select: baseUserSelect } } },
          supervisor: { select: baseUserSelect },
        },
      }),
      this.prisma.notification.count({
        where: { userId: user.id, seen: false },
      }),
    ]);

    return {
      students,
      supervisors,
      supervisorRequests,
      projects,
      notificationCounts,
    };
  }

  /**
   * Supervisor dashboard data
   */
  async getSupervisorData(user: User) {
    const [supervisedGroups, supervisorRequests] = await Promise.all([
      this.prisma.group.findMany({
        where: { supervisorId: user.id },
        include: {
          project: {
            include: { milestones: { include: { submissions: true } } },
          },
          members: { include: { student: { select: baseUserSelect } } },
        },
      }),

      this.prisma.supervisorRequest.findMany({
        where: { supervisorId: user.id, status: RequestStatus.PENDING },
        include: {
          group: true,
        },
      }),
    ]);

    return {
      supervisedGroups,
      supervisorRequests,
    };
  }

  /**
   * Student dashboard data
   */
  async getStudentData(user: User) {
    const group = await this.prisma.group.findFirst({
      where: {
        members: { some: { studentId: user.id } },
      },
      include: {
        project: {
          include: { milestones: { include: { submissions: true } } },
        },
        members: { include: { student: { select: baseUserSelect } } },
        supervisor: { select: baseUserSelect },
        chat: true,
      },
    });

    return group;
  }
}
