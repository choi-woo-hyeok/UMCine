import { IsString, Length } from 'class-validator';
export class UpdateMeDto {
 @IsString() @Length(2,12) nickname: string;
}
