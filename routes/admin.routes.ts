import express, { Request, Response, NextFunction } from "express";
import { CreateVendor } from "../controllers";

const router = express.Router();

router.post("/vendor", CreateVendor);
router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "hello from admin panel" });
});

export { router as AdminRoute };
