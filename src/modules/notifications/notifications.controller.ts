import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  Post,
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { User } from "src/common/decorators/user.decorator";
import { Public } from "src/common/decorators/public-endpoint.decorator";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @User() user,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10"
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    return this.notificationsService.findAll(user, pageNum, limitNum);
  }

  // @Get('unread-count')
  // getUnreadCount(@User() user) {
  //   return this.notificationsService.getUnreadCount(user);
  // }

  // @Get(':id')
  // findOne(@Param('id', ParseIntPipe) id: number, @User() user) {
  //   return this.notificationsService.findOne(id, user);
  // }

  // @Patch(':id/seen')
  // markAsSeen(@Param('id', ParseIntPipe) id: number, @User() user) {
  //   return this.notificationsService.markAsSeen(id, user);
  // }

  @Patch('mark-all-seen')
  markAllAsSeen(@User() user) {
    return this.notificationsService.markAllAsSeen(user);
  }

  @Post("test")
  sendTestNotification(@User() user){
    return this.notificationsService.sendTestNotification(user);
  }

  // @Delete(':id')
  // remove(@Param('id', ParseIntPipe) id: number, @User() user) {
  //   return this.notificationsService.remove(id, user);
  // }
}
