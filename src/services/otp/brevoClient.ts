import * as SibApiV3Sdk from '@sendinblue/client';

type EmailData = {
  sender: { email: string; name: string };
  to: { email: string }[];
  subject: string;
  htmlContent: string;
};

export default class BrevoClient {
  private apiInstance: SibApiV3Sdk.TransactionalEmailsApi;

  constructor() {
    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      throw new Error('BREVO_API_KEY no está definido en las variables de entorno');
    }

    this.apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, apiKey);
  }

  public async sendTransacEmail(emailData: EmailData): Promise<void> {
    try {
      await this.apiInstance.sendTransacEmail(emailData);
    } catch (error) {
      console.error('Brevo error:', error);
      throw new Error('Error enviando el correo');
    }
  }
}
