import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { User } from "@prisma/client";
import { baseUserSelect } from "src/common/prisma/selects";

@Injectable()
export class GroupChatsService {
  constructor(private prisma: PrismaService) {}

 async getMessages(user: User, groupId: number, page = 1, limit = 20) {
  const group = await this.prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true, chat: true },
  });

  if (!group) {
    throw new Error("Group not found");
  }

  const isMember = group.members.some(
    (member) => member.studentId === user.id
  );
  if (!isMember) {
    throw new Error("Access denied");
  }

  const skip = (page - 1) * limit;

  // BASE QUERY
  const baseWhere = { chatId: group.chat?.id };

  // total first
  const total = await this.prisma.groupChatMessage.count({
    where: baseWhere,
  });

  // fetch newest first
  const messages = await this.prisma.groupChatMessage.findMany({
    where: baseWhere,
    orderBy: { createdAt: "desc" }, // <—— newest first
    skip,
    take: limit,
    include: {
      sender: { select: baseUserSelect },
    },
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
    // important: reverse so UI renders oldest→newest
    messages: messages.reverse(),
  };
}


  async sendMessage(user: User, groupId: number, content: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true, chat: true },
    });
    if (!group) {
      throw new Error("Group not found");
    }
    const isMember = group.members.some(
      (member) => member.studentId === user.id
    );

    if (!isMember) {
      throw new Error("Access denied");
    }

    if (!group.chat) {
      throw new Error("Chat not found");
    }

    return this.prisma.groupChatMessage.create({
      data: {
        content,
        chatId: group.chat.id,
        senderId: user.id,
      },
      include:{sender: { select: baseUserSelect } }
    });
  }
}








// const newMessage = await this.prisma.$transaction(async (tx) => {
//   const message = await tx.groupChatMessage.create({
//     data: {
//       content,
//       chatId: group?.chat?.id || 0,
//       senderId: user.id,
//     },
//   });

//   const members = group.members.filter(
//     (member) => member.studentId !== user.id
//   );

//   await Promise.all(
//     members.map((member) =>
//       tx.notification.create({
//         data: {
//           userId: member.studentId,
//           message: `You have got a new message "${group.name}".`,
//         },
//       })
//     )
//   );

//   return message;
// });
