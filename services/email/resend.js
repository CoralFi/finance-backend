import { Resend } from 'resend';
import getCodeEmailBody from '../../utils/sendCodeBody.js';

class ResendService {
    constructor() {
        if (!process.env.RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY is not defined');
        }
        this.apiKey = process.env.RESEND_API_KEY;
    }

    async sendCodeEmail(email, subject, code) {
        const resend = new Resend(this.apiKey);
        await resend.emails.send({
            from: 'noreply@coralfinance.io',
            to: email,
            subject: subject,
            html: getCodeEmailBody(email, code),
        });
    }
}

export default ResendService;
