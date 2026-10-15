---
name: ai-skills-library-pull
description: Copy named or all valid AI Skills Library skills into global Codex skills. Use when installing or refreshing global skills from this library.
---

# AI Skills Library Pull

Use this skill only to copy library skills into global Codex skills. It does not modify or publish the library checkout.

1. Require exactly one argument: a skill folder name or the literal `all`.
2. Resolve the library source as this repository's `.agents/skills` and the global destination as `$HOME/.agents/skills`. Show both full paths and the selected scope.
3. Treat the source library's folder structure as authoritative. For a named skill, validate the selected source. For `all`, select every valid skill directory one level beneath the `ai-skills-create`, `ai-skills-library`, `openspec`, and `docker-sandbox` categories, preserving those category and skill-directory paths in the global destination. A valid skill is a real directory containing `SKILL.md`; refuse a symbolic link or junction as the selected directory and refuse linked files or directories within it.
4. When the library checkout is available, use its `scripts/skill-copy-lifecycle.ps1` helper with `-Action pull -Skill <name|all>`. Preflight the complete selection before copying anything. A missing/invalid source, invalid destination, or unapproved conflict fails the operation without changing any skill.
5. Reconcile the global destination to the source structure without removing skills. Create missing category and skill directories, and move an existing global library skill only when doing so preserves the skill and is necessary to place it at the source-relative path. Update a destination copy when needed to match its source. Preserve all other non-conflicting global skills, folders, and files, including skills outside the library categories. Never delete a skill or discard unrelated global content; if an old path becomes empty after a safe move, remove only that empty container when necessary for structural compliance.
6. If source and destination contents match at the source-relative path, skip that skill. If a destination is absent, plan a physical directory copy. If destination contents differ, report the conflict and ask the user whether to replace it. Do not use `-ReplaceConflicts` unless the user explicitly authorizes replacement; for `all`, show every conflict and get approval before replacing any. A conflicting non-library global folder or file must be preserved and reported rather than overwritten or removed.
7. Copy or move only after every selected skill and required structural change passes preflight. Verify each library destination is a physical directory with `SKILL.md`, content matching its source, and the expected source-relative path. If an operation fails, restore only paths newly created or moved by this invocation, leaving sources and pre-existing destinations unchanged.
8. Report `Changed`, `Moved`, `Skipped`, `Preserved`, and `Failed` names separately. Do not create a junction or symbolic link, move/delete a source, delete any skill, fetch/commit/push Git history, or modify unrelated skills. If the helper is unavailable, follow these same structure-preserving steps with filesystem operations.

## Library checkout exception

When running from inside the `ai-skills-library` checkout, treat its categorized `.agents/skills/<category>/<skill>` tree as the canonical catalog. `pull all` remains the supported operation for installing catalog skills into global discovery, including the `ai-skills-library` category. For one catalog skill, use `pull <skill>`.
