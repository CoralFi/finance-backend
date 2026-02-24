import { Request, Response } from "express";
import apiRain from "@/services/rain/apiRain"
import { AuthRequest } from "../../middleware/authMiddleware";
import { OCCUPATION_CODES } from "./constants/occupationCodes"
import { createRainUser } from "@/services/supabase/rainUser"
import crossmintApi from '@/services/crossmint/crossmint';

const isEmpty = (value: any): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    return false;
};
export const createCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
    try {


        const data = req.body;
        const customerId = req.user?.customer_id

        const requiredFields = [
            "firstName",
            "lastName",
            "birthDate",
            "nationalId",
            "countryOfIssue",
            "email",
            "phoneCountryCode",
            "phoneNumber",
            
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
        // Handle walletAddress (optional now)
        if (isEmpty(data.walletAddress)) {
            const email = req.user?.email;  
            if (!email) {
                res.status(400).json({
                    error: "MISSING_EMAIL",
                    message: "No se pudo obtener el email del usuario autenticado"
                });
                return;
            }
            try {
                const wallet = await crossmintApi.createWallet("evm", email);
                data.walletAddress = wallet.address;
                console.log("Wallet creada:", wallet.address);
            } catch (walletError) {
                console.error("Error creando wallet en Crossmint:", walletError);
                res.status(500).json({
                    error: "WALLET_CREATION_FAILED",
                    message: "No se pudo crear la wallet automáticamente"
                });
                return;
            }

        } else {
            if (!/^0x[a-fA-F0-9]{40}$/.test(data.walletAddress)) {
                res.status(400).json({
                    error: "INVALID_WALLET",
                    message: "Wallet address inválida",
                    example: "0x1570815c3d0dc2017079d39fe044bb3743a1d268"
                });
                return;
            }
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
        const rainCustomerDbPayload = {
            rain_user_id: customer.id, // Rain user ID
            customer_id: customerId,       // TU user/customer interno (importantísimo)
            is_active: customer.isActive,
            is_terms_of_service_accepted: customer.isTermsOfServiceAccepted,
            address: customer.address, // JSONB directo
            phone_country_code: customer.phoneCountryCode,
            phone_number: customer.phoneNumber,
            application_status: customer.applicationStatus,
            application_external_verification_link:
                customer.applicationExternalVerificationLink
                    ? customer.applicationExternalVerificationLink.url
                    : null,
            application_completion_link:
                customer.applicationCompletionLink
                    ? customer.applicationCompletionLink.url
                    : null,
            application_reason: customer.applicationReason || null,
            updated_at: new Date().toISOString(),
        };
        await createRainUser(rainCustomerDbPayload)
        res.status(200).json({ success: true, customer });
    }
    catch (error) {
        console.error("Error en createCustomer:", error);
        res.status(500).json({
            success: false,
            message: error || "Error interno del servidor",
        });
    }
};
