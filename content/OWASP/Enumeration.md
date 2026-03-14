---
title: Enumeration
draft:
tags:
  - Enumeration
  - Web
  - owasp
related:
  - /OWASP
---

## Passive 

> [!success]- Google Dork (Google Hacking)
>
>**Google Dorking** is a passive reconnaissance technique that uses advanced Google search operators to discover hidden or sensitive information about a target website.
>
>Instead of interacting directly with the target system, the attacker leverages Google's indexed >data to gather intelligence such as subdomains, exposed files, directories, and internal pages.
>
>This technique is commonly used during **passive information gathering** in penetration testing and red teaming.
> ```
> site:example.com
> ```
>
> ```
> site:*.example.com
> ```
>
> ```
> site:example.com inurl:admin
> ```
>
> ```
> site:example.com filetype:pdf
> ```
>
> ```
> intitle:"index of"
> ```
>
> ```
> cache:example.com
> ```
> #### Additional Resources
>
>The **Google Hacking Database (GHDB)** maintained by Offensive Security contains many useful Google Dorks for discovering exposed data and vulnerabilities.
>
>https://www.exploit-db.com/google-hacking-database

> [!success]- DNS
>
>> ### Whois
>> ```
>> whois example.com
>> ```
>
>>  ### Host
>> ```
>> host example.com
>> ```
> 
>> ### dnsrecon
>> ```
>>dnsrecon -d example.com
>> ```
>
>>  ### Online Recon
>>
>> ```
>> https://www.netcraft.com
>> ```
>>
>> ```
>> https://www.whois.com
>> ```
>>
>> ```
>> https://dnsdumpster.com
>> ```

> [!success]- WAF Detection
> ```
> whatweb example.com
> ```
> ```
> wafw00f -a example.com
> ```

> [!success]- Download Web
> ```
> httrack
> ```
> ```
> eyewitness --web -f domains.txt -d /home/usr/path
> ```

> [!success]- Amass
> ```
> amass enum --passive -d zonetransfer.me
> ```
> ```
> amass enum --passive -d zonetransfer.me -src -dir /user/home/path
> ```

## Active

> [!danger]- CURL 
> ```
> curl -v http://Example.com
> ```
> ```
> curl -v -X OPTIONS http://Example.com
> ```
> ```
> curl -v -I http://Example.com
> ```
> ```
> curl -v http://example.com/upload --upload-file /usr/share/backdor.php
> ```

> [!danger]- DNS
> ### DNSENUM
> ```
> dnsenum zonetransfer.me
> ```
> ### FIERCE
>```
>fierce -dns zonetransfer.me 
>``` 
> ### DIG
> ```
>dig -axfr <@DNSServer> <Domain>
> ```
> ```
> dig -axfr @nsztm1.digi.ninja zonetransfer.me
> ```

> [!danger]- Directory Enumeration
> ### DIRB
> ```
> dirb https://example.com
> ``` 
> ```
> dirb https://example.com /usr/share/metasploit-framework/data/wordlists/directory.txt
> ``` 
> ### GOBUSTER
> ```
> gobuster dir -u https://example.com -w /usr/share/wordlist/dirb/common.txt
> ```
> ```
> gobuster dir -u https://example.com -w /usr/share/wordlist/dirb/common.txt -b 404,403
> ```
> ```
> > gobuster dir -u https://example.com -w /usr/share/wordlist/dirb/common.txt -b 404,403 -x .php,.txt,.xml -r
> ```
> ### SUBLIST3R
> ```
> sublist3r -d hackersploit.org
> ```
> ```
> sublist3r -d hackersploit.org -e google
> ```
> ### FIERCE
> ```
>  fierce --domain hackersploit.org --subdomain-file /usr/share/seclist/DNS/fierce-hostlist.txt
> ```
>### Robots.txt Directive
>
>The **robots.txt** file is a standard used by websites to communicate with web crawlers and search engine bots. It defines which parts of a website should or should not be accessed by automated agents.
>This file is usually located at the root of a website:
>`https://example.com/robots.txt`
>```
>User-agent: *
>Disallow: /admin/
>Disallow: /backup/
>Allow: /public/
>Sitemap: https://example.com/sitemap.xml
>```
>### SiteMap
>
>`sitemap_index.xml` is an XML file that lists multiple sitemap files for a website. It helps search engines discover and organize large numbers of URLs more efficiently.
>
>Instead of containing page URLs directly, a sitemap index points to other sitemap files.
> ```
> https://example.com/sitemap.xml
> ```
>
> ```
> https://example.com/sitemap_index.xml
> ```
>Typical location:
>```
><sitemapindex>
>  <sitemap>
>    <loc>https://example.com/post-sitemap.xml</loc>
>  </sitemap>
>  <sitemap>
>    <loc>https://example.com/page-sitemap.xml</loc>
></sitemap>
></sitemapindex>
>```

> [!danger]- Nmap
> ```
> nmap -sV -p 443,80 <IP>
> ```
> ```
> ls /usr/share/nmap/scripts | grep -e "http-"
> ls /usr/share/nmap/scripts | grep -e "apache"
> ```
> ```
> nmap -sV -p 80,443 --script http-enum <IP> 
> ```

> [!danger]- MSF
> ```
> msfconsole
> 	search auxiliary/scanner/http/http_version
> 	use 0
> 	show options
> 	set RHOST <IP>
> 	set RPORT 80
> 	run -j
> ```

>[!danger]- Nikto
>```
>nikto -h https://hackersploit.org 
>```
>```
>nikto -h https://hackersploit.org -Format htm -o hackersploit.org.html
>```

> [!danger]- Amass
> ```
> amass enum -d zonetransfer.me -src -ip -brute -dir /user/home/path
> ```
