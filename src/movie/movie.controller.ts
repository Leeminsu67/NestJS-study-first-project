import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseIntPipe,
  Request,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
// import { MovieTitleValidationPipe } from './pipe/movie-title-validation.pipe';
import { Public } from 'src/auth/decorator/public.decorator';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { Role } from 'src/user/entities/user.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { CacheInterceptor } from 'src/common/interceptor/cache.interceptor';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';

@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Public()
  @Get()
  // @UseInterceptors(CacheInterceptor)
  getMovies(@Query() dto: GetMoviesDto) {
    return this.movieService.findAll(dto);
  }

  @Public()
  // ParseIntPipe로 들어오는 값이 number인지 검증하고 number 타입으로 변환이 되서 내려온다
  @Get(':id')
  getMovie(
    @Param(
      'id',
      // new ParseIntPipe({
      //   exceptionFactory(error) {
      //     // 에러 메세지를 변경하고 싶을때 이렇게 할 수 있다
      //     throw new BadRequestException('숫자를 입력해주세요');
      //   },
      // }),
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.movieService.findOne(id);
  }

  @Post()
  @RBAC(Role.admin)
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'movie',
          maxCount: 1,
        },
        {
          name: 'poster',
          maxCount: 2,
        },
      ],
      {
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
      },
    ),
  )
  postMovie(
    @Body() body: CreateMovieDto,
    @Request() req,
    @UploadedFiles()
    files: { movie?: Express.Multer.File[]; poster?: Express.Multer.File[] },
  ) {
    console.log('-----------------------');
    console.log(files);
    return this.movieService.create(body, req.queryRunner);
  }

  @Patch(':id')
  @RBAC(Role.admin)
  patchMovie(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMovieDto,
  ) {
    return this.movieService.update(id, body);
  }

  @Delete(':id')
  @RBAC(Role.admin)
  deleteMovie(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.remove(id);
  }
}
