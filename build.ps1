# builds dist\WhatStatus.exe, signs it when -Thumbprint is given
param([string]$Thumbprint)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

python ui-src/gen.py
dotnet publish -c Release -nologo -o dist
if ($LASTEXITCODE) { throw "build failed" }

if ($Thumbprint) {
  $signtool = Get-ChildItem "${env:ProgramFiles(x86)}\Windows Kits\10\bin\*\x64\signtool.exe" | Sort-Object FullName | Select-Object -Last 1
  if (-not $signtool) { throw "signtool.exe not found (install the Windows SDK)" }
  & $signtool.FullName sign /sha1 $Thumbprint /s My /fd SHA256 /tr http://timestamp.digicert.com /td SHA256 /d "WhatStatus" dist\WhatStatus.exe
  if ($LASTEXITCODE) { throw "signing failed" }
}
Get-Item dist\WhatStatus.exe | Select-Object Name, Length, LastWriteTime
