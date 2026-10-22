# TaskFlow – Full Stack Project Management Application

TaskFlow is a full-stack web application designed to help individuals and teams organize projects, manage tasks, collaborate with team members, and track work progress through a modern, responsive interface.

The application uses React and Vite for the frontend, Node.js and Express.js for the backend, and Firebase for authentication and data storage.

## Live Links

- **Live Application:** https://taskflow-vite-seven.vercel.app
- **GitHub Repository:** https://github.com/asilmatar4-debug/taskflow-vite
- **Backend API Health Check:** https://taskflow-api-cdfv.onrender.com/api/health

## Technologies Used

### Frontend
- React.js
- Vite
- JavaScript
- CSS
- React Router
- Lucide React Icons

### Backend
- Node.js
- Express.js
- Firebase Admin SDK
- REST API
- Firebase ID Token Verification

### Database and Authentication
- Firebase Cloud Firestore
- Firebase Authentication
- Email and Password Authentication
- Google Authentication

### Deployment
- Vercel – Frontend Hosting
- Render – Backend Hosting
- Firebase – Authentication and Database

## Main Features

### 1. User Authentication
- User registration and login using email and password
- Sign in with Google
- Protected application pages
- User session management
- Secure logout

### 2. Project Management
- Create new projects
- View existing projects
- Edit project details
- Delete projects and their associated tasks
- Display project progress and task statistics

### 3. Team Collaboration
- Add registered users to projects using their email addresses
- Remove project members
- Distinguish between project owners and members
- Apply role-based permissions to project operations

### 4. Task Management
- Create, view, edit, and delete tasks
- Assign tasks to project members
- Set task priorities and due dates
- Update task statuses:
  - To Do
  - In Progress
  - Done
- Search and filter tasks
- Identify overdue tasks

### 5. Dashboard
- Total projects
- Total tasks
- Tasks in progress
- Completed tasks
- Overdue tasks
- Overall completion percentage
- Recent tasks and project progress

### 6. Responsive Design
- Responsive layouts for desktop and mobile devices
- Modern dashboard interface
- Clear project cards and progress indicators
- Consistent navigation and visual design

## Project Structure

```text
TaskFlow-Vite/
├── backend/
│   ├── src/
│   │   └── server.js
│   ├── package.json
│   └── .env.example
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── firebase.js
├── public/
├── firestore.rules
├── package.json
├── vite.config.js
└── README.md
```

## How to Run the Project Locally

### Prerequisites

- Node.js and npm
- A Firebase project with Authentication and Firestore enabled
- Firebase Admin credentials for the backend

### 1. Clone the Repository

```bash
git clone https://github.com/asilmatar4-debug/taskflow-vite.git
cd taskflow-vite
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Configure Frontend Environment Variables

Create a `.env.local` file in the root directory using the values from your Firebase project.

```dotenv
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_API_URL=http://localhost:4000/api
```

### 4. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```dotenv
PORT=4000
FIREBASE_PROJECT_ID=your_project_id
CLIENT_ORIGIN=http://localhost:5173
```

Configure Firebase Admin credentials securely using the `GOOGLE_APPLICATION_CREDENTIALS` environment variable pointing to your private service account JSON file.

**Never commit Firebase Admin credentials or private keys to GitHub.**

### 5. Start the Backend

From the `backend` directory:

```bash
npm run dev
```

The backend runs locally on port 4000.

Health check:

```text
http://localhost:4000/api/health
```

### 6. Start the Frontend

Open a separate terminal in the project's root directory:

```bash
npm run dev
```

Open the local application:

```text
http://localhost:5173
```

## Application Architecture

TaskFlow follows a client-server architecture:

1. **React + Vite** provides the user interface.
2. **Firebase Authentication** handles registration and login.
3. The frontend sends authenticated API requests to **Node.js + Express**.
4. The backend verifies Firebase ID tokens and applies application permissions.
5. **Firebase Admin SDK** communicates with Cloud Firestore.
6. Firestore stores projects, tasks, and user-related information.

## Security

The application includes:

- Firebase Authentication
- Verification of Firebase ID tokens on backend requests
- Owner and member permission checks
- Protected frontend routes
- Firestore security rules
- Environment-based configuration
- Private Firebase Admin credentials excluded from version control

**Important:** Firebase Admin SDK has privileged access to Firestore. Therefore, server-side authorization checks are required independently of Firestore Security Rules.

## Deployment

### Frontend – Vercel

The React application is deployed on Vercel.

Production URL:

https://taskflow-vite-seven.vercel.app

The frontend uses `VITE_API_URL` to connect to the deployed backend.

### Backend – Render

The Express server is deployed as a Render Web Service.

Backend health check:

https://taskflow-api-cdfv.onrender.com/api/health

The backend uses environment variables and a securely configured Firebase Admin service account.

### Firebase

Firebase provides:

- User authentication
- Google sign-in
- Firestore database

Authorized authentication domains include the deployed Vercel domain.

## Testing

The application has been manually tested for the following workflows:

- User login and registration
- Google authentication
- Creating and updating projects
- Creating and managing tasks
- Adding and removing project members
- Project deletion with associated task cleanup
- Owner and member interface permissions
- Loading dashboard statistics
- Persisting data in Firestore
- Frontend and backend deployment connectivity

Additional API-level authorization and automated security tests are recommended before production use.

## Screenshots

Screenshots of the following pages can be found in the `screenshots` folder when included with the submission:

- Login and Registration
- Dashboard
- Projects
- Task Management
- Team Members
- Mobile Responsive View

## Known Limitations

- The free Render instance may take additional time to respond after inactivity.
- Some production-scale features, such as automated test coverage and advanced monitoring, are outside the scope of the current project.
- Server-side API authorization should be tested independently before deploying the application for sensitive or large-scale use.

## Conclusion

TaskFlow demonstrates the development and deployment of a full-stack project management application using React, Node.js, Express, and Firebase.

It provides essential collaboration and task-tracking features through a responsive interface and a backend API, with separate deployments for frontend and backend services.