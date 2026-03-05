A **thread** is the smallest unit of execution that Windows schedules.  
No thread, no execution. A process without a thread is just a very expensive paperweight.

A process can contain multiple threads, and each one runs independently.

## What a Thread Actually Contains


![[Pasted image 20260222205052.png]]

### 1. Thread Context

Each thread has its own set of CPU register values.  
These registers store things like:

- Instruction pointer (where execution is happening)
- Stack pointer
- General-purpose registers
- Flags

Together, this data is called the **thread’s context**.

When Windows switches from one thread to another, it saves the current thread’s context and restores the next one’s. That’s a **context switch**.
The structure holding this data is architecture-specific (x86, x64, ARM, etc.).
Windows exposes this through:
`GetThreadContext()` → returns a **CONTEXT** structure.

---

### 2. Two Stacks (Because One Is Never Enough)

Each thread has:
- A **user-mode stack**
- A **kernel-mode stack**

#### User-mode stack

Used when the thread runs normal application code.
#### Kernel-mode stack

Used when the thread enters the kernel (system calls, interrupts, drivers).
The CPU stack pointer register always points to the active stack.
Separate stacks prevent user-mode corruption from directly smashing kernel execution. Windows learned that lesson the hard way.

---
### 3. Thread-Local Storage (TLS)

TLS is private memory owned by each thread.

Used by:
- Runtime libraries  
- DLLs  
- Subsystems  

If multiple threads run inside one process, TLS ensures each thread gets its own private copy of certain data instead of sharing it.

Without TLS, multithreading would be a race-condition festival.

---

> [!warning]- TLS Example
> ```cpp
> #include <windows.h>
> #include <cstdio>
> #include <thread>
> 
> __declspec(thread) int val; // TLS variable
> 
> void TLSThreadFunc() {
>     printf("\nValue inside thread : 0x%x\n", val);
>     val = 0x29a;
>     printf("Value changed inside thread : 0x%x\n", val);
> }
> 
> int main() {
>     val = 0xdeadbeef;
>     printf("Value before thread : 0x%x\n", val);
>     
>     std::thread t1(&TLSThreadFunc);
>     t1.join();
>     
>     printf("\nValue after thread : 0x%x\n", val);
>     printf("\n--> Press enter to continue...\n");
>     getchar();
>     
>     return 0;
> }
> ```
---

### 4. Thread ID (TID)

Every thread has a unique identifier called a **Thread ID (TID)**.
Important detail:
- Process IDs (PIDs) and Thread IDs come from the same namespace.
- They never overlap.
Internally, both are part of a structure called the **Client ID**.
So if you see an ID, Windows knows whether it refers to a process or thread based on context.

---

### 5. Optional: A Security Token

Sometimes a thread has its own security token.
This is common in:
- Multithreaded servers
- Applications that impersonate clients

Example:  
A web server thread impersonates the user making a request so file access checks apply to that user.

That way:
- The process may run as SYSTEM
- But the thread temporarily acts as a lower-privileged user

Very useful. Also very dangerous if mishandled.

---

# Thread Context (What That Actually Means)

The thread’s **context** includes:

- Volatile registers (temporary use)    
- Non-volatile registers (preserved across calls)
- Stack pointer
- Instruction pointer
- Architecture-specific state

Because CPU architectures differ, this structure is architecture-specific.
That’s why `CONTEXT` looks different on:

- x86
- x64
- ARM64
### Thread Context Hijack

> [!danger]- Thread Context Hijack Example
> ```cpp
> #include <windows.h>
> #include <iostream>
> 
> void MyJob() {
>     for (int i = 0;; i++) {
>         std::cout << i << "\n";
>         Sleep(500);
>     }
> }
> 
> void BadFunction() {
>     MessageBoxA(nullptr, "HIJACKED", "OK", 0);
>     ExitThread(0);
> }
> 
> int main() {
> 
>     HANDLE Ht1 = CreateThread(
>         nullptr,
>         0,
>         (LPTHREAD_START_ROUTINE)MyJob,
>         nullptr,
>         0,
>         nullptr
>     );
> 
>     Sleep(5000);
> 
>     SuspendThread(Ht1);
> 
>     CONTEXT ctx{};
>     ctx.ContextFlags = CONTEXT_CONTROL;
>     GetThreadContext(Ht1, &ctx);
> 
>     ctx.Rip = (DWORD_PTR)&BadFunction;
>     SetThreadContext(Ht1, &ctx);
> 
>     ResumeThread(Ht1);
> 
>     WaitForSingleObject(Ht1, INFINITE);
> 
>     std::cout << "Program finished\n";
>     return 0;
> }
> ```
---

# Quick Mental Model

Think of a thread as:

- A CPU state snapshot (Thread Context)
- Two stacks
- Private storage (TLS)
- A unique ID
- Possibly its own security identity(Token)

And Windows constantly pauses, saves, restores, and rotates these like plates in a circus act.A **thread** is the smallest unit of execution that Windows schedules.  
No thread, no execution. A process without a thread is just a very expensive paperweight.
A process can contain multiple threads, and each one runs independently.

<img src="../../../Asset/Pasted image 20260222205218.png"   style="max-width:100%; height:auto;"/>