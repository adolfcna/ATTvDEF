---
title: OpenSSL
draft: false
tags:
---

> [!abstract]
>
> **OpenSSL** is a widely used cryptographic toolkit for generating keys, hashing data, encoding/decoding content, encrypting/decrypting files, and managing SSL/TLS certificates.

> [!info] Hash Functions
>
> Hash functions generate a fixed-size digest from input data. They are **one-way functions**, meaning the original input cannot be recovered from the hash.
>
> **MD5**
> ```bash
> echo -n "CNA" | openssl md5
> ```
>
> Output
> ```text
> MD5(stdin)= 68b3177cae966fde225c197ecb4fd253
> ```
>
> **SHA-1**
> ```bash
> echo -n "CNA" | openssl sha1
> ```
>
> **SHA-256**
> ```bash
> echo -n "CNA" | openssl sha256
> ```
>
> **SHA-512**
> ```bash
> echo -n "CNA" | openssl sha512
> ```
>
> > [!info]
> > MD5 and SHA-1 are cryptographically broken and should not be used for security-sensitive applications.

> [!warning] Base64 Encoding
>
> Base64 is an **encoding** scheme used to represent binary data as ASCII text. It is **not encryption** and provides **no confidentiality**.
>
> **Encode**
> ```bash
> echo -n "CNA" | openssl enc -base64
> ```
>
> Output
> ```text
> Q05B
> ```
>
> **Decode**
> ```bash
> echo "Q05B" | openssl enc -d -base64
> ```
>
> Output
> ```text
> CNA
> ```
>
> > [!warning]
> > Base64 is reversible without a key. Anyone can decode Base64-encoded data, so it should never be used to protect sensitive information.

> [!info] AES Encryption (Symmetric Encryption)
>
> AES (Advanced Encryption Standard) is a **symmetric encryption algorithm**, meaning the same password or key is used for both encryption and decryption.
>
> **Encrypt (AES-256-CBC)**
> ```bash
> echo -n "CNA" | openssl enc -aes-256-cbc -a -iter 123
> ```
>
> Example
> ```text
> enter AES-256-CBC encryption password:
>
> U2FsdGVkX18vLTn6oLeqKT2NulaGqmWU7h8qzI07lqY=
> ```
>
> **Decrypt**
> ```bash
> echo "U2FsdGVkX18vLTn6oLeqKT2NulaGqmWU7h8qzI07lqY=" | \
> openssl enc -d -aes-256-cbc -a -iter 123
> ```
>
> Output
> ```text
> CNA
> ```
>
> > [!tip]
> > `-a` encodes the encrypted output using Base64, making it printable and easier to store or transmit.
>
> > [!info]
> > The same password used for encryption is required for decryption. Without the correct password or key, the ciphertext cannot be decrypted.

```mermaid
flowchart LR

A[Plaintext]

A --> B[AES Encryption]

B --> C[Ciphertext]

C --> D[AES Decryption]

D --> E[Plaintext]
```

> [!info] RSA (Asymmetric Encryption)
>
> RSA is an **asymmetric cryptographic algorithm** that uses a **public key** for encryption and a **private key** for decryption. Unlike symmetric encryption (such as AES), the encryption and decryption keys are different.
>
> **Generate a Private Key**
> ```bash
> openssl genrsa -out private.pem 2048
> ```
>
> **Generate the Public Key**
> ```bash
> openssl rsa -in private.pem -pubout > public.pem
> ```
>
> Generated files
> ```text
> private.pem
> public.pem
> ```
>
> **Create a Plaintext File**
> ```bash
> echo "secret text" > sec.txt
> ```
>
> **Encrypt with the Public Key**
> ```bash
> openssl pkeyutl \
> -encrypt \
> -inkey public.pem \
> -pubin \
> -in sec.txt \
> -out topsecret.enc
> ```
>
> Encrypted output
> ```text
> topsecret.enc
> ```
>
> **Decrypt with the Private Key**
> ```bash
> openssl pkeyutl \
> -decrypt \
> -inkey private.pem \
> -in topsecret.enc
> ```
>
> Output
> ```text
> secret text
> ```
>
> > [!tip]
> > In practice, RSA is typically used to encrypt a **random symmetric key**, while the actual data is encrypted using a symmetric algorithm such as AES. This approach is known as **hybrid encryption** and is much more efficient for large amounts of data.
>
> > [!info]
> > Never expose or share the **private key**. Anyone with access to the private key can decrypt data encrypted with the corresponding public key.


```mermaid
flowchart LR

A[Plaintext]

A --> B[Public Key]

B --> C[Encrypted File]

C --> D[Private Key]

D --> E[Plaintext]
```

# Common OpenSSL Commands

| Purpose | Command |
|---------|---------|
| MD5 | `openssl md5` |
| SHA-256 | `openssl sha256` |
| Base64 Encode | `openssl enc -base64` |
| Base64 Decode | `openssl enc -d -base64` |
| AES Encrypt | `openssl enc -aes-256-cbc` |
| AES Decrypt | `openssl enc -d -aes-256-cbc` |
| Generate RSA Key | `openssl genrsa` |
| Export Public Key | `openssl rsa -pubout` |
| RSA Encrypt | `openssl pkeyutl -encrypt` |
| RSA Decrypt | `openssl pkeyutl -decrypt` |
# References

- OpenSSL Documentation
- RFC 8017 (PKCS #1)
- NIST Cryptographic Standards