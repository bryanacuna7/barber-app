# Changelog

Todas las versiones del proyecto, documentadas en formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).
Guia de estilo para copy publico: `docs/CHANGELOG_PUBLIC_STYLE.md`.
Detalle tecnico interno: `CHANGELOG_INTERNAL.md`.

## [0.9.10] - 2026-02-24

### Mejorado

- La app carga mas rapido al abrir el panel principal (consultas iniciales optimizadas)
- Animaciones de fondo mas fluidas y con menor consumo de bateria
- Las notificaciones solo se consultan cuando la app esta visible, reduciendo consumo de datos
- El calendario se actualiza de forma mas inteligente: solo recarga estadisticas cuando hay cambios relevantes
- Colores de la app y configuracion se guardan correctamente cuando no hay conexion

## [0.9.9] - 2026-02-24

### Nuevo

- Notificaciones inteligentes para clientes: recordatorios de re-reserva y mensajes personalizados por frecuencia de visita
- Navbar fijo en la pagina principal con navegacion y acceso directo a registro

### Mejorado

- "Barberos" renombrado a "Equipo" en toda la plataforma para reflejar equipos mas diversos
- Confirmacion de reserva ahora muestra el nombre del profesional y el precio final (con descuento si aplica)
- Tarjetas de servicio mas robustas en movil: textos largos ya no rompen el layout
- Calendario corregido para mostrar siempre el dia correcto en zona horaria de Costa Rica
- Notificaciones push con mensajes de error claros cuando algo falla al activarlas
- Enlace directo a perfil desde la cuenta del cliente
- Pie de pagina simplificado sin enlaces rotos
- Cierre de sesion ahora redirige correctamente en todos los navegadores

### Corregido

- 7 problemas criticos de la auditoria E2E: rutas de autenticacion, pantalla post-reserva, indicadores de disponibilidad, datos fantasma y mas
- Textos en espanol estandarizado (sin mezcla de vos/tu)
- Version dinamica en el menu lateral (ya no dice "v1.0" fijo)
- Corregido error de compilacion en configuracion de gestos
- Precio fijo "Equipo ilimitado" (antes decia "ilimitados")
- Colores de la app corregidos al instalarla en el celular

---

## [0.9.8] - 2026-02-24

### Nuevo

- Bloqueos de agenda: los barberos pueden marcar descansos, vacaciones y tiempo personal que se excluyen automaticamente de los horarios disponibles
- Permisos por barbero: el dueno puede configurar que secciones del dashboard ve cada barbero de forma individual
- Exportar CSV: descarga la lista de clientes o el historial de citas en formato CSV desde el dashboard
- Checklist de bienvenida: los barberos nuevos ven una guia de 3 pasos (foto, horario, notificaciones) al entrar por primera vez
- Registro de notificaciones: el dueno puede ver un historial de todas las notificaciones enviadas

### Mejorado

- Encabezados del dashboard unificados con estilo consistente en todas las paginas
- Graficas adaptadas a movil: altura responsive y tooltips tactiles
- "Email" cambiado a "Correo" en formularios para mantener todo en espanol
- Tarjetas de lealtad simplificadas: se elimino doble borde visual
- Mapa de demanda con scroll horizontal en pantallas pequenas

### Seguridad

- Corregido un problema de seguridad importante en la creacion de cuentas de clientes: ahora usa un token seguro de un solo uso
- Las notificaciones pasan por un orquestador central con deduplicacion y registro de auditoria
- Permisos de barbero protegidos contra auto-escalacion: un barbero no puede darse permisos de owner

---

## [0.9.7] - 2026-02-23

### Nuevo

- Pago anticipado SINPE: los clientes pueden pagar antes de la cita y recibir un descuento configurable (5-50%)
- Dos formas de enviar comprobante: subir foto directamente o enviar por WhatsApp con mensaje prellenado
- Verificacion de pagos: el dueno revisa el comprobante y aprueba o rechaza desde el dashboard
- Configuracion completa en Configuracion > Pagos: numero SINPE, nombre del titular, porcentaje de descuento y plazo limite
- Badges en citas del dashboard: "Pago pendiente" (amarillo) y "Pago verificado" (verde)

### Mejorado

- La pantalla de confirmacion de reserva muestra un banner invitando a pagar por adelantado cuando el negocio lo tiene activo
- Los precios se congelan al momento del pago anticipado para evitar inconsistencias
- Limpieza automatica de comprobantes 30 dias despues de verificacion o rechazo

### Seguridad

- Comprobantes almacenados en bucket privado con URLs firmadas de 1 hora
- Validacion de tipo de archivo (solo imagenes) y tamano maximo de 5MB
- Solo el dueno y barberos del negocio pueden ver los comprobantes

---

## [0.9.6] - 2026-02-23

### Nuevo

- Los clientes ahora pueden cancelar o reagendar sus citas desde el enlace de seguimiento, si el negocio lo permite
- Configuracion de politica de cancelacion en Configuracion > Pagos: activar cancelaciones, definir horas de anticipacion y permitir reagendamiento
- Al cancelar, el dueno recibe notificacion push, email e in-app automaticamente
- Texto explicativo en Metodos de Pago para entender como funciona el registro de pagos

### Mejorado

- La pagina de seguimiento muestra los botones de cancelar y reagendar cuando la politica esta activa
- Si el plazo para cancelar ya paso, los botones se deshabilitan con un mensaje claro
- Descripciones de metodos de pago mas claras: ahora explican que el cobro es en persona

### Seguridad

- Politicas de acceso mas estrictas en la tabla de conversiones de referidos

---

## [0.9.5] - 2026-02-23

### Nuevo

- Horarios inteligentes con descuento: configura reglas para ofrecer precios reducidos en horas de baja demanda
- Mapa de calor de demanda en Analiticas: visualiza que dias y horas tienen mas citas de un vistazo
- Pagina de configuracion de promociones en Configuracion > Promociones para crear y administrar reglas de descuento
- Al reservar, los horarios con descuento muestran el precio original tachado y el precio con descuento

### Mejorado

- El sistema de reservas ahora muestra automaticamente los descuentos disponibles en cada horario
- La confirmacion de cita incluye detalle del descuento aplicado cuando corresponde

## [0.9.4] - 2026-02-23

### Nuevo

- Duracion inteligente: el sistema aprende cuanto tarda cada servicio por barbero y ajusta la disponibilidad automaticamente
- Toggle para activar/desactivar duracion inteligente en Configuracion > Avanzado
- Tarjeta de insights de duracion en Analiticas con tiempo recuperado y promedios

### Mejorado

- Documentacion del proyecto optimizada y reorganizada (archivos de planes completados movidos a archivo)

### Corregido

- Boton de volver en subrutas de Configuracion ya no recarga la pagina completa
- "Clientes" ya no aparece duplicado en el menu "Mas" para owners
- Las tarjetas de clientes ya no quedan cortadas detras de la barra de navegacion inferior

## [0.9.3] - 2026-02-10

### Nuevo

- Seguimiento en vivo de tu cita: al reservar recibis un link para ver tu posicion en la fila en tiempo real
- Recordatorios automaticos por email y notificacion push 24 horas y 1 hora antes de tu cita
- Notificacion "Llega antes" cuando tu barbero termina antes de lo esperado
- Portal de cliente: ahora podes ver tus citas y perfil desde /mi-cuenta sin necesitar acceso al dashboard
- Experiencia desktop premium: sidebar colapsable, paleta de comandos (Ctrl+K), tablas con acciones hover
- Invitacion de barberos por email con roles y permisos diferenciados

### Mejorado

- Interfaz simplificada en todas las pantallas: menos ruido visual, mejor jerarquia de informacion
- Animaciones mas suaves y consistentes con soporte para movimiento reducido
- Skeletons de carga nativos en todas las pantallas principales
- Gestos de swipe mejorados en listas de citas y clientes
- Las paginas de datos (citas, clientes, servicios) ahora tienen vista de tabla en desktop y lista en movil
- Configuracion reorganizada en subrutas mas claras (general, horario, branding, equipo, pagos)
- Email de confirmacion de cita ahora incluye link de seguimiento en vivo

### Corregido

- Tokens de seguimiento expirados ya no permiten acceso a datos de la fila
- Citas canceladas ya no aparecen en el seguimiento publico
- Recordatorios no se envian duplicados gracias a sistema de deduplicacion mejorado
- Citas agendadas el mismo dia ahora reciben correctamente el recordatorio de 1 hora

## [0.9.2] - 2026-02-07

### Corregido

- La app en iPhone ahora se actualiza sola sin tener que borrar y reinstalar
- La navegacion en la pagina de citas ahora se siente mas fluida en iPhone
- Se ajusto el espacio superior de la pantalla principal para una vista mas limpia

### Mejorado

- El icono de la app ahora es mas grande y limpio (barber pole con forma de pastilla)
- La app chequea actualizaciones cada vez que la abres (antes solo cada hora)

## [0.9.1] - 2026-02-07

### Nuevo

- Sistema de colores rediseñado con mejor legibilidad en todo el app
- Graficas de analiticas rediseñadas con colores de la marca
- Monitoreo interno mejorado para detectar y resolver incidencias mas rapido

### Mejorado

- Mejor visibilidad del texto en modo claro y oscuro
- Numeros grandes en la pantalla principal ahora se muestran de forma compacta (ej: ₡1.3M)
- Tarjetas de estadisticas se adaptan mejor a pantallas pequeñas
- Icono de la app rediseñado con estilo minimalista (barber pole monocromatico)

### Corregido

- Los colores de las graficas ahora se ven correctamente en todos los navegadores

## [0.9.0] - 2026-02-07

### Nuevo

- Rediseño completo de la pantalla principal para uso mas comodo desde el celular
- Interfaz visual unificada con mejor consistencia en tipografia, colores y movimientos
- 5 paginas del dashboard modernizadas (Citas, Barberos, Clientes, Servicios, Analiticas)
- Nuevo panel administrativo con herramientas avanzadas para la gestion del negocio
- La app mantiene funciones clave con conexion inestable y conserva tu identidad de marca

### Mejorado

- App mas rapida al cargar datos clave en modulos como Citas y Analiticas
- Seguridad reforzada para proteger mejor cuentas, sesiones y datos del negocio
- Mayor estabilidad general con mejoras de monitoreo y control de errores
- 11 mejoras criticas de experiencia movil para una navegacion mas clara y comoda
- Optimizacion de infraestructura para reducir interrupciones y mantener mejor rendimiento
