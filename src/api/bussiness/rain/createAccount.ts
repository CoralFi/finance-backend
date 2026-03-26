import { Response } from "express";
import apiRain from "@/services/rain/apiRain";
import { AuthRequest } from "@/middleware/authMiddleware";
import { generateWallet } from "@/services/wallet/walletGenerator";
import {
  createRainCompanyWithContacts,
  getRainCompanyByBusinessId,
} from "@/services/supabase/rainCompanies";


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

const mapContactPerson = (person: any) => ({
  first_name: person.firstName,
  last_name: person.lastName,
  birth_date: person.birthDate ?? null,
  email: person.email ?? null,
  national_id: person.nationalId ?? null,
  country_of_issue: person.countryOfIssue ?? null,
  address: person.address ?? null,
});

const getRainCompanyId = (companyResponse: any): string | null => {
  return (
    companyResponse?.id ??
    companyResponse?.companyId ??
    companyResponse?.applicationId ??
    companyResponse?.data?.id ??
    null
  );
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
    const businessId = req.user?.business_id ?? req.user?.customer_id ?? null;
     
    if (!businessId) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    const existingCompany = await getRainCompanyByBusinessId(businessId);
    if (existingCompany) {
      return res.status(409).json({
        success: false,
        message: "Ya existe una cuenta Rain para este business_id",
        company: {
          id: existingCompany.id,
          rain_company_id: existingCompany.rain_company_id,
          status: existingCompany.status,
        },
      });
    }

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
    const solanaKey = solanaWallet.privateKey;
    const privateKey = evmWallet.privateKey;
    data.initialUser.walletAddress = evmWallet.address;
    data.initialUser.solanaAddress = solanaWallet.address;
    data.initialUser.chainId =
      process.env.NODE_ENV === "development" ? "80002" : "137";

    const company = await apiRain.createAccountCompany(data);
    const localRecord = await createRainCompanyWithContacts({
      company: {
        business_id: businessId,
        rain_company_id: getRainCompanyId(company),
        name: data.name,
        address: data.address,
        entity_name: data.entity.name,
        entity_description: data.entity.description ?? null,
        entity_industry: data.entity.industry ?? null,
        entity_registration_number: data.entity.registrationNumber ?? null,
        entity_tax_id: data.entity.taxId ?? null,
        entity_website: data.entity.website ?? null,
        entity_type: data.entity.type ?? null,
        initial_user_first_name: data.initialUser.firstName ?? null,
        initial_user_last_name: data.initialUser.lastName ?? null,
        initial_user_birth_date: data.initialUser.birthDate ?? null,
        initial_user_national_id: data.initialUser.nationalId ?? null,
        initial_user_country_of_issue: data.initialUser.countryOfIssue ?? null,
        initial_user_email: data.initialUser.email ?? null,
        initial_user_address: data.initialUser.address ?? null,
        initial_user_ip_address: data.initialUser.ipAddress ?? null,
        initial_user_wallet_address: data.initialUser.walletAddress ?? null,
        initial_user_solana_address: data.initialUser.solanaAddress ?? null,
        initial_user_chain_id: data.initialUser.chainId ?? null,
        registration_payload: data,
        private_key:privateKey,
        solana_key: solanaKey,
        status: "submitted",
        metadata: {
          rain_response: company,
        },
      },
      representatives: Array.isArray(data.representatives)
        ? data.representatives.map(mapContactPerson)
        : [],
      ubos: Array.isArray(data.ultimateBeneficialOwners)
        ? data.ultimateBeneficialOwners.map(mapContactPerson)
        : [],
    });

    return res.status(200).json({
      success: true,
      company,
      localRecord,
    });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error?.response?.data || "Error interno"
    });
  }
};