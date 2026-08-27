## 🪟 Retrieving Windows Version via `RtlGetVersion`

> [!info]+ Direct OS Version Query (ntdll)
> This example dynamically resolves and calls `RtlGetVersion` from **ntdll.dll**  
> to retrieve accurate Windows version information.
>
> ```cpp
> #include <windows.h>
> #include <iostream>
> 
> typedef NTSTATUS (NTAPI* zxRtlGetVersion)(PRTL_OSVERSIONINFOW);
> 
> int main() {
>     
>     OSVERSIONINFOEXW osv;
>     ZeroMemory(&osv, sizeof(osv));
>     osv.dwOSVersionInfoSize = sizeof(OSVERSIONINFOEXW);
>     
>     // Get handle to ntdll.dll
>     const HMODULE ntdll = GetModuleHandleW(L"ntdll.dll");
>     if (!ntdll) {
>         return 1;
>     }
>     
>     // Resolve RtlGetVersion dynamically
>     const auto ZxRtlGetVersion =
>         reinterpret_cast<zxRtlGetVersion>(
>             GetProcAddress(ntdll, "RtlGetVersion")
>         );
>     
>     if (!ZxRtlGetVersion) {
>         return 2;
>     }
>     
>     // Call the function
>     ZxRtlGetVersion(reinterpret_cast<PRTL_OSVERSIONINFOW>(&osv));
>     
>     // Print: Major.Minor.Build
>     std::cout << osv.dwMajorVersion << "."
>               << osv.dwMinorVersion << "."
>               << osv.dwBuildNumber  << "\n";
>     
>     return 0;
> }
> ```

---

### 🔎 Explanation

- **`RtlGetVersion`** → Native API from `ntdll.dll` that returns the real Windows version  
- **Dynamic resolution** → Avoids static linking; resolves function at runtime  
- **`OSVERSIONINFOEXW`** → Structure that holds version details  
- **Output format** → `Major.Minor.Build` (e.g., `10.0.22621`)  

> ⚠️ Unlike `GetVersionEx`, `RtlGetVersion` is not affected by application manifest version lying.

### 🧠 Pointer Arithmetic – `KUSER_SHARED_DATA`

![[Pasted image 20260226023913.png]]

> [!info]+ Reading Windows Version via `KUSER_SHARED_DATA`
> This example reads version information directly from the  
> **KUSER_SHARED_DATA** structure mapped at a fixed virtual address.
>
> ```cpp
> #include <windows.h>
> #include <iostream>
> #include <cstdint>
> 
> int main() {
>     constexpr uintptr_t kuserBase   = 0x7FFE0000;
>     constexpr size_t offsetBuild    = 0x260;
>     constexpr size_t offsetMajor    = 0x26C;
>     constexpr size_t offsetMinor    = 0x270;
>     
>     volatile uint32_t* build =
>         reinterpret_cast<volatile uint32_t*>(kuserBase + offsetBuild);
> 
>     volatile uint32_t* major =
>         reinterpret_cast<volatile uint32_t*>(kuserBase + offsetMajor);
> 
>     volatile uint32_t* minor =
>         reinterpret_cast<volatile uint32_t*>(kuserBase + offsetMinor);
>     
>     std::cout << "Windows version (via addresses): "
>               << *major << "."
>               << *minor << "."
>               << *build << "\n";
>               
>     return 0;
> }
> ```

---

### 🔎 Explanation

- **`0x7FFE0000`** → Base address of `KUSER_SHARED_DATA` (mapped into every user-mode process)  
- **Pointer arithmetic** → Adds known offsets to access specific fields  
- **Offsets used**:
>   - `0x26C` → Major version  
>   - `0x270` → Minor version  
>   - `0x260` → Build number  
- **`volatile`** → Prevents compiler optimization, ensures direct memory read  
- Reads version information **without calling any API**

> ⚠️ This method accesses memory directly and relies on stable structure offsets.