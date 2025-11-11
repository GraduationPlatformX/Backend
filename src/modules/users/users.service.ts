import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CreateUserDto, UpdateUserDto } from "./dto";
import * as bcrypt from "bcryptjs";
import { baseUserSelect } from "src/common/prisma/selects";
import { Role } from "@prisma/client";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException("User already exists");
    }

    // Hash password
    const hash = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hash,
      },
      select: baseUserSelect,
    });

    return user;
  }

  async findAllUsers() {
    return this.prisma.user.findMany({
      select: baseUserSelect,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Check if email is being updated and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException("Email already exists");
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: baseUserSelect,
    });
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return this.prisma.user.delete({
      where: { id },
      select: baseUserSelect,
    });
  }

  async searchSupervisors(query: string) {
    return this.prisma.user.findMany({
      where: {
        role: Role.SUPERVISOR,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      select: baseUserSelect,
    });
  }

  
  async searchStudents(query: string) {
    return this.prisma.user.findMany({
      where: {
        role: Role.STUDENT,
        AND: [
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          },
          {
            // no groups at all
            groupMembers: {
              none: {},
            },
          },
        ],
      },
      select: baseUserSelect,
    });
  }
}
