import express from "express";
import { createServiceAppointment, confirmServicePayment, getServiceAppointments, getServiceAppointmentById, updateServiceAppointment, cancelServiceAppointment, getServiceAppointmentStats, getServiceAppointmentByPatient } from "../controllers/serviceAppointmentController.js";

const serviceAppointmentRouter = express.Router();

serviceAppointmentRouter.get("/", getServiceAppointments);
serviceAppointmentRouter.get("/confirm", confirmServicePayment);
serviceAppointmentRouter.get("/stats/summary", getServiceAppointmentStats);

serviceAppointmentRouter.post("/", createServiceAppointment);

serviceAppointmentRouter.get("/me", getServiceAppointmentByPatient);

serviceAppointmentRouter.get("/:id", getServiceAppointmentById);
serviceAppointmentRouter.put("/:id", updateServiceAppointment);
serviceAppointmentRouter.delete("/:id", cancelServiceAppointment);

export default serviceAppointmentRouter;