// Email

// Notification

// OTP
export const GenerateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  let expiry = new Date();

  expiry.setTime(new Date().getTime() + 30 * 60 * 1000);

  return { otp, expiry };
};

export const onRequestOTP = async (otp: number, toPhoneNumber: string) => {
  const accountSID = "AC672dd39d05f4194e36f82e22b2ca770b";
  const authToken = "405b05ee7b2a75ed3612586557f471a8";
  const client = require("twilio")(accountSID, authToken);

  const response = await client.messages.create({
    body: `Your OTP is ${otp}`,
    from: "+15005550006",
    to: `+98${toPhoneNumber}`,
  });

  return response;
};

// Payment Notification or Emails
