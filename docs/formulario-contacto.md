# Formulario de contacto (Gmail)

El formulario guiado, el directo y el resumen del asistente envían JSON a `POST /api/contact` (un endpoint del servidor Node). El endpoint valida los datos, aplica el antispam (campo señuelo `website`, tiempo mínimo de 3 s desde que se abre el formulario y comprobación de origen) y envía el email con el proveedor elegido en `CONTACT_PROVIDER`: **Gmail** (por defecto, OAuth2) o **Resend**. El visitante queda en `Reply-To`, así que basta responder al email recibido.

## Variables (solo en el entorno, nunca en el repo)

`CONTACT_PROVIDER` = `gmail` (por defecto) o `resend`. Con Resend hacen falta `RESEND_API_KEY`, `CONTACT_FROM` (remitente verificado en Resend) y `CONTACT_TO`.


| Variable | Qué es |
|---|---|
| `GMAIL_CLIENT_ID` | ID de cliente OAuth de Google Cloud |
| `GMAIL_CLIENT_SECRET` | Secreto del cliente OAuth |
| `GMAIL_REFRESH_TOKEN` | Refresh token con el permiso `gmail.send` |
| `GMAIL_SENDER` | Cuenta de Gmail desde la que se envía (la autorizada) |
| `CONTACT_TO` | Dirección que recibe los mensajes (p. ej. `hola@rubenrosales.dev` si ya reenvía a tu Gmail, o la propia cuenta de Gmail) |

Sin ellas, el endpoint responde 503 y el formulario muestra el aviso de error con el email de contacto.

En producción se definen en `/opt/apps/projects/rubenrosalesdev/.env` del VPS (ver [despliegue.md](despliegue.md)). En local, copia `.env.example` a `.env`.

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

Si el formulario empieza a fallar (el servidor registra `contacto: fallo al enviar token 400`), repite los pasos 4 y 5. Conviene enviarte un mensaje de prueba cada pocos meses.

## Antispam

El endpoint no tiene límite de peticiones propio. Si hiciera falta, se añade un middleware de Traefik (`ratelimit`) sobre `/api/contact`.
