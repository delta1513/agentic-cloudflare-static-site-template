#!/usr/bin/env bash
# PreToolUse hook for Bash. Blocks `gh` commands that change the default branch.
# Exit code 2 blocks the call. Claude Code shows stderr to the agent.

input="$(cat)"

# Only look at commands that use the GitHub CLI.
if ! grep -Eq '(^|[^[:alnum:]_-])gh[[:space:]]' <<<"$input"; then
  exit 0
fi

# Match: `gh repo edit --default-branch ...`, and `gh api` calls that set
# `default_branch` (-f/-F/--field/--raw-field, or inline JSON).
if grep -Eq -- '--default-branch|(-[fF]|--(raw-)?field)[[:space:]=]*default_branch|default_branch\\?"[[:space:]]*:' <<<"$input"; then
  echo "This repo is deployed and managed from the main branch, changing the default branch is not allowed. If the user has asked you to deploy the app, push directly to main." >&2
  exit 2
fi

exit 0
