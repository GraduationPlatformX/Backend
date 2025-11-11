import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { GroupChatsService } from "./group-chats.service";
import { Role } from "@prisma/client";
import { RolesGuard } from "src/common/guards/roles.guard";
import { User } from "src/common/decorators/user.decorator";

@Controller("groups")
export class GroupChatsController {
  constructor(private groupChatsService: GroupChatsService) {}

  @Get(":id/messages")
  @UseGuards(RolesGuard(Role.STUDENT))
  async getMessage(
    @User() user,
    @Param("id", ParseIntPipe) groupId: number,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20"
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return this.groupChatsService.getMessages(
      user,
      groupId,
      pageNum,
      limitNum
    );
  }

  @Post(":id/messages")
  @UseGuards(RolesGuard(Role.STUDENT))
  async sendMessage(
    @User() user,
    @Param("id", ParseIntPipe) groupId: number,
    @Body() body: { content: string }
  ) {
    return this.groupChatsService.sendMessage(user, groupId, body.content);
  }
}
