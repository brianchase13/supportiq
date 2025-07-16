export class EmailService {
  static sendEmail = jest.fn().mockResolvedValue({ success: true, messageId: 'mock-message-id' });
  static sendTrialExpirationEmail = jest.fn().mockResolvedValue({ success: true, messageId: 'mock-trial-expiration-id' });
  static sendSubscriptionSyncEmail = jest.fn().mockResolvedValue({ success: true, messageId: 'mock-subscription-sync-id' });
  static sendLeadNotificationEmail = jest.fn().mockResolvedValue({ success: true, messageId: 'mock-lead-notification-id' });
}

export default EmailService; 