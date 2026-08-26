
get information about process
`Ps > gwmi -Class win32_process -Filter { Name = "calc.exe" }
`Ps > gwmi -Class win32_process | ? {$_.Name -eq "calc.exe" }
*cim* `Ps > gcim -ClassName win32_process -Filter 'Name = "powershell.exe"'

Create Process
*cim* `Ps > get-cimclass -MethodName Create
*cim* `Ps > Get-CimClass -className win32_process | select -ExpandProperty cimclassmethods | ? {$_.Name -eq "Create"} | select -ExpandProperty parameters
`Ps > invoke-wmimethod -Class win32_process -Name Create -ArgumentList @(calc.exe)
`Ps > invoke-wmimethod -Class win32_process -Name Create -ArgumentList calc.exe
`Ps > invoke-wmimethod -Class win32_process -Name Create -ArgumentList @{commandline = "calc.exe"}

Kill Process
`Ps > gwmi -Class win32_process -Filter { Name = "calc.exe" } | remove-wmiobject
`Ps > gwmi -Class win32_process -Filter { Name = "calc.exe" } | rwmi
*cim* `Ps > gcim -ClassName win32_process -Filter 'Name = "powershell.exe"' | remove-ciminstance
*cim* `Ps > gcim -ClassName win32_process -Filter 'Name = "powershell.exe"' | rcim
