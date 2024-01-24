"use strict";
// Email
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
exports.onRequestOTP = exports.GenerateOTP = void 0;
// Notification
// OTP
const GenerateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    let expiry = new Date();
    expiry.setTime(new Date().getTime() + 30 * 60 * 1000);
    return { otp, expiry };
};
exports.GenerateOTP = GenerateOTP;
const onRequestOTP = (otp, toPhoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const accountSID = "AC672dd39d05f4194e36f82e22b2ca770b";
    const authToken = "405b05ee7b2a75ed3612586557f471a8";
    const client = require("twilio")(accountSID, authToken);
    const response = yield client.messages.create({
        body: `Your OTP is ${otp}`,
        from: "+15005550006",
        to: `+98${toPhoneNumber}`,
    });
    return response;
});
exports.onRequestOTP = onRequestOTP;
// Payment Notification or Emails
//# sourceMappingURL=NotificationUtility.js.map