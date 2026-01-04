export type OperatorAuth = {
  identityId: string;
  capabilities: string[];
};

export type OperatorResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'ERROR'; message: string };
