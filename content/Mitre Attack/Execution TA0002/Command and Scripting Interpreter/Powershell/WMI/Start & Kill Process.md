> [!abstract] Process Management via WMI & CIM
> Using Windows Management Instrumentation (WMI) and Common Information Model (CIM) cmdlets to enumerate, create, and terminate processes locally or remotely. This is a stealthy way to interact with processes without using standard executables like `taskmgr.exe` or `taskkill.exe`.
> **MITRE ATT&CK Mapping:** [T1057 - Process Discovery](https://attack.mitre.org/techniques/T1057/) | [T1106 - Native API](https://attack.mitre.org/techniques/T1106/) | [T1562 - Impair Defenses](https://attack.mitre.org/techniques/T1562/)

## 1. Process Enumeration

> [!example]+ Getting Process Information
> Retrieve details about running processes using WMI (`gwmi`) and CIM (`gcim`).
> 
> **Using WMI** (`gwmi`)**:**
> ```powershell
> # Filter by process name
> gwmi -Class win32_process -Filter { Name = "calc.exe" }
> 
> # Using Where-Object
> gwmi -Class win32_process | ? {$_.Name -eq "calc.exe"}
> ```
> 
> **Using CIM** (`gcim`)**:**
> ```powershell
> # Filter by process name (note the single quotes for CIM filter)
> gcim -ClassName win32_process -Filter 'Name = "powershell.exe"'
> ```

---

## 2. Process Creation

> [!danger]+ Spawning New Processes
> WMI can be used to spawn new processes remotely or locally. This method is often used by attackers for lateral movement because it relies on DCOM/RPC rather than SMB or WinRM.
> 
> **Exploring the** `Create` **Method:**
> ```powershell
> # View the Create method details
> get-cimclass -MethodName Create
> 
> # View parameters required for the Create method
> Get-CimClass -className win32_process | select -ExpandProperty cimclassmethods | ? {$_.Name -eq "Create"} | select -ExpandProperty parameters
> ```
> 
> **Executing the** `Create` **Method:**
> ```powershell
> # Using Invoke-WmiMethod (Array argument)
> invoke-wmimethod -Class win32_process -Name Create -ArgumentList @(calc.exe)
> 
> # Using Invoke-WmiMethod (String argument)
> invoke-wmimethod -Class win32_process -Name Create -ArgumentList calc.exe
> 
> # Using Invoke-WmiMethod (Hashtable argument)
> invoke-wmimethod -Class win32_process -Name Create -ArgumentList @{commandline = "calc.exe"}
> ```

---

## 3. Process Termination

> [!warning]+ Killing Processes
> Terminate running processes by piping the WMI/CIM object to the appropriate removal cmdlet.
> 
> **Using WMI** (`gwmi`)**:**
> ```powershell
> # Using Remove-WmiObject
> gwmi -Class win32_process -Filter { Name = "calc.exe" } | remove-wmiobject
> 
> # Using the alias 'rwmi'
> gwmi -Class win32_process -Filter { Name = "calc.exe" } | rwmi
> ```
> 
> **Using CIM** (`gcim`)**:**
> ```powershell
> # Using Remove-CimInstance
> gcim -ClassName win32_process -Filter 'Name = "powershell.exe"' | remove-ciminstance
> 
> # Using the alias 'rcim'
> gcim -ClassName win32_process -Filter 'Name = "powershell.exe"' | rcim
> ```

> [!tip] OPSEC & Lateral Movement
> - `Invoke-WmiMethod` is highly favored for lateral movement because it operates over DCOM (TCP port 135 + dynamic high ports). If SMB (445) or WinRM (5985) is blocked by the firewall but DCOM is open, WMI process creation will still work.
> - Process creation via WMI generates **Event ID 4624 (Type 3 - Network Logon)** and **Event ID 4688 (New Process Created)**. If the process is spawned remotely, the caller will be the remote user account.

