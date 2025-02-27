import {
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  Version
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from '../dto/create-attachment-dto';
import { AttachmentDto } from '../dto/attachment-dto';

@ApiBearerAuth()
@ApiTags('Attachments')
@Controller({
  path: '/attachments',
  version: '1'
})
export class AttachmentsController {
  private readonly logger = new Logger(AttachmentsController.name); // Scoped logger

  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('/')
  @ApiOperation({
    summary: 'Upload new attachment'
  })
  @ApiConsumes('multipart/form-data') // Important for file uploads
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiOkResponse({ type: CreateAttachmentDto })
  @Version('1')
  async createAttachmentV1(@UploadedFile() file: Express.Multer.File): Promise<CreateAttachmentDto> {
    return await this.attachmentsService.createAttachment(file);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get an attachment'
  })
  @ApiNotFoundResponse({ description: 'Attachment not found' })
  @Version('1')
  async getAttachmentV1(@Param('id') id: string): Promise<AttachmentDto> {
    const attachment: AttachmentDto = await this.attachmentsService.getAttachmentByFileId(id);
    if (!attachment) {
      throw new NotFoundException();
    }
    return attachment;
  }

  /*
  OnPage delete unassigned attachments every 24h
  We should not allow to user to remove attachment as it can be already
  assigned to some message

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an attachment'
  })
  @ApiNoContentResponse({ description: 'Attachment deleted successfully' })
  @ApiNotFoundResponse({ description: 'Attachment requested not found' })
  @HttpCode(204) // <-- Force 204 No Content
  @Version('1')
  async deleteAttachmentV1(@Param('id') id: string): Promise<void> {
    const isAttachmentDeleted: boolean =
      await this.attachmentsService.deleteAttachment(id);
    if (!isAttachmentDeleted) {
      throw new NotFoundException();
    }
  }
  */
}
