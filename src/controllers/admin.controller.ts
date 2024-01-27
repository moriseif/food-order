import { NextFunction, Request, Response } from "express";
import { CreateVendorInput } from "../dto";
import { Vendor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utility";

export const FindVendor = async (id: string | undefined, email?: string) => {
  if (email) {
    return await Vendor.findOne({ email });
  } else {
    return await Vendor.findById(id);
  }
};

export const CreateVendor = async (
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

  const existingVendor = await FindVendor("", email);

  if (existingVendor !== null) {
    return res.json({ message: "A vendor with this email is exist!" });
  }

  //* generate a salt
  const salt = await GenerateSalt();

  //* encrypt the password using this salt
  const encPassword = await GeneratePassword(password, salt);

  const createVendor = await Vendor.create({
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
    foods: [],
  });

  return res.json(createVendor);
};

export const GetVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vendors = await Vendor.find();

  if (vendors !== null) {
    return res.json(vendors);
  }
  return res.json({ message: "vendors data not available!" });
};

export const GetVendorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendorId = req.params.id;

    const vendor = await FindVendor(vendorId);

    if (vendor !== null) {
      return res.json(vendor);
    }

    return res.json({ message: "vendor data not found!" });
  } catch (error: any) {
    return res.json({ message: error });
  }
};
