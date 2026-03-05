/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { SpecialtyService } from "./specialty.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createSpecialty = catchAsync(
  async (req : Request, res : Response) => {
    const payload = {
      ...req.body,
      icon : req.file?.path
    };
    console.log('req.body',payload);

    const result = await SpecialtyService.createSpecialty(payload);
    sendResponse(res, {
      httpStatusCode : 201,
      success : true,
      message : "Specialty created successfully.",
      data : result
    })
  }
) 


const getSpecialties = catchAsync(
  async (req : Request , res : Response ) => {
    const result = await SpecialtyService.getSpecialties();
    sendResponse(res, {
      httpStatusCode : 201,
      success : true,
      message : "Specialty fetched successfully.",
      data : result
    })
  }
)

const deleteSpecialty = catchAsync ( 
  async ( req : Request , res : Response) => {
    const specialltyId = req.params.id;
    const result = await SpecialtyService.deleteSpecialty(specialltyId as string);
    sendResponse(res, {
      httpStatusCode : 201,
      success : true,
      message : "Specialty deleted successfully.",
      data : result
    })
  }
)


export const specialtyController = {
  createSpecialty,
  getSpecialties,
  deleteSpecialty
}