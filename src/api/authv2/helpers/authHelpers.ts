import supabase from "../../../db/supabase";
import { UserInfo } from "@/services/types/types";

/**
 * Fetches user from database by email
 * @param email - User's email address
 * @returns UserInfo object or null if not found
 */
export const getUserByEmail = async (email: string): Promise<UserInfo | null> => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    console.log(`🔄 Fetching user info for: ${email}`);
  }

  const { data: userExists, error: existsError } = await supabase
    .rpc("exists_user", { p_email: email })
    .single() as { data: UserInfo | null, error: any };

  if (existsError || !userExists) {
    console.error("Error buscando usuario:", existsError);
    return null;
  }


  const { data: user, error: userError } = await supabase
    .rpc("get_user_info_2", { p_customer_id: userExists.customer_id })
    .single() as { data: UserInfo | null, error: any };

  if (isDevelopment) {
    console.log(`🔄 User info: ${JSON.stringify(user)}`);
  }

  if (userError || !user) {
    console.error("Error obteniendo datos del usuario:", userError);
    return null;
  }

  return user;
};

export const getUserByCustomerId = async (customerId: string): Promise<UserInfo | null> => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const { data: user, error: userError } = await supabase
    .rpc("get_user_info_2", { p_customer_id: customerId })
    .single() as { data: UserInfo | null, error: any };

  // if (isDevelopment) {
  //   console.log(`🔄 User info for ID ${customerId}: ${JSON.stringify(user)}`);
  // }

  if (userError || !user) {
    console.error("Error obteniendo datos del usuario por ID:", userError);
    return null;
  }

  return user;
};
