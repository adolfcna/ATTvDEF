
> [!abstract] WMI & CIM Basics: Namespaces & Classes
> Windows Management Instrumentation (WMI) and Common Information Model (CIM) are core management technologies in Windows. Understanding how to navigate WMI Namespaces and Classes using PowerShell is essential for stealthy enumeration, execution, and lateral movement without relying on standard system binaries.
> **MITRE ATT&CK Mapping:** [T1047 - Windows Management Instrumentation](https://attack.mitre.org/techniques/T1047/) | [T1082 - System Information Discovery](https://attack.mitre.org/techniques/T1082/) | [T1057 - Process Discovery](https://attack.mitre.org/techniques/T1057/)

## 1. Finding Help & Commands

> [!info]+ Discovering WMI/CIM Cmdlets
> Use `Get-Command` (`gcm`) to list all available PowerShell cmdlets related to WMI and CIM.
> ```powershell
> gcm *wmi*
> gcm *cim*
> ```

---

## 2. Enumerating Namespaces

> [!tip]+ Listing WMI Namespaces
> WMI is organized hierarchically into namespaces (like folders). The root namespace is `root`. You can enumerate all sub-namespaces by querying the `__namespace` system class.
> 
> **Using WMI** (`gwmi`)**:**
> ```powershell
> get-wmiobject -Namespace "root" -Class "__namespace" | select Name
> gwmi -Namespace "root" -Class "__namespace" | select Name
> ```
> 
> **Using CIM** (`gcim`)**:**
> ```powershell
> get-ciminstance -Namespace "root" -Class "__namespace" | select Name
> gcim -Namespace "root" -Class "__namespace" | select Name
> ```

---

## 3. Enumerating Classes

> [!example]+ Finding Classes within Namespaces
> Once you know the namespace, you can list all classes inside it or search for specific classes using wildcards.
> 
> **List all classes in specific namespaces:**
> ```powershell
> # List classes in the 'default' namespace
> gwmi -namespace root\default -Class * -List
> 
> # List classes in the 'cimv2' namespace
> gwmi -namespace root\cimv2 -Class * -List
> ```
> 
> **Search for specific classes:**
> ```powershell
> # Search for classes containing 'bios' in root\cimv2
> gwmi -namespace root\cimv2 -Class *bios* -List
> 
> # Using CIM
> get-cimclass -ClassName *bios*
> ```

---

## 4. Querying Class Instances

> [!bug]+ Extracting System Information
> Once you find the class you need, you can query its instances (the actual data). 
> 
> **Example 1: BIOS Information**
> ```powershell
> gwmi -Class *bios* -List 
> gwmi -Class win32_bios -List
> gwmi -Class win32_bios
> 
> # Using CIM
> gcim -ClassName win32_bios
> ```
> 
> **Example 2: Process Enumeration & Filtering**
> *Filtering processes to find a specific executable (e.g., `powershell.exe`).*
> ```powershell
> gwmi -Class *process* -List
> gwmi -Class win32_process
> 
> # Method 1: WQL Filter with curly braces (WMI native)
> gwmi -class win32_process -Filter { name = "powershell.exe"}
> 
> # Method 2: WQL Filter with single quotes (Standard string)
> gwmi -class win32_process -Filter 'name = "powershell.exe"'
> 
> # Method 3: Pipeline filtering with Where-Object
> gwmi -class win32_process | ? {$_.Name -eq "powershell.exe"}
> ```

> [!warning] Important Note: The Default Namespace
> You might have noticed that we didn't specify the `-Namespace` parameter in the queries above (like `win32_bios` or `win32_process`). 
> 
> This is because `root\cimv2` **is the default WMI namespace** in Windows. If you don't explicitly provide a namespace, PowerShell automatically queries `root\cimv2`, which contains most of the useful operating system and hardware information.

