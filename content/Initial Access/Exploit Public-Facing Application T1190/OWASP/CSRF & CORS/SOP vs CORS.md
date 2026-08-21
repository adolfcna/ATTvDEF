---
title: SOP vs CORS
draft:
tags:
---
![[Pasted image 20260721072616.png|695]]
# Same Origin vs Cross Origin

> [!info] Overview
> Modern browsers enforce a security mechanism called **Same-Origin Policy (SOP)**.  
> It controls how a web page can communicate with resources from different origins.

An **origin** is defined by three components:

```
Origin = Protocol + Host + Port
```

Example:

```
https://example.com:443
```

This contains:

- Protocol → `https`
- Host → `example.com`
- Port → `443`

If any of these values are different, the browser considers the request **Cross-Origin**.

---

## Same Origin

A request is considered **Same-Origin** when the webpage and the requested resource share the same origin.

Example:

Current page:

```
https://mywebsite.com/dashboard
```

JavaScript:

```javascript
function httpreq() {
    var xhttp = new XMLHttpRequest();


    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert(this.responseText);
        }
    };

    xhttp.open("GET", "/status", true);
    xhttp.send();
}
```

The browser sends the request to:

```
https://mywebsite.com/status
```

Comparison:

```
Page Origin:
https://mywebsite.com

Request Origin:
https://mywebsite.com
```

> [!success] Result
> The request is **Same-Origin**.  
> JavaScript can read the server response without CORS restrictions.

---

## Cross Origin

A request becomes **Cross-Origin** when the destination resource belongs to a different origin.

Example:

Current page:

```
https://mywebsite.com
```

JavaScript:

```javascript
function httpreq() {
    var xhttp = new XMLHttpRequest();
    
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert(this.responseText);
        }
    };
    
    xhttp.open("GET", "https://api.example.com/status", true);
    xhttp.send();
}
```

The browser sends the request to:

```
https://api.example.com/status
```

Comparison:

```
Page Origin:
https://mywebsite.com

Request Origin:
https://api.example.com
```

The host is different:

```
mywebsite.com != api.example.com
```

> [!warning] Result
> The request is **Cross-Origin**.  
> The browser applies CORS security rules before allowing JavaScript to access the response.

---

# Same-Origin Policy (SOP)

The Same-Origin Policy is a browser security mechanism designed to prevent one website from accessing sensitive data belonging to another website.

Example scenario:

```
Attacker Website
        |
        |
        v
Victim Website
```

Without SOP:

- A malicious website could send requests to another website.
- It could read private responses.
- User data could be exposed.

> [!danger] Security Impact
> SOP prevents unauthorized cross-site data access directly from browser JavaScript.

---

# CORS (Cross-Origin Resource Sharing)

CORS is a mechanism that allows a server to define which external origins are allowed to access its resources.

A server can include:

```http
Access-Control-Allow-Origin: https://mywebsite.com
```

Meaning:

```
https://mywebsite.com
        |
        v
Allowed to read response
```

Example:

Request:

```http
GET /status HTTP/1.1
Host: api.example.com
Origin: https://mywebsite.com
```

Response:

```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://mywebsite.com
```

---

# Important Difference

> [!question] Does CORS block the request?

Not always.

A browser may still send the request:

```
Browser
   |
   | GET /status
   |
   v
API Server
```

But if the response does not contain valid CORS headers:

```
API Server
   |
   | Missing CORS Header
   |
   v
Browser blocks JavaScript access
```

The important point:

> CORS mainly controls whether JavaScript can **read the response**.

---

# Origin Examples

## Same Origin

```
https://example.com/page1

https://example.com/page2
```

Same:

```
Protocol  : https
Host      : example.com
Port      : 443
```

Result:

```
Same-Origin
```

---

## Different Host

```
https://example.com

https://api.example.com
```

Different:

```
Host
```

Result:

```
Cross-Origin
```

---

## Different Protocol

```
http://example.com

https://example.com
```

Different:

```
Protocol
```

Result:

```
Cross-Origin
```

---

## Different Port

```
https://example.com:443

https://example.com:8080
```

Different:

```
Port
```

Result:

```
Cross-Origin
```

---

# Same Origin vs Cross Origin

| Feature | Same Origin | Cross Origin |
|---|---|---|
| Protocol | Same | Different |
| Host | Same | Different |
| Port | Same | Different |
| Browser Restriction | No CORS required | CORS policy applies |
| JavaScript Response Access | Allowed | Requires permission |
| Example | `/status` | `https://api.example.com/status` |

---

# Security Testing Relevance

Understanding origins is important when analyzing:

- CORS misconfigurations
- CSRF behavior
- API security
- Authentication flows
- Browser-based attacks
- JavaScript security issues

> [!tip] Key Takeaway
> Same-Origin Policy protects users by isolating websites from each other.  
> CORS provides a controlled way for servers to allow specific cross-origin communication.