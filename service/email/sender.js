import nodemailer from 'nodemailer';

class SenderNodemailer {
  async send(msg) {
    const config = {
      host: 'smtp.meta.ua',
      port: 465,
      secure: true,
      auth: {
        user: process.env.USER_NODEMAILER,
        pass: process.env.PASSWORD_NODEMAILER,
      },
    };
    // console.log('USER_NODEMAILER', process.env.USER_NODEMAILER);
    const transporter = nodemailer.createTransport(config);
    return await transporter.sendMail({
      ...msg,
      from: process.env.USER_NODEMAILER,
    });
  }
}

export { SenderNodemailer };
