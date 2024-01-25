import mongoose, { Document, Schema } from "mongoose";

export interface OrderDoc extends Document {
  orderId: string; //123456
  items: [any]; //[{food,unit:2}]
  totalAmount: number; //456
  orderDate: Date;
  paidThrough: string; //COD,CreditCard,Wallet
  paymentResponse: string; //{status:true,response:some banking response}
  orderStatus: string;
}

const OrderSchema = new Schema(
  {
    orderId: { type: String, required: true },
    items: [
      {
        food: { type: Schema.Types.ObjectId, ref: "food", required: true },
        unit: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    orderDate: { type: Date },
    paidThrough: { type: String },
    paymentResponse: { type: String },
    orderStatus: { type: String },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
    timestamps: true,
  }
);

const Order = mongoose.model<OrderDoc>("order", OrderSchema);

export { Order };
