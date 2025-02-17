import { Injectable, Logger } from '@nestjs/common';
import { AdministratorsDto } from '../dto/administrators-dto';
import { Metadata } from '../interfaces/metadata.interface';
import { entity as Entities } from '@onpage-corp/onpage-domain-mysql';
import { DispatcherDto } from '../dto/dispatcher-dto';

@Injectable()
export class AdministratorsService {
  private readonly logger = new Logger(AdministratorsService.name); // Scoped logger

  public async findAllActive(
    enterpriseId: number,
    search: string = '',
    offset: number = 0,
    limit: number = 10
  ): Promise<AdministratorsDto> {
    const metadata: Metadata = {
      hasMoreData: false
    };

    const result: AdministratorsDto = { administrators: [], metadata };

    let counter = 0;

    /**
     * Function to push a dispatcher to the result's administrators list.
     * Converts the given dispatcher to an administrator DTO before appending.
     *
     * @param {any} dispatcher - The dispatcher object to be converted and added to the administrators list.
     */
    const pushDispatcherToResult = (dispatcher: any) => {
      result.administrators.push(
        this.convertDispatcherToAdministratorDto(dispatcher)
      );

      counter++;
    };

    const Dispatcher = Entities.sequelize.models.Dispatcher;
    const dispatchers = await Dispatcher.findAll({
      where: {
        enterpriseId,
        active: true,
        deleted: false
      },
      offset: offset * limit
    });

    for (const dispatcher of dispatchers) {
      if (counter >= limit) {
        result.metadata.hasMoreData = true;
        break;
      }
      if (!search || search.trim() === '') {
        pushDispatcherToResult(dispatcher);
      } else if (
        dispatcher.email.toLowerCase().includes(search.toLowerCase()) ||
        dispatcher.firstName.toLowerCase().includes(search.toLowerCase()) ||
        dispatcher.lastName.toLowerCase().includes(search.toLowerCase())
      ) {
        pushDispatcherToResult(dispatcher);
      }
    }

    return result;
  }

  public async getDispatcherById(
    enterpriseId: number,
    id: number
  ): Promise<DispatcherDto> | null {
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
      return this.convertDispatcherToAdministratorDto(dispatcher);
    } else {
      return null;
    }
  }

  private convertDispatcherToAdministratorDto(
    dispatcher: any
  ): DispatcherDto {
    return {
      id: dispatcher.id,
      opid: dispatcher.pagerNumber,
      firstName: dispatcher.firstName,
      lastName: dispatcher.lastName,
      email: dispatcher.email,
      phoneNumber: dispatcher.phoneNumber,
      groups: [],
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
        editSchedule: dispatcher.canEditGroupFlag,
        viewReports: dispatcher.viewReportsFlag
      }
    };
  }
}
