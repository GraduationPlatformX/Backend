import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { CreateProjectDto, UpdateProjectDto } from "./dto";
import { Role } from "@prisma/client";
import { User } from "src/common/decorators/user.decorator";
import { RolesGuard } from "src/common/guards/roles.guard";

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(RolesGuard(Role.STUDENT))
  create(@Body() createProjectDto: CreateProjectDto, @User() user) {
    return this.projectsService.create(createProjectDto, user);
  }

  @Get("/my-project")
  getMyProject(@User() user) {
    return this.projectsService.getMyProject(user);
  }

  @Get()
  @UseGuards(RolesGuard(Role.ADMIN, Role.SUPERVISOR))
  getAllProject(@User() user) {
    return this.projectsService.getAllProject(user);
  }

  @Get(":id")
  getProject(@Param("id", ParseIntPipe) id: number, @User() user) {
    return this.projectsService.getProject(id, user);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @User() user
  ) {
    return this.projectsService.update(id, updateProjectDto, user);
  }

  @Delete(":id")
  @UseGuards(RolesGuard(Role.ADMIN, Role.STUDENT))
  remove(@Param("id", ParseIntPipe) id: number, @User() user) {
    return this.projectsService.remove(id, user);
  }
}
