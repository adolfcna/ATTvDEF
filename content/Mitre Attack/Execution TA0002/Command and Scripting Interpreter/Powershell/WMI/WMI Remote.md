
> [!abstract] WMI Fundamentals: Classes & Process Management
> A quick reference for using Windows Management Instrumentation (WMI) in PowerShell to enumerate namespaces, query local/remote processes, and execute code. This covers both legacy WMI (`gwmi`) and modern CIM (`gcim`) cmdlets.
> **MITRE ATT&CK Mapping:** [T1047 - Windows Management Instrumentation](https://attack.mitre.org/techniques/T1047/)

## 1. Help & Class Discovery

> [!info]+ Finding Help and Listing Classes
> ```powershell
> # Get help for WMI cmdlets
> get-help *wmi*
> 
> # List WMI Namespaces (starting from 'root')
> gwmi -Namespace "root" -Class "__namespace" | select Name
> # or
> Get-WMIObject -Namespace "root" -Class "__namespace" | select Name
> 
> # List all Classes in root/cimv2
> gwmi -NameSpace "root/cimv2" -List
> 
> # Search for specific classes (e.g., process)
> gwmi -NameSpace "root/cimv2" -List | ? {$_.Name -Match "process"}
> ```

---

## 2. Local Process Enumeration & Filtering

> [!example]+ Querying WMI Classes Locally
> Use `gwmi` (Legacy WMI) or `gcim` (Modern CIM) to query process information.
> 
> ```powershell
> # Basic queries
> gwmi -Class win32_process
> gwmi -Class Win32_process | select Name
> 
> # View class methods
> gwmi -Class Win32_Process -List | select -ExpandProperty Methods | fl
> 
> # Filtering for a specific process (lsass.exe)
> gwmi -Class Win32_process -Filter {Name = "lsass.exe"}
> gwmi -Class Win32_process | ? {$_.Name -eq "lsass.exe"}
> gwmi -Query {Select * From Win32_Process Where Name = "lsass.exe"}
> 
> # Modern CIM cmdlet equivalent
> gcim -Class Win32_Process
> ```

---

## 3. Remote Machine: Get Info & Kill Process

> [!danger]+ Remote Process Management
> Manage processes on remote machines using `-ComputerName` and `-Credential`.
> 
> **Get Process Info:**
> ```powershell
> gwmi -Class Win32_Process -ComputerName x.x.x.x -Credential domain\user
> ```
> 
> **Kill a Remote Process:**
> *Pipes the WMI object to `rwmi` (Remove-WmiObject) to terminate it.*
> ```powershell
> gwmi -class win32_process -Filter { Name = "powershell.exe" } -ComputerName x.x.x.x -Credential domain\user | rwmi
> ```

---

## 4. Process Creation (Local & Remote)

> [!bug]+ Spawning New Processes via WMI
> Use `iwmi` (Invoke-WmiMethod) to execute the `Create` method of the `Win32_Process` class. This is a common technique for stealthy lateral movement.
> 
> **Local Execution:**
> ```powershell
> # View available methods first
> gwmi -class Win32_Process -List | select -ExpandProperty Methods | select Name
> 
> # Spawn powershell.exe locally
> iwmi -Class win32_process -Name Create -ArgumentList "powershell.exe" 
> 
> # Spawn powershell.exe with a command
> iwmi -Class win32_process -name create -ArgumentList "powershell.exe -noexit -c get-process" 
> ```
> 
> **Remote Execution (Lateral Movement):**
> ```powershell
> # Spawn cmd.exe on a remote machine
> iwmi -Class win32_process -name create -ArgumentList "cmd.exe" -ComputerName x.x.x.x -Credential domain\user
> 
> # Spawn powershell.exe with a command on a remote machine
> iwmi -Class win32_process -name create -ArgumentList "powershell.exe -noexit -c get-process" -ComputerName x.x.x.x -Credential domain\user
> ```

---

> [!tip] PowerShell Alias Reference
> - `gwmi` = `Get-WmiObject` (Legacy WMI, uses DCOM)
> - `gcim` = `Get-CimInstance` (Modern CIM, uses WS-Man/DCOM)
> - `iwmi` = `Invoke-WmiMethod`
> - `rwmi` = `Remove-WmiObject`

