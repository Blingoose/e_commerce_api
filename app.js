import http from "http";
import { fileURLToPath } from "url";
import express from "express";
import connectDB from "./db/connectDB.js";
import errorHandlerMiddleware from "./middleware/error-handler-middleware.js";
import notFoundRoute from "./middleware/not-found-middleware.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import productRouter from "./routes/productRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { rateLimit } from "express-rate-limit";
import xss from "xss-clean";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import helmet from "helmet";
import crypto from "crypto";
// import morgan from "morgan";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const server = express();
server.set("trust proxy", 1);

// ----- security middlewares -----
server.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);

// Generate nonce value
const addNonce = (req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString("base64");
  next();
};
server.use(addNonce);

//using Content-Security-Policy header to mitigate cross-site scripting (XSS) attacks.
server.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
        styleSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
      },
    },
  })
);
server.use(cors());
server.use(xss());
server.use(mongoSanitize());

// ----- application specific middleware -----
// server.use(morgan("tiny"));  //// for testing
server.use(express.json());
server.use(fileUpload({ useTempFiles: true }));
server.use(cookieParser(process.env.JWT_SECRET));

// home page
server.use("/api/v1", express.static(__dirname + "/public"));

//base route
const baseRoute = "/api/v1";

// ----- routes -----
server.use(baseRoute + "/auth", authRouter);
server.use(baseRoute + "/users", userRouter);
server.use(baseRoute + "/products", productRouter);
server.use(baseRoute + "/reviews", reviewRouter);
server.use(baseRoute + "/orders", orderRouter);

// ----- error handler & not found middleware -----
server.use(notFoundRoute);
server.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 8000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    http.createServer(server).listen(PORT, function () {
      console.info("Server is running on:", this.address());
    });
  } catch (error) {
    console.log(error);
  }
};

start();
