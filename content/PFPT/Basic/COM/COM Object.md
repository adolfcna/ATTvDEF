
`Ps > dir -Path "Registry::HKEY_CLASSES_ROOT\CLSID"
`Ps > dir -Path "Registry::HKEY_CLASSES_ROOT\CLSID" -include PROGID -Recurse 
`Ps > dir -Path "Registry::HKEY_CLASSES_ROOT\CLSID" -Include PROGID -Recurse | foreach {$_.GetValue("")}
`Ps > dir -Path "Registry::HKEY_CLASSES_ROOT\CLSID" -Include PROGID -Recurse | % {$_.GetValue("")} | ? {$_ -match "wscript"}
#### **Create Object**

`Ps > dir -Path "Registry::HKEY_CLASSES_ROOT\CLSID" -Include PROGID -Recurse | % {$_.GetValue("")} | ? {$_ -match "wscript"}
`Ps > $wscript = New-Object -ComObject Wscript.shell.1
`Ps > $wscript | gm

out put : 
```
AppActivate              Method             
CreateShortcut           Method                
Exec                     Method             
ExpandEnvironmentStrings Method                
LogEvent                 Method                
Popup                    Method              
RegDelete                Method                
RegRead                  Method               
RegWrite                 Method               
Run                      Method               
SendKeys                 Method               
Environment              ParameterizedProperty 
CurrentDirectory         Property             
SpecialFolders           Property             
```

`Ps > $wscript.CurrentDirectory
`Ps > $wscript.Exec("notepad")
`Ps > $wscript.Popup("your system was hacked by adolf cna")

*Note: `get-member` alias to `gm` this command use for get properties and method of object*

`Ps > dir -Path "Registry::HKEY_CLASSES_ROOT\CLSID" -Include PROGID -Recurse | % {$_.GetValue("")} | ? {$_ -match "shell.Application"}
`Ps > $slm = New-Object -ComObject shell.Application.1
`Ps > $slm | gm

