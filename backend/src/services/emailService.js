import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let cachedTransporter = null;

export function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const hasCredentials = Boolean(env.SMTP_USER && env.SMTP_PASS);

  if (hasCredentials) {
    cachedTransporter = nodemailer.createTransport({
      host: env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(env.SMTP_PORT) || 587,
      secure: Boolean(env.SMTP_SECURE) || Number(env.SMTP_PORT) === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    logger.info({ host: env.SMTP_HOST, port: env.SMTP_PORT }, 'Nodemailer SMTP transporter initialized');
  } else {
    // Development / fallback stream transport to guarantee safe non-crashing execution
    cachedTransporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
    logger.info('Nodemailer using fallback stream transport (SMTP credentials not set)');
  }

  return cachedTransporter;
}

export async function sendEmail({ to, subject, html, text }) {
  if (!to) {
    logger.warn('sendEmail called without recipient email. Skipping.');
    return { success: false, reason: 'missing_recipient' };
  }

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: env.SMTP_FROM || '"YATRA BUS" <no-reply@yatrabus.com>',
      to,
      subject,
      text: text || subject,
      html,
    });

    logger.info({ messageId: info.messageId, to }, 'Email sent successfully');
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error({ error: error.message, to, subject }, 'Failed to send email via SMTP transporter');
    return { success: false, error: error.message };
  }
}

export async function sendBookingConfirmationEmail({ booking, ticket = null, toEmail = null }) {
  const recipient =
    toEmail ||
    booking?.contactEmail ||
    booking?.passengerEmail ||
    booking?.userEmail ||
    booking?.contactInfo?.email ||
    booking?.contact_info?.email ||
    booking?.passengers?.[0]?.email ||
    ticket?.contactEmail;
  if (!recipient) {
    logger.warn({ bookingId: booking?._id, pnr: booking?.pnr || booking?.bookingReference }, 'No recipient email for booking confirmation.');
    return { success: false, reason: 'no_recipient' };
  }

  const hasCredentials = Boolean(env.SMTP_USER && env.SMTP_PASS);
  logger.info({ recipient, pnr: booking?.pnr || booking?.bookingReference, hasCredentials }, 'Preparing booking confirmation email dispatch');

  const pnr = booking.pnr || booking.bookingReference || ticket?.pnr || 'N/A';
  const busName = booking.busName || ticket?.journeySnapshot?.busName || 'YatraBus Express';
  const busNumber = booking.busNumber || ticket?.journeySnapshot?.busNumber || 'N/A';
  const busType = booking.busType || ticket?.journeySnapshot?.busType || 'AC Luxury Coach';
  const origin = booking.from_location || booking.origin || ticket?.journeySnapshot?.source || 'Source';
  const destination = booking.to_location || booking.destination || ticket?.journeySnapshot?.destination || 'Destination';
  const journeyDate = booking.journeyDate || ticket?.journeySnapshot?.travelDate || 'N/A';
  const departureTime = booking.departureTime || ticket?.journeySnapshot?.departureTime || 'N/A';
  const arrivalTime = booking.arrivalTime || ticket?.journeySnapshot?.arrivalTime || 'N/A';
  const boardingPoint = booking.pickup_point || booking.boardingPoint || ticket?.journeySnapshot?.boardingPoint || 'Main Boarding Terminal';
  const droppingPoint = booking.drop_point || booking.droppingPoint || ticket?.journeySnapshot?.droppingPoint || 'City Drop Terminal';
  const seats = (booking.seats || ticket?.seats || []).join(', ') || 'N/A';
  const totalFare = booking.totalFare || ticket?.priceBreakdown?.totalAmount || '0';
  const passengerNames = (booking.passengers || ticket?.passengerSnapshot || [])
    .map((p) => `${p.name} (Seat ${p.seatNumber || 'N/A'})`)
    .join(', ') || 'Passenger';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #4c1d95, #6d28d9); padding: 30px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #e9d5ff; }
    .badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; margin-top: 12px; }
    .content { padding: 24px; }
    .pnr-box { background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 24px; }
    .pnr-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #6d28d9; letter-spacing: 1px; }
    .pnr-code { font-size: 22px; font-weight: 800; font-family: monospace; color: #4c1d95; margin-top: 4px; }
    .grid { display: table; width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .row { display: table-row; }
    .cell { display: table-cell; padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .cell-label { font-weight: 600; color: #64748b; width: 35%; }
    .cell-value { font-weight: 700; color: #0f172a; }
    .highlight-cell { background: #faf5ff; font-weight: 800; color: #6b21a8; }
    .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    .footer a { color: #6d28d9; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>YATRA BUS</h1>
      <p>Official Electronic Reservation Slip (ERS)</p>
      <div class="badge">BOOKING CONFIRMED</div>
    </div>
    <div class="content">
      <div class="pnr-box">
        <div class="pnr-label">Booking Reference / PNR</div>
        <div class="pnr-code">${pnr}</div>
      </div>
      <div class="grid">
        <div class="row">
          <div class="cell cell-label">Route</div>
          <div class="cell cell-value">${origin} &rarr; ${destination}</div>
        </div>
        <div class="row">
          <div class="cell cell-label">Journey Date</div>
          <div class="cell cell-value">${journeyDate}</div>
        </div>
        <div class="row">
          <div class="cell cell-label">Coach / Operator</div>
          <div class="cell cell-value">${busName} (${busNumber}) &bull; ${busType}</div>
        </div>
        <div class="row">
          <div class="cell cell-label">Departure</div>
          <div class="cell cell-value">${departureTime} &bull; ${boardingPoint}</div>
        </div>
        <div class="row">
          <div class="cell cell-label">Arrival</div>
          <div class="cell cell-value">${arrivalTime} &bull; ${droppingPoint}</div>
        </div>
        <div class="row">
          <div class="cell cell-label">Passengers</div>
          <div class="cell cell-value">${passengerNames}</div>
        </div>
        <div class="row">
          <div class="cell cell-label">Reserved Seats</div>
          <div class="cell cell-value highlight-cell">${seats}</div>
        </div>
        <div class="row">
          <div class="cell cell-label">Total Fare Paid</div>
          <div class="cell cell-value" style="color: #059669; font-size: 15px;">&#8377;${totalFare}</div>
        </div>
      </div>
      <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 16px;">
        &bull; Please carry an original government-issued photo ID (Aadhaar, Passport, Driving License) along with this digital ticket.<br>
        &bull; Please arrive at the boarding point at least 15 minutes before departure.<br>
        &bull; You can download your official PDF ticket anytime from your <a href="${env.CLIENT_URL || 'http://localhost:5173'}/dashboard">YatraBus Account</a>.
      </p>
    </div>
    <div class="footer">
      <p>&copy; 2026 YATRA BUS India Private Limited &bull; 24x7 Support: 1800-250-8737 &bull; support@yatrabus.com</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: recipient,
    subject: `Your YATRA BUS Ticket Confirmation - PNR: ${pnr}`,
    html,
    text: `Your YatraBus booking is confirmed! PNR: ${pnr}, Route: ${origin} to ${destination}, Date: ${journeyDate}, Seats: ${seats}, Total: Rs. ${totalFare}.`,
  });
}

export async function sendNotificationEmail({ toEmail, subject, title, message }) {
  if (!toEmail) return { success: false, reason: 'missing_recipient' };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 540px; margin: 0 auto; background: #fff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #4c1d95; padding: 24px; text-align: center; color: #fff; }
    .header h2 { margin: 0; font-size: 20px; font-weight: 800; }
    .body { padding: 24px; font-size: 14px; line-height: 1.6; }
    .title { font-size: 16px; font-weight: 700; color: #4c1d95; margin-bottom: 12px; }
    .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>YATRA BUS</h2>
    </div>
    <div class="body">
      <div class="title">${title || subject}</div>
      <p>${message}</p>
    </div>
    <div class="footer">
      &copy; 2026 YATRA BUS India &bull; support@yatrabus.com
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to: toEmail,
    subject: subject || title || 'Notification from YATRA BUS',
    html,
    text: `${title ? `${title}\n\n` : ''}${message}`,
  });
}

export async function testSmtpConnection(testRecipient = null) {
  const target = testRecipient || env.SMTP_USER || 'test@yatrabus.com';
  const hasCredentials = Boolean(env.SMTP_USER && env.SMTP_PASS);
  if (!hasCredentials) {
    return {
      success: false,
      configured: false,
      message: 'SMTP credentials (SMTP_USER / SMTP_PASS) are not set in environment or .env. Using non-crashing fallback transporter.'
    };
  }

  return sendEmail({
    to: target,
    subject: 'YATRA BUS — SMTP Verification Test',
    text: 'This is a test email confirming your YATRA BUS SMTP configuration is working correctly.',
    html: '<h3>YATRA BUS SMTP Mailer</h3><p>Your SMTP mailer credentials have been successfully verified!</p>'
  });
}
