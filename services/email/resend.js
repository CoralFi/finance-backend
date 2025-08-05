import { Resend } from 'resend';
import getCodeEmailBody from '../../utils/sendCodeBody.js';
import getResetPasswordEmailBody from '../../utils/sendResetPasswordBody.js';
import getConfirmResetPasswordEmailBody from '../../utils/confirmResetPasswordBody.js';
import getSendConfirmEmailBody from '../../utils/sendConfirmEmailBody.js';
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

    async sendResetPasswordEmail(email, name, subject, resetLink) {
        const resend = new Resend(this.apiKey);
        await resend.emails.send({
            from: 'noreply@coralfinance.io',
            to: email,
            subject: subject,
            html: getResetPasswordEmailBody(name, resetLink),
        });
    }

    async sendConfirmResetPasswordEmail(email, name, subject) {
        const resend = new Resend(this.apiKey);
        await resend.emails.send({
            from: 'noreply@coralfinance.io',
            to: email,
            subject: subject,
            html: getConfirmResetPasswordEmailBody(name),
        });
    }

    async sendConfirmEmail(email, name, subject, resetLink) {
        const resend = new Resend(this.apiKey);
        await resend.emails.send({
            from: 'noreply@coralfinance.io',
            to: email,
            subject: subject,
            html: getSendConfirmEmailBody(name, resetLink),
        });
    }
}

export default ResendService;
