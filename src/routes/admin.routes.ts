import express, { Request, Response, NextFunction } from "express";
import {
  CreateVendor,
  GetDeliveryUsers,
  GetTransactionById,
  GetTransactions,
  GetVendorById,
  GetVendors,
  VerifyDeliveryUser,
} from "../controllers";

const router = express.Router();

router.post("/vendor", CreateVendor);

router.get("/vendors", GetVendors);

router.get("/vendor/:id", GetVendorById);

router.get("/transactions", GetTransactions);

router.get("/transaction/:id", GetTransactionById);

router.get("/delivery/users", GetDeliveryUsers);

router.put("/delivery/verify", VerifyDeliveryUser);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "hello from admin panel" });
});

export { router as AdminRoute };
