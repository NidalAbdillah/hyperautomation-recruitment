// src/services/email.service.ts
import Mailjet from 'node-mailjet'; // Menggunakan import ES Module
import { IEmailService } from '../interfaces/IEmailService'; // Impor Kontrak

/**
 * Service class untuk mengelola semua pengiriman email transaksional.
 * @class EmailService
 * @implements {IEmailService}
 */
class EmailService implements IEmailService {
  private mailjet: any; // Tipe 'any' untuk Mailjet client
  private fromEmail: string;
  private fromName: string;

  constructor() {
    if (
      !process.env.MAILJET_API_KEY ||
      !process.env.MAILJET_SECRET_KEY ||
      !process.env.MAILJET_SENDER_EMAIL
    ) {
      throw new Error("Mailjet configuration is missing in .env file.");
    }
    
    this.mailjet = Mailjet.apiConnect(
      process.env.MAILJET_API_KEY,
      process.env.MAILJET_SECRET_KEY
    );
    
    this.fromEmail = process.env.MAILJET_SENDER_EMAIL;
    this.fromName = 'XYZ Tech Recruitment';
    
    console.log("EmailService instantiated.");
  }

  /**
   * Mengirim email undangan wawancara chatbot via Mailjet.
   * @param {string} toEmail - Alamat email penerima (kandidat).
   * @param {string} candidateName - Nama kandidat.
   * @param {string} interviewLink - Link unik ke halaman wawancara chatbot.
   * @returns {Promise<void>}
   */
  public async sendChatInterviewInvite(
    toEmail: string,
    candidateName: string,
    interviewLink: string
  ): Promise<void> {
    const request = this.mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: this.fromEmail,
              Name: this.fromName
            },
            To: [
              {
                Email: toEmail,
                Name: candidateName || toEmail
              }
            ],
            Subject: `Undangan Wawancara Awal - XYZ Tech`,
            HTMLPart: `
              <h3>Halo ${candidateName || 'Pelamar'},</h3>
              <p>Terima kasih telah melamar di XYZ Tech. Setelah meninjau lamaran Anda, kami ingin mengundang Anda untuk mengikuti tahap wawancara awal melalui chatbot AI kami.</p>
              <p>Silakan klik link di bawah ini untuk memulai wawancara. Sesi ini diperkirakan memakan waktu sekitar [Estimasi Waktu] dan memiliki batas waktu 1 jam setelah link dibuka.</p>
              <p><a href="${interviewLink}" target="_blank" style="background-color: #1D4ED8; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">Mulai Wawancara Awal</a></p>
              <p>Link ini hanya dapat digunakan satu kali.</p>
              <p>Terima kasih,<br>Tim Rekrutmen XYZ Tech</p>
            `,
          }
        ]
      });

    try {
      console.log(`Sending email invite via Mailjet to ${toEmail}...`);
      const result = await request;
      
      if (result.body.Messages[0].Status === 'success') {
        console.log(`Email successfully sent to ${toEmail}. MessageID: ${result.body.Messages[0].To[0].MessageID}`);
      } else {
        console.error(`Mailjet failed to send email to ${toEmail}. Status: ${result.body.Messages[0].Status}`, result.body.Messages[0].Errors || 'No specific error reported.');
        throw new Error('Mailjet reported an error sending the email.');
      }
    } catch (error: any) {
      console.error(`Error sending email via Mailjet to ${toEmail}:`, error.statusCode, error.message);
      throw new Error('Failed to send interview invitation email.');
    }
  }

  /**
   * Mengirim email konfirmasi bahwa lamaran telah diterima via Mailjet.
   * @param {string} toEmail
   * @param {string} candidateName
   * @param {string} positionName
   * @returns {Promise<void>}
   */
  public async sendApplicationConfirmation(
    toEmail: string,
    candidateName: string,
    positionName: string
  ): Promise<void> {
      const request = this.mailjet
          .post('send', { version: 'v3.1' })
          .request({
            Messages: [
                {
                  From: { Email: this.fromEmail, Name: this.fromName },
                  To: [{ Email: toEmail, Name: candidateName || toEmail }],
                  Subject: `Lamaran Anda di XYZ Tech Telah Diterima - ${positionName}`,
                  HTMLPart: `
                      <p>Halo ${candidateName || 'Pelamar'},</p>
                      <p>Terima kasih telah mengirimkan lamaran Anda untuk posisi <strong>${positionName}</strong> di XYZ Tech.</p>
                      <p>Lamaran Anda telah berhasil kami terima dan akan segera ditinjau oleh tim rekrutmen kami.</p>
                      <p>Karena volume lamaran yang tinggi, kami hanya akan menghubungi kandidat yang memenuhi kualifikasi untuk tahap selanjutnya.</p>
                      <p>Terima kasih atas minat Anda pada XYZ Tech.</p>
                      <p>Salam,<br>Tim Rekrutmen XYZ Tech</p>
                  `,
                }
            ]
          });

      try {
        console.log(`Sending application confirmation via Mailjet to ${toEmail}...`);
        const result = await request;
        if (result.body.Messages[0].Status === 'success') {
            console.log(`Confirmation email sent to ${toEmail}. MessageID: ${result.body.Messages[0].To[0].MessageID}`);
        } else {
            console.error(`Mailjet failed to send confirmation to ${toEmail}. Status: ${result.body.Messages[0].Status}`, result.body.Messages[0].Errors || 'No specific error reported.');
        }
      } catch (error: any) {
        console.error(`Error sending confirmation email via Mailjet to ${toEmail}:`, error.statusCode, error.message);
        // Tidak throw error fatal untuk konfirmasi
      }
  }

}

export default new EmailService();