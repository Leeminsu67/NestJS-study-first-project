import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTable } from './base-table.entity';
import { MovieDetail } from './movie-detail.entity';

// ManyTo One Director 감독을 여러개의 영화를 만들 수 있음
// OneToOne MovieDetail 영화의 상세정보는 하나의 상세정보만 가질 수 있음
// ManyToMany Genre 영화는 여러 장르를 가질 수 있고, 장르는 여러 영화에 속할 수 있음

// Ingeritance 방식
@Entity()
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  genre: string;

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.id, {
    cascade: true,
  })
  @JoinColumn()
  detail: MovieDetail;

  // Embedding 방식
  // @Column(() => BaseTable)
  // base: BaseTable;
}
