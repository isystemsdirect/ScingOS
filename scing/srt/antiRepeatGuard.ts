/**
 * AntiRepeatGuard: asserts non-identical execution.
 * Replace signature hashing with influence+output hashing in production.
 */
export class AntiRepeatGuard {
  private lastSignature: string | null = null

  assert(signature?: string) {
    const sig = signature ?? this.entropySignature()
    if (sig === this.lastSignature) {
      throw new Error('SRT violation: identical execution signature detected')
    }
    this.lastSignature = sig
  }

  private entropySignature(): string {
    return Date.now() + '-' + Math.random().toString(36).slice(2)
  }
}
