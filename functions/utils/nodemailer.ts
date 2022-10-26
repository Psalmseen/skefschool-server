import nodemailer from 'nodemailer';
import smtp from 'nodemailer-smtp-transport';

export const nodeTransport = nodemailer.createTransport(
  smtp({
    host: 'in.mailjet.com',
    port: 2525,
    auth: {
      user: '3c870258cec570b8c7bd4b20765f1cf8',
      pass: '138e9b4592df087fe258d0f50873dca6',
    },
  })
);
