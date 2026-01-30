/**
 * Email template: Payment approved
 * Sent when admin approves a payment report
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

interface PaymentApprovedEmailProps {
  businessName: string
  planName: string
  amount: string
  periodEnd?: string
  logoUrl?: string
  brandColor?: string
}

export default function PaymentApprovedEmail({
  businessName = 'Tu Barbería',
  planName = 'Pro',
  amount = '₡14,500',
  periodEnd,
  logoUrl,
  brandColor = '#10b981',
}: PaymentApprovedEmailProps) {
  const formattedPeriodEnd = periodEnd
    ? format(new Date(periodEnd), "d 'de' MMMM, yyyy", { locale: es })
    : 'próximo mes'

  return (
    <Html>
      <Head />
      <Preview>✅ Tu pago ha sido aprobado - Plan {planName} activo</Preview>
      <Body style={main}>
        <Container style={container}>
          {logoUrl && (
            <Section style={logoSection}>
              <Img src={logoUrl} width="120" height="120" alt={businessName} style={logo} />
            </Section>
          )}

          <Section style={successBadge}>
            <Text style={successIcon}>✅</Text>
          </Section>

          <Heading style={{ ...heading, color: brandColor }}>¡Pago Aprobado!</Heading>

          <Text style={paragraph}>
            Hola desde <strong>{businessName}</strong>,
          </Text>

          <Text style={paragraph}>
            Excelentes noticias: tu pago ha sido verificado y aprobado. Tu plan{' '}
            <strong>{planName}</strong> está ahora activo.
          </Text>

          <Section style={detailsBox}>
            <Text style={detailsLabel}>Plan:</Text>
            <Text style={detailsValue}>{planName}</Text>

            <Text style={detailsLabel}>Monto:</Text>
            <Text style={detailsValue}>{amount}</Text>

            <Text style={detailsLabel}>Válido hasta:</Text>
            <Text style={detailsValue}>{formattedPeriodEnd}</Text>
          </Section>

          <Text style={paragraph}>
            Ya puedes disfrutar de todas las funciones de tu plan sin restricciones:
          </Text>

          <Section style={buttonSection}>
            <Button style={button} href="https://app.barbershoppro.com/dashboard">
              Ir al Dashboard
            </Button>
          </Section>

          <Text style={paragraph}>
            Tu próxima fecha de renovación será el <strong>{formattedPeriodEnd}</strong>. Te
            enviaremos un recordatorio unos días antes.
          </Text>

          <Text style={footer}>
            ¿Tienes preguntas?{' '}
            <Link href="https://app.barbershoppro.com/suscripcion">Ver mi suscripción</Link>
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
  padding: '32px 20px 16px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
  borderRadius: '12px',
}

const successBadge = {
  textAlign: 'center' as const,
  padding: '16px',
}

const successIcon = {
  fontSize: '64px',
  lineHeight: '1',
  margin: '0',
}

const heading = {
  fontSize: '28px',
  lineHeight: '1.3',
  fontWeight: '700',
  padding: '0 20px',
  textAlign: 'center' as const,
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
  backgroundColor: '#10b981',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const footer = {
  fontSize: '14px',
  color: '#888',
  padding: '0 20px',
  textAlign: 'center' as const,
  marginTop: '32px',
}
