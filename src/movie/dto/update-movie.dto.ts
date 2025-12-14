import { IsNotEmpty, IsOptional } from 'class-validator';

enum MovieGenre {
  ACTION = 'action',
  FANTASY = 'fantasy',
}
export class UpdateMovieDto {
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsNotEmpty()
  @IsOptional()
  genre?: string;

  @IsNotEmpty()
  @IsOptional()
  detail?: string;
}
