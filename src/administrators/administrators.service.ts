import {
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException
} from '@nestjs/common';
import { AdministratorsDto } from '../dto/administrators-dto';
import { Metadata } from '../interfaces/metadata.interface';
import {
  e,
  entity as Entities,
  Sequelize
} from '@onpage-corp/onpage-domain-mysql';
import { AdministratorDto } from '../dto/administrator-dto';
import { Paginator } from '../paginator/paginator';
import { AdministratorCreateDto } from '../dto/administrator-create-dto';
import { AdministratorUpdateDto } from '../dto/administrator-update-dto';

const Op = Sequelize.Op;

@Injectable()
export class AdministratorsService {
  private readonly logger = new Logger(AdministratorsService.name);

  public async findAllActive(
    enterpriseId: number,
    search: string = '',
    nextPageToken: string = null,
    limit: number = 10
  ): Promise<AdministratorsDto> {
    /**
     * Processes a dispatcher and adds it to the result's administrators list after converting it
     * to an Administrator DTO. Also updates the paginator with the dispatcher's ID and increments a counter.
     *
     * @param {any} dispatcher - The dispatcher object to be processed and converted.
     * @param {number[]} administratorGroups - An array of administrator group IDs associated with the dispatcher.
     */
    const pushDispatcherToResult = (
      dispatcher: any,
      administratorGroups: number[]
    ) => {
      result.administrators.push(
        this.convertDispatcherToAdministratorDto(
          dispatcher,
          administratorGroups
        )
      );
      paginator.set<number>('lastAdministratorId', dispatcher.id);
      counter++;
    };

    /**
     * Retrieves all active dispatchers from the database, filtered by enterpriseId, active status,
     * non-deleted status, and paginated using a pagination token.
     *
     * @return {Promise<Array>} A promise that resolves to an array of active dispatcher records.
     */
    const findAllActiveDispatchersFromDB = async () => {
      const Dispatcher = Entities.sequelize.models.Dispatcher;
      return await Dispatcher.findAll({
        where: {
          id: {
            [Op.gt]:
              Paginator.parsePaginationToken(nextPageToken).get<number>(
                'lastAdministratorId'
              ) || 0
          },
          enterpriseId,
          active: true,
          deleted: false
        },
        order: [['id', 'ASC']]
      });
    };

    /**
     * Function to evaluate if the given dispatcher matches the provided search criteria.
     *
     * The function checks if the search term is empty, null, or matches any of the
     * dispatcher's attributes (email, first name, or last name) in a case-insensitive manner.
     *
     * @param {Object} dispatcher - The dispatcher object containing relevant fields to check against the search term.
     * @returns {boolean} - Returns true if the search term is empty or matches any dispatcher attribute; otherwise, false.
     */
    const searchCriteria = (dispatcher): boolean => {
      return (
        !search ||
        search.trim() === '' ||
        dispatcher.email.toLowerCase().includes(search.toLowerCase()) ||
        dispatcher.firstName.toLowerCase().includes(search.toLowerCase()) ||
        dispatcher.lastName.toLowerCase().includes(search.toLowerCase())
      );
    };

    const metadata: Metadata = {
      nextPageToken: null
    };
    const result: AdministratorsDto = { administrators: [], metadata };
    const paginator = Paginator.init();

    let counter = 0;

    const dispatchers = await findAllActiveDispatchersFromDB();
    for (const dispatcher of dispatchers) {
      if (searchCriteria(dispatcher)) {
        if (counter <= limit) {
          if (counter < limit) {
            const administratorGroups =
              await this.getAdministratorGroupsByDispatcherId(
                enterpriseId,
                dispatcher.id
              );
            pushDispatcherToResult(dispatcher, administratorGroups);
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
   * Retrieves a dispatcher by its ID and associated enterprise ID.
   *
   * @param {number} enterpriseId - The ID of the enterprise to which the dispatcher belongs.
   * @param {number} id - The unique identifier of the dispatcher.
   * @return {Promise<AdministratorDto | null>} A promise that resolves to an AdministratorDto object if the dispatcher is found and meets the conditions, otherwise null.
   */
  public async getAdministratorById(
    enterpriseId: number,
    id: number
  ): Promise<AdministratorDto> | null {
    const Dispatcher = Entities.sequelize.models.Dispatcher;
    const dispatcher = await Dispatcher.findOne({
      where: {
        id,
        enterpriseId,
        deleted: false,
        active: true
      }
    });

    if (dispatcher) {
      const administratorGroups =
        await this.getAdministratorGroupsByDispatcherId(
          enterpriseId,
          dispatcher.id
        );
      return this.convertDispatcherToAdministratorDto(
        dispatcher,
        administratorGroups
      );
    } else {
      return null;
    }
  }

  /**
   * Deletes an administrator by marking them as inactive and deleted in the database.
   *
   * @param {number} enterpriseId - The ID of the enterprise to which the administrator belongs.
   * @param {number} administratorIdToBeDeleted - The ID of the administrator to be deleted.
   * @return {Promise<boolean>} - Returns a promise that resolves to true if the administrator was successfully deleted, otherwise false.
   * @throws {NotFoundException} - If the administrator with the specified ID is not found.
   * @throws {NotAcceptableException} - If the administrator is a SUPER admin or attempts to delete themselves.
   */
  async deleteAdministratorV1(
    enterpriseId: number,
    administratorIdToBeDeleted: number
  ): Promise<boolean> {
    const Dispatcher = Entities.sequelize.models.Dispatcher;
    const administratorToBeDeleted: any = await Dispatcher.findOne({
      where: {
        id: administratorIdToBeDeleted,
        enterpriseId
      }
    });
    if (!administratorToBeDeleted) {
      throw new NotFoundException(
        `Administrator with ID ${administratorIdToBeDeleted} not found.`
      );
    }

    const Enterprise = Entities.sequelize.models.Enterprise;
    const enterprise = await Enterprise.findByPk(
      administratorToBeDeleted.enterpriseId
    );
    if (
      !enterprise ||
      enterprise.superAdminEmail === administratorToBeDeleted.email
    ) {
      throw new NotAcceptableException(
        `Administrator with ID ${administratorIdToBeDeleted} is SUPER admin and can not be deleted.`
      );
    }

    const deletedRowsCount = await Dispatcher.update(
      {
        active: false,
        deleted: true
      },
      {
        where: {
          id: administratorIdToBeDeleted,
          enterpriseId
        }
      }
    );

    return deletedRowsCount > 0;
  }

  async createAdministratorV1(
    enterpriseId: number,
    administrator: AdministratorCreateDto
  ) {
    const Dispatcher = Entities.sequelize.models.Dispatcher;
    const requestedEmail = administrator.email;

    const dispatcherWithRequestedEmailAlreadyExist = await Dispatcher.findOne({
      where: { email: e.encryptOnPageSync(requestedEmail) }
    });
    if (dispatcherWithRequestedEmailAlreadyExist) {
      throw new NotAcceptableException(
        `Dispatcher with email ${requestedEmail} already exist.`
      );
    }

    const createdAdministrator = await Dispatcher.create({
      enterpriseId,
      active: true,
      deleted: false,
      creation: new Date(),
      password: administrator.password,
      firstName: administrator.firstName,
      lastName: administrator.lastName,
      email: requestedEmail,
      phoneNumber: administrator.phoneNumber,
      groups: [],
      adminType: administrator.superAdmin ? 'ADMINISTRATOR' : 'DISPATCHER',
      permissions: {
        canAddGroupFlag: administrator.permissions.groupCreate,
        canDeleteContactFlag: administrator.permissions.contactDelete,
        canEditContactFlag: administrator.permissions.contactEdit,
        canAddContactFlag: administrator.permissions.contactAdd,
        canAddContactToGroupFlag: administrator.permissions.contactToGroup,
        canRemoveContactFromGroupFlag:
          administrator.permissions.removeContactFromGroup,
        canDeleteGroupFlag: administrator.permissions.deleteGroup,
        canEditGroupFlag: administrator.permissions.editGroup,
        canAddEscalationFlag: administrator.permissions.createEscalation,
        canEditEscalationFlag: administrator.permissions.editEscalationGroup,
        canViewSchedule: administrator.permissions.viewSchedule,
        canEditSchedule: administrator.permissions.editSchedule,
        viewReportsFlag: administrator.permissions.viewReports
      }
    });
    return this.convertDispatcherToAdministratorDto(createdAdministrator, []);
  }

  /**
   * Updates an existing administrator's details for a given enterprise.
   *
   * @param {number} enterpriseId - The ID of the enterprise to which the administrator belongs.
   * @param {number} administratorId - The ID of the administrator to be updated.
   * @param {AdministratorUpdateDto} administrator - Object containing the updated administrator details, such as password, name, phone number, and permissions.
   * @return {Promise<AdministratorDto>} Returns a promise resolving to the updated administrator details in the form of a DTO.
   * @throws {NotFoundException} Throws an exception if the administrator is not found, not active, or is deleted.
   */
  async updateAdministratorV1(
    enterpriseId: number,
    administratorId: number,
    administrator: AdministratorUpdateDto
  ) {
    const Dispatcher = Entities.sequelize.models.Dispatcher;
    const dispatcher = await Dispatcher.findOne({
      where: {
        id: administratorId,
        enterpriseId,
        active: true,
        deleted: false
      }
    });

    if (!dispatcher) {
      throw new NotFoundException(
        `Dispatcher with ID ${administratorId} not found or not active.`
      );
    }

    const {
      password,
      firstName,
      lastName,
      phoneNumber,
      superAdmin,
      permissions
    } = administrator;

    if (password) dispatcher.password = password;
    if (firstName) dispatcher.firstName = firstName;
    if (lastName) dispatcher.lastName = lastName;
    if (phoneNumber) dispatcher.phoneNumber = phoneNumber;
    // dispatcher.groups = [];
    dispatcher.adminType = superAdmin ? 'ADMINISTRATOR' : 'DISPATCHER';

    if (permissions) {
      dispatcher.permissions = {};
      if ('groupCreate' in permissions)
        dispatcher.permissions.canAddGroupFlag = permissions.groupCreate;
      if ('contactDelete' in permissions)
        dispatcher.permissions.canDeleteContactFlag = permissions.contactDelete;
      if ('contactEdit' in permissions)
        dispatcher.permissions.canEditContactFlag = permissions.contactEdit;
      if ('contactAdd' in permissions)
        dispatcher.permissions.canAddContactFlag = permissions.contactAdd;
      if ('contactToGroup' in permissions)
        dispatcher.permissions.canAddContactToGroupFlag =
          permissions.contactToGroup;
      if ('removeContactFromGroup' in permissions)
        dispatcher.permissions.canRemoveContactFromGroupFlag =
          permissions.removeContactFromGroup;
      if ('deleteGroup' in permissions)
        dispatcher.permissions.canDeleteGroupFlag = permissions.deleteGroup;
      if ('editGroup' in permissions)
        dispatcher.permissions.canEditGroupFlag = permissions.editGroup;
      if ('createEscalation' in permissions)
        dispatcher.permissions.canAddEscalationFlag =
          permissions.createEscalation;
      if ('editEscalationGroup' in permissions)
        dispatcher.permissions.canEditEscalationFlag =
          permissions.editEscalationGroup;
      if ('viewSchedule' in permissions)
        dispatcher.permissions.canViewSchedule = permissions.viewSchedule;
      if ('editSchedule' in permissions)
        dispatcher.permissions.canEditSchedule = permissions.editSchedule;
      if ('viewReports' in permissions)
        dispatcher.permissions.viewReportsFlag = permissions.viewReports;
    }
    const updatedDispatcher = await dispatcher.save();

    const administratorGroups = await this.getAdministratorGroupsByDispatcherId(
      enterpriseId,
      dispatcher.id
    );

    return this.convertDispatcherToAdministratorDto(
      updatedDispatcher,
      administratorGroups
    );
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
    const AdminGroup = Entities.sequelize.models.AdminGroup;
    const AdminGroupMember = Entities.sequelize.models.AdminGroupMember;

    const adminGroupMembers = await AdminGroupMember.findAll({
      where: { dispatcherId }
    });

    const adminGroupIds = adminGroupMembers.map((adminGroupMember) => {
      return adminGroupMember.adminGroupId;
    });

    const adminGroups = await AdminGroup.findAll({
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
   * Converts a dispatcher object into an AdministratorDto object.
   *
   * @param {Object} dispatcher - The dispatcher data object containing user details and permissions.
   * @param {number[]} administratorGroups - An array of group IDs associated with the administrator.
   *
   * @return {AdministratorDto} The converted AdministratorDto object containing the administrator's details and permissions.
   */
  private convertDispatcherToAdministratorDto(
    dispatcher: any,
    administratorGroups: number[]
  ): AdministratorDto {
    return {
      id: dispatcher.id,
      firstName: dispatcher.firstName,
      lastName: dispatcher.lastName,
      email: dispatcher.email,
      phoneNumber: dispatcher.phoneNumber,
      groups: administratorGroups || [],
      superAdmin: dispatcher.adminType === 'ADMINISTRATOR',
      permissions: {
        groupCreate: dispatcher.canAddGroupFlag,
        contactDelete: dispatcher.canDeleteContactFlag,
        contactEdit: dispatcher.canEditContactFlag,
        contactAdd: dispatcher.canAddContactFlag,
        contactToGroup: dispatcher.canAddContactToGroupFlag,
        removeContactFromGroup: dispatcher.canRemoveContactFromGroupFlag,
        deleteGroup: dispatcher.canDeleteGroupFlag,
        editGroup: dispatcher.canEditGroupFlag,
        createEscalation: dispatcher.canAddEscalationFlag,
        editEscalationGroup: dispatcher.canAddEscalationFlag,
        viewSchedule: dispatcher.canViewSchedule,
        editSchedule: dispatcher.canEditSchedule,
        viewReports: dispatcher.viewReportsFlag
      }
    };
  }
}
