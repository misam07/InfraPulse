# InfraPulse – Project Specification

**Project:** InfraPulse  
**Type:** Infrastructure Monitoring Platform  
**Status:** Initial Development  
**Development approach:** AI-assisted development using OpenCode

---

# 1. Project Overview

InfraPulse is a self-hosted infrastructure monitoring platform that provides a centralized dashboard for monitoring Linux servers and Docker containers.

The platform will allow users to monitor infrastructure health, visualize resource utilization, inspect running containers, and receive alerts when system resources cross configured thresholds.

The primary objective is to create a functional, lightweight alternative to basic infrastructure monitoring dashboards.

## Core objectives

- Monitor multiple Linux servers.
- Display real-time infrastructure metrics.
- Monitor Docker containers and their resource utilization.
- Visualize historical metrics through interactive charts.
- Detect infrastructure problems through configurable alerts.
- Provide a clean, modern and responsive user interface.

# 2. Target Users

- Linux system administrators.
- DevOps engineers.
- Cloud engineers.
- Developers managing their own servers.
- Homelab enthusiasts.

# 3. Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts for charts
- Lucide icons

## Backend

- Python
- FastAPI
- Pydantic
- Prometheus HTTP API client

## Monitoring

- Prometheus – metrics collection and time-series storage.
- Node Exporter – Linux server metrics.
- cAdvisor – Docker container metrics.

## Database

- PostgreSQL

Database responsibilities:
- Application users.
- Registered server information.
- Server metadata.
- Alert configurations.
- User preferences.

Prometheus will store infrastructure time-series metrics rather than PostgreSQL.

## Infrastructure and Deployment

- Docker
- Docker Compose
- Linux
- Git and GitHub

# 4. Application Architecture

The application will follow a modular architecture.

### Frontend

The Next.js application will:
- Display the monitoring dashboard.
- Manage registered servers.
- Display server metrics and historical charts.
- Display Docker container information.
- Show alerts and notifications.
- Communicate with the backend API.

### Backend

The FastAPI application will:
- Expose REST API endpoints.
- Query Prometheus for infrastructure metrics.
- Retrieve application information from PostgreSQL.
- Process and format monitoring data.
- Manage server registration.
- Evaluate configured alert thresholds.

### Monitoring Infrastructure

Node Exporter will expose Linux system metrics.

cAdvisor will expose container metrics.

Prometheus will scrape these exporters and retain their time-series data.

FastAPI will query Prometheus and provide the required information to the frontend.

# 5. Main Application Modules

## Module 1: Overview Dashboard

The main dashboard should display:

- Total registered servers.
- Online and offline servers.
- Average CPU utilization.
- Average memory utilization.
- Total monitored containers.
- Active alerts.

Include the following visualizations:

- CPU utilization over time.
- Memory utilization over time.
- Disk utilization.
- Network traffic.
- Server health overview.

## Module 2: Server Management

Users should be able to:

- Register a monitoring target.
- View registered servers.
- View server details.
- Monitor server availability.
- View server resource utilization.
- Remove registered servers.

Each server should display:

- Hostname.
- IP address or hostname used for monitoring.
- Operating system information when available.
- CPU utilization.
- Memory utilization.
- Disk utilization.
- Network information.
- Last successful metric collection time.
- Current monitoring status.

## Module 3: Docker Monitoring

Display:

- Running containers.
- Stopped containers.
- Container names.
- Container IDs.
- Docker image names.
- Container CPU utilization.
- Container memory utilization.
- Container uptime.

Provide a detailed container view with historical resource usage and logs where supported.

Initial versions should use read-only monitoring.

## Module 4: Alerts

Allow users to configure thresholds.

Examples:

- CPU utilization above 85%.
- Memory utilization above 90%.
- Disk utilization above 90%.
- Server unavailable.

Display:
- Alert name.
- Severity.
- Affected server.
- Current value.
- Configured threshold.
- Alert timestamp.
- Resolution status.

## Module 5: Historical Metrics

Users should be able to inspect historical resource utilization.

Provide time filters:
- Last 15 minutes.
- Last hour.
- Last 6 hours.
- Last 24 hours.
- Last 7 days.

Use Prometheus queries to retrieve historical metrics.

# 6. UI/UX Requirements

The application should have a polished, professional infrastructure-monitoring interface.

### Design direction

- Dark theme by default.
- Modern SaaS dashboard aesthetic.
- Professional typography.
- Clean navigation sidebar.
- Consistent spacing.
- Subtle borders and shadows.
- Responsive layouts.
- Interactive charts.
- Clear status indicators.
- Loading, empty and error states.

### Navigation

Sidebar:

1. Overview
2. Servers
3. Containers
4. Alerts
5. Settings

The dashboard should prioritize readability and information density without becoming visually cluttered.

Avoid excessive animations and unnecessary visual effects.

# 7. Development Roadmap

Development must happen incrementally.

## Phase 1 – Frontend Foundation

Build a complete dashboard using simulated data.

Tasks:
- Initialize Next.js.
- Configure TypeScript and Tailwind CSS.
- Establish the folder structure.
- Implement the dashboard layout.
- Create reusable metric cards.
- Add interactive charts.
- Implement responsive navigation.
- Create sample server and container views.

Acceptance criteria:
- Application runs locally.
- Dashboard displays simulated metrics.
- Charts render correctly.
- Navigation works.
- UI is responsive.
- No backend integration is required yet.

## Phase 2 – Backend Foundation

Tasks:
- Initialize FastAPI.
- Create modular API structure.
- Configure environment variables.
- Add health-check endpoint.
- Create initial API endpoints.
- Add API documentation.
- Integrate frontend with backend.

Acceptance criteria:
- Backend starts successfully.
- API health check works.
- Frontend can retrieve data from backend.
- Proper error handling is implemented.

## Phase 3 – Database Integration

Tasks:
- Configure PostgreSQL.
- Create database schema.
- Implement server registration.
- Implement server listing and removal.
- Add database migrations.

Acceptance criteria:
- Server records persist.
- API can retrieve and update server information.
- Database configuration uses environment variables.

## Phase 4 – Real Infrastructure Monitoring

Tasks:
- Deploy Prometheus.
- Configure Node Exporter.
- Configure Prometheus scrape targets.
- Connect FastAPI to Prometheus.
- Replace simulated metrics with real metrics.
- Display CPU, RAM, disk and network utilization.

Acceptance criteria:
- A real Linux server can be monitored.
- Dashboard displays actual infrastructure metrics.
- Historical metrics are available.
- Monitoring failures are displayed clearly.

## Phase 5 – Docker Monitoring

Tasks:
- Integrate cAdvisor.
- Configure Prometheus scraping.
- Retrieve container metrics.
- Display container information.
- Implement container detail pages.

Acceptance criteria:
- Running containers are visible.
- Container resource utilization is displayed.
- Container monitoring data updates correctly.

## Phase 6 – Alerting

Tasks:
- Implement configurable thresholds.
- Evaluate metric thresholds.
- Store alert events.
- Display active and resolved alerts.
- Implement alert history.

## Phase 7 – Authentication and Deployment

Tasks:
- Implement authentication.
- Add user-specific server access.
- Secure API endpoints.
- Create production Docker Compose configuration.
- Document deployment procedures.
- Add application health checks.

# 8. Proposed Folder Structure

Start with a monorepo structure:

infrapulse/
├── PROJECT.md
├── README.md
├── .gitignore
├── frontend/
│   ├── app/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── servers/
│   │   ├── containers/
│   │   ├── charts/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── public/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   └── requirements.txt
│
├── monitoring/
│   ├── prometheus/
│   │   └── prometheus.yml
│   └── exporters/
│
└── docker-compose.yml

The structure can evolve as requirements become clearer. Do not create unnecessary files or modules prematurely.

# 9. Security Requirements

Security must be considered from the beginning.

- Never hardcode credentials or API keys.
- Use environment variables for secrets.
- Never commit .env files.
- Protect API endpoints.
- Validate incoming API requests.
- Apply authentication and authorization before production deployment.
- Restrict access to monitoring endpoints.
- Do not expose the Docker socket to the public internet.
- Use read-only monitoring wherever possible.
- Avoid executing arbitrary shell commands received from the frontend.
- Do not expose Prometheus or exporter endpoints publicly without appropriate access controls.

# 10. Development Rules for AI Coding Agents

OpenCode will act as the primary AI coding agent.

Follow these rules throughout development:

1. Read PROJECT.md before starting any development task.
2. Work on one milestone at a time.
3. Do not implement future milestones prematurely.
4. Explain the implementation plan before making significant changes.
5. Ask for approval before major architectural decisions.
6. Prefer simple, maintainable and modular code.
7. Follow official documentation and supported APIs.
8. Do not invent dependencies or configuration options.
9. Do not introduce unnecessary technologies.
10. Run relevant checks after implementing features.
11. Fix errors before declaring a milestone complete.
12. Do not overwrite existing working functionality without justification.
13. Update README.md when setup or configuration changes.
14. Explain important code changes in beginner-friendly language.

For every feature, provide:
- What was implemented.
- Which files were changed.
- How the implementation works.
- How to test it.
- Any known limitations.

# 11. Initial Development Scope

The first release will focus exclusively on Phase 1.

Do not implement:
- Real server monitoring.
- Prometheus integration.
- PostgreSQL integration.
- Authentication.
- Docker management operations.
- Alert processing.

Use realistic simulated data for the initial dashboard.

The architecture should remain extensible so future phases can replace simulated data with real monitoring services.

# 12. Definition of Success

InfraPulse should eventually provide a reliable, self-hosted monitoring dashboard that can monitor multiple Linux servers and Docker workloads through a single interface.

The project should demonstrate practical knowledge of:

- Frontend development.
- Backend API development.
- Database design.
- Linux administration.
- Monitoring and observability.
- Docker and containerization.
- Infrastructure deployment.
- Security fundamentals.

**Current priority: Build a polished, functional Phase 1 dashboard before introducing backend complexity.**
