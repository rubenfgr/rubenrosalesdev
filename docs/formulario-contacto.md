# Formulario de contacto (Gmail)

El formulario guiado y el directo envían JSON a `POST /api/v1/contact`, y el resumen del asistente a `POST /api/v1/leads`; los dos son rutas de la API (`apps/api`, ver [backend.md](backend.md)). Cada ruta valida los datos con Zod (`contactSchema` y `leadSchema` de `@rr/shared`), aplica el antispam (campo señuelo `website`, tiempo mínimo de 3 s desde que se abre el formulario y límite de peticiones por IP) y envía el email por **Gmail** (OAuth2). El visitante queda en `Reply-To`, así que basta responder al email recibido. El formulario de contacto no se guarda en la base de datos; los resúmenes del asistente sí (12 meses).

## Variables (solo en el entorno, nunca en el repo)

Las lee la **API**, no la web (la web ya no usa secretos). Resend ya no está soportado: solo Gmail.


| Variable | Qué es |
|---|---|
| `GMAIL_CLIENT_ID` | ID de cliente OAuth de Google Cloud |
| `GMAIL_CLIENT_SECRET` | Secreto del cliente OAuth |
| `GMAIL_REFRESH_TOKEN` | Refresh token con el permiso `gmail.send` |
| `GMAIL_SENDER` | Cuenta de Gmail desde la que se envía (la autorizada) |
| `CONTACT_TO` | Dirección que recibe los mensajes (p. ej. `hola@rubenrosales.dev` si ya reenvía a tu Gmail, o la propia cuenta de Gmail) |

Sin ellas, la API responde `502 mail_unavailable` (los resúmenes del asistente quedan guardados igualmente) y el formulario muestra el aviso de error con el email de contacto.

En producción se definen en `/opt/apps/projects/rubenrosalesdev/.env` del VPS (ver [despliegue.md](despliegue.md)). En local, copia `apps/api/.env.example` a `apps/api/.env`.

## Cómo obtener las credenciales

1. En [Google Cloud Console](https://console.cloud.google.com/) crea un proyecto y activa la **Gmail API**.
2. En «Pantalla de consentimiento de OAuth», tipo **Externo**. **Publica la app («En producción»)**: con el estado «Testing» el refresh token caduca a los 7 días.
3. Crea un **ID de cliente OAuth** de tipo «Aplicación web» con `https://developers.google.com/oauthplayground` como URI de redirección.
4. En [OAuth 2.0 Playground](https://developers.google.com/oauthplayground) (engranaje → «Use your own OAuth credentials»), autoriza el permiso `https://www.googleapis.com/auth/gmail.send` con la cuenta de Gmail y pulsa «Exchange authorization code for tokens». Copia el `refresh_token`.
5. Guarda los valores como secretos (arriba).

Google mostrará una pantalla de «app no verificada» al autorizar: es normal si la usas solo tú.

## Cuándo deja de funcionar

Según la [documentación de Google](https://developers.google.com/identity/protocols/oauth2#expiration), un refresh token deja de valer si:

- la app sigue en estado «Testing» (7 días),
- cambias la contraseña de la cuenta de Google y el token tiene permisos de Gmail,
- pasan 6 meses sin usarlo,
- revocas el acceso, o se superan 100 tokens por cuenta y cliente.

Si el formulario empieza a fallar (la API registra `contact: fallo al enviar el email token 400`), repite los pasos 4 y 5. Conviene enviarte un mensaje de prueba cada pocos meses.

## Antispam

Campo señuelo `website` (si llega relleno, se responde 200 sin enviar), tiempo mínimo de 3 s desde que se abre el formulario (y máximo de 24 h) y límite por IP (`RATE_LIMIT_LEADS_PER_HOUR`, 5 por hora por defecto, con `Retry-After`). No hay Turnstile (decisión D-5): si se viera abuso, se plantearía.
