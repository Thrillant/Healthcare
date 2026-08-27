<h1 align="center">🏥 Healthcare</h1>

<p align="center">
  A full-stack Hospital Management System — book doctors and diagnostic services online, pay by cash or card, and manage the whole hospital from a dedicated admin panel.
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" />
  <img alt="Stripe" src="https://img.shields.io/badge/Stripe-Checkout-635BFF?logo=stripe&logoColor=white" />
  <img alt="Clerk" src="https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk&logoColor=white" />
</p>

---

## 📖 Overview

**Healthcare** is a MERN-stack hospital management platform built as three independent applications that share a single REST API:

| App | Who it's for | What it does |
| --- | --- | --- |
| **Frontend** | Patients & Doctors | Browse doctors and services, book and pay for appointments, and (for doctors) manage a personal dashboard |
| **Admin** | Hospital staff | Add/edit doctors and services, track every appointment, and view booking & revenue analytics |
| **Backend** | — | Express + MongoDB REST API handling doctors, services, appointments, payments and image uploads |

Patients sign in with **Clerk**, doctors sign in with their own **JWT-based** credentials, and online payments run through **Stripe Checkout**. Doctor and service images are stored on **Cloudinary**.

---

## ✨ Features

### 👤 Patient Portal (`Frontend`)
- Landing page with hero banner, featured doctors, certifications and testimonials
- Browse and search doctors by name and specialisation
- Doctor detail pages with qualifications, experience, fees, ratings and live availability
- Browse diagnostic/medical services with pricing, preparation instructions and available slots
- Date + time-slot booking for both **doctor appointments** and **service appointments**
- Two payment modes — **Cash at hospital** or **Online (Stripe Checkout)** with post-payment confirmation
- "My Appointments" view to track, reschedule or cancel bookings
- Clerk-powered sign-in / sign-up
- Contact page, scroll-to-top control and a fully responsive Tailwind UI

### 🩺 Doctor Dashboard (`Frontend` → `/doctor-admin`)
- Separate email + password login issuing a signed JWT
- Personal dashboard with appointment counts and earnings summary
- Appointment list with status updates (Pending → Confirmed → Completed / Canceled / Rescheduled)
- Profile editor — photo, about, fees, qualifications, location and per-date time slots
- One-click **Available / Unavailable** toggle

### 🛠️ Admin Panel (`admin`)
- Clerk-protected routes (`RequireAuth`) around every management screen
- **Doctors:** add, list, edit and delete doctors with image upload and slot scheduling
- **Services:** add, list, edit and delete services with pricing, dates, slots and instructions
- **Appointments:** full appointment tables for both doctor and service bookings, with status and payment state
- **Dashboards:** summary stats for bookings, revenue, completed vs. cancelled, and registered patient count

---

## 🧰 Tech Stack

**Frontend & Admin** — React 19 · Vite 8 · React Router 7 · Tailwind CSS 4 · Axios · Lucide Icons · React Hot Toast / React Toastify · Clerk React

**Backend** — Node.js · Express 5 · MongoDB + Mongoose 9 · Clerk Express · JSON Web Token · Stripe · Cloudinary · Multer · Validator · CORS · dotenv

---

## 📂 Project Structure

```
Healthcare/
├── Backend/                  # Express REST API
│   ├── config/db.js          # MongoDB connection
│   ├── controllers/          # doctor, service, appointment, serviceAppointment logic
│   ├── middlewares/          # doctorAuth (JWT), multer (image uploads)
│   ├── models/               # Doctor, Service, Appointment, ServiceAppointment schemas
│   ├── routes/               # /api/doctors, /api/services, /api/appointments, /api/service-appointments
│   ├── utils/cloudinary.js   # image upload & delete helpers
│   └── server.js             # app entry point (port 3000)
│
├── Frontend/                 # Patient + Doctor React app (port 5173)
│   └── src/
│       ├── pages/            # Home, Doctors, DoctorDetail, Service, ServiceDetail, Appointments, Contact, Login, DHome
│       ├── components/       # Navbar, Banner, Footer, Testimonial, page bodies
│       ├── doctor/           # Doctor dashboard, appointment list, profile editor
│       └── assets/           # images + shared style tokens
│
└── admin/                    # Admin React app (port 5174)
    └── src/
        ├── pages/            # Hero, Home, Add, List, Appointment, ServiceDashboard, AddService, ListService
        └── components/       # dashboard, table and form bodies
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18 or newer, and npm
- A **MongoDB** database (local or MongoDB Atlas)
- Accounts for **Clerk**, **Cloudinary** and **Stripe** (test mode is fine)

### 1. Clone the repository

```bash
git clone https://github.com/Thrillant/Healthcare.git
```

### 2. Backend setup

```bash
cd Backend && npm install
```

Create a `.env` file inside `Backend/`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_long_random_string

CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxx

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

STRIPE_SECRET_KEY=sk_test_xxxxxxxx

FRONTEND_URL=http://localhost:5173
MAJOR_ADMIN_ID=optional_default_owner_id
```

Start the API:

```bash
npm start
```

The server runs at **http://localhost:3000**.

### 3. Frontend setup

```bash
cd Frontend && npm install
```

Create a `.env` file inside `Frontend/`:

```env
VITE_API_BASE=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxx
```

```bash
npm run dev
```

Opens at **http://localhost:5173**.

### 4. Admin panel setup

```bash
cd admin && npm install
```

Create a `.env` file inside `admin/`:

```env
VITE_API_BASE=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxx
```

```bash
npm run dev -- --port 5174
```

Opens at **http://localhost:5174**.

> ⚠️ The API's CORS allow-list accepts only `http://localhost:5173` and `http://localhost:5174`. If you run the apps on different ports, update `allowedOrigins` in `Backend/server.js`.

---

## 🔑 Environment Variables

### Backend (`Backend/.env`)

| Variable | Description |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign doctor login tokens |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key (used by `clerkMiddleware` and patient counts) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `STRIPE_SECRET_KEY` | Stripe secret key for Checkout sessions |
| `FRONTEND_URL` | Base URL used to build Stripe success / cancel redirects |
| `MAJOR_ADMIN_ID` | Optional fallback owner ID for appointments created without a signed-in user |

### Frontend & Admin (a `.env` in each app)

| Variable | Description |
| --- | --- |
| `VITE_API_BASE` | Base URL of the backend API (e.g. `http://localhost:3000`) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key for the React SDK |

> All `.env` files are git-ignored — never commit real keys.

---

## 🔌 API Reference

Base URL: `http://localhost:3000`

### Doctors — `/api/doctors`
| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | — | List all doctors (supports search) |
| `GET` | `/:id` | — | Get a single doctor |
| `POST` | `/` | — | Create a doctor (multipart, `image` field) |
| `POST` | `/login` | — | Doctor login → JWT |
| `PUT` | `/:id` | Doctor JWT | Update doctor profile / schedule |
| `POST` | `/:id/toggle-availability` | Doctor JWT | Flip Available ⇄ Unavailable |
| `DELETE` | `/:id` | Doctor JWT | Delete a doctor |

### Services — `/api/services`
| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | List all services |
| `GET` | `/:id` | Get a single service |
| `POST` | `/` | Create a service (multipart, `image` field) |
| `PUT` | `/:id` | Update a service |
| `DELETE` | `/:id` | Delete a service |

### Doctor Appointments — `/api/appointments`
| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | List appointments |
| `POST` | `/` | Create an appointment (cash or Stripe Checkout) |
| `GET` | `/me` | Appointments for the signed-in patient |
| `GET` | `/confirm` | Confirm a Stripe session after payment |
| `GET` | `/doctor/:doctorId` | Appointments for one doctor |
| `GET` | `/stats/summary` | Booking & revenue summary |
| `GET` | `/patients/count` | Registered patient count (via Clerk) |
| `PUT` | `/:id` | Update status / reschedule |
| `DELETE` | `/:id/cancel` | Cancel an appointment |

### Service Appointments — `/api/service-appointments`
| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | List service appointments |
| `POST` | `/` | Book a service (cash or Stripe Checkout) |
| `GET` | `/me` | Service bookings for the signed-in patient |
| `GET` | `/confirm` | Confirm a Stripe session after payment |
| `GET` | `/stats/summary` | Service booking summary |
| `GET` | `/:id` | Get one service appointment |
| `PUT` | `/:id` | Update status / reschedule |
| `DELETE` | `/:id` | Cancel a service appointment |

---

## 🗃️ Data Models

- **Doctor** — credentials, specialisation, experience, qualifications, fees, rating, availability, and a `date → time slots` schedule map
- **Service** — name, description, price, availability, dates & slot map, preparation instructions and booking counters
- **Appointment** — patient details, doctor snapshot, date/time, fees, status lifecycle, and an embedded payment object (method, status, amount, Stripe session)
- **ServiceAppointment** — the same lifecycle for diagnostic/service bookings, with hour / minute / AM-PM scheduling

---

## 🗺️ Roadmap

- [ ] Stripe webhooks for payment confirmation (instead of redirect-based confirmation)
- [ ] Email / SMS reminders for upcoming appointments
- [ ] Medical records and prescription uploads
- [ ] Role-based admin accounts with audit logs
- [ ] Deployment configuration (Vercel + Render / Railway)

---

## 👨‍💻 Author

**Suvodip** — [@Thrillant](https://github.com/Thrillant)

---

## 📄 License

Released under the **ISC License**.
