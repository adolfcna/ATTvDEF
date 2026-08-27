
> [!abstract] Network Enumeration via WMI & CIM
> Using Windows Management Instrumentation (WMI) and Common Information Model (CIM) to enumerate network adapters, IP configurations, and active connections. This approach is highly stealthy as it relies on built-in WMI providers rather than standard networking tools like `ipconfig.exe` or `netstat.exe`, which are heavily monitored by EDRs.
> **MITRE ATT&CK Mapping:** [T1018 - Remote System Discovery](https://attack.mitre.org/techniques/T1018/) | [T1046 - Network Service Discovery](https://attack.mitre.org/techniques/T1046/) | [T1087 - Account Discovery](https://attack.mitre.org/techniques/T1087/)

## 1. Listing WMI Network Classes

> [!info]+ Discovering Network Classes
> You can use wildcards to find all WMI classes related to network adapters.
> 
> **Using WMI** (`gwmi`)**:**
> ```powershell
> gwmi -Class *NetworkAdapter* -List
> ```
> 
> **Using CIM** (`gcim`)**:**
> ```powershell
> get-cimClass -ClassName *NetworkAdapter*
> ```

---

## 2. Hardware Level: `Win32_NetworkAdapter`

> [!example]+ Enumerating Physical & Virtual Adapters
> The `Win32_NetworkAdapter` class provides information about the hardware itself, such as the adapter name, MAC address, physical adapter type, and connection speed.
> 
> **Basic Enumeration:**
> ```powershell
> # List all network adapters
> gwmi -Class Win32_NetworkAdapter
> gcim -Class Win32_NetworkAdapter
> ```
> 
> **Filter for Active/Physical Adapters:**
> *Filters out disabled adapters and virtual/loopback interfaces.*
> ```powershell
> # Find only enabled physical adapters
> gwmi -Class Win32_NetworkAdapter | ? { $_.NetEnabled -eq $true } | select Name, MACAddress, Speed, NetConnectionID
> ```

---

## 3. Software Level: `Win32_NetworkAdapterConfiguration`

> [!tip]+ Extracting IP, DNS, and Gateway Info
> While the previous class gives hardware info, `Win32_NetworkAdapterConfiguration`provides the actual network configuration (IP addresses, subnets, default gateways, DNS servers, and DHCP status). This is the WMI equivalent of `ipconfig /all`.
> 
> **Get IP Configuration for Active Adapters:**
> ```powershell
> # Filter for adapters that have IP enabled
> gwmi -Class Win32_NetworkAdapterConfiguration | ? { $_.IPEnabled -eq $true }
> 
> # Extract specific useful properties
> gwmi -Class Win32_NetworkAdapterConfiguration | ? { $_.IPEnabled -eq $true } | select Description, IPAddress, DefaultIPGateway, DNSServerSearchOrder, MACAddress
> ```
> 
> **Using CIM:**
> ```powershell
> gcim -ClassName Win32_NetworkAdapterConfiguration | ? { $_.IPEnabled -eq $true } | select IPAddress, DefaultIPGateway, DNSServerSearchOrder
> ```

---

## 4. Routing & Active Connections

> [!bug]+ Network Routes & TCP States (Alternatives to `route print` & `netstat`)
> Attackers can use WMI to view the routing table and active TCP connections to map the network and identify lateral movement opportunities.
> 
> **1. IP Routing Table:**
> *Equivalent to `route print`.*
> ```powershell
> gwmi -Class Win32_IP4RouteTable
> 
> # View specific routing details
> gwmi -Class Win32_IP4RouteTable | select Destination, Mask, NextHop
> ```
> 
> **2. Active TCP Connections:**
> *Equivalent to `netstat -ano`.*
> ```powershell
> # Enumerate active TCP connections (Local/Remote IPs and Ports, and Process ID)
> gwmi -Namespace root\StandardCimv2 -Class MSFT_NetTCPConnection | select LocalAddress, LocalPort, RemoteAddress, RemotePort, State, OwningProcess
> ```
> 
> **3. Mapped Network Drives (SMB Shares):**
> *Equivalent to `net use`.*
> ```powershell
> gwmi -Class Win32_NetworkConnection | select LocalName, RemoteName, UserName
> ```

> [!warning] OPSEC & Detection Notes
> - **Stealth:** Querying `Win32_NetworkAdapterConfiguration` executes entirely in-memory via the `WmiPrvSE.exe` process. It does not spawn `ipconfig.exe` or `netstat.exe`, making it an excellent technique for stealthy network mapping in heavily monitored environments.
> - **Remote Execution:** All these commands can be executed against remote machines by adding `-ComputerName <IP> -Credential domain\user`, generating standard WMI DCOM (Port 135) network logons (Event ID 4624 Type 3).

