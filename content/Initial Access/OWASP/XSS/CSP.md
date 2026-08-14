---
title: Content Security Policy
draft: false
tags:
---

> [!info] What is CSP?
>
> **Content Security Policy (CSP)** is a browser security mechanism that allows a website to define which resources are trusted and allowed to load or execute.
>
> Its primary goal is to reduce the impact of **Cross-Site Scripting (XSS)** and other code injection attacks.

![[Pasted image 20260814210924.png]]


> [!example] CSP Response Header Example
>
> ```http
> HTTP/1.1 200 OK
> Content-Security-Policy: default-src 'self'; script-src 'self'
> ```

The browser stores this policy and enforces it while rendering the page.

---

# How CSP Works

> [!example] Browser Decision Process
>
> ```mermaid
> flowchart TD
>     A[HTTP Response with CSP Header] --> B[Browser stores CSP]
>     B --> C[Resource requested]
>     C --> D{Browser checks CSP}
>     D -->|Allowed| E[Load Resource]
>     D -->|Blocked| F[Reject Resource]
> ```

# Primary Goal

> [!success] XSS Mitigation
>
> CSP significantly reduces the impact of Cross-Site Scripting (XSS) by preventing browsers from executing unauthorized scripts.

> [!example] CSP vs No CSP
>
> ```mermaid
> flowchart LR
>     A[User Input] --> B[Injected JavaScript]
>
>     B --> C1[No CSP]
>     C1 --> D1[Browser Executes Script]
>     D1 --> E1[XSS Successful]
>
>     B --> C2[CSP Enabled]
>     C2 --> D2[Browser Checks Policy]
>     D2 --> E2[Script Blocked]
>     E2 --> F2[XSS Mitigated]
> ```

# Common CSP Directives

## default-src

> [!info]
>
> Defines the default policy for all resource types unless another directive overrides it.

Example:

```http
Content-Security-Policy:
default-src 'self'
```

Meaning:

```text
Load all resources only from the same origin.
```

---

## script-src

> [!info]
>
> Controls which JavaScript files are allowed to execute.

Example:

```http
script-src 'self'
```

Allowed:

```text
https://example.com/app.js
```

Blocked:

```text
https://evil.com/malware.js
```

---

## style-src

Controls where CSS files can be loaded from.

Example:

```http
style-src 'self'
```

---

## img-src

Controls where images may be loaded from.

Example:

```http
img-src 'self' https://cdn.example.com
```

---

## connect-src

Controls outbound browser connections such as:

- Fetch API
- XMLHttpRequest
- WebSocket
- EventSource

Example:

```http
connect-src 'self'
```

---

## frame-src

Controls which websites may be embedded using `<iframe>`.

---

## object-src

Controls legacy plugins such as Flash and Java Applets.

Most modern websites use:

```http
object-src 'none'
```

---

## form-action

Specifies where HTML forms are allowed to submit.

---

## base-uri

Controls whether the HTML `<base>` element can modify relative URLs.

---

# Special Keywords

## 'self'

> [!info]
>
> `'self'` means the same **Origin**.

```text
Same Scheme
Same Host
Same Port
```

Example:

```http
script-src 'self'
```

Only JavaScript files from the same origin are allowed.

---

## 'none'

Blocks every source.

Example:

```http
object-src 'none'
```

No objects are allowed.

---

## 'unsafe-inline'

> [!danger]
>
> Allows inline JavaScript.

Example:

```http
script-src 'unsafe-inline'
```

Then this becomes allowed:

```html
<script>
alert(1)
</script>
```

This weakens CSP and may allow many XSS attacks.

---

## 'unsafe-eval'

Allows dangerous JavaScript functions such as:

```javascript
eval()

new Function()

setTimeout("code")
```

Generally discouraged.

---

# Nonce

> [!success]
>
> A nonce allows only specifically approved inline scripts to execute.

Example:

Response header:

```http
Content-Security-Policy:
script-src 'nonce-r4nd0m'
```

HTML:

```html
<script nonce="r4nd0m">
console.log("Allowed")
</script>
```

Any inline script without the correct nonce is blocked.

---

# Hash

Instead of a nonce, CSP may allow scripts using a cryptographic hash.

Example:

```http
script-src 'sha256-xxxxxxxx'
```

Only scripts matching that hash may execute.

> [!success] CSP Decision Flow
>
> ```mermaid
> flowchart LR
>     A[Resource Requested] --> B{Matches CSP Policy?}
>     B -->|Yes| C[Load / Execute Resource]
>     B -->|No| D[Block Resource]
> ```


---

# Example Policy

> [!example]
>
> ```http
> Content-Security-Policy:
> default-src 'self';
> script-src 'self';
> style-src 'self';
> img-src 'self' https://cdn.example.com;
> object-src 'none';
> base-uri 'self';
> form-action 'self';
> ```

Meaning:

- JavaScript only from the same origin.
- CSS only from the same origin.
- Images from the same origin and the trusted CDN.
- No plugins.
- Forms can only submit to the same origin.
- The `<base>` element cannot point to another website.

---

# Important Notes

> [!warning]
>
> CSP is **not** a replacement for secure coding.
>
> It is an additional layer of defense.

A vulnerable application may still contain XSS, but a strong CSP can significantly reduce its impact.

---

# Summary

> [!success] CSP Summary
>
> | Directive | Purpose |
> |-----------|---------|
> | `default-src` | Default policy for all resources |
> | `script-src` | Control JavaScript execution |
> | `style-src` | Control CSS loading |
> | `img-src` | Control image sources |
> | `connect-src` | Control Fetch, XHR, WebSocket |
> | `frame-src` | Control iframes |
> | `object-src` | Control plugins |
> | `form-action` | Control form submission |
> | `base-uri` | Control the `<base>` element |