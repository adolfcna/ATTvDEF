
> [!danger]+ 🧩 Simple Shared Library (`.so`) with Constructor and Exported Function (C++)
> Example of a Linux shared library that prints a message when loaded/unloaded and exposes an exported function:
> ```cpp
> #include <stdio.h>
> 
> // Constructor: called automatically when the library is loaded
> __attribute__((constructor)) void on_load() {
>     printf("Shared Library Loaded!\n");
> }
> 
> // Destructor: called automatically when the library is unloaded
> __attribute__((destructor)) void on_unload() {
>     printf("Shared Library Unloaded!\n");
> }
> 
> // --------- Exported Function ---------
> extern "C" {
> 
> void RunMe() {
>     printf("Exported function called! Hello from .so\n");
> }
> }
> ```
> Notes:
> - `__attribute__((constructor))` → equivalent to `DLL_PROCESS_ATTACH`, runs automatically on load
> - `__attribute__((destructor))` → equivalent to `DLL_PROCESS_DETACH`, runs automatically on unload
> - In Linux, functions are exported by default, but `extern "C"` is still used to prevent C++ name mangling so the function can be called by name.
> - `-fPIC` (Position Independent Code) is required for shared libraries in Linux).
> - 
>>[!hint]- 🛠 GCC Compiler Dynamic Link Library
>> To build a Shared Library (`.so`) on Linux using GCC:
>> ```bash
>> # Compile to object file first (with Position Independent Code)
>> g++ -c -fPIC implant.cpp -o implant.o
>> 
>> # Link into a Shared Library
>> g++ -shared -o libimplant.so implant.o
>> ```
>> Or in a single step:
>> ```bash
>> g++ -fPIC -shared -o libimplant.so implant.cpp
>> ```
>> Explanation:
>> - `-fPIC` → generates Position Independent Code (required for shared libraries)
>> - `-shared` → tells the linker to create a shared library
>> - `-o libimplant.so` → output shared library name (conventionally prefixed with `lib`)

> [!todo]- 🧩 Load Library in Program (C)
> Example of loading a shared library dynamically in C using `dlopen` and calling its exported function:
> ```c
> #include <stdio.h>
> #include <stdlib.h>
> #include <dlfcn.h>
> 
> // Define the function pointer type
> typedef void (*RunMe_t)(void);
> 
> int main()
> {
>     // Load the shared library
>     void *handle = dlopen("./libimplant.so", RTLD_LAZY);
>     if (!handle)
>     {
>         fprintf(stderr, "Failed to load library: %s\n", dlerror());
>         return 1;
>     }
>     
>     // Clear any existing errors
>     dlerror(); 
>     
>     // Get the address of the exported function
>     RunMe_t RunMe = (RunMe_t)dlsym(handle, "RunMe");
>     char *error = dlerror();
>     if (error != NULL)
>     {
>         fprintf(stderr, "Failed to find RunMe: %s\n", error);
>         dlclose(handle);
>         return 1;
>     }
>     
>     // Call the function
>     RunMe();
>     
>     // Free the library
>     dlclose(handle);
>     return 0;
> }
> ```
> Notes:
> - `dlopen("./libimplant.so", RTLD_LAZY)` → loads the library at runtime (equivalent to `LoadLibraryA`)
> - `dlsym(handle, "RunMe")` → retrieves the address of the function (equivalent to `GetProcAddress`)
> - `dlclose(handle)` → unloads the library (equivalent to `FreeLibrary`)
> - You must compile this loader with `-ldl` flag: `gcc loader.c -o loader -ldl`

> [!quote]+  Optional: Use `LD_PRELOAD` (Alternative to rundll32)
> While Linux doesn't have a direct `rundll32` equivalent to call a specific function from CLI easily, you can use the `LD_PRELOAD` trick to force a standard binary (like `ls` or `id`) to load your library, which will trigger its `constructor`:
> ```bash
> LD_PRELOAD=./libimplant.so ls
> ```
> Notes:
> - `LD_PRELOAD=./libimplant.so` → forces the OS to load your library into the memory space of the next executed command (`ls`).
> - This will trigger the `on_load()` constructor and print "Shared Library Loaded!" before `ls` runs.
> - Useful for quick testing or hooking legitimate binaries (Living Off The Land).

