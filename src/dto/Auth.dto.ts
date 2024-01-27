import { VendorPayload } from "./vendor.dto";
import { CustomerPayload } from "./Customer.dto";

export type AuthPayload = VendorPayload | CustomerPayload;
