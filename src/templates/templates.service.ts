import { Injectable, Logger } from '@nestjs/common';
import { Metadata } from '../interfaces/metadata.interface';
import { entity as Entities } from '@onpage-corp/onpage-domain-mysql';
import { TemplatesDto } from '../dto/templates-dto';
import { TemplateDto } from '../dto/template-dto';
import { TemplateUpdateDto } from '../dto/template-update-dto';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name); // Scoped logger

  public async findAll(
    enterpriseId: number,
    search: string = '',
    offset: number = 0,
    limit: number = 10
  ): Promise<TemplatesDto> {
    const metadata: Metadata = {
      hasMoreData: false
    };

    const result: TemplatesDto = { templates: [], metadata };

    let counter = 0;

    const pushTemplateToResult = (template: any) => {
      result.templates.push(this.convertMessageTemplateToTemplateDto(template));

      counter++;
    };

    const MessageTemplate = Entities.sequelize.models.MessageTemplate;
    const templates = await MessageTemplate.findAll({
      where: {
        enterpriseId
      },
      offset: offset * limit
    });

    for (const template of templates) {
      if (counter >= limit) {
        result.metadata.hasMoreData = true;
        break;
      }
      if (!search || search.trim() === '') {
        pushTemplateToResult(template);
      } else if (
        template.pagerNumber.toLowerCase().includes(search.toLowerCase()) ||
        template.email.toLowerCase().includes(search.toLowerCase()) ||
        template.firstName.toLowerCase().includes(search.toLowerCase()) ||
        template.lastName.toLowerCase().includes(search.toLowerCase())
      ) {
        pushTemplateToResult(template);
      }
    }

    return result;
  }

  /**
   * Get template by ID.
   *
   * @param {number} enterpriseId - The ID of the enterprise associated with the account.
   * @param {number} id - The operation ID for the account to be located.
   * @return {Promise<TemplateDto|null>} A Promise resolving to the ContactDto of the found account, or null if no account is found.
   */
  public async getTemplateById(
    enterpriseId: number,
    id: number
  ): Promise<TemplateDto> | null {
    const MessageTemplate = Entities.sequelize.models.MessageTemplate;
    const template = await MessageTemplate.findOne({
      where: {
        id,
        enterpriseId
      }
    });

    if (template) {
      return this.convertMessageTemplateToTemplateDto(template);
    } else {
      return null;
    }
  }

  /**
   * Updates a message template based on the provided data.
   *
   * @param {number} enterpriseId - The ID of the enterprise associated with the template.
   * @param {number} id - The ID of the template to be updated.
   * @param {TemplateUpdateDto} templateUpdateDto - An object containing the updated template data.
   * @return {Promise<TemplateDto|null>} Returns the updated template as a DTO object if successful,
   * or null if the update fails or the template is not found.
   */
  async updateTemplate(
    enterpriseId: number,
    id: number,
    templateUpdateDto: TemplateUpdateDto
  ) {
    const updateChunk = {};

    Object.entries(templateUpdateDto).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'predefinedReplies') {
          updateChunk[key] = (value as string[]).join(';');
        } else {
          updateChunk[key] = value;
        }
      }
    });

    const MessageTemplate = Entities.sequelize.models.MessageTemplate;
    const updatedCounter = await MessageTemplate.update(updateChunk, {
      where: {
        id,
        enterpriseId
      }
    });

    if (updatedCounter === 0) {
      return null;
    }

    const template = await MessageTemplate.findByPk(id);

    if (template) {
      return this.convertMessageTemplateToTemplateDto(template);
    } else {
      return null;
    }
  }

  /**
   * Deletes a message template for a specific enterprise by its ID.
   *
   * @param {number} enterpriseId - The ID of the enterprise associated with the template.
   * @param {number} id - The ID of the template to be deleted.
   * @return {Promise<boolean>} A promise that resolves to a boolean indicating whether the template was successfully deleted.
   */
  async deleteTemplate(enterpriseId: number, id: number): Promise<boolean> {
    this.logger.debug(
      `Heading to delete template #${typeof id} in enterprise #${enterpriseId}.`
    );
    const MessageTemplate = Entities.sequelize.models.MessageTemplate;
    const deletedRowsCount = await MessageTemplate.destroy({
      where: {
        id,
        enterpriseId
      }
    });

    this.logger.debug(`Deleted ${deletedRowsCount} template rows`);

    return deletedRowsCount > 0;
  }

  private convertMessageTemplateToTemplateDto(template: any): TemplateDto {
    return {
      id: template.id,
      name: template.name,
      subject: template.subject,
      body: template.body,
      predefinedReplies: template.predefinedReplies
        ? template.predefinedReplies.split(';')
        : [],
      syncToDevice: template.syncToDevice
    };
  }
}
