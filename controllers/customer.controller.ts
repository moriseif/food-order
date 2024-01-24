import express, { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import {
  CreateCustomerInputs,
  CustomerLoginInputs,
  EditCustomerInputs,
} from "../dto/Customer.dto";
import { validate } from "class-validator";
import {
  GenerateOTP,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
  onRequestOTP,
} from "../utility";
import { Customer } from "../models/Customer";

export const CustomerSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customerInputs = plainToClass(CreateCustomerInputs, req.body);

  const inputErrors = await validate(customerInputs, {
    validationError: { target: true },
  });

  if (inputErrors.length > 0) {
    return res.status(400).json(inputErrors);
  }

  const { email, phone, password } = customerInputs;

  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  const { otp, expiry } = GenerateOTP();

  const existCustomer = await Customer.findOne({ email });
  if (existCustomer !== null) {
    return res
      .status(409)
      .json({ message: "An user exist with the provided email" });
  }

  const result = await Customer.create({
    email,
    password: userPassword,
    salt,
    phone,
    otp,
    otp_expiry: expiry,
    firstName: "",
    lastName: "",
    address: "",
    verified: false,
    lat: 0,
    lng: 0,
  });

  if (result) {
    // send OTP to customer
    await onRequestOTP(otp, phone);

    // generate signature
    const signature = GenerateSignature({
      _id: result.id,
      email: result.email,
      verified: result.verified,
    });

    // send the result to client
    return res
      .status(201)
      .json({ signature, verified: result.verified, email: result.email });
  }
  return res.status(400).json({ message: "Error with signup" });
};

export const CustomerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const LoginInputs = plainToClass(CustomerLoginInputs, req.body);
  const loginErrors = await validate(LoginInputs, {
    validationError: { target: false },
  });

  if (loginErrors.length > 0) {
    return res.status(400).json(loginErrors);
  }

  const { email, password } = LoginInputs;
  const customer = await Customer.findOne({ email });

  if (customer) {
    const validation = await ValidatePassword(
      password,
      customer.password,
      customer.salt
    );
    if (validation) {
      // generate the signature
      const signature = GenerateSignature({
        _id: customer.id,
        email: customer.email,
        verified: customer.verified,
      });
      // send the result to client
      return res.status(201).json({
        signature,
        verified: customer.verified,
        email: customer.email,
      });
    }
  }
  return res.status(404).json({ message: "Login error" });
};

export const CustomerVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { otp } = req.body;
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);
    if (profile) {
      if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
        profile.verified = true;
        const updatedCustomerResponse = await profile.save();

        // generate the new signature bcaz of change verified value
        const signature = GenerateSignature({
          _id: updatedCustomerResponse.id,
          email: updatedCustomerResponse.email,
          verified: updatedCustomerResponse.verified,
        });

        return res.status(201).json({
          signature,
          verified: updatedCustomerResponse.verified,
          email: updatedCustomerResponse.email,
        });
      }
    }
    return res.status(400).json({ message: "Error with OTP validation" });
  }
};

export const RequestOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id);
    if (profile) {
      const { otp, expiry } = GenerateOTP();
      profile.otp = otp;
      profile.otp_expiry = expiry;

      await profile.save();
      await onRequestOTP(otp, profile.phone);

      return res
        .status(200)
        .json({ message: "OTP sent to your registered phone number" });
    }
  }
  return res.status(400).json({ message: "Error with Request OTP" });
};

export const GetCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);
    if (profile) {
      return res.status(200).json(profile);
    }
  }
  return res.status(400).json({ message: "Error with fetch profile" });
};

export const UpdateCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  const profileInputs = plainToClass(EditCustomerInputs, req.body);
  const profileErrors = await validate(profileInputs, {
    validationError: { target: true },
  });

  if (profileErrors.length > 0) {
    return res.status(400).json(profileInputs);
  }

  const { address, firstName, lastName } = profileInputs;

  if (customer) {
    const profile = await Customer.findById(customer._id);
    if (profile) {
      profile.firstName = firstName;
      profile.lastName = lastName;
      profile.address = address;

      const result = await profile.save();
      return res.status(200).json(result);
    }
  }
};
