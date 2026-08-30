---
title: Hide Window
draft: true
tags:
  - T1055
  - T1562
  - T1059
---

> [!abstract] Windows Process & Window Manipulation (Stealth & Injection Prep)
> A comprehensive guide to controlling windows and process creation using the Windows API. This covers manipulating existing windows (`FindWindow`/`ShowWindow`) and creating new processes in various stealthy states (Hidden, No Console, Suspended) for malware development, defense evasion, and process injection.
> **MITRE ATT&CK Mapping:** [T1562 - Impair Defenses](https://attack.mitre.org/techniques/T1562/) | [T1055 - Process Injection](https://attack.mitre.org/techniques/T1055/) | [T1059 - Command and Scripting Interpreter](https://attack.mitre.org/techniques/T1059/)

## 1. Manipulating Existing Windows (`FindWindow` & `ShowWindow`)

> [!info] How `FindWindowA` Works
> The `FindWindowA` function takes two parameters: `lpClassName` and `lpWindowName`. The behavior changes based on what you provide:
> 
> ```mermaid
> flowchart LR
>     A[FindWindowA] --> B{lpClassName provided?}
>     B -- Yes --> C{lpWindowName provided?}
>     C -- Yes --> D[Match BOTH Class AND Title<br>e.g., Only Notepad with a specific title]
>     C -- NULL --> E[Match ANY window with that Class<br>e.g., Any open Notepad window]
>     B -- NULL --> F{lpWindowName provided?}
>     F -- Yes --> G[Match ANY window with that Title<br>Search based only on Window Title]
>     F -- NULL --> H[Invalid / Returns NULL<br>No window is found]
> ```

> [!tip] Window Control Commands
> Once you find the `HWND` (Window Handle), you can change its state using various API functions:
> 
> | Action | API Function | Flag / Message | Description |
> | :--- | :--- | :--- | :--- |
> | **Hide** | `ShowWindow` | `SW_HIDE` (0) | Completely hides the window from the screen and taskbar |
> | **Show** | `ShowWindow` | `SW_SHOW` (5) | Restores and displays the window |
> | **Minimize** | `ShowWindow` | `SW_MINIMIZE` (6) | Minimizes the window to the taskbar |
> | **Close** | `PostMessage` | `WM_CLOSE` (0x0010) | Sends a close message to the window (Safer than killing the process) |

> [!example]+ C++ Code: Controlling Notepad (Find, Hide, Minimize, Close)
> ```cpp
> #include <windows.h>
> #include <stdio.h>
> 
> int main() {
>     // Search by Class Name (Finds ANY open Notepad)
>     // To check for a specific title: FindWindowA("Notepad", "Untitled - Notepad");
>     HWND hWnd = FindWindowA("Notepad", NULL);
> 
>     if (hWnd == NULL) {
>         printf("[-] Notepad window not found!\n");
>         return 1;
>     } else {
>         printf("[+] Notepad found! HWND: %p\n", hWnd);
>         
>         int action = 1; // 1=Hide, 2=Minimize, 3=Close
> 
>         if (action == 1) {
>             ShowWindow(hWnd, SW_HIDE);
>             printf("[*] Window hidden successfully.\n");
>         } 
>         else if (action == 2) {
>             ShowWindow(hWnd, SW_MINIMIZE);
>             printf("[*] Window minimized successfully.\n");
>         } 
>         else if (action == 3) {
>             PostMessageA(hWnd, WM_CLOSE, 0, 0);
>             printf("[*] Window close message sent.\n");
>         } 
>         else {
>             printf("[-] Invalid action.\n");
>         }
>     }
>     return 0;
> }
> ```

---

## 2. Hiding Process Windows at Creation (`CreateProcess`)

Instead of finding a window *after* it becomes visible, you can launch a process and tell it to start in a hidden state immediately. This avoids the brief "flash" of a window on the screen.

> [!warning] Technique A: Hiding GUI Applications (`STARTUPINFO` + `SW_HIDE`)
> You instruct the Windows Loader to start the process with the `SW_HIDE` flag from the very beginning. The window is created in memory but never displayed.
> 
> ```cpp
> #include <windows.h>
> #include <stdio.h>
> 
> int main() {
>     STARTUPINFOA si = { sizeof(si) };
>     PROCESS_INFORMATION pi = { 0 };
> 
>     // Configure startup flags to hide the window
>     si.dwFlags = STARTF_USESHOWWINDOW; 
>     si.wShowWindow = SW_HIDE;          
> 
>     if (CreateProcessA(
>             "C:\\Windows\\System32\\notepad.exe", 
>             NULL, NULL, NULL, FALSE, 0, NULL, NULL, &si, &pi)) 
>     {
>         printf("Process created successfully (Hidden).\n");
>         printf("Process ID: %lu\n", pi.dwProcessId);
>         CloseHandle(pi.hProcess);
>         CloseHandle(pi.hThread);
>     } 
>     else {
>         printf("Process not created. ERROR: %lu\n", GetLastError());
>     }
>     return 0;
> }
> ```

> [!bug] Technique B: No Console Window (`CREATE_NO_WINDOW`)
> When executing console applications (like `cmd.exe`), a black window usually flashes. By passing `CREATE_NO_WINDOW`, the system **never creates a console window at all**. This is cleaner and stealthier for console apps.
> 
> ```cpp
> #include <windows.h>
> #include <stdio.h>
> 
> int main() {
>     STARTUPINFOA si = { sizeof(si) };
>     PROCESS_INFORMATION pi = { 0 };
> 
>     if (CreateProcessA(
>             "C:\\Windows\\System32\\cmd.exe", 
>             NULL, NULL, NULL, FALSE, 
>             CREATE_NO_WINDOW, // Creation flag: NO WINDOW
>             NULL, NULL, &si, &pi)) 
>     {
>         printf("[+] cmd.exe created successfully without a window!\n");
>         printf("[+] Process ID: %lu\n", pi.dwProcessId);
>         CloseHandle(pi.hProcess);
>         CloseHandle(pi.hThread);
>     }
>     else {
>         printf("[-] Failed to create process. Error: %lu\n", GetLastError());
>     }
>     return 0;
> }
> ```

---

## 3. Process Creation in Suspended Mode (`CREATE_SUSPENDED`)

> [!danger] The Foundation of Process Injection
> By passing the `CREATE_SUSPENDED` flag, you instruct the Windows Loader to create the process, allocate its memory, and initialize its main thread — **but pause it before it executes a single instruction**. This is the foundational step for Process Hollowing and DLL Injection.
> 
> **The Attack Flow:**
> 1. Create a suspended process (e.g., a legitimate `notepad.exe`).
> 2. Hollow out its memory (remove `notepad`'s code).
> 3. Inject malicious shellcode into that memory using `WriteProcessMemory`.
> 4. Call `ResumeThread` to wake the thread up and execute the malicious code.

> [!example]+ C++ Code: Launching Notepad in a Suspended State
> ```cpp
> #include <windows.h>
> #include <stdio.h>
> 
> int main() {
>     STARTUPINFOA si = { sizeof(si) };
>     PROCESS_INFORMATION pi = { 0 };
> 
>     if (CreateProcessA(
>             "C:\\Windows\\System32\\notepad.exe", 
>             NULL, NULL, NULL, FALSE, 
>             CREATE_SUSPENDED, // Creation flag: SUSPENDED!
>             NULL, NULL, &si, &pi)) 
>     {
>         printf("[+] Process created successfully in suspended mode!\n");
>         printf("[+] Process ID: %lu\n", pi.dwProcessId);
>         printf("[+] Thread ID: %lu\n", pi.dwThreadId);
> 
>         // At this point, the process is alive but paused.
>         // An attacker would inject shellcode here.
>         
>         // To actually start the process, you would call:
>         // ResumeThread(pi.hThread);
> 
>         CloseHandle(pi.hProcess);
>         CloseHandle(pi.hThread);
>     }
>     else {
>         printf("[-] Failed to create process. Error: %lu\n", GetLastError());
>     }
>     return 0;
> }
> ```

---

## 4. Compilation

> [!tip]+ Compiling the Code
> To compile any of the above C++ examples on Windows:
> 
> **MinGW (GCC/G++):**
> ```bash
> # For FindWindow/ShowWindow (requires user32):
> x86_64-w64-mingw32-g++ hide_window.cpp -o hide_window.exe -luser32
> 
> # For CreateProcess variations (kernel32 is linked by default):
> x86_64-w64-mingw32-g++ process_stealth.cpp -o process_stealth.exe
> ```
> 
> **MSVC (cl.exe):**
> ```batch
> :: For FindWindow/ShowWindow:
> cl /EHsc hide_window.cpp /Fe:hide_window.exe /link user32.lib
> 
> :: For CreateProcess variations:
> cl /EHsc process_stealth.cpp /Fe:process_stealth.exe
> ```

