# Install Python 3.13 and Node.js using winget, set PATH if needed, activate venv, start Django and React

# Install Python 3.13
winget install -e --id Python.Python.3.13

# Install Node.js (LTS)
winget install -e --id OpenJS.NodeJS.LTS

# Ensure Python and Node.js are in PATH
$pythonPath = (Get-Command python).Source
$nodePath = (Get-Command node).Source

if (-not $pythonPath) {
    $pythonInstall = "$env:LOCALAPPDATA\Programs\Python\Python313"
    if (Test-Path $pythonInstall) {
        $env:Path += ";$pythonInstall;$pythonInstall\Scripts"
    }
}

if (-not $nodePath) {
    $nodeInstall = "$env:ProgramFiles\nodejs"
    if (Test-Path $nodeInstall) {
        $env:Path += ";$nodeInstall"
    }
}

# Check versions
python --version
node --version
npm --version

# Activate venv and start Django server
Start-Process powershell -ArgumentList '-NoExit', '-Command', '. .\.venv\Scripts\Activate.ps1; python manage.py runserver 8000' -WorkingDirectory $PSScriptRoot

# Start React app in client folder
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'npm start' -WorkingDirectory "$PSScriptRoot\client"
