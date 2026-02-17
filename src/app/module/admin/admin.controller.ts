import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { adminService } from "./admin.service";
import status from "http-status";

const getAllAdmins = catchAsync(
  async ( req : Request, res : Response ) => {
    const result = await adminService.getAllAdmins();
    sendResponse(res, {
      httpStatusCode : status.OK,
      success : true,
      message : "Admins fetched successfully",
      data : result
    })
  }
)

const getAdminById = catchAsync(
  async ( req : Request, res : Response ) => {
    const adminId = req.params.id;
    const result = await adminService.getAdminById(adminId as string);
    sendResponse(res, {
      httpStatusCode : status.OK,
      success : true,
      message : "Admin fetched successfully",
      data : result
    })
  }
)

const updateAdmin = catchAsync(
  async ( req : Request, res : Response ) => {
    const adminId = req.params.id;
    const payload = req.body;
    const result = await adminService.updateAdmin(adminId as string, payload);
    sendResponse(res, {
      httpStatusCode : status.OK,
      success : true,
      message : "Admin updated successfully",
      data : result
    })
  }
)

const deleteAdmin = catchAsync(
  async ( req : Request, res : Response ) => {
    const adminId = req.params.id;
    const result = await adminService.deleteAdmin(adminId as string);
    sendResponse(res, {
      httpStatusCode : status.OK,
      success : true,
      message : "Admin deleted successfully",
      data : result
    })
  }
)

export const adminController = {
    getAllAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin
}
