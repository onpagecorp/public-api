import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString
} from 'class-validator';
import { PageFromDto } from './page-from-dto';
import { RecipientDto } from './recipient-dto';
import { AttachmentShortDto } from './attachment-short-dto';

export enum PagePriority {
  HIGH = 'HIGH',
  LOW = 'LOW'
}

export class PageDto {
  @ApiProperty({
    description: 'Page ID',
    required: true
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Chat ID',
    required: true
  })
  @IsNumber()
  chatId: number;

  @ApiProperty({
    description: 'Sender',
    required: true,
    type: PageFromDto
  })
  from: PageFromDto;

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
  body: string;

  @ApiProperty({
    description: 'Priority',
    required: true,
    enum: PagePriority,
    enumName: 'PagePriority',
    default: PagePriority.HIGH
  })
  priority: PagePriority;

  @ApiProperty({
    description: 'Recipients',
    required: true,
    type: [RecipientDto]
  })
  recipients: RecipientDto[];

  @ApiProperty({
    description: 'Created at',
    required: true
  })
  @IsNotEmpty()
  @IsDate()
  created: string;

  @ApiProperty({
    description: 'Possible replies',
    required: false,
    type: [String]
  })
  @IsArray()
  replies: string[];

  @ApiProperty({
    description: 'Attachments',
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

  public static convertDbMessageToPageDto(
    message: any,
    attachmentsDto: AttachmentShortDto[],
    recipientsDto: RecipientDto[],
    pageFromDto: PageFromDto
  ): PageDto {
    return Object.assign(new PageDto(), {
      id: message.id,
      attachments: attachmentsDto,
      subject: message.subject,
      body: message.body,
      callbackUri: '',
      chatId: message.chatId || message.id,
      created: message.created,
      from: pageFromDto,
      priority: this.convertDbPriorityToPagePriority(message.priority),
      recipients: recipientsDto,
      replies: []
    });
  }

  /**
   * Converts a database priority value to a corresponding page priority enumeration.
   *
   * @param {number} priority - The priority value from the database.
   * @return {PagePriority} The corresponding PagePriority enumeration based on the database value.
   */
  private static convertDbPriorityToPagePriority(
    priority: number
  ): PagePriority {
    switch (priority) {
      case 2:
        return PagePriority.HIGH;
      case 1:
        return PagePriority.HIGH;
      case 0:
        return PagePriority.LOW;
      default:
        return PagePriority.HIGH;
    }
  }
}
