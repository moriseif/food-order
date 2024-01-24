"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VandorRoute = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
exports.VandorRoute = router;
//* multer config
const imageStorage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "images");
    },
    filename: function (req, file, cb) {
        const timestamp = new Date()
            .toISOString()
            .replace(/:/g, "-")
            .replace(/\./g, "");
        cb(null, timestamp + "_" + file.originalname);
    },
});
const images = (0, multer_1.default)({ storage: imageStorage }).array("images", 10);
//* end multer config
router.post("/login", controllers_1.VandorLogin);
router.use(middlewares_1.Authenticate);
router.get("/profile", controllers_1.GetVendorProfile);
router.patch("/profile", controllers_1.UpdateVendorProfile);
router.patch("/coverimage", images, controllers_1.UpdateVandorCoverImage);
router.patch("/service", controllers_1.UpdateVendorService);
router.post("/food", images, controllers_1.AddFood);
router.get("/foods", controllers_1.GetFoods);
router.get("/", (req, res, next) => {
    res.json({ message: "hello from vandor" });
});
//# sourceMappingURL=vandor.routes.js.map