import { describe, expect, it, vi } from 'vitest';
import { createEmailService } from './emailService.js';

const smtpConfig = {
  SMTP_HOST: 'smtp.example.test',
  SMTP_PORT: 587,
  SMTP_SECURE: false,
  SMTP_USER: 'mailer@example.test',
  SMTP_PASS: 'test-password',
  EMAIL_FROM: 'YatraBus <mailer@example.test>',
};

describe('emailService', () => {
  it('sends an escaped welcome email when SMTP is configured', async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: 'message-1' });
    const createTransport = vi.fn(() => ({ sendMail }));
    const emailService = createEmailService({ config: smtpConfig, createTransport });

    await expect(emailService.sendWelcomeEmail({
      name: '<Passenger>',
      email: 'passenger@example.com',
    })).resolves.toEqual({ sent: true });

    expect(createTransport).toHaveBeenCalledWith(expect.objectContaining({
      host: smtpConfig.SMTP_HOST,
      port: smtpConfig.SMTP_PORT,
      secure: false,
      auth: { user: smtpConfig.SMTP_USER, pass: smtpConfig.SMTP_PASS },
    }));
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: smtpConfig.EMAIL_FROM,
      to: 'passenger@example.com',
      html: expect.stringContaining('&lt;Passenger&gt;'),
    }));
  });

  it('attaches the generated PDF to the ticket email', async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: 'message-2' });
    const createTransport = vi.fn(() => ({ sendMail }));
    const createPdf = vi.fn().mockResolvedValue(Buffer.from('%PDF-test'));
    const emailService = createEmailService({ config: smtpConfig, createTransport, createPdf });

    await expect(emailService.sendBookingTicketEmail({
      booking: {
        pnr: 'OBT-1234',
        contactEmail: 'passenger@example.com',
        origin: 'Kolkata',
        destination: 'Siliguri',
        totalFare: 1200,
      },
      ticket: {
        pnr: 'OBT-1234',
        journeySnapshot: { source: 'Kolkata', destination: 'Siliguri' },
        priceBreakdown: { totalAmount: 1200 },
      },
    })).resolves.toEqual({ sent: true });

    expect(createPdf).toHaveBeenCalledOnce();
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'passenger@example.com',
      attachments: [{
        filename: 'ticket-OBT-1234.pdf',
        content: Buffer.from('%PDF-test'),
        contentType: 'application/pdf',
      }],
    }));
  });

  it('sends a booking confirmation without a ticket and honors the recipient override', async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: 'message-3' });
    const createTransport = vi.fn(() => ({ sendMail }));
    const emailService = createEmailService({ config: smtpConfig, createTransport });

    await expect(emailService.sendBookingConfirmationEmail({
      booking: {
        bookingReference: 'OBT-1234',
        contactEmail: 'saved@example.com',
        origin: 'Kolkata',
        destination: 'Manali',
      },
      toEmail: 'override@example.com',
    })).resolves.toEqual({ sent: true });

    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'override@example.com',
      subject: expect.stringContaining('OBT-1234'),
      text: expect.stringContaining('Kolkata to Manali'),
    }));
  });

  it('reports missing SMTP configuration without attempting delivery', async () => {
    const createTransport = vi.fn();
    const emailService = createEmailService({
      config: { SMTP_HOST: '', SMTP_USER: '', SMTP_PASS: '' },
      createTransport,
    });

    await expect(emailService.sendWelcomeEmail({
      name: 'Passenger',
      email: 'passenger@example.com',
    })).resolves.toEqual({ sent: false, reason: 'not_configured' });
    expect(createTransport).not.toHaveBeenCalled();
  });

  it('does not attempt a ticket email without a recipient', async () => {
    const createTransport = vi.fn();
    const emailService = createEmailService({ config: smtpConfig, createTransport });

    await expect(emailService.sendBookingTicketEmail({
      booking: { pnr: 'OBT-1234' },
      ticket: {},
    })).resolves.toEqual({ sent: false, reason: 'recipient_missing' });
    expect(createTransport).not.toHaveBeenCalled();
  });
});
