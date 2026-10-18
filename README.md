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

## Academic Project Notice

This repository contains work produced for **COMP4050 at Macquarie University**.

Project materials should be used and shared according to the unit, client, university, and team requirements.
