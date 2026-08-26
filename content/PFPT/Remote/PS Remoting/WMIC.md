#### **Help**

`Ps > get-help *wmi*

#### **List of Class WMI**

`Ps > gwmi -Namespace "root" -Class "__namespace" | select Name
or 
`Ps > Get-WMIObject -Namespace "root" -Class "__namespace" | select Name

`Ps > gwmi -NameSpace "root/cimv2" -List
`Ps > gwmi -NameSpace "root/cimv2" -List | ? {$_.Name -Match "process"}

*note: `get-wmiobject` alias `gwmi`*
#### **Lets Use  WMI Classes**

`Ps > gwmi -Class win32_process
`Ps > gwmi -Class Win32_process | select Name
`Ps > gwmi -Class Win32_Process -List
`Ps > gwmi -Class Win32_Process -List | select Methods | fl
`Ps > gwmi -Class Win32_Process -List | select -ExpandProperty Methods | fl
`Ps > gwmi -Class Win32_process -Filter {Name = "lsass.exe"}
`Ps > gwmi -Class Win32_process | ? {$_.Name -eq "lsass.exe"}
`Ps > gwmi -Query {Select * From Win32_Process Where Name = "lsass.exe"}

`Ps > gcim -Class Win32_Process
*note:`get-wmiobject` is old command but also in modern system use `gcim` alias `get-CimInstance`*
#### **WMI Classes Remote Machine Get Process Info and kill**

`Ps > gwmi -Class Win32_Process -ComputerName x.x.x.x -Credential domain\user
`Ps > gwmi -class win32_process -Filter { Name = "powershell.exe" } -ComputerName x.x.x.x -Credential domain\user  | rwmi

*Note: `rwmi` alias to `remove-wmiobject` it's for kill process*

#### **WMI Classes Create process Locally**


`Ps > gwmi -class Win32_Process -List | select -ExpandProperty Methods | select Name
`Ps > iwmi -Class win32_process -Name Create -ArgumentList "powershell.exe" 
`Ps > iwmi -Class win32_process -name create -ArgumentList "powershell.exe -noexit -c get-process" 

*Note: `iwmi` is alias to `invoke-wmiobject` command lets*
#### **WMI Classes Remote Machine Create Process**

`Ps > iwmi -Class win32_process -name create -ArgumentList "cmd.exe" -ComputerName x.x.x.x -Credential domain\user

`Ps > iwmi -Class win32_process -name create -ArgumentList "powershell.exe -noexit -c get-process" -ComputerName x.x.x.x -Credential domain\user

#### **CLASSIC COMMAND**
