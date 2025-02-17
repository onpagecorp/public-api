import { Injectable, Logger } from '@nestjs/common';
import { ContactsStatusDto } from '../dto/contacts-status-dto';
import { entity as Entities } from '@onpage-corp/onpage-domain-mysql';
import { Metadata } from '../interfaces/metadata.interface';

@Injectable()
export class ContactsStatusService {
  private readonly logger = new Logger(ContactsStatusService.name);

  /**
   * Retrieves the status of accounts for a given enterprise.
   *
   * @param {number} enterpriseId - The ID of the enterprise for which to fetch account statuses.
   * @param {string} [search=''] - A search string to filter accounts by their pager number, email, first name, or last name.
   * @param {number} [offset=0] - The offset for pagination.
   * @param {number} [limit=10] - The limit indicating the maximum number of records to fetch.
   * @return {Promise<ContactsStatusDto>} A promise that resolves to an object containing the status of loggedIn, loggedOff, and pagerOff contacts and metadata.
   */
  public async getAccountsStatusV1(
    enterpriseId: number,
    search: string = '',
    offset: number = 0,
    limit: number = 10
  ): Promise<ContactsStatusDto> {
    this.logger.debug(
      `getAccountsStatusV1: enterpriseId: ${enterpriseId}, search: ${search}, offset: ${offset}, limit: ${limit}`
    );

    const metadata: Metadata = {
      hasMoreData: false
    };

    const result: ContactsStatusDto = {
      contactsStatus: {
        loggedIn: [],
        loggedOff: [],
        pagerOff: []
      },
      metadata
    };

    const pushContactToResult = (account: any) => {
      result.contactsStatus.loggedIn.push(account.pagerNumber);
    };

    const Account = Entities.sequelize.models.Account;
    let accounts = await Account.findAll({
      where: {
        enterpriseId,
        active: true,
        deleted: false
      },
      offset: offset * limit
    });

    if (!(search && search.trim() === '')) {
      accounts = accounts.filter(
        (account) =>
          account.pagerNumber.toLowerCase().includes(search.toLowerCase()) ||
          account.email.toLowerCase().includes(search.toLowerCase()) ||
          account.firstName.toLowerCase().includes(search.toLowerCase()) ||
          account.lastName.toLowerCase().includes(search.toLowerCase())
      );
    }

    accounts.forEach((account) => pushContactToResult(account));

    this.logger.debug(
      `getAccountsStatusV1: ${result.contactsStatus.loggedIn.length} loggedIn, ${result.contactsStatus.loggedOff.length} loggedOff, ${result.contactsStatus.pagerOff.length} pagerOff`
    );

    return result;
  }
}
