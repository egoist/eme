#!/bin/bash

if [ "$(uname)" == 'Darwin' ]; then
  OS='Mac'
else
  echo "Your platform ($(uname -a)) is not supported."
  exit 1
fi

while getopts ":wtfvh-:" opt; do
  case "$opt" in
    -)
      case "${OPTARG}" in
        wait)
          WAIT=1
          ;;
        help|version)
          REDIRECT_STDERR=1
          EXPECT_OUTPUT=1
          ;;
        foreground|test)
          EXPECT_OUTPUT=1
          ;;
      esac
      ;;
    w)
      WAIT=1
      ;;
    h|v)
      REDIRECT_STDERR=1
      EXPECT_OUTPUT=1
      ;;
    f|t)
      EXPECT_OUTPUT=1
      ;;
  esac
done

if [ $REDIRECT_STDERR ]; then
  exec 2> /dev/null
fi

if [ $EXPECT_OUTPUT ]; then
  export ELECTRON_ENABLE_LOGGING=1
fi

if [ $OS == 'Mac' ]; then
  EME_APP_NAME="EME.app"
  if [ -z "${EME_PATH}" ]; then
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
    "$EME_PATH/$EME_APP_NAME/Contents/MacOS/EME" --executed-from="$(pwd)" --pid=$$ $*
    exit $?
  else
    open -a "$EME_PATH/$EME_APP_NAME" -n --args --executed-from="$(pwd)" --pid=$$ --path-environment="$PATH" $*
  fi
fi
