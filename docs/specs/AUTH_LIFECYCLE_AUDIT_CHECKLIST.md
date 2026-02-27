# Auth Lifecycle Audit Checklist

## Nombre de la auditoría

- `Auth Lifecycle Audit`
- Alternativo: `Account Recovery & Credential Management Audit`

## Objetivo

Validar que cualquier usuario autenticado pueda autogestionar credenciales de forma segura y consistente, y que usuarios no autenticados no puedan acceder a rutas sensibles.

## Alcance (este repo)

- Login (`/login`)
- Logout (sidebar, drawer, perfil cliente)
- Forgot password (`/forgot-password`)
- Reset password (`/reset-password`)
- Change password (self-service):
  - Owner: `/configuracion/avanzado/cambiar-contrasena`
  - Barber: `/mi-dia/cuenta`
  - Client: `/mi-cuenta/perfil/cambiar-contrasena`

## Invariantes de seguridad (deben cumplirse siempre)

1. Rutas de cambio de contraseña requieren sesión activa.
2. Flujo de cambio de contraseña exige:

- contraseña actual
- nueva contraseña fuerte
- confirmación igual

3. Política fuerte es única en register/reset/change:

- mínimo 8
- minúscula
- mayúscula
- número

4. El email usado para re-auth es `Supabase Auth user.email`, no email de perfil.
5. Tras cambio exitoso:

- se cierra sesión
- redirect duro a `/login?passwordUpdated=1`

6. Mensajes de error no filtran detalles sensibles.
7. Existe fallback usable cuando no hay `userAuthEmail` (link a `/forgot-password`).

## Matriz de auditoría (rol x flujo)

| Flujo                                    | Owner                                           | Barber                      | Client                                    | No autenticado         |
| ---------------------------------------- | ----------------------------------------------- | --------------------------- | ----------------------------------------- | ---------------------- |
| Ver formulario de cambio                 | ✅ `/configuracion/avanzado/cambiar-contrasena` | ✅ `/mi-dia/cuenta`         | ✅ `/mi-cuenta/perfil/cambiar-contrasena` | ❌ redirect a `/login` |
| Validación contraseña débil              | ✅                                              | ✅                          | ✅                                        | N/A                    |
| Validación confirm mismatch              | ✅                                              | ✅                          | ✅                                        | N/A                    |
| Re-auth con contraseña actual incorrecta | ✅ error controlado                             | ✅ error controlado         | ✅ error controlado                       | N/A                    |
| Éxito cambio contraseña                  | ✅ signOut + redirect login                     | ✅ signOut + redirect login | ✅ signOut + redirect login               | N/A                    |

## Modo de ejecución recomendado

1. Smoke rápido:

- `npx playwright test tests/e2e/auth-lifecycle-audit.spec.ts --project=chromium`

2. Matriz móvil:

- `npm run test:mobile:tier1 -- tests/e2e/auth-lifecycle-audit.spec.ts`

3. Full CI:

- incluir el spec en suite estándar E2E.

## Variables de entorno opcionales para casos por rol

- `E2E_OWNER_EMAIL`, `E2E_OWNER_PASSWORD`
- `E2E_BARBER_EMAIL`, `E2E_BARBER_PASSWORD`
- `E2E_CLIENT_EMAIL`, `E2E_CLIENT_PASSWORD`

Sin estas variables, el spec sigue auditando flujos públicos y protecciones de rutas; los tests por rol se marcan como `skip`.

## Señales de fallo típicas (detección temprana)

1. Redirect loop entre login y rutas protegidas.
2. Ruta visible pero formulario no renderiza por falta de `userAuthEmail`.
3. Política inconsistente entre reset y change.
4. Error de re-auth mapeado incorrectamente (todo aparece como credenciales inválidas).
5. Soft redirect después de signOut que rebota a dashboard por race de cookies.

## Evidencia mínima esperada en cada release

1. Resultado de `auth-lifecycle-audit.spec.ts` adjunto en PR.
2. Captura de URL final post-cambio (`/login?passwordUpdated=1`).
3. Confirmación de que banner en login aparece y se oculta al primer input.
