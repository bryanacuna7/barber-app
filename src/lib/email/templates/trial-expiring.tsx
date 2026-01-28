/**
 * Email template: Trial expiring
 * Sent when a business trial is about to expire
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

interface TrialExpiringEmailProps {
  businessName: string
  daysRemaining: number
  logoUrl?: string
  brandColor?: string
}

export default function TrialExpiringEmail({
  businessName = 'Tu Barbería',
  daysRemaining = 3,
  logoUrl,
  brandColor = '#3b82f6',
}: TrialExpiringEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Tu período de prueba Pro vence en {daysRemaining} días</Preview>
      <Body style={main}>
        <Container style={container}>
          {logoUrl && (
            <Section style={logoSection}>
              <Img src={logoUrl} width="120" height="120" alt={businessName} style={logo} />
            </Section>
          )}

          <Heading style={{ ...heading, color: brandColor }}>
            ⏰ Te quedan {daysRemaining} días de prueba Pro
          </Heading>

          <Text style={paragraph}>Hola desde <strong>{businessName}</strong>,</Text>

          <Text style={paragraph}>
            Tu período de prueba de 7 días está por vencer. Después de esta fecha, tu plan
            cambiará automáticamente a <strong>Básico</strong> con las siguientes limitaciones:
          </Text>

          <Section style={listSection}>
            <Text style={listItem}>• Máximo 2 barberos</Text>
            <Text style={listItem}>• Máximo 3 servicios</Text>
            <Text style={listItem}>• Máximo 25 clientes</Text>
            <Text style={listItem}>• Sin personalización de marca</Text>
          </Section>

          <Text style={paragraph}>
            Para continuar disfrutando de todas las funciones Pro, reporta tu pago ahora:
          </Text>

          <Section style={buttonSection}>
            <Button style={button} href="https://app.barbershoppro.com/suscripcion">
              Reportar Pago y Continuar con Pro
            </Button>
          </Section>

          <Text style={paragraph}>
            <strong>Plan Pro</strong> - $29/mes (₡14,500 aprox):
          </Text>
          <Section style={listSection}>
            <Text style={listItem}>✅ Barberos ilimitados</Text>
            <Text style={listItem}>✅ Servicios ilimitados</Text>
            <Text style={listItem}>✅ Clientes ilimitados</Text>
            <Text style={listItem}>✅ Personalización completa de marca</Text>
          </Section>

          <Text style={footer}>
            ¿Tienes preguntas? <Link href="https://app.barbershoppro.com/precios">Ver precios</Link>
          </Text>

          <Text style={footer}>
            BarberShop Pro - Tu barbería, sin complicaciones
          </Text>
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

const listSection = {
  padding: '0 20px',
}

const listItem = {
  fontSize: '16px',
  lineHeight: '1.8',
  color: '#333',
  margin: '4px 0',
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

const footer = {
  fontSize: '14px',
  color: '#888',
  padding: '0 20px',
  textAlign: 'center' as const,
  marginTop: '32px',
}
