import express from "express";
import orderControllers from "../controllers/orderController.js";
import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/authentication-middleware.js";

const orderRouter = express.Router();

orderRouter
  .route("/")
  .get(
    authenticateUser,
    authorizePermissions("admin", "owner"),
    orderControllers.getAllOrders
  )
  .post(authenticateUser, orderControllers.createOrder);

orderRouter
  .route("/showAllMyOrders")
  .get(authenticateUser, orderControllers.getCurrentUserOrders);

orderRouter
  .route("/:id")
  .get(authenticateUser, orderControllers.getSingleOrder)
  .patch(authenticateUser, orderControllers.updateOrder);

export default orderRouter;
