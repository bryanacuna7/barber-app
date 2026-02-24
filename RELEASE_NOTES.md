# Release Notes

<!--
  Este archivo contiene las notas de la ULTIMA version.
  Se envia automaticamente a Discord cuando se hace push a main.

  Escribir en lenguaje de usuario final, NO tecnico.
  Mantener solo la version actual (reemplazar en cada release).
-->

## v0.9.8

### Nuevo

- Bloqueos de agenda: marca descansos, vacaciones o tiempo personal y esos horarios desaparecen automaticamente de la pagina de reservas
- Permisos por barbero: configura que secciones del dashboard puede ver cada barbero de forma individual
- Exportar CSV: descarga tu lista de clientes o historial de citas en un archivo para Excel
- Checklist de bienvenida para barberos nuevos: foto de perfil, horario y notificaciones push en 3 pasos faciles
- Historial de notificaciones: ve que notificaciones se enviaron, a quien y si llegaron correctamente

### Mejoras

- Encabezados del dashboard con estilo unificado en todas las paginas
- Las graficas se ven mejor en celular: mas compactas y con tooltips que se pueden tocar
- Formularios ahora dicen "Correo" en vez de "Email" para mantener todo en espanol
- Las tarjetas del programa de lealtad se ven mas limpias (sin bordes duplicados)

### Seguridad

- Corregido un problema de seguridad importante en la creacion de cuentas de clientes
- Las notificaciones ahora pasan por un sistema central que evita envios duplicados
- Los barberos no pueden darse permisos de administrador a si mismos
