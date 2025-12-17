import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateMovieDto } from './create-movie.dto';
import { PartialType } from '@nestjs/mapped-types';

// PartialType이 CreateMovieDto에 있는 것을 다 옵셔널로 바꿔준다
export class UpdateMovieDto extends PartialType(CreateMovieDto) {
  // @IsNotEmpty()
  // @IsString()
  // @IsOptional()
  // title?: string;
  // @IsNotEmpty()
  // @IsString()
  // @IsOptional()
  // detail?: string;
  // @IsNotEmpty()
  // @IsNumber()
  // @IsOptional()
  // directorId?: number;
  // @IsArray()
  // @ArrayNotEmpty()
  // @IsNumber(
  //   {},
  //   {
  //     each: true,
  //   },
  // )
  // @IsOptional()
  // genreIds?: number[];
}
