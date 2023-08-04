import express, { Request, Response } from "express";
// import module from 'module';

const successResponse = (
  res: Response,
  data: Object | null,
  msg = "Success"
) => {
  res.status(200).json({
    data: data,
    msg: msg,
  });
};

const successfullyCreatedResponse = (
  res: Response,
  data: Object,
  msg = "Record created successfully."
) => {
  res.status(201).json({
    data: data,
    message: msg,
  });
};
const successfullyUpdatedResponse= (
  res: Response,
  data: Object,
  msg = "Update Sucessfully."
) => {
  res.status(201).json({
    data: data,
    message: msg,
  });
};

const badRequestResponse = (
  res: Response,
  error: Object | any | undefined,
  msg = "Validation error"
) => {
  res.status(400).json({
    error: error,
    message: msg,
    
  });
};

const unauthorizedResponse = (
  res: Response,
  error: Object | any | undefined,
  msg = "Unauthorized"
) => {
  res.status(401).json({ message: msg });
};
const notFoundResponse = (res: Response, msg = "Route Not Found") => {
  res.status(404).json({ message: msg });
};

const serverErrorResponse = (res: Response, msg = "Server Error") => {
  res.status(500).json({ message: msg });
};

const successfullyChangedResponse = (
  res: Response,
  data: Object,
  msg = "Password changed successfully."  
) => {
  res.status(201).json({ 
    data: data,
    message: msg,
  });
}; 
const allreadyExistResponse = (
  res: Response,
  data: Object,
  msg = "Allready Exist"
) => {
  res.status(208).json({
    data: data,
    message: msg,
  });
};
const verificationFailed=(
  res:Response,
  msg="verification failed"
) => {
  res.status(400).json({
    message: msg,
  });
};
const resposnes = {
  successResponse,
  verificationFailed,
  successfullyCreatedResponse,
  successfullyUpdatedResponse,
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
  unauthorizedResponse,
  allreadyExistResponse,
  successfullyChangedResponse,
};

export default resposnes;
