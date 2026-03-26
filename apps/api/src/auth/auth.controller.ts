import {
   Body,
   Controller,
   Get,
   Post,
   Req,
   Res,
   UseGuards,
} from '@nestjs/common';
import {
   ApiBadRequestResponse,
   ApiBearerAuth,
   ApiBody,
   ApiCookieAuth,
   ApiOkResponse,
   ApiOperation,
   ApiTags,
   ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { REFRESH_TOKEN_COOKIE_NAME } from './constants/auth.constants';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { AuthService } from './auth.service';
import { VerifyEmailDto } from './dto/verify-email.dto';

/**
 * Endpoints de autenticacion con JWT.
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
   constructor(private readonly authService: AuthService) {}

   /**
    * Registra un usuario nuevo y devuelve access y refresh token.
    *
    * @param registerDto - Datos de registro del usuario
    * @param response - Respuesta HTTP donde se escribe la cookie del refresh token
    * @returns Usuario registrado junto con access token
    */
   @ApiOperation({ summary: 'Registrar usuario' })
   @ApiOkResponse({ description: 'Usuario registrado correctamente.' })
   @Post('register')
   async register(
      @Body() registerDto: RegisterDto,
      @Res({ passthrough: true }) response: Response,
   ) {
      const result = await this.authService.register(registerDto);
      this.setRefreshTokenCookie(response, result.refreshToken);

      return {
         user: result.user,
         accessToken: result.accessToken,
      };
   }

   /**
    * Inicia sesion con email y password.
    *
    * @param loginDto - Credenciales de acceso
    * @param response - Respuesta HTTP donde se escribe la cookie del refresh token
    * @returns Usuario autenticado junto con access token
    */
   @ApiOperation({ summary: 'Iniciar sesion' })
   @ApiOkResponse({ description: 'Sesion iniciada correctamente.' })
   @Post('login')
   async login(
      @Body() loginDto: LoginDto,
      @Res({ passthrough: true }) response: Response,
   ) {
      const result = await this.authService.login(loginDto);
      this.setRefreshTokenCookie(response, result.refreshToken);

      return {
         user: result.user,
         accessToken: result.accessToken,
      };
   }

   /**
    * Renueva access y refresh token a partir del refresh token actual.
    *
    * @param request - Peticion HTTP para leer la cookie del refresh token
    * @param refreshTokenDto - Cuerpo opcional con el refresh token
    * @param response - Respuesta HTTP donde se escribe la cookie actualizada
    * @returns Usuario autenticado junto con un nuevo access token
    */
   @ApiOperation({ summary: 'Refrescar tokens' })
   @ApiCookieAuth(REFRESH_TOKEN_COOKIE_NAME)
   @ApiBody({
      type: RefreshTokenDto,
      required: false,
      description: 'Opcional si el refresh token viaja en cookie httpOnly.',
   })
   @ApiOkResponse({ description: 'Tokens renovados correctamente.' })
   @Post('refresh')
   async refresh(
      @Req() request: Request,
      @Body() refreshTokenDto: Partial<RefreshTokenDto>,
      @Res({ passthrough: true }) response: Response,
   ) {
      const cookies = request.cookies as Record<string, unknown> | undefined;
      const refreshTokenFromCookie = cookies?.[REFRESH_TOKEN_COOKIE_NAME];
      const refreshToken =
         typeof refreshTokenFromCookie === 'string'
            ? refreshTokenFromCookie
            : (refreshTokenDto.refreshToken ?? '');

      const result = await this.authService.refreshTokens(refreshToken);
      this.setRefreshTokenCookie(response, result.refreshToken);

      return {
         user: result.user,
         accessToken: result.accessToken,
      };
   }

   /**
    * Devuelve los datos publicos del usuario autenticado.
    *
    * @param user - Usuario autenticado
    * @returns Perfil publico del usuario autenticado
    */
   @ApiOperation({ summary: 'Obtener perfil autenticado' })
   @ApiBearerAuth()
   @ApiOkResponse({ description: 'Perfil del usuario autenticado.' })
   @UseGuards(AccessTokenGuard)
   @Get('me')
   me(@CurrentUser() user: AuthenticatedUser) {
      return this.authService.getProfile(user.sub);
   }

   /**
    * Invalida el refresh token almacenado del usuario autenticado.
    *
    * @param user - Usuario autenticado
    * @param response - Respuesta HTTP donde se limpia la cookie del refresh token
    * @returns Confirmacion de cierre de sesion
    */
   @ApiOperation({ summary: 'Cerrar sesion' })
   @ApiBearerAuth()
   @ApiOkResponse({ description: 'Sesion cerrada correctamente.' })
   @UseGuards(AccessTokenGuard)
   @Post('logout')
   async logout(
      @CurrentUser() user: AuthenticatedUser,
      @Res({ passthrough: true }) response: Response,
   ) {
      this.clearRefreshTokenCookie(response);
      return this.authService.logout(user.sub);
   }

   /**
    * Verifica el token de verificación de email.
    *
    * @param verifyEmailDto - Token de verificación de email
    * @returns Datos del usuario verificado
    */
   @ApiOperation({ summary: 'Verificar email' })
   @ApiBody({ type: VerifyEmailDto })
   @ApiOkResponse({ description: 'Email verificado correctamente.' })
   @ApiBadRequestResponse({
      description: 'Verification token is required.',
   })
   @ApiUnauthorizedResponse({
      description: 'Invalid or expired verification token.',
   })
   @Post('verify-email')
   verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
      return this.authService.verifyEmail(verifyEmailDto.token);
   }

   /**
    * Escribe el refresh token en una cookie httpOnly.
    *
    * @param response - Respuesta HTTP donde se escribe la cookie
    * @param refreshToken - Refresh token a almacenar
    * @returns `void`
    */
   private setRefreshTokenCookie(response: Response, refreshToken: string) {
      response.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
         httpOnly: true,
         sameSite: 'lax',
         secure: process.env.NODE_ENV === 'production',
         path: '/auth',
         maxAge: 7 * 24 * 60 * 60 * 1000,
      });
   }

   /**
    * Elimina la cookie donde se almacena el refresh token.
    *
    * @param response - Respuesta HTTP donde se elimina la cookie
    * @returns `void`
    */
   private clearRefreshTokenCookie(response: Response) {
      response.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
         httpOnly: true,
         sameSite: 'lax',
         secure: process.env.NODE_ENV === 'production',
         path: '/auth',
      });
   }
}
