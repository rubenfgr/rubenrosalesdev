import { json } from "@tanstack/react-start";
import { ZodError } from "zod";
import { serverTranslation } from "@/server/services/use-server-translation";

export function zodErrorResponse(e: unknown) {
  const { t } = serverTranslation();
  if (e instanceof ZodError) {
    return json(
      { error: e.issues.map((issue) => ({ ...issue, message: t("validation_error") })) },
      { status: 400 },
    );
  }
  return json({ error: t("unexpected_error") }, { status: 400 });
}
