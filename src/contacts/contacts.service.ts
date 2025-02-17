import { Injectable, Logger } from '@nestjs/common';
import { Metadata } from '../interfaces/metadata.interface';
import { entity as Entities } from '@onpage-corp/onpage-domain-mysql';
import { ContactsDto } from '../dto/contacts-dto';
import { ContactDto } from '../dto/contact-dto';
import { ContactGroupsDto } from '../dto/contact-groups-dto';
import {
  ContactGroupDto,
  ESCALATION_FACTOR_DTO,
  ESCALATION_INTERVAL_DTO
} from '../dto/contact-group-dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ESCALATION_FACTOR,
  ESCALATION_INTERVAL,
  GroupEntity
} from '../entity/group-entity';
import { Repository } from 'typeorm';
import { GroupMemberEntity } from '../entity/group-member-entity';
import { ContactGroupMemberDto } from '../dto/contact-group-member-dto';

@Injectable()
export class ContactsService {
  private static readonly escalationIntervalMapping: Record<
    ESCALATION_INTERVAL,
    ESCALATION_INTERVAL_DTO
  > = {
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
  private static readonly escalationFactorMapping: Record<
    ESCALATION_FACTOR,
    ESCALATION_FACTOR_DTO
  > = {
    [ESCALATION_FACTOR.NONE]: ESCALATION_FACTOR_DTO.NONE,
    [ESCALATION_FACTOR.DELIVERED]: ESCALATION_FACTOR_DTO.DELIVERED,
    [ESCALATION_FACTOR.READ]: ESCALATION_FACTOR_DTO.READ,
    [ESCALATION_FACTOR.REPLIED]: ESCALATION_FACTOR_DTO.REPLIED
  };
  private readonly logger = new Logger(ContactsService.name); // Scoped logger

  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
    @InjectRepository(GroupMemberEntity)
    private readonly groupMemberRepository: Repository<GroupMemberEntity>
  ) {}

  /**
   * Fetches all active contacts for the given enterprise. Supports optional search, pagination,
   * and limits the number of results returned.
   *
   * @param {number} enterpriseId - The identifier of the enterprise to fetch active contacts for.
   * @param {string} [search=''] - Optional search string to filter contacts by pager number, email, first name, or last name.
   * @param {number} [offset=0] - The offset for pagination, representing the current page.
   * @param {number} [limit=10] - The maximum number of contacts to return per page.
   * @return {Promise<ContactsDto>} A promise resolving to an object containing the list of active contacts and metadata indicating if more data is available.
   */
  public async findAllActive(
    enterpriseId: number,
    search: string = '',
    offset: number = 0,
    limit: number = 10
  ): Promise<ContactsDto> {
    const metadata: Metadata = {
      hasMoreData: false
    };

    const result: ContactsDto = { contacts: [], metadata };

    let counter = 0;

    const pushContactToResult = (account: any) => {
      result.contacts.push(this.convertAccountToContactDto(account));

      counter++;
    };

    const Account = Entities.sequelize.models.Account;
    const accounts = await Account.findAll({
      where: {
        enterpriseId,
        active: true,
        deleted: false
      },
      offset: offset * limit
    });

    for (const account of accounts) {
      if (counter >= limit) {
        result.metadata.hasMoreData = true;
        break;
      }
      if (!search || search.trim() === '') {
        pushContactToResult(account);
      } else if (
        account.pagerNumber.toLowerCase().includes(search.toLowerCase()) ||
        account.email.toLowerCase().includes(search.toLowerCase()) ||
        account.firstName.toLowerCase().includes(search.toLowerCase()) ||
        account.lastName.toLowerCase().includes(search.toLowerCase())
      ) {
        pushContactToResult(account);
      }
    }

    return result;
  }

  /**
   * Finds an account by its operation ID and enterprise ID.
   *
   * @param {number} enterpriseId - The ID of the enterprise associated with the account.
   * @param {number} id - The operation ID for the account to be located.
   * @return {Promise<TemplateDto|null>} A Promise resolving to the ContactDto of the found account, or null if no account is found.
   */
  public async getAccountById(
    enterpriseId: number,
    id: number
  ): Promise<ContactDto> | null {
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
   * Retrieves a paginated list of contact groups for the given enterprise ID, filtered by an optional search term.
   *
   * @param {bigint} enterpriseId - The ID of the enterprise whose contact groups need to be fetched.
   * @param {string} search - An optional search term to filter contact groups by pager number or name.
   * @param {number} offset - The page offset for paginated results.
   * @param {number} limit - The maximum number of contact groups to retrieve per page.
   * @return {Promise<ContactGroupsDto>} A promise that resolves to an object containing the list of contact groups and metadata about the pagination.
   */
  async getListOfGroupsEnterpriseId(
    enterpriseId: bigint,
    search: string,
    offset: number,
    limit: number
  ): Promise<ContactGroupsDto> {
    const metadata: Metadata = {
      hasMoreData: false
    };

    const result: ContactGroupsDto = { contacts: [], metadata };

    let counter = 0;

    const pushGroupToResult = (
      group: GroupEntity,
      members: GroupMemberEntity[]
    ): void => {
      result.contacts.push(this.convertGroupToContactGroupDto(group, members));

      counter++;
    };

    let groups = await this.groupRepository.find({
      where: { enterpriseId },
      skip: offset * limit
    });

    if (search && search.trim() !== '') {
      groups = groups.filter(
        (x: GroupEntity) =>
          x.pagerNumber.toLowerCase().includes(search.toLowerCase()) ||
          x.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    for (const group of groups) {
      if (counter >= limit) {
        result.metadata.hasMoreData = true;
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
   * @return {ESCALATION_FACTOR_DTO} The converted escalation factor DTO. If no corresponding mapping is found, returns ESCALATION_FACTOR_DTO.NONE.
   */
  private convertGroupEscalationFactorToDto(
    value: ESCALATION_FACTOR
  ): ESCALATION_FACTOR_DTO {
    return (
      ContactsService.escalationFactorMapping[value] ||
      ESCALATION_FACTOR_DTO.NONE
    );
  }

  /**
   * Converts an escalation interval of type ESCALATION_INTERVAL to its corresponding DTO type ESCALATION_INTERVAL_DTO.
   *
   * @param {ESCALATION_INTERVAL} value - The escalation interval to be converted.
   * @return {ESCALATION_INTERVAL_DTO} The corresponding DTO representation of the given escalation interval.
   */
  private convertGroupEscalationIntervalToDto(
    value: ESCALATION_INTERVAL
  ): ESCALATION_INTERVAL_DTO {
    return (
      ContactsService.escalationIntervalMapping[value] ||
      ESCALATION_INTERVAL_DTO.NONE
    );
  }

  /**
   * Converts a GroupMemberEntity object to a ContactGroupMemberDto object.
   *
   * @param {GroupMemberEntity} member - The group member entity object to be converted.
   * @return {ContactGroupMemberDto} The converted contact group member DTO object.
   */
  private convertGroupMemberToDto(
    member: GroupMemberEntity
  ): ContactGroupMemberDto {
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
  private convertGroupMembersToDto(
    members: GroupMemberEntity[]
  ): ContactGroupMemberDto[] {
    return members.map((member) => this.convertGroupMemberToDto(member));
  }

  /**
   * Converts a GroupEntity and its members into a ContactGroupDto.
   *
   * @param {GroupEntity} group - The group entity containing group details.
   * @param {GroupMemberEntity[]} members - The group members associated with the group.
   * @return {ContactGroupDto} The converted ContactGroupDto object containing group and member details.
   */
  private convertGroupToContactGroupDto(
    group: GroupEntity,
    members: GroupMemberEntity[]
  ): ContactGroupDto {
    return {
      id: group.id,
      name: group.name,
      opid: group.pagerNumber,
      escalation: group.escalation,
      escalationFactor: this.convertGroupEscalationFactorToDto(
        group.escalationFactor
      ),
      escalationInterval: this.convertGroupEscalationIntervalToDto(
        group.escalationInterval
      ),
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
