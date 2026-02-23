# Changelog

Todas las versiones del proyecto, documentadas en formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).
Guia de estilo para copy publico: `docs/CHANGELOG_PUBLIC_STYLE.md`.
Detalle tecnico interno: `CHANGELOG_INTERNAL.md`.

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
