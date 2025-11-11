import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Type } from '@nestjs/common';
import { Role } from '@prisma/client';

@Injectable()
class RolesGuardBase implements CanActivate {
  constructor(private readonly roles: Role[]) {}

  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasRole = this.roles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

// Factory to create a guard instance
export function RolesGuard(...roles: Role[]): Type<CanActivate> {
  @Injectable()
  class RoleGuardMixin extends RolesGuardBase {
    constructor() {
      super(roles);
    }
  }
  return RoleGuardMixin;
}
