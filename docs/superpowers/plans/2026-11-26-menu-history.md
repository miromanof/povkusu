# Menu history and usable recipes Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement task-by-task. No delegation required.

**Goal:** Expand genuinely usable dishes and make successive weekly plans differ while enforcing restrictions and checking real package costs.

**Architecture:** Keep all 790 imported recipes. Add explicitly authored everyday recipes with typed ingredients, two-person yields and Russian instructions. Persist compact shown-plan history locally, supply it and a variation seed to the planner worker. Prefer unused dish identities before cost optimization, and expose unavoidable repeats or budget failures honestly.

**Tech Stack:** Existing dependency-free browser ES modules, localStorage, Web Worker, Node tests, GitHub Pages.

**Spec:** User-approved three-step proposal in this conversation: usable content, persistent history, varied selection under constraints.

## Global Constraints
- No full store catalog downloads or manual price fallback.
- Preserve existing design, Russian names, mobile layout, strict exclusions and zero duplicate identities within a week.
- History is local to one browser and must never revive recipes incompatible with a changed profile.
- Historical prices never supply current basket prices.
- If storage or variety is insufficient, say so; do not claim full synchronization or impossible novelty.

## Review Focus
- Corrupt/blocked storage and stale history.
- Allergy/exclusion changes between weeks.
- Budget must outrank novelty if no affordable fresh replacement exists.
- Small pools must disclose repetition rather than silently ignore history.
- Abort/error must not save a non-result into history.

## Tasks
- [x] Add tests for usable content coverage, exact ingredients and complete preparation steps; implement everyday recipe collection.
- [x] Add failing persistence and recency tests; implement versioned, bounded history and date handling.
- [x] Add failing successive-plan and budget/restriction tests; implement seeded history-aware selection with novelty reporting.
- [x] Integrate start date, new variant, next week and local history UI; preserve pantry/family controls.
- [x] Test real store pricing, multiple generations, reload persistence, restrictions and mobile rendering; publish and verify Pages.
