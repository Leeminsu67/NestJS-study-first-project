import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';
import { DataSource } from 'typeorm';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
    // ): Observable<any> | Promise<Observable<any>> {
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();

    const qr = this.dataSource.createQueryRunner();

    await qr.connect();
    await qr.startTransaction();

    // request객체에 쿼리빌더를 붙여주면 create 함수 내에서 쓸 수 있을것이다
    req.queryRunner = qr;

    return next.handle().pipe(
      catchError(async (e) => {
        await qr.rollbackTransaction();
        await qr.release();

        throw e;
      }),
      tap(async () => {
        await qr.commitTransaction();
        await qr.release();
      }),
    );
  }
}
