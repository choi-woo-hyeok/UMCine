import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { Member } from '../entity/member.entity';
import { Rating } from '../entity/rating.entity';

import { CreateRatingDto } from '../dto/create-rating.dto';
import { UpdateRatingDto } from '../dto/update-rating.dto';
import { RatingResponseDto } from '../dto/rating-response.dto';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
  ) {}

  // 회원별 평점 조회
  async getRatingsByMember(memberId: number) {
    const ratings = await this.ratingRepository.find({
      where: { memberId: String(memberId) },
    });

    return ratings.map((rating) => RatingResponseDto.from(rating));
  }

  // 평점 등록
  async create(memberId: number, dto: CreateRatingDto) {
    const member = await this.memberRepository.findOne({
      where: { memberId: String(memberId) },
    });

    if (!member) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    const existing = await this.ratingRepository.findOne({
      where: {
        memberId: String(memberId),
        movieId: String(dto.movieId),
      },
    });

    if (existing) {
      throw new ConflictException('이미 이 영화에 평점을 남기셨습니다.');
    }

    const rating = this.ratingRepository.create({
      member,
      movieId: String(dto.movieId),
      score: dto.score,
      comment: dto.comment ?? null,
    });

    try {
      const saved = await this.ratingRepository.save(rating);
      return Number(saved.ratingId);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('이미 이 영화에 평점을 남기셨습니다.');
      }

      throw error;
    }
  }

  // 평점 수정
  async update(ratingId: number, memberId: number, dto: UpdateRatingDto) {
    const rating = await this.findOwnedRating(ratingId, memberId);

    rating.score = dto.score;

    if (dto.comment !== undefined) {
      rating.comment = dto.comment;
    }

    await this.ratingRepository.save(rating);
  }

  // 평점 삭제
  async delete(ratingId: number, memberId: number) {
    const rating = await this.findOwnedRating(ratingId, memberId);

    await this.ratingRepository.remove(rating);
  }

  // 평점 소유자 확인
  private async findOwnedRating(
    ratingId: number,
    memberId: number,
  ): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({
      where: { ratingId: String(ratingId) },
      relations: { member: true },
    });

    if (!rating) {
      throw new NotFoundException('존재하지 않는 평점입니다.');
    }

    if (String(rating.member.memberId) !== String(memberId)) {
      throw new ForbiddenException(
        '본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.',
      );
    }

    return rating;
  }
}
