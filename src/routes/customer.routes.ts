import express, { Request, Response, NextFunction } from "express";
import {
  CustomerLogin,
  CustomerSignUp,
  CustomerVerify,
  GetCustomerProfile,
  RequestOTP,
  UpdateCustomerProfile,
} from "../controllers";
import { Authenticate } from "../middlewares";

const router = express.Router();

// ** signup/create customer **//
router.post("/signup", CustomerSignUp);

// ** login customer **//
router.post("/login", CustomerLogin);

//! Authenticated Route
router.use(Authenticate);

// ** verify customer account **//
router.patch("/verify", CustomerVerify);

// ** OTP/Requesting OTP **//
router.get("/otp", RequestOTP);

// ** Profile **//
router.get("/profile", GetCustomerProfile);

router.patch("/profile", UpdateCustomerProfile);

// Cart
// Order
// payment

export { router as CustomerRoute };
