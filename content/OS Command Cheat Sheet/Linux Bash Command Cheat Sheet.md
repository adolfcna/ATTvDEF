
> [!abstract] Linux Pentest Command Cheat Sheet
> A quick reference guide for essential Linux commands used in penetration testing, including file transfer servers, packet capture, firewall manipulation, and remote desktop access.

## Web Server & File Transfer

> [!tip]+ Quick HTTP Server
> Spin up a quick web server to host payloads or transfer files to a victim machine.
> ```bash
> # Python 2 (Legacy)
> python -m SimpleHTTPServer 80
> 
> # Python 3
> python3 -m http.server 80
> ```

---

## User & Group Management

> [!info]+ Local User Management
> Add users, set passwords, and modify group permissions for persistence or privilege escalation.
> ```bash
> # Change password for a user
> passwd {user}
> 
> # Create a new user with a home directory and bash shell
> useradd -m EDA -s /bin/bash
> passwd EDA 
> 
> # Create a new group
> groupadd EDA
> 
> # Add user to the root group (Dangerous!)
> usermod -aG root EDA
> 
> # Change user UID
> usermod -u 15 EDA
> ```

---

## Network Sniffing (TCPDump)

> [!example]+ Packet Capture & Analysis
> Capture network traffic to a file or analyze it in real-time.
> ```bash
> # Show list of available interfaces
> tcpdump -D
> 
> # Listen on a specific interface
> tcpdump -i wlp7s0
> 
> # Write captured packets to a file
> tcpdump -i wlp7s0 -w file.pcap
> 
> # Read a pcap file (without resolving hostnames)
> tcpdump -nr file.pcap
> 
> # Read a pcap file in ASCII format
> tcpdump -nAr file.pcap
> 
> # Capture specific UDP traffic (e.g., DNS port 53)
> tcpdump -n -i eth0 udp port 53
> 
> # Extract unique destination IPs from a pcap file
> tcpdump -nr falsimentis.pcap dst host 167.172.201.123 | cut -d ' ' -f 3 | cut -d '.' -f 1-4 | sort -u
> ```
> **Flag Descriptions:**
> - `-n`: Don't resolve host names or port numbers.
> - `-r`: Read from a file.
> - `-w`: Write to a file.
> - `-A`: Print packets in ASCII.

---

## Firewall & Routing (IPTables)

> [!warning]+ IPTables (Netfilter)
> Configure Linux kernel firewall rules to allow or drop traffic.
> ```bash
> # Insert rule at position 1 to ACCEPT incoming traffic from a specific IP
> iptables -I INPUT 1 -s 172.20.10.5 -j ACCEPT
> 
> # Insert rule at position 1 to ACCEPT outgoing traffic to a specific IP
> iptables -I OUTPUT 1 -d 172.20.10.5 -j ACCEPT
> 
> # Zero the packet and byte counters on all rules
> iptables -Z
> 
> # List all rules with verbose output and byte counters
> iptables -vn -L
> ```

---

## Text Processing (Sed)

> [!bug]+ Stream Editor (sed)
> Parse and transform text in a pipeline or file.
> ```bash
> # Delete lines that start with '1' from a file (-i for in-place editing)
> cat file.txt | sed -i '/^1/d'
> 
> # Remove empty lines from a file
> sed -i '/^$/d' file.txt
> ```

---

## Remote Access (RDP)

> [!danger]+ Remote Desktop Protocol (xfreerdp)
> Connect to a Windows RDP service from a Linux machine.
> ```bash
> # Basic RDP connection
> xfreerdp /v:targetip /u:username /p:password
> 
> # Useful flags:
> # /dynamic-resolution : Allows window resizing
> # +clipboard          : Enables copy/paste between machines
> # /drive:share,/path  : Mounts a local Linux directory into the Windows session
> xfreerdp /v:192.168.1.10 /u:Administrator /p:Password123 /dynamic-resolution +clipboard
> ```

