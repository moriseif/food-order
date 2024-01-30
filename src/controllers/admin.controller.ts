import { NextFunction, Request, Response } from "express";
import { CreateVendorInput } from "../dto";
import { DeliveryUser, Transaction, Vendor } from "../models";
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
    lat: 0,
    lng: 0,
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

export const GetTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const transaction = await Transaction.find();
    if (transaction) {
      return res.status(200).json(transaction);
    }
    return res.json({ message: "Transaction data not available!" });
  } catch (error: any) {
    return res.json({ message: error });
  }
};

export const GetTransactionById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const transaction = await Transaction.findById(id);
    if (transaction) {
      return res.status(200).json(transaction);
    }
    return res.json({ message: "Transaction data not available!" });
  } catch (error: any) {
    return res.json({ message: error });
  }
};

export const VerifyDeliveryUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { _id, status } = req.body;
  if (_id) {
    const profile = await DeliveryUser.findById(_id);
    if (profile) {
      profile.verified = status;
      const result = await profile.save();
      return res.status(200).json(result);
    }
  }
  return res.status(400).json({ message: "Unable to verify delivery user!" });
};

export const GetDeliveryUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deliveryUsers = await DeliveryUser.find();
  if (deliveryUsers) {
    return res.status(200).json(deliveryUsers);
  }

  return res.status(400).json({ message: "Unable to verify delivery user!" });
};
