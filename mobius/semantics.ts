export type SemanticDual<T> = (s: T) => T;

// “blend” is semantic mixing, not subtraction.
// Default implementation can be “attach annotations / tags” if your signal is structured.
export type SemanticBlend<T> = (base: T, dual: T, a: number) => T;
