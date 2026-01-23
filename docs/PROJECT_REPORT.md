
# SCINGULAR AI: Project Origin, Architecture, and Feature Report

**Report Date:** January 2, 2026
**Project Start Date (per `CHANGELOG.md`):** December 4, 2025

## 1.0 Executive Summary: Purpose and Vision

The **SCINGULAR AI** application is the web-based command center for a comprehensive, voice-first, AI-powered inspection and field intelligence ecosystem. Its primary purpose is to transform the traditionally analog and error-prone inspection industry into a streamlined, data-driven, and highly efficient operation.

The core vision, as detailed in the project's documentation, is to empower a single field operator to perform the work of an entire specialized team with greater accuracy, speed, and legally defensible data integrity. This is achieved through a philosophy termed **Bona Fide Intelligence (BFI)**, where Artificial Intelligence is framed as **Augmented Intelligence**—a tool that enhances human capability and decision-making rather than replacing the expert.

The application serves as the primary interface for managing inspections, teams, clients, and finances, while also being the gateway to a suite of powerful, specialized AI engines.

## 2.0 Core Architectural Pillars: The AI Trinity

The platform's intelligence is built on three synergistic and proprietary AI engines that work in concert. Understanding their roles is key to understanding the application's purpose.

*   #### **LARI™ (Logistical, Analytical, & Reporting Interface)**
    *   **Purpose:** LARI is the **Analytical Brain** of the ecosystem. It is not a single AI but a federation of specialized sub-engines, each designed to process a specific type of data from the physical world (e.g., images, 3D scans, thermal readings). Its function is to turn raw sensor data into structured, actionable insights.
    *   **Features:**
        *   `LARI-VISION`: Analyzes images and video for defect recognition (cracks, corrosion) and text recognition (OCR).
        *   `LARI-MAPPER`: Processes LiDAR and 3D scans to create precise floorplans and geometric models.
        *   `LARI-THERM`: Interprets thermal imaging to find heat anomalies, moisture, and insulation gaps.
        *   `LARI-PRISM`: Analyzes material composition using spectrometry data.
        *   `LARI-COMPLIANCE`: Cross-references findings against a vast library of building codes and standards.
        *   `LARI-SYNTHESIZER` & `LARI-NARRATOR`: Generate final written reports and audio summaries.
        *   `LARI-GUANGEL`: The "Guardian Angel" AI that monitors user biometrics and environmental data for safety alerts.

*   #### **Scing™ AI (The Scingular AI Automaton)**
    *   **Purpose:** Scing is the **Conversational Field Partner**. It is the primary, user-facing AI that you interact with via voice or text. It understands natural language, interprets intent, and orchestrates tasks by commanding the LARI engines and other parts of the system.
    *   **Features:**
        *   **Voice Activation:** Uses "Hey, Scing!" wake-word detection for hands-free operation.
        *   **Command Processing:** Understands commands like "Start a new inspection" or "Is this crack within code?" and routes them to the correct backend service.
        *   **Autonomous UI Control:** Has the capability to directly manipulate the application's user interface—clicking buttons, filling forms, and navigating pages in response to voice commands.

*   #### **BANE™ (Business Analytics & Network Engine)**
    *   **Purpose:** BANE is the silent **Guardian and Business Strategist**. It ensures the integrity of all data and manages the platform's commercial logic.
    *   **Features:**
        *   **Security & Data Provenance:** Cryptographically signs every piece of data to create an immutable "digital chain of custody," making all reports legally defensible.
        *   **Entitlement Management:** Manages user subscriptions and access to specialized LARI engines via a system of "Keys."
        *   **Business Intelligence (DaaS):** Anonymizes and aggregates network-wide data to generate high-value analytics products for industries like insurance and real estate finance.

## 3.0 Application Page & Feature Tree

The application is structured as a single-page application (SPA) with a persistent sidebar for navigation and a central content area. Below is the complete tree of all pages created so far, from the initial loading screen to the deepest settings panel.

```
/
├── (auth)
│   ├── /                 (Login Page)
│   ├── /signup           (User Registration Page)
│   └── /forgot-password  (Password Reset Page)
│
└── (main application with AppShell)
    ├── /dashboard        (Main Dashboard & Command Center)
    ├── /overview         (High-Level Strategic & Technical Overview)
    ├── /inspections
    │   ├── /             (List of all inspections)
    │   ├── /new
    │   │   ├── /         (Step 1: Select Inspection Template)
    │   │   └── /[slug]   (Step 2: Client & Property Details - Dynamic Form)
    │   └── /[id]         (Inspection Detail View: Overview, Findings, Report)
    ├── /calendar         (Team Scheduling and Availability View)
    ├── /bookings
    │   └── /new          (Start of the New Booking Wizard)
    ├── /messaging        (Real-time Team & Client Chat Hub)
    ├── /clients
    │   ├── /             (List of all clients)
    │   └── /[id]         (Client Detail View)
    ├── /teams
    │   ├── /             (Team Dispatch Hub with Live Map)
    │   ├── /jobs         (Job Board for Unassigned Tasks)
    │   └── /[id]
    │       ├── /         (Team-Specific Hub and Roster)
    │       └── /availability (Individual Inspector Schedule)
    ├── /conference-rooms
    │   ├── /             (Hub for all meetings and conferences)
    │   └── /[id]         (Individual Conference Room with Chat)
    ├── /maps-weather     (Full-screen map with weather overlays)
    ├── /library          (Standards and Code Document Vault)
    ├── /marketplace      (Hub for finding inspectors, services, and LARI Keys)
    ├── /community        (Main community feed)
    ├── /social           (A more detailed social timeline view)
    ├── /topics           (Directory of community discussion topics)
    ├── /workstation
    │   ├── /             (Personal Settings Hub)
    │   ├── /devices
    │   │   └── /[id]     (Device Lab: Live HUD and controls)
    │   ├── /keys
    │   │   └── /[id]
    │   │       ├── /     (LARI Key configuration)
    │   │       └── /periodic-table (LARI-PRISM element selector)
    │   ├── /vision       (LARI-VISION direct analysis lab)
    │   └── /lidar        (LARI-MAPPER 3D viewer interface)
    ├── /finances         (Financial Hub for subscriptions, invoices, and payouts)
    ├── /profile          (User's public-facing professional profile)
    └── /admin            (Administrator Control Center for user management)
```

## 4.0 User Flow: From Launch to Report

This narrative describes a typical user journey through the application, showcasing how the pages and features connect.

1.  **Launch & Authentication:** The user first sees a dynamic, full-screen **background slideshow** (`BackgroundSlideshow`) with the **Login Page** (`/`) overlaid. The user enters their credentials, which are verified by Firebase Authentication.
2.  **Dashboard Landing:** Upon successful login, the user is redirected to the **Dashboard** (`/dashboard`). Here, they see a high-level overview: key metrics, a live map of their team, their agenda for the day, and any new announcements or safety alerts from the AI.
3.  **Starting a Job:** The user receives a new job request. They navigate to **Inspections** (`/inspections`) and click "Start New Inspection."
4.  **New Inspection Wizard:** They enter the multi-step wizard (`/inspections/new/...`).
    *   First, they select a template, like "General property condition assessment," from a comprehensive library.
    *   Next, they are taken to a dynamic page for that inspection type (`/inspections/new/general-property...`) where they can add a new client or select an existing one.
    *   Finally, they review all details and confirm.
5.  **Performing the Inspection:** The user is now on the **Inspection Detail Page** (`/inspections/[id]`).
    *   They use their device to capture a photo of a potential foundation crack. This evidence is sent to the **LARI-VISION Lab** (`/workstation/vision` conceptually) for analysis.
    *   LARI-VISION returns a structured finding: "Hairline Crack, Severity: Medium, Confidence: 92%." This automatically populates the "Findings" tab.
    *   The user then uses voice: *"Hey, Scing, what's the building code for this type of crack?"*
    *   **Scing AI** processes the command, sends the finding details to **LARI-COMPLIANCE**, which queries the **Standards Library** (`/library`), and responds with the relevant code section (e.g., "ACI 318-19, Section 7.4.1"). This reference is automatically added to the finding.
6.  **Team Collaboration:** The user needs to consult a specialist. They navigate to **Teams & Dispatch** (`/teams`) and find a structural engineer on the live map. They initiate a chat via the **Messaging** (`/messaging`) system to get a second opinion.
7.  **Finalizing the Report:** Once the inspection is complete, the user navigates to the "Report" tab.
    *   They click "Generate Report," which uses **LARI-SYNTHESIZER** to compile all findings, summaries, and evidence.
    *   They can also trigger **LARI-NARRATOR** to create an AI-generated audio summary of the report for the client.
    *   Finally, they digitally sign the report. The entire package is cryptographically signed by **BANE** and stored securely.
8.  **Financials & Logout:** After the job is billed, the transaction appears in the **Finances** (`/finances`) hub. At the end of the day, the user logs out via the profile menu in the main application shell.

## 5.0 Conclusion

The SCINGULAR AI application is an ambitious, vertically-integrated platform designed to be the definitive operating system for the inspection industry. It combines a feature-rich web interface with a powerful suite of backend AI engines to deliver unprecedented efficiency, accuracy, and data security. While currently facing some technical challenges related to dependency management, its foundational architecture and comprehensive feature set are well-documented and poised for significant impact.
