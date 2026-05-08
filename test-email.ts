const dotenv = require('dotenv');
dotenv.config();

const { sendEmail } = require('./lib/email/sendEmail');
const { BookingConfirmationEmail } = require('./emails/booking-confirmation');

async function test() {
  console.log("Testing email sending...");
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_USER:", process.env.SMTP_USER);

  const result = await sendEmail({
    to: "kvajai10@gmail.com", // use the from email as recipient just for testing
    subject: "Test Email",
    template: BookingConfirmationEmail({
      customerName: "Test User",
      bookingId: "12345",
      resourceName: "Test Resource",
      bookingDate: new Date().toLocaleString(),
    }),
  });
  
  console.log("Result:", result);
}

test();
