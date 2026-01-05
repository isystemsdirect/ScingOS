export const Capabilities = {
  REPO_WRITE: "CAP_REPO_WRITE",
  GIT_PUSH: "CAP_GIT_PUSH",
  RUN_TASKS: "CAP_RUN_TASKS",
  UPDATE_REGISTRY: "CAP_UPDATE_REGISTRY",
  MIGRATE_DB: "CAP_MIGRATE_DB",
  PLUGIN_INSTALL: "CAP_PLUGIN_INSTALL",
} as const;

export type Capability = (typeof Capabilities)[keyof typeof Capabilities];
