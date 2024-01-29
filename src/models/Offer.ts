import mongoose, { Document, Schema } from "mongoose";

export interface OfferDoc extends Document {
  offerType: string; //? VENDOR | GENERIC
  vendors: [any]; //? [VendorId]
  title: string;
  description: string;
  minValue: number; //? Minimum order amount for offer validity
  offerAmount: number;
  startValidity: Date;
  endValidity: Date;
  promocode: string;
  promoType: string; //? USER | ALL | BANK | CARD
  bank: [any];
  bins: [any];
  pincode: string; //? Available for specific area only
  isActive: boolean;
}

const OfferSchema = new Schema(
  {
    offerType: { type: String, require: true },
    vendors: [
      {
        type: Schema.Types.ObjectId,
        ref: "vendor",
      },
    ],
    title: { type: String, require: true },
    description: { type: String },
    minValue: { type: Number, require: true },
    offerAmount: { type: Number, require: true },
    startValidity: Date,
    endValidity: Date,
    promocode: { type: String, require: true },
    promoType: { type: String, require: true },
    bank: [{ type: String }],
    bins: [
      {
        type: Number,
      },
    ],
    pincode: { type: String, require: true },
    isActive: Boolean,
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

const Offer = mongoose.model<OfferDoc>("offer", OfferSchema);

export { Offer };
