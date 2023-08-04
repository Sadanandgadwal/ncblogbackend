import {NextFunction, Request, Response} from 'express';
import isUserAuthenticated2 from '../utils/jwtValidate';

require('dotenv').config();

const accessPermissions: { [key: string]: string[] } = {
    '/list': ['user', 'admin'],
    '/user/profile': ['admin', 'writer'],
    '/test/test': ['admin', 'writer'],
    '/create': ['admin', 'writer'],
};

export const isUserAuthenticated = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    isUserAuthenticated2(req, res, next, accessPermissions);
};
