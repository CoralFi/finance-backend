import supabase from "../db/supabase";
import { v4 as uuidv4 } from "uuid";
import { CreateUserParams, UserRecord } from "../types/user.types";
export const verifyUser = async (email: string): Promise<any> => {
  try {
    const { data, error } = await supabase.rpc("exists_user", { p_email: email });
    if (error) {
      console.error("Error en RPC:", error.message);
      return null;
    }
    return (data);
  } catch (err) {
    console.error("Error al verificar usuario:", err);
    return null;
  }
};

export const createUser = async (params: CreateUserParams): Promise<UserRecord | null> => {
  try {
     const uuid = uuidv4();
    const { data, error } = await supabase.rpc("create_user", {
      p_email: params.email,
      p_password: params.password,
      p_uuid: uuid,
      p_nombre: params.nombre,
      p_apellido: params.apellido,
      p_user_type: params.userType,
      p_tos_coral: params.tosCoral,
      p_record_type: params.recordType,
      p_phone_number: params.phoneNumber ?? null,
      p_birthdate: params.birthDate ?? null,
      p_occupation_id: params.occupationId ?? null,
      p_employment_situation_id: params.employmentSituationId ?? null,
      p_account_purposes_id: params.accountPurposesId ?? null,
      p_source_fund_id: params.sourceFundId ?? null,
      p_amount_to_moved_id: params.amountToMovedId ?? null,
      p_country: params.country ?? null,
      p_address_line_1: params.addressLine1 ?? null,
      p_address_line_2: params.addressLine2 ?? null,
      p_city: params.city ?? null,
      p_state_region_province: params.stateRegionProvince ?? null,
      p_postal_code: params.postalCode ?? null,
    });
    console.log("RPC", data)
    if (Array.isArray(data) && data.length > 0) {
      return data[0] as UserRecord;
    }
    return null;
  } catch (err) {
    console.error("⚠️ Error al crear usuario:", err);
    return null;
  }
};
