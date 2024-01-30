import mongoose, { Document, Schema } from "mongoose";

export interface OrderDoc extends Document {
  orderId: string; //123456
  vendorId: string;
  items: [any]; //[{food,unit:2}]
  totalAmount: number; //456
  paidAmount: number;
  orderDate: Date;
  orderStatus: string; // To determine the current status // Waiting // failed //ACCEPT//REJECT//UNDER-PROCESS//READY
  remarks: string;
  deliveryId: string;
  readyTime: number; // max 60 minutes (The food will be cold)
}

const OrderSchema = new Schema(
  {
    orderId: { type: String, require: true },
    vendorId: { type: String, require: true },
    items: [
      {
        food: { type: Schema.Types.ObjectId, ref: "food", require: true },
        unit: { type: Number, require: true },
      },
    ],
    totalAmount: { type: Number, require: true },
    paiedAmount: { type: Number, require: true },
    orderDate: { type: Date },
    orderStatus: { type: String },
    remarks: { type: String },
    deliveryId: { type: String },
    readyTime: { type: Number },
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
