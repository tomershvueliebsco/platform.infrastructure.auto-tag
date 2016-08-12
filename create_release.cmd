@echo off

rem ********************************************************************
rem This script will automatically create a zip file ready to upload to
rem Lambda from the AutoTag source code. It uses 7-Zip zip's command
rem line interface, so that must be installed before using this script.
rem To install, download 7-Zip Extras from the 7-zip site, unarchive the
rem file to whatever directory you want, and put that directory's path
rem into the PATH environment variable.
rem ********************************************************************

echo Transpiling code to ES5...
call run_babel.cmd

rem Change the next line as needed to point to your auto-tag directory.
if not exist "C:\Program Files\Git\repos\auto-tag\lib\node_modules" (
	echo Unarchiving node_modules.zip to lib\...
	7za e node_modules.zip -olib\node_modules
)
cd lib
echo.
set /p version="Enter version number: "
7za a EBSCO-autotag-%version%.zip node_modules\ workers\ autotag.js autotag_factory.js aws_cloud_trail_listener.js cloud_trail_event_config.js
pause