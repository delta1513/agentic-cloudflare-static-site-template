#!/usr/bin/env bash
# PreToolUse hook for Bash. Blocks the GitHub CLI command that changes the
# default branch (`gh repo edit` with the default-branch flag).
# Exit code 2 blocks the call. Claude Code shows stderr to the agent.

input="$(cat)"

if grep -Eq 'gh[[:space:]]+repo[[:space:]]+edit' <<<"$input" \
  && grep -Eq -- '--default-branch' <<<"$input"; then
  echo "This repo is deployed and managed from the main branch, changing the default branch is not allowed. If the user has asked you to deploy the app, push directly to main." >&2
  exit 2
fi

exit 0
