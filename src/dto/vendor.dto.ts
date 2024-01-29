export interface CreateVendorInput {
  name: string;
  ownerName: string;
  foodType: [string];
  pincode: string;
  address: string;
  phone: string;
  email: string;
  password: string;
}

export interface EditVendorInput {
  name: string;
  address: string;
  phone: string;
  foodTypes: [string];
}

export interface VendorLoginInput {
  email: string;
  password: string;
}

export interface VendorPayload {
  _id: string;
  email: string;
  name: string;
  foodTypes: [string];
}

export interface CreateOfferInputs {
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
