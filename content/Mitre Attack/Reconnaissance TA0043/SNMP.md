[[content/Mitre Attack/Reconnaissance TA0043/ENUMERATION]]

nmap:
	`~# nmap -sU 161 --script snmp-processes
	`~# nmap -sU 161 --script snmp-*
	
Snmp tools for Enum:
snmpenum:
  `~# snmpenum x.x.x.x  comunity /usr/share/snmpenum/{cisco.txt,linux.txt,...}
snmpwalk:
  `~# snmpwalk -v1 -c public | private -t 10 172.20.10.1
  `~# snmpwalk -v2c -c public | private -t 10 172.20.10.1
   `~# snmpwalk -v1 -c public | private 172.20.10.1 OID
   `NOTE: OID --> /usr/share/snmpenum/{cisco.txt,linux.txt,...}
snmp-check
  `~# snmp-check -c public | privet x.x.x.x
onesixtyone
  `~# echo public > community;echo private >> community; echo manager >> community
  `~# for ip in $(seq 1 254);do echo 172.20.10.$ip; done > ips
  `~# onesixtyone -c community -i ips
  MSFconsole scan
	`msf6> use  auxiliary/scanner/snmp/snmp_enum

Brutforce: https://attack.mitre.org/techniques/T1110
	`msfconsole -q
	`auxiliary/scanner/snmp/snmp_login
	`set rhost 
	`set thread 11
