import supabase from "@/db/supabase";
import { Request, Response } from "express";

export const listAccountPurposeController = async (req: Request, res: Response) => {
    try {
        const { data: accountPurposes, error: accountPurposesError } = await supabase.
            rpc("list_account_purpose");

        if (accountPurposesError) {
            return res.status(500).json({ error: accountPurposesError.message });
        }

        // order data alphabetically by es_label
        const processedAccountPurposes = accountPurposes
            .map((acc: any) => ({
                value: acc.apid,
                ap_name: acc.ap_name,
                label: acc.es_label || acc.en_label || '', // Fallback si es_label es undefined
                en_label: acc.en_label
            }))
            .sort((a: any, b: any) => {
                const labelA = a.label || '';
                const labelB = b.label || '';
                return labelA.localeCompare(labelB);
            });

        return res.status(200).json(processedAccountPurposes);

    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}