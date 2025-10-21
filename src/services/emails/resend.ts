import { Resend } from 'resend';
import getCodeEmailBody from '../../utils/sendCodeBody';
// import getResetPasswordEmailBody from '../../utils/sendResetPasswordBody';
import getConfirmResetPasswordEmailBody from '../../utils/confirmResetPasswordBody';
import getSendConfirmEmailBody from '../../utils/sendConfirmEmailBody';
// import getSendConfirmedEmailBody from '../../utils/SendConfirmedEmailBody';

export default class ResendService {
  private apiKey: string;

  constructor() {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not defined');
    }
    this.apiKey = process.env.RESEND_API_KEY;
  }

  async sendCodeEmail(email: string, subject: string,  code: number): Promise<void> {
    const resend = new Resend(this.apiKey);
    await resend.emails.send({
      from: 'noreply@coralfinance.io',
      to: email,
      subject,
      html: getCodeEmailBody(email, code),
    });
  }

  // async sendResetPasswordEmail(email: string, name: string, subject: string, resetLink: string): Promise<void> {
  //   const resend = new Resend(this.apiKey);
  //   await resend.emails.send({
  //     from: 'noreply@coralfinance.io',
  //     to: email,
  //     subject,
  //     html: getResetPasswordEmailBody(name, resetLink),
  //   });
  // }

  async sendConfirmResetPasswordEmail(email: string, name: string, subject: string): Promise<void> {
    const resend = new Resend(this.apiKey);
    await resend.emails.send({
      from: 'noreply@coralfinance.io',
      to: email,
      subject,
      html: getConfirmResetPasswordEmailBody(name),
    });
  }

  async sendConfirmEmail(email: string, name: string, subject: string, resetLink: string): Promise<void> {
    const resend = new Resend(this.apiKey);
    await resend.emails.send({
      from: 'noreply@coralfinance.io',
      to: email,
      subject,
      html: getSendConfirmEmailBody(name, resetLink),
    });
  }

  // async sendConfirmedEmail(email: string, name: string, subject: string): Promise<void> {
  //   const resend = new Resend(this.apiKey);
  //   await resend.emails.send({
  //     from: 'noreply@coralfinance.io',
  //     to: email,
  //     subject,
  //     html: getSendConfirmedEmailBody(name),
  //   });
  // }

  // async sendEmail(email: string, subject: string, htmlContent: string): Promise<void> {
  //   const resend = new Resend(this.apiKey);
  //   await resend.emails.send({
  //     from: 'noreply@coralfinance.io',
  //     to: email,
  //     subject,
  //     html: htmlContent,
  //   });
  // }

  async sendPasswordChangeNotification(email: string, name: string, subject: string): Promise<void> {
    const resend = new Resend(this.apiKey);
    await resend.emails.send({
      from: 'noreply@coralfinance.io',
      to: email,
      subject,
      html: getConfirmResetPasswordEmailBody(name),
    });
  }
}

