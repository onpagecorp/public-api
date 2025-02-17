import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Logger,
  NotImplementedException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Version
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';
import { Constants } from '../constants';
import { Request } from 'express';
import { PageSendDto } from '../dto/page-send-dto';
import { PageDto } from '../dto/page-dto';
import { ContactDto } from '../dto/contact-dto';
import { ContactsService } from '../contacts/contacts.service';
import { ContactGroupsDto } from '../dto/contact-groups-dto';

@Controller('contacts-groups')
@ApiBearerAuth()
@ApiTags('Contacts')
@Controller({
  path: '/contact-groups',
  version: '1'
})
export class ContactGroupsControllerV1 {
  private readonly logger = new Logger(ContactGroupsControllerV1.name);

  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @ApiOperation({
    summary: "Get list of contact's groups"
  })
  @ApiOkResponse({ type: ContactGroupsDto })
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
  async getPagesV1(
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
  ): Promise<ContactGroupsDto> {
    return await this.contactsService.getListOfGroupsEnterpriseId(
      request['auth-enterprise-id'],
      search,
      offset,
      limit
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Send page'
  })
  @ApiBody({ type: PageSendDto, description: 'send Page DTO' })
  @ApiOkResponse({ type: PageDto })
  @Version('1')
  async sendPagesV1(
    @Req() request: Request,
    @Body() page: PageSendDto
  ): Promise<PageDto> {
    // return await this.contactsService.sendPage(
    //   request['auth-enterprise-id'],
    //   page
    // );

    throw new NotImplementedException();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Page by ID'
  })
  @ApiOkResponse({ type: ContactDto })
  @Version('1')
  async getPageByIdV1(
    @Param('id') id: number,
    @Req() request: Request
  ): Promise<PageDto> {
    throw new NotImplementedException();

    /*
    const pageDto = await this.contactsService.getPageById(
      request['auth-enterprise-id'],
      id
    );

    if (!pageDto) {
      throw new NotFoundException();
    }

    return pageDto;
  }

     */

    throw new NotImplementedException();
  }
}
