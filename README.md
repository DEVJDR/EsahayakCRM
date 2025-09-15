# Esahayak Leads Management System

Welcome to the Esahayak Leads Management System! This is a Next.js application integrated with Supabase, designed to help you manage buyer leads efficiently. This README provides clear setup instructions, design insights, and an overview of the project's development progress.

## Setup

### Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (version 18.x or later)
- **npm** (version 9.x or later)
- A **Supabase project** (for database and authentication services)

### Environment Setup
To connect the app to your Supabase instance, create a `.env.local` file in the root directory and add the following environment variables:
```plaintext

NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>

Replace <your-supabase-project-url> with your Supabase project URL (e.g., https://your-project.supabase.co).
Replace <your-supabase-anon-key> with your Supabase anonymous API key (found in your Supabase dashboard under Settings > API).

 Database Migration and SeedingMigration:Set up a buyers table in your Supabase database with the following columns:id (UUID, primary key)

full_name (text, not null)
email (text)
phone (text, not null)
city (text, not null)
property_type (text, not null)
bhk (text)
purpose (text, not null)
budget_min (integer)
budget_max (integer)
timeline (text, not null)
source (text, not null)
status (text, not null)
notes (text)
tags (text[])
owner_id (UUID, not null)
updated_at (timestamp with time zone, not null, default: now())

You can create this table via the Supabase dashboard or SQL editor.

Seeding:To populate the database with initial data, you can manually import a CSV file (e.g., buyers_export_2025-09-14T16_28_00.491Z.csv) using the Supabase UI or API. No automated seed script is provided yet—manual seeding is recommended for now.

How to Run LocallyClone the Repository:Run the following commands to clone and navigate to the project directory:bash

<<<<<<< HEAD
git clone https://github.com/DEVJDR/EsahayakCRM.git
cd EsahayakCRM
npm i
npm run dev
=======
    git clone https://github.com/DEVJDR/EsahayakCRM.git
    cd EsahayakCRm
    npm i
    npm run dev
>>>>>>> aa796a087a392761c5d9dffe6130aedecab8821d


Open your browser and visit http://localhost:3000.
 Log in using the authentication flow (via AuthProvider) to access protected routes like /buyers, /buyers/new, /buyers/[id]/edit, 
 /buyers/import, and /buyers/export.



Design NotesWhere Validation LivesLocation: 
 Validation rules are defined in the  "@/validators/buyer" module using a library like Zod. The buyerCreateSchema specifies the structure and constraints for BuyerInput, including required fields (e.g., full_name, phone) and enum values (e.g., bhk, status).

Implementation:
 Client-side validation is performed in forms (e.g., EditBuyerPage, ImportPage) using safeParse to validate data before submission. Server-side validation is enforced by Supabase’s database constraints (e.g., not null fields).

SSR vs ClientServer-Side Rendering (SSR):
The application uses client components (marked with "use client") for pages like BuyersPage and EditBuyerPage to support dynamic data fetching and state management. SSR is not implemented due to the need for real- time user interactions and authentication state.

Client-Side Rendering (CSR): 
 All pages rely on client-side logic to fetch data from Supabase, manage filters, and handle form submissions. This approach ensures interactivity but may affect initial load times.

Ownership EnforcementMechanism: 
 Ownership is enforced by comparing the owner_id in the buyers table with the authenticated user’s ID (via useAuth). In EditBuyerPage, if the owner_id does not match the current user, an error is displayed to prevent unauthorized edits.
 Implementation: This check is performed during data fetching in a useEffect hook, ensuring permission is verified before loading the form.

What’s Done vs Skipped (and Why)

DoneCore Functionality:
 Developed BuyersPage to list and filter buyer leads with pagination.
 Created EditBuyerPage for editing leads with form validation and concurrency checks.
 Built ImportPage and ExportPage for CSV-based data import and export using PapaParse.
 UI/UX:Enhanced all pages with modern styling (e.g., gradients, shadows, hover effects) using Tailwind CSS.
 Ensured responsiveness across mobile, tablet, and desktop with grid and flex layouts.
 Authentication:Integrated AuthProvider for user session management and route protection.
 Error Handling:Added ErrorBoundary components and detailed error messages for fetch and validation issues.
 Type Safety:Resolved TypeScript errors for PapaParse by installing @types/papaparse.
 Data Fetching:Implemented Supabase integration for CRUD operations with proper typing.

SkippedEnd-to-End (E2E) Tests:Why: 
Prioritized core functionality and UI over testing due to time constraints. E2E tests (e.g., with Cypress) are planned but deferred to ensure a working prototype first.

Performance Optimization:Why: 
 Focused on functionality and UI initially. Optimizations like lazy loading or memoization will be added later based on user feedback.

Automated Seeding:Why: 
 Manual seeding via the Supabase dashboard or CSV import was sufficient for initial development. An automated seed script was skipped to avoid overcomplicating setup.

Advanced Features:
 Skipped features like bulk edit, advanced search, or real-time updates to focus on MVP (Minimum Viable Product) requirements.

Documentation:
 Omitted detailed API docs or contributor guidelines to prioritize code completion, with this README as the primary guide.

Future ConsiderationsAdd E2E tests to validate workflows (e.g., import/export, form submission).

  Optimize performance with pagination improvements or caching.
  Enhance schema validation to handle conditional bhk requirements dynamically.
  Automate seeding with a script for easier setup.


![Login Page](https://raw.githubusercontent.com/DEVJDR/EsahayakCRM/main/app/buyers/images/login.png)
![Dashboard](https://raw.githubusercontent.com/DEVJDR/EsahayakCRM/main/app/buyers/images/dashboard.png)
