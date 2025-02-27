import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Version
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';
import { AdministratorsDto } from '../dto/administrators-dto';
import { Constants } from '../constants';
import { Request } from 'express';
import { AdministratorsService } from './administrators.service';
import { AdministratorDto } from '../dto/administrator-dto';
import { AdministratorCreateDto } from '../dto/administrator-create-dto';
import { AdministratorUpdateDto } from '../dto/administrator-update-dto';

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
    @Query('nextPageToken', new DefaultValuePipe(Constants.API_DEFAULT_NEXT_PAGE_TOKEN))
    nextPageToken?: string,
    @Query('limit', new DefaultValuePipe(Constants.API_DEFAULT_LIMIT), new ParseIntPipe())
    limit?: number
  ): Promise<AdministratorsDto> {
    return await this.administratorsService.findAllActive(request['auth-enterprise-id'], search, nextPageToken, limit);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get administrator by ID'
  })
  @ApiOkResponse({ type: AdministratorDto })
  @ApiNotFoundResponse({ description: 'Administrator requested not found' })
  @Version('1')
  async getContactV1(@Param('id') id: number, @Req() request: Request): Promise<AdministratorDto> {
    const administratorDto = await this.administratorsService.getAdministratorById(request['auth-enterprise-id'], id);

    if (!administratorDto) {
      throw new NotFoundException();
    }
    return administratorDto;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a administrator' })
  @ApiNoContentResponse({ description: 'Administrator deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Administrator requested not found.' })
  @ApiNotAcceptableResponse({
    description: 'Administrator could not be deleted.'
  })
  @ApiInternalServerErrorResponse({
    description: 'Administrator could not be deleted.'
  })
  @HttpCode(204)
  @ApiParam({ name: 'id', type: Number, description: 'Administrator ID' })
  @Version('1')
  async deleteAdministratorV1(@Param('id') id: number, @Req() request: Request): Promise<void> {
    const isDeleted = await this.administratorsService.deleteAdministratorV1(request['auth-enterprise-id'], id);

    if (!isDeleted) {
      throw new InternalServerErrorException(`Could not delete administrator with ID ${id}`);
    }
  }

  /**
   * Creates a new administrator in the system based on the provided data.
   *
   * @param {Request} request - The HTTP request object, used to extract additional information such as enterprise ID.
   * @param {AdministratorCreateDto} administrator - The DTO containing information about the administrator to create.
   * @return {Promise<AdministratorDto>} Returns a promise that resolves to the created administrator's details.
   */
  @Post()
  @ApiOperation({
    summary: 'Create new administrator'
  })
  @ApiBody({
    type: AdministratorCreateDto,
    description: 'New administrator DTO'
  })
  @ApiOkResponse({ type: AdministratorDto })
  @ApiBadRequestResponse({
    description: 'Bad request',
    example: 'email must be an email'
  })
  @ApiNotAcceptableResponse({
    description: 'Administrator could not be created.',
    example: 'Administrator with email a@b.c already exist.'
  })
  @Version('1')
  async createAdministratorV1(
    @Req() request: Request,
    @Body() administrator: AdministratorCreateDto
  ): Promise<AdministratorDto> {
    return await this.administratorsService.createAdministratorV1(request['auth-enterprise-id'], administrator);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update an administrator'
  })
  @ApiBody({
    type: AdministratorUpdateDto,
    description: 'Administrator DTO'
  })
  @ApiOkResponse({ type: AdministratorDto })
  @ApiBadRequestResponse({
    description: 'Bad request',
    example: 'email must be an email'
  })
  @ApiNotAcceptableResponse({
    description: 'Administrator could not be update.'
  })
  @ApiParam({ name: 'id', type: Number, description: 'Administrator ID' })
  @Version('1')
  async updateAdministratorV1(
    @Param('id') administratorId: number,
    @Req() request: Request,
    @Body() administratorDto: AdministratorUpdateDto
  ): Promise<AdministratorDto> {
    return await this.administratorsService.updateAdministratorV1(
      request['auth-enterprise-id'],
      administratorId,
      administratorDto
    );
  }
}
