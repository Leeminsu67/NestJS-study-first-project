import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { envVariableKeys } from 'src/common/const/env.const';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Basic $token
    // Bearer $token
    const authHeader = req.headers['authorization'];

    // 토큰이 아예 없는 경우
    if (!authHeader) {
      next();
      return;
    }

    try {
      // authHeader가 존재하는 경우
      const token = this.validateBearerToken(authHeader);

      const tokenKey = `TOKEN_${token}`;

      const cachePayload = await this.cacheManager.get(tokenKey);

      if (cachePayload) {
        req.user = cachePayload;
        return next();
      }

      const decodedPayload = this.jwtService.decode(token);

      if (
        decodedPayload.type !== 'refresh' &&
        decodedPayload.type !== 'access'
      ) {
        throw new UnauthorizedException('잘못된 토큰입니다');
      }

      const secretKey =
        decodedPayload.type === 'refresh'
          ? envVariableKeys.refreshTokenSecret
          : envVariableKeys.accessTokenSecret;

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>(secretKey)!,
      });

      // payload['exp] -> each time seconds
      const expiryDate = +new Date(payload.exp * 1000);
      const now = +Date.now();

      const differenceInSeconds = (expiryDate - now) / 1000;

      await this.cacheManager.set(
        tokenKey,
        payload,
        Math.max((differenceInSeconds - 30) * 1000, 1),
      );

      req.user = payload;
      next();
    } catch (e) {
      // 토큰 만료
      if (e.name === 'TokenExpiredError') {
        throw new UnauthorizedException('토큰이 만료됐습니다');
      }

      // throw new UnauthorizedException('토큰이 만료되었습니다');
      // 이렇게 next로 보내면 request.user는 undefined가 되어버린다
      // user가 없다면 guard에서 예외처리로 막아주기 때문에 next()로 보내버린다
      next();
    }
  }

  validateBearerToken(rawToken: string) {
    const bearerSplit = rawToken.split(' ');

    if (bearerSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다');
    }

    const [bearer, token] = bearerSplit;

    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다');
    }

    return token;
  }
}
