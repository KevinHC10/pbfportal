# BowlTrack docs

Reference documents intended to be fed to an AI assistant or designer when
they need to understand the data or design new screens.

| File           | Use when…                                                                            |
| -------------- | ------------------------------------------------------------------------------------ |
| `SCHEMA.md`    | You need the database. Mermaid ERD, table-by-table reference, RLS, storage, realtime, migrations. |
| `DOMAIN.md`    | You need the *meaning* of the data — roles, glossary, state machines, business rules, common queries. |
| `PAGES.md`     | You're redesigning a screen. Lists every route with its mission, what data it pulls, and key interactions. |

For the SQL itself see `supabase/migrations/`. For the running scoring math
see `src/lib/scoring.ts` (and its 40 unit tests).
