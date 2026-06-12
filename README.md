# VC Lab Incubation Master

An offline-first laboratory incubation and batch-tracking application designed to improve scheduling, sample traceability, and reproducibility in experimental workflows.

## Research workflow problem

Laboratory incubation experiments often involve multiple samples, temperatures, time points, plate layouts, and reminders. This application brings those tasks into one structured interface so researchers can plan and monitor batches with fewer manual tracking errors.

## Features

- Batch-first creation of multiple samples
- Incubation conditions including temperature, RPM, and duration
- Live board for current, upcoming, and overdue samples
- Plate layouts for 6-, 24-, and 96-well formats
- Local notifications and calendar export
- Google Calendar integration using client-side authentication
- PDF label generation with QR codes
- Offline-capable Progressive Web App
- Local browser storage with optional Supabase synchronisation

## Technology

- React
- TypeScript
- Vite
- IndexedDB/local browser storage
- jsPDF and QR-code generation
- Optional Supabase integration

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

## Optional integrations

### Google Calendar

Create a Google Cloud project, enable the Google Calendar API, configure an OAuth web client, and provide the client ID through an environment variable:

```bash
VITE_GOOGLE_CLIENT_ID=your_client_id
```

### Supabase

The application can be extended to synchronise batches across devices using Supabase. Keep all credentials in a local `.env` file and never commit them to version control.

## Research-use note

This is a workflow-support tool, not a validated laboratory information management system. Researchers should verify incubation conditions, labels, and schedules independently before use.

## Project role

Conceptualised, specified, tested, and iteratively developed to address practical laboratory scheduling and sample-tracking needs.
