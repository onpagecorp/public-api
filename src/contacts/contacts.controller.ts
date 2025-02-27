import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
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
  ApiBody,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';
import { Request } from 'express';
import { Constants } from '../constants';
import { ContactsDto } from '../dto/contacts-dto';
import { ContactCreateDto } from '../dto/contact-create-dto';
import {
  EntityConflictError,
  InternalServerError
} from '../custom-error/custom-error';
import { ContactCreateResponseDto } from '../dto/contact-create-response-dto';

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
    name: 'nextPageToken',
    required: false,
    type: String,
    default: Constants.API_DEFAULT_NEXT_PAGE_TOKEN
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
      'nextPageToken',
      new DefaultValuePipe(Constants.API_DEFAULT_NEXT_PAGE_TOKEN)
    )
    nextPageToken?: string,
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
      nextPageToken,
      limit
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Create new contact'
  })
  @ApiBody({ type: ContactCreateDto, description: 'Contact data' })
  @HttpCode(201)
  @ApiOkResponse({ type: ContactCreateResponseDto })
  @ApiConflictResponse({ description: 'Contact already exists' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @Version('1')
  async createContactV1(
    @Req() request: Request,
    @Body() contactCreateDto: ContactCreateDto
  ): Promise<ContactCreateResponseDto> {
    try {
      const id = await this.contactsService.createContactV1(
        request['auth-enterprise-id'],
        contactCreateDto
      );

      return { contact: { id } };
    } catch (e) {
      this.logger.error('Failed to create contact', e.stack);
      if (e instanceof EntityConflictError) {
        throw new HttpException({ message: e.message }, HttpStatus.CONFLICT);
      } else if (e instanceof InternalServerError) {
        throw new HttpException(
          { message: e.message },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      } else {
        throw new HttpException(
          { statusCode: 500, message: 'Internal server error' },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
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
