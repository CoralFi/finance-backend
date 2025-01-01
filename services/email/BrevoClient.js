import * as SibApiV3Sdk from '@sendinblue/client';

class BrevoClient {
    constructor() {
        this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        this.apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
    }

    async sendTransacEmail(emailData) {
        try {
            await this.apiInstance.sendTransacEmail(emailData);
        } catch (error) {
            throw new Error('Error sending email');
        }
    }
}

export default BrevoClient;