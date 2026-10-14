# FixLocal - Full-Scale Functional Platform Transition Plan

Transform the FixLocal prototype into a fully functional, production-ready hyperlocal service marketplace powered by real Firebase cloud services (Firestore & Authentication), real-time client-provider chat, automated appointment scheduling, milestone escrow payment processing, and verified post-completion ratings and reviews.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following technical and architectural selections were confirmed based on your preferences:

- **Confirmed Cloud Architecture**: Real Firebase cloud database (Firestore) with secure rule-based collections, alongside Firebase Authentication (Google popup authentication + persistent profiles).
- **Confirmed Core Feature Suite**:
  1. **In-App Messaging & Chat**: Real-time communication between customers and providers per job request.
  2. **Escrow Milestone Payments & Digital Invoices**: Secure simulated escrow holding, milestone funding, completion release, and downloadable invoices.
  3. **Appointment Scheduling & Status Tracker**: Live chronological tracking (`Open` → `Bidded` → `Hired` → `Scheduled` → `In Progress` → `Completed`) with interactive date/time booking.
  4. **Verified Ratings & Review System**: Post-completion star ratings (1–5) and feedback that dynamically recalculate trade contractor scores and job history.

---

## 1. Overview & Core Concept

- **What It Does**: A complete, end-to-end hyperlocal services platform where homeowners publish trade requests, local licensed specialists place competitive bids, and both parties communicate in real-time, schedule on-site visits, lock funds in escrow, and leave verified reviews.
- **Target Audience**: Homeowners requiring rapid trade interventions (plumbers, electricians, carpenters, AC technicians) and independent local trade contractors looking for local customer leads.
- **Key Value**: Replaces phone tag, hidden pricing, and insecure cash transactions with transparent fixed-quote bidding, direct in-app messaging, milestone-protected payments, and auditable ratings.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Authentication & Profile Setup**:
   - Customers and providers sign in via Firebase Auth with role designation.
   - Providers customize categories, operating areas, licenses, and availability calendars.

2. **Job Lifecycle & Live Status Tracker**:
   - **Step 1 (Posted)**: Customer publishes job; matching providers in the zip code receive notifications.
   - **Step 2 (Bidding)**: Providers submit quotes with proposed prices, arrival windows, and pitches.
   - **Step 3 (Hiring & Escrow Deposit)**: Customer selects a winning bid, triggering escrow funding with an immediate digital deposit receipt.
   - **Step 4 (Scheduling & Chat)**: Customer and provider use in-app messaging to coordinate details and confirm an appointment slot.
   - **Step 5 (Execution & Completion)**: Provider marks work "In Progress" then "Completed"; customer inspects work, releases escrow funds, and downloads a digital invoice.
   - **Step 6 (Review & Rating)**: Customer submits a star rating and written review, updating the contractor's public verified profile.

### Visual Identity & Theme
- **Aesthetic Direction**: Corporate minimal, clean spatial structure, strict anti-slop rules, no distracting pills or ornamental graphics.
- **Color Palette**:
  - Dominant Neutral Canvas: `#F9FAFB` (neutral-50) and `#FFFFFF`.
  - Primary Accent: Deep Indigo (`#4F46E5`, indigo-600) for high-intent actions.
  - Semantic Feedback: Emerald (`#059669`) for escrow funded/completed, Amber (`#D97706`) for pending reviews, Rose (`#E11D48`) for cancellations.
- **Typography**: `Plus Jakarta Sans` for clean display headings and UI labels, paired with `JetBrains Mono` for tabular pricing, invoice numbers, and timestamps (`tabular-nums`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Firebase Provisioning Sequence**
  - *Chosen Approach*: Provision Firebase via `show_aistudio_ui` with `ui_type: "firebase_setup"` and `ProvisionFirebase` RPC, generating `firebase-blueprint.json` and hardened `firestore.rules`.
  - *Why*: Provides real multi-user, multi-device cloud persistence and real-time document listeners (`onSnapshot`) needed for instant chat and status transitions.
  - *Fallback / Resilience*: Maintain a resilient offline cache layer so the app functions seamlessly in development mode or intermittent connectivity.

- **Decision 2: In-App Chat Architecture**
  - *Chosen Approach*: Dedicated `conversations/{jobId}/messages/{messageId}` subcollection in Firestore with real-time `onSnapshot` subscriptions.
  - *Why*: Automatically restricts access strictly to the job's customer and hired provider, avoiding unbounded array bloat.

- **Decision 3: Escrow Payment Simulation & Invoice Generation**
  - *Chosen Approach*: Client-side cryptographic transaction simulation with visual state machine (`Unfunded` → `Held in Escrow` → `Released to Provider`) and auto-generated HTML/print digital invoice receipts.
  - *Why*: Delivers an authentic corporate payment workflow without requiring external payment gateway credentials.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FixLocal Frontend (React 19)                    │
├──────────────────┬──────────────────┬─────────────────┬────────────────┤
│  Customer Portal │  Provider Feed   │   Live Chat     │ Escrow & Bills │
│  - Job Creation  │  - Category Feed │   - Real-time   │ - Fund Escrow  │
│  - Bid Review    │  - Bidding Modal │     Messages    │ - Release Pay  │
│  - Hire & Rate   │  - Schedule Mgr  │   - Quick Notes │ - Invoices     │
└────────┬─────────┴────────┬─────────┴────────┬────────┴────────┬───────┘
         │                  │                  │                 │
         ▼                  ▼                  ▼                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Centralized App State & Sync Layer                 │
│              (Firebase Auth Context + Realtime Listeners)              │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Firebase Firestore Cloud                        │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌───────────┐ │
│ │  /users        │ │  /jobs         │ │  /bids         │ │ /messages │ │
│ │  (Profiles)    │ │  (Work specs)  │ │  (Proposals)   │ │ (Job Chat)│ │
│ └────────────────┘ └────────────────┘ └────────────────┘ └───────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Firestore Data Models

1. **`users/{userId}`**:
   - `id`: string, `name`: string, `email`: string, `role`: `'customer' | 'provider'`
   - `category`?: string, `operatingArea`?: string, `phone`: string
   - `rating`: number, `completedJobsCount`: number, `bio`: string

2. **`jobs/{jobId}`**:
   - `customerId`: string, `customerName`: string, `title`: string, `category`: string
   - `description`: string, `budget`: number, `location`: string, `urgency`: string
   - `status`: `'open' | 'bidded' | 'hired' | 'scheduled' | 'in_progress' | 'completed'`
   - `hiredBidId`?: string, `hiredProviderId`?: string, `scheduledDate`?: string
   - `escrowStatus`: `'unfunded' | 'held' | 'released'`
   - `createdAt`: server timestamp

3. **`jobs/{jobId}/bids/{bidId}`**:
   - `providerId`: string, `providerName`: string, `providerRating`: number
   - `proposedPrice`: number, `estimatedTime`: string, `pitch`: string
   - `status`: `'pending' | 'accepted' | 'declined'`, `createdAt`: server timestamp

4. **`jobs/{jobId}/messages/{messageId}`**:
   - `senderId`: string, `senderName`: string, `text`: string, `timestamp`: server timestamp

5. **`reviews/{reviewId}`**:
   - `jobId`: string, `customerId`: string, `providerId`: string, `rating`: number
   - `comment`: string, `createdAt`: server timestamp

---

## 5. Execution Stages (Upon User Approval)

1. **Step 1 - Firebase Setup**: Call `show_aistudio_ui` with `ui_type: "firebase_setup"`, verify terms, and provision the Firebase instance via `rpc_action`.
2. **Step 2 - Security Rules & Blueprint**: Generate `firebase-blueprint.json` and hardened `firestore.rules` enforcing relational access control for customers, providers, and bids.
3. **Step 3 - Real-Time In-App Chat**: Implement the job chat interface with message history, typing status, and direct contact options.
4. **Step 4 - Appointment Scheduler & Status Progression**: Build interactive appointment booking and 6-stage lifecycle tracking.
5. **Step 5 - Milestone Escrow & Digital Invoices**: Implement secure escrow funding, release controls, and downloadable invoice views.
6. **Step 6 - Verified Reviews & Profile Upgrades**: Build the post-completion review modal and dynamic contractor rating recalculation.
7. **Step 7 - Verification**: Compile, lint, and verify the full platform end-to-end.
