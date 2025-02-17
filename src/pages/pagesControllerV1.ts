import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Logger,
  NotFoundException,
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
import { PagesService } from './pages.service';
import { PagesListDto } from '../dto/pages-list-dto';
import { PageDto } from '../dto/page-dto';
import { PageSendDto } from '../dto/page-send-dto';
import { ContactDto } from '../dto/contact-dto';

@ApiBearerAuth()
@ApiTags('Pages')
@Controller({
  path: '/pages',
  version: '1'
})
export class PagesControllerV1 {
  private readonly logger = new Logger(PagesControllerV1.name);

  constructor(private readonly pagesService: PagesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get list of pages'
  })
  @ApiOkResponse({ type: PagesListDto })
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
  ): Promise<PagesListDto> {
    return await this.pagesService.findAllPagesByDispatcherId(
      request['auth-enterprise-id'],
      request['auth-dispatcher-id'],
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
    return await this.pagesService.sendPage(
      request['auth-enterprise-id'],
      page
    );
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

    const pageDto = await this.pagesService.getPageById(
      request['auth-enterprise-id'],
      id
    );

    if (!pageDto) {
      throw new NotFoundException();
    }

    return pageDto;
  }
}
