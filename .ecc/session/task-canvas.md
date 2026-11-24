# Task canvas — gate v2

```mermaid
flowchart LR
  A[Rejected overlay gate] --> B[Editorial split]
  B --> C[Desktop: navy | photo]
  B --> D[Mobile: photo then copy]
  C --> E[QA screenshots]
  D --> E
  E --> F[Footer restored on gate]
  F --> G[Await visual OK]
```

- Done: gate rewrite; footer again visible on home gate (CSS hide removed).
- Wait: owner visual OK on gate.
