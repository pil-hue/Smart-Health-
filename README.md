# Smart Health Operations Center

A real-time, interactive analytics dashboard designed for health administrators and Chief Medical Officers to monitor Primary Health Center (PHC) facilities, staff attendance registers, stock inventory statuses, and critical incident logs across the district.

---

## Key Features

- **Real-Time Metrics Grid**: Monitor active Primary Health Centers (PHCs), aggregate bed occupancy ratios, doctor attendance rates, patient footfalls, and urgent high-risk flags at a glance.
- **Dynamic Overlay Modals**:
  - Clicking **Doctors Present** opens a live attendance registry detailing check-in times and statuses (Present, Absent, On Leave) for all medical personnel.
  - Clicking **High Risk PHCs** displays an urgency list highlighting centers with low staffing or critical capacity thresholds.
- **Live Notifications Banner**:
  - Toggles a premium list of critical warnings (e.g. absent doctors, stock exhaustion) synced directly from database streams.
  - Includes a secure **two-step confirmation flow** for acknowledging logs ("Mark all read" -> "Acknowledge all" / "Cancel").
- **Segmented Theme Switcher**: Choose between Light Mode, Dark Mode, or follow System Settings instantly using the side-by-side segmented button controls in the top navigation header.
- **Incident Logs Register**: Detailed logging page with severity filtering (Critical, Warnings, Info Updates) and direct acknowledgment updates.
- **Detailed PHC Operations views**: Navigate to specific PHCs to audit beds status, staff attendance cards, and medical stock levels (e.g., Insulin, Amoxicillin, Paracetamol).
- **Configurable Limits**: Type alert trigger threshold percentages directly inside Settings (under range bounds limit controls) and review Chief Medical Officer contact records (read-only for security).

---

## Technology Stack

- **Framework**: [React](https://react.dev/) (v19) + [Vite](https://vite.dev/) (HMR)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore) (real-time `onSnapshot` data sync streams)
- **Routing**: [React Router DOM](https://reactrouter.com/) (v7)
- **UI Icons**: [React Icons](https://react-icons.github.io/react-icons/) (Feather icon packs)
- **Maps**: [React Leaflet](https://react-leaflet.js.org/) / Leaflet.js
- **Charts**: [Recharts](https://recharts.org/) (responsive metric visualizers)
- **Styling**: Vanilla CSS with color-scheme variables support

---

## Project Structure

```
Smart Health/
├── src/
│   ├── assets/             # Brand logos and assets
│   ├── components/         # Reusable layouts
│   │   ├── DataTable.jsx   # Searchable data tables
│   │   ├── Sidebar.jsx     # Side navigation drawer
│   │   ├── StatCard.jsx    # Clickable metrics panels
│   │   └── TopNavbar.jsx   # Notifications & Segmented theme controls
│   ├── pages/              # Main view screens
│   │   ├── Dashboard.jsx   # Aggregate statistics & lists
│   │   ├── PHCDetails.jsx  # Individual facility summaries
│   │   ├── Alerts.jsx      # Historical incident register
│   │   └── Settings.jsx    # Threshold sliders & read-only registry
│   ├── services/           # Data services (Firestore + mock fallbacks)
│   │   ├── alertsService.js
│   │   ├── attendanceService.js
│   │   ├── districtService.js
│   │   ├── phcService.js
│   │   └── stockService.js
│   ├── App.jsx             # Main routing and global theme states
│   ├── index.css           # Global stylesheets & design tokens
│   └── firebase.js         # Firebase client configuration
├── public/                 # Static public files
├── vite.config.js          # Vite compilation config
├── package.json            # Node project configuration
└── .env                    # System secrets (ignored)
```

---

## Quick Start

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18+) installed on your local system.

### 2. Install Dependencies
Run the install command in the project directory:
```bash
npm install
```

### 3. Database Credentials Setup
Create a `.env` file at the root of the workspace directory and populate it with your Firestore API keys:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run Development Server
Start the local development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to inspect the application.

### 5. Build for Production
To build and preview the optimized production bundle:
```bash
# Build bundle
npm run build

# Preview build locally
npm run preview
```
