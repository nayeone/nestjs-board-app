import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { ExtractJwt } from 'passport-jwt';
import * as config from 'config';
import process from 'process';

const jwtConfig = config.get('jwt');

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    // payload 안의 username을 통해 userRepository에서 가져올 것이기 때문에
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {
    super({
      secretKey: process.env.JWT_SECRET || jwtConfig.secret, // 토큰의 유효성 확인 위해서!
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // BearerToken 타입!
    });
  }

  async validate(payload) {
    const { username } = payload;
    const user: User = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
