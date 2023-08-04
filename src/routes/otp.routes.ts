import express from "express";
import { sendOtpByEmail } from "../controllers/otp.controllers";
import {verifyOtp} from '../controllers/otp.controllers';
const router = express.Router();


router.post("/sendOtp",sendOtpByEmail);//------------------------------
router.post("/verifyOtp",verifyOtp);//---------------------------------

export default router;