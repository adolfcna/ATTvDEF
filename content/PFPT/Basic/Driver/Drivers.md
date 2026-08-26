Drives and Environment Variables We all know that a hard drive **really** only has sectors, clusters, and partitions, but the operating system allows us to access the drive's contents by assigning a drive letter to each volume and a name to each folder and file. Hence, the operating system organizes filesystem data in a certain hierarchical way that is easy to understand and manipulate. Windows and UNIX then both come with tools that are designed around the easy manipulation of filesystems, which is better than forcing users to directly manipulate the sectors and clusters that *really* exist. The important thing about a filesystem is that it is a hierarchical set of containers in which each container **(directory)** can contain discrete objects **(files)** or more sub containers **(subdirectories)**. Because the structure is hierarchical, we can identify the path to the location where we currently are, change locations, drill down recursively from one container through all of its sub containers, and otherwise "move around" in that nested set of containers. And in each container, we can store useful items, like documents and programs. But notice that the registry is also a set of hierarchical containers **(keys)** that hold items **(values)** and sub containers (subkeys). And note that Active Directory is also a set of containers (organizational units) that holds items **(users, computers, etc.)** and other sub containers **(sub-OUs)**. Can you recursively search the registry? Yes. Can you move a user from one OU to another in Active Directory? Easily. So here's the Big Idea: Just as the operating system makes filesystems available to CMD.EXE as drives, folders, and files, why can't PowerShell make the registry, certificate stores, Active Directory, variable collections, SQL Server, and other hierarchical sets of containers with items inside them, including the regular filesystem itself, available as abstract "drives" with "containers" and "items"? Well, it can!

A *drive* is just the name of a top-level container that can hold named *sub containers*, such as folders, keys, and organizational units. An "item" is just a non-container object of some type, such as a file, registry value, or user account. Your "location" in a set of nested containers determines how you access other containers and items, i.e., are those other things "above" you, "below" you, in the "current location", etc.? Very often, PowerShell makes the things you want to manage available to you as items in containers, with the top-level container named as a **drive**. A **provider** is a **.NET** assembly compiled as a DLL and loaded into PowerShell for the purpose of making the things you want to manage available as a drive. A PowerShell drive can be made available through resources other than providers too.

`PS > Get-PSDrive
```output
Name            Used (GB)   Free (GB)  Provider    Root        CurrentLocation
----            ---------   ---------  --------    ----        ---------------
Alias                                   Alias
C                 252.76      222.70   FileSystem   C:\          Users\CNA
Cert                                   Certificate   \
Env                                    Environment
F                  62.81      413.75   FileSystem    F:\
Function                               Function
HKCU                                   Registry      HKEY_CURRENT_USER
HKLM                                   Registry      HKEY_LOCAL_MACHINE
Variable                               Variable
WSMan                                  WSMan
```
`PS > Get-PSDrive -PSProvider Registry
`PS > Get-PSDrive -PSProvider FileSystem
`PS > Get-PSProvider
```output
Name                 Capabilities                                      Drives
----                 ------------                                      ------
Registry             ShouldProcess, Transactions                       {HKLM, HKCU}
Alias                ShouldProcess                                     {Alias}
Environment          ShouldProcess                                     {Env}
FileSystem           Filter, ShouldProcess, Credentials                {C, F}
Function             ShouldProcess                                     {Function}
Variable             ShouldProcess                                     {Variable}
Certificate          ShouldProcess                                     {Cert}
WSMan                Credentials                                       {WSMan}
```