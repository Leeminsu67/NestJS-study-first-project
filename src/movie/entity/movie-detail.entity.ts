import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTable } from './base-table.entity';
import { Movie } from './movie.emtity';

@Entity()
export class MovieDetail extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  detail: string;

  // Relation
  @OneToOne(() => Movie)
  movie: Movie;
}
