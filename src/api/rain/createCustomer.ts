import { Request, Response } from "express";
import apiRain from "@/services/rain/apiRain"
import { AuthRequest } from "../../middleware/authMiddleware";
import { OCCUPATION_CODES } from "./constants/occupationCodes"

const isEmpty = (value: any): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    return false;
};
export const createCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
    const data = req.body;
    const requiredFields = [
        "firstName",
        "lastName",
        "birthDate",
        "nationalId",
        "countryOfIssue",
        "email",
        "phoneCountryCode",
        "phoneNumber",
        "walletAddress",
        "occupation",
        "annualSalary",
        "accountPurpose",
        "expectedMonthlyVolume",
        "isTermsOfServiceAccepted",
        "ipAddress",
        "address"
    ];
    const missing = requiredFields.filter(f => isEmpty(data[f]));
    if (missing.length) {
        res.status(400).json({
            error: "MISSING_FIELDS",
            message: "Faltan campos obligatorios",
            example: {
                firstName: "Juan",
                lastName: "Pérez"
            }
        });
        return;
    }
    const addressFields = ["line1", "city", "region", "postalCode", "countryCode"];
    const missingAddress = addressFields.filter(f => isEmpty(data.address?.[f]));

    if (missingAddress.length) {
        res.status(400).json({
            error: "INVALID_ADDRESS",
            message: "Faltan campos en address",
            example: {
                address: {
                    line1: "123 Main St",
                    city: "Miami",
                    region: "FL",
                    postalCode: "33101",
                    countryCode: "US"
                }
            }
        });
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        res.status(400).json({
            error: "INVALID_EMAIL",
            message: "Email inválido",
            example: "juan@ejemplo.com"
        });
        return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.birthDate)) {
        res.status(400).json({
            error: "INVALID_BIRTH_DATE",
            message: "Formato inválido (YYYY-MM-DD)",
            example: "1990-01-15"
        });
        return;
    }
    if (!/^[A-Z]{2}$/i.test(data.countryOfIssue)) {
        res.status(400).json({
            error: "INVALID_COUNTRY_CODE",
            message: "countryOfIssue inválido",
            example: "US"
        });
        return;
    }
    if (!/^[A-Z]{2}$/i.test(data.address.countryCode)) {
        res.status(400).json({
            error: "INVALID_ADDRESS_COUNTRY",
            message: "address.countryCode inválido",
            example: "US"
        });
        return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(data.walletAddress)) {
        res.status(400).json({
            error: "INVALID_WALLET",
            message: "Wallet address inválida",
            example: "0x1570815c3d0dc2017079d39fe044bb3743a1d268"
        });
        return;
    }
    if (!OCCUPATION_CODES.has(data.occupation)) {
        res.status(400).json({
            error: "INVALID_OCCUPATION",
            message: "Occupation no soportada",
            example: "11-1011"
        });
        return;
    }
    if (data.isTermsOfServiceAccepted !== true) {
        res.status(400).json({
            error: "TOS_NOT_ACCEPTED",
            message: "Debes aceptar los términos",
            example: true
        });
        return;
    }
    const ipRegex =
        /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;

    if (!ipRegex.test(data.ipAddress)) {
        res.status(400).json({
            error: "INVALID_IP",
            message: "IP inválida",
            example: "192.168.1.1"
        });
        return;
    }
    const customer = await apiRain.createCustomer(data)
    res.status(200).json({ success: true, customer });
};
