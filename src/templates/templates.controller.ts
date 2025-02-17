import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  NotImplementedException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Version
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';
import { Request } from 'express';
import { TemplateDto } from '../dto/template-dto';
import { TemplatesService } from './templates.service';
import { TemplatesDto } from '../dto/templates-dto';
import { Constants } from 'src/constants';
import { TemplateUpdateDto } from '../dto/template-update-dto';

@ApiBearerAuth()
@ApiTags('Templates')
@Controller({
  path: '/templates',
  version: '1'
})
export class TemplatesController {
  private readonly logger = new Logger(TemplatesController.name); // Scoped logger

  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get list of templates'
  })
  @ApiOkResponse({ type: TemplatesDto })
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
  ): Promise<TemplatesDto> {
    return await this.templatesService.findAll(
      request['auth-enterprise-id'],
      search,
      offset,
      limit
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Create new template'
  })
  createTemplate(): string {
    throw new NotImplementedException();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get template by ID'
  })
  @ApiOkResponse({ type: TemplateDto })
  @Version('1')
  async getTemplateV1(
    @Param('id') id: number,
    @Req() request: Request
  ): Promise<TemplateDto> {
    const contactDto = await this.templatesService.getTemplateById(
      request['auth-enterprise-id'],
      id
    );

    if (!contactDto) {
      throw new NotFoundException();
    }
    return contactDto;
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a template'
  })
  @ApiOkResponse({
    description: 'Template updated successfully',
    type: TemplateDto
  })
  @ApiParam({ name: 'id', type: Number, description: 'Template ID' })
  @ApiBody({ type: TemplateUpdateDto, description: 'Template partial data' })
  @Version('1')
  async updateTemplateV1(
    @Param('id') id: number,
    @Req() request: Request,
    @Body() template: TemplateUpdateDto
  ): Promise<TemplateDto> {
    const templateDto = await this.templatesService.updateTemplate(
      request['auth-enterprise-id'],
      id,
      template
    );

    if (!templateDto) {
      throw new NotFoundException();
    }

    return templateDto;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a template' })
  @ApiNoContentResponse({ description: 'Template deleted successfully' })
  @ApiNotFoundResponse({ description: 'Template requested not found' })
  @HttpCode(204) // <-- Force 204 No Content
  @ApiParam({ name: 'id', type: Number, description: 'Template ID' })
  @Version('1')
  async deleteTemplateV1(
    @Param('id') id: number,
    @Req() request: Request
  ): Promise<void> {
    this.logger.log(`${id}: ${typeof id}`);
    const isDeleted = await this.templatesService.deleteTemplate(
      request['auth-enterprise-id'],
      id
    );

    if (!isDeleted) {
      throw new NotFoundException();
    }
  }
}
