import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private twilioClient: twilio.Twilio;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('app.sms.twilioAccountSid');
    const authToken = this.configService.get<string>('app.sms.twilioAuthToken');
    this.twilioClient = twilio(accountSid, authToken);
  }

  async sendSms(to: string, message: string): Promise<void> {
    try {
      await this.twilioClient.messages.create({
        body: message,
        from: this.configService.get<string>('app.sms.twilioPhoneNumber'),
        to,
      });
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }
}