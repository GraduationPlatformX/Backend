import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Put,
  Get,
} from "@nestjs/common";
import { GroupsService } from "./groups.service";
import { User } from "src/common/decorators/user.decorator";
import { CreateGroupDto, UpdateGroupDto } from "./dto";

@Controller("groups")
export class GroupsController {
  constructor(private readonly groupService: GroupsService) {}

  
  @Post()
  create(@Body() dto: CreateGroupDto, @User() user) {
    return this.groupService.create(dto, user);
  }
  
  @Get("/my-group")
  getMyGroup(@User() user){
    return this.groupService.getMyGroup(user);
  }

  @Post(":groupId/invite/:userId")
  sendGroupInvitation(
    @User() user,
    @Param("groupId", ParseIntPipe) groupId: number,
    @Param("userId", ParseIntPipe) userId: number
  ) {
    return this.groupService.sendGroupInvitation(user, groupId, userId);
  }

  @Post("/join")
  joinGroupByCode(
    @User() user,
    @Body() { code }: { code: string }
  ) {
    return this.groupService.joinGroupByCode(user,code);
  }

  @Put(":id")
  update(
    @User() user,
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateGroupDto
  ) {
    return this.groupService.update(user, id, dto);
  }

  @Delete(":id")
  remove(@User() user, @Param("id", ParseIntPipe) id: number) {
    return this.groupService.remove(user, id);
  }

  @Delete(":id/members/:userId")
  removeMember(
    @Param("id", ParseIntPipe) groupId: number,
    @Param("userId", ParseIntPipe) userId: number,
    @User() user
  ) {
    return this.groupService.removeMember(groupId, userId, user);
  }
}
