import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { ScheduleService } from "./schedule.service";

const createSchedule = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const schedule = await ScheduleService.createSchedule(payload);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.CREATED,
        message: 'Schedule created successfully',
        data: schedule
    });
});

const getAllSchedules = catchAsync(async (req: Request, res: Response) => {
    const schedules = await ScheduleService.getAllSchedules(req.query);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Schedules fetched successfully',
        data: schedules
    });
});

const getScheduleById = catchAsync(async (req: Request, res: Response) => {
    const scheduleId = req.params.id;
    const schedule = await ScheduleService.getScheduleById(scheduleId as string);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Schedule fetched successfully',
        data: schedule
    });
});

const updateSchedule = catchAsync(async (req: Request, res: Response) => {
    const scheduleId = req.params.id;
    const payload = req.body;
    const updatedSchedule = await ScheduleService.updateSchedule(scheduleId as string, payload);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Schedule updated successfully',
        data: updatedSchedule
    });
});

const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
    const scheduleId = req.params.id;
    await ScheduleService.deleteSchedule(scheduleId as string);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Schedule deleted successfully'
    });
});

export const ScheduleController = {
    createSchedule,
    getAllSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule
}