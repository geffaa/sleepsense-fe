# SleepSense - Smart Sleep Apnea Detection Platform

SleepSense is a comprehensive platform that uses AI and IoT technology to detect and monitor Obstructive Sleep Apnea (OSA). The system comprises a Next.js frontend and an Express/PostgreSQL backend.

## Features

- Real-time sleep monitoring with AI-powered detection
- Patient and doctor dashboards
- Sleep history tracking
- Doctor approval workflow for sleep analyses
- Robust authentication system with role-based access
- Responsive design for all devices

## Tech Stack

### Frontend
- Next.js (React framework)
- Tailwind CSS for styling
- Recharts for data visualization
- Axios for API communication

### Backend
- Express.js API server
- PostgreSQL database
- JWT authentication
- TypeScript

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- PostgreSQL (v14+)

### Setting Up the Database

1. Create a PostgreSQL database for SleepSense:

```bash
psql -U postgres
CREATE DATABASE sleepsense;
\q
```

2. Initialize the database schema:

```bash
psql -U postgres -d sleepsense -f init-database.sql
```

The initialization script creates all necessary tables and adds test data.

### Setting Up the Backend

1. Clone the repository and navigate to the backend directory:

```bash
cd sleepsense-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with the following content:

```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=sleepsense
JWT_SECRET=your_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

4. Start the backend server:

```bash
npm run dev
```

The server will start on http://localhost:5000.

### Setting Up the Frontend

1. Navigate to the frontend directory:

```bash
cd sleepsense-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000.

## Using the Application

### Test Accounts

The initialization script creates two test accounts:

**Patient:**
- Email: patient@example.com
- Password: Password123

**Doctor:**
- Email: doctor@example.com
- Password: Password123

### Workflow

1. **Login** using one of the test accounts
2. For **patients**:
   - View real-time sleep monitoring
   - Check sleep history
   - See doctor feedback
3. For **doctors**:
   - Review patient list
   - Analyze sleep data
   - Approve or reject sleep analyses
   - Provide feedback to patients

## Project Structure

### Frontend Structure

```
sleepsense-frontend/
├── public/
├── src/
│   ├── app/                     # Next.js app router
│   ├── components/              # React components
│   │   ├── auth/                # Authentication components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── doctor/              # Doctor-specific components
│   │   ├── layout/              # Layout components
│   │   └── ui/                  # Reusable UI components
│   ├── context/                 # React context providers
│   ├── lib/                     # Utility functions and services
│   └── types/                   # TypeScript type definitions
└── package.json
```

### Backend Structure

```
sleepsense-backend/
├── src/
│   ├── config/                  # Configuration files
│   ├── controllers/             # API controllers
│   ├── middleware/              # Express middleware
│   ├── models/                  # Database models
│   ├── routes/                  # API routes
│   ├── types/                   # TypeScript type definitions
│   └── app.ts                   # Express application setup
└── package.json
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in a user
- `GET /api/auth/me` - Get current user info

### Patient Endpoints

- `GET /api/patient/profile` - Get patient profile
- `PUT /api/patient/profile` - Update patient profile
- `GET /api/patient/sleep-history` - Get sleep history
- `GET /api/patient/sleep-details/:id` - Get specific sleep data
- `GET /api/patient/device/:id/status` - Get device status

### Doctor Endpoints

- `GET /api/doctor/profile` - Get doctor profile
- `PUT /api/doctor/profile` - Update doctor profile
- `GET /api/doctor/patients` - Get list of patients
- `GET /api/doctor/patients/:id` - Get specific patient details
- `GET /api/doctor/pending-approvals` - Get pending approvals
- `POST /api/doctor/analysis/:id/approve` - Approve analysis
- `POST /api/doctor/analysis/:id/reject` - Reject analysis

### Device Data Endpoints

- `GET /api/data/sensor-data/:sleepDataId` - Get sensor data
- `POST /api/data/device/:serialNumber/data` - Send device data
- `POST /api/data/device/:serialNumber/batch-data` - Send batch data

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure the database and tables exist

2. **API Connection Errors**
   - Verify the backend server is running
   - Check CORS settings in the backend
   - Verify API URL is correct in frontend `.env.local`

3. **Authentication Issues**
   - Clear browser localStorage
   - Verify JWT secret is set correctly
   - Check token expiration time

4. **Frontend Rendering Issues**
   - Check browser console for errors
   - Verify component props and types
   - Check API response format

### Fallback to Mock Data

If the backend connection fails, the frontend will automatically fall back to using mock data. You'll see a warning banner at the top of the page indicating this.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.