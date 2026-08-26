#### **Config**

`PS > ipmo Posh-Shodan.psd1
`PS > gcm -Module Posh-Shodan
`PS > Get-ShodanAPIInfo -APIKey
`PS > Set-ShodanAPIInfo -APIKey -MasterPassword
`PS > Read-ShodanAPIKey 
`PS > Get-ShodanAPIInfo

#### **Recon**

`PS > Get-ShodanDNSResolve -HostName google.com
`PS > Get-Help *shodan*
`PS > measure-ShodanHost -Query "default password" -city "tehran"
`PS > measure-ShodanHost -Query "RDP" -city "tehran"
`PS > Get-ShodanService

resource : https://github.com/darkoperator/Posh-Shodan 