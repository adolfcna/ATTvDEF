
Discover Method
`Ps > gwmi -List | % {$_.Methods}
`Ps > gwmi -Class * -List | ? {$_.Methods}
`Ps > gwmi -list | % {$_.Methods} | ? {$_.Name -eq "create"} | select Origin
`Ps > gwmi -Class win32_process -List | select -ExpandProperty Methods | select Name
*cim* `Ps > get-cimclass -MethodName *
*cim* `Ps > get-cimclass -MethodName Create

output of parameters method use
*cim* `Ps > Get-CimClass -ClassName win32_process | select -ExpandProperty cimclassmethods | ? {$_.Name -eq "create"} | select -ExpandProperty parameters

Change attribute
`Ps > gwmi -Class win32_printer -Filter ' Name = "Microsoft XPS Document Writer"' | set-wmiInstance -Arguments @{comment = "salam ham vatan"}
