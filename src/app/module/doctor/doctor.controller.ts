import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { doctorService } from "./doctor.service";
import { IQueryParams } from "../../interfaces/query.interface";

const getAllDoctors = catchAsync(
  async ( req : Request, res : Response ) => {
    const query = req.query;
    const result = await doctorService.getAllDoctors(query as IQueryParams);
    sendResponse(res, {
      httpStatusCode : status.OK,
      success : true,
      message : "Doctors fetched successfully",
      data : result.data,
      meta : result.meta
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

const updateDoctor = catchAsync(
  async ( req : Request, res : Response ) => {
    const doctorId = req.params.id;
    const payload = req.body;
    const result = await doctorService.updateDoctor(doctorId as string, payload);
    sendResponse(res, {
      httpStatusCode : status.OK,
      success : true,
      message : "Doctor updated successfully",
      data : result
    })
  }
)


const deleteDoctor = catchAsync(
  async ( req : Request, res : Response ) => {
    const doctorId = req.params.id;
    const result = await doctorService.deleteDoctor(doctorId as string);
    sendResponse(res, {
      httpStatusCode : status.OK,
      success : true,
      message : "Doctor deleted successfully",
      data : result
    })
  }
)

export const doctorController = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor
}