import PDFDocument from 'pdfkit';

export function generateTicketPdf(ticket) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const { journeySnapshot = {}, passengerSnapshot = [], priceBreakdown = {}, pnr, bookingId } = ticket;

      // Header Banner
      doc
        .rect(40, 40, 515, 60)
        .fill('#4C1D95');

      doc
        .fontSize(20)
        .fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .text('OBTBS - DIGITAL BUS TICKET', 55, 55);

      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Official Electronic Reservation Slip (ERS)', 55, 80);

      // PNR and Booking Bar
      doc.moveDown(2);
      const topMetaY = 115;
      doc
        .rect(40, topMetaY, 515, 45)
        .fillAndStroke('#F5F3FF', '#DDD6FE');

      doc
        .fillColor('#4C1D95')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`PNR: ${pnr}`, 55, topMetaY + 10)
        .fillColor('#374151')
        .fontSize(9)
        .font('Helvetica')
        .text(`Booking ID: ${bookingId}`, 55, topMetaY + 26);

      doc
        .fillColor('#059669')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('STATUS: CONFIRMED', 380, topMetaY + 10)
        .fillColor('#6B7280')
        .fontSize(9)
        .font('Helvetica')
        .text(`Issued: ${new Date(ticket.generatedAt || Date.now()).toLocaleDateString()}`, 380, topMetaY + 26);

      // Journey Information
      const journeyY = 175;
      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .fillColor('#1F2937')
        .text('Journey Details', 40, journeyY);

      doc
        .rect(40, journeyY + 18, 515, 95)
        .fillAndStroke('#F9FAFB', '#E5E7EB');

      const col1 = 55;
      const col2 = 220;
      const col3 = 380;
      const jRow1 = journeyY + 28;
      const jRow2 = journeyY + 54;
      const jRow3 = journeyY + 80;

      // Row 1
      doc.fontSize(8).fillColor('#6B7280').text('BUS OPERATOR / NAME', col1, jRow1);
      doc.fontSize(10).fillColor('#111827').font('Helvetica-Bold').text(journeySnapshot.busName || 'Express Bus', col1, jRow1 + 10);

      doc.fontSize(8).fillColor('#6B7280').font('Helvetica').text('BUS NUMBER', col2, jRow1);
      doc.fontSize(10).fillColor('#111827').font('Helvetica-Bold').text(journeySnapshot.busNumber || 'N/A', col2, jRow1 + 10);

      doc.fontSize(8).fillColor('#6B7280').font('Helvetica').text('BUS TYPE', col3, jRow1);
      doc.fontSize(10).fillColor('#111827').font('Helvetica-Bold').text(journeySnapshot.busType || 'AC Sleeper', col3, jRow1 + 10);

      // Row 2
      doc.fontSize(8).fillColor('#6B7280').font('Helvetica').text('ORIGIN / FROM', col1, jRow2);
      doc.fontSize(10).fillColor('#111827').font('Helvetica-Bold').text(journeySnapshot.source || 'N/A', col1, jRow2 + 10);

      doc.fontSize(8).fillColor('#6B7280').font('Helvetica').text('DESTINATION / TO', col2, jRow2);
      doc.fontSize(10).fillColor('#111827').font('Helvetica-Bold').text(journeySnapshot.destination || 'N/A', col2, jRow2 + 10);

      doc.fontSize(8).fillColor('#6B7280').font('Helvetica').text('JOURNEY DATE', col3, jRow2);
      doc.fontSize(10).fillColor('#111827').font('Helvetica-Bold').text(journeySnapshot.travelDate || 'N/A', col3, jRow2 + 10);

      // Row 3
      doc.fontSize(8).fillColor('#6B7280').font('Helvetica').text('DEPARTURE TIME & POINT', col1, jRow3);
      doc.fontSize(9).fillColor('#111827').font('Helvetica-Bold').text(`${journeySnapshot.departureTime} - ${journeySnapshot.boardingPoint || 'Main Stand'}`, col1, jRow3 + 10);

      doc.fontSize(8).fillColor('#6B7280').font('Helvetica').text('ARRIVAL TIME & POINT', col3, jRow3);
      doc.fontSize(9).fillColor('#111827').font('Helvetica-Bold').text(`${journeySnapshot.arrivalTime} - ${journeySnapshot.droppingPoint || 'City Drop'}`, col3, jRow3 + 10);

      // Passengers Table
      const passY = 300;
      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .fillColor('#1F2937')
        .text('Passenger Information', 40, passY);

      // Table Header
      const thY = passY + 18;
      doc
        .rect(40, thY, 515, 22)
        .fill('#EDE9FE');

      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#4C1D95')
        .text('Passenger Name', 55, thY + 6)
        .text('Age', 260, thY + 6)
        .text('Gender', 340, thY + 6)
        .text('Seat Number', 440, thY + 6);

      let rowY = thY + 22;
      passengerSnapshot.forEach((p, idx) => {
        const bg = idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
        doc.rect(40, rowY, 515, 20).fill(bg);

        doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor('#1F2937')
          .text(p.name, 55, rowY + 5)
          .text(String(p.age), 260, rowY + 5)
          .text(p.gender.toUpperCase(), 340, rowY + 5)
          .font('Helvetica-Bold')
          .text(p.seatNumber, 440, rowY + 5);

        rowY += 20;
      });

      // Price Breakdown & Summary
      const priceY = rowY + 20;
      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .fillColor('#1F2937')
        .text('Fare & Payment Summary', 40, priceY);

      const pBoxY = priceY + 18;
      doc
        .rect(40, pBoxY, 515, 55)
        .fillAndStroke('#F3F4F6', '#E5E7EB');

      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#4B5563')
        .text(`Base Fare: Rs. ${priceBreakdown.basePrice || 0}`, 55, pBoxY + 10)
        .text(`Additional Charges: Rs. ${priceBreakdown.additionalCharges || 0}`, 55, pBoxY + 26)
        .text(`Taxes & GST (5%): Rs. ${priceBreakdown.taxAmount || 0}`, 220, pBoxY + 10)
        .text(`Payment Status: ${ticket.paymentStatus || 'Successful'}`, 220, pBoxY + 26)
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#059669')
        .text(`Total Paid: Rs. ${priceBreakdown.totalAmount || 0}`, 380, pBoxY + 18);

      // Footer Instructions
      const footerY = 560;
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#6B7280')
        .text('TERMS & CONDITIONS FOR TRAVEL:', 40, footerY);

      doc
        .fontSize(7)
        .font('Helvetica')
        .fillColor('#9CA3AF')
        .text('1. Please carry a valid government-issued photo ID (Aadhaar, Passport, Driving License) along with this digital ticket.', 40, footerY + 12)
        .text('2. Please arrive at the boarding point at least 15 minutes before the scheduled departure time.', 40, footerY + 22)
        .text('3. This ticket is generated by the OBTBS system and is valid for travel on the specified scheduled trip.', 40, footerY + 32);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
