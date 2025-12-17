import { PartialType } from '@nestjs/mapped-types';
import { CreateGenreDto } from './create-genre.dto';

export class UpdateGenreDto extends PartialType(CreateGenreDto) {
  // @IsNotEmpty()
  // @IsString()
  // @IsOptional()
  // name?: string;
}
