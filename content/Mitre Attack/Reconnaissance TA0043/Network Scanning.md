
> [!example]+ Local Network Host Discovery
> Identify live hosts on a local subnet before running deep port scans.
> ```bash
> # ARP/ICMP discovery
> nmap -sn 192.168.10.0/24
> netdiscover -i wlan0 -r 192.168.10.0/24
> arp-scan -I wlan0 -g 192.168.10.0/24
> fping -I wlan0 -ga 192.168.10.0/24 2>/dev/null
> ```

> [!tip]+ Nmap Output & Metasploit Database Integration
> Scan a target, save the output in XML format, and import it into Metasploit to manage hosts and services seamlessly.
> ```bash
> # Run Nmap and save to XML
> nmap -Pn -sV -O 94.182.182.2 -oX file.xml
> 
> # Import into Metasploit
> msfconsole -q
> msf5> workspace -a windowsServer2009
> msf5> db_import file.xml
> msf5> services
> msf5> hosts
> ```
