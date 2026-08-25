[[content/Mitre Attack/Reconnaissance TA0043/ENUMERATION]]
- IP :
	- host discover:
	- nmap
	- netdiscover -i wlan0 -r 192.168.10.0/24
	- arp-scan -I wlan0 -g 192.168.10.0/24
	- fping -I wlan0 -ga 192.168.10.0/24 2>/dev/null
	- nmap -sn 192.168.10.0/24

------------------------------------------------------------------------

Nmap : 
	`nmap -Pn -sV -O 94.182.182.2 -oX file 
	`msfconsole -q
	`msf5> workspace -a windowsServer2009
    `msf5> db_import file
    `msf5> services
    `msf5> hosts



Active sniffing:
- Mac Flooding : macof
- DNS poisoning : Ettercap , Evilgrade, DNS-poison , DNS Spoof
- ARP poisoning : Arpspoof , Habu
- DHCP Attacks : yersinia // for dhcp starvation , dhcpig dhcpiw // for rogue dhcp
- Switch port stealing
- Spoofing Attack

vulnerable protocol to sniffing
-----------------------------------------------------------------------------------------------
IMAP, POP, SMTP
SNMP
NNTP
TELNET, Rlogin
FTP
HTTP


Arpspoof:
	`~# apt install dsniff
	`~# sysctl -a | grep ipv4.ip_forward
	`~# sysctl -w net.ipv4.ip_forward= 1 
	`~# arpspoof -i wlp7s0 -t <target> -r <spoof ip>
	`~# arpspoof -i wlp7s0 -t -r
Habu
	`# habu.arp.poison <IP> <IP>

Switch to Hub:
	`~# macof -i wlp7s0 -n 100
DHCP starvation
	`~# yersinia -I 

How to detect promiscuous mode :
	`~# nmap --script sniffer-detect <IP>


