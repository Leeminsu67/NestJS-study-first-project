import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController, MovieControllerV2 } from './movie.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entity/movie.emtity';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entitie/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';
import { CommonModule } from 'src/common/common.module';
import { User } from 'src/user/entities/user.entity';
import { MovieUserLike } from './entity/movie-user-like.entity';
// import { MulterModule } from '@nestjs/platform-express';
// import { diskStorage } from 'multer';
// import { join } from 'path';
// import { v4 } from 'uuid';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Movie,
      MovieDetail,
      Director,
      Genre,
      User,
      MovieUserLike,
    ]),
    CommonModule,
    // MulterModule.register({
    //   storage: diskStorage({
    //     // ........./Netflix/public/movie
    //     // process.cwd() + '/public' + 'movie' mac linux 기반
    //     // process.cwd() + '\public' + '\movie' windows 기반
    //     // 아무 슬래시를 넣으면 둘 중 하나는 에러가 난다
    //     // 운영체제에 적합한 슬래시를 넣어준다 join과 process.cwd() 조합으로
    //     // 업로드 경로
    //     destination: join(process.cwd(), 'public', 'movie'),
    //     filename: (req, file, cb) => {
    //       const split = file.originalname.split('.');
    //       let extension = 'mp4';
    //       if (split.length > 1) {
    //         extension = split[split.length - 1];
    //       }
    //       cb(null, `${v4()}_${Date.now()}.${extension}`);
    //     },
    //   }),
    // }),
  ],
  controllers: [MovieControllerV2, MovieController],
  providers: [MovieService],
})
export class MovieModule {}
