import { Inject, Injectable, type LoggerService } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
// 디렉토리 안에 있는 모든 파일 목록을 읽어오는 모듈
import { readdir, unlink } from 'fs/promises';
import { join, parse } from 'path';
import { Movie } from 'src/movie/entity/movie.entity';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { DefaultLogger } from './logger/default.logger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class TasksService {
  // Logger(여기 안에 어떤 클래스나 서비스인지 써준다)
  // private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private readonly schedulerRegistry: SchedulerRegistry,
    // private readonly logger: DefaultLogger,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  // @Cron('*/5 * * * * *')
  logEverySecond() {
    // 치명적인 에러가 발생해서 프로그램이 더이상 실행이 불가능한 경우
    this.logger.fatal?.('FATAL 레벨 로그', null, TasksService.name);
    // 치명적인 에러가 발생해서 프로그램이 더이상 실행이 불가능한 경우
    this.logger.error('ERROR 레벨 로그', null, TasksService.name);
    // 일어나면 안 되는 일이 맞는데 프로그램을 실행에 지장은 없는 경우
    this.logger.warn('WARN 레벨 로그', TasksService.name);
    // 정보성 로그를 작성할 때
    this.logger.log('LOG 레벨 로그', TasksService.name);
    // 개발 환경에서 중요한거
    this.logger.debug?.('DEBUG 레벨 로그', TasksService.name);
    // 궁금해서 로깅을 해본거
    this.logger.verbose?.('VERBOSE 레벨 로그', TasksService.name);
  }

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
      } catch {
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

  // @Cron('* * * * * *', { name: 'printer' })
  printer() {
    console.log('print every seconds');
  }

  // @Cron('*/5 * * * * *')
  stopper() {
    console.log('----stopper run ----');

    // 크론잡을 가져오는 방법
    const job = this.schedulerRegistry.getCronJob('printer');

    // console.log('# Last Date');
    // console.log(job.lastDate());
    // console.log('# Next Date');
    // console.log(job.nextDate());
    console.log('# Next Dates');
    console.log(job.nextDates(5));

    if (job.isActive) {
      job.stop();
    } else {
      job.start();
    }
  }
}
