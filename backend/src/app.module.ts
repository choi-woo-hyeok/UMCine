import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { Member } from './entity/member.entity';
import { Rating } from './entity/rating.entity';
import { Favorite } from './entity/favorite.entity';

import { MemberController } from './controller/member.controller';
import { RatingController } from './controller/rating.controller';
import { AuthController } from './controller/auth.controller';
import { FavoriteController } from './controller/favorite.controller';
import { MovieRecordController } from './controller/movie-record.controller';

import { MemberService } from './service/member.service';
import { RatingService } from './service/rating.service';
import { AuthService } from './service/auth.service';
import { FavoriteService } from './service/favorite.service';
import { MovieRecordService } from './service/movie-record.service';

import { AuthGuard } from './guard/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<string>('DB_PORT')),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Member, Rating, Favorite],
        synchronize: false,
      }),
    }),

    TypeOrmModule.forFeature([Member, Rating, Favorite]),

    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');

        if (!secret) {
          throw new Error('JWT_SECRET 환경변수가 없습니다.');
        }

        return {
          secret,
          signOptions: {
            expiresIn: Number(
              configService.get<string>('JWT_ACCESS_EXPIRATION') ?? 3600,
            ),
          },
        };
      },
    }),
  ],

  controllers: [
    MemberController,
    RatingController,
    AuthController,
    FavoriteController,
    MovieRecordController,
  ],

  providers: [
    MemberService,
    RatingService,
    AuthService,
    AuthGuard,
    FavoriteService,
    MovieRecordService,
  ],
})
export class AppModule {}
