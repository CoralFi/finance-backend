import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { getAllCustomerInfo } from "@/services/supabase/customersb";
import { getRainUserByCustomerId } from "@/services/supabase/rainUser";
import conduitFinancial from '@/services/conduit/conduit-financial';
import { getCustomerTotalInfo } from "@/services/customer/customerInfoService";

export const getMeController = async (req: AuthRequest, res: Response) => {

    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    let data = {} as any
    if (user.user_type === 'business') {

        data = { ...user, }
    }
    if (user.user_type === 'persona') {
        const userInfo = await getAllCustomerInfo(user.customer_id)
        const rainUser = await getRainUserByCustomerId(user.customer_id)
        const customerTotalInfo = await getCustomerTotalInfo(user.customer_id);
        data = {
            ...userInfo,
            applicationStatus: rainUser?.application_status ?? null,
            user_info: customerTotalInfo?.user_info ?? null,
            fernWalletId: customerTotalInfo?.fern?.fernWalletId ?? null,

        }
    }
    return res.status(200).json({
        success: true,
        user: data
    });
};
