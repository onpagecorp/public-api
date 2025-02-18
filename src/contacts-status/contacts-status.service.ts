import { Injectable, Logger } from '@nestjs/common';
import { ContactsStatusDto } from '../dto/contacts-status-dto';
import { entity as Entities } from '@onpage-corp/onpage-domain-mysql';
import { Metadata } from '../interfaces/metadata.interface';

@Injectable()
export class ContactsStatusService {
  private readonly logger = new Logger(ContactsStatusService.name);

  /**
   * Retrieves the account status information for a specific enterprise.
   * The method filters and categorizes the accounts into groups based on their logged-in, logged-off, and pager-off statuses.
   *
   * @param {number} enterpriseId - The unique identifier of the enterprise to retrieve accounts for.
   * @param {string} [search=''] - A search query to filter accounts based on properties like pager number, email, first name, or last name. Defaults to an empty string for no search filter.
   * @param {string} [filter=''] - A filter to categorize accounts. Valid values are "logged-in", "logged-out", or "pager-off". Defaults to an empty string for no filtering.
   * @param {number} [offset=0] - Pagination offset. Specifies the page to retrieve based on the number of results per page (`limit`). Defaults to 0.
   * @param {number} [limit=10] - The maximum number of accounts to return per page. Defaults to 10.
   * @return {Promise<ContactsStatusDto>} A Promise resolving to an object containing categorized account statuses and metadata. Categorized statuses include "loggedIn", "loggedOff", and "pagerOff".
   */
  public async getAccountsStatusV1(
    enterpriseId: number,
    search: string = '',
    filter: string = '',
    offset: number = 0,
    limit: number = 10
  ): Promise<ContactsStatusDto> {
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

    let counter = 0;

    const collectLoggedOffContacts =
      !filter || filter.trim() === '' || filter === 'logged-out';

    const collectPagerOffContacts =
      !filter || filter.trim() === '' || filter === 'pager-off';

    const collectLoggedInContacts =
      !filter || filter.trim() === '' || filter === 'logged-in';

    const pushContactToResult = async (account: any) => {
      const device = await account.Device;
      this.logger.debug(
        `Account ${account.id} ${JSON.stringify(device?.pagerOn)}`
      );
      this.logger.debug(
        `Counter: ${counter}, offest: ${offset}, limit: ${limit}`
      );
      if (!device) {
        if (collectLoggedOffContacts) {
          if (counter++ >= offset * limit) {
            result.contactsStatus.loggedOff.push(account.id);
          }
        }
      } else {
        if (!device.pagerOn) {
          if (collectPagerOffContacts) {
            if (counter++ >= offset * limit) {
              result.contactsStatus.pagerOff.push(account.id);
            }
          }
        } else {
          if (collectLoggedInContacts) {
            if (counter++ >= offset * limit) {
              result.contactsStatus.loggedIn.push(account.id);
            }
          }
        }
      }
    };

    const Account = Entities.sequelize.models.Account;
    let accounts = await Account.findAll({
      where: {
        enterpriseId,
        active: true,
        deleted: false
      },
      include: {
        model: Entities.sequelize.models.Device,
        required: false
      }
      // offset: offset * limit
    });

    if (search && search.trim() !== '') {
      accounts = accounts.filter(
        (account) =>
          account.pagerNumber.toLowerCase().includes(filter.toLowerCase()) ||
          account.email.toLowerCase().includes(filter.toLowerCase()) ||
          account.firstName.toLowerCase().includes(filter.toLowerCase()) ||
          account.lastName.toLowerCase().includes(filter.toLowerCase())
      );
    }

    for (const account of accounts) {
      if (counter >= offset * limit + limit) {
        result.metadata.hasMoreData = true;
        break;
      }
      await pushContactToResult(account);
    }

    return result;
  }
}
