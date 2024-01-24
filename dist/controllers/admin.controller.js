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
exports.GetVandorById = exports.GetVandors = exports.CreateVandor = exports.FindVandor = void 0;
const models_1 = require("../models");
const utility_1 = require("../utility");
const FindVandor = (id, email) => __awaiter(void 0, void 0, void 0, function* () {
    if (email) {
        return yield models_1.Vandor.findOne({ email });
    }
    else {
        return yield models_1.Vandor.findById(id);
    }
});
exports.FindVandor = FindVandor;
const CreateVandor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, address, email, foodType, ownerName, password, phone, pincode, } = req.body;
    const existingVandor = yield (0, exports.FindVandor)("", email);
    if (existingVandor !== null) {
        return res.json({ message: "A vandor with this email is exist!" });
    }
    //* generate a salt
    const salt = yield (0, utility_1.GenerateSalt)();
    //* encrypt the password using this salt
    const encPassword = yield (0, utility_1.GeneratePassword)(password, salt);
    const createVandor = yield models_1.Vandor.create({
        name,
        address,
        email,
        foodType,
        ownerName,
        password: encPassword,
        phone,
        pincode,
        salt,
        rating: 0,
        serviceAvailable: false,
        coverImages: [],
        foods: [],
    });
    return res.json(createVandor);
});
exports.CreateVandor = CreateVandor;
const GetVandors = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const vandors = yield models_1.Vandor.find();
    if (vandors !== null) {
        return res.json(vandors);
    }
    return res.json({ message: "vandors data not available!" });
});
exports.GetVandors = GetVandors;
const GetVandorById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const vandorId = req.params.id;
        const vandor = yield (0, exports.FindVandor)(vandorId);
        if (vandor !== null) {
            return res.json(vandor);
        }
        return res.json({ message: "vandor data not found!" });
    }
    catch (error) {
        return res.json({ message: error });
    }
});
exports.GetVandorById = GetVandorById;
//# sourceMappingURL=admin.controller.js.map