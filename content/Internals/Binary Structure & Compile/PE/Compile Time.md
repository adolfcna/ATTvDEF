---
title: Compile Time
draft: false
tags:
  - CompileTime
---

> [!abstract] C Compilation Process & Intermediate Files
> When a C program is compiled using GCC or CL the process goes through several distinct stages before producing the final executable. Using the `-save-temps` flag (`gcc -save-temps file.c`) retains all intermediate files, allowing reverse engineers and developers to inspect how the code transforms at each step.
> **MITRE ATT&CK Mapping:** [T1027 - Obfuscated Files or Information](https://attack.mitre.org/techniques/T1027/) (Relevant to malware analysis and understanding binary obfuscation).

```mermaid
flowchart TD
    A["<b>Source Code</b><br>file.c<br><i>(C/C++ Source)</i>"] --> B
    
    B["<b>1. Preprocessor</b><br>file.i<br><i>(Expanded C Code: Macros & Headers)</i><br>━━━━━━━━━━━━━━<br>MinGW: gcc -E main.c -o main.i<br>MSVC: cl /P main.c"] --> C
    
    C["<b>2. Compiler</b><br>file.s / file.asm<br><i>(Assembly Code: mov, push, call)</i><br>━━━━━━━━━━━━━━<br>MinGW: gcc -S main.c<br>MSVC: cl /Fa main.c"] --> D
    
    D["<b>3. Assembler</b><br>file.o / file.obj<br><i>(Object Code: Binary, Relocatable)</i><br>━━━━━━━━━━━━━━<br>MinGW: gcc -c main.c<br>MSVC: cl /c main.c"] --> E
    
    E["<b>4. Linker</b><br>file.exe<br><i>(Executable: Linked with Libraries)</i><br>━━━━━━━━━━━━━━<br>MinGW: gcc main.c -o main.exe<br>MSVC: cl main.c /Fe:main.exe"]
    
    style A fill:#ffcc66,stroke:#333,stroke-width:2px
    style B fill:#ccffcc,stroke:#333,stroke-width:2px
    style C fill:#ccddff,stroke:#333,stroke-width:2px
    style D fill:#ffcccc,stroke:#333,stroke-width:2px
    style E fill:#d4d4d4,stroke:#333,stroke-width:2px
```


> [!hint]+ 💻 Windows / MinGW Build Commands
> Various compile commands for Windows executables and DLLs, optimized for different scenarios.
>
> ### Windows Build (cl.exe)
> ```batch
> @ECHO OFF
> cl.exe /nologo /Ox /MT /W0 /GS- /DNDEBUG /Tcimplant.cpp /link /OUT:implant.exe /SUBSYSTEM:CONSOLE /MACHINE:x64
> ```
> **Explanation:**
> - `/Ox` – Optimize for speed  
> - `/MT` – Link with static runtime  
> - `/GS-` – Disable buffer security checks  
> - `/DNDEBUG` – Disable debug macros  
> - `/SUBSYSTEM:CONSOLE` – Console application  
> - `/MACHINE:x64` – Target 64-bit  
>
> ### Windows Build (cl.exe) Dynamic Link Library
> ```batch
> cl.exe /D_USRDLL /D_WINDLL implant.cpp /MT /link /DLL /OUT:implant.dll
> ```
>
> ### MinGW Compiler With Console
> ```bash
> x86_64-w64-mingw32-g++ implant.cpp -O3 -static -w -fno-stack-protector -fno-exceptions -fno-rtti  -DNDEBUG  -s -o tcimplant.exe
> ```
>
> ### MinGW Compiler Without Console
> ```bash
> x86_64-w64-mingw32-g++ implant.cpp -O3 -static -w -fno-stack-protector -fno-exceptions -fno-rtti -DNDEBUG -mwindows -s -o tcimplant.exe
> ```
>
> ### MinGW Compiler For Debug
> ```bash
> x86_64-w64-mingw32-g++ implant.cpp -g -O0 -Wall -o tcimplant.exe
> ```
>
> ### MinGW Compiler Strong Security
> ```bash
> x86_64-w64-mingw32-g++ implantc.cpp -O2 -D_FORTIFY_SOURCE=2 -fstack-protector-strong -fstack-clash-protection -Wl,--dynamicbase -Wl,--nxcompat -Wl,--high-entropy-va -Wall -Wextra -o secure.exe
> ```
>
> ### MinGW Compiler Hard Reverse
> ```bash
> x86_64-w64-mingw32-g++ main.cpp -O3 -flto -fstack-protector-strong -fstack-clash-protection -fPIE -pie -s -o hard.exe
> x86_64-w64-mingw32-strip --strip-all hard.exe
> ```
>
> ### MinGW Compiler Dynamic Link Library
> ```bash
> x86_64-w64-mingw32-g++ -D_USRDLL -D_WINDLL -shared -static -o implant.dll main.cpp -lws2_32 -lwininet -ladvapi32 -Wl,--out-implib,libimplant.a
> i686-w64-mingw32-g++ -D_USRDLL -D_WINDLL -shared -static -o implant.dll main.cpp -lws2_32 -lwininet -ladvapi32 -Wl,--out-implib,libimplant.a
> ```
>
> **Notes:**
> - `-O3` – Maximum optimization  
> - `-static` – Static linking for portability  
> - `-fno-stack-protector` / `-fno-exceptions` – Reduce extra checks for testing  
> - `-mwindows` – Suppresses console window  
> - `-flto` – Link-time optimization for smaller & faster binaries  
> - `strip` – Removes debug symbols for harder reverse engineering  

