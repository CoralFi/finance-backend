import { Request, Response } from "express";
import { OCCUPATIONS } from "./constants/ocupationsLabels";

export const getOccupations = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      success: true,
      data: OCCUPATIONS,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching occupations",
    });
  }
};