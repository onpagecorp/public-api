import {
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { Utils } from '../utils';
import { entity as Entities } from '@onpage-corp/onpage-domain-mysql';
import { CreateAttachmentDto } from '../dto/create-attachment-dto';
import { AttachmentDto } from '../dto/attachment-dto';

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);

  /**
   * Creates an attachment record in the database using the provided file.
   *
   * @param {Express.Multer.File} file The file object uploaded through Multer. It should contain properties like `originalname`, `size`, `mimetype`, and `buffer`.
   * @return {Promise<CreateAttachmentDto>} A promise that resolves to an object containing the ID of the created attachment record.
   * @throws {InternalServerErrorException} When the file does not meet the required properties or if an error occurs during the creation process.
   */
  async createAttachment(
    file: Express.Multer.File
  ): Promise<CreateAttachmentDto> {
    const fileName = file.originalname;
    const fileSize = file.size;
    const mimeType = file.mimetype;
    const fileType = Utils.getAttachmentTypeFromMimeType(mimeType);

    if (!fileName || !fileSize || fileSize < 1 || !mimeType) {
      throw new InternalServerErrorException();
    }

    const fileId = crypto.randomUUID();

    const NpsAttachment = Entities.sequelize.models.NpsAttachment;
    const attachment = await NpsAttachment.create({
      fileId,
      fileName,
      fileSize,
      fileType: fileType,
      creation: new Date(),
      mimeType,
      fileData: file.buffer
    });

    this.logger.debug(`File created: ${attachment.id}:${fileId}`);

    return { id: fileId };
  }

  /**
   * Deletes an attachment based on the provided file ID.
   *
   * @param {string} fileId - The unique identifier of the file to be deleted.
   * @return {Promise<boolean>} A promise that resolves to a boolean indicating whether the deletion was successful.
   */
  async deleteAttachment(fileId: string): Promise<boolean> {
    const NpsAttachment = Entities.sequelize.models.NpsAttachment;
    const rowsDeleted = await NpsAttachment.destroy({ where: { fileId } });
    return rowsDeleted > 0;
  }

  /**
   * Retrieves an attachment associated with the specified file ID.
   *
   * @param {string} fileId - The ID of the file to retrieve the attachment for.
   * @return {Object|null} Returns the attachment as a JSON object if found, or null if no attachment is associated with the provided file ID.
   */
  async getAttachmentByFileId(fileId: string): Promise<AttachmentDto | null> {
    const NpsAttachment = Entities.sequelize.models.NpsAttachment;
    const attachment = await NpsAttachment.findOne({ where: { fileId } });

    if (attachment) {
      const buff = new Buffer(attachment.fileData);
      const base64data = buff.toString('base64');

      return {
        id: attachment.fileId,
        name: attachment.fileName,
        size: attachment.fileSize,
        data: base64data
      };
    } else {
      return null;
    }
  }
}
