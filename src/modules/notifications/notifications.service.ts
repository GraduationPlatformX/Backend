import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { User } from "@prisma/client";

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: User, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    // Fetch paginated notifications
    const notifications = await this.prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // // Mark all unseen notifications in this page as seen
    // await this.prisma.notification.updateMany({
    //   where: {
    //     userId: user.id,
    //     id: { in: notifications.filter((n) => !n.seen).map((n) => n.id) },
    //   },
    //   data: { seen: true },
    // });

    // Count total for pagination
    const total = await this.prisma.notification.count({
      where: { userId: user.id },
    });

    return {
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      notifications: notifications, 
    };
  }

  // async findOne(id: number, userId: number) {
  //   const notification = await this.prisma.notification.findUnique({
  //     where: { id },
  //   });

  //   if (!notification) {
  //     throw new NotFoundException('Notification not found');
  //   }

  //   if (notification.userId !== userId) {
  //     throw new NotFoundException('Notification not found');
  //   }

  //   return notification;
  // }

  // async markAsSeen(id: number, userId: number) {
  //   const notification = await this.prisma.notification.findUnique({
  //     where: { id },
  //   });

  //   if (!notification) {
  //     throw new NotFoundException('Notification not found');
  //   }

  //   if (notification.userId !== userId) {
  //     throw new NotFoundException('Notification not found');
  //   }

  //   return this.prisma.notification.update({
  //     where: { id },
  //     data: { seen: true },
  //   });
  // }

  async markAllAsSeen(user: User) {
    return await this.prisma.notification.updateMany({
      where: {
        userId:user.id,
        seen: false,
      },
      data: { seen: true },
    });
  }

  async sendTestNotification(user: User) {
    return this.prisma.notification.create({
      data: {
        userId: user.id,
        message: 'This is a test notification sent to you.',
      },
    });
  }

 

  
  
  // async getUnreadCount(userId: number) {
  //   return this.prisma.notification.count({
  //     where: {
  //       userId,
  //       seen: false,
  //     },
  //   });
  // }

  // async remove(id: number, userId: number) {
  //   const notification = await this.prisma.notification.findUnique({
  //     where: { id },
  //   });

  //   if (!notification) {
  //     throw new NotFoundException('Notification not found');
  //   }

  //   if (notification.userId !== userId) {
  //     throw new NotFoundException('Notification not found');
  //   }

  //   return this.prisma.notification.delete({
  //     where: { id },
  //   });
  // }
}
