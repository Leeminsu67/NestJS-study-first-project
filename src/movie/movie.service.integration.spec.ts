import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entity/movie.emtity';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entitie/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';
import { MovieUserLike } from './entity/movie-user-like.entity';
import { MovieService } from './movie.service';
import { CommonService } from 'src/common/common.service';
import { User } from 'src/user/entities/user.entity';
import { DataSource } from 'typeorm';

describe('MovieService - Integration Test', () => {
  let service: MovieService;
  let cacheManager: Cache;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register(),
        TypeOrmModule.forRoot({
          type: 'sqljs',
          database: new Uint8Array(),
          // type: 'sqlite',
          // database: ':memory:',
          dropSchema: true,
          entities: [Movie, MovieDetail, Director, User, MovieUserLike, Genre],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([
          Movie,
          MovieDetail,
          Director,
          Genre,
          MovieUserLike,
          User,
        ]),
      ],
      providers: [MovieService, CommonService],
    }).compile();

    service = module.get<MovieService>(MovieService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
