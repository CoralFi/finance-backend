// import { Request, Response } from "express";
// import conduitFinancial from "@/services/conduit/conduit-financial";
// export const getBankAccountsByCustomerIdController = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   const { customerId, currency } = req.params;
//   if (!customerId) {
//     return res.status(400).json({
//       success: false,
//       message: "customerId es requerido en el path",
//     });
//   }
//   try {
//     const allAccounts = await conduitFinancial.getBankAccounts();
//     let filteredAccounts = allAccounts.data.filter(
//       (account: any) => account.customerId === customerId
//     );
//     if (currency.toLowerCase() !== "all") {
//       filteredAccounts = filteredAccounts.filter((account: any) =>
//         account.paymentMethods?.some(
//           (method: any) =>
//             method.currency?.toLowerCase() === currency.toLowerCase()
//         )
//       );
//     }
//     return res.status(200).json({
//       success: true,
//       message: `Bank accounts filtered by customerId${currency ? " and currency" : ""}`,
//       data: filteredAccounts,
//     });
//   } catch (error: any) {
//     console.error("Error retrieving bank accounts:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to retrieve bank accounts",
//       error: error.message || error,
//     });
//   }
// };

import { Request, Response } from "express";
import supabase from "@/db/supabase";

export const getBankAccountsByCustomerIdController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { customerId, currency } = req.params;

  if (!customerId) {
    return res.status(400).json({
      success: false,
      message: "customerId es requerido en el path",
    });
  }

  try {
    const { data: counterparties, error: cpError } = await supabase
      .from("conduit_counterparties")
      .select(`
        counterparty_id,
        type,
        business_name,
        first_name,
        middle_name,
        last_name,
        email,
        phone,
        website,
        identification_type,
        identification_number,
        address,
        status,
        created_at,
        updated_at
      `)
      .eq("customer_id", customerId)
      .eq("active", true)
      .neq("status", "deleted");

    if (cpError) {
      throw cpError;
    }

    if (!counterparties || counterparties.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No bank accounts found for this customer",
        data: [],
      });
    }

    const counterpartyIds = counterparties.map(
      (cp: any) => cp.counterparty_id
    );

    let paymentMethodsQuery = supabase
      .from("conduit_payment_methods")
      .select(`
        payment_method_id,
        counterparty_id,
        type,
        rail,
        bank_name,
        account_type,
        account_owner_name,
        account_number,
        routing_number,
        swift_code,
        iban,
        pix_key,
        wallet_address,
        wallet_label,
        currency,
        address,
        status,
        active
      `)
      .in("counterparty_id", counterpartyIds)
      .eq("active", true)
      .eq("status", "enabled");

    if (currency && currency.toLowerCase() !== "all") {
      paymentMethodsQuery = paymentMethodsQuery.eq(
        "currency",
        currency.toUpperCase()
      );
    }

    const { data: paymentMethods, error: pmError } =
      await paymentMethodsQuery;

    if (pmError) {
      throw pmError;
    }

    const response = counterparties.map((cp: any) => ({
      id: cp.counterparty_id,
      type: cp.type,
      businessName: cp.business_name,
      firstName: cp.first_name,
      middleName: cp.middle_name,
      lastName: cp.last_name,
      email: cp.email,
      phone: cp.phone,
      website: cp.website,
      identificationType: cp.identification_type,
      identificationNumber: cp.identification_number,
      address: cp.address,
      status: cp.status,
      paymentMethods: (paymentMethods || [])
        .filter(
          (pm: any) => pm.counterparty_id === cp.counterparty_id
        )
        .map((pm: any) => ({
          id: pm.payment_method_id,
          type: pm.type,
          rail: pm.rail,
          bankName: pm.bank_name,
          accountType: pm.account_type,
          accountOwnerName: pm.account_owner_name,
          accountNumber: pm.account_number,
          routingNumber: pm.routing_number,
          swiftCode: pm.swift_code,
          iban: pm.iban,
          pixKey: pm.pix_key,
          currency: pm.currency,
          walletAddress: pm.wallet_address,
          walletLabel: pm.wallet_label,
          address: pm.address,
        })),
    }));

    const filteredResponse = response.filter(
      (cp: any) => cp.paymentMethods.length > 0
    );

    return res.status(200).json({
      success: true,
      message: "Bank accounts retrieved successfully",
      data: filteredResponse,
    });
  } catch (error: any) {
    console.error("Error retrieving bank accounts from DB:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve bank accounts",
      error: error.message || error,
    });
  }
};
