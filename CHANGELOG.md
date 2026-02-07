# Changelog

Todas las versiones del proyecto, documentadas en formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [0.9.2] - 2026-02-07

### Corregido

- La PWA en iPhone ahora se actualiza sola sin tener que borrar y reinstalar la app
- Removido pull-to-refresh de la pagina de citas (causaba conflictos con el scroll nativo de iOS)
- Header del dashboard ya no tiene padding doble en la parte superior

### Mejorado

- El icono de la app ahora es mas grande y limpio (barber pole con forma de pastilla)
- La app chequea actualizaciones cada vez que la abres (antes solo cada hora)

## [0.9.1] - 2026-02-07

### Nuevo

- Sistema de colores rediseñado con mejor legibilidad en todo el app
- Graficas de analiticas rediseñadas con colores de la marca
- Notificaciones de deploy automaticas a Discord

### Mejorado

- Mejor visibilidad del texto en modo claro y oscuro
- Numeros grandes en el dashboard ahora se muestran de forma compacta (ej: ₡1.3M)
- Tarjetas de estadisticas se adaptan mejor a pantallas pequeñas
- Icono de la PWA rediseñado con estilo minimalista (barber pole monocromatico)

### Corregido

- Los colores de las graficas ahora se ven correctamente en todos los navegadores

## [0.9.0] - 2026-02-07

### Nuevo

- Rediseño completo del dashboard con enfoque mobile-first
- Sistema de diseño unificado (tokens, motion, tipografia)
- 5 paginas del dashboard modernizadas (Citas, Barberos, Clientes, Servicios, Analiticas)
- Panel de Super Admin con 6 paginas y 11 rutas API
- Soporte PWA completo con pagina offline y branding personalizable

### Mejorado

- Performance: 7 indices de base de datos, queries N+1 corregidos (7-10x mas rapido)
- Seguridad: RBAC, proteccion IDOR, rate limiting
- Observabilidad: logging con Pino, Sentry, Redis rate limiting
- 11 correcciones criticas de UX movil basadas en Apple HIG
- Optimizacion de egress de Supabase (migracion a nuevo proyecto)
