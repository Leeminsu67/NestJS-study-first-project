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

@Controller('common')
@ApiBearerAuth()
export class CommonController {
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
  createVideo(
    @UploadedFile()
    video: Express.Multer.File,
  ) {
    return {
      fileName: video.filename,
    };
  }
}
