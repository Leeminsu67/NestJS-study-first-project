import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.emtity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Like, QueryRunner, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entitie/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { CommonService } from 'src/common/common.service';
import { join } from 'path';
import { rename } from 'fs/promises';
import { User } from 'src/user/entities/user.entity';
import { MovieUserLike } from './entity/movie-user-like.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class MovieService {
  constructor(
    // 자동으로 InjectRepository
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MovieUserLike)
    private readonly movieUserLikeRepository: Repository<MovieUserLike>,
    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache, // nestjs cache manager인걸 확인
  ) {}

  // cache 적용 find 함수
  async findRecent() {
    const cacheData = await this.cacheManager.get('MOVIE_RECENT');

    if (cacheData) {
      return cacheData;
    }

    const data = await this.movieRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: 10,
    });

    await this.cacheManager.set('MOVIE_RECENT', data);

    return data;
  }

  /* istanbul ignore next */
  async getMovies() {
    return this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genre');
  }

  /* istanbul ignore next */
  async getLikedMovies(movieIds: number[], userId: number) {
    return this.movieUserLikeRepository
      .createQueryBuilder('mul')
      .leftJoinAndSelect('mul.user', 'user')
      .leftJoinAndSelect('mul.movie', 'movie')
      .where('movie.id IN(:...movieIds)', { movieIds })
      .andWhere('user.id = :userId', { userId })
      .getMany();
  }

  async findAll(dto: GetMoviesDto, userId?: number) {
    // const { title, take, page } = dto;
    const { title, take } = dto;

    const qb = await this.getMovies();

    if (title) {
      // 따로 부르지 않고 쿼리 빌더에 더 붙일수가 있다
      qb.where('movie.title LIKE :title', { title: `%${title}%` });
    }

    // based pagination
    // if (take && page) {
    //   this.commonService.applyPagePaginationParamsToQb(qb, dto);
    // }

    // cursor pagination
    const { nextCursor } =
      await this.commonService.applyCursorPaginationParamsToQb(qb, dto);

    // 배열 형식이라서 대괄호로 해야한다
    let [data, count] = await qb.getManyAndCount();

    if (userId) {
      const movieIds = data.map((movie) => movie.id);

      const likeMovies =
        movieIds.length < 1 ? [] : await this.getLikedMovies(movieIds, userId);

      /**
       * {
       *  movieId: boolean
       * }
       */
      const likeMovieMap = likeMovies.reduce(
        (acc, next) => ({
          ...acc,
          [next.movie.id]: next.isLike,
        }),
        {},
      );

      data = data.map((x) => ({
        ...x,
        likeStatus: x.id in likeMovieMap ? likeMovieMap[x.id] : null,
      }));
    }

    return {
      data,
      nextCursor,
      count,
    };
  }

  /* istanbul ignore next */
  async findMovieDetail(id: number) {
    return this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genre')
      .leftJoinAndSelect('movie.detail', 'detail')
      .leftJoinAndSelect('movie.creator', 'creator')
      .where('movie.id = :id', { id })
      .getOne();
  }

  async findOne(id: number) {
    const movie = await this.findMovieDetail(id);

    // const movie = await this.movieRepository.findOne({
    //   where: { id },
    //   relations: ['detail', 'director', 'genres'],
    // });
    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID 값의 영화입니다.');
    }

    return movie;
  }

  /* istanbul ignore next */
  async createMovieDetail(qr: QueryRunner, createMovieDto: CreateMovieDto) {
    return qr.manager
      .createQueryBuilder()
      .insert()
      .into(MovieDetail)
      .values({ detail: createMovieDto.detail })
      .execute();
  }

  /* istanbul ignore next */
  async createMovie(
    qr: QueryRunner,
    createMovieDto: CreateMovieDto,
    director: Director,
    movieDetailId: number,
    userId: number,
    movieFolder: string,
  ) {
    return qr.manager
      .createQueryBuilder()
      .insert()
      .into(Movie)
      .values({
        title: createMovieDto.title,
        detail: { id: movieDetailId },
        director,
        creator: { id: userId },
        movieFilePath: join(movieFolder, createMovieDto.movieFileName),
        // genres,
      })
      .execute();
  }

  /* istanbul ignore next */
  async createMovieGenreRelation(
    qr: QueryRunner,
    movieId: number,
    genres: Genre[],
  ) {
    return qr.manager
      .createQueryBuilder()
      .relation(Movie, 'genres')
      .of(movieId)
      .add(genres.map((genre) => genre.id));
  }

  /* istanbul ignore next */
  async renameMovieFile(
    tempFolder: string,
    movieFolder: string,
    createMovieDto: CreateMovieDto,
  ) {
    return rename(
      join(process.cwd(), tempFolder, createMovieDto.movieFileName),
      join(process.cwd(), movieFolder, createMovieDto.movieFileName),
    );
  }

  async create(
    createMovieDto: CreateMovieDto,
    userId: number,
    qr: QueryRunner,
  ) {
    // const qr = this.dataSource.createQueryRunner();
    // await qr.connect();
    // await qr.startTransaction();

    // try {
    // const director = await this.directorRepository.findOne({
    // 쿼리 러너에서 매니저를 통해서 찾아야 트랜잭션이 적용된다
    // findOne에 테이블을 넣어준다
    const director = await qr.manager.findOne(Director, {
      where: {
        id: createMovieDto.directorId,
      },
    });

    if (!director) {
      throw new NotFoundException('존재하지 않는 ID 값의 감독입니다.');
    }

    // 여러개를 찾아야 하니 find
    const genres = await qr.manager.find(Genre, {
      where: {
        id: In(createMovieDto.genreIds),
      },
    });

    if (genres.length !== createMovieDto.genreIds.length) {
      throw new NotFoundException(
        `존재하지 않는 ID 값의 장르가 들어있습니다. 존재하는 ids -> ${genres.map((g) => g.id).join(', ')}`,
      );
    }

    // QueryBuilder로 insert를 하면 qr manager가 문맥을 따라 가므로 알아서 insert가 된다
    const movieDetail = await this.createMovieDetail(qr, createMovieDto);

    const movieDetailId = movieDetail.identifiers[0].id;

    const movieFolder = join(`public`, `movie`);
    const tempFolder = join(`public`, `temp`);

    const movie = await this.createMovie(
      qr,
      createMovieDto,
      director,
      movieDetailId,
      userId,
      movieFolder,
    );

    const movieId = movie.identifiers[0].id;

    await this.createMovieGenreRelation(qr, movieId, genres);

    // const movie = await this.movieRepository.save({
    //   title: createMovieDto.title,
    //   detail: { detail: createMovieDto.detail },
    //   director,
    //   genres,
    // });

    // await qr.commitTransaction();
    // return await this.movieRepository.findOne({

    // 영상 옮기기
    await this.renameMovieFile(tempFolder, movieFolder, createMovieDto);

    return await qr.manager.findOne(Movie, {
      where: { id: movieId },
      relations: ['detail', 'director', 'genres'],
    });
    // } catch (e) {
    //   await qr.rollbackTransaction();
    //   throw e;
    // } finally {
    //   await qr.release();
    // }
  }

  /* istanbul ignore next */
  async updateMovie(
    qr: QueryRunner,
    movieUpdateFields: UpdateMovieDto,
    id: number,
  ) {
    return qr.manager
      .createQueryBuilder()
      .update(Movie)
      .set(movieUpdateFields)
      .where('id = :id', { id })
      .execute();
  }

  /* istanbul ignore next */
  async updateMovieDetail(qr: QueryRunner, detail: string, movie: Movie) {
    return qr.manager
      .createQueryBuilder()
      .update(MovieDetail)
      .set({ detail })
      .where('id = :id', { id: movie.detail.id })
      .execute();
  }

  /* istanbul ignore next */
  async updateMovieGenreRelation(
    qr: QueryRunner,
    id: number,
    newGenres: Genre[],
    movie: Movie,
  ) {
    return qr.manager
      .createQueryBuilder()
      .relation(Movie, 'genres')
      .of(id)
      .addAndRemove(
        // 추가와 삭제를 동시에 할 수 있음
        newGenres.map((genre) => genre.id), // 추가할 장르
        movie.genres.map((genre) => genre.id), // 삭제할 장르
      );
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const movie = await qr.manager.findOne(Movie, {
        where: { id },
        relations: ['detail', 'genres'],
      });
      if (!movie) {
        throw new NotFoundException('존재하지 않는 ID 값의 영화입니다.');
      }

      // 상세정보와 나머지 영화 정보를 분리
      const { detail, directorId, genreIds, ...movieRest } = updateMovieDto;

      let newDirector;

      if (directorId) {
        const director = await qr.manager.findOne(Director, {
          where: { id: directorId },
        });

        if (!director) {
          throw new NotFoundException('존재하지 않는 ID 값의 감독입니다.');
        }

        newDirector = director;
      }

      let newGenres;

      if (genreIds) {
        const genres = await qr.manager.find(Genre, {
          where: { id: In(genreIds) },
        });

        if (genres.length !== genreIds.length) {
          throw new NotFoundException(
            `존재하지 않는 ID 값의 장르가 들어있습니다. 존재하는 ids -> ${genres.map((g) => g.id).join(', ')}`,
          );
        }

        newGenres = genres;
      }

      const movieUpdateFields = {
        ...movieRest,
        ...(newDirector && { director: newDirector }),
      };

      // 영화 정보 업데이트
      await this.updateMovie(qr, updateMovieDto, id);

      // await this.movieRepository.update({ id }, movieUpdateFields);

      // detail 정보가 있다면 업데이트
      if (detail) {
        await this.updateMovieDetail(qr, detail, movie);

        // await this.movieDetailRepository.update(
        //   { id: movie.detail.id },
        //   { detail },
        // );
      }

      if (newGenres) {
        await this.updateMovieGenreRelation(qr, id, newGenres, movie);
      }

      // const newMovie = await this.movieRepository.findOne({
      //   where: { id },
      //   relations: ['detail', 'director'],
      // });

      // if (!newMovie) {
      //   throw new NotFoundException('존재하지 않는 ID 값의 영화입니다.');
      // }

      // newMovie.genres = newGenres;

      // await this.movieRepository.save(newMovie);

      await qr.commitTransaction();
      return this.movieRepository.findOne({
        where: { id },
        relations: ['detail', 'director', 'genres'],
      });
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  /* istanbul ignore next */
  async deleteMovie(id: number) {
    return this.movieRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id })
      .execute();
  }

  async remove(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['detail'],
    });
    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID 값의 영화입니다.');
    }

    // 삭제를 할 때 FK 제약조건 때문에 순서 주의
    await this.deleteMovie(id);

    // await this.movieRepository.delete(id);
    await this.movieDetailRepository.delete(movie.detail.id);

    return { code: 200, message: '영화가 성공적으로 삭제되었습니다' };
  }

  /* istanbul ignore next */
  async getLikedRecord(movieId: number, userId: number) {
    return this.movieUserLikeRepository
      .createQueryBuilder('mul')
      .leftJoinAndSelect('mul.movie', 'movie')
      .leftJoinAndSelect('mul.user', 'user')
      .where('movie.id = :movieId', { movieId })
      .andWhere('user.id = :userId', { userId })
      .getOne();
  }

  async toggleMovieLike(movieId: number, userId: number, isLike: boolean) {
    const movie = await this.movieRepository.findOne({
      where: {
        id: movieId,
      },
    });

    if (!movie) {
      throw new BadRequestException(`존재하지 않는 영화입니다.`);
    }

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException(`존재하지 않는 사용자입니다`);
    }

    const likeRecord = await this.getLikedRecord(movieId, userId);

    if (likeRecord) {
      if (isLike === likeRecord.isLike) {
        await this.movieUserLikeRepository.delete({
          movie,
          user,
        });
      } else {
        await this.movieUserLikeRepository.update(
          {
            movie,
            user,
          },
          {
            isLike,
          },
        );
      }
    } else {
      await this.movieUserLikeRepository.save({
        movie,
        user,
        isLike,
      });
    }

    const result = await this.getLikedRecord(movieId, userId);

    return {
      isLike: result && result.isLike,
    };
  }
}
