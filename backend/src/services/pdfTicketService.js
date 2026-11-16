import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logoPath = path.resolve(__dirname, '../assets/logo.png');

export function generateTicketPdf(ticket) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const { journeySnapshot = {}, passengerSnapshot = [], priceBreakdown = {}, pnr, bookingId, status } = ticket;
      const fromLocation = journeySnapshot.from_location || journeySnapshot.source || 'N/A';
      const toLocation = journeySnapshot.to_location || journeySnapshot.destination || 'N/A';
      const pickupPoint = journeySnapshot.pickup_point || journeySnapshot.boardingPoint || 'Main Stand';
      const dropPoint = journeySnapshot.drop_point || journeySnapshot.droppingPoint || 'City Drop';
      const isCancelled = String(status || '').toLowerCase() === 'cancelled';

      // 1. Official YATRA BUS Brand Header Banner
      doc
        .rect(40, 30, 515, 82)
        .fill('#4C1D95');

      // Gold top accent highlight line
      doc
        .rect(40, 30, 515, 4)
        .fill('#F59E0B');

      // Official Logo rendering
      const hasLogo = fs.existsSync(logoPath);
      let textStartX = 55;

      if (hasLogo) {
        try {
          doc.roundedRect(52, 40, 38, 38, 6).fill('#FFFFFF');
          doc.image(logoPath, 54, 42, { fit: [34, 34], align: 'center', valign: 'center' });
          textStartX = 98;
        } catch {
          textStartX = 55;
        }
      }

      // YATRA BUS Brand Typography
      doc
        .fontSize(20)
        .fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .text('YATRA BUS', textStartX, 44);

      doc
        .fontSize(8)
        .fillColor('#E9D5FF')
        .font('Helvetica')
        .text("India's Premier Bus Network · Official Electronic Reservation Slip (ERS)", textStartX, 68);

      doc
        .fontSize(7)
        .fillColor('#DDD6FE')
        .font('Helvetica')
        .text("GSTIN: 19AAACY9821K1ZM · SAC: 996411 · Corporate Office: Salt Lake Sector V, Kolkata 700091", 55, 84);

      // Support & Verification Contact info (Top Right)
      doc
        .fontSize(8.5)
        .fillColor('#DDD6FE')
        .font('Helvetica-Bold')
        .text('24x7 HELPLINE: 1800-250-8737', 300, 44, { width: 240, align: 'right' });

      doc
        .fontSize(8)
        .fillColor('#C4B5FD')
        .font('Helvetica')
        .text('support@yatrabus.com · www.yatrabus.com', 300, 60, { width: 240, align: 'right' });

      doc
        .fontSize(7.5)
        .fillColor('#E9D5FF')
        .font('Helvetica')
        .text('Govt. Recognized Intercity Coach Carrier', 300, 74, { width: 240, align: 'right' });

      // 2. PNR & Booking Reference Bar
      const topMetaY = 120;
      doc
        .rect(40, topMetaY, 515, 46)
        .fillAndStroke('#F5F3FF', '#DDD6FE');

      doc
        .fillColor('#4C1D95')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(`PNR: ${pnr || 'N/A'}`, 55, topMetaY + 9)
        .fillColor('#374151')
        .fontSize(8.5)
        .font('Helvetica')
        .text(`Booking ID: ${bookingId || ticket._id || 'N/A'}`, 55, topMetaY + 26);

      const statusColor = isCancelled ? '#DC2626' : '#059669';
      const statusText = isCancelled ? 'STATUS: CANCELLED' : 'STATUS: CONFIRMED';

      const issuedTimeStr = new Date(ticket.generatedAt || Date.now()).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

      doc
        .fillColor(statusColor)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(statusText, 340, topMetaY + 9, { width: 200, align: 'right' })
        .fillColor('#6B7280')
        .fontSize(8.5)
        .font('Helvetica')
        .text(`Issued: ${issuedTimeStr}`, 340, topMetaY + 26, { width: 200, align: 'right' });

      // 3. Journey Details Section
      const journeyY = 178;
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#1F2937')
        .text('Journey & Schedule Details', 40, journeyY);

      doc
        .rect(40, journeyY + 16, 515, 96)
        .fillAndStroke('#F9FAFB', '#E5E7EB');

      const col1 = 55;
      const col2 = 220;
      const col3 = 380;
      const jRow1 = journeyY + 25;
      const jRow2 = journeyY + 54;
      const jRow3 = journeyY + 83;

      // Row 1
      doc.fontSize(8).fillColor('#6B7280').font('Helvetica').text('BUS OPERATOR / FLEET', col1, jRow1);
      doc.fontSize(9.5).fillColor('#111827').font('Helvetica-Bold').text(journeySnapshot.busName || 'YatraBus Express', col1, jRow1 + 10);

      doc.fontSize(8).fillColor('#6B7280').font('Helvetica').text('BUS NUMBER', col2, jRow1);
      doc.fontSize(9.5).fillColor('#111827').font('Helvetica-Bold').text(journeySnapshot.busNumber || 'N/A', col2, jRow1 + 10);

      doc.fontSize(8).fillColor('#6B7280').font('Helvetica').text('COACH TYPE', col3, jRow1);
      doc.fontSize(9.5).fillColor('#111827').font('Helvetica-Bold').text(journeySnapshot.busType || 'AC Luxury Sleeper', col3, jRow1 + 10);

      // Row 2
      doc.fontSize(8).fillColor('#6B7280').font('Helvetica').text('ORIGIN / FROM', col1, jRow2);
      doc.fontSize(9.5).fillColor('#111827').font('Helvetica-Bold').text(fromLocation, col1, jRow2 + 10);

      doc.fontSize(8).fillColor('#6B7280').font('Helvetica').text('DESTINATION / TO', col2, jRow2);
      doc.fontSize(9.5).fillColor('#111827').font('Helvetica-Bold').text(toLocation, col2, jRow2 + 10);

      doc.fontSize(8).fillColor('#6B7280').font('Helvetica').text('JOURNEY DATE', col3, jRow2);
      doc.fontSize(9.5).fillColor('#111827').font('Helvetica-Bold').text(journeySnapshot.travelDate || 'N/A', col3, jRow2 + 10);

      // Row 3
      doc.fontSize(8).fillColor('#6B7280').font('Helvetica').text('DEPARTURE & BOARDING POINT', col1, jRow3);
      doc.fontSize(9).fillColor('#111827').font('Helvetica-Bold').text(`${journeySnapshot.departureTime || '20:00'} · ${pickupPoint}`, col1, jRow3 + 10, { width: 310 });

      doc.fontSize(8).fillColor('#6B7280').font('Helvetica').text('ARRIVAL & DROP POINT', col3, jRow3);
      doc.fontSize(9).fillColor('#111827').font('Helvetica-Bold').text(`${journeySnapshot.arrivalTime || '06:00'} · ${dropPoint}`, col3, jRow3 + 10, { width: 165 });

      // 4. Passenger Information Table
      const passY = 305;
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#1F2937')
        .text('Passenger Information & Assigned Seats', 40, passY);

      // Table Header
      const thY = passY + 16;
      doc
        .rect(40, thY, 515, 22)
        .fill('#EDE9FE');

      doc
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .fillColor('#4C1D95')
        .text('Passenger Name', 55, thY + 6)
        .text('Age', 260, thY + 6)
        .text('Gender', 330, thY + 6)
        .text('Seat Number', 430, thY + 6);

      let rowY = thY + 22;
      const passengerList = passengerSnapshot && passengerSnapshot.length > 0
        ? passengerSnapshot
        : (ticket.seats || []).map((s) => ({ name: 'Passenger', age: 28, gender: 'male', seatNumber: s }));

      passengerList.forEach((p, idx) => {
        const bg = idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
        doc.rect(40, rowY, 515, 20).fill(bg);

        doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor('#1F2937')
          .text(p.name || 'Passenger', 55, rowY + 5)
          .text(String(p.age || '-'), 260, rowY + 5)
          .text(String(p.gender || '-').toUpperCase(), 330, rowY + 5)
          .font('Helvetica-Bold')
          .fillColor('#4C1D95')
          .text(String(p.seatNumber || '-'), 430, rowY + 5);

        rowY += 20;
      });

      // 5. Fare & Payment Summary
      const priceY = rowY + 18;
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#1F2937')
        .text('Fare & Payment Summary', 40, priceY);

      const pBoxY = priceY + 16;
      doc
        .rect(40, pBoxY, 515, 52)
        .fillAndStroke('#F8FAFC', '#E2E8F0');

      const totalAmount = priceBreakdown.totalAmount || ticket.totalFare || 0;
      const basePrice = priceBreakdown.basePrice || totalAmount;
      const addCharges = priceBreakdown.additionalCharges || 0;
      const taxAmount = priceBreakdown.taxAmount || 0;

      doc
        .fontSize(8.5)
        .font('Helvetica')
        .fillColor('#475569')
        .text(`Base Fare: Rs. ${basePrice}`, 55, pBoxY + 10)
        .text(`Additional Charges: Rs. ${addCharges}`, 55, pBoxY + 26)
        .text(`Taxes & GST: Rs. ${taxAmount}`, 220, pBoxY + 10)
        .text(`Payment Status: ${ticket.paymentStatus || 'Successful'}`, 220, pBoxY + 26)
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor(isCancelled ? '#DC2626' : '#059669')
        .text(`Total Paid: Rs. ${totalAmount}`, 360, pBoxY + 17, { width: 180, align: 'right' });

      // 6. Terms & Travel Guidelines
      const footerY = pBoxY + 70;
      doc
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .fillColor('#475569')
        .text('IMPORTANT TRAVEL GUIDELINES & TERMS:', 40, footerY);

      doc
        .fontSize(7.5)
        .font('Helvetica')
        .fillColor('#64748B')
        .text('1. Photo ID Requirement: Every passenger must carry an original valid Govt. photo ID (Aadhaar, Passport, Voter ID, Driving License) for conductor verification.', 40, footerY + 13, { width: 515 })
        .text('2. Reporting Time: Please arrive at your designated boarding point at least 15 minutes prior to the scheduled departure time.', 40, footerY + 25, { width: 515 })
        .text("3. Official Reservation: This electronic ticket is issued under YATRA BUS India's electronic reservation system and confirms your coach booking.", 40, footerY + 37, { width: 515 })
        .text('4. Customer Assistance: For live bus tracking, schedule changes, or inquiries, contact our 24x7 helpdesk at 1800-250-8737 or email support@yatrabus.com.', 40, footerY + 49, { width: 515 });

      // Cancellation Notice if cancelled
      if (isCancelled) {
        doc
          .rect(40, footerY + 68, 515, 22)
          .fill('#FEE2E2');
        doc
          .fontSize(8.5)
          .font('Helvetica-Bold')
          .fillColor('#DC2626')
          .text('NOTE: THIS BOOKING HAS BEEN CANCELLED. THIS DOCUMENT SERVES AS A CANCELLATION RECORD.', 55, footerY + 74);
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
