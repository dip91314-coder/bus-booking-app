import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logoPath = path.resolve(__dirname, '../assets/logo.png');

const PAGE_MARGIN = 40;
const CONTENT_WIDTH = 515;
const INK = '#0F172A';
const MUTED = '#64748B';
const BORDER = '#E2E8F0';
const BRAND = '#12345B';

function drawHeader(doc, pageTitle = 'DIGITAL BUS TICKET') {
  const y = PAGE_MARGIN;
  doc.roundedRect(PAGE_MARGIN, y, CONTENT_WIDTH, 72, 10).fill(BRAND);
  doc
    .font('Helvetica-Bold')
    .fontSize(22)
    .fillColor('#FFFFFF')
    .text('YATRA BUS', PAGE_MARGIN + 18, y + 13, { characterSpacing: 1.2 });
  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#DCE8F5')
    .text(pageTitle, PAGE_MARGIN + 19, y + 44, { characterSpacing: 0.6 });
}

function ensureSpace(doc, cursorY, height) {
  if (cursorY + height <= doc.page.height - PAGE_MARGIN) return cursorY;
  doc.addPage();
  drawHeader(doc, 'YATRA BUS | BOOKING DETAILS');
  return 132;
}

function drawSection(doc, title, cursorY) {
  cursorY = ensureSpace(doc, cursorY, 32);
  doc.font('Helvetica-Bold').fontSize(12).fillColor(INK).text(title, PAGE_MARGIN, cursorY);
  doc.moveTo(PAGE_MARGIN, cursorY + 19).lineTo(PAGE_MARGIN + CONTENT_WIDTH, cursorY + 19).lineWidth(0.7).strokeColor(BORDER).stroke();
  return cursorY + 28;
}

function drawFieldRow(doc, fields, cursorY) {
  const gap = 14;
  const width = (CONTENT_WIDTH - gap * (fields.length - 1)) / fields.length;
  const values = fields.map((field) => String(field.value ?? 'N/A'));
  const heights = values.map((value) => {
    doc.font('Helvetica-Bold').fontSize(10);
    return doc.heightOfString(value, { width, lineGap: 1 });
  });
  const rowHeight = 11 + Math.max(...heights, 12) + 10;
  cursorY = ensureSpace(doc, cursorY, rowHeight);
  values.forEach((value, index) => {
    const x = PAGE_MARGIN + index * (width + gap);
    doc.font('Helvetica').fontSize(7).fillColor(MUTED).text(fields[index].label.toUpperCase(), x, cursorY, { width });
    doc.font('Helvetica-Bold').fontSize(10).fillColor(INK).text(value, x, cursorY + 11, { width, lineGap: 1 });
  });
  return cursorY + rowHeight;
}

function drawPassengers(doc, passengers, seats, cursorY) {
  cursorY = drawSection(doc, 'Passenger & Seat Details', cursorY);
  const columns = [
    { label: 'Passenger Name', x: PAGE_MARGIN + 10, width: 205 },
    { label: 'Age', x: PAGE_MARGIN + 224, width: 40 },
    { label: 'Gender', x: PAGE_MARGIN + 277, width: 82 },
    { label: 'Seat No.', x: PAGE_MARGIN + 372, width: 128 },
  ];

  const drawTableHeader = (y) => {
    doc.roundedRect(PAGE_MARGIN, y, CONTENT_WIDTH, 23, 4).fill('#EAF0F7');
    doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND);
    columns.forEach((column) => doc.text(column.label, column.x, y + 7, { width: column.width }));
    return y + 23;
  };

  cursorY = ensureSpace(doc, cursorY, 28);
  cursorY = drawTableHeader(cursorY);
  const entries = passengers.length > 0
    ? passengers
    : seats.map((seatNumber) => ({ name: 'Passenger', age: '—', gender: '—', seatNumber }));

  entries.forEach((passenger, index) => {
    const name = String(passenger.name || 'Passenger');
    const seatNumber = String(passenger.seatNumber || seats[index] || 'N/A');
    doc.font('Helvetica').fontSize(9);
    const rowHeight = Math.max(
      24,
      doc.heightOfString(name, { width: columns[0].width, lineGap: 1 }) + 12
    );
    cursorY = ensureSpace(doc, cursorY, rowHeight);
    if (cursorY === 132) cursorY = drawTableHeader(cursorY);
    if (index % 2 === 0) {
      doc.rect(PAGE_MARGIN, cursorY, CONTENT_WIDTH, rowHeight).fill('#F8FAFC');
    }
    doc.font('Helvetica').fontSize(9).fillColor(INK);
    doc.text(name, columns[0].x, cursorY + 6, { width: columns[0].width, lineGap: 1 });
    doc.text(String(passenger.age ?? '—'), columns[1].x, cursorY + 6, { width: columns[1].width });
    doc.text(String(passenger.gender || '—'), columns[2].x, cursorY + 6, { width: columns[2].width });
    doc.font('Helvetica-Bold').text(seatNumber, columns[3].x, cursorY + 6, { width: columns[3].width });
    cursorY += rowHeight;
  });
  return cursorY + 12;
}

export function generateTicketPdf(ticket = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: PAGE_MARGIN, size: 'A4' });
      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const journey = ticket.journeySnapshot || {};
      const passengers = Array.isArray(ticket.passengerSnapshot) ? ticket.passengerSnapshot : [];
      const seats = Array.isArray(ticket.seats) ? ticket.seats : passengers.map((passenger) => passenger.seatNumber);
      const prices = ticket.priceBreakdown || {};
      const passengerNames = passengers.map((passenger) => passenger.name).filter(Boolean).join(', ') || 'N/A';
      const bookingId = ticket.bookingId?.toString?.() || ticket.bookingId || ticket._id || 'N/A';
      const pnr = ticket.pnr || ticket.bookingReference || 'N/A';
      const status = ticket.bookingStatus === 'completed'
        ? 'Completed'
        : ticket.bookingStatus === 'cancelled'
          ? 'Cancelled'
          : ticket.bookingStatus === 'failed'
            ? 'Failed'
            : 'Confirmed';
      const totalFare = prices.totalAmount ?? ticket.totalFare ?? 0;
      const money = `Rs. ${Number(totalFare).toLocaleString('en-IN')}`;

      drawHeader(doc);
      doc.roundedRect(PAGE_MARGIN, 126, CONTENT_WIDTH, 43, 7).fill('#F1F5F9');
      doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND)
        .text(`PNR: ${pnr}`, PAGE_MARGIN + 12, 137, { width: 250 });
      doc.font('Helvetica').fontSize(8).fillColor(MUTED)
        .text(`Booking ID: ${bookingId}`, PAGE_MARGIN + 12, 152, { width: CONTENT_WIDTH - 24 });
      doc.font('Helvetica-Bold').fontSize(9)
        .fillColor(status === 'Confirmed' || status === 'Completed' ? '#047857' : '#B91C1C')
        .text(status.toUpperCase(), PAGE_MARGIN + 390, 142, { width: 110, align: 'right' });

      let cursorY = 188;
      cursorY = drawSection(doc, 'Journey Details', cursorY);
      cursorY = drawFieldRow(doc, [
        { label: 'Bus Name', value: journey.busName },
        { label: 'Bus Number', value: journey.busNumber },
        { label: 'Bus Type', value: journey.busType },
      ], cursorY);
      cursorY = drawFieldRow(doc, [
        { label: 'From', value: journey.from_location || journey.source },
        { label: 'To', value: journey.to_location || journey.destination },
        { label: 'Journey Date', value: journey.travelDate },
      ], cursorY);
      cursorY = drawFieldRow(doc, [
        { label: 'Departure', value: journey.departureTime },
        { label: 'Arrival', value: journey.arrivalTime },
        { label: 'Pickup Point', value: journey.pickup_point || journey.boardingPoint },
      ], cursorY);
      cursorY = drawFieldRow(doc, [
        { label: 'Drop Point', value: journey.drop_point || journey.droppingPoint },
        { label: 'Seat Number(s)', value: seats.join(', ') || 'N/A' },
        { label: 'Passenger(s)', value: passengerNames },
      ], cursorY);
      cursorY = drawPassengers(doc, passengers, seats, cursorY);

      cursorY = drawSection(doc, 'Fare & Payment', cursorY);
      cursorY = drawFieldRow(doc, [
        { label: 'Total Fare', value: money },
        { label: 'Booking Status', value: status },
        { label: 'Payment Status', value: ticket.paymentStatus || 'Successful' },
      ], cursorY);
      cursorY = drawFieldRow(doc, [
        { label: 'Payment Method', value: ticket.paymentMethod || 'Online Payment' },
        { label: 'Ticket Issued', value: new Date(ticket.generatedAt || ticket.bookedAt || Date.now()).toLocaleDateString('en-IN') },
      ], cursorY);

      cursorY = ensureSpace(doc, cursorY, 58);
      doc.font('Helvetica-Bold').fontSize(8).fillColor(MUTED)
        .text('TRAVEL NOTES', PAGE_MARGIN, cursorY);
      doc.font('Helvetica').fontSize(7).fillColor(MUTED)
        .text(
          'Please carry a valid government-issued photo ID and arrive at your pickup point at least 15 minutes before departure. Keep this ticket available during your journey.',
          PAGE_MARGIN,
          cursorY + 12,
          { width: CONTENT_WIDTH, lineGap: 2 }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
