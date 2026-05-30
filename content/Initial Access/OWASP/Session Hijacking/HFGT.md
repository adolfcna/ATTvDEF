
**Definition:**  
Attacker **steals a valid active session ID** of a logged-in user and uses it to impersonate them.

**Key Idea:**  
```
Steal existing session
```

**When:**  
After the victim logs in.

>[!danger] Example
>1. Victim logs in to a website.
>
>```
>Set-Cookie: PHPSESSID=ABC123XYZ
>```
>
>2. The browser sends this cookie in every request.
>
>```
>GET /dashboard
>Cookie: PHPSESSID=ABC123XYZ
>```
>
>3. Attacker steals the session ID (for example via XSS).
>
>```
>document.cookie → PHPSESSID=ABC123XYZ
>```
>
>4. Attacker uses the stolen session.
>
>```
>GET /dashboard
>Cookie: PHPSESSID=ABC123XYZ
>```
>
>5. The server thinks the attacker **is the victim** because the session is valid.
>
>**Result:**
>```
>Attacker gains access to victim's account without login.
>```

---

## Session Fixation

**Definition:**  
Attacker **forces the victim to use a session ID chosen by the attacker**, then waits for the victim to log in with that session.

**Key Idea:**  
```
Set session before login
```

**When:**  
Before authentication.

>[!info] Example
>
>1. Attacker creates a session on the target site.
>
>```
>PHPSESSID=FIXED123
>```
>
>2. Attacker sends a phishing link to the victim:
>
>```
>https://target.com/login?PHPSESSID=FIXED123
>```
>
>3. Victim opens the link and logs in.
>
>4. The server **does not regenerate the session ID after login**.
>
>5. Attacker uses the same session.
>
>```
>Cookie: PHPSESSID=FIXED123
>```
>
>**Result**
>
>```
>Attacker gets access to the victim's logged-in session.
>```


---

## Session Prediction / Guessing

**Definition:**  
Attacker **predicts or brute-forces valid session IDs** because the application generates them in a weak or predictable way.

**Key Idea:**  
```
Guess session ID
```

>[!example] Example
>
>The application generates weak session IDs like:
>
>```
>session1001
>session1002
>session1003
>```
>
>Attacker tries to guess valid sessions:
>
>```
>Cookie: SESSIONID=session1001
>Cookie: SESSIONID=session1002
>Cookie: SESSIONID=session1003
>```
>
>If one belongs to a logged-in user:
>
>```
>Access granted
>```
>
>**Result**
>
>```
>Attacker logs in without credentials by guessing a valid session ID.
>```

---

## Session Tampering

**Definition:**  
Attacker **modifies session data or tokens** (cookies, JWT, parameters) to change privileges or behavior.

**Key Idea:**  
```
Modify session data
```

>[!Danger] Example
>
>1. After login, the server sets a cookie:
>
>```
>Cookie: role=user
>```
>
>2. The browser sends it with requests:
>
>```
>GET /dashboard
>Cookie: role=user
>```
>
>3. Attacker modifies the cookie in the request:
>
>```
>GET /admin
>Cookie: role=admin
>```
>
>4. If the server **does not validate the role on the server-side**, it trusts the cookie.
>
>**Result**
>
>```
>Attacker gains admin privileges by modifying session data.
>```

> [!success] **Ultra‑short comparison (Pentester view)**
>
>```
>Session Hijacking  → Steal session
>Session Fixation   → Set session
>Session Prediction → Guess session
>Session Tampering  → Modify session
>```


