import { Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

export class LocalAuthGuard extends AuthGuard('mingdev') {}

@Injectable()
// Strategy 뒤에 문자열을 주면 해당 값으로 가드안에서 불러올 수 있다
export class LocalStrategy extends PassportStrategy(Strategy, 'mingdev') {
  constructor(private readonly auService: AuthService) {
    // 원래 username이라고 아이디를 보내야하는데 키값을 변경할 수 있는 기능
    super({
      usernameField: 'email',
    });
  }

  /**
   * LocalStrategy
   *
   * validate: username, password
   *
   * return -> Request();
   */
  async validate(email: string, password: string) {
    const user = await this.auService.authenticate(email, password);

    return user;
  }
}
