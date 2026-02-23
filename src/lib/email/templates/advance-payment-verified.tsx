/**
 * Email template: Advance payment verified / rejected (client notification)
 * Sent to the client when their SINPE payment receipt is verified or rejected.
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
  Hr,
} from '@react-email/components'

interface AdvancePaymentVerifiedEmailProps {
  businessName: string
  clientName: string
  amount: string // formatted price like "₡5,000"
  discount: number // percentage
  verified: boolean // true = verified, false = rejected
}

export default function AdvancePaymentVerifiedEmail({
  businessName = 'Tu Barbería',
  clientName = 'Cliente',
  amount = '₡0',
  discount = 10,
  verified = true,
}: AdvancePaymentVerifiedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {verified
          ? `Tu pago anticipado en ${businessName} fue verificado`
          : `Tu comprobante en ${businessName} no pudo ser verificado`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={{ ...heading, color: verified ? '#10b981' : '#ef4444' }}>
            {verified ? 'Pago Verificado' : 'Comprobante No Verificado'}
          </Heading>

          <Text style={paragraph}>Hola, {clientName}.</Text>

          {verified ? (
            <>
              <Text style={paragraph}>
                Tu pago anticipado en <strong>{businessName}</strong> fue verificado. Tu descuento
                de {discount}% está aplicado.
              </Text>

              <Section style={detailsBox}>
                <Text style={detailsLabel}>Monto:</Text>
                <Text style={detailsValue}>{amount}</Text>

                <Text style={detailsLabel}>Descuento:</Text>
                <Text style={detailsValue}>{discount}%</Text>
              </Section>
            </>
          ) : (
            <Text style={paragraph}>
              Tu comprobante enviado a <strong>{businessName}</strong> no pudo ser verificado. Podés
              enviar otro comprobante o pagar en el local.
            </Text>
          )}

          <Hr style={divider} />

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

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 20px',
}

const footer = {
  fontSize: '14px',
  color: '#888',
  padding: '0 20px',
  textAlign: 'center' as const,
  marginTop: '32px',
}
