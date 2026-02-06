import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { v4 } from 'uuid';
import { diskStorage } from 'multer';
import { join } from 'path';
import { TasksService } from './tasks.service';
import { Movie } from 'src/movie/entity/movie.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefaultLogger } from './logger/default.logger';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        // ........./Netflix/public/movie
        // process.cwd() + '/public' + 'movie' mac linux 기반
        // process.cwd() + '\public' + '\movie' windows 기반
        // 아무 슬래시를 넣으면 둘 중 하나는 에러가 난다
        // 운영체제에 적합한 슬래시를 넣어준다 join과 process.cwd() 조합으로
        // 업로드 경로
        destination: join(process.cwd(), 'public', 'temp'),
        filename: (req, file, cb) => {
          const split = file.originalname.split('.');
          let extension = 'mp4';
          if (split.length > 1) {
            extension = split[split.length - 1];
          }
          cb(null, `${v4()}_${Date.now()}.${extension}`);
        },
      }),
    }),
    TypeOrmModule.forFeature([Movie]),
    // Queue 세팅
    BullModule.forRoot({
      connection: {
        host: 'redis-13224.c340.ap-northeast-2-1.ec2.cloud.redislabs.com',
        port: 13224,
        username: 'default',
        password: 'wpyft8lHWRq2fyR4VT1VbbtAGJE3jnoA',
      },
    }),
    // Queue 작업 이름 세팅
    BullModule.registerQueue({
      name: 'thumbnail-generation',
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService, TasksService, DefaultLogger],
  exports: [CommonService],
})
export class CommonModule {}
