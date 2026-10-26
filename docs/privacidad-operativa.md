# Privacidad: cómo atender una solicitud de derechos

Objetivo: localizar y borrar los datos de una persona en menos de 10 minutos. **No ejecutes nada en producción sin permiso de Rubén**; estas consultas son un procedimiento para cuando haga falta atender una solicitud.

## Qué datos hay y dónde

| Dato | Tabla | Identificador | Conservación |
|---|---|---|---|
| Nombre, email, resumen de un contacto | `leads` | email | 12 meses (`expires_at`) |
| Conversación guardada (con consentimiento) | `conversations` + `messages` | UUID aleatorio, hash de IP | 90 días (`expires_at`) |
| Respuestas cacheadas del LLM | `answer_cache` | hash de la pregunta | 30 días; sin datos personales |

Las conversaciones **no llevan nombre ni email**. Solo se pueden relacionar con una persona por el `conversation_id` de su lead (si dejó el resumen) o porque la persona aporte el texto de un mensaje.

## Ver las conversaciones guardadas

No hay panel. Un comando de solo lectura las muestra con su lead (si lo hay) y los mensajes en orden:

```bash
docker exec rubenrosales-api node dist/jobs/conversations.js 10    # en el VPS; el número es cuántas (máx. 100)
pnpm --filter @rr/api conversations 10                              # en local
```

Lleva datos personales: ejecútalo solo tú.

## Entrar a la base de datos (en el VPS)

```bash
cd /opt/apps/projects/rubenrosalesdev
set -a; . ./.env; set +a
docker exec -it rubenrosales-postgres psql -U "$POSTGRES_USER" "$POSTGRES_DB"
```

## Acceso (qué datos tenemos de esta persona)

```sql
-- Lead por email
select id, name, email, lang, summary, conversation_id, created_at from leads where email = 'persona@ejemplo.com';

-- Conversación enlazada a ese lead
select m.role, m.content, m.created_at
from messages m join leads l on l.conversation_id = m.conversation_id
where l.email = 'persona@ejemplo.com' order by m.id;

-- Sin lead: buscar por un fragmento del mensaje que facilite la persona
select c.id, c.created_at, m.role, left(m.content, 80)
from messages m join conversations c on c.id = m.conversation_id
where m.content ilike '%fragmento del mensaje%' order by c.created_at, m.id;
```

Para entregar una copia, exporta el resultado: `\copy (<consulta>) to '/tmp/export.csv' csv header` y bórralo después.

## Supresión

Hazlo dentro de una transacción y revisa los recuentos antes de confirmar:

```sql
begin;
-- 1. conversaciones enlazadas a sus leads (los mensajes caen en cascada)
delete from conversations where id in (select conversation_id from leads where email = 'persona@ejemplo.com' and conversation_id is not null);
-- 2. conversación localizada por id (caso sin lead)
-- delete from conversations where id = '<uuid>';
-- 3. los leads
delete from leads where email = 'persona@ejemplo.com';
-- Comprueba con select count(*) que ya no queda nada y entonces:
commit;   -- o rollback; si algo no cuadra
```

Después responde a la persona confirmando el borrado. Las copias de seguridad (`pg_dump` nocturnos, 14 días) conservan el dato hasta que roten; indícalo si lo pregunta.

## Plazos automáticos

La API borra cada día lo caducado (`jobs/purge.ts`): conversaciones a los 90 días y leads a los 12 meses. Para cambiarlos, `CONVERSATION_RETENTION_DAYS` y `LEAD_RETENTION_DAYS` en el `.env` (afecta solo a lo que se cree después).

## Retirada del consentimiento

Es lo mismo que la supresión de la conversación. Atiéndela en el plazo legal (un mes).
