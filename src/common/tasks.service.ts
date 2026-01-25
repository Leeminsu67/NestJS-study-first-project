import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
// 디렉토리 안에 있는 모든 파일 목록을 읽어오는 모듈
import { readdir, unlink } from 'fs/promises';
import { join, parse } from 'path';
import { Movie } from 'src/movie/entity/movie.emtity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  // @Cron('* * * * * *')
  // logEveerySecond() {
  //   console.log('1초마다 실행되는 작업입니다.');
  // }

  // @Cron('* * * * * *')
  async eraseOrphanFiles() {
    const files = await readdir(join(process.cwd(), 'public', 'temp'));

    const deleteFilesTargets = files.filter((file) => {
      // 파일 이름에서 확장자 제거
      const filename = parse(file).name;

      const split = filename.split('_');

      if (split.length !== 2) {
        return true;
      }

      try {
        const date = +new Date(parseInt(split[split.length - 1]));
        const aDayInMilSec = 24 * 60 * 60 * 1000;

        const now = +new Date();

        return now - date > aDayInMilSec;
      } catch (e) {
        return true;
      }
    });
    // for (const file of deleteFilesTargets) {
    //   await unlink(join(process.cwd(), 'public', 'temp', file));
    // }

    await Promise.all(
      deleteFilesTargets.map((x) =>
        unlink(join(process.cwd(), 'public', 'temp', x)),
      ),
    );
  }

  // @Cron('0 * * * * *')
  async calculateMovieLikeCounts() {
    console.log('run');
    await this.movieRepository.query(`
      UPDATE movie m 
SET "likeCount" = (
	SELECT count(*) FROM movie_user_like mul 
	WHERE m.id = mul."movieId" AND mul."isLike" = true
)
      `);

    await this.movieRepository.query(`
      UPDATE movie m 
SET "dislikeCount" = (
	SELECT count(*) FROM movie_user_like mul 
	WHERE m.id = mul."movieId" AND mul."isLike" = false
)
      `);
  }
}
