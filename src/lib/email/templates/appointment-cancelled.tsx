/**
 * Email template: Appointment cancelled (client confirmation)
 * Sent to the client when they cancel their own appointment.
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface AppointmentCancelledEmailProps {
  businessName: string
  clientName: string
  appointmentDate: string
  brandColor?: string
}

export default function AppointmentCancelledEmail({
  businessName = 'Tu Barbería',
  clientName = 'Cliente',
  appointmentDate,
  brandColor = '#3b82f6',
}: AppointmentCancelledEmailProps) {
  const formattedDate = appointmentDate
    ? format(new Date(appointmentDate), "EEEE d 'de' MMMM 'a las' h:mm a", { locale: es })
    : 'Fecha por confirmar'

  return (
    <Html>
      <Head />
      <Preview>Tu cita en {businessName} ha sido cancelada</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={{ ...heading, color: brandColor }}>Cita Cancelada</Heading>

          <Text style={paragraph}>Hola, {clientName}.</Text>

          <Text style={paragraph}>
            Tu cita en <strong>{businessName}</strong> ha sido cancelada exitosamente.
          </Text>

          <Section style={detailsBox}>
            <Text style={detailsLabel}>Barbería:</Text>
            <Text style={detailsValue}>{businessName}</Text>

            <Text style={detailsLabel}>Fecha y hora:</Text>
            <Text style={detailsValue}>{formattedDate}</Text>
          </Section>

          <Text style={paragraph}>
            Si deseas agendar una nueva cita, puedes hacerlo directamente en la página de la
            barbería.
          </Text>

          <Text style={footer}>BarberApp - Tu barbería, sin complicaciones</Text>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const heading = {
  fontSize: '28px',
  lineHeight: '1.3',
  fontWeight: '700',
  padding: '0 20px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#333',
  padding: '0 20px',
}

const detailsBox = {
  margin: '24px 20px',
  padding: '24px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
}

const detailsLabel = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '8px 0 4px 0',
  fontWeight: '500',
}

const detailsValue = {
  fontSize: '18px',
  color: '#111827',
  margin: '0 0 16px 0',
  fontWeight: '600',
}

const footer = {
  fontSize: '14px',
  color: '#888',
  padding: '0 20px',
  textAlign: 'center' as const,
  marginTop: '32px',
}
