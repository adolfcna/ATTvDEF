
> [!abstract] WMI Method Discovery & Instance Modification
> Windows Management Instrumentation (WMI) contains hundreds of classes with executable methods (e.g., `Create`, `Terminate`, `EnableStatic`). Attackers enumerate these methods to find stealthy ways to execute code, modify system configurations, or change object attributes (like printer settings or registry values) without touching standard Windows binaries.
> **MITRE ATT&CK Mapping:** [T1047 - Windows Management Instrumentation](https://attack.mitre.org/techniques/T1047/) | [T1068 - Exploitation for Privilege Escalation](https://attack.mitre.org/techniques/T1068/)

## 1. Discovering WMI Methods (`gwmi`)

> [!info]+ Finding Available Methods via WMI
> You can iterate through WMI classes to find all available methods, or search for specific methods (like `Create`) to see which classes support them.
> 
> **List All Methods in all Classes:**
> ```powershell
> # Iterates through all classes and expands their methods
> gwmi -List | % {$_.Methods}
> 
> # List only classes that actually have methods
> gwmi -Class * -List | ? {$_.Methods}
> ```
> 
> **Find the Origin of a Specific Method:**
> *Finds which class originally implements the `Create` method.*
> ```powershell
> gwmi -list | % {$_.Methods} | ? {$_.Name -eq "create"} | select Origin
> ```
> 
> **List Methods of a Specific Class:**
> ```powershell
> gwmi -Class win32_process -List | select -ExpandProperty Methods | select Name
> ```

---

## 2. Discovering WMI Methods (CIM)

> [!tip]+ Finding Available Methods via CIM
> The CIM cmdlets (`Get-CimClass`) provide a cleaner, object-oriented way to explore WMI methods and their parameters.
> 
> **Find Classes by Method Name:**
> ```powershell
> # Find all classes that have any method
> get-cimclass -MethodName *
> 
> # Find all classes that specifically implement the 'Create' method
> get-cimclass -MethodName Create
> ```

---

## 3. Exploring Method Parameters

> [!bug]+ Viewing Method Parameters (Arguments)
> Before executing a WMI method (like `Create`), you need to know what arguments it expects. You can extract the parameter list using CIM.
> 
> **Get Parameters for** `win32_process.Create`**:**
> ```powershell
> Get-CimClass -ClassName win32_process | select -ExpandProperty cimclassmethods | ? {$_.Name -eq "create"} | select -ExpandProperty parameters
> ```
> *This will output the required arguments (e.g., `CommandLine`, `CurrentDirectory`, `ProcessId`) needed to spawn a process.*

---

## 4. Modifying WMI Instance Attributes

> [!danger]+ Changing Object Properties (`Set-WmiInstance`)
> Instead of just reading data, you can modify the attributes of existing WMI instances. This is useful for backdooring system configurations (e.g., changing printer names, modifying network settings, or disabling security features).
> 
> **Example: Modifying a Printer's Comment**
> *This query finds a specific printer and changes its `comment` attribute to a custom string.*
> ```powershell
> gwmi -Class win32_printer -Filter 'Name = "Microsoft XPS Document Writer"' | set-wmiInstance -Arguments @{comment = "salam ham vatan"}
> ```
> 
> **How it works:**
> 1. `gwmi` retrieves the specific WMI object instance (the printer).
> 2. `Set-WmiInstance` takes a hashtable (`-Arguments`) of the properties you want to modify and applies them directly to the live system object.

> [!warning] OPSEC & Detection Notes
> - **Method Discovery:** Enumerating WMI classes and methods via `gwmi -List` or `Get-CimClass` is generally noisy on the CPU if done broadly (like `gwmi -Class * -List`), but it generates minimal security alerts as it is a standard administrative task.
> - **Instance Modification:** Using `Set-WmiInstance` to modify system properties (especially registry keys via `StdRegProv` or network configurations) will generate **Event ID 4662** (An operation was performed on an object) if auditing is enabled on the specific WMI namespace.

