# Bionic FitPortal

FitPortal is the user interface, API, database, and integration layer for **Project Perfect Fit**, a COMP4050 project developed for Thomax.

The Bionic FitPortal team is part of the **Bionic Fit division** and works alongside the FitSolver and FitVisualizer teams.

## Mission

Our mission is to develop a secure, mobile-first, and user-friendly FitPortal that enables operational and back-end users to manage packing orders and seamlessly connects FitSolver with FitVisualizer.
Our goal is to deliver clear and practical packing results while supporting real-world handling constraints.

## System Overview

FitPortal acts as the central access point for the integrated system:

1. An authorised user or back-end system submits order, item, carton, and handling information.
2. FitPortal validates and stores the information.
3. FitPortal sends a packing request to FitSolver.
4. FitSolver returns a packing solution or failure response.
5. FitPortal stores and presents the result.
6. FitPortal provides the result to FitVisualizer for interactive inspection.

### System Flow

**User or back-end system → FitPortal → FitSolver → FitPortal → FitVisualizer → User**

## FitPortal Responsibilities

- Authentication and access control
- Order, item, and carton management
- Fragile and dangerous-goods item classification
- Packing and handling constraints
- Input validation and error reporting
- FitPortal API and database
- Integration with FitSolver
- Integration with FitVisualizer
- Packing status, summary, and result access
- Mobile-first and accessible user experience

Detailed requirements and shared data formats will be refined with the client, FitSolver team, and FitVisualizer team.

## Proposed Technology Stack

| Area | Technology |
|---|---|
| Frontend | React |
| Backend | Node.js and Express |
| Database | Supabase (Postgres) |
| Data exchange | REST and JSON |
| Version control | Git and GitHub |
| Project management | Trello |
| Communication | Discord| 

The proposed technology stack may be refined following technical investigation and cross-team discussion.

## Team Roles

| Role | Team Member | Main Responsibilities |
|---|---|---|
| Product Owner | Asma | Product vision, requirements, backlog priorities, acceptance, and cross-team coordination |
| Scrum Master | Wajiha | Scrum activities, team organisation, progress support, and blocker management |
| Developer | Huzaifa | Design, development, testing, integration, and documentation |
| Developer | Brandon | Design, development, testing, integration, and documentation |

Alongside our assigned roles, all team members will contribute to development, testing, documentation, decision-making, and cross-team collaboration.

### Shared Technical Responsibilities

- Frontend and backend development
- Testing and code review
- FitSolver and FitVisualizer integration
- Technical documentation
- System design and decision-making
- Sprint planning, reviews, and retrospectives
- Communication and cross-team collaboration
  
## Sprint Plan

### Sprint 0 — Planning and Team Setup

Establish the team, clarify the initial requirements, select the technology stack, agree on team processes, and coordinate with FitSolver and FitVisualizer.

### Sprint 1 — Integrated MVP

Develop the minimum FitPortal interface and backend, agree on shared data formats, complete the first basic integration with FitSolver and FitVisualizer, and verify the basic MVP workflow.

### Sprint 2 — Main Development

Implement the main agreed functionality, strengthen subsystem integration, improve validation and error handling, and address the main functional and non-functional requirements.

### Sprint 3 — Finalisation and Delivery

Finalise integration, fix defects, complete testing, deploy the prototype, prepare documentation, and deliver the final demonstration.

No new features are planned for Sprint 3.

## Proposed GitHub Workflow

1. Select an agreed task from the Trello board.
2. Create a focused Git branch for the task.
3. Make clear and incremental commits.
4. Open a pull request for review.
5. Test the change against the acceptance criteria.
6. Merge the approved change into the agreed integration branch.

Important integration decisions including shared field names, data types, measurement units, API contracts, and error formats must be coordinated with the FitSolver and FitVisualizer teams.

## Documentation

The following documentation will be added as development progresses:

- Local setup instructions
- Environment-variable guidance
- API documentation
- Database schemas
- Testing instructions
- Deployment instructions
- User and technical guidance

## Technical Documentation

This section provides installation instructions, environment configuration, API documentation, database information, testing procedures, deployment instructions, and user guidance for FitPortal.

FitPortal consists of a React frontend, Node.js backend, Supabase database and authentication services, Solver integration, and Visualiser integration.

The frontend is deployed using **Vercel**, while the backend is deployed using **Render**.

---

## 1. Local Setup Instructions

### 1.1 Prerequisites

Before installing FitPortal, ensure the following software is installed:

| Software | Requirement | Purpose |
|----------|-------------|---------|
| Node.js | Version 20 or higher | Running frontend and backend applications |
| npm | Included with Node.js | Installing dependencies |
| Git | Latest stable version | Repository management |
| Visual Studio Code | Recommended | Code editing |
| Supabase | Project credentials required | Database and authentication |

Download the required software:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/)

Installation commands are the same for **Windows and macOS**.

Windows users can use PowerShell or the VS Code terminal, while macOS users can use Terminal.

### 1.2 Clone the Repository

Open Terminal or PowerShell and run:

```bash
git clone <repository-url>
cd Comp4050-Bionic-Portal
```

Replace `<repository-url>` with the GitHub repository URL.

### 1.3 Frontend Installation (Web)

The frontend is located in the `web` directory and uses React with Vite.

**Step 1: Navigate to the frontend directory**

```bash
cd web
```

**Step 2: Install dependencies**

```bash
npm install
```

**Step 3: Start the development server**

```bash
npm run dev
```

Once started, Vite will display a local development URL, typically:

```text
http://localhost:5173
```

Open the URL in your browser to access FitPortal.

### 1.4 Backend Installation (Server)

The backend is located in the `server` directory and uses Node.js.

**Step 1: Open a new terminal and navigate to the backend**

From the repository root:

```bash
cd server
```

**Step 2: Install dependencies**

```bash
npm install
```

**Step 3: Configure environment variables**

The repository contains an example environment file:

```text
server/.env.example
```

Copy this file to create your local `.env` configuration.

For macOS:

```bash
cp .env.example .env
```

For Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Open the `.env` file and enter the required configuration values provided by the development team.

**Step 4: Start the backend**

```bash
npm run dev
```

Ensure the command is defined in `server/package.json`.

The backend will start using the configured server port.

### 1.5 Running the Complete Application

FitPortal requires the frontend and backend to run simultaneously.

Open two separate terminals from the project root.

**Terminal 1 – Backend**

```bash
cd server
npm run dev
```

**Terminal 2 – Frontend**

```bash
cd web
npm run dev
```

Once both servers are running, open the frontend URL displayed in the terminal.

For additional setup information, refer to:

- [Running Instructions](docs/RUNNING.md)
- [Development Guide](docs/DEVELOPMENT.md)

---

## 2. Environment-Variable Guidance

FitPortal uses environment variables to configure database connections, authentication, backend services, and Solver integration.

The backend environment configuration is located in:

```text
server/.env
```

An example configuration is provided in:

```text
server/.env.example
```

### 2.1 Configuring Environment Variables

Navigate to the backend directory:

```bash
cd server
```

Create a local environment file using the existing example.

**macOS:**

```bash
cp .env.example .env
```

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

Update the values to match the development environment.

An illustrative configuration is:

```env
PORT=5000

SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

SOLVER_URL=<your-solver-url>
SOLVER_TIMEOUT_MS=30000
USE_MOCK_SOLVER=false

WEB_ORIGIN=http://localhost:5173
```

**Important:** The actual required variables and their names should be taken from `server/.env.example` and `server/src/config.js`.

### 2.2 Environment-Variable Descriptions

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase public client key |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged server-side Supabase key |
| `SOLVER_URL` | URL of the Solver service |
| `SOLVER_TIMEOUT_MS` | Maximum request duration for Solver communication |
| `USE_MOCK_SOLVER` | Enables mock Solver responses when supported |
| `WEB_ORIGIN` | Authorised frontend origin |

### 2.3 Environment Security

To maintain application security:

- Never commit `.env` files to GitHub.
- Store sensitive credentials securely.
- Never expose Supabase service-role keys in frontend code.
- Use separate configurations for local development and deployment.
- Configure production variables through Render and Vercel.
- Avoid storing passwords or access tokens in documentation.

The repository contains `.gitignore` files for excluding local and sensitive files.

Ensure environment files are excluded from version control.

### 2.4 Additional Documentation

For more information about Supabase configuration, refer to:

[Supabase Configuration Guide](docs/SUPABASE.md)

---

## 3. API Documentation

The FitPortal backend is responsible for processing frontend requests, managing application data, handling authentication, and communicating with the Solver.

Backend functionality is organised into separate directories to improve maintainability and separation of responsibilities.

### 3.1 Backend Architecture

The backend source code is located in:

```text
server/src/
```

The directory contains:

| Directory/File | Purpose |
|----------------|---------|
| `data/` | Application data and related resources |
| `middleware/` | Middleware for request processing and access control |
| `models/` | Data models and related application structures |
| `routes/` | API route definitions |
| `services/` | Backend business logic and external service integrations |
| `config.js` | Application configuration |
| `index.js` | Backend application entry point |
| `passwordPolicy.js` | Password policy logic |
| `seed.js` | Development or initialisation seed logic |
| `supabase.js` | Supabase integration |

### 3.2 API Request Flow

```text
React Frontend (web/)
        |
        v
Node.js Backend (server/)
        |
        v
API Routes (src/routes/)
        |
        v
Middleware (src/middleware/)
        |
        v
Services (src/services/)
        |
        +-------------------+
        |                   |
        v                   v
Supabase Database      Solver Service
        |                   |
        +-------------------+
                 |
                 v
          API Response
                 |
                 v
          React Frontend
                 |
                 v
         Results / Visualiser
```

### 3.3 API Responsibilities

#### Authentication

Authentication is managed through Supabase Authentication.

Protected backend routes should verify user authentication and appropriate access permissions.

#### Order Management

Order-related functionality includes:

- Receiving order information from the frontend.
- Validating submitted data.
- Managing order records.
- Processing carton-related operations.
- Preparing order information for Solver execution.

#### Solver Integration

The backend communicates with the Solver service to process order information and retrieve optimisation results.

The workflow involves:

1. Receiving order data.
2. Validating the request.
3. Preparing the Solver input.
4. Sending the request to the Solver.
5. Receiving the Solver output.
6. Returning the results to the frontend.

#### Results Handling

The backend provides the communication required to make Solver output available to the frontend and integrated Visualiser.

### 3.4 API Endpoint Reference

API endpoints are defined in:

```text
server/src/routes/
```

Each endpoint should be documented using the following format:

| Field | Description |
|-------|-------------|
| Endpoint | API route path |
| HTTP Method | GET, POST, PUT, PATCH, DELETE |
| Description | Purpose of the API endpoint |
| Authentication | Required authentication or permissions |
| Request Body | Expected input data |
| Response | Expected output |
| Error Handling | Possible errors |

The exact API routes should be taken from the implemented files inside `server/src/routes/`.

### 3.5 API Error Handling

Common HTTP response codes include:

| Code | Description |
|------|-------------|
| 200 | Request successful |
| 201 | Resource created |
| 400 | Invalid request |
| 401 | Authentication required |
| 403 | Access denied |
| 404 | Resource not found |
| 500 | Internal server error |
| 502 | Upstream service error |
| 504 | Upstream service timeout |

The actual status codes returned depend on the implemented API.

---

## 4. Database Schemas

FitPortal uses Supabase, which provides PostgreSQL database functionality and authentication services.

The database supports application data storage, order management, and user authentication.

### 4.1 Database Schema Location

The SQL schema is stored in:

```text
server/supabase/schema.sql
```

This file contains the database schema definition used by the project.

The schema should be consulted when reviewing database tables, columns, relationships, and constraints.

### 4.2 Database Setup

To configure the database:

1. Log in to the Supabase dashboard.
2. Open the appropriate Supabase project.
3. Navigate to the SQL Editor.
4. Open `server/supabase/schema.sql` in the repository.
5. Review the SQL statements.
6. Execute the required statements against the appropriate database environment.
7. Verify that the expected tables and database objects have been created.

**Important:** Review the SQL file before execution, particularly when working with an existing database containing data.

### 4.3 Database Documentation

The schema should document the following information for each table:

| Attribute | Description |
|-----------|-------------|
| Table Name | Name of the database table |
| Primary Key | Unique identifier |
| Columns | Stored data fields |
| Data Types | PostgreSQL data types |
| Foreign Keys | Relationships between tables |
| Constraints | Data integrity rules |
| Access Policies | Database security and permissions |

### 4.4 Authentication

FitPortal currently supports **supervisor-only access**.

The application uses Supabase Authentication to manage authorised user login.

| Attribute | Description |
|-----------|-------------|
| User Role | Supervisor |
| Authentication | Supabase Authentication |
| Login Method | Email and password |
| Access | Authorised supervisor functionality |
| Public Registration | Not available |

**Supervisor Email:** `supervisor@thomax.com `
**Supervisor Password** `Demo@123`

### 4.5 Database Security

Database access should be protected through:

- Supabase Authentication.
- Appropriate Row Level Security policies.
- Secure environment variables.
- Server-side authentication and authorisation checks.
- Input validation.
- Restricted access to privileged credentials.

For additional information, see:

[Supabase Documentation](docs/SUPABASE.md)

---

## 5. Testing Instructions

Testing ensures that FitPortal functions correctly across the frontend, backend, database, Solver, and Visualiser.

Testing includes functional testing, integration testing, responsive design testing, authentication testing, and end-to-end testing.

### 5.1 Frontend Testing

Frontend testing focuses on the React application located in:

```text
web/
```

Testing activities include:

- Checking that all pages load correctly.
- Verifying navigation between sections.
- Testing buttons and forms.
- Validating order uploads.
- Testing carton deletion functionality.
- Checking Solver result displays.
- Verifying the updated dashboard layout.
- Testing mobile and desktop responsiveness.
- Checking user feedback and error messages.

### 5.2 Backend Testing

Backend testing focuses on the Node.js application located in:

```text
server/
```

Testing activities include:

- Verifying API request and response handling.
- Checking database connectivity.
- Testing authentication and authorisation.
- Validating order data processing.
- Testing carton-related operations.
- Verifying Solver communication.
- Checking error handling.
- Testing invalid and incomplete requests.

Backend endpoints can be tested using Postman or another API testing tool.

### 5.3 Authentication Testing

Authentication testing verifies that only authorised supervisors can access the application.

| Test Case | Expected Result |
|-----------|-----------------|
| Valid supervisor credentials | Login successful |
| Incorrect password | Login rejected |
| Unauthorised user | Access denied |
| Unauthenticated protected request | Access denied |
| Supervisor logout | Session terminated |
| Expired session | Reauthentication required |

### 5.4 Integration Testing

Integration testing verifies communication between the system components.

The following interactions should be tested:

1. Frontend to backend communication.
2. Backend to Supabase connection.
3. Supabase Authentication integration.
4. Order processing and storage.
5. Backend to Solver communication.
6. Solver response handling.
7. Visualiser integration.

### 5.5 End-to-End Testing

End-to-end testing verifies the full workflow from supervisor login to results visualisation.

**Testing Procedure:**

1. Open the FitPortal website.
2. Log in using valid supervisor credentials.
3. Navigate to the portal dashboard.
4. Upload or enter order information.
5. Verify that the order details are displayed correctly.
6. Modify or delete cartons as required.
7. Submit the order for Solver processing.
8. Verify that the Solver executes successfully.
9. Confirm that results are returned to the portal.
10. Check that the Visualiser displays the results.
11. Log out of the application.

### 5.6 Test Case Recording

| Test ID | Test Description | Expected Result | Status |
|---------|------------------|-----------------|--------|
| T01 | Supervisor login | Successful authentication | Pending |
| T02 | Invalid login | Access rejected | Pending |
| T03 | Order upload | Order uploaded successfully | Pending |
| T04 | Carton deletion | Carton removed successfully | Pending |
| T05 | Solver execution | Results returned correctly | Pending |
| T06 | Visualiser integration | Results displayed correctly | Pending |
| T07 | Mobile responsiveness | Interface works on mobile | Pending |
| T08 | Backend API testing | API responds correctly | Pending |
| T09 | Complete workflow | End-to-end process successful | Pending |

Test statuses should be updated as testing is completed.

---

## 6. Deployment Instructions

FitPortal is deployed using separate hosting services:

| Component | Hosting Platform |
|-----------|------------------|
| Frontend (`web/`) | Vercel |
| Backend (`server/`) | Render |
| Database | Supabase |

The frontend communicates with the deployed backend through API requests.

### 6.1 Frontend Deployment – Vercel

The React frontend is hosted using [Vercel](https://vercel.com/).

**Step 1: Log in to Vercel**

Visit https://vercel.com/ and sign in.

**Step 2: Import the GitHub Repository**

1. Select **Add New → Project**.
2. Connect your GitHub account.
3. Select the `Comp4050-Bionic-Portal` repository.
4. Import the repository.

**Step 3: Configure the Project**

Use the following configuration:

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Root Directory | `web` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

**Step 4: Configure Environment Variables**

Add any frontend environment variables required by the application.

The frontend must use the deployed Render backend URL when making API requests.

For example, if the frontend implementation uses `VITE_API_URL`:

```env
VITE_API_URL=https://<render-service-name>.onrender.com
```

The exact variable name must match the one used in the frontend source code.

**Step 5: Deploy**

Select **Deploy**.

Once deployment is successful, Vercel provides the frontend URL.

### 6.2 Backend Deployment – Render

The Node.js backend is hosted using [Render](https://render.com/).

**Step 1: Log in to Render**

Visit https://render.com/ and sign in.

**Step 2: Create a Web Service**

1. Select **New → Web Service**.
2. Connect the GitHub repository.
3. Select `Comp4050-Bionic-Portal`.
4. Configure the service.

**Step 3: Configure the Backend**

Use the following settings:

| Setting | Value |
|---------|-------|
| Service Type | Web Service |
| Runtime | Node |
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `npm start` (if defined in `server/package.json`) |

The start command should match the production start script defined in the backend's `package.json`.

**Step 4: Configure Environment Variables**

In Render, navigate to the service's environment settings.

Add the required backend environment variables based on `server/.env.example`.

For example:

```env
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

SOLVER_URL=<your-solver-url>
SOLVER_TIMEOUT_MS=30000
USE_MOCK_SOLVER=false

WEB_ORIGIN=https://<your-vercel-domain>
```

Ensure that the backend listens on the port provided by Render through the `PORT` environment variable.

The server should bind to `0.0.0.0` where required.

**Step 5: Deploy the Backend**

Select **Create Web Service**.

Render will install the dependencies and start the backend.

Once successfully deployed, Render provides a URL in the format:

```text
https://<service-name>.onrender.com
```

### 6.3 Connecting the Frontend and Backend

After both components have been deployed:

1. Copy the deployed backend URL from Render.
2. Configure the frontend to use this URL.
3. Ensure the backend permits requests from the Vercel frontend origin.
4. Verify the Supabase configuration.
5. Confirm that Solver communication works correctly.
6. Redeploy the frontend if environment variables or configuration have changed.

### 6.4 Redeploying the Frontend

To redeploy through Vercel:

1. Open the Vercel dashboard.
2. Select the FitPortal project.
3. Navigate to **Deployments**.
4. Select the deployment options.
5. Choose **Redeploy**.

Changes pushed to the connected GitHub branch can also trigger automatic deployment.

### 6.5 Redeploying the Backend

To redeploy through Render:

1. Open the Render dashboard.
2. Select the FitPortal backend Web Service.
3. Select **Manual Deploy**.
4. Choose **Deploy latest commit**.

Render will rebuild and restart the backend using the latest code.

### 6.6 Deployment Verification

After deployment, verify that:

- The Vercel frontend loads correctly.
- The Render backend is running.
- Frontend API requests reach the backend.
- Supervisor authentication works.
- Supabase database operations function.
- Order management features work.
- Solver requests are processed.
- The Visualiser displays results.
- The complete workflow operates correctly.

---

## 7. User and Technical Guidance

### 7.1 Supervisor User Guide

FitPortal currently provides access only to authorised supervisors.

The supervisor can use the portal to manage order information, interact with the Solver, and view results.

#### Logging In

1. Open the deployed FitPortal website.
2. Navigate to the login page.
3. Enter the authorised supervisor email.
4. Enter the corresponding password.
5. Select **Login**.

**Supervisor Email:** `[Insert authorised supervisor email]`

Passwords must be provided securely and should not be published in the README.

#### Managing Orders

Supervisors can use the portal to:

- Upload order information.
- Review submitted orders.
- Manage order details.
- Delete cartons.
- Prepare data for Solver execution.

#### Running the Solver

1. Open the relevant order.
2. Verify that the order information is correct.
3. Select the available Solver execution option.
4. Allow the processing request to complete.
5. Review the returned results.

#### Viewing Results

Once Solver processing is complete, the returned output can be accessed through the portal.

The integrated Visualiser provides a visual representation of the Solver results.

#### Logging Out

Supervisors should log out after completing their session, particularly when using shared devices.

### 7.2 Technical Guide – System Architecture

FitPortal uses a modular architecture with separate frontend, backend, database, and external integration components.

| Component | Technology | Responsibility |
|-----------|------------|----------------|
| Frontend | React + Vite | User interface |
| Backend | Node.js | API and application logic |
| Database | Supabase / PostgreSQL | Data storage |
| Authentication | Supabase Authentication | Supervisor access |
| Solver | External Solver service | Order optimisation |
| Visualiser | Integrated Visualiser package | Results display |
| Frontend Deployment | Vercel | Frontend hosting |
| Backend Deployment | Render | Backend hosting |

### 7.3 Repository Structure

The FitPortal repository is organised as follows:

```text
COMP4050-BIONIC-PORTAL/
│
├── .impeccable/
│   ├── surfaces/
│   └── design.json
│
├── docs/
│   ├── DEVELOPMENT.md
│   ├── RUNNING.md
│   └── SUPABASE.md
│
├── server/
│   ├── src/
│   │   ├── data/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── config.js
│   │   ├── index.js
│   │   ├── passwordPolicy.js
│   │   ├── seed.js
│   │   └── supabase.js
│   │
│   ├── supabase/
│   │   └── schema.sql
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
│
├── web/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
├── Bionic portal
├── DESIGN.md
├── PRODUCT.md
├── README-SPRINT1.md
└── README.md
```

The local `node_modules/` directories and private `.env` file are omitted from this representation because they should not be committed to GitHub.

### 7.4 Development Workflow

Developers should create separate branches when implementing new features.

**Step 1: Update the main branch**

```bash
git checkout main
git pull origin main
```

**Step 2: Create a development branch**

```bash
git checkout -b feature/feature-name
```

**Step 3: Make and commit changes**

```bash
git add .
git commit -m "Description of changes"
```

**Step 4: Push the branch**

```bash
git push -u origin feature/feature-name
```

Changes should be reviewed and tested before being merged into `main`.

### 7.5 Dependency Management

The frontend and backend have separate dependency configurations.

Frontend dependencies are managed through:

```text
web/package.json
```

Backend dependencies are managed through:

```text
server/package.json
```

To install frontend dependencies:

```bash
cd web
npm install
```

To install backend dependencies, return to the project root and run:

```bash
cd server
npm install
```

Dependencies can be reviewed using:

```bash
npm outdated
```

Dependency updates should be tested before being deployed.

### 7.6 Solver and Visualiser Integration

FitPortal communicates with the Solver and integrates the Visualiser to display optimisation results.

When new Solver or Visualiser changes are made:

1. Retrieve the latest approved changes.
2. Update the relevant dependencies or integration code.
3. Verify that request and response formats remain compatible.
4. Test the changes locally.
5. Complete integration and end-to-end testing.
6. Merge the approved changes into the main branch.
7. Redeploy affected services using Vercel or Render.
8. Verify that the deployed application functions correctly.

### 7.7 Additional Project Documentation

The repository also contains supporting documentation:

| File | Description |
|------|-------------|
| [DEVELOPMENT.md](docs/DEVELOPMENT.md) | Development-related documentation |
| [RUNNING.md](docs/RUNNING.md) | Application running and setup guidance |
| [SUPABASE.md](docs/SUPABASE.md) | Supabase configuration documentation |
| [DESIGN.md](DESIGN.md) | Project design documentation |
| [PRODUCT.md](PRODUCT.md) | Product-related documentation |
| [README-SPRINT1.md](README-SPRINT1.md) | Sprint 1 documentation |

### 7.8 Future Improvements

Future improvements may include:

- Additional automated frontend and backend testing.
- More detailed API endpoint documentation.
- Expanded database schema explanations.
- Improved mobile responsiveness.
- Enhanced error handling.
- Additional access-control functionality.
- Improved system monitoring and deployment processes.

These improvements will support the long-term maintainability, reliability, and usability of FitPortal.

## Academic Project Notice

This repository contains work produced for **COMP4050 at Macquarie University**.

Project materials should be used and shared according to the unit, client, university, and team requirements.
