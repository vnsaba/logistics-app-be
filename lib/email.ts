import nodemailer, { SendMailOptions } from 'nodemailer';
import path from 'path';
import hbs, {
  NodemailerExpressHandlebarsOptions,
} from 'nodemailer-express-handlebars';

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
  viewPath: path.resolve(__dirname, '../templates'),
};

transporter.use(
  'compile',
  hbs(hbsOptions as NodemailerExpressHandlebarsOptions)
);

export const sendEmail = async ({
  to,
  subject,
  template,
  context,
}: {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}) => {
  try {
    const mailOptions: SendMailOptions & {
      template: string;
      context: Record<string, any>;
    } = {
      from: EMAIL_USER,
      to,
      subject,
      template,
      context,
    };

    await transporter.sendMail(mailOptions);

    console.log('Email sent successfully!');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
