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
        try {
            let linkKyb: string | null = null;
            const userData = await conduitFinancial.getCustomer(user.conduit_id);

            linkKyb = userData.kybLink ?? null;
            console.log('userData', userData.kybLinkExpiration);
            if (
                userData.status === 'created' ||
                userData.status === 'kyb_in_progress'
            ) {
                if (userData.kybLinkExpiration) {
                    const expirationDate = new Date(userData.kybLinkExpiration);
                    const now = new Date();
                    console.log('Expiration:', expirationDate);
                    console.log('Now:', now);
                    console.log('Expired?:', expirationDate.getTime() < now.getTime());
                    if (expirationDate.getTime() < now.getTime()) {
                        const kybLinkData = await conduitFinancial.getLinkKyb(user.conduit_id);
                        linkKyb = kybLinkData.verification_url ?? null;
                    }
                }
            }
            data = {
                ...user,
                conduit_kyb_link: linkKyb,
                conduit_kyb_status: userData.status ?? null,
                kybLinkExpiration: userData.kybLinkExpiration ?? null
            };

        } catch (error) {
            console.error("Error obteniendo datos del cliente:", error);

            data = {
                ...user,
                conduit_kyb_link: null,
                conduit_kyb_status: null,
                kybLinkExpiration: null

            };
        }
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
