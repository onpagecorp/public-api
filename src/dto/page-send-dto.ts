import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export enum PagePriority {
  HIGH = 'HIGH',
  LOW = 'LOW'
}

export class PageSendDto {
  @ApiProperty({
    description: 'Chat ID',
    required: true
  })
  @IsNumber()
  chatId?: number;

  @ApiProperty({
    description: 'Subject',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    description: 'Body',
    required: false
  })
  @IsString()
  @IsNotEmpty()
  body?: string;

  @ApiProperty({
    description: 'Priority',
    required: true,
    enum: PagePriority,
    enumName: 'PagePriority',
    default: PagePriority.HIGH
  })
  priority: PagePriority;

  @ApiProperty({
    description: "Recipients' OPIDs",
    required: true,
    type: [String]
  })
  recipients: string[];

  @ApiProperty({
    description: 'Possible replies',
    required: false,
    type: [String]
  })
  @IsArray()
  replies: string[];

  @ApiProperty({
    description: "Attachments ID's list",
    required: false,
    type: [String]
  })
  attachments: string[];

  @ApiProperty({
    description: 'Callback URI',
    required: false,
    type: String
  })
  @IsString()
  callbackUri: string;
}
