# Changelog

Todas las versiones del proyecto, documentadas en formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).
Guia de estilo para copy publico: `docs/CHANGELOG_PUBLIC_STYLE.md`.
Detalle tecnico interno: `CHANGELOG_INTERNAL.md`.

## [0.9.23] - 2026-02-27

### Nuevo

- Los administradores pueden eliminar un negocio inactivo de forma permanente, con confirmacion por nombre para evitar errores
- Panel de admin renombrado a "Admin" para mayor claridad

### Mejorado

- El dashboard ahora muestra citas e ingresos del dia juntos en una tarjeta destacada, con ingresos del mes y clientes al lado
- Los precios de servicios en el panel admin se muestran en formato de moneda (₡)

## [0.9.22] - 2026-02-27

### Mejorado

- Los iconos de servicios fueron reemplazados por alternativas mas representativas para barberia (afeitado, combo, diseno, toalla)
- El formulario de nuevo cliente ahora se abre en un modal consistente con el resto de la app
- El contenido de los modales se desplaza correctamente en dispositivos moviles

## [0.9.21] - 2026-02-27

### Mejorado

- Los servicios ahora muestran un icono personalizable que el dueño puede elegir desde la pagina de Servicios
- La logica de iconos de servicios esta unificada para que se vean iguales en el dashboard y en la pagina de reservas

## [0.9.20] - 2026-02-27

### Nuevo

- Seccion de Analiticas reorganizada en 3 pestanas: Negocio, Clientes y Equipo
- Pestana de Clientes en Analiticas muestra segmentos, metricas y acciones rapidas (WhatsApp, ver perfil)
- El check-in ahora acepta citas confirmadas que aun no han iniciado

### Mejorado

- Las estadisticas de citas del dia simplifican "Pendiente" y "Confirmada" en una sola categoria "Agendadas"
- El menu de navegacion movil tiene un diseno mas limpio con iconos estilo iOS
- Mejor organizacion del codigo de segmentos de clientes para reutilizacion

### Corregido

- Limpieza de imports no utilizados en varias paginas del dashboard

## [0.9.19] - 2026-02-26

### Nuevo

- Cambiar contraseña disponible para duenos, barberos y clientes desde sus respectivos paneles
- Indicador de seguridad de contraseña al crear o cambiar tu contraseña
- Al cambiar la contraseña, se cierra la sesion automaticamente y se muestra un aviso al volver a entrar

### Mejorado

- La pagina de recuperar contraseña ahora exige los mismos requisitos de seguridad que el registro
- El encabezado de subpaginas en Configuracion ahora muestra la ruta correcta para volver

### Corregido

- Error intermitente del service worker durante el desarrollo ya no aparece en consola

## [0.9.18] - 2026-02-26

### Nuevo

- Ahora puedes editar el nombre y correo de tus barberos directamente desde su perfil
- Boton de "Reintentar" cuando la pagina de reservas no carga correctamente
- Mejor experiencia de carga con una pantalla de espera animada al abrir reservas

### Mejorado

- Los botones y controles son mas faciles de tocar en pantallas pequenas
- La pagina de reservas se ve mejor cuando se comparte en redes sociales
- Al instalar la app, el icono y la pantalla de inicio se ven mas profesionales
- El enlace para compartir reservas ahora muestra el nombre correcto del negocio
- Los horarios disponibles ahora se calculan correctamente segun la zona horaria del negocio

### Corregido

- El boton de cerrar sesion ahora cierra la sesion correctamente en vez de solo redirigir
- Etiqueta "Revenue" traducida a "Ingresos" en el panel de citas

## [0.9.17] - 2026-02-25

### Nuevo

- Los clientes registrados ven un acceso directo a "Mi Cuenta" al reservar
- Si un cliente ya reservo antes, su nombre y telefono se llenan automaticamente
- Banner que muestra citas programadas en la pagina de reservas

### Mejorado

- Al iniciar sesion, los clientes van directo a "Mi Cuenta" en vez del panel

## [0.9.16] - 2026-02-25

### Corregido

- El registro de nuevas barberias funciona correctamente
- Los enlaces de confirmacion de correo ya no redirigen a una pagina invalida

## [0.9.15] - 2026-02-25

### Nuevo

- Guia de Uso completa dentro de la app con 10 secciones
- Buscador integrado en la guia para encontrar cualquier tema
- Tips contextuales en las paginas principales que enlazan a la guia
- El enlace de Soporte ahora abre WhatsApp directamente

### Corregido

- Los enlaces de Documentacion y Soporte ya no llevan a paginas vacias

## [0.9.14] - 2026-02-25

### Nuevo

- Duracion inteligente por cliente: el sistema aprende cuanto tarda cada cliente y ajusta los horarios
- Indicador visual de tiempo estimado cuando difiere del tiempo base del servicio

### Mejorado

- Los horarios disponibles se calculan con mayor precision usando el historial real
- Los toggles del panel usan el diseño nativo de iOS

## [0.9.13] - 2026-02-25

### Nuevo

- Atencion sin cita (walk-in): crea citas rapidas para clientes que llegan sin reserva
- Selector de metodo de pago al completar cita (efectivo, sinpe, tarjeta)
- Enlace directo a WhatsApp del cliente desde la card de cita
- Boton flotante de reserva en mobile

### Mejorado

- Pagina principal rediseñada: mas limpia y enfocada en conversion
- Paginas de configuracion con mejor diseño y usabilidad
- Cards de citas con indicador visual de metodo de pago

## [0.9.12] - 2026-02-25

### Nuevo

- Modo Enfoque para citas en progreso: pantalla completa con timer y gesto deslizar para completar
- Deteccion de tiempo extra: el timer cambia a amarillo cuando se pasa del estimado

### Mejorado

- Botones de accion en cards de citas mas claros en mobile
- Mi Dia aparece en las tabs principales para owner-barbero

## [0.9.11] - 2026-02-24

### Mejorado

- Boton de reserva se ve correctamente en modo oscuro
- Todas las sub-paginas tienen boton para volver atras
- El onboarding permite saltar la configuracion e ir directo al panel
- Banner de activacion de notificaciones push al inicio

### Corregido

- Las reservas de clientes registrados se vinculan correctamente a su perfil

## [0.9.10] - 2026-02-24

### Mejorado

- La app carga mas rapido al abrir el panel principal
- Las notificaciones solo se consultan cuando la app esta visible, ahorrando datos
- El calendario se actualiza de forma mas inteligente
- Correcciones menores y mejoras de estabilidad

## [0.9.9] - 2026-02-24

### Nuevo

- Notificaciones inteligentes para clientes: recordatorios de re-reserva y mensajes personalizados
- Navbar fijo en la pagina principal con acceso directo a registro

### Mejorado

- "Barberos" renombrado a "Equipo" en toda la plataforma
- Confirmacion de reserva muestra nombre del profesional y precio final
- Tarjetas de servicio mas robustas en movil
- Calendario corregido para zona horaria de Costa Rica

### Corregido

- Varios problemas de navegacion, disponibilidad y datos corregidos
- Textos en espanol estandarizado
- Version dinamica en el menu lateral

## [0.9.8] - 2026-02-24

### Nuevo

- Bloqueos de agenda: marca descansos, vacaciones y tiempo personal
- Permisos por barbero: configura que secciones ve cada barbero
- Exportar CSV de clientes y citas desde el dashboard
- Checklist de bienvenida para barberos nuevos
- Registro de notificaciones enviadas

### Mejorado

- Encabezados del dashboard con estilo consistente
- Graficas adaptadas a movil con tooltips tactiles
- "Email" cambiado a "Correo" en formularios

### Corregido

- Mejoras de seguridad en creacion de cuentas y permisos

---

## [0.9.7] - 2026-02-23

### Nuevo

- Pago anticipado SINPE: los clientes pagan antes y reciben descuento configurable
- Dos formas de enviar comprobante: subir foto o enviar por WhatsApp
- Verificacion de pagos desde el dashboard
- Configuracion completa en Configuracion > Pagos
- Badges de estado de pago en citas del dashboard

### Mejorado

- La confirmacion de reserva invita a pagar por adelantado cuando esta activo
- Limpieza automatica de comprobantes despues de 30 dias

---

## [0.9.6] - 2026-02-23

### Nuevo

- Los clientes pueden cancelar o reagendar citas desde su enlace de seguimiento
- Configuracion de politica de cancelacion en Configuracion > Pagos
- Notificacion automatica al dueno cuando un cliente cancela

### Mejorado

- Botones de cancelar y reagendar visibles cuando la politica esta activa
- Descripciones de metodos de pago mas claras

---

## [0.9.5] - 2026-02-23

### Nuevo

- Horarios inteligentes con descuento: precios reducidos en horas de baja demanda
- Mapa de calor de demanda en Analiticas
- Pagina de configuracion de promociones
- Los horarios con descuento muestran precio original tachado

### Mejorado

- La confirmacion de cita incluye detalle del descuento aplicado

## [0.9.4] - 2026-02-23

### Nuevo

- Duracion inteligente: el sistema aprende cuanto tarda cada servicio por barbero
- Toggle para activar/desactivar duracion inteligente en Configuracion > Avanzado
- Tarjeta de insights de duracion en Analiticas

### Corregido

- Boton de volver en Configuracion ya no recarga la pagina completa
- "Clientes" ya no aparece duplicado en el menu "Mas"
- Las tarjetas de clientes ya no quedan cortadas detras de la barra inferior

## [0.9.3] - 2026-02-10

### Nuevo

- Seguimiento en vivo de citas: el cliente ve su posicion en la fila en tiempo real
- Recordatorios automaticos 24 horas y 1 hora antes de la cita
- Notificacion cuando el barbero termina antes de lo esperado
- Portal de cliente en /mi-cuenta para ver citas y perfil
- Invitacion de barberos por email con roles diferenciados

### Mejorado

- Interfaz simplificada con mejor jerarquia de informacion
- Animaciones mas suaves con soporte para movimiento reducido
- Vista de tabla en desktop y lista en movil para datos
- Configuracion reorganizada en subrutas mas claras
- Email de confirmacion incluye link de seguimiento

### Corregido

- Citas canceladas ya no aparecen en el seguimiento publico
- Recordatorios no se envian duplicados

## [0.9.2] - 2026-02-07

### Mejorado

- La app en iPhone se actualiza sola sin tener que borrar y reinstalar
- Icono de la app mas grande y limpio
- La app chequea actualizaciones cada vez que la abres

### Corregido

- Navegacion en citas mas fluida en iPhone
- Espacio superior ajustado en la pantalla principal

## [0.9.1] - 2026-02-07

### Nuevo

- Sistema de colores rediseñado con mejor legibilidad
- Graficas de analiticas con colores de la marca

### Mejorado

- Mejor visibilidad del texto en modo claro y oscuro
- Numeros grandes se muestran de forma compacta (ej: ₡1.3M)
- Tarjetas de estadisticas se adaptan mejor a pantallas pequenas
- Icono de la app rediseñado con estilo minimalista

### Corregido

- Colores de las graficas se ven correctamente en todos los navegadores

## [0.9.0] - 2026-02-07

### Nuevo

- Rediseño completo de la pantalla principal para uso desde el celular
- 5 paginas del dashboard modernizadas
- Nuevo panel administrativo

### Mejorado

- App mas rapida al cargar datos
- Mayor estabilidad general
- 11 mejoras de experiencia movil
