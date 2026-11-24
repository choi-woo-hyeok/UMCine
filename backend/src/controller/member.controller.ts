import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { MemberService } from '../service/member.service';
import { CreateMemberDto } from '../dto/create-member.dto';
import { ApiResponse } from '../common/api-response';
import { AuthGuard } from '../guard/auth.guard';
import { UpdateMeDto } from '../dto/update-me.dto';

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  // 7주차: 내 정보 조회
  @Get('me')
  @UseGuards(AuthGuard)
  async getMyInfo(@Req() request: Request) {
    const memberId = String(
      (request as Request & { memberId: number }).memberId,
    );

    const result = await this.memberService.getMyInfo(memberId);

    return ApiResponse.success(
      'COMMON200',
      '회원 정보를 조회했습니다.',
      result,
    );
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMe(@Req() request: Request, @Body() dto: UpdateMeDto) {
    const memberId = String((request as Request & {memberId:number}).memberId);
    const result = await this.memberService.updateMe(memberId, dto);
    return ApiResponse.success('COMMON200', '내 정보를 수정했습니다.', result);
  }

  // 5주차: 닉네임 중복 체크
  @Get('nickname/:nickname')
  checkNickname(@Param('nickname') nickname: string) {
    return this.memberService.checkNickname(nickname);
  }

  // 5주차: 이메일 중복 체크
  @Get('email/:email')
  checkEmail(@Param('email') email: string) {
    return this.memberService.checkEmail(email);
  }

  // 5주차: 회원별 평점 조회
  @Get(':memberId/ratings')
  getMemberRatings(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.memberService.getMemberRatings(String(memberId));
  }

  // 6주차: 회원가입
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() dto: CreateMemberDto) {
    const result = await this.memberService.signUp(dto);

    return ApiResponse.success('COMMON201', '회원가입에 성공했습니다.', result);
  }
}
