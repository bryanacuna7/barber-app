/**
 * Email template: New appointment
 * Sent when a new appointment is created
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface NewAppointmentEmailProps {
  businessName: string
  clientName: string
  serviceName: string
  barberName?: string
  appointmentDate: string
  duration: number
  price: string
  logoUrl?: string
  brandColor?: string
}

export default function NewAppointmentEmail({
  businessName = 'Tu Barbería',
  clientName = 'Juan Pérez',
  serviceName = 'Corte de Cabello',
  barberName,
  appointmentDate,
  duration = 30,
  price = '₡5,000',
  logoUrl,
  brandColor = '#3b82f6',
}: NewAppointmentEmailProps) {
  const formattedDate = appointmentDate
    ? format(new Date(appointmentDate), "EEEE d 'de' MMMM 'a las' h:mm a", { locale: es })
    : 'Fecha por confirmar'

  return (
    <Html>
      <Head />
      <Preview>
        Nueva cita: {clientName} - {serviceName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {logoUrl && (
            <Section style={logoSection}>
              <Img src={logoUrl} width="120" height="120" alt={businessName} style={logo} />
            </Section>
          )}

          <Heading style={{ ...heading, color: brandColor }}>📅 Nueva Cita Agendada</Heading>

          <Text style={paragraph}>
            Hola desde <strong>{businessName}</strong>,
          </Text>

          <Text style={paragraph}>Se ha agendado una nueva cita en tu barbería:</Text>

          <Section style={detailsBox}>
            <Text style={detailsLabel}>Cliente:</Text>
            <Text style={detailsValue}>{clientName}</Text>

            <Text style={detailsLabel}>Servicio:</Text>
            <Text style={detailsValue}>{serviceName}</Text>

            {barberName && (
              <>
                <Text style={detailsLabel}>Barbero:</Text>
                <Text style={detailsValue}>{barberName}</Text>
              </>
            )}

            <Text style={detailsLabel}>Fecha y hora:</Text>
            <Text style={detailsValue}>{formattedDate}</Text>

            <Text style={detailsLabel}>Duración:</Text>
            <Text style={detailsValue}>{duration} minutos</Text>

            <Text style={detailsLabel}>Precio:</Text>
            <Text style={detailsValue}>{price}</Text>
          </Section>

          <Section style={buttonSection}>
            <Button style={button} href="https://app.barbershoppro.com/citas">
              Ver en Dashboard
            </Button>
          </Section>

          <Text style={tip}>
            💡 <strong>Tip:</strong> Puedes ver todas tus citas del día en el dashboard y recibir
            notificaciones en tiempo real.
          </Text>

          <Text style={footer}>
            ¿Necesitas cambiar algo?{' '}
            <Link href="https://app.barbershoppro.com/citas">Gestionar citas</Link>
          </Text>

          <Text style={footer}>BarberShop Pro - Tu barbería, sin complicaciones</Text>
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

const logoSection = {
  padding: '32px 20px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
  borderRadius: '12px',
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

const buttonSection = {
  padding: '24px 20px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const tip = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#6b7280',
  padding: '16px 20px',
  margin: '16px 20px',
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  borderLeft: '4px solid #3b82f6',
}

const footer = {
  fontSize: '14px',
  color: '#888',
  padding: '0 20px',
  textAlign: 'center' as const,
  marginTop: '32px',
}
