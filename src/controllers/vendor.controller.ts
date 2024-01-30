import { NextFunction, Request, Response } from "express";
import { CreateOfferInputs, EditVendorInput, VendorLoginInput } from "../dto";
import { FindVendor } from "./admin.controller";
import { GenerateSignature, ValidatePassword } from "../utility";
import { CreateFoodInputs } from "../dto/Food.dto";
import { Food } from "../models/Food";
import { Order } from "../models/Order";
import { Offer } from "../models";

export const VendorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = <VendorLoginInput>req.body;
  const existingVendor = await FindVendor("", email);

  if (existingVendor !== null) {
    const validation = await ValidatePassword(
      password,
      existingVendor.password,
      existingVendor.salt
    );
    if (validation) {
      const signature = GenerateSignature({
        _id: existingVendor.id,
        email: existingVendor.email,
        foodTypes: existingVendor.foodType,
        name: existingVendor.name,
      });

      return res.json(signature);
    } else {
      return res.json({ message: "password is not valid!" });
    }
  }

  return res.json({ message: "Login credential not valid" });
};

export const GetVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const existingVendor = await FindVendor(user._id);
    return res.json(existingVendor);
  }
  return res.json({ message: "Vendor information not found" });
};

export const UpdateVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { address, foodTypes, name, phone } = <EditVendorInput>req.body;
  const user = req.user;
  if (user) {
    const existingVendor = await FindVendor(user._id);
    if (existingVendor !== null) {
      existingVendor.name = name;
      existingVendor.phone = phone;
      existingVendor.address = address;
      existingVendor.foodType = foodTypes;

      const savedResult = await existingVendor.save();
      return res.json(savedResult);
    }
    return res.json(existingVendor);
  }
  return res.json({ message: "Vendor information not found" });
};

export const UpdateVendorCoverImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const vendor = await FindVendor(user._id);

    if (vendor !== null) {
      const files = req.files as [Express.Multer.File];
      const images = files.map((file: Express.Multer.File) => file.filename);

      vendor.coverImages.push(...images);
      const result = await vendor.save();
      return res.json(result);
    }
  }
  return res.json({ message: "something went wrong with add food" });
};

export const UpdateVendorService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const { lat, lng } = req.body;

  if (user) {
    const existingVendor = await FindVendor(user._id);
    if (existingVendor !== null) {
      existingVendor.serviceAvailable = !existingVendor.serviceAvailable;

      if (lat && lng) {
        existingVendor.lng = lng;
        existingVendor.lat = lat;
      }

      const savedResult = await existingVendor.save();
      return res.json(savedResult);
    }
    return res.json(existingVendor);
  }
  return res.json({ message: "Vendor information not found" });
};

export const AddFood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const { category, description, foodType, name, price, readyTime } = <
      CreateFoodInputs
    >req.body;

    const vendor = await FindVendor(user._id);

    if (vendor !== null) {
      const files = req.files as [Express.Multer.File];
      const images = files.map((file: Express.Multer.File) => file.filename);

      const createFood = await Food.create({
        vendorId: vendor._id,
        category,
        description,
        foodType,
        name,
        price,
        readyTime,
        images,
        rating: 0,
      });
      vendor.foods.push(createFood);
      const result = await vendor.save();
      return res.json(result);
    }
  }
  return res.json({ message: "something went wrong with add food" });
};

export const GetFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const foods = await Food.find({ vendorId: user._id });
    if (foods !== null) {
      return res.json(foods);
    }
  }
  return res.json({ message: "foods information not found" });
};

export const GetCurrentOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const orders = await Order.find({ vendorId: user._id }).populate(
      "items.food"
    );
    if (orders !== null) {
      return res.status(200).json(orders);
    }
  }

  return res.status(400).json({ message: "Order not found!" });
};

export const GetOrderDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderId = req.params.id;
  if (orderId) {
    const order = await Order.findById(orderId).populate("items.food");
    if (order !== null) {
      return res.status(200).json(order);
    }
  }

  return res.status(400).json({ message: "Order not found!" });
};

export const ProcessOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderId = req.params.id;

  const { status, remarks, time } = req.body; //ACCEPT//REJECT//UNDER-PROCESS//READY

  if (orderId) {
    const order = await Order.findById(orderId).populate("food");

    order.orderStatus = status;
    order.remarks = remarks;
    if (time) {
      order.readyTime = time;
    }
    const orderResult = await order.save();

    if (orderResult !== null) {
      return res.status(200).json(orderResult);
    }
  }

  return res.json({ message: "Unable to process Order!" });
};

export const GetOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    let currentOffers = Array();

    const offers = await Offer.find().populate("vendors");
    if (offers) {
      offers.map((item) => {
        if (item.vendors) {
          item.vendors.map((vendor) => {
            if (vendor._id.toString() === user._id) {
              currentOffers.push(item);
            }
          });
        }

        if (item.offerType === "GENERIC") {
          currentOffers.push(item);
        }
      });
    }
    return res.json(currentOffers);
  }
  return res.json({ message: "Offers not available" });
};

export const AddOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (user) {
    const {
      bank,
      bins,
      description,
      endValidity,
      isActive,
      minValue,
      offerAmount,
      offerType,
      pincode,
      promoType,
      promocode,
      startValidity,
      title,
      vendors,
    } = <CreateOfferInputs>req.body;
    const vendor = await FindVendor(user._id);
    if (vendor) {
      const offer = await Offer.create({
        title,
        description,
        offerType,
        offerAmount,
        pincode,
        promocode,
        promoType,
        startValidity,
        endValidity,
        bank,
        bins,
        isActive,
        minValue,
        vendors: [vendor],
      });

      return res.status(200).json(offer);
    }
  }
  return res.json({ message: "Unable to Add offer" });
};

export const EditOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const offerId = req.params.id;
  const user = req.user;
  if (user) {
    const {
      bank,
      bins,
      description,
      endValidity,
      isActive,
      minValue,
      offerAmount,
      offerType,
      pincode,
      promoType,
      promocode,
      startValidity,
      title,
      vendors,
    } = <CreateOfferInputs>req.body;

    const currentOffer = await Offer.findById(offerId);

    if (currentOffer) {
      const vendor = await FindVendor(user._id);
      if (vendor) {
        currentOffer.title = title;
        currentOffer.description = description;
        currentOffer.offerType = offerType;
        currentOffer.offerAmount = offerAmount;
        currentOffer.pincode = pincode;
        currentOffer.promocode = promocode;
        currentOffer.promoType = promoType;
        currentOffer.startValidity = startValidity;
        currentOffer.endValidity = endValidity;
        currentOffer.bank = bank;
        currentOffer.bins = bins;
        currentOffer.isActive = isActive;
        currentOffer.minValue = minValue;

        const result = await currentOffer.save();

        return res.status(200).json(result);
      }
    }
  }
  return res.json({ message: "Unable to Edit offer" });
};
