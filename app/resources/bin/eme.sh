#!/bin/bash
  EMECMD="$(pwd -W)/eme.cmd"
if [ "$(uname -o)" == "Msys" ]; then
  cmd.exe //C "$EMECMD" "$@"
else
  cmd.exe /C "$EMECMD" "$@"
fi
