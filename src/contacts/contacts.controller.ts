import {
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Logger,
  NotFoundException,
  NotImplementedException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Version
} from '@nestjs/common';
import { ContactDto } from '../dto/contact-dto';
import { ContactsService } from './contacts.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';
import { Request } from 'express';
import { Constants } from '../constants';
import { ContactsDto } from '../dto/contacts-dto';

@ApiBearerAuth()
@ApiTags('Contacts')
@Controller({
  path: '/contacts',
  version: '1'
})
export class ContactsController {
  private readonly logger = new Logger(ContactsController.name);

  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get list of contacts'
  })
  @ApiOkResponse({ type: ContactsDto })
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
  async getContactsV1(
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
  ): Promise<ContactsDto> {
    return await this.contactsService.findAllActive(
      request['auth-enterprise-id'],
      search,
      offset,
      limit
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Create new contact'
  })
  createContact(): string {
    throw new NotImplementedException();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get contact by ID'
  })
  @ApiOkResponse({ type: ContactDto })
  @Version('1')
  async getContactV1(
    @Param('id') id: number,
    @Req() request: Request
  ): Promise<ContactDto> {
    const contactDto = await this.contactsService.getAccountById(
      request['auth-enterprise-id'],
      id
    );

    if (!contactDto) {
      throw new NotFoundException();
    }
    return contactDto;
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a contact'
  })
  @Version('1')
  updateContactV1(@Param('id') id: number): string {
    throw new NotImplementedException();
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a contact'
  })
  deleteContactV1(@Param() id: number): string {
    throw new NotImplementedException();
  }
}
