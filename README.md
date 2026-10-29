
# Bionic FitPortal

**Project Perfect Fit**

Bionic FitPortal is a web-based application developed for **Thomax** as part of Project Perfect Fit.

FitPortal serves as the user interface, API, database, and integration layer for the project, enabling authorised users to manage packing orders, execute packing optimisation, and visualise results.

The FitPortal team works collaboratively with **FitSolver** and **FitVisualizer** to deliver an integrated packing optimisation solution.

---

## Live Website

FitPortal has been successfully deployed and can be accessed online.

**Website:** https://comp4050-bionic-portal-blush.vercel.app/

The application is hosted using:
- **Frontend:** Vercel
- **Backend:** Render
- **Database and Authentication:** Supabase

> Replace the website URL above with the actual deployed Vercel link.

### Login Credentials

FitPortal supports two user roles: **Supervisor** and **Operator**.

The following accounts are intended for authorised demonstration and testing purposes.

| Role | Email | Password |
|------|-------|----------|
| **Supervisor** | `supervisor@example.com` | Demo@123 |
| **Operator** | `operator@example.com` | perfectfit |

**Note:** Replace the example email addresses with the actual authorised demo account emails. Passwords should be shared securely with the project supervisor, assessors, and authorised team members rather than published in the repository.

### How to Access FitPortal

1. Open the [FitPortal website](https://comp4050-bionic-portal-blush.vercel.app/)
2. Navigate to the login page.
3. Enter the email address and password for your assigned account.
4. Click **Login**.
5. Once authenticated, the user will be directed to the appropriate portal interface based on their role.

### User Roles

**Supervisor**

The Supervisor role provides access to supervisory and management functionality within FitPortal, according to the permissions configured for the account.

**Operator**

The Operator role provides access to operational functionality, allowing authorised users to interact with the portal according to their assigned permissions.

Authentication and access control are managed through Supabase.

---

## Mission

Our mission is to develop a secure, mobile-first, and user-friendly FitPortal that enables operational and back-end users to manage packing orders and seamlessly connects FitSolver with FitVisualizer.

Our goal is to deliver clear and practical packing results while supporting real-world handling constraints.

---

## System Overview

FitPortal acts as the central access point between users, FitSolver, and FitVisualizer.

### System Workflow

1. An authorised user submits order, item, carton, and handling information.
2. FitPortal validates and stores the submitted information.
3. FitPortal sends a packing request to FitSolver.
4. FitSolver processes the request and returns a packing solution or failure response.
5. FitPortal stores and presents the returned results.
6. FitPortal provides the results to FitVisualizer for interactive inspection.

### System Flow

```text
User (Supervisor / Operator)
             |
             v
         FitPortal
             |
             v
          FitSolver
             |
             v
         FitPortal
             |
             v
        FitVisualizer
             |
             v
            User
```

---

## Key Features

FitPortal provides the following core functionality:

- **Authentication and Access Control:** Secure login with Supervisor and Operator roles.
- **Order Management:** Uploading, viewing, and managing packing orders.
- **Item and Carton Management:** Managing carton information and relevant packing requirements.
- **Input Validation:** Validating submitted information and providing error feedback.
- **Solver Integration:** Communicating with FitSolver to generate packing solutions.
- **Visualiser Integration:** Displaying packing results through FitVisualizer.
- **Results Management:** Accessing Solver results and packing information.
- **Responsive Interface:** Supporting desktop and mobile usage.

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Authentication |
| Data Exchange | REST APIs and JSON |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| Version Control | Git and GitHub |
| Project Management | Trello |
| Communication | Discord |

---

## Getting Started

### Prerequisites

Before running the application locally, ensure that the following software is installed:

- [Node.js](https://nodejs.org/) (version 20 or higher)
- npm
- [Git](https://git-scm.com/)
- Visual Studio Code (recommended)

### Clone the Repository

```bash
git clone <repository-url>
cd Comp4050-Bionic-Portal
```

### Install and Run the Backend

From the repository root:

```bash
cd server
npm install
```

Create a `.env` file using the provided `.env.example` configuration.

Start the backend:

```bash
npm run dev
```

### Install and Run the Frontend

Open a new terminal from the repository root:

```bash
cd web
npm install
npm run dev
```

Open the local URL displayed in the terminal, typically:

```text
http://localhost:5173
```

Both the frontend and backend must be running for the complete application to function locally.

For detailed instructions, refer to the [Running Guide](docs/RUNNING.md).

---

## Project Documentation

Detailed documentation is available in the `docs/` directory.

| Documentation | Description |
|---------------|-------------|
| [Project Overview](docs/PROJECT_OVERVIEW.md) | Project background, mission, team roles, responsibilities, and sprint planning |
| [Development Guide](docs/DEVELOPMENT.md) | Development practices and Git workflow |
| [Running Guide](docs/RUNNING.md) | Local setup and application execution |
| [Supabase Guide](docs/SUPABASE.md) | Database and authentication configuration |
| [Design Documentation](docs/DESIGN.md) | System architecture and design decisions |
| [Product Documentation](docs/PRODUCT.md) | Product requirements and functionality |

---

## Project Teams

Project Perfect Fit consists of three collaborating teams.

| Team | Responsibility |
|------|----------------|
| **FitPortal** | User interface, backend API, database, authentication, and integration |
| **FitSolver** | Packing optimisation algorithm |
| **FitVisualizer** | Visualisation of packing solutions |

For detailed FitPortal team roles and responsibilities, refer to the [Project Overview](docs/PROJECT_OVERVIEW.md).

---

## Testing and Deployment

FitPortal has been deployed with its frontend hosted on Vercel and backend hosted on Render.

Testing activities cover:

- Frontend functionality
- Backend API operations
- Supervisor and Operator authentication
- Database connectivity
- Solver integration
- Visualiser integration
- Desktop and mobile responsiveness
- End-to-end workflow verification

Additional testing and documentation updates are maintained as part of ongoing project finalisation.
