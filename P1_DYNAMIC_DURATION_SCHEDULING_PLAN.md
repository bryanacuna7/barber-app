# P1 Dynamic Duration + Smart Scheduling (1C + 1D)

## Goal

Implementar duracion predictiva por contexto real (barbero/cliente/servicio) y usarla en disponibilidad para reducir tiempo muerto sin romper la agenda actual.

## Scope

- Incluye: `Feature 1C` + `Feature 1D` del `PLAN_CUSTOMER_DISCOVERY.md`.
- No incluye: Heatmap/promociones (Feature 2), cambios de pricing, rediseños UI grandes.

## Tasks

- [ ] Task 1: Crear migracion `032_duration_stats.sql`  
      Verify: existe tabla `service_duration_stats` + indices + comentarios en DB.

- [ ] Task 2: Definir funcion SQL/RPC de upsert de estadisticas al completar cita  
      Verify: al completar una cita, se actualiza contador/promedio y se ignoran outliers (actual > 3x promedio).

- [ ] Task 3: Extender modelo para guardar duracion usada al agendar  
      Verify: nueva cita persiste `scheduled_duration_minutes` (o campo equivalente) ademas de `duration_minutes`.

- [ ] Task 4: Implementar predictor de duracion con cascada de prioridad  
      Verify: retorna duracion para estos niveles:
  1. barbero+cliente+servicio
  2. barbero+servicio
  3. servicio global
  4. fallback duracion base del servicio.

- [ ] Task 5: Integrar predictor en `/api/public/[slug]/availability/route.ts`  
      Verify: los slots calculan conflicto usando duracion predicha y mantienen reglas de buffer existentes.

- [ ] Task 6: Integrar predictor en flujo de creacion de cita publica  
      Verify: booking usa la duracion predicha para la cita nueva y no rompe validaciones actuales.

- [ ] Task 7: Exponer metrica minima de precision y ahorro  
      Verify: calculables en backend:
  - `prediction_error_minutes` (real vs predicha)
  - `recovered_idle_minutes` (planificada vs real).

- [ ] Task 8: Tests de regresion y edge cases  
      Verify: cubre al menos:
  - cita same-day sin historial
  - historial con outliers
  - sin datos (fallback)
  - conflictos de solape con duraciones distintas.

- [ ] Task 9: Rollout seguro  
      Verify: feature flag `smart_duration_enabled` (business-level) con fallback inmediato a duracion fija.

## Data Model (propuesta minima)

- `service_duration_stats`
  - `business_id`
  - `barber_id` (nullable para agregado)
  - `client_id` (nullable para agregado)
  - `service_id`
  - `samples_count`
  - `avg_duration_minutes`
  - `p50_duration_minutes` (opcional)
  - `updated_at`

## Prediction Rules

- Minimo de muestras sugerido:
  - nivel 1: >= 3
  - nivel 2: >= 5
  - nivel 3: >= 10
- Clamp de salida:
  - min 10 min
  - max 180 min
- Outlier filter:
  - ignorar muestra si `actual_duration_minutes > avg_duration_minutes * 3`

## Risks

- Riesgo: sobreajuste por pocos datos.  
  Mitigacion: umbrales minimos + fallback jerarquico.
- Riesgo: conflicto de slots por drift de duracion.  
  Mitigacion: mantener buffer actual + clamp + tests de solape.
- Riesgo: regresion operativa.  
  Mitigacion: feature flag por negocio + rollback a duracion fija.

## Done When

- [ ] Migracion aplicada y verificada en Supabase.
- [ ] Availability usa duracion predictiva con fallback robusto.
- [ ] Booking persiste duracion usada para auditoria.
- [ ] Completado actualiza estadisticas automaticamente.
- [ ] Tests clave pasando y sin regresiones de agenda.
- [ ] Flag de activacion disponible por negocio.
