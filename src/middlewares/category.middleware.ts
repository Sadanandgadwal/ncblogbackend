import {NextFunction, Request, Response} from "express";
import isUserAuthenticated from "../utils/jwtValidate";

require('dotenv').config();

const accessPermissions: { [key: string]: string[] } = {
    '/create': ['user', 'admin', 'writer'],
    // '/list': ['*'],
    '/:id': ["*"]
};

export const isCategoryAuthenticated = (req: Request, res: Response, next: NextFunction) => {

    isUserAuthenticated(req, res, next, accessPermissions);
};