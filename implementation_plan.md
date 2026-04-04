# Implement Marketplace Dashboard and Core Features

The project currently has a working SQLite-based database with Sequelize models and basic Authentication (Register & Login) succeeding. However, the core marketplace features such as managing services, bookings, finding services, and viewing worker profiles are completely missing or mocked in the UI. We need to implement these core endpoints in the backend and integrate them into the frontend dashboards.

## User Review Required

> [!WARNING]
> The original setup of this application appears to have attempted using MongoDB Atlas but was recently switched to **SQLite and Sequelize**. I will proceed with the current working setup (SQLite/Sequelize) to implement the actual features, as reverting back to MongoDB would require a full rewrite of all data models back into Mongoose. Please confirm if continuing with the SQLite/Sequelize backend is perfectly acceptable to you.

## Proposed Changes

### Backend API Completion
We need to create the missing controllers and routes for the remaining models.

#### [NEW] `e:\Marketplace\backend\controllers\serviceController.js`
- Create endpoints: `getServices`, `getServiceById`, `createService`, `updateService`, `deleteService`.

#### [NEW] `e:\Marketplace\backend\controllers\bookingController.js`
- Create endpoints: `createBooking`, `getBookingsForClient`, `getBookingsForWorker`, `updateBookingStatus`.

#### [NEW] `e:\Marketplace\backend\controllers\workerController.js`
- Create endpoints: `getWorkerProfile`, `updateWorkerProfile`, `getAllWorkers`.

#### [NEW] `e:\Marketplace\backend\routes\serviceRoutes.js`
- Wire endpoints to router.
#### [NEW] `e:\Marketplace\backend\routes\bookingRoutes.js`
- Wire endpoints to router.
#### [NEW] `e:\Marketplace\backend\routes\workerRoutes.js`
- Wire endpoints to router.

#### [MODIFY] `e:\Marketplace\backend\server.js`
- Import and uncomment the newly created feature routes.

---

### Frontend Integration
The frontend currently uses static mock data and does not persist authenticated state appropriately across pages.

#### [MODIFY] `e:\Marketplace\frontend\components\Navbar.tsx`
- Implement dynamic rendering based on authentication state (check local storage for user token).
- Show 'Log out' button, user profile info, and correct Dashboard links to authenticated users instead of purely 'Login' / 'Sign Up'.

#### [MODIFY] `e:\Marketplace\frontend\app\customer\dashboard\page.tsx`
- Fetch and display the authenticated client's actual bookings via `/api/bookings/client`.
- Remove hardcoded statistics.

#### [MODIFY] `e:\Marketplace\frontend\app\worker\dashboard\page.tsx`
- Fetch and display the authenticated worker's actual jobs/bookings via `/api/bookings/worker`.
- Add functionality to view and update the `WorkerProfile`.

#### [NEW] `e:\Marketplace\frontend\app\services\page.tsx`
- Ensure this page exists to show a list of services connecting to the `/api/services` endpoint.

## Open Questions

> [!IMPORTANT]
> 1. Should I prioritize the Customer Booking flow or Worker Profile Setup flow first? 
> 2. The previous task mentions fixing "MongoDB Atlas connection issues". The code currently uses SQLite. Did you still want MongoDB restored, or should I proceed implementing the backend features with the functional SQLite setup?

## Verification Plan

### Automated Tests
- N/A

### Manual Verification
1. Open the Browser Subagent.
2. Authenticate as a pre-existing Worker.
3. Validate navigating to the Worker Dashboard successfully displays fetched API info.
4. Add a new Service from the worker account.
5. Log out, authenticate as a pre-existing Customer.
6. Browse and successfully "Book" the new Service.
7. Validate the booking appears dynamically on both dashboards.
