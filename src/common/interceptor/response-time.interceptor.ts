import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();

    const reqTime = Date.now();

    return next.handle().pipe(
      // delay(1000),
      tap(() => {
        const respTime = Date.now();
        const diff = respTime - reqTime;

        if (diff > 3000) {
          console.log(`!!!TIME OUT!!! [${req.method} ${req.path}] ${diff}ms`);
          throw new InternalServerErrorException(`시간이 너무 오래 걸렸습니다`);
        } else {
          console.log(`[${req.method} ${req.path}] ${diff}ms`);
        }
      }),
    );
  }
}
