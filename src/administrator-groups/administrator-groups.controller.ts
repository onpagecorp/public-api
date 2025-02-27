import {
  BadRequestException,
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
import { Operation } from 'fast-json-patch';
import { Constants } from '../constants';
import { Request } from 'express';
import { AdministratorGroupsService } from './administrator-groups.service';
import { AdministratorGroupsDto } from '../dto/administrator-groups-dto';
import { AdministratorGroupDto } from '../dto/administrator-group-dto';
import { AdministratorGroupCreateDto } from '../dto/administrator-group-create-dto';
import { AdministratorGroupUpdateDto } from '../dto/administrator-group-update-dto';
import { PatchOperationDto } from '../dto/patch-operation-dto';

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

@ApiBearerAuth()
@ApiTags('Administrators')
@Controller({
  path: '/administrators-groups',
  version: '1'
})
export class AdministratorGroupsController {
  constructor(private readonly administratorGroupsService: AdministratorGroupsService) {}

  @Get()
  @ApiOperation({
    summary: "Get list of administrator's groups"
  })
  @ApiOkResponse({ type: AdministratorGroupsDto })
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
  ): Promise<AdministratorGroupsDto> {
    return await this.administratorGroupsService.findAllAdministratorGroupsV1(
      request['auth-enterprise-id'],
      search,
      nextPageToken,
      limit
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get administrator group by ID'
  })
  @ApiOkResponse({ type: AdministratorGroupDto })
  @ApiNotFoundResponse({ description: 'Group requested not found' })
  @Version('1')
  async getAdministratorGroupV1(@Param('id') id: number, @Req() request: Request): Promise<AdministratorGroupDto> {
    const dispatcherDto = await this.administratorGroupsService.getAdministratorGroupById(
      request['auth-enterprise-id'],
      id
    );

    if (!dispatcherDto) {
      throw new NotFoundException();
    }
    return dispatcherDto;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a administrators group' })
  @ApiNoContentResponse({
    description: 'Administrators group deleted successfully.'
  })
  @ApiNotFoundResponse({
    description: 'Administrators group requested not found.'
  })
  @ApiNotAcceptableResponse({
    description: 'Administrators group could not be deleted.'
  })
  @ApiInternalServerErrorResponse({
    description: 'Administrators group could not be deleted.'
  })
  @HttpCode(204)
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Administrators group ID'
  })
  @Version('1')
  async deleteAdministratorV1(@Param('id') id: number, @Req() request: Request): Promise<void> {
    const isDeleted = await this.administratorGroupsService.deleteAdministratorsGroupV1(
      request['auth-enterprise-id'],
      id
    );

    if (!isDeleted) {
      throw new InternalServerErrorException(`Could not delete administrator with ID ${id}`);
    }
  }

  /**
   * Creates a new administratorGroup in the system based on the provided data.
   *
   * @param {Request} request - The HTTP request object, used to extract
   *   additional information such as enterprise ID.
   * @param {AdministratorCreateDto} administratorGroup - The DTO containing
   *   information about the administratorGroup to create.
   * @return {Promise<AdministratorDto>} Returns a promise that resolves to the
   *   created administratorGroup's details.
   */
  @Post()
  @ApiOperation({
    summary: 'Create new administratorGroup'
  })
  @ApiBody({
    type: AdministratorGroupCreateDto,
    description: 'New administratorGroup DTO'
  })
  @ApiOkResponse({ type: AdministratorGroupDto })
  @Version('1')
  async createAdministratorV1(
    @Req() request: Request,
    @Body() administratorGroup: AdministratorGroupCreateDto
  ): Promise<AdministratorGroupDto> {
    return await this.administratorGroupsService.createAdministratorGroupV1(
      request['auth-enterprise-id'],
      administratorGroup
    );
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update an administrator group'
  })
  @ApiBody({
    type: AdministratorGroupUpdateDto,
    description: 'Administrator group DTO.'
  })
  @ApiOkResponse({
    type: AdministratorGroupDto,
    description: 'Administrator group updated successfully.'
  })
  @ApiNotAcceptableResponse({
    description: 'Administrator group could not be update.'
  })
  @ApiParam({ name: 'id', type: Number, description: 'Administrator group ID' })
  @Version('1')
  async updateAdministratorGroupV1(
    @Param('id') administratorId: number,
    @Req() request: Request,
    @Body() administratorGroupDto: AdministratorGroupUpdateDto
  ): Promise<AdministratorGroupDto> {
    return await this.administratorGroupsService.updateAdministratorGroupV1(
      request['auth-enterprise-id'],
      administratorId,
      administratorGroupDto
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Patch an administrator group'
  })
  @ApiBody({
    description: 'Patch operations.',
    type: [PatchOperationDto]
  })
  @ApiOkResponse({
    type: AdministratorGroupDto,
    description: 'Administrator group updated successfully.'
  })
  @ApiNotAcceptableResponse({
    description: 'Administrator group could not be update.'
  })
  @ApiParam({ name: 'id', type: Number, description: 'Administrator group ID' })
  @Version('1')
  async patchAdministratorGroupV1(
    @Param('id') administratorGroupId: number,
    @Req() request: Request,
    @Body(new PatchValidationPipe()) patchOperations: Operation[]
  ): Promise<AdministratorGroupDto> {
    return await this.administratorGroupsService.patchAdministratorGroupV1(
      request['auth-enterprise-id'],
      administratorGroupId,
      patchOperations
    );
  }
}
