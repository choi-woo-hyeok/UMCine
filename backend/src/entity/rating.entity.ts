import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BaseTimeEntity } from './base-time.entity';
import { Member } from './member.entity';

@Entity('rating')
export class Rating extends BaseTimeEntity {
  @PrimaryGeneratedColumn({
    name: 'rating_id',
    type: 'bigint',
  })
  ratingId: string;

  @Column({ name: 'member_id', type: 'bigint' })
  memberId: string;

  @ManyToOne(() => Member, { nullable: false })
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column({ name: 'movie_id', type: 'bigint' })
  movieId: string;

  @Column({ type: 'tinyint' })
  score: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;
}
