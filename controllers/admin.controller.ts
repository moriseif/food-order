import { NextFunction, Request, Response } from "express";
import { CreateVendorInput } from "../dto";
import { Vandor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utility";

export const FindVandor = async (id: string | undefined, email?: string) => {
  if (email) {
    return await Vandor.findOne({ email });
  } else {
    return await Vandor.findById(id);
  }
};

export const CreateVandor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    address,
    email,
    foodType,
    ownerName,
    password,
    phone,
    pincode,
  } = <CreateVendorInput>req.body;

  const existingVandor = await FindVandor("", email);

  if (existingVandor !== null) {
    return res.json({ message: "A vandor with this email is exist!" });
  }

  //* generate a salt
  const salt = await GenerateSalt();

  //* encrypt the password using this salt
  const encPassword = await GeneratePassword(password, salt);

  const createVandor = await Vandor.create({
    name,
    address,
    email,
    foodType,
    ownerName,
    password: encPassword,
    phone,
    pincode,
    salt,
    rating: 0,
    serviceAvailable: false,
    coverImages: [],
  });

  return res.json(createVandor);
};

export const GetVandors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vandors = await Vandor.find();

  if (vandors !== null) {
    return res.json(vandors);
  }
  return res.json({ message: "vandors data not available!" });
};

export const GetVandorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vandorId = req.params.id;

    const vandor = await FindVandor(vandorId);

    if (vandor !== null) {
      return res.json(vandor);
    }

    return res.json({ message: "vandor data not found!" });
  } catch (error: any) {
    return res.json({ message: error });
  }
};
