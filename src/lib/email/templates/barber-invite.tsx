/**
 * Email template: Barber Invitation
 * Sent when a business owner invites a barber to join their team
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components'

interface BarberInviteEmailProps {
  businessName: string
  barberName: string
  email: string
  tempPassword: string
  loginUrl: string
  logoUrl?: string
  brandColor?: string
}

export default function BarberInviteEmail({
  businessName = 'Tu Barbería',
  barberName = 'Barbero',
  email = 'barbero@email.com',
  tempPassword = '••••••••',
  loginUrl = 'https://app.barberapp.com/login',
  logoUrl,
  brandColor = '#3b82f6',
}: BarberInviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{businessName} te ha invitado como barbero</Preview>
      <Body style={main}>
        <Container style={container}>
          {logoUrl && (
            <Section style={logoSection}>
              <Img src={logoUrl} width="120" height="120" alt={businessName} style={logo} />
            </Section>
          )}

          <Heading style={{ ...heading, color: brandColor }}>
            Te han invitado a {businessName}
          </Heading>

          <Text style={paragraph}>
            Hola <strong>{barberName}</strong>,
          </Text>

          <Text style={paragraph}>
            Te han agregado como barbero en <strong>{businessName}</strong>. Usa las siguientes
            credenciales para iniciar sesión:
          </Text>

          <Section style={detailsBox}>
            <Text style={detailsLabel}>Correo electrónico:</Text>
            <Text style={detailsValue}>{email}</Text>

            <Text style={detailsLabel}>Contraseña temporal:</Text>
            <Text style={detailsValue}>{tempPassword}</Text>
          </Section>

          <Section style={buttonSection}>
            <Button style={{ ...button, backgroundColor: brandColor }} href={loginUrl}>
              Iniciar Sesión
            </Button>
          </Section>

          <Text style={tip}>
            🔒 <strong>Tip:</strong> Te recomendamos cambiar tu contraseña después de iniciar sesión
            por primera vez.
          </Text>

          <Text style={footer}>Si no esperabas esta invitación, puedes ignorar este correo.</Text>

          <Text style={footer}>BarberApp — Tu barbería, sin complicaciones</Text>
        </Container>
      </Body>
    </Html>
  )
}

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
  fontFamily: 'monospace',
}

const buttonSection = {
  padding: '24px 20px',
  textAlign: 'center' as const,
}

const button = {
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
