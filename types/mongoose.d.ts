// mongoose.d.ts

import * as mongoose from "mongoose";

declare module "mongoose" {
  interface ConnectOptions {
    useNewUrlParser?: boolean;
    useUnifiedTopology?: boolean;
    useCreateIndex?: boolean;
    // Add any other options you need here
  }
}
