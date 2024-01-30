import express from "express";
import { Authenticate } from "../middlewares";
import {
  DeliveryUserLogin,
  DeliveryUserSignUp,
  GetDeliveryUserProfile,
  UpdateDeliveryUserProfile,
  UpdateDeliveryUserStatus,
} from "../controllers";

const router = express.Router();

// ** signup/create customer **//
router.post("/signup", DeliveryUserSignUp);

// ** login customer **//
router.post("/login", DeliveryUserLogin);

//! Authenticated Route
router.use(Authenticate);

// ** Change service status **//
router.put("/change-status", UpdateDeliveryUserStatus);

// ** Profile **//
router.get("/profile", GetDeliveryUserProfile);

router.patch("/profile", UpdateDeliveryUserProfile);

export { router as DeliveryRoute };
