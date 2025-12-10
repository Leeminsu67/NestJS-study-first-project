import { Injectable, NotFoundException } from '@nestjs/common';

// 로직에 대한부분을 service에 작성한다.

export interface Movie {
  id: number;
  title: string;
}

@Injectable()
export class AppService {
  private movies: Movie[] = [
    {
      id: 1,
      title: '해리포터',
    },
    {
      id: 2,
      title: '반지의제왕',
    },
  ];
  private idCounter = 3;

  getManyMovies(title?: string) {
    if (!title) {
      return this.movies;
    }

    // return this.movies.filter((m) => m.title === title);
    return this.movies.filter((m) => m.title.startsWith(title));
  }

  getMovieById(id: number) {
    // id 앞에 + 붙이면 string -> number 변환(단항 연산자)
    const movie = this.movies.find((m) => m.id === +id);

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID 값의 영화입니다.');
    }
    return movie;
  }

  createMovie(title: string) {
    const movie: Movie = {
      id: this.idCounter++,
      title: title,
    };

    this.movies.push(movie);
    return movie;
  }

  updateMovie(id: number, title: string) {
    const movie = this.movies.find((m) => m.id === +id);
    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID 값의 영화입니다.');
    }

    // 가지고 온 오브젝트의 값들을 덮어씌울 수 있음
    Object.assign(movie, { title });

    return movie;
  }

  deleteMovie(id: number) {
    const movieIndex = this.movies.findIndex((m) => m.id === +id);
    if (!movieIndex) {
      throw new NotFoundException('존재하지 않는 ID 값의 영화입니다.');
    }

    this.movies.splice(movieIndex, 1);
    return id;
  }
}
