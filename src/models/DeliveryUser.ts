import mongoose, { Document, Model, Schema } from "mongoose";

interface DeliveryUserDoc extends Document {
  email: string;
  password: string;
  salt: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  pincode: string;
  verified: boolean;
  lat: number;
  lng: number;
  isAvailable: boolean;
}

const DeliveryUserSchema = new Schema(
  {
    email: { type: String, require: true },
    password: { type: String, require: true },
    salt: { type: String, require: true },
    firstName: { type: String },
    lastName: { type: String },
    address: { type: String },
    pincode: { type: String },
    phone: { type: String, require: true },
    verified: { type: Boolean, require: true },
    lat: { type: Number },
    lng: { type: Number },
    isAvailable: Boolean,
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.salt;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
  }
);

const DeliveryUser = mongoose.model<DeliveryUserDoc>(
  "delivery_user",
  DeliveryUserSchema
);

export { DeliveryUser };
