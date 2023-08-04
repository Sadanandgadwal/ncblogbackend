import Role from "../models/role.model";
import { Request, Response } from "express";
import responses from "../utils/responses";
import UserRole from "../models/role_user.model";

export const get = async (req: Request, res: Response) => {
  try {
    let roles = await Role.find();
    if (!roles) {
      return responses.notFoundResponse(res);
    }
    return responses.successResponse(res, roles);
  } catch (error) {
    console.log(error);
    return responses.serverErrorResponse(res);
  }
};
export const create = async (req: Request, res: Response) => {
  let newRole = await Role.create(req.body);
  res.send(newRole);
  console.log(newRole);
};

export const addRoleToUser = async (req: Request, res: Response) => {
  let newRoleUser = await UserRole.create(req.body);
  res.send(newRoleUser);
  console.log(newRoleUser);
};
