import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: true, // Use SSL/TLS
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendPasswordResetEmail(email: string, name: string, token: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0f1e; color: #ffffff; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
              .card { background-color: #111624; border: 1px solid #242d42; border-radius: 24px; padding: 40px; text-align: center; }
              .logo { width: 48px; height: 48px; margin-bottom: 24px; }
              .mascot { width: 120px; height: auto; margin-bottom: 24px; }
              h1 { font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #ffffff; }
              p { color: #7a8ba8; font-size: 16px; line-height: 1.6; margin-bottom: 32px; }
              .button { display: inline-block; background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 24px rgba(37,99,235,0.38); }
              .footer { margin-top: 32px; font-size: 12px; color: #5a6478; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="card">
                  <img src="https://antigravity-media.s3.amazonaws.com/komunitip_logo.png" alt="KomuniTip" class="logo" />
                  <h1>Halo, ${name}!</h1>
                  <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun KomuniTip Anda. Klik tombol di bawah ini untuk melanjutkan:</p>
                  <a href="${resetLink}" class="button">Atur Ulang Password</a>
                  <p style="margin-top: 32px; font-size: 14px;">Jika Anda tidak merasa melakukan permintaan ini, abaikan saja email ini.</p>
                  <div class="footer">
                      &copy; 2026 KomuniTip. All rights reserved.
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"KomuniTip" <${this.configService.get<string>('MAIL_FROM')}>`,
      to: email,
      subject: 'Atur Ulang Password KomuniTip',
      html: htmlContent,
    });
  }
}
