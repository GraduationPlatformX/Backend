import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { StorageService } from "../storage/storage.service";
import { MilestoneStatus, Role, User } from "@prisma/client";
import { UpdateSubmissionDto } from "./dto";

@Injectable()
export class SubmissionsService {
  constructor(
    private prisma: PrismaService,
    private readonly service: StorageService
  ) {}

  async create(
    milestoneId: number,
    uploads: { files?: Express.Multer.File[] },
    user: User
  ) {
    const { uploadedFiles } = await this.handleUploads(uploads);

    // Check if milestone exists
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        project: {
          include: {
            group: { include: { members: true } },
          },
        },
      },
    });

    if (!milestone) {
      throw new NotFoundException("Milestone not found");
    }

    // Check if student is a group member
    const isMember = milestone.project.group.members.some(
      (m) => m.studentId === user.id
    );

    if (!isMember) {
      throw new ForbiddenException("Access denied");
    }
    const files = uploadedFiles ?? [];

    if (files.length === 0) {
      throw new BadRequestException("No files uploaded");
    }

    // Create one submission per file URL
    const submissions = await this.prisma.$transaction(
      files.map((file) =>
        this.prisma.submission.create({
          data: {
            milestoneId,
            fileUrl: file.url,
            submittedBy: user.id,
          },
          include: {
            milestone: true,
          },
        })
      )
    );

    // Update milestone status to SUBMITTED
    const updatedMilestone = await this.prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: MilestoneStatus.SUBMITTED },
    });

    return submissions;
  }

  async findAll(milestoneId: number, user: User) {
    // Check if milestone exists
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        project: {
          include: {
            group: { include: { members: true, supervisor: true } },
          },
        },
      },
    });

    if (!milestone) {
      throw new NotFoundException("Milestone not found");
    }

    // Check permissions
    this.checkMilestoneAccess(milestone.project, user.role, user.id);

    return this.prisma.submission.findMany({
      where: { milestoneId },
      include: {
        milestone: {
          select: {
            id: true,
            title: true,
            deadline: true,
          },
        },
      },
    });
  }

  // async findOne(id: number, userRole: UserRole, userId: number) {
  //   const submission = await this.prisma.submission.findUnique({
  //     where: { id },
  //     include: {
  //       milestone: {
  //         include: {
  //           project: true,
  //         },
  //       },
  //       student: {
  //         select: {
  //           id: true,
  //           firstName: true,
  //           lastName: true,
  //           email: true,
  //         },
  //       },
  //     },
  //   });

  //   if (!submission) {
  //     throw new NotFoundException("Submission not found");
  //   }

  //   // Check permissions
  //   this.checkMilestoneAccess(submission.milestone.project, userRole, userId);

  //   return submission;
  // }

  async update(
    id: number,
    updateSubmissionDto: UpdateSubmissionDto,
    user: User
  ) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        milestone: {
          include: {
            project: {
              include: {
                group: { include: { members: true, supervisor: true } },
              },
            },
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException("Submission not found");
    }

    // Check permissions - only supervisors and admins can update submissions
    this.checkMilestoneAccess(submission.milestone.project, user.role, user.id);

    const updatedSubmission = await this.prisma.submission.update({
      where: { id },
      data: {
        ...updateSubmissionDto,
      },
      include: {
        milestone: {
          select: {
            id: true,
            title: true,
            deadline: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update milestone status to REVIEWED if comment is provided
    if (updateSubmissionDto.notes) {
      const updatedMilestone = await this.prisma.milestone.update({
        where: { id: submission.milestoneId },
        data: { status: MilestoneStatus.REVIEWED },
      });
    }

    if (updateSubmissionDto.grade) {
      const updatedMilestone = await this.prisma.milestone.update({
        where: { id: submission.milestoneId },
        data: { status: MilestoneStatus.COMPLETED },
      });
    }

    return updatedSubmission;
  }

  private checkMilestoneAccess(project: any, userRole: Role, userId: number) {
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

  private async handleUploads(uploads: { files?: Express.Multer.File[] }) {
    const uploadedFiles =
      uploads && uploads.files
        ? await this.service.uploadPDFs(uploads.files)
        : null;
    return { uploadedFiles };
  }
}
