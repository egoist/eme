#!/bin/bash

if [ "$(uname)" == 'Darwin' ]; then
  OS='Mac'
else
  echo "Your platform ($(uname -a)) is not supported."
  exit 1
fi

if [ $OS == 'Mac' ]; then
  EME_APP_NAME="EME.app"
  if [ -z "${EME_PATH}"]; then
    if [ -x "/Applications/$EME_APP_NAME" ]; then
      EME_PATH="/Applications"
    elif [ -x "$HOME/Applications/$EME_APP_NAME" ]; then
      EME_PATH="$HOME/Applications"
    else
      if [ ! -x "$EME_PATH/$EME_APP_NAME" ]; then
        echo "Cannot locate EME.app, it is usually located /Applications. Set the EME_PATH environment variable to the directory containing EME.app. "
        exit 1
      fi
    fi
  fi

  if [ $EXPECT_OUTPUT ]; then
    "$EME_PATH/$EME_APP_NAME/Contents/MacOS/EME" --executed-from="$(pwd)" --pid=$$ "$@"
    exit $?
  else
    open -a "$EME_PATH/$EME_APP_NAME" -n --args --executed-from="$(pwd)" -pid=$$ --path-environment="$PATH" "$@"
  fi
fi
