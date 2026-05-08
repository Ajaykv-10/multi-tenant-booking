import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface BookingCancellationEmailProps {
  customerName: string;
  bookingId: string;
  resourceName: string;
  cancelledDate: string;
}

export const BookingCancellationEmail = ({
  customerName,
  bookingId,
  resourceName,
  cancelledDate,
}: BookingCancellationEmailProps) => (
  <Html>
    <Head />
    <Preview>Your booking for {resourceName} has been cancelled.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Booking Cancelled</Heading>
        <Text style={text}>Hi {customerName},</Text>
        <Text style={text}>
          Your booking has been successfully cancelled. Here are the details of the cancelled booking:
        </Text>
        
        <Section style={detailsContainer}>
          <Text style={detailsText}><strong>Booking ID:</strong> {bookingId}</Text>
          <Text style={detailsText}><strong>Service:</strong> {resourceName}</Text>
          <Text style={detailsText}><strong>Cancellation Date:</strong> {cancelledDate}</Text>
          <Text style={detailsText}><strong>Status:</strong> Cancelled</Text>
        </Section>

        <Text style={text}>
          If this was a mistake or you need to book another slot, please visit our website.
        </Text>
        
        <Text style={footer}>
          If you have any questions, please contact our support team.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default BookingCancellationEmail;

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
  color: '#d9534f',
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
  backgroundColor: '#fef2f2',
  padding: '20px',
  borderRadius: '4px',
  margin: '20px 0',
  border: '1px solid #fecaca',
};

const detailsText = {
  color: '#333',
  fontSize: '16px',
  margin: '8px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  marginTop: '40px',
  textAlign: 'center' as const,
};
