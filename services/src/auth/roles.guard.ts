import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // if no roles specified, allow access
    }
    const { user } = context.switchToHttp().getRequest();
    
    // Admin has access to all routes by default in this blueprint
    if (user?.role === Role.ADMIN || user?.role === Role.OWNER) {
      return true;
    }
    
    return requiredRoles.includes(user?.role);
  }
}
