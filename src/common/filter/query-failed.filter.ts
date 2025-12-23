import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

// QueryFailedError는 typeorm에서 가지고 오는것이기 때문에 status code가 없다
@Catch(QueryFailedError)
export class QueryFailedExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // 클라이언트에서 잘못 넣은게 대부분 에러를 발생하기 때문에 400
    const status = 400;

    let message = '데이터베이스 에러 발생';

    // 해당 문자열이 포함된 경우를 찾는다
    // 찾고 나서 message의 값을 바꿔준다
    if (exception.message.includes('duplicate key')) {
      message = '중복 키 에러!';
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
