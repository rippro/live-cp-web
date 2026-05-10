# TODO

- [x] Replace `MemoryJudgeRepository` with a persistent DB implementation that enforces the schema in `SPECIFICATION.md`:
  `users`, `teams`, `teamMembers`, `cliTokens`, `events`, `problems`, `testcases`,
  `submissions`, `submissionCases`, and `solves`.
- [x] Add migrations and database-level constraints for all primary keys, foreign keys, and unique keys from the specification.
- [x] Add an admin-only flow for creating users, teams, invite codes, problems, testcase versions, and CLI tokens.
- [x] Replace the development seed token with one-time token issuance. Plain tokens must be shown only at creation time.
- [x] Add password hashing with a dedicated password KDF before enabling account login.
- Add request/response integration tests for the three judge endpoints after the test runner is selected.
- [x] Decide where the eventual standalone repository boundary should be:
  keep `src/*` as the portable CLI package and `web/src/lib/judge/*` as the server-side judge core until the split.
