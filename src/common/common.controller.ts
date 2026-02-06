import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CommonService } from './common.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Controller('common')
@ApiBearerAuth()
export class CommonController {
  constructor(
    private readonly commonService: CommonService,
    @InjectQueue('thumbnail-generation')
    private readonly thumbnailQueue: Queue,
  ) {}

  @Post('video')
  @UseInterceptors(
    FileInterceptor('video', {
      limits: {
        fileSize: 20000000,
      },
      fileFilter(req, file, callback) {
        // 조건을 걸 수 있다
        console.log(file);
        // callback 두번째에 false를 넣으면 원하는 폴더에 파일이 들어가지 않는다
        if (file.mimetype !== 'video/mp4') {
          return callback(
            new BadRequestException('MP4 타입만 업로드 가능합니다!'),
            false,
          );
        }

        return callback(null, true);
      },
    }),
  )
  async createVideo(
    @UploadedFile()
    video: Express.Multer.File,
  ) {
    await this.thumbnailQueue.add(
      'thumbnail',
      {
        videoId: video.filename,
        videoPath: video.path,
      },
      {
        // 우선순위
        // 숫자가 낮은게 가장 먼저 실행된다
        priority: 1,
        // 100ms만큼 기다렸다가 그 다음 프로세싱을 해줘라
        delay: 100,
        // 몇번까지 시도해라 현재는 3번 다시 시도
        attempts: 3,
        // 나중에 온 작업이 먼저 시작된다
        lifo: true,
        // 기본값은 false 큐가 성공했다 실패했다 라는걸 레디스가 기억하고 있는데 성공하면 기억을 삭제 시킨다
        removeOnComplete: true,
        // 실패했을경우 자동으로 작업을 삭제할 수 있는 옵션
        removeOnFail: true,
      },
    );

    return {
      fileName: video.filename,
    };
  }

  @Post('presigned-url')
  async createPresignedUrl() {
    return { url: await this.commonService.createPresigneUrl() };
  }
}
