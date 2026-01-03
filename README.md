# SCINGULAR AI Workspace

This workspace contains the frontend application for the SCINGULAR AI platform.

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   - Copy the `.env.example` file to `.env.local`.
   - Fill in your Firebase project configuration and other necessary API keys.

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:9002`.

## Required Environment Variables

The following environment variables are required to run the application. See `.env.example` for a full template.

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (For map features)
- `NEXT_PUBLIC_PICOVOICE_ACCESS_KEY` (For "Hey, Scing!" wake word)
- `NEXT_PUBLIC_STREAM_API_KEY` (For messaging)
- `AWS_ACCESS_KEY_ID` (For S3 uploads)
- `AWS_SECRET_ACCESS_KEY` (For S3 uploads)
- `AWS_S3_REGION` (For S3 uploads)
- `AWS_S3_BUCKET` (For S3 uploads)

## Notes on Firebase Hosting

If deploying to Firebase Hosting, ensure that your `firebase.json` configuration points to the correct build output directory (typically `.next`). This project is optimized for Vercel deployment out-of-the-box.
