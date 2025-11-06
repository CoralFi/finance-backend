import { Request, Response } from "express";
import conduitFinancial from "@/services/conduit/conduit-financial";
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
    const allAccounts = await conduitFinancial.getBankAccounts();
    let filteredAccounts = allAccounts.data.filter(
      (account: any) => account.customerId === customerId
    );
    if (currency.toLowerCase() !== "all") {
      filteredAccounts = filteredAccounts.filter((account: any) =>
        account.paymentMethods?.some(
          (method: any) =>
            method.currency?.toLowerCase() === currency.toLowerCase()
        )
      );
    }
    return res.status(200).json({
      success: true,
      message: `Bank accounts filtered by customerId${currency ? " and currency" : ""}`,
      data: filteredAccounts,
    });
  } catch (error: any) {
    console.error("Error retrieving bank accounts:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve bank accounts",
      error: error.message || error,
    });
  }
};
