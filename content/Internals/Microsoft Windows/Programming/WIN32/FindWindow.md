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
