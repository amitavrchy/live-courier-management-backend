import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import { Env } from '@/common/enum/env.enum';
import { SendEmailJobData } from './mail.types';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private smtpReady = false;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const host = this.readEnv(Env.SMTP_HOST);
    const port = Number(this.readEnv(Env.SMTP_PORT) ?? 587);
    const user = this.readEnv(Env.SMTP_USER);
    const pass = this.readEnv(Env.SMTP_PASS)?.replace(/\s+/g, '');

    if (!host || !user || !pass) {
      this.logger.warn(
        `SMTP incomplete (host=${Boolean(host)}, user=${Boolean(user)}, pass=${Boolean(pass)}) — emails will be logged only`,
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      requireTLS: port === 587,
      auth: { user, pass },
    });

    try {
      await this.transporter.verify();
      this.smtpReady = true;
      this.logger.log(`SMTP ready → ${user}@${host}:${port}`);
    } catch (error) {
      this.smtpReady = false;
      this.transporter = null;
      this.logger.error(
        `SMTP verify failed: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  /** Universal send used by the queue worker (and direct callers if needed). */
  async sendEmail(
    data: SendEmailJobData,
  ): Promise<{ messageId?: string; queuedFallback?: boolean }> {
    const from =
      data.from ??
      this.readEnv(Env.SMTP_FROM) ??
      'AndYesQo <noreply@andyesqo.local>';

    const mail = {
      from,
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.html,
    };

    if (!this.transporter || !this.smtpReady) {
      this.logger.warn(
        `DEV mail fallback → to=${Array.isArray(data.to) ? data.to.join(',') : data.to} subject="${data.subject}"`,
      );
      if (data.text) {
        this.logger.warn(data.text);
      }
      return { queuedFallback: true };
    }

    const info = await this.transporter.sendMail(mail);
    return { messageId: info.messageId };
  }

  private readEnv(key: Env): string | undefined {
    const fromConfig = this.config.get<string>(key);
    const value = fromConfig ?? process.env[key];
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }
}
