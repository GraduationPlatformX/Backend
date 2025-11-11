import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { MilestonesService } from './milestones.service';
import { CreateMilestoneDto, UpdateMilestoneDto } from './dto';
import { Role } from '@prisma/client';
import { User } from 'src/common/decorators/user.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('projects/:projectId/milestones')
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Post()
  @UseGuards(RolesGuard(Role.SUPERVISOR,Role.ADMIN))
  create(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() createMilestoneDto: CreateMilestoneDto,
    @User() user,
  ) {
    return this.milestonesService.create(projectId, createMilestoneDto, user);
  }

  @Get()
  findAll(
    @Param('projectId', ParseIntPipe) projectId: number,
    @User() user,
  ) {
    return this.milestonesService.findAll(projectId, user);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @User() user,
  ) {
    return this.milestonesService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard(Role.SUPERVISOR, Role.ADMIN))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() updateMilestoneDto: UpdateMilestoneDto,
    @User() user,
  ) {
    return this.milestonesService.update(id,projectId, updateMilestoneDto, user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard(Role.SUPERVISOR, Role.ADMIN))
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Param('projectId', ParseIntPipe) projectId: number,
    @User() user,
  ) {
    return this.milestonesService.remove(id,projectId, user);
  }
}
