import resposnes from "../utils/responses";
import User from "../models/user.model";
import { Request, Response, response } from "express";
import bcrypt from "bcryptjs";
import { registerValidation } from "../validations/register.validation";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
const googleapis = require("googleapis");
import mongoose from "mongoose";
import UserRole from "../models/role_user.model";
import Role from "../models/role.model";
import otpSchemaModel from "../models/otp.model";
require("dotenv").config();

// const SECRET = "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";
// const CLIENT_ID =
//   "605640161392-f5as4fsp1ksppd7te9o5agel6hci6062.apps.googleusercontent.com";
const redirectUrl = "http://localhost:8080/api/auth/google/callback";

export const register = async (req: Request, res: Response) => {
  try {
    let validate = registerValidation(req.body);
    console.log(req.body);
    console.log(validate);
    let user = await User.findOne({
      $or: [
        {
          mobile: req.body.mobile,
        },
        {
          email: req.body.email,
        },
      ],
    });
    // console.log('=====================',user);
    const checkEmail = req.body.email;
    console.log("----------------", checkEmail);
    // const otpModel = await otpSchemaModel.findOne({ email:checkEmail });
    // console.log('otpModel',otpModel);
    // if(!otpModel){
    //   return resposnes.notFoundResponse(res, "Press on Send OTP to send email");
    // }
    // if (otpModel.verify===false) {
    //   return resposnes.verificationFailed(res, "Email not Verified");
    // }
    // // Check the verify field of the OTP model
    // const isVerified = otpModel.verify;
    if (user) {
      return resposnes.allreadyExistResponse(res, "User Allready Exist");
    }
    const salt = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(req.body.password, salt);
    req.body.password = hash_password;

    let new_user = await User.create(req.body);
    let role = await Role.findOne({ name: req.body.role_name });
    console.log(role);
    if (!new_user) {
      return resposnes.serverErrorResponse(res, "User cannot be created");
    }
    return resposnes.successfullyCreatedResponse(
      res,
      "User Created successfully"
    );
  } catch (error) {
    console.log(error);
    resposnes.serverErrorResponse(res);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    if (!req.body.email || !req.body.password) {
      return resposnes.badRequestResponse(res, {}, "Invalid Credentials..");
    }
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return resposnes.unauthorizedResponse(res, {}, "Invalid email id..");
    }
    let oldpassword: string = user.password as string;
    let matched = await bcrypt.compareSync(req.body.password, oldpassword);
    if (!matched) {
      return resposnes.unauthorizedResponse(
        res,
        { err: "Invalid Credetials.." },
        "Invalid Credentials .."
      );
    }
    // finding all associated roles with user
    let userRoles = await UserRole.find({ user_id: user._id });

    //find role ids
    let roles = userRoles.map((ur) => ur.role_id);

    //find role names using role ids
    let roleNames = await Role.find({ _id: { $in: roles } });

    let token = await generatejwt(user._id, roleNames);
    let { password, ...user_details } = user;
    return resposnes.successResponse(
      res,
      {
        ...user_details,
        token,
      },
      "Signin Successful"
    );
  } catch (error) {
    console.log(error);
    return resposnes.serverErrorResponse(res);
  }
};

const generatejwt = async (id: mongoose.Types.ObjectId, role_list: any) => {
  // const SECRET = "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";
  let token = await jwt.sign(
    { id: id, role_list: role_list },
    `${process.env.CLIENT_SECRET}`,
    {
      expiresIn: "30d",
    }
  );
  return token;
};

export const googleAuthUrl = async (req: Request, res: Response) => {
  try {
    const client = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      redirectUrl
    );
    const authorizeUrl = client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
    });
    return resposnes.successResponse(res, { authorizeUrl });
  } catch (e) {
    res.status(500).send({
      error: e,
    });
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const client = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      redirectUrl
    );
    const token = await client.getToken(req.query.code + "");
    const accessToken = token.tokens.access_token;

    // Google apis using googleapis library
    var google = googleapis.google;
    var OAuth2 = google.auth.OAuth2;
    var oauth2Client = new OAuth2();

    oauth2Client.setCredentials({ access_token: accessToken });
    var oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    // Getting user info like email, givenName etc...
    await oauth2.userinfo.get(async (err: any, resp: any) => {
      if (err) {
        res.status(500).send({
          error: err,
        });
      } else {
        let payload = resp.data;
        let user = await User.findOne({ email: payload?.email });
        if (!user) {
          const salt = await bcrypt.genSalt(10);
          const hash = payload?.sub || "abc";
          const hash_password = await bcrypt.hash(hash, salt);

          user = await User.create({
            name: payload?.family_name,
            password: hash_password,
            email: payload?.email,
          });
          if (!user) {
            return resposnes.serverErrorResponse(res, "User cannot be created");
          }
          let role = await Role.findOne({ name: "user" });
          if (!role) {
            return resposnes.serverErrorResponse(res, "Invalid Role !");
          }
          await UserRole.create({
            user_id: user.id,
            role_id: role.id,
          });
        }

        console.log("before user role find: ", user._id);
        let userRoles = await UserRole.find({ user_id: user._id });
        let roleNames;
        if (userRoles) {
          //find role ids
          let roles = userRoles.map((ur) => ur.role_id);
          //find role names using role ids
          roleNames = await Role.find({ _id: { $in: roles } });
        }
        let token = await generatejwt(user._id, roleNames);
        let { password, ...user_details } = user;
        return resposnes.successResponse(
          res,
          {
            ...user_details,
            token,
          },
          "Signin Successful"
        );
      }
    });
  } catch (e) {
    res.status(500).send({
      error: e,
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const filter = { email };
    //check
    const user = await User.findOne(filter);
    //validation
    if (!user) {
      return resposnes.notFoundResponse(res, "email not registered");
      //return resposnes.unauthorizedResponse(res, {}, "Invalid email id..");
    }
    const salt = await bcrypt.genSalt(10);
    const hash_password = await bcrypt.hash(req.body.newPassword, salt);
    // update into User where email=
    await User.updateOne(filter, { password: hash_password });
    return resposnes.successfullyChangedResponse(res, user);
  } catch (error) {
    console.log(error);
    return resposnes.serverErrorResponse(res);
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    // Find the user by their ID
    const user = await User.findById(userId);

    if (!user) {
      return resposnes.badRequestResponse(res, { err: "User not found" });
    }

    // Verify the current password
    let oldPassword: string = user.password as string;
    const isPasswordValid = await bcrypt.compare(currentPassword, oldPassword);
    // console.log("is same",isPasswordValid);
    if (!isPasswordValid) {
      return resposnes.badRequestResponse(res, {
        err: "Current password is incorrect",
      });
    }

    // Generate a new salt and hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    user.password = hashPassword;
    await user.save();

    return resposnes.successfullyUpdatedResponse(
      res,
      "Password updated successfully"
    );
  } catch (error) {
    console.log(error);
    return resposnes.serverErrorResponse(res);
  }
};
