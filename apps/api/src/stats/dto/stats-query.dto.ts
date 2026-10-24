import { IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class StatsQueryDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
