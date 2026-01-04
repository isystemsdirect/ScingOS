// Server-only Firebase Admin wrapper.
// Uses GOOGLE_APPLICATION_CREDENTIALS or default service account in hosted envs.

// NOTE: This module intentionally avoids a static import of `firebase-admin` so
// the base repo does not require firebase-admin as a root dependency.
// Cloud Functions (and any server host that installs firebase-admin) can use it.

type AdminModule = {
  apps: any[];
  initializeApp: () => void;
  app: () => any;
};

let adminMod: AdminModule | undefined;
let app: any | undefined;

function getAdmin(): AdminModule {
  if (adminMod) return adminMod;

  // Avoid bundlers trying to resolve firebase-admin at build time (e.g. Next.js).
  // eslint-disable-next-line no-eval
  const req = (0, eval)('require') as (id: string) => any;
  const loaded = req('firebase-admin');
  adminMod = (loaded?.default ?? loaded) as AdminModule;
  return adminMod;
}

export function getAdminApp(): any {
  if (app) return app;

  const admin = getAdmin();

  if (!admin.apps || admin.apps.length === 0) {
    admin.initializeApp();
  }

  app = admin.app();
  return app;
}

export function getAdminFirestore(): any {
  return getAdminApp().firestore();
}
