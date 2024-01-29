import express, { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import {
  CartItem,
  CreateCustomerInputs,
  CustomerLoginInputs,
  EditCustomerInputs,
  OrderInputs,
} from "../dto/Customer.dto";
import { validate } from "class-validator";
import {
  GenerateOTP,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
  onRequestOTP,
} from "../utility";
import { Customer } from "../models/Customer";
import { Food } from "../models/Food";
import { Order } from "../models/Order";
import { Offer, Transaction } from "../models";

export const CustomerSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customerInputs = plainToClass(CreateCustomerInputs, req.body);

  const inputErrors = await validate(customerInputs, {
    validationError: { target: true },
  });

  if (inputErrors.length > 0) {
    return res.status(400).json(inputErrors);
  }

  const { email, phone, password } = customerInputs;

  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  const { otp, expiry } = GenerateOTP();

  const existCustomer = await Customer.findOne({ email });
  if (existCustomer !== null) {
    return res
      .status(409)
      .json({ message: "An user exist with the provided email" });
  }

  const result = await Customer.create({
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
    orders: [],
  });

  if (result) {
    // send OTP to customer
    await onRequestOTP(otp, phone);

    // generate signature
    const signature = GenerateSignature({
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
};

export const CustomerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const LoginInputs = plainToClass(CustomerLoginInputs, req.body);
  const loginErrors = await validate(LoginInputs, {
    validationError: { target: false },
  });

  if (loginErrors.length > 0) {
    return res.status(400).json(loginErrors);
  }

  const { email, password } = LoginInputs;
  const customer = await Customer.findOne({ email });

  if (customer) {
    const validation = await ValidatePassword(
      password,
      customer.password,
      customer.salt
    );
    if (validation) {
      // generate the signature
      const signature = GenerateSignature({
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
};

export const CustomerVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { otp } = req.body;
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);
    if (profile) {
      if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
        profile.verified = true;
        const updatedCustomerResponse = await profile.save();

        // generate the new signature bcaz of change verified value
        const signature = GenerateSignature({
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
};

export const RequestOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id);
    if (profile) {
      const { otp, expiry } = GenerateOTP();
      profile.otp = otp;
      profile.otp_expiry = expiry;

      await profile.save();
      await onRequestOTP(otp, profile.phone);

      return res
        .status(200)
        .json({ message: "OTP sent to your registered phone number" });
    }
  }
  return res.status(400).json({ message: "Error with Request OTP" });
};

export const GetCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);
    if (profile) {
      return res.status(200).json(profile);
    }
  }
  return res.status(400).json({ message: "Error with fetch profile" });
};

export const UpdateCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  const profileInputs = plainToClass(EditCustomerInputs, req.body);
  const profileErrors = await validate(profileInputs, {
    validationError: { target: true },
  });

  if (profileErrors.length > 0) {
    return res.status(400).json(profileInputs);
  }

  const { address, firstName, lastName } = profileInputs;

  if (customer) {
    const profile = await Customer.findById(customer._id);
    if (profile) {
      profile.firstName = firstName;
      profile.lastName = lastName;
      profile.address = address;

      const result = await profile.save();
      return res.status(200).json(result);
    }
  }
};

//? Cart Controllers

export const AddToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id).populate("cart.food");
    let cartItems = Array();

    const { _id, unit } = <CartItem>req.body;
    const food = await Food.findById(_id);

    if (food) {
      if (profile !== null) {
        //* Check for cart items
        cartItems = profile.cart;
        if (cartItems.length > 0) {
          //* Check and update unit
          let existFoodItem = cartItems.filter(
            (item) => item.food._id.toString() === _id
          );

          if (existFoodItem.length > 0) {
            const index = cartItems.indexOf(existFoodItem[0]);
            if (unit > 0) {
              cartItems[index] = { food, unit };
            } else {
              cartItems.splice(index, 1);
            }
          }
        } else {
          //* add new item to cart
          cartItems.push({ food, unit });
        }
        if (cartItems) {
          profile.cart = cartItems as any;
          const cartResult = await profile.save();
          return res.status(200).json(cartResult.cart);
        }
      }
    }
  }
  return res.status(400).json({ message: "Unable to create Cart!" });
};

export const GetCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id).populate("cart.food");
    if (profile) {
      return res.status(200).json(profile.cart);
    }
  }
  return res.status(400).json({ message: "cart is empty" });
};
export const DeleteCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id).populate("cart.food");
    if (profile != null) {
      profile.cart = [] as any;
      const cartResult = await profile.save();
      return res.status(200).json(cartResult);
    }
  }
  return res.status(400).json({ message: "cart is already empty!" });
};

//? ORDER Controllers
export const CreateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // grab current login customer
  const customer = req.user;
  const { amount, tnxId, items } = <OrderInputs>req.body; //  [{id:xx,unit:yy}]

  if (customer) {
    // create an order
    const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;
    const profile = await Customer.findById(customer._id);
    // grab order items from the request [{id:xx,unit:yy}]
    let cartItems = Array();
    let netAmount = 0.0;

    let vendorId;
    // calculate order amount
    const foods = await Food.find()
      .where("_id")
      .in(items.map((item) => item._id))
      .exec();

    foods.map((food) => {
      items.map(({ _id, unit }) => {
        if (food._id === _id) {
          vendorId = food.vendorId;
          netAmount += food.price * unit;
          cartItems.push({ food, unit });
        }
      });
    });
    // create order with item description
    if (cartItems) {
      // create order
      const currentOrder = await Order.create({
        orderId,
        vendorId,
        items: cartItems,
        totalAmount: netAmount,
        orderDate: new Date(),
        paidThrough: "COD",
        paymentResponse: "",
        orderStatus: "waiting",
        remarks: "",
        deliveryId: "",
        appliedOffers: false,
        offerId: null,
        readyTime: 45,
      });
      // finally update orders to customer account
      if (currentOrder) {
        profile.cart = [] as any;
        profile.orders.push(currentOrder);
        const profileResponse = await profile.save();
        return res.status(200).json(profileResponse);
      }
    }
  }
  return res.status(400).json({ message: "Error with create order" });
};

export const GetOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;
  if (customer) {
    const profile = await Customer.findById(customer._id).populate("orders");
    if (profile) {
      return res.status(200).json(profile.orders);
    }
  }
  return res.status(400).json({ message: "You don't Authorized" });
};

export const GetOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderId = req.params.id;
  if (orderId) {
    const order = await Order.findById(orderId).populate("items.food");
    res.status(200).json(order);
  }
};

export const VerifyOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const offerId = req.params.id;
  const customer = req.user;

  if (customer) {
    const appliedOffer = await Offer.findById(offerId);
    if (appliedOffer) {
      if (appliedOffer.promoType === "USER") {
        //* Only can apply once per user
      } else {
        if (appliedOffer.isActive) {
          return res
            .status(200)
            .json({ message: "Offer is valid", offer: appliedOffer });
        }
      }
    }
  }
  return res.status(400).json({ message: "Offer is not valid!" });
};

export const CreatePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  const { amount, paymentMode, offerId } = req.body;
  let payableAmount = Number(amount);

  if (offerId) {
    const appliedOffer = await Offer.findById(offerId);

    if (appliedOffer) {
      if (appliedOffer.isActive) {
        payableAmount = payableAmount - appliedOffer.offerAmount;
      }
    }
  }

  //* Perform Payment Gateway Charge API call

  //* Create record on transaction
  const transaction = await Transaction.create({
    customer: customer._id,
    vendorId: "",
    orderId: "",
    orderValue: payableAmount,
    offerUsed: offerId || "NA",
    status: "OPEN", //? OPEN | FAILED | SUCCESS
    paymentMode,
    paymentResponse: "Payment is Cash on Delivery",
  });

  //* Return transaction ID
  return res.status(200).json(transaction);
};
