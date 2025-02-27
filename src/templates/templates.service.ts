import { Injectable, Logger } from '@nestjs/common';
import { Metadata } from '../interfaces/metadata.interface';
import {
  entity as Entities,
  Sequelize
} from '@onpage-corp/onpage-domain-mysql';
import { TemplatesDto } from '../dto/templates-dto';
import { TemplateDto } from '../dto/template-dto';
import { TemplateUpdateDto } from '../dto/template-update-dto';
import { Paginator } from '../paginator/paginator';
import { TemplateCreateDto } from '../dto/template-create-dto';

const Op = Sequelize.Op;

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name); // Scoped logger

  /**
   * Retrieves a list of templates based on the provided search criteria and pagination details.
   *
   * @param {number} enterpriseId - The ID of the enterprise to filter the templates.
   * @param {string} [search=''] - Optional search string to filter templates by various fields (e.g., pagerNumber, email, firstName, lastName).
   * @param {string} [nextPageToken=null] - Optional token for pagination to retrieve the next set of results.
   * @param {number} [limit=10] - The maximum number of templates to return in the result set.
   * @return {Promise<TemplatesDto>} A Promise that resolves to a TemplatesDto object containing the list of templates and metadata for pagination.
   */
  public async getListOfTemplates(
    enterpriseId: number,
    search: string = '',
    nextPageToken: string = null,
    limit: number = 10
  ): Promise<TemplatesDto> {
    const metadata: Metadata = {
      nextPageToken: null
    };

    const pushTemplateToResult = (template: any) => {
      result.templates.push(this.convertMessageTemplateToTemplateDto(template));
      paginator.set('lastTemplateId', template.id);
      counter++;
    };

    /**
     * Retrieves all message templates from the database that meet the specified criteria.
     *
     * @return {Promise<Array>} A Promise that resolves to an array of message templates.
     */
    const getAllTemplatesFromDb = async () => {
      const MessageTemplate = Entities.sequelize.models.MessageTemplate;
      return await MessageTemplate.findAll({
        where: {
          id: {
            [Op.gt]:
              Paginator.parsePaginationToken(nextPageToken).get<number>(
                'lastTemplateId'
              ) || 0
          },
          enterpriseId
        },
        order: [['id', 'ASC']]
      });
    };

    /**
     * A function used to determine if a given template object matches
     * the provided search criteria. It performs a case-insensitive search
     * across multiple properties of the template object, including pagerNumber,
     * email, firstName, and lastName.
     *
     * @param {any} template - The object that contains properties to be
     *                         compared against the search criteria.
     * @returns {boolean} - Returns true if the template matches the search criteria,
     *                      or if the search string is empty or null. Returns false otherwise.
     */
    const searchCriteria = (template: any): boolean => {
      return (
        !search ||
        search.trim() === '' ||
        template.pagerNumber.toLowerCase().includes(search.toLowerCase()) ||
        template.email.toLowerCase().includes(search.toLowerCase()) ||
        template.firstName.toLowerCase().includes(search.toLowerCase()) ||
        template.lastName.toLowerCase().includes(search.toLowerCase())
      );
    };

    const result: TemplatesDto = { templates: [], metadata };
    const paginator = Paginator.init();
    let counter = 0;

    const templates = await getAllTemplatesFromDb();

    for (const template of templates) {
      if (searchCriteria(template)) {
        if (counter <= limit) {
          if (counter < limit) {
            pushTemplateToResult(template);
          } else {
            result.metadata.nextPageToken = paginator.getPaginationToken();
            break;
          }
        }
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
   * Updates an existing message template with the provided data.
   *
   * @param {number} enterpriseId - The ID of the enterprise the template belongs to.
   * @param {number} id - The unique identifier of the template to be updated.
   * @param {TemplateUpdateDto} templateUpdateDto - An object containing the fields to be updated in the template.
   * @return {Promise<TemplateDto | null>} A promise that resolves with the updated template data as a TemplateDto, or null if the update failed or the template does not exist.
   */
  async updateTemplate(
    enterpriseId: number,
    id: number,
    templateUpdateDto: TemplateUpdateDto
  ): Promise<TemplateDto | null> {
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

  /**
   * Creates a message template for the specified enterprise.
   *
   * @param {number} enterpriseId - The unique identifier of the enterprise for which the template is being created.
   * @param {TemplateCreateDto} template - The data transfer object containing the details of the template to be created.
   * @return {Promise<TemplateDto>} A promise that resolves to the created template data transfer object.
   */
  async createTemplateV1(
    enterpriseId: number,
    template: TemplateCreateDto
  ): Promise<TemplateDto> {
    const MessageTemplate = Entities.sequelize.models.MessageTemplate;
    const createdTemplate = await MessageTemplate.create({
      enterpriseId,
      updatedAt: new Date(),
      name: template.name,
      name2: template.name,
      subject: template.subject,
      body: template.body,
      predefinedReplies: template.predefinedReplies
        ? template.predefinedReplies.join(';')
        : null,
      syncToDevice: template.syncToDevice || false
    });
    return this.convertMessageTemplateToTemplateDto(createdTemplate);
  }

  /**
   * Converts a message template object to a TemplateDto object.
   *
   * @param {any} template - The message template object to be converted.
   * @return {TemplateDto} The converted TemplateDto object.
   */
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
