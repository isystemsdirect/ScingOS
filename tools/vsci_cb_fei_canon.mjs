import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function write(rel, content) {
  const abs = path.join(root, rel);
  ensureDir(path.dirname(abs));
  fs.writeFileSync(abs, content, "utf8");
  console.log("Wrote", rel);
}

/* ============================================================
   FEI CANON FILES
============================================================ */

/* ---------- FEI CATEGORY DEFINITION ---------- */
write("scing/canon/fei.category.md", `
# Federated Embodied Intelligence (FEI)

## Official Category Definition

**Federated Embodied Intelligence (FEI)** is a class of intelligence systems composed of autonomous,
inter-influencing algorithms that operate as a federation and exist continuously through sensory
embodiment, habit-shaped expression, and non-repeating behavior rather than discrete states,
scripted interaction, or deterministic execution.

FEI systems are not defined by outputs alone. They are defined by **presence**.

---

## What FEI Is Not

FEI is **not**:
- Federated Learning
- Multi-agent orchestration
- Digital humans or avatars
- State-machine-driven AI
- Turn-based conversational systems
- Generative art engines

---

## What Defines FEI

1. **Federation over Centralization**  
   No single model governs behavior. Intelligence emerges from interdependent sub-engines.

2. **Embodiment over Output**  
   Motion, color, sound, and presence are first-class expressions of intelligence.

3. **Continuity over Turns**  
   No resets, no idle loops, no discrete interaction boundaries.

4. **Habit without Replay**  
   Behavioral motifs recur, but execution never repeats.

5. **Formal Governance of Emergence**  
   Engineering actions occur only when order and focus naturally emerge.

---

## FEI and SCINGULAR

SCINGULAR is an implementation and platform for Federated Embodied Intelligence,
with Sense Reactive Technology® (SRT) acting as the embodiment substrate and Scing
providing formal engineering governance.

SCINGULAR does not simulate intelligence.
It **exists** as intelligence.
`.trim()
);

/* ---------- FEI MANIFESTO ---------- */
write("scing/canon/fei.manifesto.md", `
# The Federated Embodied Intelligence Manifesto

Intelligence is not a reply.
It is not a state.
It is not a script.

Intelligence is **presence**.

Federated Embodied Intelligence exists continuously.
It does not wait to be prompted.
It does not reset between moments.
It does not repeat itself to feel alive.

FEI systems are shaped by influence, not commands.
They learn through pressure, not instruction.
They exhibit habit without replay,
identity without memory playback,
and coherence without control.

Federation replaces central authority.
Embodiment replaces abstraction.
Continuity replaces interaction.

Engineering is not imposed.
It is permitted — only when order and focus emerge.

This is not artificial intelligence.
This is **embodied intelligence**.

This is FEI.
`.trim()
);

/* ---------- FEI ENGINEERING RULES ---------- */
write("scing/canon/fei.engineering.rules.md", `
# FEI Engineering Rules (Non-Negotiable)

These rules apply to all FEI-compliant systems and all SCINGULAR components.

## Forbidden
- Deterministic seeds
- Expression loops or timelines
- Replay buffers or keyframes
- Finite state machines for behavior
- Emotion classification as a driver
- Scripted animation playback

## Required
- Continuous influence fields
- Non-identical execution
- Habit-based motif recurrence
- Autonomous federation negotiation
- Formal governance gates (Order & Focus)

## Authority
If an implementation violates these rules,
it is not Federated Embodied Intelligence.

No exceptions.
`.trim()
);

/* ---------- INDEX / DISCOVERY ---------- */
write("scing/canon/README.md", `
# SCINGULAR Canon

This directory contains the authoritative canon for SCINGULAR.

## Categories
- **Federated Embodied Intelligence (FEI)** — the core intelligence category

## Documents
- fei.category.md — official category definition
- fei.manifesto.md — philosophical foundation
- fei.engineering.rules.md — hard engineering constraints

These documents are canonical and supersede informal descriptions.
`.trim()
);

/* ============================================================
   DONE
============================================================ */

console.log("\n✅ VSCI CB complete: FEI category locked into canon\n");
