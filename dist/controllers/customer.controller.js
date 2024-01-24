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
exports.UpdateCustomerProfile = exports.GetCustomerProfile = exports.RequestOTP = exports.CustomerVerify = exports.CustomerLogin = exports.CustomerSignUp = void 0;
const class_transformer_1 = require("class-transformer");
const Customer_dto_1 = require("../dto/Customer.dto");
const class_validator_1 = require("class-validator");
const utility_1 = require("../utility");
const Customer_1 = require("../models/Customer");
const CustomerSignUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customerInputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.CreateCustomerInputs, req.body);
    const inputErrors = yield (0, class_validator_1.validate)(customerInputs, {
        validationError: { target: true },
    });
    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }
    const { email, phone, password } = customerInputs;
    const salt = yield (0, utility_1.GenerateSalt)();
    const userPassword = yield (0, utility_1.GeneratePassword)(password, salt);
    const { otp, expiry } = (0, utility_1.GenerateOTP)();
    const existCustomer = yield Customer_1.Customer.findOne({ email });
    if (existCustomer !== null) {
        return res
            .status(409)
            .json({ message: "An user exist with the provided email" });
    }
    const result = yield Customer_1.Customer.create({
        email,
        password: userPassword,
        salt,
        phone,
        otp,
        otp_expiry: expiry,
        firstName: "",
        lastName: "",
        address: "",
        verified: false,
        lat: 0,
        lng: 0,
    });
    if (result) {
        // send OTP to customer
        yield (0, utility_1.onRequestOTP)(otp, phone);
        // generate signature
        const signature = (0, utility_1.GenerateSignature)({
            _id: result.id,
            email: result.email,
            verified: result.verified,
        });
        // send the result to client
        return res
            .status(201)
            .json({ signature, verified: result.verified, email: result.email });
    }
    return res.status(400).json({ message: "Error with signup" });
});
exports.CustomerSignUp = CustomerSignUp;
const CustomerLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const LoginInputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.CustomerLoginInputs, req.body);
    const loginErrors = yield (0, class_validator_1.validate)(LoginInputs, {
        validationError: { target: false },
    });
    if (loginErrors.length > 0) {
        return res.status(400).json(loginErrors);
    }
    const { email, password } = LoginInputs;
    const customer = yield Customer_1.Customer.findOne({ email });
    if (customer) {
        const validation = yield (0, utility_1.ValidatePassword)(password, customer.password, customer.salt);
        if (validation) {
            // generate the signature
            const signature = (0, utility_1.GenerateSignature)({
                _id: customer.id,
                email: customer.email,
                verified: customer.verified,
            });
            // send the result to client
            return res.status(201).json({
                signature,
                verified: customer.verified,
                email: customer.email,
            });
        }
    }
    return res.status(404).json({ message: "Login error" });
});
exports.CustomerLogin = CustomerLogin;
const CustomerVerify = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    const customer = req.user;
    if (customer) {
        const profile = yield Customer_1.Customer.findById(customer._id);
        if (profile) {
            if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
                profile.verified = true;
                const updatedCustomerResponse = yield profile.save();
                // generate the new signature bcaz of change verified value
                const signature = (0, utility_1.GenerateSignature)({
                    _id: updatedCustomerResponse.id,
                    email: updatedCustomerResponse.email,
                    verified: updatedCustomerResponse.verified,
                });
                return res.status(201).json({
                    signature,
                    verified: updatedCustomerResponse.verified,
                    email: updatedCustomerResponse.email,
                });
            }
        }
        return res.status(400).json({ message: "Error with OTP validation" });
    }
});
exports.CustomerVerify = CustomerVerify;
const RequestOTP = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    if (customer) {
        const profile = yield Customer_1.Customer.findById(customer._id);
        if (profile) {
            const { otp, expiry } = (0, utility_1.GenerateOTP)();
            profile.otp = otp;
            profile.otp_expiry = expiry;
            yield profile.save();
            yield (0, utility_1.onRequestOTP)(otp, profile.phone);
            return res
                .status(200)
                .json({ message: "OTP sent to your registered phone number" });
        }
    }
    return res.status(400).json({ message: "Error with Request OTP" });
});
exports.RequestOTP = RequestOTP;
const GetCustomerProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    if (customer) {
        const profile = yield Customer_1.Customer.findById(customer._id);
        if (profile) {
            return res.status(200).json(profile);
        }
    }
    return res.status(400).json({ message: "Error with fetch profile" });
});
exports.GetCustomerProfile = GetCustomerProfile;
const UpdateCustomerProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    const profileInputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.EditCustomerInputs, req.body);
    const profileErrors = yield (0, class_validator_1.validate)(profileInputs, {
        validationError: { target: true },
    });
    if (profileErrors.length > 0) {
        return res.status(400).json(profileInputs);
    }
    const { address, firstName, lastName } = profileInputs;
    if (customer) {
        const profile = yield Customer_1.Customer.findById(customer._id);
        if (profile) {
            profile.firstName = firstName;
            profile.lastName = lastName;
            profile.address = address;
            const result = yield profile.save();
            return res.status(200).json(result);
        }
    }
});
exports.UpdateCustomerProfile = UpdateCustomerProfile;
//# sourceMappingURL=customer.controller.js.map