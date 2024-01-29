import express, { Request, Response, NextFunction } from "express";
import { Offer, Vendor } from "../models";
import { FoodDoc } from "../models/Food";

export const GetFoodAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  const result = await Vendor.find({ pincode, serviceAvailable: false })
    .sort([["rating", "descending"]])
    .populate("foods");

  if (result.length > 0) {
    return res.status(200).json(result);
  }

  return res.status(400).json("Data Not Found");
};

export const GetTopRestaurants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  const result = await Vendor.find({ pincode, serviceAvailable: false })
    .sort([["rating", "descending"]])
    .limit(10);

  if (result.length > 0) {
    return res.status(200).json(result);
  }

  return res.status(400).json("Data Not Found");
};

export const GetFoodsIn30Min = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  const result = await Vendor.find({
    pincode,
    serviceAvailable: false,
  }).populate("foods");

  if (result.length > 0) {
    const foodResults: any = [];

    result.map((vendor) => {
      const foods = vendor.foods as [FoodDoc];
      foodResults.push(...foods.filter((food) => food.readyTime <= 30));
    });

    return res.status(200).json(foodResults);
  }

  return res.status(400).json("Data Not Found");
};

export const SearchFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  const result = await Vendor.find({
    pincode,
    serviceAvailable: false,
  }).populate("foods");

  if (result.length > 0) {
    const foodResults: any = [];

    result.map((item) => foodResults.push(...item.foods));

    return res.status(200).json(foodResults);
  }

  return res.status(400).json("Data Not Found");
};

export const GetRestaurantById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  const result = await Vendor.findById(id).populate("foods");

  if (result) {
    return res.status(200).json(result);
  }

  return res.status(400).json("Data Not Found");
};

export const GetAvailableOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pincode = req.params.pincode;

  const offers = await Offer.find({ pincode, isActive: true });

  if (offers) {
    return res.status(200).json(offers);
  }
  return res.status(400).json({ message: "Offers not found" });
};
