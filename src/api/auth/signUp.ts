import { Request, Response } from "express";
import bcrypt from "bcrypt";
import supabase from "../../db/supabase";
import { verifyUser, createUser } from "../../services/userService";
import { createFernCustomer } from "@/services/fern/customer";
import { SignUpRequestBody, ApiResponse } from "@/services/types/request.types";


const isDevelopment = process.env.NODE_ENV === 'development';
 

// required fields
const REQUIRED_FIELDS = {
  QUICK: ['email', 'password', 'nombre', 'apellido', 'userType', 'tosCoral'],
  COMPLETE: [
    'email', 'password', 'nombre', 'apellido', 'userType', 'tosCoral',
    'phoneNumber', 'birthDate', 'recentOccupation', 'employmentStatus',
    'accountPurpose', 'fundsOrigin', 'expectedAmount', 'country',
    'addressLine1', 'city', 'stateRegionProvince', 'postalCode'
  ]
} as const;

/**
 * Validate that a field is not empty (null, undefined, or empty string)
 */
const isValidField = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  return true;
};

/**
 * Validate required fields based on the type of registration
 */
const validateRequiredFields = (
  body: SignUpRequestBody,
  requiredFields: readonly string[]
): { isValid: boolean; missingFields: string[] } => {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (!isValidField(body[field as keyof SignUpRequestBody])) {
      missingFields.push(field);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

/**
 * Build validation error response object
 */
const buildValidationError = (
  message: string,
  requiredFields: readonly string[],
  body: SignUpRequestBody
): ApiResponse => {
  const received: Record<string, boolean> = {};
  requiredFields.forEach(field => {
    received[field] = isValidField(body[field as keyof SignUpRequestBody]);
  });
  
  return {
    success: false,
    message,
    data: {
      required: [...requiredFields],
      received
    }
  };
};

/**
 * Wrap transaction execution with automatic rollback handling
 */
const executeInTransaction = async <T>(
  callback: () => Promise<T>
): Promise<T> => {
  await supabase.rpc("begin");
  try {
    const result = await callback();
    await supabase.rpc("commit");
    return result;
  } catch (error) {
    await supabase.rpc("rollback");
    throw error;
  }
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as SignUpRequestBody;

  // Validate recordType is required
  if (body.recordType === undefined || body.recordType === null) {

    res.status(400).json({
      success: false,
      message: "El campo 'recordType' es obligatorio.",
      data: {
        required: ['recordType'],
        received: { recordType: body.recordType }
      }
    } as ApiResponse);
    return;
  }

  // Validate recordType is 0 or 1
  if (body.recordType !== 0 && body.recordType !== 1) {
    if (isDevelopment) {
      console.log(`🔄 RecordType is not 0 or 1: ${body.recordType}`);
    }
    res.status(400).json({
      success: false,
      message: "El valor de 'recordType' no es válido. Debe ser 0 o 1.",
      data: { received: { recordType: body.recordType } }
    } as ApiResponse);
    return;
  }

  // Validate fields based on registration type
  const requiredFields = body.recordType === 0 ? REQUIRED_FIELDS.QUICK : REQUIRED_FIELDS.COMPLETE;
  const validation = validateRequiredFields(body, requiredFields);
  
  if (!validation.isValid) {
    if (isDevelopment) {
      console.log(`🔄 Validation failed for recordType ${body.recordType}: ${JSON.stringify(validation)}`);
    }
    const message = body.recordType === 0
      ? "Faltan campos obligatorios para tipo de registro rápido."
      : "Todos los campos son obligatorios para tipo de registro completo.";
    
    res.status(400).json(buildValidationError(message, requiredFields, body));
    return;
  }

  try {
    // Execute everything inside a transaction
    const result = await executeInTransaction(async () => {
      // Verify if the user already exists
      const userExists = await verifyUser(body.email);
      console.log("userExists", userExists);
      if (userExists !== undefined) {
        throw new Error("USER_EXISTS");
      }

      // Hash password
      const hashedPassword = body.password ? await bcrypt.hash(body.password, 10) : '';

      // Create user in the database
      const newUser = await createUser({
        email: body.email,
        password: hashedPassword,
        nombre: body.nombre,
        apellido: body.apellido,
        userType: body.userType,
        tosCoral: body.tosCoral,
        recordType: body.recordType,
        phoneNumber: body.phoneNumber,
        birthDate: body.birthDate,
        occupationId: body.recentOccupation,
        employmentSituationId: body.employmentStatus,
        accountPurposesId: body.accountPurpose,
        sourceFundId: body.fundsOrigin,
        amountToMovedId: body.expectedAmount,
        country: body.country,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2,
        city: body.city,
        stateRegionProvince: body.stateRegionProvince,
        postalCode: body.postalCode,
      });

      if (!newUser) {
        throw new Error("USER_CREATION_FAILED");
      }

      // Create customer in Fern
      const fernCustomer = await createFernCustomer(newUser);
      if (!fernCustomer) {
        throw new Error("FERN_CUSTOMER_CREATION_FAILED");
      }

      return { newUser, fernCustomer };
    });

    // Success response
    res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente.",
      data: {
        customerId: result.newUser.customer_id,
        name: result.newUser.nombre,
        lastName: result.newUser.apellido,
        email: result.newUser.email,
        userType: result.newUser.user_type,
        fernCustomerId: result.fernCustomer.fernCustomerId,
        fernWalletId: result.fernCustomer.fernWalletAddress,
        kycFern: result.fernCustomer.Kyc,
        kycLinkFern: result.fernCustomer.KycLink,
        tosCoral: result.newUser.tos_coral,
      }
    } as ApiResponse);

  } catch (error: any) {
    console.error("Error en registerUser:", error);

    // Error handling
    if (error.message === "USER_EXISTS") {
      res.status(409).json({
        success: false,
        message: "El usuario ya existe.",
        error: "USER_EXISTS"
      } as ApiResponse);
      return;
    }

    if (error.message === "USER_CREATION_FAILED") {
      res.status(500).json({
        success: false,
        message: "Error al crear el usuario en la base de datos.",
        error: "USER_CREATION_FAILED"
      } as ApiResponse);
      return;
    }

    if (error.message === "FERN_CUSTOMER_CREATION_FAILED") {
      res.status(500).json({
        success: false,
        message: "Error al crear el cliente en Fern.",
        error: "FERN_CUSTOMER_CREATION_FAILED"
      } as ApiResponse);
      return;
    }

    // Error genérico
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al crear el usuario.",
      error: error.message || "INTERNAL_SERVER_ERROR"
    } as ApiResponse);
  }
};
