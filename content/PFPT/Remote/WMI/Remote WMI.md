
#### DCOM (RPC)

- Port 135
- Not firewall friendly
- By default WMI service **`Winmgmt`** is running and listening on port 135.

Config port WMI Directory
*`HKLM:\Software\Microsoft\Rpc\Internet\`*
#### Protocols Description
- `wmi` just use 135 DCOM (RPC)
- `WINRM \ WS-MAN \ PS Remoting` all use HTTP & HTTPS on 5985, 5986
- `CIM` can use both of protocol `winrm & wmi` 135 DCOM (RPC) or 5985 (HTTP) , 5986 (HTTPS)

#### WMI

*WMI : RPC (135)*
step 1 : allow firewall to use windows management instrumentation
step 2 : use command 
`PS > gwmi -Class win32_operatingSystem -Computername x.x.x.x -Credential host\user

#### CIM

*Cim : RPC (135) *

`PS > $cimoption = New-CimSessionOption -Protocol DCOM
`PS > $session = New-CimSession -ComputerName x.x.x.x -Credential domain\user -SessionOption $cimoption
`PS > gcim -ClassName win32_operatingSystem -cimsession $session

*Cim : WINRM HTTP (5985) HTTPS (5986) *

step 1 : allow firewall to use Windows Remote Management
step 2 : use command 
`PS > $cimsession = New-CimSession -ComputerName x.x.x.x -Credential domain\user
`PS > gcim -ClassName win32_operatingSystem -CimSession $cimsession`

#### Module for remote

this module is for set permission on remote that allow to used remote wmi on target machine
***`nishang`***
`PS > ipmo nishang-master\Backdoors\set-remotewmi.ps1
`PS > get-help -example Set-RemoteWMI
set permission
`PS > Set-RemoteWMI -UserName cnanormaluser -Computername x.x.x.x -Credential domain\adminuser -verbos
remove permission 
`PS > Set-RemoteWMI -UserName cna -Computername x.x.x.x -Credential domain\cna -verbos -remove
special namespace 
`PS > Set-RemoteWMI -UserName cna -Computername x.x.x.x -Credential domain\cna -verbos -namespace 'root\cimv2' -notallnamespaces