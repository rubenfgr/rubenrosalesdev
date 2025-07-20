
import { json } from "@tanstack/react-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { serverTranslation } from "@/server/services/use-server-translation";

export const ServerRoute = createServerFileRoute("/api/health").methods({
  GET: async ({ request, params }) => {
    try {
      const { t } = serverTranslation();

      console.log(t("welcome"));

      return json({
        message: t("welcome"),
      });
    } catch (e) {
      console.error(e);
      return json({ error: "User not found" }, { status: 404 });
    }
  },
});
