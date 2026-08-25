
> [!abstract] Network Sniffing & MITM Attacks
> Techniques for intercepting network traffic, poisoning ARP/DHCP tables, and detecting sniffers on the network.
## Vulnerable Protocols

> [!warning] Protocols Susceptible to Sniffing
> These protocols transmit data (including credentials) in cleartext. If you are in a Man-in-the-Middle position, you can easily capture this traffic:
> - **Email:** IMAP, POP, SMTP
> - **Management:** SNMP, NNTP
> - **Remote Access:** Telnet, Rlogin
> - **File Transfer:** FTP
> - **Web:** HTTP
## Active Sniffing & Spoofing Attacks

> [!danger]+ ARP Poisoning (MITM)
> Redirect traffic between a victim and the gateway through the attacker's machine.
> 
> **Prerequisites:** Enable IP forwarding on the attacker's machine.
> ```bash
> # Install dsniff suite
> apt install dsniff
> 
> # Check and enable IP forwarding
> sysctl -a | grep ipv4.ip_forward
> sysctl -w net.ipv4.ip_forward=1
> 
> # Run arpspoof (Bi-directional)
> arpspoof -i wlp7s0 -t <target_ip> -r <gateway_ip>
> ```
> 
> **Alternative Tool (Habu):**
> ```bash
> habu.arp.poison <victim_ip> <gateway_ip>
> ```

> [!danger]+ MAC Flooding (Switch to Hub)
> Overwhelm a switch's CAM table with fake MAC addresses. The switch fails open and acts like a hub, broadcasting all traffic to all ports.
> ```bash
> macof -i wlp7s0 -n 100
> ```

> [!danger]+ DHCP Starvation & Rogue DHCP
> Exhaust the DHCP server's IP pool to prevent legitimate users from connecting, or to assign malicious gateway/DNS settings.
> ```bash
> # Interactive mode for DHCP starvation
> yersinia -I
> ```
> *Other tools: `dhcpig`, `dhcpiw` (for rogue DHCP)*

> [!info] Other Active Sniffing Techniques
> - **DNS Poisoning:** Tools include `Ettercap`, `Evilgrade`, `DNS-poison`, `DNS Spoof`.
> - **Switch Port Stealing**
## Defensive Detection

> [!success] Detecting Promiscuous Mode (Sniffers)
> If an interface is in promiscuous mode, it is likely sniffing traffic. Nmap can detect this remotely.
> ```bash
> nmap --script sniffer-detect <IP>
> ```

