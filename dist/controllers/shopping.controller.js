"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRestaurantById = exports.SearchFoods = exports.GetFoodsIn30Min = exports.GetTopRestaurants = exports.GetFoodAvailability = void 0;
const models_1 = require("../models");
const GetFoodAvailability = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pincode = req.params.pincode;
    const result = yield models_1.Vandor.find({ pincode, serviceAvailable: false })
        .sort([["rating", "descending"]])
        .populate("foods");
    if (result.length > 0) {
        return res.status(200).json(result);
    }
    return res.status(400).json("Data Not Found");
});
exports.GetFoodAvailability = GetFoodAvailability;
const GetTopRestaurants = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pincode = req.params.pincode;
    const result = yield models_1.Vandor.find({ pincode, serviceAvailable: false })
        .sort([["rating", "descending"]])
        .limit(10);
    if (result.length > 0) {
        return res.status(200).json(result);
    }
    return res.status(400).json("Data Not Found");
});
exports.GetTopRestaurants = GetTopRestaurants;
const GetFoodsIn30Min = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pincode = req.params.pincode;
    const result = yield models_1.Vandor.find({
        pincode,
        serviceAvailable: false,
    }).populate("foods");
    if (result.length > 0) {
        const foodResults = [];
        result.map((vandor) => {
            const foods = vandor.foods;
            foodResults.push(...foods.filter((food) => food.readyTime <= 30));
        });
        return res.status(200).json(foodResults);
    }
    return res.status(400).json("Data Not Found");
});
exports.GetFoodsIn30Min = GetFoodsIn30Min;
const SearchFoods = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pincode = req.params.pincode;
    const result = yield models_1.Vandor.find({
        pincode,
        serviceAvailable: false,
    }).populate("foods");
    if (result.length > 0) {
        const foodResults = [];
        result.map((item) => foodResults.push(...item.foods));
        return res.status(200).json(foodResults);
    }
    return res.status(400).json("Data Not Found");
});
exports.SearchFoods = SearchFoods;
const GetRestaurantById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield models_1.Vandor.findById(id).populate("foods");
    if (result) {
        return res.status(200).json(result);
    }
    return res.status(400).json("Data Not Found");
});
exports.GetRestaurantById = GetRestaurantById;
//# sourceMappingURL=shopping.controller.js.map