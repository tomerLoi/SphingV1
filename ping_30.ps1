# This PowerShell script will open 30 terminals, each running a ping command to 8.8.8.8
for ($i = 1; $i -le 80; $i++) {
    Start-Process powershell -ArgumentList '-NoExit', '-Command', 'ping 8.8.8.8'
}
