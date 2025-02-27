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
  // based on a traditional phone keypad
  private static readonly LETTER_TO_DIGIT_MAP: Record<string, string> = {
    a: '2',
    b: '2',
    c: '2',
    d: '3',
    e: '3',
    f: '3',
    g: '4',
    h: '4',
    i: '4',
    j: '5',
    k: '5',
    l: '5',
    m: '6',
    n: '6',
    o: '6',
    p: '7',
    q: '7',
    r: '7',
    s: '7',
    t: '8',
    u: '8',
    v: '8',
    w: '9',
    x: '9',
    y: '9',
    z: '9'
  };

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

  // Extracted constant for letter-to-digit mapping

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

  /**
   * Converts an alphanumeric operation identifier (opid) into a numeric pager number mask
   * by mapping letters to digits based on a traditional telephone keypad layout.
   *
   * @param {string} opid - The operation identifier to be converted.
   * @return {string} - A string containing the numeric pager mask representation.
   */
  public static generatePagerNumberMask(opid: string): string {
    return Array.from(opid.toLowerCase())
      .map(Utils.mapCharacterToDigit)
      .join('');
  }

  /**
   * Helper function to map a single character to its numeric equivalent
   * or return the character unchanged if no mapping exists.
   *
   * @param {string} char - The input character to be converted.
   * @return {string} - The numeric equivalent or the original character.
   */
  private static mapCharacterToDigit(char: string): string {
    return Utils.LETTER_TO_DIGIT_MAP[char] || char;
  }
}
