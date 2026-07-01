$root = "c:\Users\vihan\.gemini\antigravity-ide\scratch\ai-debate-card-cutter"

if (!(Test-Path -Path "$root\api")) {
    New-Item -ItemType Directory -Force -Path "$root\api"
}

Move-Item -Path "$root\backend\server.js" -Destination "$root\api\index.js" -Force
Move-Item -Path "$root\backend\.env" -Destination "$root\.env" -Force
Move-Item -Path "$root\frontend\src" -Destination "$root\src" -Force
Move-Item -Path "$root\frontend\index.html" -Destination "$root\index.html" -Force
Move-Item -Path "$root\frontend\vite.config.js" -Destination "$root\vite.config.js" -Force

Remove-Item -Path "$root\backend" -Recurse -Force
Remove-Item -Path "$root\frontend" -Recurse -Force

Write-Host "Files restructured"
