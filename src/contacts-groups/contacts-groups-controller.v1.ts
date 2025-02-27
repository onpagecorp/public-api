import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  PipeTransform,
  Post,
  Put,
  Query,
  Req,
  Version
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';
import { Constants } from '../constants';
import { Request } from 'express';
import { ContactsService } from '../contacts/contacts.service';
import { ContactGroupsDto } from '../dto/contact-groups-dto';
import { ContactGroupCreateDto, ContactGroupDto, ContactGroupUpdateDto } from '../dto/contact-group-dto';
import { PatchOperationDto } from '../dto/patch-operation-dto';
import { Operation } from 'fast-json-patch';

class PatchValidationPipe implements PipeTransform {
  // Define the list of paths that should not be patched
  private readonly forbiddenPaths: string[] = ['/id'];

  transform(patchOps: Operation[]): Operation[] {
    for (const op of patchOps) {
      // Check if the operation path is in the forbidden list
      if (this.forbiddenPaths.some(forbidden => op.path.startsWith(forbidden))) {
        throw new BadRequestException(`Modifying ${op.path} is not allowed.`);
      }
    }
    return patchOps;
  }
}

@Controller('contacts-groups')
@ApiBearerAuth()
@ApiTags('Contacts')
@Controller({
  path: '/contact-groups',
  version: '1'
})
export class ContactsGroupsControllerV1 {
  private readonly logger = new Logger(ContactsGroupsControllerV1.name);

  constructor(private readonly contactsService: ContactsService) {}

  /**
   * Retrieves a list of contact groups.
   *
   * @param {Request} request - The current HTTP request object.
   * @param {string} [search] - Optional search keyword to filter the contact
   *   groups.
   * @param {string} [nextPageToken] - Optional token to retrieve the next page
   *   of results. Defaults to a predefined value.
   * @param {number} [limit] - Optional number of results to return per page.
   *   Defaults to a predefined value.
   * @return {Promise<ContactGroupsDto>} A promise that resolves to an object
   *   containing the list of contact groups.
   */
  @Get()
  @ApiOperation({
    summary: "Get list of contact's groups"
  })
  @ApiOkResponse({ type: ContactGroupsDto })
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
  async getContactGroups(
    @Req() request: Request,
    @Query('search') search?: string,
    @Query('nextPageToken', new DefaultValuePipe(Constants.API_DEFAULT_NEXT_PAGE_TOKEN))
    nextPageToken?: string,
    @Query('limit', new DefaultValuePipe(Constants.API_DEFAULT_LIMIT), new ParseIntPipe())
    limit?: number
  ): Promise<ContactGroupsDto> {
    return await this.contactsService.getListOfGroupsEnterpriseId(
      request['auth-enterprise-id'],
      search,
      nextPageToken,
      limit
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get contact groups'
  })
  @ApiOkResponse({ type: ContactGroupDto })
  @ApiNotFoundResponse({ description: 'Group requested not found' })
  @Version('1')
  async getContactGroupByIdV1(@Param('id') id: number, @Req() request: Request): Promise<ContactGroupDto> {
    const contactGroupDto = await this.contactsService.getContactGroupByIdV1(request['auth-enterprise-id'], id);

    if (!contactGroupDto) {
      throw new NotFoundException();
    }
    return contactGroupDto;
  }

  @Post()
  @ApiOperation({
    summary: 'Create contact group'
  })
  @ApiBody({ type: ContactGroupCreateDto, description: 'Contact Group DTO' })
  @ApiOkResponse({ type: ContactGroupDto })
  @Version('1')
  async getContactGroupV1(
    @Req() request: Request,
    @Body() contactGroupCreateDto: ContactGroupCreateDto
  ): Promise<ContactGroupDto> {
    return await this.contactsService.createContactGroupV1(request['auth-enterprise-id'], contactGroupCreateDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update an contact group'
  })
  @ApiBody({
    type: ContactGroupUpdateDto,
    description: 'Contact group DTO.'
  })
  @ApiOkResponse({
    type: ContactGroupDto,
    description: 'Contact group updated successfully.'
  })
  @ApiNotAcceptableResponse({
    description: 'Contact group could not be update.'
  })
  @ApiParam({ name: 'id', type: Number, description: 'Contact group ID' })
  @Version('1')
  async updateAdministratorGroupV1(
    @Param('id') contactGroupId: number,
    @Req() request: Request,
    @Body() contactGroupDto: ContactGroupUpdateDto
  ): Promise<ContactGroupDto> {
    return await this.contactsService.updateContactGroupV1(
      request['auth-enterprise-id'],
      contactGroupId,
      contactGroupDto
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Patch an contact group'
  })
  @ApiBody({
    description: 'Patch operations.',
    type: [PatchOperationDto]
  })
  @ApiOkResponse({
    type: ContactGroupDto,
    description: 'Contact group updated successfully.'
  })
  @ApiNotAcceptableResponse({
    description: 'Contact group could not be update.'
  })
  @ApiParam({ name: 'id', type: Number, description: 'Contact group ID' })
  @Version('1')
  async patchContactGroupV1(
    @Param('id') contactGroupId: number,
    @Req() request: Request,
    @Body(new PatchValidationPipe()) patchOperations: Operation[]
  ): Promise<ContactGroupDto> {
    this.logger.debug(`contactGroupId: ${contactGroupId}: ${typeof contactGroupId}`);
    return await this.contactsService.patchContactGroupV1(
      request['auth-enterprise-id'],
      contactGroupId,
      patchOperations
    );
  }
}
