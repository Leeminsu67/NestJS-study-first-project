import { IsOptional, IsString } from 'class-validator';
import { PagePaginationDto } from 'src/common/dot/page-pagination.dto';

export class GetMoviesDto extends PagePaginationDto {
  @IsString()
  @IsOptional()
  title: string;
}
