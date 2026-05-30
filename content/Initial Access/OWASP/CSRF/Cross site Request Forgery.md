it's called `CSRF` in Mitre Attack, categorized as Broken Access Control in **OWASP TOP 10 2026**. what is it?
- it forces and end-user to execute unwanted actions on a web application in which they're currently authenticated
- the action should be state-changing, such as update profile, change password, etc
- how can attackers force a user send HTTP request? it's simple, we've learned it before 
- the authentication system should work with cookies, if `SameSite`  is enabled, an `XSS` is Needed on any subdomain to exploit the flaw
- can any HTTP request be CSRFed? Can attackers forge any HTTP request? NO, it should be simple HTTP request
- the SOP still exists, although the attacker doesn't need the response (action has done)
