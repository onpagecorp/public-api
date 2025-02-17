import { entity as Entities } from '@onpage-corp/onpage-domain-mysql';

export enum AttachmentFileType {
  IMAGE = 0,
  VIDEO = 1,
  AUDIO = 2,
  TEXT = 3,
  MSWORD = 4,
  PDF = 5,
  OTHER = 99
}

export class Utils {
  private static readonly Account = Entities.sequelize.models.Account;
  private static readonly Group = Entities.sequelize.models.Group;

  static getAttachmentTypeFromMimeType(mimeType: string): AttachmentFileType {
    if (mimeType.startsWith('image/')) {
      return AttachmentFileType.IMAGE;
    }
    if (mimeType.startsWith('video/')) {
      return AttachmentFileType.VIDEO;
    }
    if (mimeType.startsWith('audio/')) {
      return AttachmentFileType.AUDIO;
    }
    if (
      mimeType.startsWith('text/') || // Covers text/plain, text/csv, text/html, etc.
      mimeType === 'application/json' ||
      mimeType === 'application/javascript' ||
      mimeType === 'application/xml'
    ) {
      return AttachmentFileType.TEXT;
    }
    if (mimeType === 'application/pdf') {
      return AttachmentFileType.PDF;
    }
    if (
      mimeType === 'application/msword' ||
      mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return AttachmentFileType.MSWORD;
    }
    return AttachmentFileType.OTHER; // Default fallback
  }

  static async proceedRecipients(recipients: string[]) {
    const individualRecipients = new Set<string>();
    const regularGroupRecipients = new Set<string>();
    const escalationGroupRecipients = new Set<string>();
    const nonExistingRecipients = new Set<string>();

    const recipientPromises = recipients.map(async (recipient) => {
      const account = await Utils.Account.findOne({
        where: { pagerNumber: recipient }
      });
      if (account) {
        individualRecipients.add(recipient);
        return;
      }

      const group = await Utils.Group.findOne({
        where: { pagerNumber: recipient }
      });
      if (group) {
        if (group.escalation) {
          escalationGroupRecipients.add(recipient);
        } else {
          regularGroupRecipients.add(recipient);
        }
      } else {
        nonExistingRecipients.add(recipient);
      }
    });

    await Promise.all(recipientPromises);

    return {
      nonExistingRecipients: Array.from(nonExistingRecipients),
      individualRecipients: Array.from(individualRecipients),
      regularGroupRecipients: Array.from(regularGroupRecipients),
      escalationGroupRecipients: Array.from(escalationGroupRecipients),
      hasNoRecipients:
        individualRecipients.size === 0 &&
        regularGroupRecipients.size === 0 &&
        escalationGroupRecipients.size === 0
    };
  }
}
