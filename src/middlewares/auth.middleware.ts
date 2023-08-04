import { NextFunction, Request, Response } from "express";

const responses = require("../utils/responses");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

export const isUserAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    try {
        let token = req.headers.token;

        if (!token) {
            return responses.unauthorizedResponse(res, "Unauthorized");
        }

        jwt.verify(token, process.env.JWT_SECRET, (err: any, decoded: { id: any; }) => {

            if (err) {
                return responses.unauthorizedResponse(res, "Unauthorized");
            }

            User.findById(decoded.id, (err: any, user: Express.User | undefined) => {
                if (err) {
                    return responses.serverErrorResponse(res, err, "Server Error");
                }
                if (!user) {
                    return responses.unauthorizedResponse(res, "Unauthorized");
                }
                req.user = user;
                next();
            });
        });
    } catch (error) {
        return responses.serverErrorResponse(res, error, "Server Error");
    }
};