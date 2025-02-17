import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  Req,
  Version
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';
import { AdministratorsDto } from '../dto/administrators-dto';
import { Constants } from '../constants';
import { Request } from 'express';
import { AdministratorsService } from './administrators.service';
import { DispatcherDto } from '../dto/dispatcher-dto';

@ApiBearerAuth()
@ApiTags('Administrators')
@Controller({
  path: '/administrators',
  version: '1'
})
export class AdministratorsController {
  constructor(private readonly administratorsService: AdministratorsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get list of administrators'
  })
  @ApiOkResponse({ type: AdministratorsDto })
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
  ): Promise<AdministratorsDto> {
    return await this.administratorsService.findAllActive(
      request['auth-enterprise-id'],
      search,
      offset,
      limit
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get administrator by ID'
  })
  @ApiOkResponse({ type: DispatcherDto })
  @ApiNoContentResponse({ description: 'Template deleted successfully' })
  @ApiNotFoundResponse({ description: 'Template requested not found' })
  @HttpCode(204)
  @Version('1')
  async getContactV1(
    @Param('id') id: number,
    @Req() request: Request
  ): Promise<DispatcherDto> {
    const administratorDto = await this.administratorsService.getDispatcherById(
      request['auth-enterprise-id'],
      id
    );

    if (!administratorDto) {
      throw new NotFoundException();
    }
    return administratorDto;
  }
}
