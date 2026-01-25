# Netflix Clone Backend API

NestJS 기반의 Netflix 클론 백엔드 API 프로젝트입니다.  
영화, 감독, 장르, 사용자 관리 및 인증 기능을 제공합니다.

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | NestJS v11, TypeScript |
| Database | PostgreSQL, TypeORM |
| 인증 | Passport (JWT, Local Strategy), bcrypt |
| 캐싱 | @nestjs/cache-manager |
| 로깅 | Winston (nest-winston) |
| API 문서 | Swagger (@nestjs/swagger) |
| 유효성 검사 | class-validator, class-transformer, Joi |
| 스케줄링 | @nestjs/schedule |
| 테스트 | Jest, Supertest |

## 프로젝트 구조

```
src/
├── main.ts                    # 애플리케이션 진입점 (Swagger 설정 포함)
├── app.module.ts              # 루트 모듈 (전역 설정, 미들웨어, 가드, 인터셉터)
│
├── auth/                      # 인증 모듈
│   ├── auth.controller.ts     # 로그인, 회원가입, 토큰 관리 API
│   ├── auth.service.ts        # 인증 로직 (토큰 발급, 검증)
│   ├── decorator/             # @Public, @RBAC 커스텀 데코레이터
│   ├── guard/                 # AuthGuard, RBACGuard
│   ├── middleware/            # BearerTokenMiddleware
│   └── strategy/              # JWT, Local Passport 전략
│
├── user/                      # 사용자 모듈
│   ├── user.controller.ts     # 사용자 CRUD API
│   ├── user.service.ts        # 사용자 비즈니스 로직
│   ├── dto/                   # CreateUserDto, UpdateUserDto
│   ├── entities/              # User 엔티티 (Role enum 포함)
│   └── decorator/             # @UserId 커스텀 데코레이터
│
├── movie/                     # 영화 모듈
│   ├── movie.controller.ts    # 영화 CRUD, 좋아요/싫어요 API
│   ├── movie.service.ts       # 영화 비즈니스 로직
│   ├── dto/                   # CreateMovieDto, UpdateMovieDto, GetMoviesDto
│   ├── entity/                # Movie, MovieDetail, MovieUserLike 엔티티
│   └── pipe/                  # MovieTitleValidationPipe, MovieFilePipe
│
├── director/                  # 감독 모듈
│   ├── director.controller.ts # 감독 CRUD API
│   ├── director.service.ts    # 감독 비즈니스 로직
│   ├── dto/                   # CreateDirectorDto, UpdateDirectorDto
│   └── entitie/               # Director 엔티티
│
├── genre/                     # 장르 모듈
│   ├── genre.controller.ts    # 장르 CRUD API
│   ├── genre.service.ts       # 장르 비즈니스 로직
│   ├── dto/                   # CreateGenreDto, UpdateGenreDto
│   └── entities/              # Genre 엔티티
│
└── common/                    # 공통 모듈
    ├── const/                 # 환경변수 키 상수
    ├── decorator/             # @QueryRunner, @Throttle 데코레이터
    ├── dto/                   # CursorPaginationDto 등 공통 DTO
    ├── entity/                # BaseEntity (공통 필드)
    ├── filter/                # QueryFailedExceptionFilter 등 예외 필터
    ├── interceptor/           # TransactionInterceptor, ThrottleInterceptor, ResponseTimeInterceptor
    ├── logger/                # Winston 로거 설정
    └── tasks.service.ts       # 스케줄 태스크 서비스
```

## API 엔드포인트

### Auth (인증)
| Method | Endpoint | 설명 | 접근 권한 |
|--------|----------|------|----------|
| POST | `/auth/register` | 회원가입 | Public |
| POST | `/auth/login` | 로그인 | Public |
| POST | `/auth/token/access` | Access Token 재발급 | 인증 필요 |
| POST | `/auth/token/block` | 토큰 블록 | 인증 필요 |
| POST | `/auth/login/passport` | Passport 로그인 | Public |
| GET | `/auth/private` | 인증 테스트 | 인증 필요 |

### User (사용자)
| Method | Endpoint | 설명 | 접근 권한 |
|--------|----------|------|----------|
| POST | `/user` | 사용자 생성 | 인증 필요 |
| GET | `/user` | 전체 사용자 조회 | 인증 필요 |
| GET | `/user/:id` | 특정 사용자 조회 | 인증 필요 |
| PATCH | `/user/:id` | 사용자 정보 수정 | 인증 필요 |
| DELETE | `/user/:id` | 사용자 삭제 | 인증 필요 |

### Movie (영화)
| Method | Endpoint | 설명 | 접근 권한 |
|--------|----------|------|----------|
| GET | `/movie` | 영화 목록 조회 (페이지네이션) | Public |
| GET | `/movie/recent` | 최근 영화 조회 (캐시 적용) | 인증 필요 |
| GET | `/movie/:id` | 특정 영화 조회 | Public |
| POST | `/movie` | 영화 생성 | Admin |
| PATCH | `/movie/:id` | 영화 수정 | Admin |
| DELETE | `/movie/:id` | 영화 삭제 | Admin |
| POST | `/movie/:id/like` | 영화 좋아요 | 인증 필요 |
| POST | `/movie/:id/dislike` | 영화 싫어요 | 인증 필요 |

### Director (감독)
| Method | Endpoint | 설명 | 접근 권한 |
|--------|----------|------|----------|
| POST | `/director` | 감독 생성 | 인증 필요 |
| GET | `/director` | 전체 감독 조회 | 인증 필요 |
| GET | `/director/:id` | 특정 감독 조회 | 인증 필요 |
| PATCH | `/director/:id` | 감독 정보 수정 | 인증 필요 |
| DELETE | `/director/:id` | 감독 삭제 | 인증 필요 |

### Genre (장르)
| Method | Endpoint | 설명 | 접근 권한 |
|--------|----------|------|----------|
| POST | `/genre` | 장르 생성 | 인증 필요 |
| GET | `/genre` | 전체 장르 조회 | 인증 필요 |
| GET | `/genre/:id` | 특정 장르 조회 | 인증 필요 |
| PATCH | `/genre/:id` | 장르 정보 수정 | 인증 필요 |
| DELETE | `/genre/:id` | 장르 삭제 | 인증 필요 |

## 주요 기능

### 🔐 인증 및 권한
- **JWT 기반 인증**: Access Token / Refresh Token 방식
- **RBAC (Role-Based Access Control)**: Admin, User 역할 기반 권한 관리
- **Passport 통합**: Local Strategy, JWT Strategy

### 🎬 영화 관리
- 영화 CRUD 기능
- 영화 상세 정보 (MovieDetail) 관리
- 좋아요/싫어요 토글 기능 (MovieUserLike)
- 정렬, 필터링, 커서 기반 페이지네이션

### ⚡ 성능 최적화
- **캐싱**: @nestjs/cache-manager를 활용한 응답 캐싱
- **Throttling**: 요청 제한 (Rate Limiting)
- **트랜잭션 인터셉터**: 데이터 무결성 보장

### 📝 로깅
- **Winston**: 콘솔 및 파일 로그 기록 (`logs/logs.log`)
- **응답 시간 측정**: ResponseTimeInterceptor

### 📄 API 문서
- **Swagger UI**: `/doc` 경로에서 API 문서 확인 가능

## 환경 변수

프로젝트 실행을 위해 다음 환경 변수를 설정해야 합니다:

```env
ENV=dev                        # dev | prod
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=netflix
HASH_ROUNDS=10
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
```

## 설치 및 실행

### 의존성 설치
```bash
pnpm install
```

### 개발 모드 실행
```bash
pnpm run start:dev
```

### 프로덕션 빌드
```bash
pnpm run build
pnpm run start:prod
```

### 테스트 실행
```bash
# 단위 테스트
pnpm run test

# E2E 테스트
pnpm run test:e2e

# 테스트 커버리지
pnpm run test:cov
```

## 정적 파일 서빙

`public/` 폴더의 파일들은 `/public/` 경로로 접근 가능합니다.
- 예: `public/movie/example.mp4` → `http://localhost:3000/public/movie/example.mp4`

## 라이선스

UNLICENSED
