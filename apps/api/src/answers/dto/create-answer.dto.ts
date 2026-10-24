import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Technique, Verdict } from '@prisma/client';

export class HighlightDto {
  @IsInt()
  @Min(0)
  start: number;

  @IsInt()
  @Min(0)
  end: number;
}

export class CreateAnswerDto {
  @IsString()
  @MinLength(1)
  contentId: string;

  @IsEnum(Verdict)
  verdict: Verdict;

  @IsEnum(Technique)
  technique: Technique;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  explanation: string;

  @IsArray()
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => HighlightDto)
  highlights: HighlightDto[] = [];
}
