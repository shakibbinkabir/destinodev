> **Ground rules for this build**
>
> 1. The single source of truth is `Destino_Backend_PRD.md` at the repo root. Read the relevant sections of it before writing any code. If something in this prompt conflicts with the PRD, follow the PRD and flag the conflict.
> 2. Use the TodoWrite tool to plan every stage before executing. Show me the plan, then proceed.
> 3. Work in the `backend/` subdirectory for all Laravel work. Do not touch the React app at the repo root until Stage 5 explicitly says to.
> 4. If a task is blocked (missing credentials, missing API docs, ambiguous requirement), do not invent values. Append the blocker to `backend/BLOCKERS.md` with a clear description and skip to the next task.
> 5. Commit in logical chunks with Conventional Commits style messages (`feat:`, `chore:`, `fix:`, `docs:`). One stage may produce 5–15 commits. Do not squash.
> 6. No secrets in source. Anything sensitive goes in `backend/.env` (gitignored). `backend/.env.example` is the template and IS committed.
> 7. After each stage, run the acceptance checklist from the PRD's §13 for that stage. Tick the boxes in your final reply. Do not declare a stage complete with unchecked items.
> 8. You have decision authority for engineering choices that are not specified in the PRD (file naming, internal class structure, test names, etc.). Use your judgment, document non-obvious choices in the relevant file's docblock or in `docs/`.
> 9. Quality over speed. There is no deadline. If a task is half-done at the end of a session, say so plainly.
