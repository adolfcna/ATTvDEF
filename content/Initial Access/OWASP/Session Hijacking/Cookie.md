---
title: Cookie
draft: false
tags:
  - Basic
---
# HTTP Cookie Security Attributes

HTTP cookies are created by the server using the `Set-Cookie` response header.

The server can attach security attributes to control how browsers store and send cookies.

> [!example] Example
>
> ```http
> HTTP/1.1 200 OK
> Set-Cookie: sessionid=abc123; HttpOnly; Secure; SameSite=Lax
> ```

The browser receives the cookie and stores both the value and its security attributes.

> [!example] Browser Stores Cookie
>
> ```text
> Cookie Name:
> sessionid
>
> Cookie Value:
> abc123
>
> Security Attributes:
> HttpOnly
> Secure
> SameSite=Lax
> ```

The browser does **not** send these attributes back to the server.

They are internal rules enforced by the browser.

Future requests contain only the cookie name and value:

> [!example] Cookie Request
>
> ```http
> GET /dashboard HTTP/1.1
> Host: example.com
> Cookie: sessionid=abc123
> ```

---

> [!example] Cookie Lifecycle
>
> ```mermaid
> sequenceDiagram
>     Client->>Server: GET /login
>     Server-->>Client: Set-Cookie: sessionid=abc123
>     Client->>Browser: Store Cookie
>     Client->>Server: GET /dashboard
>     Browser->>Server: Cookie: sessionid=abc123
> ```

---

# HttpOnly

> [!info] What is HttpOnly?
>
> `HttpOnly` is a cookie attribute that prevents JavaScript running in the browser from accessing the cookie value.

Example:

> [!example] HttpOnly Cookie
>
> ```http
> Set-Cookie: sessionid=abc123; HttpOnly
> ```

Normally JavaScript can access cookies:

> [!example] Without HttpOnly
>
> ```javascript
> document.cookie
> ```
>
> Output:
>
> ```text
> sessionid=abc123
> ```

When `HttpOnly` is enabled:

> [!example] With HttpOnly
>
> ```javascript
> document.cookie
> ```
>
> Output:
>
> ```text
> sessionid is not visible
> ```

---

> [!danger] Security Purpose
>
> HttpOnly reduces the impact of Cross-Site Scripting (XSS) attacks by preventing attackers from directly stealing session cookies.

> [!danger] Without HttpOnly
>
> ```mermaid
> flowchart TD
>     A[Attacker injects JavaScript] --> B[document.cookie]
>     B --> C[Session cookie theft]
>     C --> D[Account takeover]
> ```

> [!success] With HttpOnly
>
> ```mermaid
> flowchart TD
>     A[Attacker injects JavaScript] --> B[document.cookie]
>     B --> C[Cookie cannot be read]
> ```

---

> [!warning] Important Note
>
> HttpOnly does not completely stop XSS attacks.
>
> An attacker may still perform actions on behalf of the victim because the browser automatically attaches cookies to requests.

Example:

```javascript
fetch("/profile/change-email")
```

The browser may automatically send:

```http
Cookie: sessionid=abc123
```

---

# Secure

> [!info] What is Secure?
>
> The `Secure` attribute instructs the browser to send the cookie only over HTTPS connections.

Example:

> [!example] Secure Cookie
>
> ```http
> Set-Cookie: sessionid=abc123; Secure
> ```

HTTPS request:

```text
https://example.com
```

Cookie:

```text
✅ Sent
```

HTTP request:

```text
http://example.com
```

Cookie:

```text
❌ Not Sent
```

---

> [!danger] Security Purpose
>
> Secure prevents session cookies from being exposed over unencrypted HTTP connections.

---

# SameSite

> [!info] What is SameSite?
>
> `SameSite` controls when browsers send cookies in **same-site** and **cross-site** requests.
>
> Its main purpose is reducing the risk of:
>
> ```text
> CSRF (Cross-Site Request Forgery)
> ```

Example:

> [!example] SameSite Attribute
>
> ```http
> Set-Cookie: sessionid=abc123; SameSite=Lax
> ```

# Same-Origin

> [!info] Same-Origin Definition
>
> Two URLs are considered **same-origin** only when all three components are identical:
>
> ```text
> Scheme + Host + Port
> ```
>
> The browser compares:
>
> - **Scheme** → Protocol (`http`, `https`)
> - **Host** → Domain name (`app.example.com`)
> - **Port** → Network port (`443`, `8080`)

---

> [!danger] Different Host
>
> ```text
> https://app.example.com:443
>
> https://admin.example.com:443
> ```
>
> Comparison:
>
> ```text
> Scheme  ✔  https
> Host    ✘  app.example.com ≠ admin.example.com
> Port    ✔  443
> ```
>
> Result:
>
> ```text
> 🔴 Different Origin
> ```
>
> Because the hostname is different.

---

> [!danger] Different Port
>
> ```text
> https://app.example.com:443
>
> https://app.example.com:8443
> ```
>
> Comparison:
>
> ```text
> Scheme  ✔  https
> Host    ✔  app.example.com
> Port    ✘  443 ≠ 8443
> ```
>
> Result:
>
> ```text
> 🔴 Different Origin
> ```
>
> Because the port is different.

---

> [!danger] Different Scheme
>
> ```text
> https://app.example.com
>
> http://app.example.com
> ```
>
> Comparison:
>
> ```text
> Scheme  ✘  https ≠ http
> Host    ✔  app.example.com
> Port    ✔  443
> ```
>
> Result:
>
> ```text
> 🔴 Different Origin
> ```
>
> Because the protocol scheme is different.

---

> [!example] Same-Origin Examples
>
> | URL | Result |
> |---|---|
> | `https://app.example.com:443` | Same Origin |
> | `https://app.example.com:8443` | Different Origin |
> | `http://app.example.com` | Different Origin |
> | `https://admin.example.com:443` | Different Origin |

---

# Same-Site

> [!info] Same-Site Definition
>
> Two URLs are considered **same-site** when they share the same **scheme and registrable domain (eTLD+1)**.
>
> ```text
> Site = Scheme + Registrable Domain
> ```
>
> Unlike Same-Origin, different subdomains can still belong to the same site.

---

> [!example] Same-Site Example
>
> ```text
> https://app.example.com
>
> https://admin.example.com
>
> https://shop.example.com
> ```
>
> All belong to:
>
> ```text
> https://example.com
> ```
>
> Comparison:
>
> ```text
> Registrable Domain  ✔  example.com
> Subdomain           ✔  Different subdomains are allowed
> ```
>
> Result:
>
> ```text
> 🔵 Same Site
> ```

---

> [!example] Same-Site Examples
>
> | URL | Site |
> |---|---|
> | `https://app.example.com` | `https://example.com` |
> | `https://admin.example.com` | `https://example.com` |
> | `https://shop.example.com` | `https://example.com` |

---

> [!warning] Same-Site ≠ Same-Origin
>
> Two URLs can be **Same-Site** but still have **Different Origins**.

Example:

```text
https://app.example.com

https://admin.example.com
```

Result:

```text
Same Site      ✅
Same Origin    ❌
```

Reason:

```text
Same Site:
example.com is identical

Same Origin:
Hostnames are different
```

---

> [!example] Browser Security Model
>
> ```mermaid
> flowchart LR
>     A[URL A] --> B{Browser Comparison}
>     C[URL B] --> B
>
>     B --> D[Same-Origin Check]
>     B --> E[Same-Site Check]
>
>     D --> F[Scheme + Host + Port]
>     E --> G[Scheme + Registrable Domain]
> ```

---

# Cross-Site

> [!danger] Cross-Site Example
>
> Two URLs are considered **cross-site** when they belong to different registrable domains.

Example:

```text
https://evil.com
        |
        v
https://bank.com
```

Comparison:

```text
Registrable Domain ✘ Different domains
```

Result:

```text
🔴 Cross Site
```

---

# SameSite Cookie Modes

> [!success] SameSite Values
>
> The `SameSite` attribute controls cookie behavior in same-site and cross-site contexts.

Available values:

```text
Strict
Lax
None
```
# SameSite=Strict

> [!danger] Strict Mode
>
> `SameSite=Strict` provides the strongest cookie restriction.
>
> The browser sends the cookie only when the request originates from the same site.

> [!example] Same-Site Request
>
> ```text
> https://bank.com
>        |
>        v
> https://bank.com/account
> ```
>
> Cookie:
>
> ```text
> ✅ Sent
> ```

> [!danger] Cross-Site Request
>
> ```text
> https://evil.com
>        |
>        v
> https://bank.com
> ```
>
> Cookie:
>
> ```text
> ❌ Blocked
> ```

> [!success] Advantages
>
> - Strongest CSRF protection
> - Prevents cross-site cookie usage

> [!warning] Disadvantages
>
> - May break login flows
> - May affect external redirects and third-party integrations

# SameSite=Lax

> [!tip] Lax Mode
>
> `SameSite=Lax` provides a balance between security and usability.
>
> The browser allows cookies during normal top-level navigation but blocks many cross-site state-changing requests.

> [!example] Top-Level Navigation
>
> User clicks a link:
>
> ```text
> https://evil.com
>          |
>          v
> https://bank.com
> ```
>
> Cookie:
>
> ```text
> ✅ Sent
> ```

> [!danger] Cross-Site POST Request
>
> Example:
>
> ```http
> POST https://bank.com/change-password
> ```
>
> Request origin:
>
> ```text
> https://evil.com
> ```
>
> Cookie:
>
> ```text
> ❌ Blocked
> ```

> [!success] Default Browser Behavior
>
> Modern browsers commonly use `SameSite=Lax` as the default behavior.
>
> It provides reasonable CSRF protection while keeping normal website navigation working.

# SameSite=None

> [!example] None Mode
>
> `SameSite=None` allows cookies to be sent in cross-site requests.
>
> Example:
>
> ```http
> Set-Cookie: sessionid=abc123; SameSite=None; Secure
> ```

> [!example] Cross-Site Cookie Request
>
> ```text
> https://website-a.com
>          |
>          v
> https://website-b.com
> ```
>
> Cookie:
>
> ```text
> ✅ Sent
> ```

> [!info] Common Use Cases
>
> `SameSite=None` is commonly used for:
>
> - Single Sign-On (SSO)
> - Third-party authentication
> - Embedded applications
> - Cross-domain services

> [!warning] Security Requirement
>
> `SameSite=None` requires the `Secure` attribute.
>
> Correct:
>
> ```http
> SameSite=None; Secure
> ```
>
> Incorrect:
>
> ```http
> SameSite=None
> ```
>
> Modern browsers reject insecure cross-site cookies.

# Cookie Attribute Comparison

| Attribute | Purpose |
|---|---|
| HttpOnly | Prevent JavaScript access to cookies |
| Secure | Send cookies only through HTTPS |
| SameSite=Strict | Maximum CSRF protection |
| SameSite=Lax | Balance between security and usability |
| SameSite=None | Allow cross-site cookie usage |

---

# Complete Secure Cookie Example

> [!example] Recommended Session Cookie
>
> ```http
> Set-Cookie: sessionid=random_value; HttpOnly; Secure; SameSite=Lax
> ```

Cookie behavior:

> [!example] Browser Cookie Security Checks
>
> ```mermaid
> flowchart TD
>     A[Cookie Received]
>
>     A --> B{HttpOnly}
>     B -->|Enabled| C[JavaScript cannot access cookie]
>
>     A --> D{Secure}
>     D -->|Enabled| E[Cookie sent only over HTTPS]
>
>     A --> F{SameSite=Lax}
>     F -->|Enabled| G[Restrict cross-site cookie sending]
> ```

---

# Summary

> [!success] Cookie Security Summary
>
> | Attribute | Browser Behavior |
> |---|---|
> | HttpOnly | JavaScript cannot read the cookie |
> | Secure | Cookie is only transmitted over HTTPS |
> | SameSite=Strict | Cookie is only sent in same-site contexts |
> | SameSite=Lax | Cookie is allowed for normal navigation but restricted in many cross-site requests |
> | SameSite=None | Cookie can be sent cross-site and requires Secure |

---

# Final Cookie Flow

> [!example] Complete Cookie Lifecycle
>
> ```mermaid
> sequenceDiagram
>     participant Browser
>     participant Server
>
>     Browser->>Server: GET /login
>     Server-->>Browser: Set-Cookie: sessionid=abc123 HttpOnly Secure SameSite=Lax
>
>     Browser->>Browser: Store cookie and security attributes
>
>     Browser->>Server: GET /dashboard
>     Browser->>Server: Cookie: sessionid=abc123
> ```

---

> [!warning] Important Security Note
>
> Cookie attributes are enforced by the browser.
>
> The server sends:
>
> ```text
> Set-Cookie
> ```
>
> The browser decides:
>
> ```text
> - Can JavaScript read it?
> - Should it be sent over HTTP or HTTPS?
> - Should it be included in cross-site requests?
> ```
>
> The server receives only:
>
> ```http
> Cookie: sessionid=abc123
> ```


