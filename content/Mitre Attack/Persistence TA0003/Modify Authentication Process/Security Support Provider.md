---
title: Security Support Provider
draft:
tags:
  - T1003
  - T1101
---

> [!abstract] Persistence via Security Support Provider (SSP)
> The **Security Support Provider (SSP)** is a Windows architecture framework that implements authentication protocols like NTLM and Kerberos. Attackers can inject a malicious SSP DLL (like Mimikatz's `mimilib.dll` or `memssp`) into the Local Security Authority (LSA) to intercept authentication requests and capture credentials in **cleartext** directly from memory, establishing a stealthy persistence mechanism.
> **MITRE ATT&CK Mapping:** [T1101 - Security Support Provider](https://attack.mitre.org/techniques/T1101/) | [T1003 - OS Credential Dumping](https://attack.mitre.org/techniques/T1003/)

## Windows Authentication & SSP Architecture

> [!info] How SSP Works
> When a user logs in, the credentials pass through the `Winlogon` process to the LSA (Local Security Authority) in Kernel mode. The LSA passes these credentials to the loaded SSPs (like `MSV1_0` for NTLM or `Kerberos`) for validation. 
> 
> If an attacker injects a malicious SSP, it sits alongside the legitimate ones. Every time a user authenticates, the malicious SSP intercepts the credentials *before* they are hashed, writing the plaintext password to a log file.

```mermaid
flowchart LR
    %% User Interaction
    User["👤 User"] --> UI["LogonUI.exe<br>(Credential UI)"]

    subgraph UserMode ["User Mode"]
        UI --> Winlogon["Winlogon.exe<br>(Interactive Logon Process)"]
        Winlogon --> |"Sends Credentials via ALPC"| LSASS["LSASS.exe<br>(Local Security Authority Subsystem Service)"]
        
        subgraph SSP_Layer ["Security Support Providers (SSPs)"]
            direction TB
            MSV["MSV1_0.dll<br>(NTLM Authentication)"]
            Kerb["Kerberos.dll<br>(Kerberos Authentication)"]
            Schannel["Schannel.dll<br>(TLS/SSL)"]
            Wdigest["Wdigest.dll<br>(Digest)"]
        end
        
        LSASS --> SSP_Layer
    end

    subgraph KernelMode ["Kernel Mode"]
        KsecDD["KsecDD.sys<br>(Kernel Security Device Driver)"]
        SRM["Security Reference Monitor (SRM)<br>(Access Token Creation)"]
        KsecDD <--> SRM
    end

    subgraph Backends ["Authentication Backends"]
        direction TB
        SAM["SAM Database<br>(Local Accounts)"]
        Netlogon["Netlogon Service<br>(Pass-through Auth to DC)"]
        KDC["KDC (Key Distribution Center)<br>(Domain Controller)"]
        LSA["LSA Secrets / Policy"]
    end

    %% SSP to Backend Connections
    MSV --> |"Local Auth"| SAM
    MSV --> |"Domain Auth"| Netlogon
    Netlogon <--> |"RPC"| KDC
    Kerb --> |"Network Auth"| KDC
    LSASS <--> LSA

    %% LSASS to Kernel Connection
    LSASS <--> |"Kernel Calls"| KsecDD

    %% Styling
    classDef user fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef kernel fill:#ffe6e6,stroke:#cc0000,stroke-width:2px
    classDef backend fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef ssp fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    classDef lsass fill:#ccddff,stroke:#01579b,stroke-width:2px

    class UI,Winlogon user;
    class MSV,Kerb,Schannel,Wdigest ssp;
    class LSASS lsass;
    class KsecDD,SRM kernel;
    class SAM,Netlogon,KDC,LSA backend;
```
## Execution: Injecting `memssp`

> [!warning] Prerequisites
> This technique requires **Administrator privileges** (specifically `SeDebugPrivilege`).

> [!danger]+ Mimikatz SSP Injection
> Mimikatz can inject its SSP directly into memory (which is lost on reboot) or write it to the registry (persistence across reboots). The `misc::memssp` command patches the LSASS memory and registers the malicious SSP under the name "kiwi".
> 
> ```cmd
> # 1. Enable debug privileges
> mimikatz # privilege::debug
> 
> # 2. Inject memssp into LSASS memory and registry
> mimikatz # misc::memssp
> 
> # 3. Lock the workstation to force a new authentication attempt
> CMD > rundll32 user32.dll,LockWorkstation
> ```
> 
> **Credential Harvesting:**
> Once the user unlocks the workstation and types their password, the malicious SSP captures it in cleartext.
> 
> **Log File Location:**
> The cleartext credentials are saved to:
> `C:\Windows\System32\mimilsa.log`

> [!tip] OPSEC & Persistence Notes
> 1. **Persistence:** While `misc::memssp` patches memory, Mimikatz also drops the `mimilib.dll` reference into the registry (`HKLM\SYSTEM\CurrentControlSet\Control\Lsa\Security Packages`), ensuring it reloads on reboot.
> 2. **File Artifacts:** The presence of `mimilsa.log` in `System32` is a massive red flag for defenders. Attackers often delete this file after reading the credentials or modify `mimilib.dll` to change the log filename.
> 3. **Detection:** Defenders monitor for unauthorized DLLs loaded into `lsass.exe` and monitor the `Lsa\Security Packages` registry key for non-standard entries (like `mimilib` or `kiwi`).

