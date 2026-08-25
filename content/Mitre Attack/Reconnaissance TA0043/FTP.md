
> [!abstract] FTP Enumeration & Brute Force
> A quick guide for enumerating FTP services (port 21), checking for anonymous access, brute-forcing credentials, and interacting with the FTP server.

## Reconnaissance & Banner Grabbing

> [!example]+ Nmap & Netcat
> Scan for FTP scripts and grab the service banner to identify the version and potential vulnerabilities.
> ```bash
> # Run all FTP nmap scripts including anonymous check
> nmap --script ftp* ftp-anon -p 21 $ip
> 
> # Banner grabbing with Netcat
> nc -vv 172.20.10.1 21
> ```

---

## Brute Forcing

> [!danger]+ Credential Brute Force (MITRE ATT&CK T1110)
> Attempting to guess FTP credentials using wordlists. 
> **Reference:** [MITRE ATT&CK T1110](https://attack.mitre.org/techniques/T1110/)
> 
> **Hydra:**
> ```bash
> hydra -t 4 -L /usr/share/metasploit/wordlists/data/unix_user.txt -P /usr/share/wordlists/nmap.lst $ip ftp
> ```
> *Note: Common password lists include `/usr/share/wordlists/nmap.lst` or `/usr/share/john/password.lst`.*
> 
> **Metasploit Framework (MSFconsole):**
> ```ruby
> msfconsole -q
> search scanner ftp_login
> use auxiliary/scanner/ftp/ftp_login
> show options
> # set RHOSTS, USER_FILE, and PASS_FILE
> exploit
> ```

---

## FTP Interaction & Commands

> [!info]+ Logging in and Using FTP
> Connect to the target FTP server. Try `anonymous` as both username and password if anonymous login is allowed.
> ```bash
> ftp x.x.x.x
> # Username: anonymous
> # Password: (anything or anonymous)
> ```
> 
> **Useful FTP Commands:**
> ```bash
> ls              # List files
> get             # Get a single file from the remote computer
> mget *          # Get multiple files (downloads everything)
> put             # Send a single file
> mput            # Send multiple files
> send            # Send a single file (alias for put)
> binary          # Switches to binary transfer mode (for files/executables)
> ascii           # Switch to ASCII transfer mode (for text files)
> bye             # Exit FTP session
> ```

