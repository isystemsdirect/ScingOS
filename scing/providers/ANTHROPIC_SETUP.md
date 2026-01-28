# Anthropic Provider for SCINGULAR

## Overview

The Anthropic provider integrates **Claude 3.5 Haiku** (`claude-3-5-haiku-20241022`) as the default AI model for SCINGULAR LARI engines.

## Setup

### 1. Get an Anthropic API Key

1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Create or sign in to your account
3. Navigate to **API Keys** and create a new key
4. Copy the key

### 2. Configure Environment Variables

Add to `cloud/functions/.env.local` (or your runtime environment):

```bash
ANTHROPIC_API_KEY=sk-ant-... # your API key from console.anthropic.com
```

### 3. Install Dependencies

```bash
cd cloud/functions
npm install
# @anthropic-ai/sdk will be installed as part of dependencies
```

## Usage

### From Cloud Functions

```typescript
import { createAnthropicProvider } from '../scing/providers/anthropicProvider';

const provider = createAnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const response = await provider.createMessage({
  model: 'claude-3-5-haiku-20241022',
  max_tokens: 1024,
  messages: [
    {
      role: 'user',
      content: 'Explain zero-trust security in 2 sentences.',
    },
  ],
});

console.log(response.content[0].text);
```

### From Model Router

The engine registry auto-selects Claude Haiku via the `provider-anthropic-haiku` engine:

```typescript
import ENGINES from '../engineRegistry';

const claudeEngine = ENGINES['provider-anthropic-haiku'];
console.log(claudeEngine.model); // 'claude-3-5-haiku-20241022'
```

### Direct Fetch (HTTP)

For integration tests or external clients:

```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-haiku-20241022",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

## Engine Configuration

The default engine is registered in [scing/engineRegistry.ts](../engineRegistry.ts):

```typescript
'provider-anthropic-haiku': {
  id: 'provider-anthropic-haiku',
  family: 'provider',
  displayName: 'Claude 3.5 Haiku (Anthropic)',
  model: 'claude-3-5-haiku-20241022',
  supportsLongContext: true,
  supportsTools: false, // Phase 2
  supportsStreaming: true,
  tags: ['anthropic', 'claude', 'recommended', 'default'],
}
```

## Features & Limitations

| Feature | Status |
|---------|--------|
| Text generation | ✅ Supported |
| Long context (200K tokens) | ✅ Supported |
| Streaming | ✅ Supported |
| Tool use | 🔄 Phase 2 |
| Vision (images) | 🔄 Phase 2 |
| Batch API | 🔄 Phase 2 |

## Pricing

Claude 3.5 Haiku is **the fastest and cheapest** Claude model:

- Input: $0.80 per million tokens
- Output: $4.00 per million tokens

See [Anthropic Pricing](https://www.anthropic.com/pricing) for details.

## Troubleshooting

### Error: "Missing ANTHROPIC_API_KEY env var"

**Solution:** Ensure `ANTHROPIC_API_KEY` is set in your environment:

```bash
# Check if set
echo $ANTHROPIC_API_KEY

# Set locally for testing
export ANTHROPIC_API_KEY=sk-ant-...
```

### Error: "API error (401)"

**Solution:** Your API key is invalid or expired. Get a new key from [console.anthropic.com](https://console.anthropic.com).

### Rate Limiting (429)

**Solution:** Anthropic enforces rate limits. Implement exponential backoff:

```typescript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
}
```

## Migration from OpenAI

To migrate existing OpenAI calls to Claude:

1. Replace `model: 'gpt-*'` → `model: 'claude-3-5-haiku-20241022'`
2. Update message format (Claude expects `role` + `content`)
3. Replace `OPENAI_KEY` → `ANTHROPIC_API_KEY`
4. Test streaming and token counting (different APIs)

See [Anthropic API Docs](https://docs.anthropic.com/en/docs/about-claude/latest-models) for full reference.

## Next Steps

- **Phase 1.5**: Integrate `@anthropic-ai/sdk` for tool use
- **Phase 2**: Add vision/image support (Claude 3.5 Sonnet)
- **Phase 3**: Implement batch processing and cost optimization
