import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { CreateRatingDto } from '../dto/create-rating.dto';
import { UpdateRatingDto } from '../dto/update-rating.dto';
import { RatingService } from '../service/rating.service';
import { ApiResponse } from '../common/api-response';
import { AuthGuard } from '../guard/auth.guard';

@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  // 평점 등록
  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() request: Request, @Body() dto: CreateRatingDto) {
    const memberId = (request as Request & { memberId: number }).memberId;

    const ratingId = await this.ratingService.create(memberId, dto);

    return ApiResponse.success(
      'COMMON201',
      '평점 등록에 성공했습니다.',
      ratingId,
    );
  }

  // 평점 수정
  @Patch(':ratingId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Req() request: Request,
    @Param('ratingId', ParseIntPipe) ratingId: number,
    @Body() dto: UpdateRatingDto,
  ) {
    const memberId = (request as Request & { memberId: number }).memberId;

    await this.ratingService.update(ratingId, memberId, dto);

    return ApiResponse.success('COMMON200', '평점 수정에 성공했습니다.', null);
  }

  // 평점 삭제
  @Delete(':ratingId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async delete(
    @Req() request: Request,
    @Param('ratingId', ParseIntPipe) ratingId: number,
  ) {
    const memberId = (request as Request & { memberId: number }).memberId;

    await this.ratingService.delete(ratingId, memberId);

    return ApiResponse.success('COMMON200', '평점 삭제에 성공했습니다.', null);
  }
}
