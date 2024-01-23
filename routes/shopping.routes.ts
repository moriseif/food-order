import express, { Request, Response, NextFunction } from "express";
import {
  GetFoodAvailability,
  GetFoodsIn30Min,
  GetRestaurantById,
  GetTopRestaurants,
  SearchFoods,
} from "../controllers";

const router = express.Router();

//** Food Availability **/
router.get("/:pincode", GetFoodAvailability);

//** Top Restaurants **/
router.get("/top-restaurants/:pincode", GetTopRestaurants);

//** Food Available in 30 min **/
router.get("/foods-in-30min/:pincode", GetFoodsIn30Min);

//** search foods **/
router.get("/search/:pincode", SearchFoods);

//** Find restaurant by id **/
router.get("/restaurant/:id", GetRestaurantById);

export { router as ShoppingRoute };
