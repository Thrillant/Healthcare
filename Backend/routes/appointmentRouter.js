import express from 'express';
import { getAppointments, getAppointmentByPatient, createAppointment, confirmPayment, updateAppointment, cancelAppointment, getStats, getAppointmentByDoctor, getRegisteredUSerCount } from '../controllers/appointmentController.js';

const appointmentRouter = express.Router();

appointmentRouter.get("/", getAppointments);
appointmentRouter.get("/confirm", confirmPayment);
appointmentRouter.get("/stats/summary", getStats);

// Authentication Routes
appointmentRouter.post("/", createAppointment);
appointmentRouter.get("/me", getAppointmentByPatient);

appointmentRouter.get("/doctor/:doctorId", getAppointmentByDoctor);

appointmentRouter.delete("/:id/cancel", cancelAppointment);
appointmentRouter.get("/patients/count", getRegisteredUSerCount);
appointmentRouter.put("/:id", updateAppointment);

export default appointmentRouter;
