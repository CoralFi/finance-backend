import { Response } from "express";
import apiRain from "@/services/rain/apiRain";
import { AuthRequest } from "@/middleware/authMiddleware";
import { generateWallet } from "@/services/wallet/walletGenerator";

 
const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  return false;
};

const validateFields = (obj: any, fields: string[], parent: string): string[] => {
  return fields
    .filter((f) => isEmpty(obj?.[f]))
    .map((f) => `${parent}.${f}`);
};

const errorResponse = (res: Response, errors: string[]) => {
  return res.status(400).json({
    error: "VALIDATION_ERROR",
    message: "Errores en payload",
    details: errors
  });
};

 
const validateAddress = (address: any, parent: string): string[] => {
  const fields = [
    "line1",
    "city",
    "region",
    "postalCode",
    "countryCode",
    "country"
  ];

  let errors = validateFields(address, fields, parent);

  if (address?.countryCode && !/^[A-Z]{2}$/i.test(address.countryCode)) {
    errors.push(`${parent}.countryCode invalid`);
  }

  return errors;
};

const validatePerson = (person: any, parent: string): string[] => {
  const fields = [
    "firstName",
    "lastName",
    "birthDate",
    "email",
    "nationalId",
    "countryOfIssue",
    "address"
  ];

  let errors = validateFields(person, fields, parent);

  
  errors.push(...validateAddress(person?.address, `${parent}.address`));

 
  if (person?.birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(person.birthDate)) {
    errors.push(`${parent}.birthDate invalid (YYYY-MM-DD)`);
  }

  if (person?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email)) {
    errors.push(`${parent}.email invalid`);
  }

  if (person?.countryOfIssue && !/^[A-Z]{2}$/i.test(person.countryOfIssue)) {
    errors.push(`${parent}.countryOfIssue invalid`);
  }

  return errors;
};

const validateArrayPersons = (arr: any[], parent: string): string[] => {
  if (!Array.isArray(arr) || arr.length === 0) {
    return [`${parent} must be a non-empty array`];
  }

  let errors: string[] = [];

  arr.forEach((p, i) => {
    errors.push(...validatePerson(p, `${parent}[${i}]`));
  });

  return errors;
};

const validateEntity = (entity: any): string[] => {
  const fields = [
    "name",
    "description",
    "industry",
    "registrationNumber",
    "taxId",
    "website",
    "type"
  ];

  return validateFields(entity, fields, "entity");
};

const validateInitialUser = (user: any): string[] => {
  const fields = [
    "firstName",
    "lastName",
    "birthDate",
    "nationalId",
    "countryOfIssue",
    "email",
    "address",
    "ipAddress"
  ];

  let errors = validateFields(user, fields, "initialUser");

  
  errors.push(...validateAddress(user?.address, "initialUser.address"));
 
  if (user?.birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(user.birthDate)) {
    errors.push("initialUser.birthDate invalid");
  }

  if (user?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    errors.push("initialUser.email invalid");
  }

  if (user?.countryOfIssue && !/^[A-Z]{2}$/i.test(user.countryOfIssue)) {
    errors.push("initialUser.countryOfIssue invalid");
  }

  const ipRegex =
    /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;

  if (user?.ipAddress && !ipRegex.test(user.ipAddress)) {
    errors.push("initialUser.ipAddress invalid");
  }

  return errors;
};

 
export const createCompany = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    const customerId = 123;
 
    const rootFields = [
      "name",
      "address",
      "entity",
      "representatives",
      "ultimateBeneficialOwners",
      "initialUser"
    ];

    let errors: string[] = validateFields(data, rootFields, "root");

    errors = [
      ...errors,
      ...validateAddress(data.address, "address"),
      ...validateEntity(data.entity),
      ...validateArrayPersons(data.representatives, "representatives"),
      ...validateArrayPersons(data.ultimateBeneficialOwners, "ultimateBeneficialOwners"),
      ...validateInitialUser(data.initialUser)
    ];

    if (errors.length) return errorResponse(res, errors);
 
    const evmWallet = generateWallet("evm");
    const solanaWallet = generateWallet("solana");

    data.initialUser.walletAddress = evmWallet.address;
    data.initialUser.solanaAddress = solanaWallet.address;
    data.initialUser.chainId =
      process.env.NODE_ENV === "development" ? "80002" : "137";
 
    const company = await apiRain.createAccountCompany(data);

    return res.status(200).json({
      success: true,
      company
    });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error?.response?.data || "Error interno"
    });
  }
};