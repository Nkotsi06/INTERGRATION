# Integrated Government Services System — Lesotho

A centralized citizen identity and government services platform that connects **Home Affairs, Traffic, Police, Finance, Pensions, and Passport Services** through a Single Citizen Profile concept.

Built for the BIHC3212 Human-Computer Interaction assignment at Limkokwing University of Creative Technology, Lesotho.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Installation](#installation)
7. [Environment Setup](#environment-setup)
8. [Database Setup](#database-setup)
9. [Running the Application](#running-the-application)
10. [Login Credentials](#login-credentials)
11. [API Endpoints](#api-endpoints)
12. [Key Concepts](#key-concepts)
13. [Deployment](#deployment)
14. [Troubleshooting](#troubleshooting)

---

## Overview

The Integrated Government Services System is a full-stack application that allows Basotho citizens to access government services online, eliminating the need to visit multiple ministries in person. Home Affairs serves as the master source of verified citizen identity, and all other ministries retrieve that verified identity instead of asking citizens to re-submit documents.

**Three user tiers:**

- **Citizens** — register, log in, verify identity, apply for services
- **Government Staff** — one role per ministry (Home Affairs, Traffic, Police, Finance, Pensions, Passport)
- **System Administrators** — manage users, roles, and system settings

---

## Features

### Citizen Features

- Apply for a birth certificate without an account; upload the required supporting documents for Home Affairs review
- Receive a generated National ID and temporary account when a birth application is approved
- Register an existing National ID against the simulated national registry and change the generated password on first sign-in
- Session-based identity verification using National ID
- View and update personal profile
- Apply for services online (birth certificates, passports, and driver's licences)
- Track application status by reference number
- View, download, and manage documents
- Renew driver's licences and book driving tests
- Report police cases and track case status
- Verify pension existence digitally
- Apply for and track passports

### Staff Features (per ministry)

- Search citizens by National ID
- View verified Home Affairs profile
- Process applications and update statuses
- Generate reports
- Manage records specific to their ministry

### Admin Features

- Manage users (create, edit, deactivate)
- Assign roles and ministries
- View audit logs
- Configure system settings (colours, document types, statuses, languages, logo)
- Manage biometric settings

### System-Wide

- Session-based identity verification (cleared on every logout)
- Role-based access control enforced at API level
- Audit logging for all important actions
- Multi-language support (English, Sesotho)
- Responsive design (desktop and mobile)
- Accessibility features (WCAG AA, keyboard navigation, focus states)
- File uploads (documents, signatures, biometrics, photos, logos)
- Unique reference number generation
- Status history tracking (never overwritten)

### Birth certificate processing

The public birth application accepts PDF/JPG uploads for parent or guardian National ID(s), a religious confirmation letter, a chief's letter, and a medical certificate or health booklet. Files are stored outside the public uploads directory. Home Affairs staff review applications in the Birth Certificate Applications queue; approval creates the citizen record, unique National ID, temporary account, and QR-verifiable PDF certificate. The reviewing officer receives the temporary credentials for secure handoff to the applicant; automatic email delivery is not configured in this project.

Apply database migrations `015_birth_certificate_registration.sql` and `016_remove_tax_business_vat_and_plans.sql` after the existing migrations. The second migration removes the retired tax, VAT, business registration, and payment-plan data structures and catalogue entries.

Apply `017_finance_registers.sql` to create the government employer and employee registers. Finance employer options are synchronized from distinct Home Affairs employment-history entries marked `GOVERNMENT` (the history table is created by `002_pensions_eligibility.sql`). Existing employer names are matched case-insensitively, and admin-disabled employers remain disabled.

Apply `020_citizen_finance_services.sql` after the existing migrations to enable citizen employment declarations and private proof uploads. Citizen service and passport application fees are recorded as due on submission and can be paid later from the Finance dashboard; Finance payments use the simulated mobile-money gateway. Passport applications do not require applicants to upload or capture a photo.

Apply `021_transport_permit_category_length.sql` after the existing migrations to support all Traffic permit categories, including `PASSENGER` and `ABNORMAL`.

Apply `022_remove_national_id_passport_photo_requirement.sql` after the existing migrations to remove obsolete passport-photo document requirements from National ID and passport services. National ID applications use the authorized Home Affairs biometric photo already associated with the citizen.

Apply `023_use_finance_register_for_pension_employment.sql` after the existing migrations to remove self-reported employment history from the pension application form. Pension eligibility uses the Finance-owned government employee register.

Apply `024_disable_passport_photo_uploads.sql` after the existing migrations to disable the obsolete passport-photo document type. The backend rejects any attempted upload of that type, while existing stored documents remain untouched.

Apply `025_generate_pension_numbers.sql` after the existing migrations to enable automatic, sequence-backed pension numbers in the `LS-PEN-YYYY-000001` format. The number is allocated by the backend only when Pensions staff approve an eligible application.

---

## Technology Stack

### Frontend

- **React** (Vite)
- **React Router** for navigation
- **Axios** for HTTP
- **React Icons** (Feather icons, no emojis)
- **react-signature-canvas** for signature capture
- **react-webcam** for facial capture
- **qrcode.react** for QR code generation
- **Single CSS file** (`app.css`)

### Backend

- **Node.js** + **Express**
- **PostgreSQL** (with `pg` driver)
- **JWT** for session tokens
- **bcrypt** for password hashing
- **Multer** for file uploads
- **PDFKit** for PDF generation
- **Winston** for logging
- **Helmet** for security headers
- **express-rate-limit** for rate limiting

### Database

- **PostgreSQL 13+**
- All tables, constraints, and indexes defined in a single `schema.sql`
- All configurable data (colours, statuses, document types, languages) loaded from the database, not hardcoded

`server/database/schema.sql` is for an empty, fresh database only. It now stops with an error if any managed relation already exists, rather than dropping existing application data. Use the numbered SQL migrations for existing databases; do not rerun the consolidated schema to repair migration errors.

---

## Project Structure
