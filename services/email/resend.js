import { Resend } from 'resend';
import getCodeEmailBody from '../../utils/sendCodeBody.js';
import getResetPasswordEmailBody from '../../utils/sendResetPasswordBody.js';
import getConfirmResetPasswordEmailBody from '../../utils/confirmResetPasswordBody.js';
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

    async sendResetPasswordEmail(email, subject, resetLink) {
        const resend = new Resend(this.apiKey);
        await resend.emails.send({
            from: 'noreply@coralfinance.io',
            to: email,
            subject: subject,
            html: getResetPasswordEmailBody(email, resetLink),
        });
    }

    async sendConfirmResetPasswordEmail(email, subject) {
        const resend = new Resend(this.apiKey);
        await resend.emails.send({
            from: 'noreply@coralfinance.io',
            to: email,
            subject: subject,
            html: getConfirmResetPasswordEmailBody(email),
        });
    }
}

export default ResendService;
