# P1 Dynamic Duration Scheduling + Remaining Customer Discovery Backlog

## Objetivo

Tener en un solo plan ejecutable TODO lo pendiente de `PLAN_CUSTOMER_DISCOVERY.md` y los gaps operativos detectados despues, sin perder foco en impacto real de negocio.

## Estado consolidado (real)

| Area | Item                                                 | Estado  | Nota                                             |
| ---- | ---------------------------------------------------- | ------- | ------------------------------------------------ |
| F0   | 0A Role guard                                        | Done    | Activo                                           |
| F0   | 0B Gestion de usuarios del dueño                     | Done    | Activo                                           |
| F0   | 0C Permisos granulares avanzados                     | Pending | Aun no implementado                              |
| F1   | 1A Completar + metodo de pago                        | Done    | Activo                                           |
| F1   | 1B Captura de duracion real                          | Partial | Se guarda, falta explotacion fuerte en analytics |
| F1   | 1C Promedios inteligentes (`service_duration_stats`) | Pending | No existe                                        |
| F1   | 1D Scheduling inteligente con duracion predicha      | Pending | Availability sigue base fija                     |
| F1   | 1E Llegá Antes                                       | Done    | Activo                                           |
| F2   | 2A Heatmap de demanda                                | Pending | No endpoint ni UI                                |
| F2   | 2B Horarios promocionales                            | Pending | No tabla/CRUD                                    |
| F2   | 2C Descuentos en booking publico                     | Pending | No pricing por slot                              |
| F3   | Deposito SINPE end-to-end                            | Pending | Falta flujo completo                             |
| F4   | 4A Push notifications                                | Done    | Activo                                           |
| F4   | 4B Emails automáticos                                | Partial | Existe cron, falta orquestacion por evento       |
| F4   | 4C WhatsApp deep links                               | Done    | Activo                                           |
| F4   | Fallback inteligente unificado                       | Partial | Sin orquestador unico con trazabilidad           |
| F5   | 5A Auth cliente                                      | Partial | Base lista                                       |
| F5   | 5B Dashboard cliente                                 | Partial | `/mi-cuenta` v1                                  |
| F5   | 5C Live tracking publico                             | Done    | `/track/[token]` + queue publica                 |
| F5   | 5D Exclusivas in-app                                 | Partial | Falta cierre de estrategia y gating              |
| F5   | 5E Navegacion cliente final                          | Partial | Base lista                                       |

## Gaps adicionales detectados (agregados al plan)

- Cancelar/reagendar desde cliente (self-service).
- Bloqueos de agenda/vacaciones/barbero no disponible.
- Analytics de duracion y tiempo recuperado visibles.
- Funnel booking publico -> crear cuenta cliente.
- CTA de instalacion PWA en confirmaciones.
- Onboarding inicial para barbero invitado.
- `appointment_source` (publico, walk-in, owner, barber).
- Exportaciones CSV basicas (clientes, citas).
- Politica de cancelacion configurable por negocio.
- Tracking publico sin auth ya esta, pero falta robustecer mensajeria y metricas de adopcion.

---

## Prioridad recomendada

1. **P1 (1C + 1D + cierre 1B analytics)**
2. **P5 Core Completion (self-service cliente + conversion)**
3. **P4 Hardening (fallback y delivery confiable)**
4. **P2 Smart demand (heatmap/promos/descuentos)**
5. **P3 Depositos SINPE**
6. **F0C + Operacion (permisos avanzados, source tracking, exports)**

---

## Fase A (P1 urgente): Duracion dinamica + scheduling inteligente

### Alcance

- `Feature 1C` + `Feature 1D`
- Cierre de `1B` en analiticas para demostrar impacto.

### Entregables

- [ ] **A1. Migracion `032_duration_stats.sql`**  
      Verify: tabla `service_duration_stats` + indices por `(business_id, barber_id, client_id, service_id)`.

- [ ] **A2. Update de schema de appointments**  
      Verify: `scheduled_duration_minutes` persistida en cada cita nueva.

- [ ] **A3. RPC/funcion de agregacion en complete**  
      Verify: actualiza stats; ignora outliers extremos (`actual > 3x avg` o piso configurable).

- [ ] **A4. Predictor por cascada**  
      Verify: `barbero+cliente+servicio -> barbero+servicio -> servicio -> default`.

- [ ] **A5. Integracion en availability** (`/api/public/[slug]/availability/route.ts`)  
      Verify: slots/conflictos calculados con duracion predicha.

- [ ] **A6. Integracion en booking** (`/api/public/[slug]/book/route.ts`)  
      Verify: cita persiste la duracion estimada usada.

- [ ] **A7. Analytics operativa**  
      Verify: dashboard muestra `actual_vs_scheduled`, `recovered_idle_minutes`, `prediction_error_minutes`.

- [ ] **A8. Feature flag por negocio**  
      Verify: `smart_duration_enabled` con rollback inmediato a duracion fija.

- [ ] **A9. Test suite**  
      Verify: casos de fallback, outliers, same-day, colisiones de agenda.

### Done when

- [ ] Duracion inteligente activa en agendado y disponibilidad.
- [ ] Se puede demostrar recuperacion real de tiempo.
- [ ] Rollback por flag validado.

---

## Fase B (P5 core): Cerrar experiencia cliente que falta

- [ ] **B1. Cancelar/reagendar desde cliente**  
      Verify: flujo completo con reglas de negocio y auditoria.

- [ ] **B2. Politica de cancelacion configurable**  
      Verify: owner define ventana minima (ej. 2h) y excepciones.

- [ ] **B3. Booking publico -> crear cuenta cliente**  
      Verify: CTA post-booking y en email de confirmacion.

- [ ] **B4. CTA de instalacion PWA cliente**  
      Verify: visible en confirmacion + reminder email.

- [ ] **B5. Onboarding de barbero invitado**  
      Verify: primer login guiado con checklist corto.

- [ ] **B6. Completar 5D exclusivas in-app**  
      Verify: al menos 2 beneficios bloqueados para usuarios con app/cuenta.

---

## Fase C (P4 hardening): Notificaciones confiables end-to-end

- [ ] **C1. Orquestador unico de notificaciones por evento**  
      Verify: estrategia `push -> email -> whatsapp` centralizada.

- [ ] **C2. Dedup + retries por canal**  
      Verify: idempotencia por evento/cita/cliente.

- [ ] **C3. Trazabilidad minima de delivery**  
      Verify: log por canal (sent/failed/retry) para debugging operativo.

- [ ] **C4. Reminders 24h/1h con reglas claras**  
      Verify: no duplicados y cobertura de citas same-day.

---

## Fase D (P2): Smart demand y pricing por demanda

- [ ] **D1. `GET /api/analytics/demand-heatmap`**
- [ ] **D2. Tabla `promotional_slots` + CRUD owner**
- [ ] **D3. Aplicar descuentos por slot en booking publico**
- [ ] **D4. Mostrar impacto en conversion/ocupacion**

Done when:

- [ ] Owner puede activar promos por franja.
- [ ] Cliente ve precio ajustado y transparente.

---

## Fase E (P3): Deposito SINPE completo

- [ ] **E1. Migracion de campos deposito en appointments/businesses**
- [ ] **E2. Config owner (activar, porcentaje, datos SINPE)**
- [ ] **E3. Booking con paso de deposito y comprobante**
- [ ] **E4. Verificacion en dashboard (`pending/submitted/verified/rejected/refunded`)**
- [ ] **E5. Reglas de cita segun estado de deposito**

---

## Fase F (Operacion + gobierno del producto)

- [ ] **F1. 0C permisos granulares por barbero**
- [ ] **F2. Bloqueos de agenda/vacaciones**
- [ ] **F3. `appointment_source` tracking**
- [ ] **F4. Export CSV basico (clientes/citas)**

---

## Dependencias de datos (migraciones esperadas)

- `032_duration_stats.sql` (P1)
- `033_smart_duration_flags.sql` (P1)
- `034_client_self_service.sql` (P5)
- `035_notification_orchestrator.sql` (P4)
- `036_promotional_slots.sql` (P2)
- `037_sinpe_deposits.sql` (P3)
- `038_operations_controls.sql` (F0C + bloqueos + source + exports)

---

## Criterios de no-regresion

- [ ] No romper flujo actual owner/barbero/cliente.
- [ ] Mantener design system (sin estilos one-off).
- [ ] Mantener performance percibida en mobile y desktop.
- [ ] Verificacion manual y E2E en rutas core antes de cerrar cada fase.

---

## Plan de ejecucion sugerido (pragmatico)

1. **Sprint 1:** Fase A completa (P1).
2. **Sprint 2:** Fase B (self-service + conversion app).
3. **Sprint 3:** Fase C (orquestacion notificaciones).
4. **Sprint 4:** Fase D + E (promos + depositos).
5. **Sprint 5:** Fase F (operacion y gobierno).
