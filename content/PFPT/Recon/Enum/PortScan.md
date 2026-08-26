*NISHANG*

`ps > ipmo .\nishang\nishang.psm1
`ps > portscan -StartAddress x.x.x.1 -EndAddress x.x.x.3 -ResolveHost
`ps > portscan -StartAddress x.x.x.1 -EndAddress x.x.x.1 -ScanPort
`Ps > gcm -Module nishang
resource : https://github.com/samratashok/nishang/tree/master  

*PowerSploit*

`Ps > ipmo .\PowerSploit.psd1
`Ps > invoke-portscan -Hosts x.x.x.x -PingOnly
`Ps > invoke-portscan -Hosts x.x.x.x 

resource : https://github.com/PowerShellMafia/PowerSploit

*POSH-SecMod*
`Ps > ipmo .\Posh-SecMod\Posh-SecMod.psd1
`Ps > invoke-ARPScan -CIDR x.x.x.0/24
`Ps > invoke-EnumSRVRecords -Domain google.com
resource : https://github.com/darkoperator/Posh-SecMod 