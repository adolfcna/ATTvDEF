ACLs Can be modified to Allow non-admin Users access to securable objects. Using Race toolkit

### **ACL in WMI (via DCOM)**

- **Where It Is Applied:**  
    WMI uses Distributed Component Object Model (DCOM) for remote management and communication. The ACLs in this context control who has access to WMI namespaces and objects.
    
- **How It Works:**
    
    - The ACLs for WMI are configured at the **namespace level**.
    - For example, permissions for the `Root\CIMv2` namespace can be controlled through **Component Services** or directly via PowerShell scripts.
    - These permissions determine who can query, execute methods, or modify WMI objects.
- **Use Cases:**
    
    - Granting or restricting remote management access to WMI.
    - Controlling which users or groups can monitor system performance or configuration via WMI tools like PowerShell.
- **Tools to Manage:**
    
    - **WMImgmt.msc:** Used to manage WMI Control.
    - **PowerShell Commands:** To modify WMI namespace security (`Get-WmiObject`, `Set-WmiNamespaceSecurity`).

![[Pasted image 20241226164232.png]]

---

### **2. ACL in Active Directory (Object-Level Permissions)**

- **Where It Is Applied:**  
    ACLs in Active Directory are applied at the object level. Every object in the directory (e.g., users, groups, organizational units, etc.) has an associated ACL that defines permissions.
    
- **How It Works:**
    
    - The ACL is stored in the **Security Descriptor** of each Active Directory object.
    - It determines what actions (e.g., read, write, delete) are allowed on that object and by whom.
    - ACLs can be managed via the **Active Directory Users and Computers (ADUC)** console or programmatically using tools like PowerShell.
- **Use Cases:**
    
    - Managing access to specific AD objects.
    - Assigning granular permissions for user or group management tasks.
    - Delegating administrative tasks to specific users/groups (e.g., allowing a user to reset passwords in a specific OU).
- **Tools to Manage:**
    
    - **ADUC (Active Directory Users and Computers):** Modify object permissions via the **Security** tab.
    - **PowerShell:** For example, use `Get-ACL` and `Set-ACL` cmdlets to query or modify permissions.
    - **LDP.exe:** View or edit ACLs directly in the Active Directory database.

![[Pasted image 20241226164134.png]]

---

### **Key Differences Between the Two:**

|Aspect|WMI (DCOM) ACLs|Active Directory ACLs|
|---|---|---|
|**Scope**|Manages access to WMI namespaces/objects.|Manages access to AD objects.|
|**Storage**|ACLs are stored in WMI namespaces.|ACLs are part of the AD object metadata.|
|**Tools for Management**|WMI Control (WMImgmt.msc), PowerShell.|ADUC, PowerShell, or LDP.exe.|
|**Communication Protocol**|Primarily uses DCOM for remote access.|LDAP is the primary protocol used.|

`PS > ipmo RACE.ps1
on local computer
`PS > Set-RemoteWMI -SamAccountName normaluser -verbos
on remote Machine if we have local admin privileges
`PS > Set-RemoteWMI -SamAccountName domain\normaluser -Namespace 'root\cimv2' -verbose
on remote machine with explicit credentials. only root\cimv2 and nested namespace 
`PS > Set-RemoteWMI -SamAccountName normaluser -ComputerName mal-analysis -Credential adminstrator -namespace 'root\cimv2' -verbose
on remote machine remove permissions
`PS > Set-RemoteWMI -SamAccountName normaluser -ComputerName mal-analysis -Credential adminstrator -namespace 'root\cimv2' -Remove -verbose
