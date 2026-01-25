import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  constructor() {}

  @Cron('* * * * * *')
  logEveerySecond() {
    console.log('1초마다 실행되는 작업입니다.');
  }
}
