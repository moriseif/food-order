import express, { Request, Response, NextFunction } from "express";
import {
  AddFood,
  AddOffer,
  EditOffer,
  GetCurrentOrders,
  GetFoods,
  GetOffers,
  GetOrderDetails,
  GetVendorProfile,
  ProcessOrder,
  UpdateVendorCoverImage,
  UpdateVendorProfile,
  UpdateVendorService,
  VendorLogin,
} from "../controllers";
import { Authenticate } from "../middlewares";
import multer from "multer";

const router = express.Router();

//* multer config

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    const timestamp = new Date()
      .toISOString()
      .replace(/:/g, "-")
      .replace(/\./g, "");

    cb(null, timestamp + "_" + file.originalname);
  },
});
const images = multer({ storage: imageStorage }).array("images", 10);

//* end multer config

router.post("/login", VendorLogin);

router.use(Authenticate);
router.get("/profile", GetVendorProfile);
router.patch("/profile", UpdateVendorProfile);
router.patch("/coverimage", images, UpdateVendorCoverImage);
router.patch("/service", UpdateVendorService);

router.post("/food", images, AddFood);
router.get("/foods", GetFoods);

//* Orders
router.get("/orders", GetCurrentOrders);
router.put("/order/:id/process", ProcessOrder);
router.get("/order/:id", GetOrderDetails);

//* Offers
router.get("/offers", GetOffers);
router.post("/offer", AddOffer);
router.put("/offer/:id", EditOffer);
// ! delete offers in future

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "hello from vendor" });
});

export { router as VendorRoute };
