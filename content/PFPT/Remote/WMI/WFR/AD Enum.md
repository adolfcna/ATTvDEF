
#### Name Space use to List Exist Class

`PS > gwmi -NameSpace root/directory/ldap -list
`PS > get-cimClass -NameSpace root/directory/ldap 

#### Domain Enumeration

info about this computer 
`PS > gwmi -Class win32_computersystem
info about all domain
`PS > gwmi -Namespace root/directory/ldap -Class ds_domain
`PS > gwmi -Namespace root/directory/ldap -Class ds_domain | select ds_name
all computer in domain
`PS > gwmi -Namespace root/directory/ldap -Class ds_Computer
`PS > gwmi -Namespace root/directory/ldap -Class ds_Computer | select ds_cn
special computer in Domain
`PS > gwmi -Namespace root/directory/ldap -Class ds_Computer | ? {$_.ds_cn -eq "mal-analysis"}
special computer in Domain and remove null value
`PS > (gwmi -Namespace root/directory/ldap -Class ds_Computer | ? {$_.ds_cn -eq "mal-analysis"}).properties | % {If($_.Value -AND $_.Name -notmatch "__"){@{ $($_.Name) = $($_.Value)}}}
name of dc in domain
`PS > gwmi -Namespace root/directory/ldap -Class ds_Computer | ? { $_.DS_userAccountControl -eq 532480}
name of dc in domain remove null value
`PS > (gwmi -Namespace root/directory/ldap -Class ds_Computer | ? { $_.DS_userAccountControl -eq 532480}).properties | % {If($_.Value -AND $_.Name -notmatch "__"){@{ $($_.Name) = $($_.Value)}}}

#### User & Group Enumeration

User in all domain
`PS > gwmi -Class win32_UserAccount -list
`PS > gwmi -Class win32_UserAccount
`PS > gwmi -Class win32_UserAccount -Filter "Domain = 'adolf'"
Group in all domain
`PS > gwmi -Class Win32_Group -list
`PS > gwmi -Class Win32_Group
`PS > gwmi -Class Win32_GroupInDomain
`PS > gwmi -Class Win32_GroupInDomain | % {[wmi]$_.PartComponent} // like win32_group
list group on special domain
`PS > gwmi -Class Win32_GroupInDomain | ? {$_.GroupComponent -match "adolf"}| % {[wmi]$_.PartComponent}
Users In Group
`PS > gwmi -Class Win32_GroupUser
Users with Domain admins privileges
`PS > gwmi -Class Win32_GroupUser | ? {$_.GroupComponent -match "Domain Admins"}| % {[wmi]$_.PartComponent}
User in example domain have Domain Admin Privileges
`PS > gwmi -Class Win32_GroupUser | ? {$_.GroupComponent -match "Adolf" -AND $_.GroupComponent -match "Domain Admins"}| % {[wmi]$_.PartComponent}
Current User in witch Group ?
`PS > gwmi -Class Win32_GroupUser | ? {$_.PartComponent -match "currentuser"} | % {[wmi]$_.GroupComponent}


simple script to get information about all computer in domain that current user access admin privileges

```powershell
function enumcomputer{
$computers = gwmi -Namespace root/directory/ldap -Class ds_Computer | select -expandproperty ds_cn
foreach($com in $computers){(gwmi -Class win32_ComputerSystem -computername $com)}
}
```
