import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { doctorService } from "./doctor.service";

const getAllDoctors = catchAsync(
  async ( req : Request, res : Response ) => {
    const result = await doctorService.getAllDoctors();
    sendResponse(res, {
      httpStatusCode : status.OK,
      success : true,
      message : "Doctors fetched successfully",
      data : result
    }
  )
  }
)

const getDoctorById = catchAsync(
  async ( req : Request, res : Response ) => {
    const doctorId = req.params.id;
    const result = await doctorService.getDoctorById(doctorId as string);
    sendResponse(res, {
      httpStatusCode : status.OK,
      success : true,
      message : "Doctor fetched successfully",
      data : result
    })
  }
)

export const doctorController = {
  getAllDoctors,
  getDoctorById
}