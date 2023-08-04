import express from "express";

import * as controllers from "../controllers/role.controller";
import { isUserAuthenticated } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

router.get("/get", controllers.get);

router.post("/create", controllers.create);

// Add role to user
router.post("/create/user/role", controllers.addRoleToUser);

// router.get("/:id", controllers.getSingleRole);

export default router;
