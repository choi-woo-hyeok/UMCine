import { Injectable, ConflictException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Member } from '../entity/member.entity';
import { Rating } from '../entity/rating.entity';

import { CreateMemberDto } from '../dto/create-member.dto';
import { CheckResponseDto } from '../dto/check-response.dto';
import { RatingResponseDto } from '../dto/rating-response.dto';

import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../exception/api.exception';
import { MemberInfoResponseDto } from '../dto/member-info-response.dto';
import { UpdateMeDto } from '../dto/update-me.dto';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
  ) {}

  // 5주차: 닉네임 중복 확인
  async checkNickname(nickname: string): Promise<CheckResponseDto> {
    const member = await this.memberRepository.findOne({
      where: { nickname },
    });

    return { available: member === null };
  }

  // 5주차: 이메일 중복 확인
  async checkEmail(email: string): Promise<CheckResponseDto> {
    const member = await this.memberRepository.findOne({
      where: { email },
    });

    return { available: member === null };
  }

  // 5주차: 회원별 평점 조회
  async getMemberRatings(memberId: string): Promise<RatingResponseDto[]> {
    const ratings = await this.ratingRepository.find({
      where: { memberId },
    });

    return ratings.map((rating) => RatingResponseDto.from(rating));
  }

  // 6주차: 회원가입
  async signUp(dto: CreateMemberDto) {
    const existingEmail = await this.memberRepository.findOne({
      where: { email: dto.email },
    });

    if (existingEmail) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    const existingNickname = await this.memberRepository.findOne({
      where: { nickname: dto.nickname },
    });

    if (existingNickname) {
      throw new ConflictException('이미 사용 중인 닉네임입니다.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      const member = this.memberRepository.create({
        email: dto.email,
        password: hashedPassword,
        nickname: dto.nickname,
      });

      const savedMember = await this.memberRepository.save(member);

      return {
        memberId: Number(savedMember.memberId),
        email: savedMember.email,
        nickname: savedMember.nickname,
      };
    } catch (error) {
      // 동시에 가입 요청이 들어와 UNIQUE 제약을 위반한 경우
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('이미 사용 중인 이메일 또는 닉네임입니다.');
      }

      throw error;
    }
  }

  async getMyInfo(memberId: string): Promise<MemberInfoResponseDto> {
    const member = await this.memberRepository.findOne({
      where: { memberId },
    });

    if (!member) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'MEMBER404_1',
        '해당 회원을 찾을 수 없습니다.',
      );
    }

    return MemberInfoResponseDto.from(member);
  }
  async updateMe(memberId: string, dto: UpdateMeDto): Promise<MemberInfoResponseDto> {
    const member = await this.memberRepository.findOne({where:{memberId}});
    if (!member) throw new ApiException(HttpStatus.NOT_FOUND,'MEMBER404_1','회원을 찾을 수 없습니다.');
    const existing = await this.memberRepository.findOne({where:{nickname:dto.nickname}});
    if(existing && existing.memberId !== member.memberId) throw new ConflictException('이미 사용 중인 닉네임입니다.');
    member.nickname = dto.nickname;
    await this.memberRepository.save(member);
    return MemberInfoResponseDto.from(member);
  }

}
