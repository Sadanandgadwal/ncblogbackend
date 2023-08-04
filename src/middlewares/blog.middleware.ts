import {NextFunction, Request, Response} from "express";
import isUserAuthenticated from "../utils/jwtValidate";

require('dotenv').config();

const accessPermissions: { [key: string]: string[] } = {
    '/create': ['*'],
    '/list': ['*'],
    // '/read/all': ['*'],
    '/:id': ["*"]
};

export const isBlogAuthenticated = (req: Request, res: Response, next: NextFunction) => {

    isUserAuthenticated(req, res, next, accessPermissions);
};