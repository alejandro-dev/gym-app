import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard que protege rutas usando la estrategia JWT de access token.
 */
@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {}
