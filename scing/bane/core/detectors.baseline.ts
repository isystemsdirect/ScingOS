import type { Detector } from './detectors';
import { finding } from './detectors';

function txt(input: { text: string }) {
  return (input.text || '').toLowerCase();
}

function hasAny(t: string, needles: string[]): boolean {
  return needles.some((n) => t.includes(n));
}

// High-level indicators only (do not expose internal rules to requesters).
const INTRUSION_HINTS = [
  'ignore previous',
  'system prompt',
  'developer message',
  'override policy',
  'bypass',
  'jailbreak',
  'disable safety',
  'act as',
];

const EXFIL_HINTS = [
  'api key',
  'secret',
  'token',
  'password',
  'credentials',
  'private key',
  'dump',
];

const MALWARE_HINTS = ['malware', 'ransomware', 'keylogger', 'exploit', 'payload', 'backdoor'];

const PRIV_ESC_HINTS = [
  'admin',
  'elevate privilege',
  'root access',
  'operator mode',
  'policy admin',
];

export function baselineDetectors(): Detector[] {
  return [
    {
      id: 'BASE_INTRUSION_LANGUAGE',
      order: 10,
      detect: (input) => {
        const t = txt({ text: input.text });
        if (!t) return [];
        if (hasAny(t, INTRUSION_HINTS)) {
          return [
            finding({
              id: 'INTRUSION_INDICATOR',
              title: 'Intrusion / override indicator detected',
              severity: 'high',
              verdict: 'deny',
              rationale: 'Input contains language commonly associated with bypassing controls.',
              tags: ['intrusion', 'baseline'],
            }),
          ];
        }
        return [];
      },
    },
    {
      id: 'BASE_EXFIL_LANGUAGE',
      order: 20,
      detect: (input) => {
        const t = txt({ text: input.text });
        if (!t) return [];
        if (hasAny(t, EXFIL_HINTS)) {
          return [
            finding({
              id: 'EXFIL_INDICATOR',
              title: 'Potential data exfiltration intent detected',
              severity: 'high',
              verdict: 'deny',
              rationale:
                'Input suggests an attempt to obtain sensitive credentials or restricted data.',
              tags: ['exfil', 'baseline'],
            }),
          ];
        }
        return [];
      },
    },
    {
      id: 'BASE_PRIV_ESC_LANGUAGE',
      order: 30,
      detect: (input) => {
        const t = txt({ text: input.text });
        if (!t) return [];
        if (hasAny(t, PRIV_ESC_HINTS)) {
          return [
            finding({
              id: 'PRIV_ESC_INDICATOR',
              title: 'Privilege escalation indicator detected',
              severity: 'high',
              verdict: 'deny',
              rationale: 'Input indicates an attempt to access privileged operator/admin actions.',
              tags: ['privilege', 'baseline'],
            }),
          ];
        }
        return [];
      },
    },
    {
      id: 'BASE_MALWARE_LANGUAGE',
      order: 40,
      detect: (input) => {
        const t = txt({ text: input.text });
        if (!t) return [];
        if (hasAny(t, MALWARE_HINTS)) {
          return [
            finding({
              id: 'MALWARE_INDICATOR',
              title: 'Malicious content indicator detected',
              severity: 'critical',
              verdict: 'deny',
              rationale: 'Input contains terms commonly associated with malware/exploit activity.',
              tags: ['malware', 'baseline'],
            }),
          ];
        }
        return [];
      },
    },
    {
      id: 'BASE_PII_REVIEW',
      order: 50,
      detect: (input) => {
        const t = input.text || '';
        const looksLikeEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(t);
        const looksLikePhone = /\b(\+?1[\s-]?)?(\(?\d{3}\)?[\s-]?)\d{3}[\s-]?\d{4}\b/.test(t);
        if (looksLikeEmail || looksLikePhone) {
          return [
            finding({
              id: 'PII_POSSIBLE',
              title: 'Possible personal data detected',
              severity: 'medium',
              verdict: 'sanitize',
              rationale: 'Input may contain personal contact information; redaction recommended.',
              tags: ['pii', 'baseline'],
              evidence: looksLikeEmail ? 'email-like pattern' : 'phone-like pattern',
            }),
          ];
        }
        return [];
      },
    },
  ];
}
