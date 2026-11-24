import { Member } from '../entity/member.entity';

export class MemberInfoResponseDto {
  memberId: number;
  email: string;
  nickname: string;
  createdAt: Date;

  static from(member: Member): MemberInfoResponseDto {
    return {
      memberId: Number(member.memberId),
      email: member.email,
      nickname: member.nickname,
      createdAt: member.createdAt,
    };
  }
}
