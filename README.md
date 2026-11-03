# Smart Tourist Safety Monitoring and Incident Response System

A full-stack, enterprise-grade web application built to monitor tourist location, enforce automated hazard geofence alerts, broadcast instant emergency SOS signals, manage emergency contacts, and provide municipal emergency dispatchers with a real-time Incident Command Dashboard.

---

## 🌟 Key Features

### 👤 Tourist Safety Portal
- **Interactive Google Maps & GPS Tracking**: Accurate device geolocation tracking with real-time breadcrumbs saved to MongoDB.
- **Automated Geofence Detection**: Distance-based Haversine geofence monitoring that triggers immediate audio/visual alert banners when entering **Restricted Hazard Zones** (ocean cliffs, surge tides, steep terrain) or crossing into **Safe Tourist Corridors**.
- **Prominent SOS Emergency Beacon**: Instant emergency broadcast with confirmation modal to prevent accidental triggers, transmitting precise GPS coordinates, address, and tourist profile to municipal responders.
- **Accidental SOS Cancellation**: Tourists can safely cancel accidental alerts with a specified reason, updating the emergency dispatch log in real time.
- **Emergency Contacts Registry**: Full CRUD support for emergency contacts with a designated Primary SOS contact and one-click direct telephone dialing (`tel:` links).
- **Nearby Emergency Services**: Quick discovery and turn-by-turn directions to nearby hospitals, trauma centers, and tourist police stations with phone dialing.
- **Personal Safety Profile**: Manage contact information, nationality, and view GPS telemetry history.

### 🛡️ Administrator Incident Command Center
- **Mission Control Dashboard**: Live KPIs for total registered tourists, active GPS tracking tourists, active emergency alerts, pending dispatch incidents, and resolved cases.
- **Incident Response Management**: Inspect detailed incident reports, update resolution status (`Pending`, `In Progress`, `Resolved`, `Cancelled`), assign responder units, and append dispatcher logs.
- **Geofence Perimeter Command**: Create, edit, and delete geofences with customizable radius (meters), classifications (**Safe**, **Restricted**, **Caution**), and custom alert warnings. Click directly on the map to pick target coordinates.
- **Transition Event Logs**: Audited MongoDB log tracking every tourist enter/exit transition across geofence boundaries.
- **Tourists Telemetry Registry**: View all tourists, their current tracking status, last known coordinates, and primary emergency contacts.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React.js (JavaScript, HTML5, CSS3), React Router v6, Axios, Lucide Icons |
| **Styling** | Vanilla CSS3 Design System (Navy `#0f1c3f`, Teal `#0d9488`, Emergency Red `#ef4444`) |
| **Maps** | Google Maps JavaScript API (with High-Fidelity Interactive Fallback Map) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose |
| **Authentication** | JSON Web Tokens (JWT) & bcrypt.js password hashing |
| **Tooling** | Vite (Frontend Bundler), Morgan (HTTP logger), dotenv |

---

## 📁 Project Structure

```
tourist-safety-system/
├── README.md
├── .gitignore
├── backend/
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   ├── server.js
│   ├── seed.js
│   ├── config/
│   │   └── db.js                 # Resilient MongoDB connection with in-memory fallback
│   ├── models/
│   │   ├── User.js               # Tourist and Admin accounts
│   │   ├── TouristLocation.js    # GPS coordinates & breadcrumbs
│   │   ├── EmergencyContact.js   # Personal emergency contacts
│   │   ├── Incident.js           # SOS and safety incidents
│   │   ├── Geofence.js           # Safe and Restricted boundary polygons/circles
│   │   └── GeofenceLog.js        # Enter/Exit boundary transition logs
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & role authorization
│   │   └── errorHandler.js       # Centralized error handler
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── touristController.js
│   │   ├── contactController.js
│   │   ├── incidentController.js
│   │   ├── geofenceController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── touristRoutes.js
│   │   ├── contactRoutes.js
│   │   ├── incidentRoutes.js
│   │   ├── geofenceRoutes.js
│   │   └── adminRoutes.js
│   └── utils/
│       ├── geofenceUtils.js      # Haversine distance & geofence evaluation
│       └── seedData.js           # Automatic seed data generator
└── frontend/
    ├── .env.example
    ├── .env
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css             # Unified CSS Design System
        ├── context/
        │   └── AuthContext.jsx   # Global auth state & token persistence
        ├── services/
        │   ├── api.js            # Axios client with JWT interceptor
        │   ├── authService.js
        │   ├── touristService.js
        │   ├── contactService.js
        │   ├── incidentService.js
        │   ├── geofenceService.js
        │   └── adminService.js
        ├── components/
        │   ├── common/           # Navbar, Sidebar, Modal, StatusBadge, ProtectedRoute
        │   ├── map/              # GoogleMapViewer & MapLegend
        │   ├── emergency/        # SosButtonModal & NearbyServices
        │   └── dashboard/        # StatCard
        └── pages/
            ├── Home.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── TouristDashboard.jsx
            ├── AdminDashboard.jsx
            ├── EmergencyContactsPage.jsx
            ├── GeofenceManagerPage.jsx
            ├── IncidentsPage.jsx
            ├── TouristsMonitoringPage.jsx
            ├── TouristProfile.jsx
            └── NotFound.jsx
```

---

## 🔑 Demo Accounts (Pre-Seeded)

The database automatically seeds realistic demo data on first startup. You can also use the one-click demo login buttons on the Login page:

| Role | Email Address | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Tourist** | `tourist@example.com` | `Tourist@123456` | GPS Tracking, Geofence Alerts, SOS, Emergency Contacts |
| **Administrator** | `admin@touristsafety.com` | `Admin@123456` | Incident Command, Status Dispatch, Geofence Manager |

---

## ⚙️ Environment Configuration

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tourist_safety
JWT_SECRET=tourist_safety_super_secret_jwt_key_2026_xyz987
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
*Note:* If local MongoDB is not running, the backend automatically initializes an in-memory MongoDB database so you can start working immediately without any configuration!

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 🗺️ Google Maps API Integration
1. Obtain an API key from the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **Maps JavaScript API** and **Places API**.
3. Set your key in `frontend/.env` as `VITE_GOOGLE_MAPS_API_KEY=your_key` or click the **"Google Maps: Setup Key"** button on the map inside the app.
4. **Fallback Mode**: If you do not have a Google Maps API key, the system automatically runs in an **Interactive High-Fidelity Fallback Map Mode** featuring full zoom, pan, real distance calculations, geofence radius rendering (Safe, Restricted, Caution), tourist GPS beacon, and emergency service pins.

---

## 🚀 Getting Started

### 1. Install Dependencies

Open a terminal and install dependencies for both backend and frontend:

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Run the Application

In terminal 1 (start backend server):
```bash
cd backend
npm start
# Server starts at http://localhost:5000
```

In terminal 2 (start frontend development server):
```bash
cd frontend
npm run dev
# Vite runs at http://localhost:5173
```

Visit **http://localhost:5173** in your browser.

---

## 🧪 Testing the Application Workflows

1. **Sign In**: Navigate to `http://localhost:5173/login` and click **"Tourist (Alex)"** or **"Administrator"** to sign in instantly.
2. **GPS Tracking & Geofence Alerts**:
   - On the Tourist Dashboard, toggle **"Start GPS Tracking"** to track device location.
   - Click **"Test Hazard Alert"** to simulate moving into the Presidio Coastal Bluffs restricted zone. An urgent red hazard warning banner will appear.
   - Click **"Test Safe Zone"** to simulate moving back into the Marina Safe Promenade.
3. **Emergency SOS**:
   - Click the prominent red **"TRIGGER SOS EMERGENCY"** button.
   - Confirm in the modal. Notice the live incident registered in MongoDB with reference code.
   - Click **"Cancel Accidental Alert"** to test false alarm cancellation.
4. **Emergency Contacts**:
   - Navigate to `/contacts` to add, edit, or delete emergency contacts with click-to-call.
5. **Administrator Incident Command**:
   - Log in as `admin@touristsafety.com`.
   - View total tourists, incidents, and geofences.
   - Click **"Manage"** on an incident to update status from `Pending` to `In Progress` or `Resolved` and append dispatcher notes.
6. **Geofence Manager**:
   - Navigate to `/admin/geofences`.
   - Click **"Pick Point on Map"** and click anywhere to set center coordinates.
   - Adjust the radius slider and save to create new Safe or Restricted perimeters.

---

## 🛡️ REST API Reference

### Authentication
- `POST /api/auth/register` — Register a tourist account
- `POST /api/auth/login` — Sign in and obtain JWT
- `GET /api/auth/me` — Get current authenticated user

### Tourist Operations
- `GET /api/tourist/profile` — Get tourist profile
- `PUT /api/tourist/profile` — Update tourist profile
- `POST /api/tourist/location` — Transmit GPS coordinates & evaluate geofences
- `POST /api/tourist/tracking/toggle` — Toggle live tracking
- `GET /api/tourist/location/history` — Get GPS breadcrumbs

### Emergency Contacts
- `GET /api/contacts` — List tourist emergency contacts
- `POST /api/contacts` — Add an emergency contact
- `PUT /api/contacts/:id` — Update contact
- `DELETE /api/contacts/:id` — Remove contact

### Incident Management
- `POST /api/incidents` — Trigger emergency SOS incident
- `GET /api/incidents/my` — Get logged-in tourist incidents
- `GET /api/incidents` — Get all incidents (Admin)
- `GET /api/incidents/:id` — Get single incident
- `PUT /api/incidents/:id/status` — Update incident status & notes (Admin)
- `PUT /api/incidents/:id/cancel` — Cancel accidental SOS alert (Tourist)

### Geofencing
- `GET /api/geofences` — Get all active geofences
- `POST /api/geofences` — Create new geofence (Admin)
- `PUT /api/geofences/:id` — Update geofence (Admin)
- `DELETE /api/geofences/:id` — Delete geofence (Admin)
- `GET /api/geofences/events` — Get boundary transition event logs (Admin)

### Admin Telemetry
- `GET /api/admin/stats` — Summary metrics
- `GET /api/admin/tourists` — Registered tourists list with locations
