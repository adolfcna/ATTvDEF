
`PS > gwmi -Namespace root\default -Class StdRegProv -List
`PS > gwmi -Namespace root\default -Class stdregprov -list | select -ExpandProperty methods
*cim* `PS > Get-CimClass -ClassName stdregprov -Namespace root/default | select -ExpandProperty cimclassmethods

Let see all methods
`PS > $reg = gwmi -Namespace root\default -Class stdregprov -list
`PS > $reg.Methods

| [Hive](https://github.com/darkoperator/Posh-SecMod/blob/master/Registry/Registry.ps1) | Value      |
| ------------------------------------------------------------------------------------- | ---------- |
| HKCR                                                                                  | 2147483648 |
| HKCU                                                                                  | 2147483649 |
| HKLM                                                                                  | 2147483650 |
| HKUS                                                                                  | 2147483651 |
| HKCC                                                                                  | 2147483653 |

#### Enum DIR or Keys

`PS > iwmi -Namespace root/default -Class StdRegProv -Name EnumKey @(2147483649,"Software\Microsoft\Internet explorer\") | select -ExpandProperty sNames

#### Value String in Property

Method 1:
`PS > iwmi -Class StdRegProv -Name GetStringValue @(2147483649,"Software\Microsoft\Internet explorer\typedurls","url1") | select -ExpandProperty sValue
Method 2:
`PS > (gwmi -Namespace root/default -Class stdregprov -list).methods | select Name
`PS > (gwmi -Namespace root/default -Class stdregprov -list).getstringvalue
`PS > (gwmi -Namespace root/default -Class stdregprov -list).getstringvalue(2147483649,"Software\Microsoft\Internet explorer\typedurls","url1")
`PS > (gwmi -Namespace root/default -Class stdregprov -list).getstringvalue(2147483649,"Software\Microsoft\Internet explorer\typedurls","url1").sValue

`PS > $reg = gwmi -Namespace root\default -Class stdregprov -list
`PS > $reg.getstringvalue(2147483649,"Software\Microsoft\Internet explorer\typedurls","url1")

#### Value String in Property on Remote Machine

method 1 : 
`PS > iwmi -Class StdRegProv -Name GetStringValue @(2147483649,"Software\Microsoft\Internet explorer\typedurls","url1") | select -ExpandProperty sValue -ComputerName x.x.x.x -Credential domian\user

method 2 : 
`PS > $regonRemote = gwmi -NameSpace root/default -Class StdRegProv -List -ComputerName x.x.x.x -Credential domain\user

`PS > $regonRemote.Methods | select Name
`PS > $regonRemote.GetStringValue
`PS>$regonRemote.GetStringValue(2147483650,"software\microsoft\windows\currentversion\run","hponeagentservice")
