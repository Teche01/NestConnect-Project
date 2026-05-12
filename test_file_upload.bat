@echo off
REM Create test files for file upload testing

setlocal enabledelayedexpansion

set "testDir=test_uploads"
if not exist "%testDir%" mkdir "%testDir%"

echo Creating test files...

REM Create a simple test PNG (needs to be binary, using Base64 here)
certutil -decode nul "%testDir%\dummy.txt" >nul 2>&1

REM Actually, let's just use a simple approach - copy or create minimal files
REM Create a text file that will pass as different file types

echo Test QR Code Content > "%testDir%\test_qr.png"
echo Test Bill Content > "%testDir%\test_bill.jpg"
echo Test PDF Content > "%testDir%\test_bill.pdf"

echo Created test files:
dir "%testDir%"

echo.
echo You can now test the file upload on the Worker Dashboard
echo URL: http://localhost:3000/worker-dashboard
