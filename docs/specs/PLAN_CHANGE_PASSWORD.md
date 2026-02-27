# Plan de Implementación: Cambio de Contraseña para Dueño, Barbero y Cliente

## Resumen

Implementar cambio de contraseña con verificación de contraseña actual para los 3 roles, respetando su contexto de navegación actual:

- **Dueño**: desde configuración avanzada.
- **Barbero**: desde una pantalla de cuenta dentro de Mi Día.
- **Cliente**: desde Mi Perfil en mi-cuenta.
- **Seguridad**: pedir contraseña actual + nueva + confirmación, política fuerte unificada.
- **Post-cambio**: cerrar sesión actual y redirigir a login (hard redirect).

## Estado actual validado en el repo

| Claim                                               | Verificado | Notas                                                                                            |
| --------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------ |
| `configuracion` es owner-only                       | ✅         | `OWNER_ONLY_PATHS` en `src/lib/auth/roles.ts:64-71`                                              |
| Cliente tiene flujo separado en `mi-cuenta/perfil`  | ✅         | `src/app/(client)/mi-cuenta/perfil/page.tsx`                                                     |
| Reset password usa validación inconsistente (min 6) | ✅         | `src/app/(auth)/reset-password/page.tsx:88` vs `registerSchema` (min 8 + mayús + minús + número) |
| Avanzado tiene sección "Sesión"                     | ✅         | `src/app/(dashboard)/configuracion/avanzado/page.tsx:124-140`                                    |
| More-menu-drawer es entry point de barbero          | ✅         | `src/components/dashboard/more-menu-drawer.tsx`                                                  |
| `/mi-dia/*` permitido para barberos                 | ✅         | `src/lib/auth/roles.ts:144-147`                                                                  |
| Login usa `useSearchParams` dentro de `Suspense`    | ✅         | `src/app/(auth)/login/page.tsx:22-23`                                                            |

---

## Implementación detallada

### 1. Unificar política y lógica de validación de contraseña

**Archivo:** `src/lib/validations/auth.ts`

Extender con `changePasswordSchema` y extraer la política de password a un schema reutilizable:

```ts
// Política de contraseña fuerte (reutilizable)
const strongPasswordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/\d/, 'Debe contener al menos un número')

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'La nueva contraseña debe ser diferente a la actual',
    path: ['newPassword'],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
```

**Acción obligatoria (mismo PR):** Actualizar `reset-password/page.tsx` línea 88 para usar `strongPasswordSchema` en lugar de `password.length < 6`. Sin esto, el objetivo de "política fuerte unificada" queda roto — un usuario podría setear una contraseña débil vía reset y luego no poder cambiarla vía change-password porque no cumple política. Cambios concretos en reset-password:

- Reemplazar `if (password.length < 6)` por validación con `strongPasswordSchema.safeParse(password)`.
- Actualizar placeholder de "Mínimo 6 caracteres" a "Mínimo 8 caracteres".
- Agregar `PasswordStrength` meter al campo de nueva contraseña.

**Exports nuevos:** `changePasswordSchema`, `ChangePasswordInput`, `strongPasswordSchema`

---

### 2. Crear componente reutilizable de cambio de contraseña

**Nuevo directorio:** `src/components/auth/` (no existe, hay que crearlo)

**Nuevo archivo:** `src/components/auth/change-password-form.tsx`

#### Props del componente

```ts
interface ChangePasswordFormProps {
  /** Auth email for re-authentication. Obtained from context or getUser(). */
  userAuthEmail: string
}
```

> **Nota importante sobre el email:** El componente recibe `userAuthEmail` como prop. Este es el email de **Supabase Auth** (`user.email`), no el email de la tabla `clients` (que puede ser diferente). Cada página padre es responsable de obtener y pasar este valor.

#### Flujo interno del submit

1. Validar formulario con `changePasswordSchema` (client-side).
2. Re-autenticar: `supabase.auth.signInWithPassword({ email: userAuthEmail, password: currentPassword })`.
3. Si falla → clasificar error con estrategia **best-effort + fallback genérico**:
   - Intentar match por `error.message` o `error.status`:
     - Status 400 + mensaje contiene "invalid" o "credentials" → "Contraseña actual incorrecta"
     - Status 429 → "Demasiados intentos. Espera unos minutos."
   - **Fallback (cualquier otro error):** "Error al verificar credenciales. Intenta de nuevo."
   - **Nota:** No depender de `error.code` exacto (`invalid_credentials`, etc.) porque varía entre versiones del SDK de Supabase y endpoints. La estrategia es: match conocido cuando se pueda, fallback genérico robusto siempre.
4. Si pasa → `supabase.auth.updateUser({ password: newPassword })`.
5. Si `updateUser` falla → clasificar igual con best-effort:
   - Mensaje contiene "same" o "identical" → "La contraseña nueva debe ser diferente a la actual"
   - **Fallback:** "No pudimos actualizar la contraseña. Intenta de nuevo."
6. Si pasa → `supabase.auth.signOut()`.
7. **Hard redirect:** `window.location.href = '/login?passwordUpdated=1'`
   - **CRÍTICO:** Usar `window.location.href`, NO `router.push()`. El codebase usa hard redirect en todos los signOut para evitar race condition con el middleware (cookies no se limpian antes de soft navigation). Ver comentario en `more-menu-drawer.tsx:341-343`.

#### UI del componente

- Campos: contraseña actual, nueva, confirmar (con toggle de visibilidad).
- Errores inline por campo (Zod) + error general (API).
- Estado loading en botón submit.
- Link secundario a `/forgot-password` ("¿Olvidaste tu contraseña actual?").
- `PasswordStrength` meter existente (`src/components/ui/password-strength.tsx`) en campo nueva contraseña.

#### Data-testid estables para E2E

| Element                 | data-testid               |
| ----------------------- | ------------------------- |
| Campo contraseña actual | `change-password-current` |
| Campo nueva contraseña  | `change-password-new`     |
| Campo confirmar         | `change-password-confirm` |
| Botón submit            | `change-password-submit`  |
| Error general           | `change-password-error`   |

> **Nota:** No se incluye `data-testid="change-password-success"` porque tras éxito se hace hard redirect inmediato a `/login?passwordUpdated=1`. Un banner de éxito en la misma página no llegaría a renderizarse de forma confiable. El feedback de éxito se verifica en el **login page** (banner `passwordUpdated`).

---

### 3. Dueño: entrada en Configuración Avanzada

**Archivos a modificar:**

#### 3a. `src/components/settings/settings-subroute-header.tsx` — agregar prop `backHref`

El componente actualmente tiene `href="/configuracion"` hardcoded (línea 19). La subruta del dueño está en `/configuracion/avanzado/cambiar-contrasena`, así que el back link debería ir a `/configuracion/avanzado`, no a `/configuracion`.

```ts
interface SettingsSubrouteHeaderProps {
  title: string
  subtitle?: string
  hideSubtitleOnDesktop?: boolean
  backHref?: string // NEW — default: '/configuracion'
  backLabel?: string // NEW — default: 'Configuración'
}
```

Cambio mínimo: hacer que `href` y texto del Link usen las props con fallback a los valores actuales.

#### 3b. `src/app/(dashboard)/configuracion/avanzado/page.tsx` — agregar CTA en sección "Sesión"

En la Card "Sesión" (líneas 124-140), agregar un botón "Cambiar contraseña" **antes** del botón de cerrar sesión:

```tsx
<CardContent className="space-y-3">
  <Button
    type="button"
    variant="outline"
    className="w-full justify-between"
    onClick={() => router.push('/configuracion/avanzado/cambiar-contrasena')}
  >
    <span>Cambiar contraseña</span>
    <ArrowRight className="h-4 w-4" />
  </Button>
  <Button type="button" variant="outline" className="w-full" onClick={handleLogout}>
    Cerrar sesión
  </Button>
</CardContent>
```

**Nota:** También corregir el logout en este archivo — actualmente usa `router.push('/login')` (línea 22-24), debería usar `window.location.href = '/login'` para consistencia con el patrón del codebase.

#### 3c. Nueva ruta: `src/app/(dashboard)/configuracion/avanzado/cambiar-contrasena/page.tsx`

> Esta página debe ser Client Component (`'use client'`) porque usa hooks cliente (`useBusiness`, `useRouter`) y renderiza `ChangePasswordForm`.

- Usar `SettingsSubrouteHeader` con `backHref="/configuracion/avanzado"` y `backLabel="Avanzado"`.
- Obtener `userAuthEmail` desde `useBusiness()` → `userEmail` (disponible en `BusinessContext`).
- Renderizar `<ChangePasswordForm userAuthEmail={userEmail} />`.
- Si `userEmail` no está disponible, mostrar fallback: "Usa recuperación por correo" con link a `/forgot-password`.

---

### 4. Barbero: ruta de cuenta dentro de Mi Día

#### 4a. `src/components/dashboard/more-menu-drawer.tsx` — agregar item para barbero

Agregar al array `menuItems` (después de "Guía de Uso", línea ~157):

```ts
{
  name: 'Cuenta y seguridad',
  href: '/mi-dia/cuenta',
  icon: Shield,          // ya importado (línea 19)
  description: 'Cambiar contraseña',
  color: 'text-teal-600 dark:text-teal-400',
  bgColor: 'bg-teal-100 dark:bg-teal-900/30',
  barberMenuOnly: true,  // CRÍTICO: solo visible para barberos en "Más"
}
```

> **Flag `barberMenuOnly: true`** es obligatorio. Sin este flag, el item aparecería en el menú del dueño también. La lógica de filtrado está en líneas 302-329: para owners filtra `!item.barberMenuOnly`, para barbers los incluye siempre (excepto `ownerOnly`).

#### 4b. Nueva ruta: `src/app/(dashboard)/mi-dia/cuenta/page.tsx`

> Esta página debe ser Client Component (`'use client'`) porque usa hooks cliente (`useBusiness`, `useRouter`) y renderiza `ChangePasswordForm`.

- Header propio con botón back a `/mi-dia` (no usar `SettingsSubrouteHeader` que apunta a `/configuracion`).
- Obtener `userAuthEmail` desde `useBusiness()` → `userEmail`.
- Renderizar `<ChangePasswordForm userAuthEmail={userEmail} />`.
- No tocar `canBarberAccessPath` — `/mi-dia/*` ya está permitido.

#### Decisión: Acceso de owner a `/mi-dia/cuenta` por URL directa

**Decisión: permitir sin bloquear.** `/mi-dia/*` está abierto para todos los roles en el dashboard layout. Si un owner navega manualmente a `/mi-dia/cuenta`, verá el formulario de cambio de contraseña — que funciona igual para cualquier rol (usa `userEmail` de `BusinessContext`). No hay riesgo de seguridad ni UX rota. Bloquear requeriría un guard de rol en la página que agrega complejidad sin beneficio. El item de menú ya está limitado a barberos vía `barberMenuOnly: true`, que es suficiente para la experiencia normal.

---

### 5. Cliente: acceso desde Mi Perfil

#### 5a. `src/contexts/client-context.tsx` — exponer `userAuthEmail`

Agregar `userAuthEmail` al contexto del cliente:

```ts
interface ClientContextValue {
  // ... existing fields
  userAuthEmail: string | null // NEW — from Supabase Auth user.email
}
```

> **Distinción crítica:** `clientEmail` viene de la tabla `clients` (email del perfil del cliente). `userAuthEmail` viene de `user.email` de Supabase Auth. Pueden ser diferentes. Para re-autenticación necesitamos el auth email.

#### 5b. `src/app/(client)/layout.tsx` — pasar `user.email` al provider

El layout ya tiene `user` de `supabase.auth.getUser()` (línea 14). Solo agregar:

```tsx
<ClientProvider
  userId={user.id}
  userAuthEmail={user.email ?? null}  // NEW
  clients={clients}
  businesses={businesses}
>
```

Y actualizar `ClientProviderProps` para aceptar `userAuthEmail: string | null`.

#### 5c. `src/app/(client)/mi-cuenta/perfil/page.tsx` — agregar sección "Seguridad"

Después de la sección "Notificaciones" (línea ~279) y antes de "Mis Negocios", agregar:

```tsx
{
  /* Seguridad */
}
;<section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 mb-6">
  <h2 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
    <Shield className="h-5 w-5" />
    Seguridad
  </h2>
  <Button
    variant="outline"
    className="w-full h-11 justify-between"
    onClick={() => router.push('/mi-cuenta/perfil/cambiar-contrasena')}
  >
    <span>Cambiar contraseña</span>
    <ChevronRight className="h-4 w-4" />
  </Button>
</section>
```

Importar `Shield` de lucide-react (agregar al import existente en línea 12-22).

#### 5d. Nueva ruta: `src/app/(client)/mi-cuenta/perfil/cambiar-contrasena/page.tsx`

> Esta página debe ser Client Component (`'use client'`) porque usa hooks cliente (`useClientContext`, `useRouter`) y renderiza `ChangePasswordForm`.

- Header con botón back a `/mi-cuenta/perfil` (patrón igual al que usa perfil: botón `ChevronLeft` + título). **No existe** componente compartido para headers de subrutas de cliente, así que implementar inline siguiendo el mismo patrón de `perfil/page.tsx` líneas 148-160.
- Obtener `userAuthEmail` desde `useClientContext()`.
- Si `userAuthEmail` es null → mostrar fallback con link a `/forgot-password`.
- Renderizar `<ChangePasswordForm userAuthEmail={userAuthEmail} />`.

---

### 6. Feedback post-cambio en login

**Archivo:** `src/app/(auth)/login/page.tsx`

En `LoginForm` (que ya usa `useSearchParams` dentro de `Suspense`):

1. Estado y lectura del param:

   ```ts
   const passwordUpdated = searchParams.get('passwordUpdated')
   const [showPwBanner, setShowPwBanner] = useState(Boolean(passwordUpdated))
   ```

2. Mostrar banner no-intrusivo **encima** del formulario, **antes** del error (usa estado local, no el param directo):

   ```tsx
   {
     showPwBanner && (
       <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
         Contraseña actualizada. Inicia sesión nuevamente.
       </div>
     )
   }
   ```

3. Limpieza de URL una sola vez (sin navegación visible):

   ```ts
   useEffect(() => {
     if (passwordUpdated) {
       window.history.replaceState({}, '', '/login')
     }
   }, [passwordUpdated])
   ```

4. Dismiss al primer input en email o password:
   ```ts
   // En onChange de email y password:
   setShowPwBanner(false)
   ```

   - **No usar `router.replace`** — causa churn de navegación innecesario mientras el usuario escribe.

---

## Archivos nuevos (5)

| Archivo                                                                  | Descripción              |
| ------------------------------------------------------------------------ | ------------------------ |
| `src/components/auth/change-password-form.tsx`                           | Componente reutilizable  |
| `src/app/(dashboard)/configuracion/avanzado/cambiar-contrasena/page.tsx` | Página dueño             |
| `src/app/(dashboard)/mi-dia/cuenta/page.tsx`                             | Página barbero           |
| `src/app/(client)/mi-cuenta/perfil/cambiar-contrasena/page.tsx`          | Página cliente           |
| `src/components/auth/index.ts`                                           | Barrel export (opcional) |

## Archivos a modificar (9)

| Archivo                                                | Cambio                                                                                         |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `src/lib/validations/auth.ts`                          | Agregar `changePasswordSchema`, extraer `strongPasswordSchema`                                 |
| `src/app/(auth)/reset-password/page.tsx`               | Migrar validación de `length < 6` a `strongPasswordSchema` + agregar PasswordStrength meter    |
| `src/components/settings/settings-subroute-header.tsx` | Agregar props `backHref` y `backLabel` con defaults                                            |
| `src/app/(dashboard)/configuracion/avanzado/page.tsx`  | CTA "Cambiar contraseña" en sección Sesión + fix logout a hard redirect                        |
| `src/components/dashboard/more-menu-drawer.tsx`        | Agregar item "Cuenta y seguridad" con `barberMenuOnly: true`                                   |
| `src/contexts/client-context.tsx`                      | Agregar `userAuthEmail` al contexto                                                            |
| `src/app/(client)/layout.tsx`                          | Pasar `user.email` como `userAuthEmail` al `ClientProvider`                                    |
| `src/app/(client)/mi-cuenta/perfil/page.tsx`           | Agregar sección "Seguridad" con CTA                                                            |
| `src/app/(auth)/login/page.tsx`                        | Leer `passwordUpdated` param, banner con estado local, limpieza URL con `history.replaceState` |

---

## Casos de error y comportamiento esperado

| Caso                              | Comportamiento                                                                                           |
| --------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Contraseña actual incorrecta      | Best-effort: status 400 + "invalid"/"credentials" → "Contraseña actual incorrecta". No intentar update.  |
| Nueva contraseña débil            | Bloquear submit con mensajes de política por campo (Zod).                                                |
| Nueva y confirmación no coinciden | Bloquear submit: "Las contraseñas no coinciden".                                                         |
| Nueva igual a actual (client)     | Bloquear submit: "La nueva contraseña debe ser diferente a la actual".                                   |
| Nueva igual a actual (Supabase)   | Best-effort: mensaje contiene "same"/"identical" → "La contraseña nueva debe ser diferente a la actual". |
| Rate limiting                     | Best-effort: status 429 → "Demasiados intentos. Espera unos minutos."                                    |
| `userAuthEmail` no disponible     | Mostrar fallback: "Usa recuperación por correo" con link a `/forgot-password`.                           |
| Error no clasificado (signIn)     | **Fallback genérico:** "Error al verificar credenciales. Intenta de nuevo."                              |
| Error no clasificado (updateUser) | **Fallback genérico:** "No pudimos actualizar la contraseña. Intenta de nuevo."                          |
| Éxito                             | **Siempre** cerrar sesión + hard redirect a `/login?passwordUpdated=1`.                                  |

> **Estrategia de errores:** Best-effort matching por `status` y `message` con fallback genérico robusto. No depender de `error.code` exacto porque varía entre versiones del SDK de Supabase.

---

## Plan de pruebas

### Unit tests de validación (`src/lib/validations/__tests__/auth.test.ts`)

- Acepta contraseña fuerte válida (min 8 + minúscula + mayúscula + número).
- Rechaza sin mayúscula / sin minúscula / sin número / menos de 8 chars.
- Rechaza mismatch de confirmación.
- Rechaza nueva igual a actual.
- Acepta `currentPassword` de cualquier largo (no aplica política fuerte a la actual).

### E2E navegación por rol

- Dueño ve CTA "Cambiar contraseña" en configuración avanzada → sección Sesión.
- Barbero ve "Cuenta y seguridad" en menú "Más" → `barberMenuOnly` confirma que NO aparece para owner.
- Cliente ve CTA en perfil → sección "Seguridad".
- Cada CTA navega a su subruta respectiva.

### E2E formulario

- Errores de validación client-side (mismatch, débil, igual a actual).
- Contraseña actual incorrecta muestra error sin intentar update.
- Flujo feliz con mocks/stubs de Supabase auth si CI no permite cambio real.
- Post-cambio: verificar que la URL final es `/login?passwordUpdated=1` (no depender de banner en página de change-password — el redirect es inmediato).
- En login: verificar banner "Contraseña actualizada" visible.
- Banner desaparece al escribir en email o password.

### Regresión auth

- Forgot/reset/login siguen operando normalmente.
- Redirect por rol sigue igual (`/dashboard` vs `/mi-cuenta`).
- Logout desde more-menu-drawer y perfil cliente siguen funcionando.

---

## Supuestos y defaults explícitos

- Solo se cubre autenticación por email+password para esta feature.
- "Cerrar todas sesiones" no se implementa; se cierra sesión actual (decisión tomada).
- No se agregan migraciones DB ni cambios RLS.
- No se abre `configuracion` completa para barberos; se mantiene separación por contexto.
- Se reutiliza UI existente de cards/forms para consistencia visual.
- `PasswordStrength` meter existente se reutiliza en el campo de nueva contraseña.

---

## Orden de implementación sugerido

1. **Validación** — `changePasswordSchema` + `strongPasswordSchema` en `auth.ts` (base para todo lo demás)
2. **Reset-password unificación** — Migrar `reset-password/page.tsx` a `strongPasswordSchema` + PasswordStrength meter
3. **Componente** — `ChangePasswordForm` en `src/components/auth/`
4. **Header fix** — `backHref`/`backLabel` props en `SettingsSubrouteHeader`
5. **Dueño** — CTA en avanzado + nueva ruta + fix logout hard redirect
6. **Barbero** — Item en more-menu + nueva ruta
7. **Cliente** — Context update + layout update + sección en perfil + nueva ruta
8. **Login feedback** — Banner `passwordUpdated` con estado local + `history.replaceState`
9. **Tests** — Unit + E2E
