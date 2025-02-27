import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
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
import { TemplateCreateDto } from '../dto/template-create-dto';

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
  ): Promise<TemplatesDto> {
    return await this.templatesService.getListOfTemplates(
      request['auth-enterprise-id'],
      search,
      nextPageToken,
      limit
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Create new template'
  })
  @ApiBody({ type: TemplateCreateDto, description: 'New Template DTO' })
  @ApiOkResponse({ type: TemplateDto })
  @Version('1')
  async createTemplateV1(
    @Req() request: Request,
    @Body() template: TemplateCreateDto
  ): Promise<TemplateDto> {
    return await this.templatesService.createTemplateV1(
      request['auth-enterprise-id'],
      template
    );
  }

  /**
   * Retrieves a template by its unique identifier.
   *
   * @param {number} id - The unique identifier of the template to retrieve.
   * @param {Request} request - The HTTP request object.
   * @return {Promise<TemplateDto>} A promise that resolves to the requested template data transfer object, or throws a NotFoundException if the template is not found.
   */
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
    const templateDto = await this.templatesService.getTemplateById(
      request['auth-enterprise-id'],
      id
    );

    if (!templateDto) {
      throw new NotFoundException();
    }
    return templateDto;
  }

  /**
   * Updates an existing template based on the provided template ID and partial data.
   * Throws a NotFoundException if the template does not exist.
   *
   * @param {number} id - The ID of the template to be updated.
   * @param {Request} request - The HTTP request object, containing metadata including the enterprise ID.
   * @param {TemplateUpdateDto} template - Partial data for updating the template.
   * @return {Promise<TemplateDto>} - A promise that resolves with the updated TemplateDto object.
   */
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

  /**
   * Deletes a template with the specified ID.
   *
   * @param {number} id - The ID of the template to be deleted.
   * @param {Request} request - The HTTP request object containing enterprise authentication info.
   * @return {Promise<void>} A promise that resolves with no content if the template is deleted successfully.
   * @throws {NotFoundException} Thrown if the template with the specified ID is not found.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a template' })
  @ApiNoContentResponse({ description: 'Template deleted successfully' })
  @ApiNotFoundResponse({ description: 'Template requested not found' })
  @HttpCode(204)
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
