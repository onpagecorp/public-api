import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Metadata } from '../interfaces/metadata.interface';
import { entity as Entities, Sequelize } from '@onpage-corp/onpage-domain-mysql';
import { Paginator } from '../paginator/paginator';
import { AdministratorGroupDto } from '../dto/administrator-group-dto';
import { AdministratorGroupsDto } from '../dto/administrator-groups-dto';
import { AdministratorGroupCreateDto } from '../dto/administrator-group-create-dto';
import { AdministratorGroupUpdateDto } from '../dto/administrator-group-update-dto';
import { applyPatch, Operation } from 'fast-json-patch';

const Op = Sequelize.Op;

@Injectable()
export class AdministratorGroupsService {
  private readonly logger = new Logger(AdministratorGroupsService.name);
  private readonly AdminGroup = Entities.sequelize.models.AdminGroup;
  private readonly AdminGroupMember = Entities.sequelize.models.AdminGroupMember;
  private readonly Dispatcher = Entities.sequelize.models.Dispatcher;

  public async findAllAdministratorGroupsV1(
    enterpriseId: number,
    search: string = '',
    nextPageToken: string = null,
    limit: number = 10
  ): Promise<AdministratorGroupsDto> {
    /**
     * Asynchronous function to process and add an admin group to the result object.
     *
     * This function takes an admin group as input, converts it to a corresponding DTO
     * (Data Transfer Object) through the method `convertAdminGroupToAdminGroupDto`,
     * and appends the converted group to the `groups` array within the `result` object.
     * It also updates the paginator with the ID of the processed admin group and increments a counter.
     *
     * @param {any} adminGroup - The admin group object to be processed and added to the result.
     * @returns {Promise<void>} Returns a promise that resolves when the admin group is processed and added.
     */
    const pushAdminGroupToResult = async (adminGroup: any) => {
      result.groups.push(await this.convertAdminGroupToAdminGroupDto(adminGroup));
      paginator.set<number>('lastAdministratorGroupId', adminGroup.id);
      counter++;
    };

    /**
     * Fetches all administrator groups from the database that meet the specified criteria.
     *
     * This asynchronous function retrieves a list of administrator groups based on the
     * applied filters such as pagination token, enterprise ID, and group status (active and not deleted).
     * It also includes associated data about group members.
     *
     * @function
     * @async
     * @returns {Promise<Array>} A promise that resolves to an array of administrator groups with their associated data.
     * Each group entry includes only those that meet the conditions of the query.
     */
    const findAllAdministratorGroupsFromDB = async () => {
      return await this.AdminGroup.findAll({
        where: {
          id: {
            [Op.gt]: Paginator.parsePaginationToken(nextPageToken).get<number>('lastAdministratorGroupId') || 0
          },
          enterpriseId
        },
        order: [['id', 'ASC']],
        include: {
          model: this.AdminGroupMember,
          required: false
        }
      });
    };

    /**
     * Function to evaluate if the given dispatcher matches the provided search criteria.
     *
     * The function checks if the search term is empty, null, or matches any of the
     * dispatcher's attributes (email, first name, or last name) in a case-insensitive manner.
     *
     * @param {Object} dispatcher - The dispatcher object containing relevant fields to check against the search term.
     * @returns {boolean} - Returns true if the search term is empty or matches any dispatcher attribute; otherwise,
     *   false.
     */
    const searchCriteria = (dispatcher): boolean => {
      if (!search || search.trim() === '') {
        return true;
      }

      const lowerCaseSearch = search.toLowerCase();
      const fieldsToSearch = [dispatcher.email, dispatcher.firstName, dispatcher.lastName];

      return fieldsToSearch.some(field => field?.toLowerCase().includes(lowerCaseSearch));
    };

    const metadata: Metadata = {
      nextPageToken: null
    };
    const result: AdministratorGroupsDto = { groups: [], metadata };
    const paginator = Paginator.init();

    let counter = 0;

    const adminGroups = await findAllAdministratorGroupsFromDB();
    for (const adminGroup of adminGroups) {
      if (searchCriteria(adminGroup)) {
        if (counter <= limit) {
          if (counter < limit) {
            await pushAdminGroupToResult(adminGroup);
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
   * Retrieves an administrator group by its unique identifier and associated enterprise ID.
   *
   * @param {number} enterpriseId - The unique identifier of the enterprise to which the administrator group belongs.
   * @param {number} id - The unique identifier of the administrator group to be retrieved.
   * @return {Promise<AdministratorGroupDto | null>} A promise that resolves to the administrator group data as a DTO
   *   if found, or null if no matching group exists.
   */
  public async getAdministratorGroupById(enterpriseId: number, id: number): Promise<AdministratorGroupDto | null> {
    const dispatcher = await this.AdminGroup.findOne({
      where: { id, enterpriseId },
      include: [
        {
          model: this.AdminGroupMember,
          required: false
        }
      ]
    });

    return dispatcher ? this.convertAdminGroupToAdminGroupDto(dispatcher) : null;
  }

  /**
   * Deletes an administrator group for a specified enterprise.
   * Removes the group and its associated members from the database.
   *
   * @param {number} enterpriseId - The ID of the enterprise to which the administrator group belongs.
   * @param {number} administratorGroupIdToBeDeleted - The ID of the administrator group to be deleted.
   * @return {Promise<boolean>} Returns `true` if the administrator group was successfully deleted, otherwise `false`.
   * @throws {NotFoundException} Throws if the administrator group with the specified ID does not exist.
   */
  async deleteAdministratorsGroupV1(enterpriseId: number, administratorGroupIdToBeDeleted: number): Promise<boolean> {
    const administratorGroupToBeDeleted: any = await this.AdminGroup.findOne({
      where: {
        id: administratorGroupIdToBeDeleted,
        enterpriseId
      }
    });
    if (!administratorGroupToBeDeleted) {
      throw new NotFoundException(`Administrator group with ID ${administratorGroupIdToBeDeleted} not found.`);
    }

    await this.AdminGroupMember.destroy({
      where: {
        adminGroupId: administratorGroupToBeDeleted.id
      }
    });
    const deletedRowsCount = await this.AdminGroup.destroy({
      where: {
        id: administratorGroupIdToBeDeleted,
        enterpriseId
      }
    });

    return deletedRowsCount > 0;
  }

  /**
   * Creates a new administrator group for a specified enterprise.
   *
   * @param {number} enterpriseId - The identifier of the enterprise to which the administrator group belongs.
   * @param {AdministratorGroupCreateDto} administratorGroup - The details of the administrator group to be created.
   * @return {Promise<AdministratorGroupDto>} A promise resolving to the newly created administrator group data.
   */
  async createAdministratorGroupV1(
    enterpriseId: number,
    administratorGroup: AdministratorGroupCreateDto
  ): Promise<AdministratorGroupDto> {
    const { name, administrators } = administratorGroup;

    let createdAdministratorGroup = await this.AdminGroup.create({
      enterpriseId,
      name
    });

    if (administrators) {
      const enterpriseDispatchers = await this.Dispatcher.findAll({
        where: { enterpriseId, id: { [Op.in]: administrators } },
        attributes: ['id']
      });
      const dispatcherIdsInEnterprise = enterpriseDispatchers.map(dispatcher => dispatcher.id);
      this.logger.debug(`dispatcherIdsInEnterprise: ${dispatcherIdsInEnterprise}`);

      for (const administratorId of administrators) {
        this.logger.debug(`administratorId: ${administratorId}`);
        if (dispatcherIdsInEnterprise.includes(administratorId)) {
          this.logger.debug(`IN THE LIST!`);
          this.logger.debug(`NOT FOUND - CREATE ONE`);
          await this.AdminGroupMember.create({
            adminGroupId: createdAdministratorGroup.id,
            dispatcherId: administratorId
          });
        }
      }
    }

    createdAdministratorGroup = await this.AdminGroup.findByPk(createdAdministratorGroup.id, {
      include: {
        model: this.AdminGroupMember,
        required: false
      }
    });

    return this.convertAdminGroupToAdminGroupDto(createdAdministratorGroup);
  }

  /**
   * Updates an administratorGroupDto group associated with a specified enterprise and administratorGroupDto ID.
   *
   * @param {number} enterpriseId - The ID of the enterprise to which the administratorGroupDto belongs.
   * @param {number} administratorGroupId - The ID of the administratorGroupDto to be updated.
   * @param {AdministratorUpdateDto} administratorGroupDto - The data transfer object containing the updated
   *   administratorGroupDto details and permissions.
   * @return {Promise<AdministratorGroupDto>} A promise that resolves to the updated administratorGroupDto group data
   *   transfer object.
   * @throws {NotFoundException} If the specified administratorGroupDto is not active, deleted, or does not exist.
   */
  async updateAdministratorGroupV1(
    enterpriseId: number,
    administratorGroupId: number,
    administratorGroupDto: AdministratorGroupUpdateDto
  ): Promise<AdministratorGroupDto> {
    /**
     * Retrieves an administrator group from the database based on the provided ID.
     * The function fetches the administrator group and includes any associated
     * administrator group members in the result.
     *
     * @param {number} id - The unique identifier of the administrator group to retrieve.
     * @returns {Promise<Object|null>} A Promise that resolves to the administrator group
     * object if found, including associated members, or null if no group with the
     * specified ID exists.
     */
    const getAdministratorGroupFromDB = async (id: number) => {
      return await this.AdminGroup.findByPk(id, {
        include: {
          model: this.AdminGroupMember,
          required: false
        }
      });
    };

    const { name, administrators } = administratorGroupDto;

    const adminGroup = await this.AdminGroup.findOne({ where: { id: administratorGroupId, enterpriseId } });

    if (!adminGroup) {
      throw new NotFoundException(`Administrator group with ID ${administratorGroupId} not found.`);
    }

    adminGroup.name = name;

    const enterpriseDispatchers = await this.Dispatcher.findAll({
      where: { enterpriseId, id: { [Op.in]: administrators } },
      attributes: ['id']
    });
    const dispatcherIdsInEnterprise = enterpriseDispatchers.map(dispatcher => dispatcher.id);
    this.logger.debug(`dispatcherIdsInEnterprise: ${dispatcherIdsInEnterprise}`);

    if (administrators) {
      // destroy all members before recreating them
      await this.AdminGroupMember.destroy({ where: { adminGroupId: administratorGroupId } });

      for (const administratorId of administrators) {
        this.logger.debug(`administratorId: ${administratorId}`);
        if (dispatcherIdsInEnterprise.includes(administratorId)) {
          this.logger.debug(`IN THE LIST!`);
          const adminGroupMember = await this.AdminGroupMember.findOne({
            where: {
              adminGroupId: administratorGroupId,
              dispatcherId: administratorId
            }
          });
          if (!adminGroupMember) {
            this.logger.debug(`NOT FOUND - CREATE ONE`);
            await this.AdminGroupMember.create({
              adminGroupId: administratorGroupId,
              dispatcherId: administratorId
            });
          } else {
            this.logger.debug(`FOUND - DO NOT CREATE ONE`);
          }
        } else {
          this.logger.debug(`NOT IN THE LIST`);
        }
      }
    }

    await adminGroup.save();

    const updatedAdminGroup = await getAdministratorGroupFromDB(administratorGroupId);

    return this.convertAdminGroupToAdminGroupDto(updatedAdminGroup);
  }

  /**
   * Updates an administrator group based on a set of patch operations.
   *
   * @param {number} enterpriseId - The ID of the enterprise to which the administrator group belongs.
   * @param {number} administratorGroupId - The ID of the administrator group to be patched.
   * @param {Operation[]} patchOperations - An array of patch operations to be applied to the administrator group.
   *
   * @return {Promise<AdministratorGroupsDto>} A promise that resolves to the updated administrator group object.
   */
  async patchAdministratorGroupV1(
    enterpriseId: number,
    administratorGroupId: number,
    patchOperations: Operation[]
  ): Promise<AdministratorGroupDto> {
    // Retrieve the current item from your data store
    const adminGroupEntity = await this.AdminGroup.findOne({
      where: { id: administratorGroupId, enterpriseId },
      include: {
        model: this.AdminGroupMember,
        required: false
      }
    });
    const adminGroupDto = await this.convertAdminGroupToAdminGroupDto(adminGroupEntity);

    this.logger.debug(`adminGroupDto: ${JSON.stringify(adminGroupDto)}`);

    // Apply the patch operations to the item
    const patchedItem = applyPatch(adminGroupDto, patchOperations, false).newDocument;
    this.logger.debug(`patchedItem: ${JSON.stringify(patchedItem)}`);

    // Save the updated item back to your data store
    // const patchedAndSaved = await patchedItem.save();
    // return await this.convertAdminGroupToAdminGroupDto(patchedAndSaved);

    return await this.updateAdministratorGroupV1(enterpriseId, administratorGroupId, patchedItem);
  }

  /**
   * Retrieves a list of administrator group names associated with a dispatcher ID
   * within a specific enterprise.
   *
   * @param {number} enterpriseId - The ID of the enterprise to filter administrator groups.
   * @param {number} dispatcherId - The ID of the dispatcher to retrieve associated administrator groups.
   * @returns {Promise<number[]>} A promise that resolves to an array of administrator group names.
   */
  private getAdministratorGroupsByDispatcherId = async (
    enterpriseId: number,
    dispatcherId: number
  ): Promise<number[]> => {
    const result = [];

    const adminGroupMembers = await this.AdminGroupMember.findAll({
      where: { dispatcherId }
    });

    const adminGroupIds = adminGroupMembers.map(adminGroupMember => {
      return adminGroupMember.adminGroupId;
    });

    const adminGroups = await this.AdminGroup.findAll({
      where: {
        id: adminGroupIds,
        enterpriseId
      }
    });

    for (const adminGroup of adminGroups) {
      result.push(adminGroup.name);
    }

    return result;
  };

  /**
   * Converts a adminGroup object into an AdministratorDto object.
   *
   * @param {Object} adminGroup - The adminGroup data object containing user details and permissions.
   * @param {number[]} administratorGroups - An array of group IDs associated with the administrator.
   *
   * @return {AdministratorDto} The converted AdministratorDto object containing the administrator's details and
   *   permissions.
   */
  private async convertAdminGroupToAdminGroupDto(adminGroup: any): Promise<AdministratorGroupDto> {
    return {
      id: adminGroup.id,
      name: adminGroup.name,
      administrators: adminGroup.AdminGroupMembers
        ? (await adminGroup.getAdminGroupMembers()).map(x => x.dispatcherId)
        : []
    };
  }
}
