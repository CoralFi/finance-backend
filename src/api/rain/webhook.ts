// controllers/rainWebhook.controller.ts
import { Request, Response } from "express";
import { updateRainUser } from "@/services/supabase/rainUser";
export const rainWebhook = async (req: Request, res: Response) => {
  try {
    const event = req.body;
    if (event.resource !== "user" || event.action !== "updated") {
      return res.status(200).json({ ignored: true });
    }
    const rainUserId = event.body?.id;
    const applicationStatus = event.body?.applicationStatus;
    const applicationReason = event.body?.applicationReason || null;
    const applicationCompletionLink =
      event.body?.applicationCompletionLink?.url || null;

    if (!rainUserId || !applicationStatus) {
      console.warn("Webhook incompleto", event.body);
      return res.status(200).json({ ignored: true });
    }

    await updateRainUser(rainUserId, {
      application_status: applicationStatus,
      application_reason: applicationReason,
      application_completion_link: applicationCompletionLink
    });

    console.log(
      `✅ Rain user ${rainUserId} actualizado a ${applicationStatus}`
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error procesando webhook Rain:", error);
    return res.status(200).json({ success: false });
  }
};
