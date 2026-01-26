import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '영화 제목',
    example: '겨울왕국',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '영화 상세 설명',
    example: '3시간 엄청 빨리감',
  })
  detail: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: '감독 ID',
    example: 1,
  })
  directorId: number;

  @IsArray()
  @IsNotEmpty()
  @IsNumber(
    {},
    {
      each: true,
    },
  )
  @Type(() => Number)
  @ApiProperty({
    description: '장르 ID 리스트',
    example: [1, 2, 3],
  })
  genreIds: number[];

  @IsString()
  @ApiProperty({
    description: '영화 파일 이름',
    example: 'fc13d715-d492-463d-a6cf-b909aae6fd14_1767539005480.mp4',
  })
  movieFileName: string;
}
