
#### **Help Command**

`ps > $PSVersionTable
`ps > get-help | more
`ps > get-help *alias*
`ps > get-help ls -Examples
`ps > get-help about_aliases

#### **CMDLets**

`ps > get-help get-command | more
`ps > get-help -full get-command | more
`ps > get-help -parameter * get-command | more
`PS > get-help get-process -showwindow
`ps > get-command | more
`ps > get-command -CommandType cmdlet
`ps > get-command -CommandType cmdlet -Name *process*
`ps > get-command -CommandType cmdlet -Name *service*
`ps > get-command -CommandType cmdlet | measure-object // count of all command 
`ps > get-command -CommandType cmdlets -Name *process*
`ps > get-service | more
`ps > get-process | more
`ps > get-command -verb start // command that start with start
`ps > get-command -verb stop // command that start with stop
`ps > start-process -Name Notepad.exe
`ps > stop-process -Name Notepad.exe` or `stop-process -id 55434`
`ps > get-hotfix


*Note : get-command alias to `gcm`*



#### Object  ****

class define method (function ()) and property ($var = 234) then we should crate object of this class
for example
```ps
class funny{
function(){}
function2(){}
$var = 1
$var = 2
} 
$opn = funny::new(car) /create object opn from class funny
```

for more information about property or method of one object u can use get-member cmdlet function

`PS > get-process | gm // show only first one
`PS > $output = get-process
`PS > Get-Member -InputObject $output // show all 
`PS > (get-process).Id
`PS > (get-process).modules

#### **ALIAS**

`PS > get-alias *
`PS > gal cd
`PS > gal gwmi
`PS > new-alias nn notepad.exe
`PS > nal sx set-executablepolicy 
`PS > set-alias nn chrome.exe
`PS > sal nn chrome.exe

#### **Format**

`ps > gcm -CommandType cmdlet -Name "format*"
`ps > ls | fl` or `ps > ls | Format-List 
`ps > ls | fl Name,LastAccessTime
`ps > ls | ft
`ps > ls | ft * | more

output

`ps > gcm -CommandType cmdlet -Name out*
`ps > get-process | Out-GridView
`ps > get-help -Example Out-File | more
`ps > get-process | Out-File C:\Users\Admin\Desktop\file.txt -append
`ps > ls | fl * | Out-File C:\file.txt
`ps > Get-Service | Export-Csv -Path .\Desktop\am.csv
`PS > Get-Process | tee-object -FilePath "C:\processes.txt" | Where-Object { $_.WorkingSet -gt 100MB }
`PS > Get-Service | tee-object -Variable services | Where-Object { $_.Status -eq "Running" }`
`PS > $services

#### **encoding**

`PS > $$OutputEncoding
`PS > $OutputEncoding = [System.Text.Encoding]::Unicode // UTF16
`PS > $OutputEncoding = [System.Text.Encoding]::UTF8
#### **Operation**

`ps > 1 * 5
`ps > 3+4
`ps >5/2
`ps > 4 % 2
`ps > 3 -eq 5 // equal 
`ps > 4 -ne 5 // not equal 
`ps > 3 -gt 2 // greater then 
`ps > 3 -lt 5 // litter then
`ps > 4 -le 5 // litter and equal to 
`ps > 4 -ge 5 // greater and equal to
`ps > "Hello Word" -Match "hello" // if string was mach out put was true
`ps > "Hello Word" -nomatch "hello"
`ps > "Hello Word" -Replace "hello","Love"
`ps > "lo" -in "hello word","lo"
`ps > 1 -in (1,2,3,4)
`-notin,-Like,-NotLike,-contains,-notcontains

`ps > (1 -eq 1) -and (3 -gt 1)
`-and,-or,-not,-xor,!

`ps > "Hello powershell redteam operator" -split " "
`ps > "Hello Word","friend" -join " hello"

`ps > 4 -is "int"
`ps > 5 is "float"
`ps > 5 is "string"
`-isnot,-as`
#### **Type**

`ps > $var = "hello word"
`ps > $var.GetType()
`ps > "hello word : $var "
`ps > 'hello word : $var '
`ps > $var = 4 + 3.4
`ps > [int]$var

object

`ps > $result = ls 
`ps > $result.GetType()
`ps > $slm = 1,"str",543,4.2
`ps > $slm.GetType()
`ps > $slm.length
`ps > $slm.count`
`ps > $slm[1]
`ps > $slm[2]
`ps > $slm = @()  // empety object

#### **Conditional statements**

`ps > if ( 1 -lt 7 ) {"echo hello"} else {"echo bye"}
`ps > if ( 10 -lt 7 ) {ls} else {netstat -ano}
`ps > if ((get-process).count -eq 7) {"venom"} else {"angel"}
`ps > switch (6) { 1 {"ali"} 2 {"mamad"} 6 {"saqar"} default {"not true value"} }

#### **Loop**

`ps > $process = get-process
`ps > foreach ($i in $process) {$i.Name}
`ps > foreach ($i in $items) { "192.168.10." + $i }

`ps > while ($process.count -le 340) { $process.count++ }

`ps > get-process | ForEach-Object {$_.Path}
or
`ps > Get-Process | % {$_.Path}
`ps > get-process | where-Object {$_.ProcessName -eq "lsass"}
or
`ps > Get-Process | ? {$_.ProcessName -eq "lsass"}

#### **Function**

`ps > function add {1 + 5}
`ps > add

`ps > functon paramshow { $args }
`ps > paramshow "hello"

`ps > function adds { $arg[0] + $arg[1] }
`ps > adds 1 4

`ps > function point ($arg1,$arg2) { $arg1 * $arg2}
`ps > point 1 4
`ps >point -arg1 1 -arg2 4

`ps > function point ([int]$arg1, [int]$arg2) {$arg1 / $arg2}
`ps > point 8 4

`ps > function defaultval ([int]$a = 4 , [int]$b = 4) {$a % $b}
`ps > defaultval
`ps > defaultval -a 1 

`ps > function fun ($a,$b,[switch]$c){ $a * $b; if ($c){$a-$b} }
`ps > fun 1 3
`ps > fun 1 3 -c

`ps > ls function:
*note : for saved the function persistence u should saved in `powershell` profile*

advanced function : 
```ps
function cis {
param (
[parameter(Mandatory = $True,position = 0)]
[AllowNull()]
$a,
[parameter(valuFromPipeline = $True ,position = 1)]
[ValidateSet(1,2,3)]
[ValidateLength(32)]
$b
)

	Write-output "a is $a"
	write-Output "b is $b"
}
```

```
function Show-AdvancedScript
{
    [CmdletBinding( SupportsShouldProcess = $True)]
    param(
    [Parameter()]
    $FilePath
    )

    Write-Verbose "Deleting $FilePath"
    if ($PSCmdlet.ShouldProcess("$FilePath", "Deleting file permanently"))
    {
    Remove-Item $FilePath
    }
}

function noneed{
write-output "dont show this function to user"
}

Export-ModuleMember -function *-*
```


#### **ENV**

`get-psdriver 
`dir env:\
`PS > Get-Item env:PSModulePath
`PS > Get-Item env:systemroot