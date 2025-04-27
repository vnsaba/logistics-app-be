import { EmailSenderInterface } from "../domain/emailSender.interface";
import nodemailer, { SendMailOptions } from 'nodemailer';
import path from 'path';
import hbs, { NodemailerExpressHandlebarsOptions } from 'nodemailer-express-handlebars';
const { EMAIL_USER, EMAIL_PASSWORD } = process.env;


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
    },
});

const hbsOptions = {
    viewEngine: {
        defaultLayout: false,
    },
    viewPath: path.resolve(__dirname, '../../../templates'),
};

transporter.use(
    'compile',
    hbs(hbsOptions as NodemailerExpressHandlebarsOptions)
);

export class NodemailerEmailSender implements EmailSenderInterface {


    // async sendCodeVerification(email: string, subject: string,): Promise<void> {
    //     await this.sendEmail({ to: email, subject: subject, template: '', context: { text } });
    // }


    // async sendResetPasswordLink(email: string, token: string): Promise<void> {
    //     const resetLink = ` http://localhost:${process.env.PORT}/users/reset-password?token=${token}`;
    //     await this.sendEmail({ to: email, subject: 'Reset Password', template: 'resetPasswordEmail', context: { resetLink } });
    // }

    async sendEmail({ to, subject, template, context }: {
        to: string;
        subject: string;
        template: string;
        context: Record<string, any>;
    }): Promise<void> {
        if (!EMAIL_USER || !EMAIL_PASSWORD) {
            throw new Error('Email configuration is missing.');
        }
        if (!to || !subject || !template) {
            throw new Error('Missing required parameters: to, subject, template.');
        }
        try {
            const mailOptions: SendMailOptions & { template: string; context: Record<string, any> } = {
                from: EMAIL_USER,
                to,
                subject,
                template,
                context,
            };

            await transporter.sendMail(mailOptions);
            console.log(`Email sent successfully to ${to}`);
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send email.');
        }
    }

}
