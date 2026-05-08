import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface BookingConfirmationEmailProps {
  customerName: string;
  bookingId: string;
  resourceName: string;
  bookingDate: string;
}

export const BookingConfirmationEmail = ({
  customerName,
  bookingId,
  resourceName,
  bookingDate,
}: BookingConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your booking for {resourceName} is confirmed!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Booking Confirmed!</Heading>
        <Text style={text}>Hi {customerName},</Text>
        <Text style={text}>
          Your booking has been successfully confirmed. Here are your booking details:
        </Text>
        
        <Section style={detailsContainer}>
          <Text style={detailsText}><strong>Booking ID:</strong> {bookingId}</Text>
          <Text style={detailsText}><strong>Service:</strong> {resourceName}</Text>
          <Text style={detailsText}><strong>Date & Time:</strong> {bookingDate}</Text>
          <Text style={detailsText}><strong>Status:</strong> Confirmed</Text>
        </Section>

        <Section style={buttonContainer}>
          <Button style={button} href={`${process.env.NEXTAUTH_URL}/dashboard`}>
            View Booking
          </Button>
        </Section>
        
        <Text style={footer}>
          If you have any questions or need to make changes, please contact our support team.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default BookingConfirmationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  borderRadius: '8px',
  maxWidth: '600px',
  border: '1px solid #e6ebf1',
};

const heading = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0 0 20px',
};

const text = {
  color: '#555',
  fontSize: '16px',
  lineHeight: '24px',
};

const detailsContainer = {
  backgroundColor: '#f9f9f9',
  padding: '20px',
  borderRadius: '4px',
  margin: '20px 0',
};

const detailsText = {
  color: '#333',
  fontSize: '16px',
  margin: '8px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#007bff',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  fontWeight: 'bold',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  marginTop: '40px',
  textAlign: 'center' as const,
};
