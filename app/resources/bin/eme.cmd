@echo off

SET EXPECT_OUTPUT=
SET WAIT=
SET PSARGS=%*

FOR %%a IN (%*) DO (
  IF /I "%%a"=="-h"           SET EXPECT_OUTPUT=YES
  IF /I "%%a"=="--help"       SET EXPECT_OUTPUT=YES
  IF /I "%%a"=="-v"           SET EXPECT_OUTPUT=YES
  IF /I "%%a"=="--version"    SET EXPECT_OUTPUT=YES
  IF /I "%%a"=="-w"           (
    SET EXPECT_OUTPUT=YES
    SET WAIT=YES
  )
  IF /I "%%a"=="--wait"       (
    SET EXPECT_OUTPUT=YES
    SET WAIT=YES
  )
)

IF "%EXPECT_OUTPUT%"=="YES" (
  SET ELECTRON_ENABLE_LOGGING=YES
  IF "%WAIT%"=="YES" (
    powershell -noexit "Start-Process -FilePath \"%~dp0\..\..\..\..\eme.exe\" -ArgumentList \"--pid=$pid $env:PSARGS\" ; wait-event"
    exit 0
  ) ELSE (
    "%~dp0\..\..\..\..\eme.exe" %*
  )
) ELSE (
  "%~dp0\node.exe" "%~dp0\eme.js" %*
)
