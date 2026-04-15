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
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #212121; margin: 0; padding: 40px 0; }
              .wrapper { width: 100%; table-layout: fixed; background-color: #212121; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #374151; }
              .header { background-color: #0b1121; padding: 40px 20px; text-align: center; border-bottom: 6px solid #2563eb; }
              .header img { max-width: 200px; height: auto; }
              .body-content { padding: 40px 40px; color: #4b5563; }
              h1 { font-size: 24px; font-weight: 800; color: #111827; margin-top: 0; margin-bottom: 24px; }
              p { font-size: 15px; line-height: 1.6; margin: 0 0 16px 0; }
              .action-box { background-color: #f4f7fc; border-radius: 16px; padding: 32px 24px; text-align: center; margin: 32px 0; }
              .action-text { font-size: 14px; font-weight: 600; color: #1e3a8a; margin-bottom: 24px; }
              .button { display: inline-block; background-color: #1a56db; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 14px rgba(26,86,219,0.3); }
              .divider { height: 1px; background-color: #e5e7eb; margin: 32px 0; }
              .footer { background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb; }
              .footer p { font-size: 12px; color: #64748b; margin: 6px 0; line-height: 1.5; }
          </style>
      </head>
      <body>
          <div class="wrapper">
              <div class="container">
                  <div class="header">
                      <!-- ⚠️ PENTING: Karena ini email, gambar tidak bisa dibaca dari folder lokal komputer Anda (Frontend/src/assets). Gambar Group of Penguins harus di-host secara online (misal ditaruh di Imgur/AWS S3). Ganti URL di bawah ini dengan URL online gambar penguin Anda. -->
                      <img src="https://antigravity-media.s3.amazonaws.com/group_of_penguins_logo.png" alt="KomuniTip" />
                  </div>
                  <div class="body-content">
                      <h1>Reset Password Anda</h1>
                      <p>Halo,</p>
                      
                      <p>Kami menerima permintaan untuk mereset password akun KomuniTip Anda.</p>
                      
                      <div class="action-box">
                          <div class="action-text">Klik tombol di bawah ini untuk membuat password baru Anda:</div>
                          <a href="${resetLink}" class="button">Atur Ulang Password</a>
                      </div>
                      
                      <p>Jika Anda tidak pernah meminta reset password, silakan abaikan email ini atau hubungi tim support kami segera.</p>
                      
                      <div class="divider"></div>
                      
                      <p style="margin-bottom: 4px;">Salam hangat,</p>
                      <p style="font-weight: 800; color: #111827; margin: 0;">Tim KomuniTip</p>
                  </div>
                  <div class="footer">
                      <p>&copy; 2026 KomuniTip. All rights reserved.</p>
                      <p>🛡️ Email ini dikirim secara otomatis, mohon tidak membalas.</p>
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
