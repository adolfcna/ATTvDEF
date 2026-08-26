
#### **Help**

`Ps > get-help *job*
`Ps > gcm *job*
`Ps > gcm -ParameterName AsJob
#### **Stop & Start Jobs**

`Ps > Start-Job -ScriptBlock {whoami}
`Ps > Get-Job 
`Ps > receive-job -id 1` or `Ps > get-job | reveive-job
`Ps > remove-job -id 1` or `Ps > get-job | remove-job
you can also run multiple command script job by specify the path of command
`Ps > Start-job -FilePath .\script.ps1


#### **Remote Jobs**

`Ps > $mal_analysis = New-PSSession -ComputerName x.x.x.x -Credential domain\User
`Ps > invoke-Command -ScriptBlock {start-job -scriptblock {get-process}} -session $mal_analysis 
`Ps > invoke-Command -ScriptBlock {get-job | receive-job} -session $mal_analysis
or 
`ps > icm -ScriptBlock {ps} -session $mal_analysis -AsJob
`ps > get-job
`ps > receive-job -id 3`

#### **multiple Remote Command Run**

`Ps > $mal_analysis = New-PSSession -ComputerName x.x.x.x -Credential domain\User
`Ps > icm -FilePath C:\file.ps1 -Session $mal_analysis -AsJob
`Ps > get-job
`Ps > receive-job -id 33