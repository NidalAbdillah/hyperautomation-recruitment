// src/interfaces/IEmailService.ts

/**
 * Interface (Kontrak) untuk EmailService.
 */
export interface IEmailService {
  /**
   * Mengirim email undangan wawancara chatbot.
   */
  sendChatInterviewInvite(
    toEmail: string,
    candidateName: string,
    interviewLink: string
  ): Promise<void>;

  /**
   * Mengirim email konfirmasi bahwa lamaran telah diterima.
   */
  sendApplicationConfirmation(
    toEmail: string,
    candidateName: string,
    positionName: string
  ): Promise<void>;
}