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
exports.GetFoods = exports.AddFood = exports.UpdateVendorService = exports.UpdateVandorCoverImage = exports.UpdateVendorProfile = exports.GetVendorProfile = exports.VandorLogin = void 0;
const admin_controller_1 = require("./admin.controller");
const utility_1 = require("../utility");
const Food_1 = require("../models/Food");
const VandorLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const existingVandor = yield (0, admin_controller_1.FindVandor)("", email);
    if (existingVandor !== null) {
        const validation = yield (0, utility_1.ValidatePassword)(password, existingVandor.password, existingVandor.salt);
        if (validation) {
            const signature = (0, utility_1.GenerateSignature)({
                _id: existingVandor.id,
                email: existingVandor.email,
                foodTypes: existingVandor.foodType,
                name: existingVandor.name,
            });
            return res.json(signature);
        }
        else {
            return res.json({ message: "password is not valid!" });
        }
    }
    return res.json({ message: "Login credential not valid" });
});
exports.VandorLogin = VandorLogin;
const GetVendorProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const existingVandor = yield (0, admin_controller_1.FindVandor)(user._id);
        return res.json(existingVandor);
    }
    return res.json({ message: "Vandor information not found" });
});
exports.GetVendorProfile = GetVendorProfile;
const UpdateVendorProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { address, foodTypes, name, phone } = req.body;
    const user = req.user;
    if (user) {
        const existingVandor = yield (0, admin_controller_1.FindVandor)(user._id);
        if (existingVandor !== null) {
            existingVandor.name = name;
            existingVandor.phone = phone;
            existingVandor.address = address;
            existingVandor.foodType = foodTypes;
            const savedResult = yield existingVandor.save();
            return res.json(savedResult);
        }
        return res.json(existingVandor);
    }
    return res.json({ message: "Vandor information not found" });
});
exports.UpdateVendorProfile = UpdateVendorProfile;
const UpdateVandorCoverImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const vandor = yield (0, admin_controller_1.FindVandor)(user._id);
        if (vandor !== null) {
            const files = req.files;
            const images = files.map((file) => file.filename);
            vandor.coverImages.push(...images);
            const result = yield vandor.save();
            return res.json(result);
        }
    }
    return res.json({ message: "something went wrong with add food" });
});
exports.UpdateVandorCoverImage = UpdateVandorCoverImage;
const UpdateVendorService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const existingVandor = yield (0, admin_controller_1.FindVandor)(user._id);
        if (existingVandor !== null) {
            existingVandor.serviceAvailable = !existingVandor.serviceAvailable;
            const savedResult = yield existingVandor.save();
            return res.json(savedResult);
        }
        return res.json(existingVandor);
    }
    return res.json({ message: "Vandor information not found" });
});
exports.UpdateVendorService = UpdateVendorService;
const AddFood = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const { category, description, foodType, name, price, readyTime } = req.body;
        const vandor = yield (0, admin_controller_1.FindVandor)(user._id);
        if (vandor !== null) {
            const files = req.files;
            const images = files.map((file) => file.filename);
            const createFood = yield Food_1.Food.create({
                vandorId: vandor._id,
                category,
                description,
                foodType,
                name,
                price,
                readyTime,
                images,
                rating: 0,
            });
            vandor.foods.push(createFood);
            const result = yield vandor.save();
            return res.json(result);
        }
    }
    return res.json({ message: "something went wrong with add food" });
});
exports.AddFood = AddFood;
const GetFoods = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const foods = yield Food_1.Food.find({ vandorId: user._id });
        if (foods !== null) {
            return res.json(foods);
        }
    }
    return res.json({ message: "foods information not found" });
});
exports.GetFoods = GetFoods;
//# sourceMappingURL=vandor.controller.js.map