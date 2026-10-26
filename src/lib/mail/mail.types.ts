export const MAIL_QUEUE = 'mail';

export type SendEmailJobData = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
};
