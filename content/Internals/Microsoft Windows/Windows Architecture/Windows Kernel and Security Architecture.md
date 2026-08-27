---
title: Windows Architectures
draft:
tags:
  - winternl
  - Ring
related:
---
## 🧠 CPU Privilege Rings Overview (Ring -3 → Ring 3)

Modern x86/x64 and Windows architectures implement multiple **privilege rings** to separate responsibilities and secure system resources.  
Here is a detailed breakdown:

> [!info]+ All CPU / Windows Rings
> ![[Pasted image 20260218113019.png]]
> 
> ### 🔻 Ring -3 (Host Hypervisor / Firmware)
> - Privilege level **higher than Ring -2 and -1**  
> - Used by **host firmware, management engines, or root-level hypervisors**  
> - Controls system-wide initialization, virtualization extensions, and early platform security  
> - Can enforce security policies before OS even loads  
>
>> [!success]- Features & Security
>> - **Runs at Ring -3**, the highest privilege  
>> - Used by:
>>   - System firmware (UEFI / BIOS)  
>>   - Management engines (Intel ME, AMD PSP)  
>>   - Host-level hypervisors controlling CPU virtualization features  
>>
>> - **Capabilities**:
>>   - Full control over system initialization and virtualization extensions  
>>   - Can enforce security policies **before OS loads**  
>>   - Protects all lower VTLs (2, 1, 0) from compromise at boot-time  
>>
>> - **Security significance**:
>>   - Can prevent firmware or boot-level malware from affecting OS integrity  
>>   - Foundation for secure boot, TPM attestation, and hardware-based protections  
> ---
>
> ### 🔻 Ring -2 (Hypervisor / VTL 2)
> - Runs **system-level hypervisors** or **nested virtualization managers**  
> - Provides isolation for guest operating systems and can protect Ring -1/0 components from tampering  
> - Used in advanced virtualization scenarios like **Hyper-V nested VMs**  
> 
>> [!success]- Features & Security
>> - **Runs at Ring -2**, typically for advanced virtualization setups  
>> - Provides an additional layer **above VTL 1**, mainly for nested VMs or hypervisor management  
>> - Can protect:
>>   - Ring -1 hypervisor instance  
>>   - Critical host VM components  
>> - Rarely used in typical Windows deployments  
>
> ---
>
> ### 🔻 Ring -1 (Hypervisor / VTL 1)
> - Executes standard hypervisors and **Virtualization-Based Security (VBS)** components  
> - Can isolate kernel and OS components from each other  
>
>> [!success]- Features & Security
>> - **Runs at Ring -1** above kernel mode  
>> - Provides isolation from malicious or buggy kernel-mode drivers  
>> - **Key features**:
>>   - **Device Guard / HVCI** → Enforces kernel and driver code integrity  
>>   - **Hyper Guard** → Protects critical kernel and hypervisor data structures  
>>   - **Credential Guard** → Secures domain credentials, secrets, and LSASS memory  
>>   - **Application Guard** → Sandboxes Microsoft Edge / browser execution  
>>   - **Host Guardian / Shielded Fabric** → Protects VMs using vTPM, secrets, and attestation  
>>
>> - **Benefits**:
>>   - Kernel-mode exploits **cannot compromise VTL 1 protections**  
>>   - Provides **strong code signing enforcement**, even for signed or unsigned drivers  
>>   - Protects secrets and credentials against malware and compromised kernel components  
>
>
> ---
>
> ### 🔻 Ring 0 (Kernel Mode / VTL 0)
> - Full system access; executes **OS kernel and trusted drivers**  
> - Can read/write all memory, execute privileged CPU instructions  
> 
>> [!success]- Features & Security
>>  - **Full system access**: Executes OS kernel (`ntoskrnl.exe`) and trusted drivers  
>>  - **Memory access**: Can read/write all system memory  
>>  - **Kernel protections enforced**:
>>   - **Memory Access Control** → system pages tagged Ring 0 only  
>>   - **Data Execution Prevention (DEP)** → stack/heap/data non-executable  
>>   - **KMCS** → Kernel Mode Code Signing required  
>>   - **EV + Attestation** → Strong certificate enforcement for drivers  
>>   - **WHQL Certification** → Compatibility & stability assurance  
>> - **Limitations**: Cannot bypass protections enforced by **VTL 1 / Hypervisor**
>
> ---
>
> ### 🔻 Ring 1 & Ring 2 (Historical / Rarely Used)
> - Initially intended for **intermediate privilege levels**, for OS subsystems or device drivers  
> - Modern Windows **does not use these rings**  
> - Rings 1 & 2 are effectively skipped  
>
> ---
>
> ### 🔻 Ring 3 (User Mode)
> - Least privileged level  
> - Runs **user applications and software**  
> - Cannot directly access system memory or execute privileged instructions  
> - Must call system APIs / make system calls to transition to **Ring 0** for kernel services  
>
> ---
>
>> [!summary]+ 📝Summary 
>>
>> | VTL   | Ring | Key Security Features |
>> |-------|------|----------------------|
>> | VTL 0 | 0    | Kernel protections, DEP, KMCS, WHQL, EV/Attestation |
>> | VTL 1 | -1   | Hypervisor isolation, HVCI, Hyper Guard, Credential Guard, App Guard, Shielded VMs |
>> | VTL 2 | -2   | Nested hypervisor protection, isolates Ring -1 |
>> | VTL 3 | -3   | Host firmware / ME protection, secure boot, early platform security |
>
>> [!danger]+  Note
>>  Rings 1 & 2 are skipped by Windows, so no VTLs are assigned there.
>
> > **Takeaway:**  
> > Each VTL enforces a **layered security model**, where higher levels isolate and protect lower levels. Kernel-mode code (VTL 0) is powerful but still constrained by VTL 1 protections (Hypervisor / VBS). This layered approach prevents advanced malware and driver exploits from compromising system integrity.
