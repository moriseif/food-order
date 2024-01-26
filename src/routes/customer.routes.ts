import express, { Request, Response, NextFunction } from "express";
import {
  AddToCart,
  CreateOrder,
  CustomerLogin,
  CustomerSignUp,
  CustomerVerify,
  DeleteCart,
  GetCart,
  GetCustomerProfile,
  GetOrderById,
  GetOrders,
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
router.post("/cart", AddToCart);
router.get("/cart", GetCart);
router.delete("/cart", DeleteCart);

// payment
// Order
router.post("/create-order", CreateOrder);
router.get("/orders", GetOrders);
router.get("/order/:id", GetOrderById);

export { router as CustomerRoute };
