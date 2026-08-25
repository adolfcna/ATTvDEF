---
title: Web Cache Poisoning
draft:
tags:
  - CWE-524
  - CWE-525
---
![[Pasted image 20260819135422.png]]

> [!abstract] Overview
> **Web Cache Poisoning** is a vulnerability in which an attacker causes a web cache to store a **malicious or attacker-influenced response**, which is then served to other users.
> 
> The vulnerability usually occurs when the **cache key does not include an input that influences the generated response**.
> 
> In other words:
> 
> ```text
> Request Input
>      │
>      ↓
> Application ──────► Response
>      │
>      │
>      └────────────► Cache
>                         │
>                         ↓
>                    Cached Response
> ```
> 
> If an attacker can modify the response using an input that the cache does **not** include in its cache key, the attacker may be able to poison the cached response.
> 
> The poisoned response can then be returned to other users who request the same cache key.

> [!info]
> 
> ## Web Cache Poisoning vs Web Cache Deception
> 
> These vulnerabilities are related, but they have different goals.
> 
> ### Web Cache Deception
> 
> The attacker attempts to make the cache store a **victim's private response**.
> 
> ```text
> Victim's Request
>       ↓
> Private Response
>       ↓
> Cache
>       ↓
> Attacker Retrieves Victim Data
> ```
> 
> ### Web Cache Poisoning
> 
> The attacker attempts to make the cache store an **attacker-influenced response**.
> 
> ```text
> Attacker's Request
>       ↓
> Malicious Response
>       ↓
> Cache
>       ↓
> Other Users Receive Poisoned Response
> ```
> 
> The fundamental distinction is:
> 
> ```text
> WCD:
>     Private response → incorrectly cached
> 
> WCP:
>     Malicious response → incorrectly cached
> ```

---

> [!info]
> 
> ## Web Cache Fundamentals
> 
> A cache stores a response and later serves that response when another request matches the same **cache key**.
> 
> A simplified flow looks like this:
> 
> ```mermaid
> flowchart LR
>     A[Client] --> B[Web Cache]
>     B -->|Cache MISS| C[Origin Server]
>     C --> B
>     B --> A
> ```
> 
> On a subsequent request:
> 
> ```mermaid
> flowchart LR
>     A[Client] --> B[Web Cache]
>     B -->|Cache HIT| C[Cached Response]
>     C --> A
> ```
> 
> The cache therefore needs a way to determine:
> 
> ```text
> "Does this request correspond to an existing cached response?"
> ```
> 
> This is the purpose of the **cache key**.

---

> [!example]
> 
> ## Cache Key
> 
> A simplified cache key might look like:
> 
> ```text
> https://example.com/index.html
> ```
> 
> A more complex cache key could include:
> 
> ```text
> Scheme
> Host
> Path
> Query String
> Selected Headers
> Cookies
> ```
> 
> For example:
> 
> ```text
> https://example.com/products?id=10
> ```
> 
> could produce a cache key such as:
> 
> ```text
> GET|example.com|/products|id=10
> ```
> 
> The exact structure depends on the caching layer.
> 
> The important concept is:
> 
> ```text
> If an input affects the response
> but
> that input is NOT included in the cache key
> then
> a cache poisoning condition may exist.
> ```

---

> [!warning]
> 
> ## Keyed vs Unkeyed Inputs
> 
> A **keyed input** contributes to the cache key.
> 
> An **unkeyed input** does not contribute to the cache key but may still influence the application's response.
> 
> Example:
> 
> ```http
> GET / HTTP/1.1
> Host: example.com
> X-Forwarded-Host: attacker.example
> ```
> 
> Imagine the application generates:
> 
> ```html
> <script src="https://attacker.example/app.js"></script>
> ```
> 
> but the cache key only contains:
> 
> ```text
> / 
> ```
> 
> The simplified flow becomes:
> 
> ```mermaid
> flowchart TD
>     A["Request /"] --> B["X-Forwarded-Host"]
>     B --> C["Application Response"]
>     C --> D["Cache"]
> 
>     D --> E["Cache Key = /"]
> ```
> 
> The header influences the response:
> 
> ```text
> X-Forwarded-Host
>        ↓
> Application
>        ↓
> Modified Response
> ```
> 
> But the header is not part of the cache key:
> 
> ```text
> Cache Key
>     ↓
> /
> ```
> 
> This creates the possibility that the modified response is stored under `/`.

---

> [!danger]
> 
> ## Basic Attack Scenario
> 
> Assume the target has:
> 
> ```http
> GET / HTTP/1.1
> Host: example.com
> ```
> 
> The attacker discovers that:
> 
> ```http
> X-Forwarded-Host
> ```
> 
> influences the generated response but is not included in the cache key.
> 
> The attacker sends:
> 
> ```http
> GET / HTTP/1.1
> Host: example.com
> X-Forwarded-Host: attacker.example
> ```
> 
> The application generates a response influenced by:
> 
> ```text
> attacker.example
> ```
> 
> The cache then stores the response under:
> 
> ```text
> /
> ```
> 
> A normal user later requests:
> 
> ```http
> GET / HTTP/1.1
> Host: example.com
> ```
> 
> and receives the cached poisoned response.
> 
> ```mermaid
> sequenceDiagram
>     participant A as Attacker
>     participant C as Cache
>     participant O as Origin
>     participant V as Victim
> 
>     A->>C: GET / + malicious input
>     C->>O: Cache MISS
>     O->>C: Attacker-influenced response
>     C->>C: Store response
>     C->>A: Response
> 
>     V->>C: GET /
>     C->>V: Cached poisoned response
> ```

---

> [!warning]
> 
> ## The Core Condition
> 
> A useful way to think about Web Cache Poisoning is:
> 
> ```text
> Unkeyed Input
>        │
>        ↓
> Influences Response
>        │
>        ↓
> Response Becomes Attacker-Controlled
>        │
>        ↓
> Cache Stores Response
>        │
>        ↓
> Other Users Receive It
> ```
> 
> Therefore, finding an unusual header is **not automatically a vulnerability**.
> 
> You need to establish all of the relevant conditions:
> 
> 1. The input influences the response.
>     
> 2. The input is not represented in the cache key.
>     
> 3. The response is cacheable.
>     
> 4. The resulting response can affect another request using the same cache key.
>     
> 
> Without these conditions, the behavior may simply be interesting rather than exploitable.

---

> [!example]
> 
> ## Testing with curl
> 
> A normal request:
> 
> ```bash
> curl -i https://example.com/
> ```
> 
> Test an input that may influence the response:
> 
> ```bash
> curl -i https://example.com/ \
>   -H 'X-Forwarded-Host: attacker.example'
> ```
> 
> Compare the responses:
> 
> ```bash
> curl -i https://example.com/
> ```
> 
> and:
> 
> ```bash
> curl -i https://example.com/ \
>   -H 'X-Forwarded-Host: attacker.example'
> ```
> 
> Look for differences in:
> 
> - Response body
>     
> - `Location`
>     
> - HTML
>     
> - Absolute URLs
>     
> - Script URLs
>     
> - CSS URLs
>     
> - Canonical URLs
>     
> - Open Graph metadata
>     
> - Cache-related headers
>     
> 
> Example:
> 
> ```text
> Normal:
> https://example.com/static/app.js
> 
> Modified:
> https://attacker.example/static/app.js
> ```
> 
> This indicates that the input may influence the response.

---

> [!info]
> 
> ## Cache Headers
> 
> Inspect response headers carefully.
> 
> Common headers include:
> 
> ```http
> Cache-Control: public, max-age=3600
> ```
> 
> ```http
> Age: 120
> ```
> 
> ```http
> X-Cache: HIT
> ```
> 
> ```http
> X-Cache: MISS
> ```
> 
> ```http
> CF-Cache-Status: HIT
> ```
> 
> The exact headers depend on the CDN or caching infrastructure.
> 
> A response such as:
> 
> ```http
> Cache-Control: public, max-age=3600
> ```
> 
> indicates that the response may be intended for shared caching.
> 
> However, the presence or absence of a particular header does not by itself prove that a response was cached.

---

> [!example]
> 
> ## Cache Hit / Cache Miss
> 
> During testing, compare the same request multiple times.
> 
> First request:
> 
> ```http
> GET / HTTP/1.1
> Host: example.com
> ```
> 
> Possible response:
> 
> ```http
> X-Cache: MISS
> ```
> 
> Repeat:
> 
> ```http
> GET / HTTP/1.1
> Host: example.com
> ```
> 
> Possible response:
> 
> ```http
> X-Cache: HIT
> ```
> 
> This can indicate that the response was stored and reused.
> 
> A simplified testing flow:
> 
> ```mermaid
> flowchart TD
>     A[Send Request] --> B{Cache Status}
>     B -->|MISS| C[Origin Generates Response]
>     C --> D[Cache Stores Response]
>     D --> E[Repeat Request]
>     E --> F[HIT]
>     B -->|HIT| F
> ```

---

> [!warning]
> 
> ## Cache Buster
> 
> Existing cache entries can make testing confusing.
> 
> A unique query parameter can be used to create a new cache key:
> 
> ```http
> GET /?cb=123456
> ```
> 
> Another request:
> 
> ```http
> GET /?cb=789012
> ```
> 
> If the cache includes the query string in its key, these requests may be treated as different cache entries.
> 
> In Burp:
> 
> ```text
> /?cb=<unique-value>
> ```
> 
> This is useful when determining whether a response is actually being stored.

> [!example] Unkeyed Header Testing
> Headers are particularly interesting because some infrastructure uses them to construct responses while excluding them from the cache key.
> 
> Common examples worth investigating include:
> 
> ```http
> X-Forwarded-Host
> X-Forwarded-Scheme
> X-Forwarded-Proto
> X-Forwarded-Port
> X-Host
> X-Forwarded-Server
> X-Original-URL
> X-Rewrite-URL
> ```
> 
> These are **test candidates**, not universal vulnerabilities.
> 
> Example:
> 
> ```http
> GET / HTTP/1.1
> Host: example.com
> X-Forwarded-Host: attacker.example
> ```
> 
> If the response changes:
> 
> ```text
> Request
>    ↓
> X-Forwarded-Host
>    ↓
> Application
>    ↓
> Modified Response
> ```
> 
> the next question is whether the cache key changes as well.

> [!danger]
> 
> ## Host Header Based Cache Poisoning
> 
> The `Host` header is particularly important because applications frequently use host information to generate absolute URLs.
> 
> Example:
> 
> ```http
> GET / HTTP/1.1
> Host: attacker.example
> ```
> 
> If the application trusts the supplied host and generates:
> 
> ```html
> <script src="https://attacker.example/app.js"></script>
> ```
> 
> while the cache identifies the resource using another representation of the request, a cache poisoning condition may exist.
> 
> ```mermaid
> flowchart TD
>     A["Host / Forwarded Host"] --> B[Application]
>     B --> C["Generated Absolute URL"]
>     C --> D[Response]
>     D --> E[Cache]
>     E --> F["Cached under shared key"]
>     F --> G[Other Users]
> ```
> 
> This can become particularly dangerous when the attacker-controlled value is reflected into:
> 
> - Script URLs
>     
> - Stylesheet URLs
>     
> - Redirects
>     
> - Canonical URLs
>     
> - HTML
>     
> - Security-sensitive links
>     

> [!warning]
> 
> ## Cache Key Injection
> 
> Another class of problems occurs when an attacker can manipulate values that affect how the cache constructs its key.
> 
> The security boundary can be represented as:
> 
> ```text
> Request
>    │
>    ├─────────────► Cache Key Generation
>    │
>    └─────────────► Application
>                         │
>                         ↓
>                    Response
> ```
> 
> If the cache and application normalize or parse a request differently, an attacker may be able to cause:
> 
> ```text
> Request A
>     ↓
> Cache Key A
> 
> Request B
>     ↓
> Application interprets as A
> ```
> 
> This type of discrepancy can produce unexpected cache behavior.

> [!example]
> 
> ## Query Parameter Handling
> 
> Caches do not necessarily treat every query parameter equally.
> 
> For example:
> 
> ```text
> /search?q=test
> ```
> 
> might produce one cache key:
> 
> ```text
> /search?q=test
> ```
> 
> while another configuration might ignore selected parameters:
> 
> ```text
> /search?q=test&utm_source=x
> ```
> 
> could still map to:
> 
> ```text
> /search?q=test
> ```
> 
> This becomes interesting when an ignored parameter can influence the origin response.
> 
> ```mermaid
> flowchart LR
>     A["Query Parameter"] --> B[Application]
>     A --> C[Cache Key]
> 
>     B --> D["Influences Response"]
>     C --> E["Parameter Ignored"]
> 
>     D --> F["Potential Poisoning"]
>     E --> F
> ```

> [!warning]
> 
> ## Parameter Cloaking
> 
> **Parameter cloaking** occurs when the cache and origin server disagree about how query parameters are parsed.
> 
> Example:
> 
> ```text
> /page?foo=bar&utm_source=x
> ```
> 
> The cache may remove or ignore one parameter while the application still processes it.
> 
> This can create:
> 
> ```text
> Cache:
>     /page?foo=bar
> 
> Application:
>     /page?foo=bar&utm_source=x
> ```
> 
> If `utm_source` influences the response but is excluded from the cache key, it may become a candidate for cache poisoning.
> 
> The exact behavior depends heavily on the cache implementation and its parameter normalization rules.

---

> [!example]
> 
> ## Response Differences
> 
> When testing an input, compare:
> 
> ```text
> Request A
> ```
> 
> with:
> 
> ```text
> Request B
> ```
> 
> For example:
> 
> ```http
> GET / HTTP/1.1
> Host: example.com
> ```
> 
> versus:
> 
> ```http
> GET / HTTP/1.1
> Host: example.com
> X-Forwarded-Host: attacker.example
> ```
> 
> Check whether the response contains:
> 
> ```text
> attacker.example
> ```
> 
> or another attacker-controlled value.
> 
> A useful comparison is:
> 
> ```mermaid
> flowchart TD
>     A[Baseline Request] --> B[Baseline Response]
>     C[Modified Request] --> D[Modified Response]
> 
>     B --> E{Responses Different?}
>     D --> E
> 
>     E -->|No| F[Input may not influence response]
>     E -->|Yes| G[Investigate Input]
> ```
> 
> Response modification alone does **not** prove cache poisoning.

---

> [!danger]
> 
> ## Confirming the Poison
> 
> A strong confirmation requires demonstrating that the attacker-controlled response is stored and subsequently served to a request that does not contain the malicious input.
> 
> Conceptually:
> 
> ```text
> 1. Baseline
>       ↓
>    Normal Response
> 
> 2. Poisoning Request
>       ↓
>    Attacker-Controlled Response
>       ↓
>    Cache Stores It
> 
> 3. Clean Request
>       ↓
>    Same Cache Key
>       ↓
>    Poisoned Response
> ```
> 
> Example:
> 
> ```http
> # Poisoning request
> GET / HTTP/1.1
> Host: example.com
> X-Forwarded-Host: attacker.example
> ```
> 
> After the response has been cached, send a clean request:
> 
> ```http
> # Clean request
> GET / HTTP/1.1
> Host: example.com
> ```
> 
> If the clean request receives the attacker-influenced response, the cache has effectively been poisoned.

---

> [!abstract]
> 
> ## Detection Methodology
> 
> A practical methodology can be summarized as:
> 
> ```mermaid
> flowchart TD
>     A[Identify Cache / CDN] --> B[Find Cacheable Endpoint]
>     B --> C[Establish Baseline]
>     C --> D[Identify Inputs]
>     D --> E[Test Unkeyed Headers / Parameters]
>     E --> F{Does Input Change Response?}
>     F -->|No| G[Discard Input]
>     F -->|Yes| H[Determine Cache Key]
>     H --> I{Input Included in Cache Key?}
>     I -->|Yes| J[Usually Not WCP]
>     I -->|No| K[Test Cacheability]
>     K --> L{Response Cached?}
>     L -->|No| M[No Practical Poisoning]
>     L -->|Yes| N[Test Clean Request]
>     N --> O{Poisoned Response Served?}
>     O -->|Yes| P[Potential Web Cache Poisoning]
>     O -->|No| Q[Continue Analysis]
> ```
> 
> The core logic is:
> 
> ```text
> Input affects response
>          +
> Input is not in cache key
>          +
> Response is cacheable
>          +
> Poisoned response is served to another request
>          =
> Web Cache Poisoning
> ```

---

> [!example]
> 
> ## Burp Suite Workflow
> 
> A practical workflow in Burp Suite:
> 
> ```text
> 1. Proxy
>       ↓
> 2. Identify cacheable requests
>       ↓
> 3. Send request to Repeater
>       ↓
> 4. Establish baseline response
>       ↓
> 5. Modify one input
>       ↓
> 6. Compare response
>       ↓
> 7. Determine whether input is keyed
>       ↓
> 8. Add cachebuster
>       ↓
> 9. Send poisoning request
>       ↓
> 10. Send clean request
>       ↓
> 11. Compare responses
> ```
> 
> **Param Miner** can be useful for discovering hidden inputs and testing cache-related behavior.

> [!info]
> 
> ## Useful Indicators
> 
> During testing, pay attention to:
> 
> ### Response Headers
> 
> ```http
> Age:
> X-Cache:
> X-Cache-Hits:
> CF-Cache-Status:
> Cache-Control:
> Vary:
> ```
> 
> ### Response Content
> 
> Look for attacker-controlled values inside:
> 
> ```text
> HTML
> JavaScript URLs
> CSS URLs
> Redirect locations
> Canonical URLs
> Absolute links
> Open Graph metadata
> ```
> 
> ### Request Inputs
> 
> Investigate:
> 
> ```text
> Headers
> Query parameters
> Path components
> Host-related headers
> Forwarding headers
> Cookies
> ```
> 
> The exact behavior depends on the application's architecture and caching infrastructure.

> [!warning]
> 
> ## Important Testing Considerations
> 
> A response being cached does not automatically mean that it is vulnerable.
> 
> Likewise, an input changing the response does not automatically mean that the cache is poisoned.
> 
> You must establish the relationship:
> 
> ```text
> Input
>   ↓
> Response
>   ↓
> Cache Key
>   ↓
> Cached Object
>   ↓
> Subsequent Request
> ```
> 
> In particular, determine whether:
> 
> ```text
> Input affects response
>          ↓
> Input excluded from cache key
>          ↓
> Response cached
>          ↓
> Clean request receives modified response
> ```
> 
> That last step is what turns an interesting parser behavior into a practical cache poisoning vulnerability.

> [!tip]
> 
> ## Prevention
> 
> Applications and caching infrastructure should avoid allowing attacker-controlled inputs to influence cacheable responses unless those inputs are correctly represented in the cache key.
> 
> Recommended controls include:
> 
> - Do not cache personalized or user-specific responses in shared caches.
>     
> - Use appropriate `Cache-Control` directives.
>     
> - Validate and normalize `Host` and forwarding headers.
>     
> - Do not blindly trust `X-Forwarded-*` headers from untrusted clients.
>     
> - Ensure cache keys account for every input that can materially change a response.
>     
> - Keep cache and origin URL parsing behavior consistent.
>     
> - Avoid caching responses that reflect attacker-controlled input.
>     
> - Configure CDN cache rules explicitly rather than relying entirely on defaults.
>     
> - Use `Vary` appropriately where request headers legitimately affect the representation.
>     
> 
> Example:
> 
> ```http
> Cache-Control: private, no-store
> ```
> 
> can be appropriate for responses containing sensitive or user-specific information, depending on the application's requirements.

> [!abstract]
> 
> ## Key Takeaways
> 
> ```text
> Web Cache Poisoning
>         │
>         ├── Attacker controls an input
>         │
>         ├── Input affects the response
>         │
>         ├── Input is not represented in cache key
>         │
>         ├── Response is cacheable
>         │
>         └── Poisoned response reaches other users
> ```
> 
> The most important question during testing is:
> 
> > **Can I influence a cacheable response using an input that the cache does not distinguish?**
> 
> If the answer is yes, the next step is to prove that the resulting response is actually stored and served to a clean request.

> [!tip]
> 
> ## Further Reading
> 
> - PortSwigger Web Security Academy — Web Cache Poisoning
>     
> - PortSwigger Research — Web Cache Poisoning
>     
> - PortSwigger Param Miner
>     
> - PortSwigger Web Cache Deception research
>