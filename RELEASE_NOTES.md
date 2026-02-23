# Release Notes

<!--
  Este archivo contiene las notas de la ULTIMA version.
  Se envia automaticamente a Discord cuando se hace push a main.

  Escribir en lenguaje de usuario final, NO tecnico.
  Mantener solo la version actual (reemplazar en cada release).
-->

## v0.9.7

### Nuevo

- Pago anticipado con SINPE: ofrece un descuento a clientes que pagan antes de la cita. El cliente envia su comprobante por WhatsApp o lo sube directo en la app
- Verificacion de pagos: cuando un cliente envia su comprobante, te aparece un badge "Pago pendiente" en la cita. Tocalo para ver el comprobante y aprobarlo o rechazarlo
- Configuracion en Pagos: activa el pago anticipado, ingresa tu numero SINPE, nombre del titular, el porcentaje de descuento que queres dar y el plazo limite

### Mejoras

- Despues de reservar, el cliente ve una invitacion a pagar por adelantado con el monto y descuento calculado
- Los precios se congelan al momento del pago para que no haya sorpresas si despues cambias tarifas
- Los comprobantes se eliminan automaticamente 30 dias despues de ser revisados para no ocupar espacio

### Seguridad

- Los comprobantes son privados: solo vos y tus barberos pueden verlos
- Solo se aceptan imagenes de hasta 5MB
