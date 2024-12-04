import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {
    SendGrid.setApiKey(this.configService.get<string>('app.email.sendgridApiKey'));
  }

  async sendEmail(to: string, subject: string, content: string): Promise<void> {
    const msg = {
      to,
      from: this.configService.get<string>('app.email.fromEmail'),
      subject,
      text: content,
      html: content,
    };

    try {
      await SendGrid.send(msg);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}