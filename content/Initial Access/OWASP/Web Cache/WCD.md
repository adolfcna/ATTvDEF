---
title: Web Cache Deception
draft:
tags:
---

> [!abstract]
> 
> ## Web Cache Deception
> 
> **Web Cache Deception (WCD)** is a web vulnerability that occurs when a cache server is tricked into storing a response that should not be publicly cached, such as a response containing **sensitive or user-specific information**.
> 
> The vulnerability typically occurs when the **application and the cache server interpret the requested URL differently**. While the application may treat a path as a dynamic or private resource, the cache may mistakenly consider it a static resource and store its response.
> 
> A typical attack flow is:
> 
> ```mermaid
> flowchart LR
>     A[Attacker] --> B[Crafted URL]
>     B --> C[Web Application]
>     C --> D[Private Response]
>     D --> E[Cache Server]
>     E --> F[Cached Sensitive Response]
>     G[Attacker] --> E
>     E --> H[Retrieve Cached Response]
> ```
> 
> If the victim accesses the maliciously crafted URL while authenticated, their sensitive response may become cached. The attacker can then request the same URL and potentially retrieve the cached private data.
> 
> **Web Cache Deception is therefore primarily caused by a mismatch between the caching rules and the application's URL/resource handling.**

![[Pasted image 20260819123221.png]]

