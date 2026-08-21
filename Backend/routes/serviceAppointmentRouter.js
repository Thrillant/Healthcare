import express from "express";
import { clerkMiddleware, getAuth } from "@clerk/express";
import { createServiceAppointment, confirmServicePayment, getServiceAppointments, getServiceAppointmentById, updateServiceAppointment, cancelServiceAppointment, getServiceAppointmentStats, getServiceAppointmentByPatient } from "../controllers/serviceAppointmentController.js";

const serviceAppointmentRouter = express.Router();

serviceAppointmentRouter.get("/", getServiceAppointments);
serviceAppointmentRouter.get("/confirm", confirmServicePayment);
serviceAppointmentRouter.get("/stats/summary", getServiceAppointmentStats);

serviceAppointmentRouter.post("/", clerkMiddleware(), getAuth, createServiceAppointment);

serviceAppointmentRouter.get("/me", clerkMiddleware(), getAuth, getServiceAppointmentByPatient);

serviceAppointmentRouter.get("/:id", getServiceAppointmentById);
serviceAppointmentRouter.put("/:id", updateServiceAppointment);
serviceAppointmentRouter.delete("/:id", cancelServiceAppointment);

export default serviceAppointmentRouter;