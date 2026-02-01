import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from 'src/app.module';
import { User } from 'src/user/entities/user.entity';
import { Director } from 'src/director/entitie/director.entity';
import { Movie } from './entity/movie.emtity';
import { Genre } from 'src/genre/entities/genre.entity';
import { DataSource } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { MovieUserLike } from './entity/movie-user-like.entity';

describe('MovieController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  let users: User[];
  let directors: Director[];
  let movies: Movie[];
  let genres: Genre[];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();

    dataSource = app.get<DataSource>(DataSource);

    const movieUserLikeRepository = dataSource.getRepository(MovieUserLike);
    const movieRepository = dataSource.getRepository(Movie);
    const movieDetailRepository = dataSource.getRepository(MovieDetail);
    const userRepository = dataSource.getRepository(User);
    const directorRepository = dataSource.getRepository(Director);
    const genreRepository = dataSource.getRepository(Genre);

    await movieUserLikeRepository.createQueryBuilder().delete().execute();
    await movieRepository.createQueryBuilder().delete().execute();
    await movieDetailRepository.createQueryBuilder().delete().execute();
    await genreRepository.createQueryBuilder().delete().execute();
    await directorRepository.createQueryBuilder().delete().execute();
    await userRepository.createQueryBuilder().delete().execute();

    users = [1, 2].map((x) =>
      userRepository.create({
        id: x,
        email: `${x}@test.com`,
        password: `123123`,
      }),
    );

    await userRepository.save(users);

    directors = [1, 2].map((x) =>
      directorRepository.create({
        id: x,
        dob: new Date('1992-11-23'),
        nationality: 'South Korea',
        name: `Genre ${x}`,
      }),
    );

    await directorRepository.save(directors);

    genres = [1, 2].map((x) =>
      genreRepository.create({
        id: x,
        name: `Genre ${x}`,
      }),
    );

    await genreRepository.save(genres);

    movies = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((x) =>
      movieRepository.create({
        id: x,
        title: `Movie ${x}`,
        creator: users[0],
        genres: genres,
        likeCount: 0,
        dislikeCount: 0,
        detail: movieDetailRepository.create({
          detail: `Movie Detail ${x}`,
        }),
        movieFilePath: 'movies/movie1.mp4',
        director: directors[0],
        createdAt: new Date(`2026-1-${x}`),
      }),
    );

    await movieRepository.save(movies);
  });

  afterAll(async () => {
    await dataSource.destroy(); // DB 연결 종료
    await app.close(); // 앱 종료
  });

  describe('[GET /movie]', () => {
    it('should get all movies', async () => {
      const { body, statusCode, error } = await request(
        app.getHttpServer(),
      ).get('/movie');

      expect(statusCode).toBe(200);
    });
  });
});
