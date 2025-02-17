import {
  Controller,
  DefaultValuePipe,
  Get,
  Logger,
  ParseIntPipe,
  Query,
  Req,
  Version
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';
import { ContactsStatusDto } from '../dto/contacts-status-dto';
import { Constants } from '../constants';
import { Request } from 'express';
import { ContactsStatusService } from './contacts-status.service';

@ApiBearerAuth()
@ApiTags('Contacts')
@Controller('/')
export class ContactsStatusController {
  private readonly logger = new Logger(ContactsStatusController.name);

  constructor(private readonly contactsStatusService: ContactsStatusService) {}

  @Get('contacts-status')
  @ApiOperation({
    summary: 'Get list of contacts by status',
    tags: ['Contacts']
  })
  @ApiOkResponse({ type: ContactsStatusDto })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    example: Constants.API_DEFAULT_OFFSET,
    default: Constants.API_DEFAULT_OFFSET
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: Constants.API_DEFAULT_LIMIT,
    default: Constants.API_DEFAULT_LIMIT
  })
  @Version('1')
  async getContactsStatusV1(
    @Req() request: Request,
    @Query('search') search?: string,
    @Query(
      'offset',
      new DefaultValuePipe(Constants.API_DEFAULT_OFFSET),
      new ParseIntPipe()
    )
    offset?: number,
    @Query(
      'limit',
      new DefaultValuePipe(Constants.API_DEFAULT_LIMIT),
      new ParseIntPipe()
    )
    limit?: number
  ): Promise<ContactsStatusDto> {
    return await this.contactsStatusService.getAccountsStatusV1(
      request['auth-enterprise-id'],
      search,
      offset,
      limit
    );
  }
}
