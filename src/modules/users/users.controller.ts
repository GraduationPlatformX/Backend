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
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard(Role.ADMIN))
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(RolesGuard(Role.ADMIN))
  findAllUsers() {
    return this.usersService.findAllUsers();
  }

  @Patch(':id')
  @UseGuards(RolesGuard(Role.ADMIN))
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard(Role.ADMIN))
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Get('search-supervisors')
  @UseGuards(RolesGuard(Role.STUDENT))
  searchSupervisors(@Query('query') query: string) {
    return this.usersService.searchSupervisors(query);
  }

  @Get('search-students')
  @UseGuards(RolesGuard(Role.STUDENT))
  searchStudents(@Query('query') query: string) {
    return this.usersService.searchStudents(query);
  }

}
