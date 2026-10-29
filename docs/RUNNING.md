# Running FitPortal

Two terminals, one for each half.

## Terminal 1 — server

First time — set up Supabase first (schema + keys), see
[SUPABASE.md](SUPABASE.md). Then:

```bash
cd server && npm install && cp .env.example .env && npm run seed && npm run dev
```

After that:

```bash
cd server && npm run dev
```

## Terminal 2 — web

First time:

```bash
cd web && npm install && npm run dev
```

After that:

```bash
cd web && npm run dev
```

Then open **http://localhost:5173**

## Login

```
operator@thomax.test
perfectfit
```
# Accessing the Live FitPortal Website

FitPortal is deployed and accessible online through Vercel, with its backend hosted on Render.

**Live Website:** (https://comp4050-bionic-portal-blush.vercel.app/)

To access the portal:

1. Open the live FitPortal website using the link above.
2. Navigate to the login page.
3. Enter your registered email address and password.
4. Click **Login** to access the portal.
5. Once authenticated, users will be able to access the features available to their assigned role.

### User Roles and Access Permissions

FitPortal supports two user roles: **Supervisor** and **Operator**. Access to system functionality is determined by the user's assigned role.

#### Supervisor

The Supervisor role provides access to supervisory and management functionality within FitPortal.

Supervisors can access the portal using their authorised email address and password.

**Supervisor Email:** `supervisor@thomax.com`
**Supervisor Password:** `Demo@123`

#### Operator

The Operator role is assigned to all other authorised users who are not supervisors.

Operators can log in using their registered email addresses and passwords and access the operational functionality available to their role.

Operator log in can also use our existing Operator account:

**Operator Email:** `operator@thomax.com`
**Operator Password:** `perfectfit`

#### Role-Based Access Control

| Role | Description |
|------|-------------|
| **Supervisor** | Access to supervisory and management functionality |
| **Operator** | Access to operational functionality according to assigned permissions |

Users are authenticated through Supabase Authentication, and access to protected functionality is restricted according to their assigned role.

**Note:** Login credentials must be provided securely to authorised users and should not be published in the repository.

### Logging Out

After completing their session, users should log out of FitPortal to prevent unauthorised access, particularly when using shared devices.
