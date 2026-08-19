---
title: Web Cache Fundamentals
draft:
tags:
---
![[Pasted image 20260819115446.png]]

> [!info] Web Cache Fundamentals
> Before exploring **Web Cache vulnerabilities**, it is important to understand how web caching and **Content Delivery Networks (CDNs)** work.
> 
> A **CDN (Content Delivery Network)** is a distributed network of servers designed to deliver web content efficiently to users. Instead of every user communicating directly with the origin server, a CDN can serve cached content from a server that is closer to the user.
> 
> CDNs use factors such as:
> 
> - The user's geographical location
>     
> - The location of the origin server
>     
> - The availability and location of CDN servers
>     
> 
> One of the primary functions of a CDN is **caching**.
> 
> **Caching** involves storing copies of responses or resources so that future requests can be served faster without always contacting the upstream or origin server.
>```mermaid
> flowchart LR
>     A[Client] --> B[CDN / Cache Server]
>     B -->|Cache Miss| C[Upstream / Origin Server]
>     C --> B
>     B --> A
>```
> If the requested resource already exists in the cache, the cache server can respond directly without contacting the upstream server:
> 
> ```mermaid
> flowchart LR
>     A[Client] --> B[CDN / Cache Server]
>     B -->|Cache Hit| A
> ```

> [!abstract] What is a Cache
>
> 
> A **cache** is a stored copy of data that can be reused for future requests.
> 
> Its primary purpose is to:
> 
> - Reduce response time
>     
> - Improve page load speed
>     
> - Reduce bandwidth consumption
>     
> - Reduce the load on upstream or origin servers
>     
> 
> Caching can occur at multiple locations, including:
> 
> - DNS caches
>     
> - Browser caches
>     
> - Proxy caches
>     
> - CDN caches
>     
> - Server-side caches
>     
> 
> A cache server often acts as a **reverse proxy**. It receives requests from clients and decides whether it can serve a stored response or whether it needs to forward the request to the upstream server.

>[!info] Diagram
> ```mermaid
> flowchart LR
>     A[Client Request] --> B{Is the Response Cached?}
>     B -->|Yes| C[Return Cached Response]
>     B -->|No| D[Forward Request to Upstream]
>     D --> E[Upstream Server]
>     E --> F[Generate Response]
>     F --> G[Store Response in Cache]
>     G --> H[Return Response to Client]
> ```


> [!success] What is a Cache Key?
> A cache server needs a way to determine whether two requests should receive the same cached response.
> 
> This is done using a **Cache Key**.
> 
> A cache key is a collection of request components that the cache uses to identify a unique resource or response.
> 
> For example:
> 
> ```text
> https | GET | example.com | /news/show.php?id=1
> ```
> 
> In this example, the cache key may contain:
> 
> - Protocol: `https`
>     
> - HTTP Method: `GET`
>     
> - Host: `example.com`
>     
> - Request Path: `/news/show.php`
>     
> - Query Parameter: `id=1`
>     
> 
> When another request generates the same cache key, the cache may return the previously stored response.
> 
> Consider the following request:
> 
> ```http
> GET /news/show.php?id=1 HTTP/1.1
> Host: example.com
> Accept-Language: en-US, en;q=0.5
> Accept-Encoding: gzip, deflate
> Referer: https://example.com
> Cookie: lang=de
> Connection: close
> ```
> 
> Not every part of an HTTP request is necessarily included in the cache key.
> 
> ### Keyed and Unkeyed Inputs
> 
> A **keyed input** is a part of the request that contributes to the cache key.
> 
> An **unkeyed input** is processed by the application but is not included in the cache key.
> 
> This difference is extremely important for web cache vulnerabilities.
> 
> ```mermaid
> flowchart TD
>     A[HTTP Request] --> B[Cache Key Generation]
>     A --> C[Application Processing]
>     B --> D[Keyed Inputs]
>     C --> E[All Processed Inputs]
>     E --> F[Unkeyed Input]
> ```

> [!example]
> For example, imagine that the application uses the following cookie to determine the language:
> 
> ```http
> Cookie: lang=de
> ```
> 
> However, suppose the `Cookie` header is **not included in the cache key**.
> 
> The following situation can occur:
> 
> ```mermaid
> sequenceDiagram
>     participant A as Attacker
>     participant C as Cache
>     participant U as Upstream Server
>     participant V as Victim
> 
>     A->>C: Request with Cookie: lang=de
>     C->>U: Cache Miss
>     U->>C: German Response
>     C->>C: Cache Response
>     V->>C: Same URL without Cookie
>     C->>V: Cached German Response
> ```
> 
> Since the `lang=de` cookie was not part of the cache key, multiple requests may map to the same cached object.
> 
> As a result, another user requesting the same URL could receive the response generated using the previous request's language setting.
> 
> This type of behavior is one of the core concepts behind **Web Cache Poisoning** and other cache-related vulnerabilities.

>[!info]  Cache Hit and Cache Miss
> When a client sends a request, the cache checks whether a matching response already exists.
> 
> A **Cache Miss** occurs when no matching cached response is available. The cache forwards the request to the upstream server.
> 
> A **Cache Hit** occurs when a matching cached response already exists. The cache returns the stored response directly.
> 
> Some caching systems expose this information through response headers, for example:
> 
> ```http
> X-Cache: MISS
> ```
> 
> or:
> 
> ```http
> X-Cache: HIT
> ```
> 
> The exact header depends on the CDN, reverse proxy, or caching technology. Naturally, even cache headers could not agree on one universal naming scheme.
> 
> ### The `Vary` Header
> 
> The **Vary** response header tells caches that the response may change depending on specific request headers.

>[!example]
> ```http
> Vary: Accept-Language
> ```
> 
> This tells the cache that responses should be stored separately depending on the value of the `Accept-Language` request header.
> 

 ```mermaid
 flowchart TD
     A[Client Request] --> B{Accept-Language}
     B -->|en-US| C[English Cached Response]
     B -->|de| D[German Cached Response]
     B -->|fr| E[French Cached Response]
 ```

 > [!info]
> Without appropriate cache variation, requests with different headers may incorrectly receive the same cached response.
> 
> However, the exact handling of `Vary` depends on the caching implementation, and some CDNs or cache configurations may restrict or ignore certain variations.
> 
> ### Preventing Responses from Being Cached
> 
> The server can use the `Cache-Control` response header to control how responses are cached.
> 
> Common directives include:
> 
> ```http
> Cache-Control: no-cache
> ```
> 
> This allows storage but requires the cache to validate the response with the origin server before reusing it.
> 
> ```http
> Cache-Control: no-store
> ```
> 
> This instructs caches not to store the response.
> 
> ```http
> Cache-Control: private
> ```
> 
> This indicates that the response is intended for a private cache, such as a browser, rather than a shared cache.
> 
> ```http
> Cache-Control: max-age=0
> ```
> 
> This indicates that the response becomes stale immediately and generally requires revalidation before reuse.
> 
> Understanding **cache keys**, **keyed and unkeyed inputs**, **cache hits and misses**, and **cache control mechanisms** is essential before analyzing vulnerabilities such as **Web Cache Poisoning**, where attacker-controlled input can influence a response that is later served from a shared cache to other users.

