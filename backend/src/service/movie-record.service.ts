import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { CreateMovieRecordDto } from '../dto/create-movie-record.dto';
import { FavoriteResponseDto } from '../dto/favorite-response.dto';
import { MovieRecordResponseDto } from '../dto/movie-record-response.dto';
import { RatingResponseDto } from '../dto/rating-response.dto';

import { Favorite } from '../entity/favorite.entity';
import { Member } from '../entity/member.entity';
import { Rating } from '../entity/rating.entity';

import { ApiException } from '../exception/api.exception';

@Injectable()
export class MovieRecordService {
  constructor(private readonly dataSource: DataSource) {}

  // 평점과 즐겨찾기를 하나의 트랜잭션으로 저장
  async create(
    memberId: number,
    dto: CreateMovieRecordDto,
  ): Promise<MovieRecordResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      // 트랜잭션용 Repository 생성
      const memberRepository = manager.getRepository(Member);
      const ratingRepository = manager.getRepository(Rating);
      const favoriteRepository = manager.getRepository(Favorite);

      // 회원 조회
      const member = await memberRepository.findOneBy({
        memberId: String(memberId),
      });

      if (!member) {
        throw new ApiException(
          HttpStatus.NOT_FOUND,
          'MEMBER404_1',
          '해당 회원을 찾을 수 없습니다.',
        );
      }

      // 이미 평점을 등록한 영화인지 확인
      const existingRating = await ratingRepository.findOne({
        where: {
          member: {
            memberId: String(memberId),
          },
          movieId: String(dto.movieId),
        },
      });

      if (existingRating) {
        throw new ApiException(
          HttpStatus.CONFLICT,
          'RATING409_1',
          '이미 이 영화에 평점을 남기셨습니다.',
        );
      }

      // 즐겨찾기 중복 확인
      if (dto.addToFavorites) {
        const existingFavorite = await favoriteRepository.findOne({
          where: {
            member: {
              memberId: String(memberId),
            },
            movieId: dto.movieId,
          },
        });

        if (existingFavorite) {
          throw new ApiException(
            HttpStatus.CONFLICT,
            'FAVORITE409_1',
            '이미 이 영화를 즐겨찾기하셨습니다.',
          );
        }
      }

      // 평점 저장
      const rating = ratingRepository.create({
        member,
        memberId: String(memberId),
        movieId: String(dto.movieId),
        score: dto.score,
        comment: dto.comment ?? null,
      });

      const savedRating = await ratingRepository.save(rating);

      // 즐겨찾기 저장
      let favoriteResponse: FavoriteResponseDto | null = null;

      if (dto.addToFavorites) {
        const favorite = favoriteRepository.create({
          member,
          movieId: dto.movieId,
        });

        const savedFavorite = await favoriteRepository.save(favorite);

        favoriteResponse = FavoriteResponseDto.from(savedFavorite);
      }

      // 평점과 즐겨찾기 결과 반환
      return MovieRecordResponseDto.of(
        RatingResponseDto.from(savedRating),
        favoriteResponse,
      );
    });
  }
}
