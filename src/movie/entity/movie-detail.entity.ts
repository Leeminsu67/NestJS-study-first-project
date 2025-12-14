import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Movie } from './movie.emtity';

@Entity()
export class MovieDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  detail: string;

  // Relation
  @OneToOne(() => Movie, (movie) => movie.id)
  movie: Movie;
}
