# Rebuilds cv.pdf from index.html using the print stylesheet (headless Edge or Chrome).
# Run from anywhere:  powershell -ExecutionPolicy Bypass -File scripts\build-cv.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$page = "file:///" + ((Join-Path $root "index.html") -replace "\\", "/")
$out  = Join-Path $root "cv.pdf"

$browser = @(
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "$env:LocalAppData\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browser) { throw "Edge or Chrome not found." }

$tmpProfile = Join-Path $env:TEMP "cv-build-profile"
$before = if (Test-Path $out) { (Get-Item $out).LastWriteTime } else { $null }
$flags = @("--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--virtual-time-budget=8000",
          "`"--user-data-dir=$tmpProfile`"", "`"--print-to-pdf=$out`"", $page)
Start-Process -FilePath $browser -ArgumentList $flags -Wait -WindowStyle Hidden
if (-not (Test-Path $out) -or (Get-Item $out).LastWriteTime -eq $before) { throw "cv.pdf was not created." }
Write-Host "cv.pdf updated: $out"
