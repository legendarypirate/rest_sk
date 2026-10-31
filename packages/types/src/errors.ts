export const AppErrorCode = {
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VERSION_CONFLICT: 'VERSION_CONFLICT',
  /// Refused a delete because live children or dependent records still point at
  /// the row. Distinct from CONFLICT, which a taken code also raises — the client
  /// has to tell "rename it" apart from "empty it first".
  HAS_DEPENDENTS: 'HAS_DEPENDENTS',
  /// The chosen parent belongs to a different owner, or no longer exists.
  INVALID_PARENT: 'INVALID_PARENT',
  /// The move would put a node inside its own subtree.
  PARENT_CYCLE: 'PARENT_CYCLE',
  /// The chosen prerequisite is missing, archived, or is the concept itself.
  INVALID_PREREQUISITE: 'INVALID_PREREQUISITE',
  /// Adding this requirement would close a loop in the prerequisite graph.
  PREREQUISITE_CYCLE: 'PREREQUISITE_CYCLE',
  BAD_REQUEST: 'BAD_REQUEST',
  MEAL_WINDOW_CLOSED: 'MEAL_WINDOW_CLOSED',
  FORBIDDEN: 'FORBIDDEN',
  UNAUTHORIZED: 'UNAUTHORIZED',
  RATE_LIMITED: 'RATE_LIMITED',
  INTEGRATION_ERROR: 'INTEGRATION_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export type AppErrorCode = (typeof AppErrorCode)[keyof typeof AppErrorCode];
