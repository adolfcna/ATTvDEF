
> [!abstract] DefenderCheck & AV Evasion
> **DefenderCheck** is a tool used in red teaming and penetration testing to assess the configuration and detection capabilities of Windows Defender. It helps identify exactly which parts of a file or payload trigger Windows Defender signatures, allowing testers to modify and bypass AV detection.
> **MITRE ATT&CK Mapping:** [T1027 - Obfuscated Files or Information](https://attack.mitre.org/techniques/T1027/) | [T1562.001 - Impair Defenses: Disable or Modify Tools](https://attack.mitre.org/techniques/T1562/001/)

## Key Features

> [!info]+ What DefenderCheck Does
> - **Assessing Windows Defender Status:** Checks if Defender is enabled and displays configuration settings (Real-time Protection, Cloud-delivered Protection, Sample Submission).
> - **Simulating Attacks:** Tests if malware or payloads can evade detection by breaking the binary into chunks to find the exact signature match.
> - **Vulnerability Testing:** Identifies weaknesses in Defender's detection capabilities, highlighting areas where payloads need to be obfuscated.

---

## Enumeration: Checking DeviceGuard

> [!example]+ Checking Virtualization-Based Security
> Before attempting to run custom payloads, it is critical to check if Windows Defender Device Guard (Credential Guard/VBS) is active, as it can block dynamic code execution and protect LSASS.
> ```powershell
> # Using WMI
> gwmi -Class win32_deviceguard -Namespace root/microsoft/Windows/DeviceGuard
> 
> # Using CIM
> gcim -ClassName win32_deviceguard -Namespace root/microsoft/Windows/DeviceGuard
> ```
> ![[demo 1.gif]]
> *Resource:* [matterpreter/DefenderCheck](https://github.com/matterpreter/DefenderCheck)

---

## Bypassing Defenses: Payload Modification

> [!tip]+ Modifying Payloads to Bypass Defender
> If `DefenderCheck` identifies specific malicious signatures (e.g., in `mimikatz.exe`), you must modify or obfuscate the payload. One method involves importing PowerSploit and compressing the executable into a DLL, which can then be loaded reflectively in memory.
> 
> ```powershell
> # Import PowerSploit module
> Import-Module PowerSploit
> 
> # Compress the executable into a DLL script
> Out-CompressedDll mimikatz.exe > sourcecode.txt
> ```
> *This allows you to load the executable in-memory via PowerShell, bypassing traditional disk-based AV scans.*

---

## .NET Obfuscation with ConfuserEx

> [!bug]+ Obfuscating .NET Assemblies
> For .NET executables (C#/VB.NET), **ConfuserEx** is a powerful protector and obfuscator. It applies anti-tampering, anti-debugging, and control flow obfuscation to make it significantly harder for Windows Defender to statically analyze and detect the payload.
> - **Resource:** [yck1509/ConfuserEx](https://github.com/yck1509/ConfuserEx)

---

> [!quote] Resources
> - **DefenderCheck:** [matterpreter/DefenderCheck](https://github.com/matterpreter/DefenderCheck)
> - **ConfuserEx:** [yck1509/ConfuserEx](https://github.com/yck1509/ConfuserEx)
> - **PowerSploit:** [PowerShellMafia/PowerSploit](https://github.com/PowerShellMafia/PowerSploit)

