---
title: Web Cache Deception
draft: false
tags:
---
![[Pasted image 20260819123221.png]]

> [!abstract] Overview
> **Web Cache Deception (WCD)** is a vulnerability that occurs when the **application** and the **web cache** interpret the same URL differently.
> 
> The application may treat a request as a dynamic, private resource, while the cache incorrectly treats it as a static resource and stores the resulting response.
> 
> An attacker can exploit this behavior by causing a victim to request a crafted URL while authenticated. If the victim's sensitive response is cached, the attacker may then request the same URL and retrieve the cached information.

> [!info] Web Cache Fundamentals
> 
> A **web cache** stores responses so that subsequent requests can be served faster without contacting the origin server every time.
> 
> ```mermaid
> flowchart LR
>     A[Client] --> B[CDN / Cache]
>     B -->|Cache Miss| C[Origin Server]
>     C --> B
>     B --> A
> ```
> 
> If a matching response already exists:
> 
> ```mermaid
> flowchart LR
>     A[Client] --> B[CDN / Cache]
>     B -->|Cache Hit| A
> ```
> 
> A cache determines whether two requests correspond to the same stored response using a **cache key**.

> [!example] Basic Example
> Assume the victim normally accesses:
> 
> ```http
> GET /account.php
> ```
> 
> This endpoint returns the user's private account information.
> 
> The attacker creates a static-looking URL:
> 
> ```http
> GET /account.php/example.css
> ```
> 
> The application may still process this request as `account.php`, while the cache sees the `.css` extension and decides that the response is cacheable.
> 
> ```mermaid
> flowchart LR
>     A["/account.php/example.css"] --> B[Application]
>     B --> C["Private Account Response"]
>     C --> D[CDN / Cache]
>     D --> E["Cached Response"]
> ```

> [!example] Behind the Scenes: Path Mapping
> The key concept behind many Web Cache Deception vulnerabilities is **path mapping**.
> 
> The **cache** and the **application** may interpret the same URL differently.
> 
> ### Case 1 — `/profile/something.css`
> 
> Consider the following Django URL configuration:
> 
> ```python
> 
> [ ... ]
> 
> from django.contrib import admin
> from django.urls import path
> 
> urlpatterns = [
>     path('^profile/', admin.site.urls),
> ]
> ```
> 
> The important part is:
> 
> ```python
> path('^profile/', admin.site.urls),
> ```
> 
> The application is configured to handle paths beginning with:
> 
> ```text
> /profile/
> ```
> 
> Therefore, a request such as:
> 
> ```http
> GET /profile/something.css
> ```
> 
> may be mapped to the application route.
> 
> At the same time, the cache may look at the `.css` extension and interpret the URL as a static resource.
> 
> ```mermaid
> flowchart LR
>     A["/profile/something.css"] --> B[CDN / Cache]
>     A --> C[Django Application]
> 
>     B --> D["Sees .css"]
>     C --> E["Matches profile/ route"]
> 
>     D --> F["Static-looking resource"]
>     E --> G["Dynamic application response"]
> 
>     F --> H["Potentially Cacheable"]
>     G --> I["Private Response"]
> ```
> 
> ---
> 
> ### Case 2 — `/profile.css`
> 
> Now consider a slightly different URL configuration:
> 
> ```python
> """mysite URL Configuration
> 
> [ ... ]
> 
> from django.contrib import admin
> from django.urls import path
> 
> urlpatterns = [
>     path('^profile', admin.site.urls),
> ]
> ```
> 
> The important difference is:
> 
> ```python
> path('^profile', admin.site.urls),
> ```
> 
> compared with:
> 
> ```python
> path('^profile/', admin.site.urls),
> ```
> 
> In the second configuration, the route does **not require a `/` immediately after `profile`**.
> 
> Therefore, depending on the framework and routing configuration, a request such as:
> 
> ```http
> GET /profile.css
> ```
> 
> may match the `profile` route.
> 
> The cache, however, may see:
> 
> ```text
> .css
> ```
> 
> and interpret the resource as a static CSS file.
> 
> ```mermaid
> flowchart LR
>     A["/profile.css"] --> B[CDN / Cache]
>     A --> C[Django Application]
> 
>     B --> D["Sees .css"]
>     C --> E["Matches profile route"]
> 
>     D --> F["Static-looking resource"]
>     E --> G["Dynamic application response"]
> 
>     F --> H["Potentially Cacheable"]
>     G --> I["Private Response"]
> ```
> 
> ### The Important Difference
> 
> ```text
> Case 1:
> /profile/something.css
> 
>     Application
>         ↓
>     /profile/
>         ↓
>     Dynamic endpoint
> 
>     Cache
>         ↓
>     .css
>         ↓
>     Static-looking resource
> ```
> 
> ```text
> Case 2:
> /profile.css
> 
>     Application
>         ↓
>     ^profile
>         ↓
>     Dynamic endpoint
> 
>     Cache
>         ↓
>     .css
>         ↓
>     Static-looking resource
> ```
> 
> The important security concept is therefore not the specific Django syntax itself.
> 
> The important concept is that:
> 
> ```text
>          SAME URL
>             │
>       ┌─────┴─────┐
>       ↓           ↓
>     CACHE     APPLICATION
>       │           │
>       ↓           ↓
>   Static URL   Dynamic URL
>       │           │
>       └─────┬─────┘
>             ↓
>      Parser / Mapping
>       Discrepancy
>             ↓
>     Potential WCD
> ```
> 
> This is an example of a **path-mapping discrepancy** between the cache and the origin application.

---

> [!warning]
> 
> ## Application vs Cache Interpretation
> 
> The vulnerability depends on a discrepancy between the two components.
> 
> ```mermaid
> flowchart TD
>     A["/account.php/example.css"] --> B[CDN]
>     A --> C[Application]
> 
>     B --> D["Looks like static CSS"]
>     C --> E["Looks like dynamic account endpoint"]
> 
>     D --> F["Potentially Cacheable"]
>     E --> G["Private Response"]
> 
>     F --> H["Potential Web Cache Deception"]
>     G --> H
> ```
> 
> If the cache stores the private response, the attacker may later retrieve it using the same URL.

---

> [!danger]
> 
> ## Attack Scenario
> 
> A typical attack consists of:
> 
> ```mermaid
> sequenceDiagram
>     participant A as Attacker
>     participant V as Victim
>     participant C as CDN / Cache
>     participant S as Origin
> 
>     A->>V: Send crafted URL
>     V->>C: Request while authenticated
>     C->>S: Cache MISS
>     S->>C: Victim's sensitive response
>     C->>C: Store response
>     C->>V: Return response
>     A->>C: Request same URL
>     C->>A: Cache HIT
> ```
> 
> The attacker does not necessarily need direct access to the victim's private endpoint.
> 
> The attacker needs the victim to request a URL whose response can be stored in a shared cache.

---

> [!info]
> 
> ## Detection
> 
> Start by determining whether the target uses a **CDN or shared caching layer**.
> 
> Find an obvious static resource:
> 
> ```text
> /static/app.js
> /assets/style.css
> /images/logo.png
> ```
> 
> Then inspect response headers and response timing for evidence of caching:
> 
> ```http
> X-Cache: HIT
> ```
> 
> ```http
> X-Cache: MISS
> ```
> 
> The exact headers depend on the CDN and its configuration.
> 
> Response headers and response timing can both provide evidence that a response was cached.

---

> [!example]
> 
> ## Find Sensitive Endpoints
> 
> Look for APIs and dynamic endpoints that return user-specific information:
> 
> ```text
> /account
> /profile
> /api/user
> /api/auth/session
> /backend-api/...
> ```
> 
> Particularly interesting responses may contain:
> 
> - Account information
>     
> - User profile data
>     
> - Session information
>     
> - API responses containing private data
>     
> - Other authenticated-user information
>     

---

> [!warning]
> 
> ## Make the Endpoint Look Static
> 
> Try controlled URL variations that make a dynamic endpoint resemble a static resource:
> 
> ```text
> /account/example.css
> /profile/example.js
> /api/user/example.png
> ```
> 
> The goal is to determine whether the application continues to return the dynamic response while the CDN treats the URL as cacheable.
> 
> ```mermaid
> flowchart LR
>     A["Dynamic Endpoint"] --> B["Static-Looking URL"]
>     B --> C[CDN]
>     C --> D{Cacheable?}
>     D -->|Yes| E["Potential WCD"]
>     D -->|No| F["Continue Testing"]
> ```

---

> [!info]
> 
> ## Common Static Extensions
> 
> CDN providers may use extension-based rules when determining whether a response should be cached.
> 
> Common examples include:
> 
> ```text
> jpg, jpeg, png, gif, webp, bmp, ico
> css, js
> pdf
> doc, docx
> xls, xlsx
> ppt, pptx
> mp3, mp4, m4a, m4v
> ogg, ogv, webm, flv
> swf
> woff, woff2, eot, ttf, otf
> zip, tar, gz, tgz, rar
> ```
> 
> These are **examples, not universal rules**.
> 
> Cache behavior depends on:
> 
> - CDN configuration
>     
> - Cache rules
>     
> - Response headers
>     
> - Content type
>     
> - Route
>     
> - HTTP status code
>     
> - URL structure
>     

---

> [!example]
> 
> ## CDN-Specific Behavior
> 
> Different CDN providers can have different caching rules.
> 
> Provider documentation can therefore help identify:
> 
> - Default cacheable extensions
>     
> - Cache rules
>     
> - `Cache-Control` behavior
>     
> - URL normalization behavior
>     
> 
> When documentation is unavailable or incomplete, security research and technical write-ups can provide useful information about provider-specific behavior.

---

> [!warning]
> 
> ## URL Normalization and Bypasses
> 
> If a particular extension is blocked or normalized, different URL representations can be tested to identify discrepancies between the cache and origin server.
> 
> Examples:
> 
> ```text
> /account/example.css
> /account/example%2ecss
> /account/example/;test.css
> /account/example/!test.css
> /account/example/.css
> ```
> 
> The purpose of these variations is to investigate differences in:
> 
> - URL parsing
>     
> - URL normalization
>     
> - Path mapping
>     
> - Cache-key generation
>     

---

> [!danger]
> 
> ## Encoding and Parser Differences
> 
> Encoded characters and unusual path structures can expose differences between CDN and origin-server parsing.
> 
> Examples for controlled testing:
> 
> ```text
> /backend-api/conversations%0A%0D-testtest.css
> /api/auth/%0A%0D%09session.css
> ```
> 
> These payloads should be treated as **parser-differential test cases**, not guaranteed bypasses.
> 
> ```mermaid
> flowchart TD
>     A[HTTP Request] --> B[CDN Parser]
>     A --> C[Origin Parser]
> 
>     B --> D[Cache Key]
>     C --> E[Application Route]
> 
>     D --> F{Same Interpretation?}
>     E --> F
> 
>     F -->|Yes| G[Normal Behavior]
>     F -->|No| H[Potential Cache Deception]
> ```

---

> [!info]
> 
> ## Cache Buster
> 
> During testing, previously cached responses can interfere with your results.
> 
> A **cache buster** helps ensure that each test request uses a unique cache key.
> 
> Example:
> 
> ```http
> GET /account/example.css?cb=unique-value
> ```
> 
> Changing the query parameter creates a different cache key when the cache includes the query string in its key.
> 
> **Param Miner** can automate cachebuster generation during testing.

---

> [!example]
> 
> ## Param Miner
> 
> **Param Miner** is an open-source Burp Suite extension from PortSwigger that discovers hidden, unlinked parameters and is particularly useful for investigating web cache issues.
> 
> It can guess:
> 
> - Parameter names
>     
> - Header names
>     
> - Cookie names
>     
> 
> It can also add cachebusters to requests, which is useful when cached responses would otherwise interfere with testing.
> 
> ```mermaid
> flowchart LR
>     A[HTTP Request] --> B[Param Miner]
>     B --> C["Guess Headers / Cookies / Parameters"]
>     C --> D[Test Requests]
>     D --> E[Compare Responses]
>     E --> F["Identify Interesting Inputs"]
> ```
> 
> **Resources:**
> 
> - [Param Miner — GitHub](https://github.com/PortSwigger/param-miner)
>     
> - [Param Miner — Burp BApp Store](https://portswigger.net/bappstore/17d2949a985c4b7ca092728dba871943)
>     

---

> [!example]
> 
> ## Web Cache Deception Scanner
> 
> PortSwigger also maintains a Burp extension specifically designed to test applications for **Web Cache Deception**.
> 
> It can be used from Burp's Sitemap or HTTP History to test selected resources.
> 
> **Resource:**
> 
> [Web Cache Deception Scanner — GitHub](https://github.com/PortSwigger/web-cache-deception-scanner)

---

> [!abstract]
> 
> ## Detection Methodology
> 
> The complete methodology can be summarized as:
> 
> ```mermaid
> flowchart TD
>     A[Identify CDN / Cache] --> B[Find Sensitive Endpoint]
>     B --> C[Determine Cache Behavior]
>     C --> D[Test Static-Looking URLs]
>     D --> E[Test URL Normalization]
>     E --> F[Use Cache Buster]
>     F --> G[Compare HIT / MISS]
>     G --> H[Verify Cached Response]
>     H --> I[Confirm Web Cache Deception]
> ```
> 
> The core objective is to identify a discrepancy where the **application treats a response as private and dynamic, while the caching layer treats it as public and cacheable**.

---

> [!tip]
> 
> ## Further Reading
> 
> - [Web Cache Deception — PortSwigger Web Security Academy](https://portswigger.net/web-security/web-cache-deception)
>     
> - [Web Cache Deception Learning Path](https://portswigger.net/web-security/learning-paths/web-cache-deception)
>     
> - [Gotta Cache 'Em All — PortSwigger Research](https://portswigger.net/research/gotta-cache-em-all)
>     
> - [Param Miner — GitHub](https://github.com/PortSwigger/param-miner)
>     
> - [Web Cache Deception Scanner — GitHub](https://github.com/PortSwigger/web-cache-deception-scanner)
>
