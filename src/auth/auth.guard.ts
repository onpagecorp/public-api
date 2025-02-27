import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  SetMetadata,
  UnauthorizedException
} from '@nestjs/common';
import {
  entity as Entities,
  newEncryptor as NewEncryptor
} from '@onpage-corp/onpage-domain-mysql';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name); // Scoped logger

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (isPublic) {
      this.logger.debug(`Controller is public.`);
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      this.logger.debug(`There is not token provided.`);
      throw new UnauthorizedException();
    }

    const encryptedToken = NewEncryptor.encryptSymmetricData(token);
    this.logger.debug(
      `Searching for Token ${token}:${encryptedToken} is not valid.`
    );

    const PublicApiToken = Entities.sequelize.models.PublicApiToken;
    const tokenExistAndActive = await PublicApiToken.findOne({
      where: {
        token: encryptedToken,
        active: true
      }
    });
    this.logger.debug(
      `tokenExistAndActive:  ${JSON.stringify(tokenExistAndActive)}`
    );
    if (!tokenExistAndActive) {
      this.logger.debug(`Token ${token} is not valid.`);
      throw new UnauthorizedException();
    }

    /*
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret
      });
      this.logger.debug(`Payload: ${JSON.stringify(payload)}`);

      request['auth-enterprise-id'] = 166;
      request['auth-dispatcher-id'] = 4207;
    } catch {
      this.logger.debug(`There was an error verifying the token.`);
      // throw new UnauthorizedException();
    } 
    */

    this.logger.debug(`Token is valid.`);

    request['auth-enterprise-id'] = tokenExistAndActive.enterpriseId;
    request['auth-dispatcher-id'] = -1;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    const bearerToken = type === 'Bearer' ? token : undefined;

    this.logger.debug(`Bearer token: ${bearerToken}`);
    return bearerToken;
  }
}
