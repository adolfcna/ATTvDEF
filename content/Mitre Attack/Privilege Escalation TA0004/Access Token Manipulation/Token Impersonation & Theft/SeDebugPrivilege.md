
> [!abstract] SeDebugPrivilege Exploitation (Enabling the Privilege)
> **SeDebugPrivilege** is a highly powerful Windows user right that allows a process to debug other programs, granting it the ability to read and write the memory of critical OS components. Exploitation begins by programmatically enabling this privilege using `AdjustTokenPrivileges`.
> **MITRE ATT&CK Mapping:** [T1134 - Access Token Manipulation](https://attack.mitre.org/techniques/T1134/)

## Privilege Fundamentals & Assignment

> [!info] Capabilities & Assignment Context
> **Capabilities:**
> - Memory access to critical OS components (e.g., `lsass.exe`, `winlogon.exe`).
> - Process debugging including system-level protected processes.
> - LSASS dumping for credential extraction.
> 
> **Target Users:** Developers (for debugging), System Admins (for troubleshooting), Service Accounts.

> [!tip]+ Windows GPO Path to Enable SeDebugPrivilege
> This privilege is typically configured via Local or Domain Group Policy. The diagram below shows the exact path an administrator takes to assign this right to a user or group.
> 
>```mermaid
> flowchart LR
>    subgraph GPO ["🗺️ Group Policy Editor (gpedit.msc)"]
>     direction TB
>        A(["🖥️ Local Computer Policy"]) --> B["📁 Computer Configuration"]
>        B --> C["📁 Windows Settings"]
>        C --> D["🛡️ Security Settings"]
>        D --> E["📁 Local Policies"]
>        E --> F["👥 User Rights Assignment"]
>        F --> G["🐛 Debug programs<br>(SeDebugPrivilege)"]
>        G --> H(["➕ Add User or Group..."])
 end
 > 
> subgraph Impact ["💥 Security Impact"]
>     I["✅ Attacker can dump LSASS<br>or steal SYSTEM Tokens"]
> end
> 
> H ==> I
> 
> classDef default fill:#f4f4f4,stroke:#999,stroke-width:1px,color:#333;
> classDef target fill:#ffe6e6,stroke:#cc0000,stroke-width:3px,color:#cc0000;
> classDef action fill:#e6ffe6,stroke:#009900,stroke-width:2px,color:#009900;
> classDef impact fill:#e6f2ff,stroke:#0066cc,stroke-width:2px,color:#0066cc;
> 
> class A,B,C,D,E,F default;
> class G target;
> class H action;
> class I impact;
> ```

## C++ Code: Enabling SeDebugPrivilege

> [!example]+ Code: AdjustTokenPrivileges
> This snippet retrieves the current process token, locates the LUID for `SeDebugPrivilege`, and enables it. This is the mandatory first step before attempting to open protected processes like `lsass.exe`.
> 
> ```cpp
> #include <windows.h>
> #include <stdio.h>
> 
> BOOL EnableSeDebugPrivilege() {
>     HANDLE hToken;
>     TOKEN_PRIVILEGES tp;
>     LUID luid;
> 
>     if (!OpenProcessToken(GetCurrentProcess(), TOKEN_ADJUST_PRIVILEGES, &hToken)) return FALSE;
>     if (!LookupPrivilegeValue(NULL, SE_DEBUG_NAME, &luid)) {
>         CloseHandle(hToken);
>         return FALSE;
>     }
> 
>     tp.PrivilegeCount = 1;
>     tp.Privileges[0].Luid = luid;
>     tp.Privileges[0].Attributes = SE_PRIVILEGE_ENABLED;
> 
>     if (!AdjustTokenPrivileges(hToken, FALSE, &tp, sizeof(tp), NULL, NULL)) {
>         CloseHandle(hToken);
>         return FALSE;
>     }
> 
>     CloseHandle(hToken);
>     return TRUE;
> }
> 
> int main() {
>     
>     if (!EnableSeDebugPrivilege()) {
>         printf("[-] Failed to enable SeDebugPrivilege\n");
>         return 1;
>     }
> 
>     printf("[+] DebugPrivilege Enabled\nEnter to exit \n");
>     getchar();
>     return 0;
> }
> ```

---

## Detection & Threat Hunting

> [!warning] Windows Event Codes
> Detecting the enabling of SeDebugPrivilege relies on auditing privileged service calls.
> 
> **Event ID 4673 (A privileged service was called):**
> - **Trigger:** Generated when a process calls `AdjustTokenPrivileges` to enable `SeDebugPrivilege` (or uses it to open another process).
> - **Filter:** Look for `PrivilegeList` containing `SeDebugPrivilege`.
> - **Note:** This event is noisy and requires "Audit Privilege Use" to be enabled in the GPO, which is often disabled in default environments due to disk space concerns.

> [!success]+ Splunk SPL Query (Hunting Event 4673)
> This query hunts for processes attempting to enable or use `SeDebugPrivilege`.
> ```splunk
> index=windows sourcetype="WinEventLog:Security" EventCode=4673 
> PrivilegeList="SeDebugPrivilege"
> | stats count min(_time) as firstTime max(_time) as lastTime by Computer, Account_Name, Process_Name, Object_Server
> | rename Computer as Host, Account_Name as User, Process_Name as "Process"
> ```

> [!success]+ Elastic ELK KQL Query (Hunting Event 4673)
> This query can be pasted directly into Kibana's Discover or KQL search bar.
> ```kql
> event.code: 4673 and winlog.event_data.PrivilegeList: "SeDebugPrivilege"
> ```
> *Note: Ensure your Winlogbeat configuration is capturing Security logs and mapping `PrivilegeList`.*


