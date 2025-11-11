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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SubmissionsService } from './submissions.service';
import { Role } from '@prisma/client';
import { User } from 'src/common/decorators/user.decorator';
import { FileValidationPipe } from 'src/common/validators/file-validation.pipe';
import { UpdateSubmissionDto } from './dto';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('milestones/:milestoneId/submissions')
export class SubmissionsController {
  constructor(
    private readonly submissionsService: SubmissionsService,
  ) {}

  @Post()
  @UseGuards(RolesGuard(Role.STUDENT))
  @UseInterceptors(FileFieldsInterceptor([
      { name: 'files', maxCount: 3 },
    ]),)
  create(
    @Param('milestoneId', ParseIntPipe) milestoneId: number,
    @UploadedFiles(new FileValidationPipe())
    uploads: { files?: Express.Multer.File[] },
    @User() user,
  ) {
    
    return this.submissionsService.create(milestoneId, uploads,user);
  }

  @Get()
  findAll(
    @Param('milestoneId', ParseIntPipe) milestoneId: number,
    @User() user,
  ) {
    return this.submissionsService.findAll(milestoneId, user);
  }

  // @Get(':id')
  // findOne(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Request() req,
  // ) {
  //   return this.submissionsService.findOne(id, req.user.role, req.user.id);
  // }

  @Patch(':id')
  @UseGuards(RolesGuard(Role.SUPERVISOR, Role.ADMIN))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubmissionDto: UpdateSubmissionDto,
    @User() user,
  ) {
    return this.submissionsService.update(id, updateSubmissionDto, user);
  }
}
