import { ConflictException, Injectable, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { JwtService } from "@nestjs/jwt";
import { SigninDto, SignupDto } from "./dto";
import { PrismaService } from "../database/prisma.service";
import { Role, User } from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async signin(dto: SigninDto) {
    // Find user
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!existingUser) {
      throw new UnauthorizedException("Invalid credentials");
    }
    // Compare password
    const isMatch = await bcrypt.compare(dto.password, existingUser.password);
    if (!isMatch) {
      throw new UnauthorizedException("Invalid credentials");
    }
    // Generate JWT token
    const payload = { sub: existingUser.id, email: existingUser.email };
    const token = await this.jwtService.signAsync(payload);

    const { password: userPassword, ...user } = existingUser;

    return {
      message: "Logged In Successful",
      user: user,
      access_token: token,
    };
  }

  async signup(dto: SignupDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Only allow students to register directly, admins and supervisors must be created by admin
    if (dto.role && dto.role !== Role.STUDENT) {
      throw new ForbiddenException('Only students can register directly');
    }

    // Hash password
    const hash = await bcrypt.hash(dto.password, 10);
    
    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hash,
        name: dto.name,
        role: dto.role || Role.STUDENT,
      },
    });
    
    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(payload);
    
    const { password: userPassword, ...userWithoutPassword } = user;
    
    return { 
      message: "User created", 
      user: userWithoutPassword, 
      access_token: token 
    };
  }


  async logout(user: User) {
    return {
      message: "Logged out",
      user: user,
    };
  }

  async me(user: User) {
    return {user: user}
  }
}
