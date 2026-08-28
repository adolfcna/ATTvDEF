---
title: Create Simple DLL
draft:
tags:
  - PE
---

> [!info]+ 🧩 Simple DLL with `DllMain` and Exported Function (C++)
> Example of a DLL that shows a message box when loaded and exposes an exported function:
> ```c
> #include <windows.h>
> #include <stdio.h>
> 
> #pragma comment(lib,"user32.lib")
> 
> // DLL entry point
> BOOL APIENTRY DllMain(HMODULE hModule,
>                       DWORD  ul_reason_for_call,
>                       LPVOID lpReserved)
> {
>     switch (ul_reason_for_call){
>         case DLL_PROCESS_ATTACH:
>             MessageBoxA(NULL, "DLL Loaded!", "Info", MB_OK);
>             break;
>         case DLL_PROCESS_DETACH:
>         case DLL_THREAD_ATTACH:
>         case DLL_THREAD_DETACH:
>             break;
>     }
>     return TRUE;
> }
> 
> // --------- Exported Function ---------
> extern "C" {
> 
> __declspec(dllexport) BOOL WINAPI RunMe(void){
>     MessageBoxA(NULL, "Exported function called!",
>                 "Hello from DLL", MB_OK);
>     return TRUE;
> }
> }
> ```
> Notes:
> - `DllMain` → called automatically when the DLL is loaded/unloaded or a thread is created/terminated  
> - `MessageBoxA` → shows a simple message box  
> - `__declspec(dllexport)` → marks `RunMe` as an exported function callable from other programs  
> - `extern "C"` → prevents C++ name mangling so the function can be called by name
> 
>> [!hint]- 💻 Windows Build (cl.exe) Dynamic Link Library
>> To build a DLL on Windows using Microsoft Compiler:
>> ```powershell
>> cl.exe /D_USRDLL /D_WINDLL implant.cpp /MT /link /DLL /OUT:implant.dll
>> ```
>> Explanation:
>> - `D_USRDLL` and `D_WINDLL` → marks the build as a DLL  
>> - `/MT` → statically links the runtime  
>> - `/link /DLL /OUT:implant.dll` → produces the output DLL file
>
>> [!hint]- 🛠 Mingw Compiler Dynamic Link Library
>> To build a DLL with Mingw on Windows (64-bit & 32-bit):
>> ```bash
>> # 64-bit
>>x86_64-w64-mingw32-g++ -D_USRDLL -D_WINDLL -shared -static -o implant.dll main.cpp \
>> -lws2_32 -lwininet -ladvapi32 -Wl,--out-implib,libimplant.a
>> 
>> # 32-bit
>> i686-w64-mingw32-g++ -D_USRDLL -D_WINDLL -shared -static -o implant.dll main.cpp \
>> -lws2_32 -lwininet -ladvapi32 -Wl,--out-implib,libimplant.a
>> ```
>> Explanation:
>> - `-shared -static` → builds a shared static DLL  
>> - `-o implant.dll` → output DLL name  
>> - `-lws2_32 -lwininet -ladvapi32` → required Windows libraries  
>> - `-Wl,--out-implib,libimplant.a` → generates import library for linking

> [!todo]- 🧩 Load DLL in Program (C)
> Example of loading a DLL dynamically in C and calling its exported function:
> ```c
> #include <windows.h>
> #include <stdio.h>
> 
> typedef BOOL (WINAPI *RunMe_t)(void);
> 
> int main()
> {
>     // Load the DLL
>     HMODULE hDll = LoadLibraryA("YourDll.dll");
>     if (!hDll)
>     {
>         printf("Failed to load DLL\n");
>         return 1;
>     }
>     
>     // Get the address of the exported function
>     RunMe_t RunMe = (RunMe_t)GetProcAddress(hDll, "RunMe");
>     if (!RunMe)
>     {
>         printf("Failed to find RunMe\n");
>         return 1;
>     }
>     
>     // Call the function
>     RunMe();
>     
>     // Free the DLL
>     FreeLibrary(hDll);
>     return 0;
> }
> ```
> Notes:
> - `LoadLibraryA("YourDll.dll")` → loads the DLL at runtime  
> - `GetProcAddress(hDll, "RunMe")` → retrieves the address of the function you want to call  
> - Always `FreeLibrary(hDll)` when done

> [!quote]-  Optional: Use `rundll32.exe`
> You can also invoke the DLL function directly from Windows command line:
> ```
> rundll32.exe mydll.dll,RunMe
> ```
> Notes:
> - `mydll.dll` → the DLL file  
> - `RunMe` → exported function name  
> - Quick way to test the DLL without writing a C loader




### PE32

![[pe101.svg]]

### PE64

![[pe101-64.svg]]
