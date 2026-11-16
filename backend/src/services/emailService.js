import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { generateTicketPdf } from './pdfTicketService.js';

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);

export function createEmailService({
  config = env,
  createTransport = nodemailer.createTransport,
  createPdf = generateTicketPdf,
} = {}) {
  let transporter;

  const getTransporter = () => {
    if (!config.SMTP_HOST || !config.SMTP_USER || !config.SMTP_PASS) return null;
    if (!transporter) {
      transporter = createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: config.SMTP_SECURE,
        auth: {
          user: config.SMTP_USER,
          pass: config.SMTP_PASS,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
      });
    }
    return transporter;
  };

  const send = async (message) => {
    const transport = getTransporter();
    if (!transport) return { sent: false, reason: 'not_configured' };

    await transport.sendMail({
      from: config.EMAIL_FROM || config.SMTP_USER,
      ...message,
    });
    return { sent: true };
  };

  const sendWelcomeEmail = async ({ name, email }) => {
    const safeName = escapeHtml(name || 'traveler');
    return send({
      to: email,
      subject: 'Welcome to YatraBus',
      text: `Welcome to YatraBus, ${name || 'traveler'}! Your account has been created successfully.`,
      html: `<p>Welcome to YatraBus, <strong>${safeName}</strong>!</p><p>Your account has been created successfully. You can now sign in to book your journeys.</p>`,
    });
  };

  const sendBookingTicketEmail = async ({ booking, ticket }) => {
    const recipient = booking.contactEmail || booking.passengers?.find((passenger) => passenger.email)?.email;
    if (!recipient) return { sent: false, reason: 'recipient_missing' };
    if (!getTransporter()) return { sent: false, reason: 'not_configured' };

    const ticketData = typeof ticket.toObject === 'function' ? ticket.toObject() : ticket;
    const pdf = await createPdf(ticketData);
    const snapshot = ticketData.journeySnapshot || {};
    const from = snapshot.from_location || snapshot.source || booking.origin || 'N/A';
    const to = snapshot.to_location || snapshot.destination || booking.destination || 'N/A';
    const pnr = ticketData.pnr || booking.pnr || booking.bookingReference;
    const safePnr = escapeHtml(pnr);
    const safeFrom = escapeHtml(from);
    const safeTo = escapeHtml(to);
    const total = ticketData.priceBreakdown?.totalAmount ?? booking.totalFare ?? 0;
    const fare = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(total);

    return send({
      to: recipient,
      subject: `Your YatraBus ticket – ${pnr}`,
      text: `Your booking ${pnr} is confirmed for travel from ${from} to ${to}. The ticket PDF is attached.`,
      html: `<p>Your YatraBus booking <strong>${safePnr}</strong> is confirmed.</p><p>Route: ${safeFrom} to ${safeTo}<br>Fare paid: ${escapeHtml(fare)}</p><p>Your ticket is attached as a PDF.</p>`,
      attachments: [{
        filename: `ticket-${String(pnr).replace(/[^a-zA-Z0-9_-]/g, '')}.pdf`,
        content: pdf,
        contentType: 'application/pdf',
      }],
    });
  };

  return { sendWelcomeEmail, sendBookingTicketEmail };
}

const runtimeConfig = env.NODE_ENV === 'test'
  ? { ...env, SMTP_HOST: '', SMTP_USER: '', SMTP_PASS: '' }
  : env;
const emailService = createEmailService({ config: runtimeConfig });

export const sendWelcomeEmail = emailService.sendWelcomeEmail;
export const sendBookingTicketEmail = emailService.sendBookingTicketEmail;
