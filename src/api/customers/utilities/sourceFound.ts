import supabase from "@/db/supabase";
import { Request, Response } from "express";

export const sourceFoundController = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase
            .from('source_fund')
            .select('*')

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        // order data alphabetically by es_label
        const processedSourcesFund = data
            .map((src) => ({
                value: src.sfId,
                sf_name: src.sf_name,
                label: src.es_label || src.en_label || '', // Fallback si es_label es undefined
                en_label: src.en_label,
                is_bussines: src.is_bussines,
            }))
            .sort((a, b) => {
                const labelA = a.label || '';
                const labelB = b.label || '';
                return labelA.localeCompare(labelB);
            });

        return res.status(200).json(processedSourcesFund);

    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}