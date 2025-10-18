import { Request, Response } from "express";
import { getFernCustomers } from "@/services/fern/customer";

export const listCustomersController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const fernCustomers = await getFernCustomers();

    return res.status(200).json({
      success: true,
      message: "Clientes obtenidos exitosamente",
      count: fernCustomers.customers.length,
      customers: fernCustomers.customers
    });
  } catch (error: any) {
    console.error("Error al obtener clientes:", error.details || error.message);

    return res.status(error.status || 500).json({
      success: false,
      error: "Error al obtener los clientes",
      details: error.details || { message: error.message },
    });
  }
};