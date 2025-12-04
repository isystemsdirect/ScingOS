/**
 * LARI-Language: Natural Language Understanding
 */

interface Intent {
  action: string;
  entities: Record<string, any>;
  confidence: number;
}

export async function understandIntent(text: string): Promise<Intent> {
  // TODO: Integrate with OpenAI or custom NLU model
  
  // Simple pattern matching for demo
  const lowerText = text.toLowerCase();

  if (lowerText.includes('start') && lowerText.includes('inspection')) {
    return {
      action: 'start_inspection',
      entities: {
        inspection_type: extractInspectionType(lowerText),
      },
      confidence: 0.85,
    };
  }

  if (lowerText.includes('capture') || lowerText.includes('photo')) {
    return {
      action: 'capture_photo',
      entities: {},
      confidence: 0.9,
    };
  }

  if (lowerText.includes('code') || lowerText.includes('regulation')) {
    return {
      action: 'lookup_code',
      entities: {
        query: text,
      },
      confidence: 0.75,
    };
  }

  return {
    action: 'unknown',
    entities: {},
    confidence: 0.3,
  };
}

function extractInspectionType(text: string): string {
  const types = ['roofing', 'electrical', 'plumbing', 'structural'];
  
  for (const type of types) {
    if (text.includes(type)) {
      return type;
    }
  }

  return 'general';
}