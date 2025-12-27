import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  detail: string;

  @IsNotEmpty()
  @IsNumber()
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
  genreIds: number[];

  @IsString()
  movieFileName: string;
}
