# Release Notes

<!--
  Este archivo contiene las notas de la ULTIMA version.
  Se envia automaticamente a Discord cuando se hace push a main.

  Escribir en lenguaje de usuario final, NO tecnico.
  Mantener solo la version actual (reemplazar en cada release).
-->

## v0.9.14

### Duracion inteligente por cliente

- El sistema aprende cuanto tarda cada cliente y ajusta los horarios automaticamente
- Un cliente rapido ve intervalos de 20 min, uno detallista ve intervalos de 45 min
- Se muestra el tiempo estimado con ~ cuando difiere del tiempo base (ej: ~40 min)
- La prediccion mejora con cada cita completada

### Horarios mas precisos

- Nuevo algoritmo que genera horarios basados en los huecos reales de la agenda
- Mejor aprovechamiento del tiempo disponible entre citas existentes
- Auto-refresco solo cuando es relevante para ahorrar datos

### Mejoras visuales

- Toggles del panel con diseño nativo iOS (verde Apple)
