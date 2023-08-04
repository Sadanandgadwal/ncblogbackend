import express, { Request, Response } from "express";
import * as controllers from "../controllers/auth.controller";

const router = express.Router();

router.post("/register",controllers.register);//------------------------------executed

router.post("/login", controllers.login);

// router.post('/google', controllers.google);

router.get("/google/url", controllers.googleAuthUrl);

router.get("/google/callback", controllers.googleCallback);
router.post("/forgotPassword", controllers.forgotPassword);
router.post("/updatePassword", controllers.updatePassword);//-------------------executed


export default router;
