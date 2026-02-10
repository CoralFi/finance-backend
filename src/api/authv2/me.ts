import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { getAllCustomerInfo } from "@/services/supabase/customersb";
import { getRainUserByCustomerId } from "@/services/supabase/rainUser";
export const getMeController = async (req: AuthRequest, res: Response) => {

    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    let data = {} as any
    if (user.user_type === 'business') {
        data = user
    }
    if (user.user_type === 'persona') {
        const userInfo = await getAllCustomerInfo(user.customer_id)
        const rainUser = await getRainUserByCustomerId(user.customer_id)
        data = {
            ...userInfo,
            applicationStatus: rainUser?.application_status ?? null
        }
    }
    return res.status(200).json({
        success: true,
        user: data
    });
};
