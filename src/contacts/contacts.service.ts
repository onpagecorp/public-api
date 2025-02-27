import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Metadata } from '../interfaces/metadata.interface';
import { e as Encoder, entity as Entities, Sequelize } from '@onpage-corp/onpage-domain-mysql';
import { ContactsDto } from '../dto/contacts-dto';
import { ContactDto } from '../dto/contact-dto';
import { ContactGroupsDto } from '../dto/contact-groups-dto';
import {
  ContactGroupCreateDto,
  ContactGroupDto,
  ContactGroupUpdateDto,
  ESCALATION_FACTOR_DTO,
  ESCALATION_INTERVAL_DTO
} from '../dto/contact-group-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ESCALATION_FACTOR, ESCALATION_INTERVAL, GroupEntity } from '../entity/group-entity';
import { DeepPartial, Repository } from 'typeorm';
import { GroupMemberEntity } from '../entity/group-member-entity';
import { ContactGroupMemberDto } from '../dto/contact-group-member-dto';
import { ContactCreateDto } from '../dto/contact-create-dto';
import { Utils } from '../utils';
import { EntityConflictError, InternalServerError } from '../custom-error/custom-error';
import { Paginator } from '../paginator/paginator';
import { applyPatch, Operation } from 'fast-json-patch';

const Op = Sequelize.Op;

@Injectable()
export class ContactsService {
  private static readonly escalationIntervalMapping: Record<ESCALATION_INTERVAL, ESCALATION_INTERVAL_DTO> = {
    [ESCALATION_INTERVAL.NONE]: ESCALATION_INTERVAL_DTO.NONE,
    [ESCALATION_INTERVAL['1 minute']]: ESCALATION_INTERVAL_DTO['1 minute'],
    [ESCALATION_INTERVAL['2 minutes']]: ESCALATION_INTERVAL_DTO['2 minutes'],
    [ESCALATION_INTERVAL['3 minutes']]: ESCALATION_INTERVAL_DTO['3 minutes'],
    [ESCALATION_INTERVAL['5 minutes']]: ESCALATION_INTERVAL_DTO['5 minutes'],
    [ESCALATION_INTERVAL['10 minutes']]: ESCALATION_INTERVAL_DTO['10 minutes'],
    [ESCALATION_INTERVAL['15 minutes']]: ESCALATION_INTERVAL_DTO['15 minutes'],
    [ESCALATION_INTERVAL['20 minutes']]: ESCALATION_INTERVAL_DTO['20 minutes'],
    [ESCALATION_INTERVAL['25 minutes']]: ESCALATION_INTERVAL_DTO['25 minutes'],
    [ESCALATION_INTERVAL['30 minutes']]: ESCALATION_INTERVAL_DTO['30 minutes'],
    [ESCALATION_INTERVAL['35 minutes']]: ESCALATION_INTERVAL_DTO['35 minutes'],
    [ESCALATION_INTERVAL['40 minutes']]: ESCALATION_INTERVAL_DTO['40 minutes'],
    [ESCALATION_INTERVAL['45 minutes']]: ESCALATION_INTERVAL_DTO['45 minutes'],
    [ESCALATION_INTERVAL['50 minutes']]: ESCALATION_INTERVAL_DTO['50 minutes'],
    [ESCALATION_INTERVAL['55 minutes']]: ESCALATION_INTERVAL_DTO['55 minutes'],
    [ESCALATION_INTERVAL['1 hour']]: ESCALATION_INTERVAL_DTO['1 hour']
  };
  private static readonly escalationFactorMapping: Record<ESCALATION_FACTOR, ESCALATION_FACTOR_DTO> = {
    [ESCALATION_FACTOR.NONE]: ESCALATION_FACTOR_DTO.NONE,
    [ESCALATION_FACTOR.DELIVERED]: ESCALATION_FACTOR_DTO.DELIVERED,
    [ESCALATION_FACTOR.READ]: ESCALATION_FACTOR_DTO.READ,
    [ESCALATION_FACTOR.REPLIED]: ESCALATION_FACTOR_DTO.REPLIED
  };
  private readonly logger = new Logger(ContactsService.name);

  private readonly Account = Entities.sequelize.models.Account;
  private readonly Group = Entities.sequelize.models.Group;

  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
    @InjectRepository(GroupMemberEntity)
    private readonly groupMemberRepository: Repository<GroupMemberEntity>
  ) {}

  /**
   * Retrieves a list of active contacts associated with a specific enterprise.
   * The method supports pagination and optional search functionality.
   *
   * @param {number} enterpriseId - The identifier of the enterprise whose active contacts are to be fetched.
   * @param {string} [search=''] - An optional search query to filter contacts by pager number, email, first name, or
   *   last name.
   * @param {string} [nextPageToken=null] - An optional token to fetch the next set of results for pagination.
   * @param {number} [limit=10] - The maximum number of contacts to be returned.
   * @return {Promise<ContactsDto>} A promise that resolves to an object containing the list of contacts and metadata
   *   for pagination.
   */
  public async findAllActive(
    enterpriseId: number,
    search: string = '',
    nextPageToken: string = null,
    limit: number = 10
  ): Promise<ContactsDto> {
    const metadata: Metadata = {
      nextPageToken: null
    };

    /**
     * A function that processes a given account and adds its contact representation
     * to the result set while updating pagination and counting information.
     *
     * @param {any} account - The account object to be processed. It is expected to
     * include information necessary for conversion and pagination, such as an ID.
     *
     * Updates:
     * - Adds a converted contact data transfer object (DTO) to the `result.contacts` array.
     * - Sets the `lastContactId` in the paginator to the ID of the provided account.
     * - Increments the internal counter used for processing.
     */
    const pushContactToResult = (account: any) => {
      result.contacts.push(this.convertAccountToContactDto(account));
      paginator.set<number>('lastContactId', account.id);
      counter++;
    };

    /**
     * Asynchronously retrieves all active enterprise accounts from the database.
     *
     * This function fetches active accounts associated with a specific enterprise
     * while excluding deleted accounts. Results are paginated using a pagination token.
     *
     * @function
     * @async
     * @returns {Promise<Array<Object>>} Returns a promise that resolves to an array of active enterprise account
     *   objects. The objects include the fields: id, pagerNumber, email, firstName, and lastName.
     */
    const findAllActiveEnterpriseAccounts = async () => {
      const Account = Entities.sequelize.models.Account;
      return await Account.findAll({
        where: {
          id: {
            [Op.gt]: Paginator.parsePaginationToken(nextPageToken).get<number>('lastContactId') || 0
          },
          enterpriseId,
          active: true,
          deleted: false
        },
        attributes: ['id', 'pagerNumber', 'email', 'firstName', 'lastName'],
        order: [['id', 'ASC']]
      });
    };

    /**
     * A function that evaluates whether the given account object matches the provided search criteria.
     * It checks various properties of the account object (pager number, email, first name, and last name)
     * to determine if they include the search string, ignoring case.
     *
     * @param {Object} account - The account object to be evaluated.
     * @param {string} account.pagerNumber - The pager number of the account.
     * @param {string} account.email - The email address of the account.
     * @param {string} account.firstName - The first name of the account holder.
     * @param {string} account.lastName - The last name of the account holder.
     * @returns {boolean} - Returns true if the account matches the search criteria or if the search string is empty or
     *   undefined; otherwise, false.
     */
    const searchCriteria = account => {
      return (
        !search ||
        search.trim() === '' ||
        account.pagerNumber.toLowerCase().includes(search.toLowerCase()) ||
        account.email.toLowerCase().includes(search.toLowerCase()) ||
        account.firstName.toLowerCase().includes(search.toLowerCase()) ||
        account.lastName.toLowerCase().includes(search.toLowerCase())
      );
    };

    const paginator = Paginator.init();
    const result: ContactsDto = { contacts: [], metadata };
    let counter = 0;

    const accounts = await findAllActiveEnterpriseAccounts();

    for (const account of accounts) {
      if (searchCriteria(account)) {
        if (counter <= limit) {
          if (counter < limit) {
            pushContactToResult(account);
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
   * Finds an account by its operation ID and enterprise ID.
   *
   * @param {number} enterpriseId - The ID of the enterprise associated with the account.
   * @param {number} id - The operation ID for the account to be located.
   * @return {Promise<TemplateDto|null>} A Promise resolving to the ContactDto of the found account, or null if no
   *   account is found.
   */
  public async getAccountById(enterpriseId: number, id: number): Promise<ContactDto> | null {
    const Account = Entities.sequelize.models.Account;
    const account = await Account.findOne({
      where: {
        id,
        enterpriseId,
        deleted: false,
        active: true
      }
    });

    if (account) {
      return this.convertAccountToContactDto(account);
    } else {
      return null;
    }
  }

  /**
   * Retrieves a list of contact groups for a specific enterprise, based on provided filtering and pagination
   * parameters.
   *
   * @param {number} enterpriseId - The identifier of the enterprise to retrieve groups for.
   * @param {string} search - A search term to filter groups by name or pager number.
   * @param {string} nextPageToken - A token to specify the starting point for pagination.
   * @param {number} limit - The maximum number of groups to return in the result.
   * @return {Promise<ContactGroupsDto>} A promise returning a ContactGroupsDto object, which contains the list of
   *   contact groups and metadata for pagination.
   */
  async getListOfGroupsEnterpriseId(
    enterpriseId: number,
    search: string,
    nextPageToken: string,
    limit: number
  ): Promise<ContactGroupsDto> {
    const metadata: Metadata = {
      nextPageToken: null
    };

    /**
     * Adds a group and its members to the result set while updating pagination and count.
     *
     * This function converts a given group and its members into a ContactGroupDto
     * and appends it to the result's contacts list. It also updates the paginator
     * with the ID of the last processed group and increments the group counter.
     *
     * @param {GroupEntity} group - The group entity to be added to the result.
     * @param {GroupMemberEntity[]} members - Array of group member entities associated with the provided group.
     * @returns {void} This function does not return a value.
     */
    const pushGroupToResult = (group: GroupEntity, members: GroupMemberEntity[]): void => {
      result.contacts.push(this.convertGroupToContactGroupDto(group, members));

      paginator.set('lastGroupId', group.id);

      counter++;
    };

    const result: ContactGroupsDto = { contacts: [], metadata };
    const paginator = Paginator.parsePaginationToken(nextPageToken);
    let counter = 0;

    let groups = await this.groupRepository.find({ where: { enterpriseId } });

    if (search && search.trim() !== '') {
      groups = groups.filter(
        (x: GroupEntity) =>
          x.pagerNumber.toLowerCase().includes(search.toLowerCase()) ||
          x.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    for (const group of groups) {
      if (counter >= limit) {
        result.metadata.nextPageToken = paginator.getPaginationToken();
        break;
      }

      const members = await this.groupMemberRepository.find({
        where: { groupId: group.id }
      });

      pushGroupToResult(group, members);
    }

    return result;
  }

  /**
   * Creates a new contact account and ensures unique email and OPID within the system.
   *
   * @param {number} enterpriseId - The ID of the enterprise to which the contact belongs.
   * @param {ContactCreateDto} contactCreateDto - The data transfer object containing contact information.
   * @return {Promise<number>} - A promise that resolves to the ID of the newly created contact.
   * @throws {EmailAlreadyRegisteredError} - If the email provided is already registered.
   * @throws {OpidAlreadyRegisteredError} - If the OPID or its corresponding mask is already registered.
   * @throws {InternalServerError} - If the contact account could not be created.
   */
  async createContactV1(enterpriseId: number, contactCreateDto: ContactCreateDto): Promise<number> {
    const accountByEmail = await this.Account.findOne({
      where: { email: Encoder.encryptOnPageSync(contactCreateDto.email) }
    });
    if (accountByEmail) {
      throw new EntityConflictError(`Email "${contactCreateDto.email}" already registered.`);
    }
    const mask = await this.checkOpidAvailabilityAndGetMask(contactCreateDto.opid);

    const createdAccount = await this.Account.create({
      pagerNumber: contactCreateDto.opid,
      alternativePagerNumber: mask,
      firstName: contactCreateDto.firstName,
      lastName: contactCreateDto.lastName,
      email: contactCreateDto.email,
      password: contactCreateDto.password,
      passwordShadow: '',
      phoneNumber: contactCreateDto.phoneNumber,
      howHearAboutUs: '',
      enterpriseId,
      creation: Date(),
      active: true,
      suspend: false,
      deleted: false,
      paid: false,
      evaluation: true,
      evaluationStartDate: new Date(),
      passwordTemporaryFlag: false,
      sendWelcomePage: false,
      enterprisePlan: false,
      latestRevisionTs: Date(),
      secureMessagingFlag: true,
      emailRedundancyFlag: false,
      emailCarbonCopyFlag: false,
      respondByMailFlag: false,
      failedLoginCounter: 0,
      deviceStatusFlag: false,
      createdWithSso: false
    });
    // await MqProducer.addWelcomeMessageToNps({opid: pagerNumber});

    if (createdAccount) {
      return createdAccount.id;
    } else {
      throw new InternalServerError(`Could not create account.`);
    }
  }

  /**
   * Creates a new contact group for the given enterprise and configuration details.
   *
   * @param {number} enterpriseId - The unique identifier of the enterprise for which the contact group is being
   *   created.
   * @param {ContactGroupCreateDto} contactGroupCreateDto - Object containing details required to create the contact
   *   group including OPID, name, description, escalation interval, escalation factor, and escalation settings.
   * @return {Promise<ContactGroup>} Returns a promise that resolves to the created contact group object.
   * @throws {ConflictException} Throws if the given OPID or its generated mask is already registered.
   * @throws {InternalServerErrorException} Throws if the contact group could not be created.
   */
  public async createContactGroupV1(
    enterpriseId: number,
    contactGroupCreateDto: ContactGroupCreateDto
  ): Promise<ContactGroupDto> {
    const { opid, name, description, escalationInterval, escalationFactor, escalation } = contactGroupCreateDto;

    const mask = Utils.generatePagerNumberMask(opid);
    const accountByMask = await this.Account.findOne({ where: { alternativePagerNumber: mask } });
    if (accountByMask) {
      throw new ConflictException(`OPID "${opid}" is already registered.`);
    }

    const Group = Entities.sequelize.models.Group;
    const groupByMask = await Group.findOne({ where: { alternativePagerNumber: mask } });
    if (groupByMask) {
      throw new ConflictException(`OPID mask "${mask}" for OPID ${opid} is already registered.`);
    }

    // const createdGroup: any = await this.Group.create({});
    const newGroupEntity: DeepPartial<GroupEntity> = {
      name,
      description: description || null,
      enterpriseId,
      pagerNumber: opid,
      alternativePagerNumber: mask,
      escalation,
      escalationInterval:
        this.convertDtoGroupEscalationIntervalToEntity(escalationInterval) || ESCALATION_INTERVAL.NONE,
      escalationFactor: this.convertDtoGroupEscalationFactorToEntity(escalationFactor) || ESCALATION_FACTOR.NONE,
      //failOver,
      latestRevision: new Date()
    };
    const createdGroup = await this.groupRepository.save(newGroupEntity);

    // const members = await this.groupMemberRepository.find({ where: { groupId: group.id } });

    if (createdGroup) {
      return this.getContactGroupByIdV1(enterpriseId, createdGroup.id);
    } else {
      throw new InternalServerErrorException(`Could not create group.`);
    }
  }

  /**
   * Updates an existing contact group in the system based on the specified contact group ID and
   * provided data. It validates the group's presence, updates its properties, and saves changes
   * to the database. Additionally, retrieves the updated group details and associated members.
   *
   * @param {number} enterpriseId - The unique identifier of the enterprise associated with the contact group.
   * @param {number} contactGroupId - The unique identifier of the contact group to be updated.
   * @param {ContactGroupUpdateDto} contactGroupDto - An object containing the data to update the contact group, such
   *   as name, description, contacts, escalation policies, and other group properties.
   * @return {Promise<ContactGroupDto>} A Promise that resolves to a ContactGroupDto object containing the details of
   *   the updated contact group.
   */
  public async updateContactGroupV1(
    enterpriseId: number,
    contactGroupId: number,
    contactGroupDto: ContactGroupUpdateDto
  ): Promise<ContactGroupDto> {
    /**
     * Asynchronously retrieves a contact group from the database.
     *
     * @param {number} contactGroupId - The unique identifier of the contact group to be fetched.
     * @returns {Promise<Object|null>} A promise that resolves to the contact group object if found, or null if not
     *   found.
     *
     * @throws {Error} Throws an error if the query to the database fails.
     */
    const getContactGroupFromDB = async (contactGroupId: number): Promise<GroupEntity | null> => {
      return await this.groupRepository.findOne({ where: { id: contactGroupId, enterpriseId } });
    };

    const { name, opid, description, escalationInterval, escalationFactor, escalation } = contactGroupDto;

    const contactGroup = await getContactGroupFromDB(contactGroupId);

    if (!contactGroup) {
      throw new NotFoundException(`Contact group with ID ${contactGroupId} not found.`);
    }

    this.logger.debug(`opid: ${opid}, contactGroupId: ${contactGroupId}`);

    const mask = await this.checkOpidAvailabilityAndGetMask(opid, null, contactGroupId);

    contactGroup.name = name;
    contactGroup.pagerNumber = opid;
    contactGroup.alternativePagerNumber = mask;
    contactGroup.description = description;
    contactGroup.escalationFactor = this.convertDtoGroupEscalationFactorToEntity(escalationFactor);
    contactGroup.escalationInterval = this.convertDtoGroupEscalationIntervalToEntity(escalationInterval);
    contactGroup.escalation = escalation;

    await this.groupRepository.save(contactGroup);

    const updatedContactGroup = await getContactGroupFromDB(contactGroupId);
    const members = await this.groupMemberRepository.find({ where: { groupId: contactGroupId } });

    return this.convertGroupToContactGroupDto(updatedContactGroup, members);
  }

  /**
   * Applies a series of patch operations to an existing contact group and updates it in the data store.
   *
   * @param {number} enterpriseId - The unique identifier of the enterprise to which the contact group belongs.
   * @param {number} contactGroupId - The unique identifier of the contact group to be updated.
   * @param {Operation[]} patchOperations - A list of patch operations to apply to the contact group.
   * @return {Promise<ContactGroupDto>} A promise that resolves to the updated contact group data transfer object.
   */
  public async patchContactGroupV1(
    enterpriseId: number,
    contactGroupId: number,
    patchOperations: Operation[]
  ): Promise<ContactGroupDto> {
    const groupToBeUpdated: ContactGroupDto = await this.getContactGroupByIdV1(enterpriseId, contactGroupId);

    // Apply the patch operations to the item
    const patchedItem = applyPatch(groupToBeUpdated, patchOperations, false).newDocument;
    this.logger.debug(`patchedItem: ${JSON.stringify(patchedItem)}`);

    return await this.updateContactGroupV1(enterpriseId, contactGroupId, patchedItem);
  }

  /**
   * Retrieves a contact group by its ID for a specific enterprise.
   *
   * @param {number} enterpriseId - The ID of the enterprise to which the contact group belongs.
   * @param {number} contactGroupId - The ID of the contact group to retrieve.
   * @return {Promise<ContactGroupDto | null>} A promise that resolves to the contact group data in the form of a
   *   ContactGroupDto if found, or null if not found.
   */
  public async getContactGroupByIdV1(enterpriseId: number, contactGroupId: number): Promise<ContactGroupDto> | null {
    const group = await this.groupRepository.findOne({ where: { id: contactGroupId, enterpriseId } });
    const members = await this.groupMemberRepository.find({ where: { groupId: group.id } });

    return group ? this.convertGroupToContactGroupDto(group, members) : null;
  }

  /**
   * Checks the availability of the given OPID and retrieves the corresponding mask.
   * If the OPID mask or alternative pager number is already associated with an account or group
   * (excluding the specified accountId or groupId), an EntityConflictError will be thrown.
   *
   * @param {string} opid - The operation ID to check and calculate the mask for.
   * @param {number | null} [skipAccountId=null] - Optional account ID to exclude from the conflict check.
   * @param {number | null} [skipGroupId=null] - Optional group ID to exclude from the conflict check.
   * @return {Promise<string>} The generated mask for the provided OPID.
   * @throws {EntityConflictError} If the generated mask is already associated with an account or group.
   */
  private async checkOpidAvailabilityAndGetMask(
    opid: string,
    skipAccountId: number | null = null,
    skipGroupId: number | null = null
  ): Promise<string> {
    const mask = Utils.generatePagerNumberMask(opid);
    const accountByMask = await this.Account.findOne({
      where: { alternativePagerNumber: mask }
    });
    if (accountByMask && accountByMask.id !== skipAccountId) {
      this.logger.debug(`accountByMask: ${accountByMask.id}`);
      throw new ConflictException(`OPID "${opid}" is already registered.`);
    }
    const Group = Entities.sequelize.models.Group;
    const groupByMask = await Group.findOne({
      where: { alternativePagerNumber: mask }
    });
    this.logger.debug(`groupByMask.id !== skipGroupId: ${groupByMask && groupByMask.id !== skipGroupId}`);
    this.logger.debug(`groupByMask.id != skipGroupId: ${groupByMask && groupByMask.id != skipGroupId}`);
    this.logger.debug(`groupByMask.id : ${groupByMask.id} ${typeof groupByMask.id}`);
    this.logger.debug(`skipGroupId : ${skipGroupId} ${typeof skipGroupId}`);
    if (groupByMask && groupByMask.id != skipGroupId) {
      this.logger.debug(`groupIdByMask: ${groupByMask.id}`);
      throw new ConflictException(`OPID mask "${mask}" for OPID ${opid} is already registered.`);
    }
    return mask;
  }

  /**
   * Converts an account object to a ContactDto object.
   *
   * @param {Object} account - The account object containing the details to be converted.
   * @return {ContactDto} Returns a ContactDto object with mapped properties from the account.
   */
  private convertAccountToContactDto(account: any): ContactDto {
    return {
      id: account.id,
      opid: account.pagerNumber,
      status: 'LOGGED-IN',
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      phoneNumber: account.phoneNumber,
      groups: []
    };
  }

  /**
   * Converts an escalation factor from the source type to the corresponding DTO type.
   *
   * @param {ESCALATION_FACTOR} value - The escalation factor to be converted.
   * @return {ESCALATION_FACTOR_DTO} The converted escalation factor DTO. If no corresponding mapping is found, returns
   *   ESCALATION_FACTOR_DTO.NONE.
   */
  private convertGroupEscalationFactorToDto(value: ESCALATION_FACTOR): ESCALATION_FACTOR_DTO {
    return ContactsService.escalationFactorMapping[value] || ESCALATION_FACTOR_DTO.NONE;
  }

  /**
   * Converts a DTO escalation factor to its corresponding entity escalation factor.
   *
   * @param {ESCALATION_FACTOR_DTO} value - The escalation factor value from the DTO that needs to be converted.
   * @return {ESCALATION_FACTOR} Returns the corresponding entity escalation factor. If no match is found, returns the
   *   default value `ESCALATION_FACTOR.NONE`.
   */
  private convertDtoGroupEscalationFactorToEntity(value: ESCALATION_FACTOR_DTO): ESCALATION_FACTOR {
    const mapping = Object.entries(ContactsService.escalationFactorMapping).find(([, dtoValue]) => dtoValue === value);
    return mapping ? (mapping[0] as unknown as ESCALATION_FACTOR) : ESCALATION_FACTOR.NONE;
  }

  /**
   * Converts an escalation interval of type ESCALATION_INTERVAL to its corresponding DTO type ESCALATION_INTERVAL_DTO.
   *
   * @param {ESCALATION_INTERVAL} value - The escalation interval to be converted.
   * @return {ESCALATION_INTERVAL_DTO} The corresponding DTO representation of the given escalation interval.
   */
  private convertGroupEscalationIntervalToDto(value: ESCALATION_INTERVAL): ESCALATION_INTERVAL_DTO {
    return ContactsService.escalationIntervalMapping[value] || ESCALATION_INTERVAL_DTO.NONE;
  }

  /**
   * Converts a DTO type of escalation interval (ESCALATION_INTERVAL_DTO) back to its source type
   * (ESCALATION_INTERVAL).
   *
   * @param {ESCALATION_INTERVAL_DTO} value - The escalation interval DTO to be converted.
   * @return {ESCALATION_INTERVAL} The corresponding source type representation of the given DTO.
   */
  private convertDtoGroupEscalationIntervalToEntity(value: ESCALATION_INTERVAL_DTO): ESCALATION_INTERVAL {
    const mapping = Object.entries(ContactsService.escalationIntervalMapping).find(
      ([, dtoValue]) => dtoValue === value
    );
    return mapping ? (mapping[0] as unknown as ESCALATION_INTERVAL) : ESCALATION_INTERVAL.NONE;
  }

  /**
   * Converts a GroupMemberEntity object to a ContactGroupMemberDto object.
   *
   * @param {GroupMemberEntity} member - The group member entity object to be converted.
   * @return {ContactGroupMemberDto} The converted contact group member DTO object.
   */
  private convertGroupMemberToDto(member: GroupMemberEntity): ContactGroupMemberDto {
    return {
      contactId: member.accountId,
      order: member.escalationOrder
    };
  }

  /**
   * Converts an array of GroupMemberEntity objects to an array of ContactGroupMemberDto objects.
   *
   * @param {GroupMemberEntity[]} members - The array of group member entities to be converted.
   * @return {ContactGroupMemberDto[]} An array of ContactGroupMemberDto objects obtained from the conversion.
   */
  private convertGroupMembersToDto(members: GroupMemberEntity[]): ContactGroupMemberDto[] {
    return members.map(member => this.convertGroupMemberToDto(member));
  }

  /**
   * Converts a GroupEntity and its members into a ContactGroupDto.
   *
   * @param {GroupEntity} group - The group entity containing group details.
   * @param {GroupMemberEntity[]} members - The group members associated with the group.
   * @return {ContactGroupDto} The converted ContactGroupDto object containing group and member details.
   */
  private convertGroupToContactGroupDto(group: GroupEntity, members: GroupMemberEntity[]): ContactGroupDto {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      opid: group.pagerNumber,
      escalation: group.escalation,
      escalationFactor: this.convertGroupEscalationFactorToDto(group.escalationFactor),
      escalationInterval: this.convertGroupEscalationIntervalToDto(group.escalationInterval),
      contacts: this.convertGroupMembersToDto(members),
      failOver: {
        includeOriginalMessage: group.failOverIncludeOriginalMessage,
        emails: group.failReportEmail ? group.failReportEmail.split(';') : [],
        contacts: group.failOverOpids
          ? group.failOverOpids
              .split(';')
              .map((x: string) => x.trim())
              .filter((x: string) => x.trim() !== '')
              .map(Number)
          : [],
        groups: group.failOverGroupOpids
          ? group.failOverGroupOpids
              .split(';')
              .map((x: string) => x.trim())
              .filter((x: string) => x.trim() !== '')
              .map(Number)
          : []
      }
    };
  }
}
