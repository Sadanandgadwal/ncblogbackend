import responses from "./responses";
import jwt from "jsonwebtoken";
import {NextFunction, Request, Response} from "express";
import User from "../models/user.model";

interface Role {
    name: string;
    // Other properties of the Role interface, if any
}

let accessPermissionsGlobal: { [key: string]: string[] };

const isUserAuthenticated = (req: Request, res: Response, next: NextFunction, accessPermissions: { [key: string]: string[] }) => {
    accessPermissionsGlobal = accessPermissions;
    try {
        let token: any = req.headers.token;
        let requestedRoute = req.path;
        if (!token) {
            return responses.unauthorizedResponse(res, 'Unauthorized');
        }

        const decoded = jwt.verify(token, `${process.env.CLIENT_SECRET}`);
        console.log('decoded', decoded);

        const id = (<any>decoded).id;
        const role_list: Role[] = (<any>decoded).role_list;
        const roleNames = role_list.map((role) => role.name);

        console.log("requestedRoute1: ", requestedRoute, getAccessPermissions(requestedRoute).filter((r) => roleNames.includes(r) || r === "*")
            .length);

        console.log('requestedRoute2: ', requestedRoute, roleNames, accessPermissions[requestedRoute]);
        if (
            getAccessPermissions(requestedRoute).filter((r) => roleNames.includes(r) || r === "*")
                .length === 0
        ) {
            console.log("Forbidden");

            return responses.unauthorizedResponse(res, null, 'Forbidden')
        }

        User.findById(id, (err: any, user: Express.User | undefined) => {
            if (err) {
                return responses.serverErrorResponse(res, 'Server Error');
            }
            if (!user) {
                return responses.unauthorizedResponse(res, 'Unauthorized');
            }
            req.user = user;
        });
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();

    } catch (error) {

        console.log(error);

        return responses.serverErrorResponse(res, 'Server Error');
    }
}

function getAccessPermissions(path: string): string[] {
    const exactMatch = accessPermissionsGlobal[path];
    if (exactMatch) {
        return exactMatch;
    }

    const wildcardPaths = Object.keys(accessPermissionsGlobal).filter(key => key.includes(':'));
    const matchedPermissions = [];

    for (const wildcardPath of wildcardPaths) {
        const regex = new RegExp('^' + wildcardPath.replace(/:[^/]+/g, '[^/]+') + '$');
        if (regex.test(path)) {
            matchedPermissions.push(...accessPermissionsGlobal[wildcardPath]);
        }
    }

    return matchedPermissions;
}

export default isUserAuthenticated;