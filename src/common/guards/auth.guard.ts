import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { PrismaService } from "src/modules/database/prisma.service";

export const PUBLIC_END_POINT_KEY = "optionalAuth";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. Check if endpoint is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_END_POINT_KEY,
      [context.getHandler(), context.getClass()],
    );

    const token = this.extractToken(request);

    // 2. If public and no token → allow access without user
    if (isPublic && !token) {
      request["user"] = undefined;
      return true;
    }

    // 3. If no token and not public → block
    if (!token) {
      throw new UnauthorizedException("No token provided");
    }

    try {
      // 4. Verify token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET, // better: inject ConfigService
      });

      // 5. Lookup user
      const user = await this.prisma.user.findUnique({
        where: { email: payload.email },
      });


      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      const { password, ...rest } = user;

      request["user"] = rest;
      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }

  private extractToken(req: Request): string | undefined {
    const authHeader = req.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(" ");
    return type === "Bearer" ? token : undefined;
  }
}
