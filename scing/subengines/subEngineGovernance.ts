
import { SubEngineRegistry } from './subEngineRegistry'
import { LifecycleManager } from './lifecycleManager'
import { GrowthTemplateEngine } from './growthEngines/growthTemplate'
import { CatalystTemplateEngine } from './catalystEngines/catalystTemplate'

export const registry = new SubEngineRegistry()
export const lifecycle = new LifecycleManager(registry)

// Example births (real triggers come from Growth/Catalyst Protocols)
registry.register(new GrowthTemplateEngine('growth-core-patterns'))
registry.register(new CatalystTemplateEngine('catalyst-pressure-resolver'))
