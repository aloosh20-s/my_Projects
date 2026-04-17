# 📘 Developer Guide: Local Service Marketplace

## 🔹 Project Overview
The Local Service Marketplace (Souq Al-Yemen) is a comprehensive two-sided platform connecting local professional service providers (Workers) with clients seeking custom jobs or pre-defined services. 

### Core Features
- **Role-Based Workflows**: Strict partitioning between `client` and `worker` contexts.
- **Service Listings**: Workers can create, edit, and delete detailed visual service packages.
- **Custom Service Requests**: Clients can request custom jobs directly from workers.
- **Real-Time Messaging**: Secure Socket.io based chat integration.
- **Image Pipeline**: Multipart form handling for avatars and service portfolio images.

### Tech Stack
- **Frontend**: Next.js 16 (App Router), React, Tailwind CSS.
- **Backend**: Node.js, Express.js.
- **Database**: Sequelize ORM (Supporting Postgres/SQLite).
- **File Storage**: Local Multer Disk Storage (Development) / Cloudinary v2 (Production).

---

## 🔹 Folder Structure

### `frontend/`
- **`/app`**: Next.js 16 App Router pages. Contains heavily protected route groups (`/worker`, `/customer`, `/request-service`).
- **`/components`**: Reusable React components (Navbar, Logo, Modals).
- **`/context`**: Global React Context (AuthContext for JWT session preservation, ToastContext).
- **`/utils`**: Configuration pipelines (API fetch wrappers, Socket mapping).

### `backend/`
- **`/controllers`**: Express logic handlers processing business rules (authController, serviceController).
- **`/models`**: Sequelize DB Schema definitions.
- **`/routes`**: Express Router endpoints securely linking middleware to controllers.
- **`/middlewares`**: Authentication gates (`protect` using JWT).
- **`/uploads`**: Temporary local staging directory for Multer disk-storage before Cloudinary handoffs.

---

## 🔹 Architecture

### Frontend Structure
The frontend enforces strict dynamic rendering utilizing React `Suspense` wraps around `useSearchParams()`. Role-based authentication is injected globally via `AuthContext`, dictating Navbar links and route protection.

### Backend Structure
A RESTful Express architecture leveraging standard MVC patterns. It accepts cross-origin requests from the React layer, verifies cryptographic signatures via JWT, sequences SQL injections using Sequelize, and hands back structured JSON models.

### Image Upload Flow
1. Client POSTs a raw `multipart/form-data` Blob to `/api/upload`.
2. Backend intercepts via Multer, saves to `/uploads` temporarily.
3. If `.env` Cloudinary keys exist, it pushes the image to Cloudinary and deletes the local cache.
4. The server returns a `{ url: string }` response.
5. The frontend appends this URL to the Service creation array or pushes it to `PUT /api/auth/profile` for avatars.

---

## 🔹 Installation & Setup

### Prerequisites
- Node.js v18+
- SQLite or PostgreSQL

### Environment Variables
**Backend (`backend/.env`)**
```env
PORT=5000
DATABASE_URL=sqlite://marketplace.sqlite
JWT_SECRET=your_jwt_strong_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```
**Frontend (`frontend/.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Running Locally
1. **Initialize Database Models:**
   ```bash
   cd backend
   npm install
   node server.js
   ```
2. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🔹 Authentication System

The platform utilizes stateless JWT (JSON Web Tokens). 
- Upon successful `/register` or `/login` POST requests, the Node server returns a hashed token.
- The React `AuthContext` writes this token to browser LocalStorage.
- Verified requests (such as creating a service) dynamically attach `Bearer {token}` into the fetch header.

---

## 🔹 API Documentation

### Auth
- **POST `/api/auth/register`**: Registers user. Requires `name, email, password, role`.
- **POST `/api/auth/login`**: Authenticates user. Requires `email, password`.
- **PUT `/api/auth/profile`**: Updates profile metadata. Requires bearer token. Accepts `name, phone, location, profileImage`.

### Services
- **GET `/api/services`**: Fetches all active services.
- **POST `/api/services`**: Creates a service package. Requires `title, description, category, price, images[]`.
- **DELETE `/api/services/:id`**: Removes service (Worker only).

### Custom Requests
- **POST `/api/service-requests`**: Clients directly hire workers natively. Requires `workerId, title, description, budget`.

### Uploads
- **POST `/api/upload`**: Single image Multipart parser. Key must be `image`.

---

## 🔹 Database Schema (Key Models)

- **User**: The root authentication model (`role, name, email, password, profileImage, phone, location`). Note: `role` relies on `client` or `worker` enums.
- **Service**: The physical marketplace product (`title, description, price`). Images are physically restricted to a JSON-stringified TEXT array structure mapped tightly via getter and setter Sequelize configurations.
- **ServiceRequest**: Handles generic board requests and direct Worker hires via the `workerId` injection point.

---

## 🔹 Common Bugs & Fixes

1. **Images Failing to Render (The Default Image Bug)**
   - *Symptom*: Frontend UI renders standard unsplash placeholders despite a successful backend `/upload`. 
   - *Fix*: The Express `Service` model saves multiple images in a string array (`images`), but developers frequently attempt to call `service.imgUrl` on the frontend. Use `<img src={service.images?.[0] || 'mock.jpg'} />`.
2. **Role Verification Faults**
   - *Symptom*: End-users stuck in a loop unable to use NavBar functionality.
   - *Fix*: Ensure frontend role checks explicitly look for `'client'` rather than legacy tags like `'customer'`.
3. **Next.js Pre-render Crashes (useSearchParams)**
   - *Fix*: Always defensively wrap sub-components reading client URL search streams in `<Suspense>` boundaries.

---

## 🔹 Deployment Guide
- **Database**: Migrate from SQLite disk usage to a managed PostgreSQL cluster (e.g. Supabase, AWS RDS). 
- **Backend Node Server**: Deploy to Heroku, Render, or a VPS utilizing PM2. Ensure environment ports map correctly natively.
- **Next.js Frontend**: Best pushed to Vercel. Map `NEXT_PUBLIC_API_URL` to your production backend URI.
