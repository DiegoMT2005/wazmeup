# WazMeUp

WazMeUp is an AI-powered WhatsApp platform for property management.

## Setup Instructions

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure environment variables:**
    Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials.
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
5.  **Database Setup:**
    Run the SQL migration provided in `supabase/migrations/` (or the one generated in Step 2) in your Supabase SQL editor.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database/Auth:** Supabase
- **Language:** TypeScript
