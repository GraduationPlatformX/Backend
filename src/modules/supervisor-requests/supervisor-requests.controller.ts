import { Controller, Get, UseGuards } from "@nestjs/common";
import { SupervisorRequestsService } from "./supervisor-requests.service";

import { Body, Param, ParseIntPipe, Post, Patch } from "@nestjs/common";
import { CreateSupervisorRequestDto } from "./dto";
import { User } from "src/common/decorators/user.decorator";
import { Role } from "@prisma/client";
import { RolesGuard } from "src/common/guards/roles.guard";
@Controller("supervisor-requests")
export class SupervisorRequestsController {
  constructor(private readonly service: SupervisorRequestsService) {}

  @Get()
  @UseGuards(RolesGuard(Role.SUPERVISOR))
  findAll(@User() user) {
    return this.service.findAll(user);
  }

  @Post()
  @UseGuards(RolesGuard(Role.STUDENT))
  requestSupervisor(
    @Body() dto: CreateSupervisorRequestDto,
    @User() user
  ) {
    return this.service.requestSupervisor(dto, user);
  }

  @Patch(":id/accept")
  @UseGuards(RolesGuard(Role.SUPERVISOR))
  acceptRequest(@Param("id", ParseIntPipe) requestId: number, @User() user) {
    return this.service.acceptRequest(requestId, user);
  }

  @Patch(":id/reject")
  @UseGuards(RolesGuard(Role.SUPERVISOR))
  rejectRequest(@Param("id", ParseIntPipe) requestId: number, @User() user) {
    return this.service.rejectRequest(requestId, user);
  }
}
