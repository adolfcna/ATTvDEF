#### **Help**

`PS > gcm *wmi*
`PS > gcm *cim*

#### **List Namespace**

`Ps > get-wmiobject -Namespace "root" -Class "__namespace" | select Name
`Ps > gwmi -Namespace "root" -Class "__namespace" | select Name
*cim*`Ps > get-ciminstance -Namespace "root" -Class "__namespace" | select Name
*cim* `Ps > gcim -Namespace "root" -Class "__namespace" | select Name

#### **List Classes**

`Ps > gwmi -namespace root\default -Class * -List // list class of nampespace default
`Ps > gwmi -namespace root\cimv2 -Class * -List // list class of nampespace cimv2
`Ps > gwmi -namespace root\cimv2 -Class *bios* -List
*cim* `Ps > get-cimclass -ClassName *bios*`

#### **Use Classes**

BIOS
`Ps > gwmi -Class *bios* -List 
`Ps > gwmi -Class win32_bios -List
`Ps > gwmi -Class win32_bios
*cim* `Ps > gcim -ClassName win32_bios

Process
`Ps > gwmi -Class *process* -List
`Ps > gwmi -Class win32_process
`Ps > gwmi -class win32_process -Filter { name = "powershell.exe"}
`Ps > gwmi -class win32_process -Filter 'name = "powershell.exe"'
`Ps > gwmi -class win32_process | ? {$_.Name -eq "powershell.exe"}

**note : why we didn't use namespace parameter ? because root\cimv2 is default name space**