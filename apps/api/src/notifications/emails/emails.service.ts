import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

type SendMailData = {
   to: string;
   subject: string;
   text: string;
   html: string;
};

type WelcomeVerificationEmailData = {
   email: string;
   firstName: string | null;
   verificationUrl: string;
};

/**
 * Servicio de envio de e-mails.
 */
@Injectable()
export class EmailsService {
   private readonly logger = new Logger(EmailsService.name);

   /**
    * Crea una nueva instancia del servicio de e-mails.
    *
    * @param mailerService - Servicio de envío de e-mails
    */
   constructor(private readonly mailerService: MailerService) {}

   /**
    * Envía un e-mail de verificación de cuenta a un usuario.
    *
    * @param data - Datos del e-mail de verificación
    */
   async sendWelcomeVerificationEmail(
      data: WelcomeVerificationEmailData,
   ): Promise<void> {
      const subject = 'Bienvenido a Gym App - Verifica tu email';
      const greeting = data.firstName ? `Hola ${data.firstName},` : 'Hola,';

      const text = [
         greeting,
         '',
         'Gracias por registrarte en Gym App.',
         'Para verificar tu correo, usa este enlace:',
         data.verificationUrl,
         '',
         'Si no has creado esta cuenta, puedes ignorar este mensaje.',
      ].join('\n');
      const html = this.buildWelcomeVerificationHtml({
         greeting,
         verificationUrl: data.verificationUrl,
      });

      await this.sendMail({
         to: data.email,
         subject,
         text,
         html,
      });
   }

   private async sendMail(data: SendMailData): Promise<void> {
      await this.mailerService.sendMail({
         to: data.to,
         subject: data.subject,
         text: data.text,
         html: data.html,
      });

      this.logger.log(
         `Email enviado a ${data.to} con asunto "${data.subject}"`,
      );
   }

   private buildWelcomeVerificationHtml(data: {
      greeting: string;
      verificationUrl: string;
   }) {
      return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Verifica tu email</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f4f7fb;font-family:Helvetica,Arial,sans-serif;color:#1f2937;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fb;padding:32px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;">
                  <tr>
                    <td style="padding:32px 32px 16px;background:linear-gradient(135deg,#111827 0%,#1f2937 100%);color:#ffffff;">
                      <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#cbd5e1;">Gym App</p>
                      <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2;font-weight:700;">Verifica tu correo</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px;">
                      <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">${data.greeting}</p>
                      <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
                        Gracias por registrarte en <strong>Gym App</strong>. Para activar tu cuenta y confirmar tu correo, pulsa el siguiente botón.
                      </p>
                      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                        <tr>
                          <td align="center" style="border-radius:12px;background-color:#111827;">
                            <a
                              href="${data.verificationUrl}"
                              style="display:inline-block;padding:14px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;"
                            >
                              Verificar email
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#4b5563;">
                        Si el botón no funciona, copia y pega este enlace en tu navegador:
                      </p>
                      <p style="margin:0 0 24px;font-size:14px;line-height:1.7;word-break:break-word;">
                        <a href="${data.verificationUrl}" style="color:#2563eb;text-decoration:none;">${data.verificationUrl}</a>
                      </p>
                      <p style="margin:0;font-size:13px;line-height:1.7;color:#6b7280;">
                        Si no has creado esta cuenta, puedes ignorar este mensaje.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
   }
}
