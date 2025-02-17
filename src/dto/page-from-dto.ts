import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export enum PageFromType {
  EMAIL = 'EMAIL',
  DISPATCHER = 'DISPATCHER',
  ONPAGE = 'ONPAGE',
  WEB = 'WEB',
  ACCOUNT = 'ACCOUNT',
  API = 'API',
  PHONE = 'PHONE',
  WCTP = 'WCTP',
  SNPP = 'SNPP'
}

export class PageFromDto {
  @ApiProperty({
    description: 'Type',
    required: true,
    enum: PageFromType
  })
  type: PageFromType;

  @ApiProperty({
    description: 'Caption',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  caption: string;

  @ApiProperty({
    description: 'Value',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  value: string | number;
}
