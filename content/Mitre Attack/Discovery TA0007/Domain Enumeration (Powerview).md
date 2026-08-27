
> [!abstract] Active Directory Enumeration Cheat Sheet
> A comprehensive guide to enumerating Active Directory environments using Native Windows tools, PowerSploit (PowerView), and BloodHound. Covers users, groups, computers, GPOs, ACLs, and domain trusts.

## Step 1: Stealth Setup (Invisi-Shell)

> [!warning]+ Defense Evasion with Invisi-Shell
> Before running enumeration scripts, use Invisi-Shell to bypass PowerShell logging (AMSI/ScriptBlock Logging).
> **Resource:** [OmerYa/Invisi-Shell](https://github.com/OmerYa/Invisi-Shell)
> ```cmd
> :: Run as Administrator
> .\RunWithPathAsAdmin.bat
> 
> :: Run as standard user
> .\RunWithRegistryNonAdmin.bat
> ```
> *See also:* [[Invisible Shell]]

---

## Method 1: Legacy Manual Enumeration (Native Tools)

> [!info]+ Native CMD & PowerShell
> Using built-in Windows tools. No third-party payloads required, but heavily monitored by SIEMs.
> 
> ```mermaid
> graph LR
>     A[AD Enumeration] --> B(CMD: net commands)
>     A --> C(PS: ActiveDirectory Module)
>     B --> D[Users & Groups]
>     C --> E[Computers & OUs]
> ```
> 
> **CMD (`net` commands):**
> ```cmd
> net user /domain
> net user cna /domain
> net group /domain
> net group "sales department" /domain
> ```
> 
> **PowerShell (AD Module):**
> ```powershell
> Get-ADUser -Filter *
> Get-ADGroup -Filter *
> Get-ADOrganizationalUnit -Filter *
> ```

---

## Method 2: PowerSploit (PowerView)

> [!example]+ Importing PowerView
> PowerView is a powerful PowerShell module for domain enumeration.
> ```powershell
> # Bypass execution policy and import
> powershell -ep bypass powerview.ps1
> # Or dot-source inside an existing PS session
> . .\powerview.ps1
> ```

> [!tip]+ Domain & Policy Info
> ```powershell
> Get-Domain
> Get-Domain -Domain domain.local       # Parent domain info
> Get-DomainSID
> Get-DomainPolicy
> (Get-DomainPolicy).SystemAccess      # or: Get-DomainPolicy | select SystemAccess
> (Get-DomainPolicy).kerberospolicy
> Get-DomainController
> Get-DomainController -Domain domain.local
> ```

> [!tip]+ User Enumeration
> ```powershell
> Get-DomainUser
> Get-DomainUser | select samaccountname, objectsid
> Get-DomainUser -identity <user>
> Get-DomainUser -LDAPFilter "Description=*built*" | Select name, Description
> 
> # Legacy aliases
> Get-NetUser
> Get-NetUser | select cn, pwdlastset, lastlogon
> ```

> [!tip]+ Computer Enumeration
> ```powershell
> Get-DomainComputer
> Get-DomainComputer | select name, operatingsystem, dnshostname, operatingsystemversion
> Get-DomainComputer -Domain domain.local
> Get-DomainComputer -Ping
> Get-DomainComputer -OperatingSystem "*Server 2016*"
> Get-NetSession -ComputerName hostname -Verbose
> ```

> [!tip]+ Group & Member Enumeration
> *Note: Event codes 4624, 4634, 4672 are used to define privileges and logon sessions.*
> ```powershell
> Get-DomainGroup
> Get-DomainGroup -Domain domain.local
> Get-DomainGroup | select Name
> Get-DomainGroup *admin*
> Get-DomainGroup 'name of group'
> Get-DomainGroup -UserName <user> | select name
> Get-DomainGroup | select cn, member
> 
> # Members in groups
> Get-DomainGroupMember 'Group Name' | select MemberName
> Get-DomainGroupMember -Identity "Domain Admins" -Recurse
> Get-NetLocalGroupMember -Computername DC -GroupName "administrators"
> ```

> [!danger]+ Share & File Finder
> ```powershell
> Find-DomainShare -ComputerName HostName.domain.local -Verbose
> Find-DomainShare -ComputerName HostName.domain.local -CheckShareAccess -Verbose
> Get-NetShare 
> Invoke-NetView
> Invoke-FileFinder -Verbose          # Find sensitive files on computers in domain (Very Noisy!)
> Get-NetFileServer                   # Get all fileservers of domain
> Invoke-ShareFinder -Verbose         # Find shares on hosts in current domain
> ```

> [!info]+ Organizational Units (OU)
> ```powershell
> Get-DomainOU
> Get-DomainOU -Identity ounameondomain
> (Get-DomainOU -Identity ounameondomain).distinguishedname | %{Get-DomainComputer -SearchBase $_} | select name
> Get-DomainOU | select Name
> Get-NetOU | select Name
> ```

> [!info]+ GPO Policies
> ```powershell
> Get-DomainGPO
> Get-DomainGPO | select DisplayName
> Get-DomainGPO -identity '{gplink}'
> Get-DomainGPO -ComputerIdentity mal-analysis
> Get-DomainGPOLocalGroup
> Get-DomainGPOComputerLocalGroupMapping -ComputerIdentity mal-analysis.domain.local
> Get-DomainGPOComputerLocalGroupMapping -Identity username -verbose
> Get-NetGPO 
> Get-NetGPO | select DisplayName
> ```

> [!bug]+ Trust & Forest Mapping
> ```powershell
> Get-DomainTrust                       # Current domain trust to target domain
> Get-Forest
> Get-Forest -Forest domain.local
> Get-ForestDomain
> Get-ForestDomain -Forest domain.local
> Get-ForestTrust
> Get-ForestTrust -Forest domain.local
> Get-NetDomainTrust
> Get-DomainTrustMapping
> Get-NetForest
> Get-NetForestTrust
> Get-NetForestDomain
> ```

> [!danger]+ Kerberos & SPNs
> *SPN (Service Principal Name): Services in the domain that interact with Kerberos.*
> ```powershell
> Get-NetUser -SPN
> Get-DomainUser | where-object {$_.servicePrincipalName}
> setspn -L iis-service 
> gcim -ClassName ds_user -Namespace root/directory/LDAP | select DS_servicePrincipalName
> setspn -Q */*                       # Query all SPNs in domain
> ```
> 
> **Pre-Authentication Check (AS-REP Roasting):**
> ```powershell
> Get-NetUser -PreauthNotRequired | select samaccountname, useraccountcontrol
> Get-DomainUser | where-Object { $_.UserAccountControl -Like "*DONT_REQ_PREAUTH*" }
> ```

> [!warning]+ Access Lists (DACL & SACL)
> ```powershell
> Get-ObjectAcl -identity <user>
> Get-DomainObjectAcl
> Get-DomainObjectAcl -Identity 'Domain Admins' -ResolveGUIDs -Verbose
> Find-InterestingDomainAcl -ResolveGUIDs
> Find-InterestingDomainAcl -ResolveGUIDs | ?{$_.IdentityReferenceName -match "groupname"}
> Convert-SidtoName s-15-24-343134242343...  
> ```

> [!bug+] User Sessions & Local Admin Access
> ```powershell
> Get-NetLoggedon -HostName mal-analysis
> Invoke-UserHunter                      # Find which host a domain admin is logged into
> Invoke-EnumerateLocalAdmins
> Invoke-HostEnum -HostName mal-analysis
> Invoke-FindVulnSystems
> 
> # Local Admin Access
> Find-LocalAdminAccess                  # Find where current user has local admin access
> Find-DomainUserLocation -Verbose        # Find where domain admins have sessions
> Find-WMILocalAdminAccess.ps1
> Find-PSRemotingLocalAdminAccess.ps1
> ```

---

## Method 3: BloodHound (Graph-Based Enumeration)

> [!abstract]+ BloodHound & SharpHound
> BloodHound reveals hidden and complex attack paths within Active Directory by analyzing relationships (graphs).
> 
> ```mermaid
> flowchart LR
>     A[Victim Machine] -->|SharpHound.ps1 / .exe| B(JSON Data)
>     B --> C[Attacker Machine]
>     C --> D[Neo4j Database]
>     D --> E[BloodHound GUI]
>     E --> F[Visual Attack Path Analysis]
> ```
> 
> **Step 1: Data Collection (SharpHound)**
> Download SharpHound from [BloodHoundAD GitHub](https://github.com/BloodHoundAD/BloodHound).
> ```powershell
> # Import module
> import-module Collector\SharpHound.ps1
> Get-help Invoke-BloodHound
> 
> # Collect ALL data
> invoke-BloodHound -CollectionMetHods ALL -OutPutDirectory C:\Users\cc\Desktop -OutPutPrefix "name" -Verbose
> invoke-BloodHound -CollectionMetHods ALL -Domain domain.local -OutPutDirectory C:\Users\cc\Desktop -OutPutPrefix "name" -Verbose
> 
> # ATA Bypass (Excluding Domain Controllers to avoid detection)
> invoke-BloodHound -CollectionMetHods ALL -OutPutDirectory C:\Users\cc\Desktop -OutPutPrefix "name" -ExcludeDC -Verbose
> 
> # Alternative: Run the executable directly
> .\SharpHound.exe
> ```
> 
> **Step 2: Data Analysis**
> *On Linux:*
> ```bash
> sudo neo4j start
> bloodhound
> ```
> *On Windows:*
> Download `BloodHound-win32-x64.zip` from releases and run.
> ```cmd
> bloodhound.exe
> ```
> *Default Login:* `neo4j` / `bhbloodhound`

---

> [!quote] Useful Resources
> - **BloodHound:** [BloodHoundAD/BloodHound](https://github.com/BloodHoundAD/BloodHound)
> - **AD Module:** [samratashok/ADModule](https://github.com/samratashok/ADModule)
> - **PowerSploit:** [PowerShellMafia/PowerSploit](https://github.com/PowerShellMafia/PowerSploit)

