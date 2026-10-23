import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service.js';
import { LoginDto } from './auth/dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    const payload = { sub: user.id, email: user.email, role: user.role, teamId: user.teamId };
    const accessToken = await this.jwtService.signAsync(payload);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
      },
    };
  }
}
