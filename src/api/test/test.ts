import { Request, Response } from "express";

export const testController = async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Servidor funcionando correctamente",
  });
};
