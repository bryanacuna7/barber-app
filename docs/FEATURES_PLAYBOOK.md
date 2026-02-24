# Catalogo Comercial de Funcionalidades

Documento vivo para ventas, onboarding comercial y alineacion de roadmap.

- Version de catalogo: 1.0.0
- Ultima actualizacion funcional: 2026-02-24
- Fuente unica: `src/content/feature-catalog.json`

## Protocolo obligatorio de actualizacion

1. Cada cambio funcional nuevo debe actualizar `src/content/feature-catalog.json`.
2. Ejecutar `npm run docs:features` para regenerar este documento.
3. Verificar sincronizacion con `npm run docs:features:check`.
4. No cerrar PR de funcionalidad si este documento no refleja el cambio.
5. Si hay cambio comercial relevante, reflejarlo tambien en el landing section por perfil.

## Resumen por perfil

### Dueno de negocio

Controla operacion, ingresos, equipo y experiencia del cliente desde un solo lugar.

#### Beneficios clave

- Menos tiempo operativo manual y menos errores de agenda
- Mas citas efectivas con recordatorios y reglas automatizadas
- Mayor ticket promedio con promociones, lealtad y pagos anticipados
- Mejor visibilidad del negocio con metricas accionables

#### Funciones destacadas para venta

| Funcion                         | Valor comercial                                                        |
| ------------------------------- | ---------------------------------------------------------------------- |
| Agenda inteligente multibarbero | Controla toda la operacion y reasigna citas en segundos.               |
| CRM de clientes                 | Detecta clientes VIP, frecuentes o inactivos y actua rapido.           |
| Analiticas y KPIs               | Detecta horas pico, rendimiento de servicios y tendencias de ingresos. |
| Pago anticipado SINPE           | Reduce riesgo de no-show y valida pagos en un flujo controlado.        |
| Promociones por horario         | Llena huecos de agenda con reglas automaticas.                         |
| Permisos por barbero            | Protege informacion sensible y delega con seguridad.                   |

### Barbero

Trabaja con una agenda clara, menos friccion operativa y foco total en atender mejor.

#### Beneficios clave

- Dia de trabajo claro con prioridades visibles
- Menos no-shows y mejor coordinacion con clientes
- Autonomia para gestionar bloqueos y disponibilidad
- Onboarding mas rapido para nuevos integrantes

#### Funciones destacadas para venta

| Funcion                          | Valor comercial                                             |
| -------------------------------- | ----------------------------------------------------------- |
| Mi Dia para barberos             | Gestiona su jornada completa desde una pantalla optimizada. |
| Bloqueos de agenda               | Protege su disponibilidad real sin gestion manual externa.  |
| Notificaciones automaticas       | Coordina mejor su flujo diario con clientes informados.     |
| Duracion inteligente             | Recibe una agenda mejor ajustada a su ritmo real.           |
| Checklist de onboarding          | Empieza a usar la app con pasos claros y concretos.         |
| Gestion de equipo e invitaciones | Recibe acceso formal y entra a operar rapido.               |

### Cliente final

Reserva facil, seguimiento en vivo y control de su cita sin llamadas ni friccion.

#### Beneficios clave

- Reserva online 24/7 en pocos pasos
- Visibilidad del turno en tiempo real
- Opciones de cancelacion o reagendado segun politica del negocio
- Historial, perfil y notificaciones en su portal

#### Funciones destacadas para venta

| Funcion                               | Valor comercial                                              |
| ------------------------------------- | ------------------------------------------------------------ |
| Reserva online personalizada          | Agenda su cita en minutos desde cualquier dispositivo.       |
| Seguimiento en vivo de cita           | Sabe exactamente en que estado va su turno.                  |
| Cancelacion y reagendado desde enlace | Gestiona su cita sin llamadas ni espera.                     |
| Pago anticipado SINPE                 | Puede asegurar su cita y acceder a descuento anticipado.     |
| Portal de cliente                     | Gestiona su informacion y revisa su historial cuando quiera. |
| Notificaciones automaticas            | Recibe recordatorios y avisos utiles en el momento correcto. |

## Matriz completa de funcionalidades

| Funcionalidad                         | Perfiles                                 | Beneficio principal                                           | Ventaja competitiva                                                    | Modulos                                                                    |
| ------------------------------------- | ---------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Agenda inteligente multibarbero       | Dueno de negocio, Barbero                | Reduce errores operativos y acelera la reprogramacion.        | Operacion agil incluso en horarios de alta demanda.                    | /citas, /mi-dia, /dashboard                                                |
| Gestion de equipo e invitaciones      | Dueno de negocio, Barbero                | Escala la barberia sin perder control de personal.            | Alta de nuevos barberos sin procesos manuales largos.                  | /barberos, /configuracion/equipo                                           |
| Permisos por barbero                  | Dueno de negocio                         | Mejor control operativo y menos riesgo por accesos excesivos. | Gestion granular sin depender de desarrollo.                           | /configuracion/equipo                                                      |
| CRM de clientes                       | Dueno de negocio                         | Mejora retencion y campanas dirigidas por comportamiento.     | Informacion accionable sin hojas de calculo.                           | /clientes                                                                  |
| Exportacion CSV                       | Dueno de negocio                         | Facilita reportes comerciales y control administrativo.       | Datos listos para contabilidad y analisis sin integraciones complejas. | /api/exports/clients, /api/exports/appointments                            |
| Catalogo de servicios                 | Dueno de negocio                         | Estandariza la oferta y evita inconsistencias de precio.      | Control comercial centralizado.                                        | /servicios                                                                 |
| Analiticas y KPIs                     | Dueno de negocio                         | Permite decisiones basadas en datos reales del negocio.       | Identifica oportunidades de crecimiento con rapidez.                   | /analiticas, /dashboard                                                    |
| Duracion inteligente                  | Dueno de negocio, Barbero                | Mejora precision de disponibilidad y reduce atrasos.          | Agenda mas realista que se ajusta a la operacion real.                 | /configuracion/avanzado, /analiticas                                       |
| Promociones por horario               | Dueno de negocio, Cliente final          | Aumenta ocupacion en franjas ociosas.                         | Monetiza mejor la capacidad no utilizada.                              | /configuracion/promociones, /reservar/[slug]                               |
| Pago anticipado SINPE                 | Dueno de negocio, Cliente final          | Disminuye ausencias y mejora flujo de caja.                   | Asegura compromiso del cliente antes de la cita.                       | /configuracion/pagos, /reservar/[slug], /api/public/advance-payment        |
| Cancelacion y reagendado desde enlace | Dueno de negocio, Cliente final          | Reduce friccion de soporte y ordena cambios de agenda.        | Autogestion del cliente con reglas claras.                             | /configuracion/pagos, /track/[token]                                       |
| Notificaciones automaticas            | Dueno de negocio, Barbero, Cliente final | Mejora asistencia y experiencia de servicio.                  | Comunicacion proactiva sin carga manual.                               | /api/cron/appointment-reminders, /track/[token], /mi-cuenta/notificaciones |
| Registro de notificaciones            | Dueno de negocio                         | Permite control y trazabilidad de comunicaciones.             | Visibilidad completa sobre mensajes enviados.                          | /api/notifications/log                                                     |
| Programa de lealtad                   | Dueno de negocio, Cliente final          | Incrementa recurrencia y valor de vida del cliente.           | Retencion integrada sin herramientas externas.                         | /lealtad/configuracion, /mi-cuenta                                         |
| Sistema de referencias                | Dueno de negocio                         | Genera crecimiento organico con menor costo de adquisicion.   | Canal de captacion propio medible desde la app.                        | /referencias                                                               |
| Mi Dia para barberos                  | Barbero                                  | Aumenta foco y velocidad operativa durante la jornada.        | Flujo simple para operar sin perder tiempo en navegacion.              | /mi-dia                                                                    |
| Bloqueos de agenda                    | Barbero, Dueno de negocio                | Evita sobrecarga y conflictos de disponibilidad.              | Agenda realista y sostenible para el equipo.                           | /api/barber-blocks, /mi-dia                                                |
| Checklist de onboarding               | Barbero, Dueno de negocio                | Acelera adopcion del equipo y reduce soporte interno.         | Incorporacion estandarizada desde el primer ingreso.                   | /onboarding                                                                |
| Reserva online personalizada          | Cliente final, Dueno de negocio          | Habilita captacion 24/7 sin llamadas ni intermediarios.       | Experiencia digital propia de la marca.                                | /reservar/[slug], /configuracion/branding, /configuracion/general          |
| Seguimiento en vivo de cita           | Cliente final, Barbero, Dueno de negocio | Reduce incertidumbre y mejora puntualidad.                    | Experiencia tipo "llega cuando toca" para el cliente.                  | /track/[token], /api/public/queue                                          |
| Portal de cliente                     | Cliente final                            | Mejora experiencia post-reserva y relacion a largo plazo.     | Autoservicio completo para el cliente final.                           | /mi-cuenta, /mi-cuenta/perfil, /mi-cuenta/notificaciones                   |
| Personalizacion de marca              | Dueno de negocio, Cliente final          | Fortalece identidad y confianza en cada punto de contacto.    | Experiencia white-label orientada a conversion.                        | /configuracion/branding, /reservar/[slug]                                  |
| Gestion de suscripcion                | Dueno de negocio                         | Control total del crecimiento y costos de la operacion.       | Administracion comercial centralizada en la plataforma.                | /suscripcion, /api/subscription                                            |

## Guion rapido para demo comercial

1. Abrir con valor para dueno: control de agenda, ingresos y equipo desde un solo panel.
2. Mostrar operacion de barbero: Mi Dia, bloqueos, notificaciones y flujo diario.
3. Cerrar con experiencia cliente: reserva online, tracking en vivo y autogestion de cita.
4. Conectar con resultados: menos no-shows, mas ocupacion, mejor retencion.

## Checklist antes de presentar a clientes

- Confirmar que las funciones demostradas existen en produccion.
- Validar que politicas (cancelacion, pagos, promociones) esten configuradas en la cuenta demo.
- Preparar ejemplos por perfil: dueno, barbero y cliente final.
- Revisar esta version del catalogo y el changelog publico vigente.
