
`PS > ipmo powersploit.psd1

`PS > Get-HTTPStatus -Target google.com -Path \PowerSploit\Recon\Dictionaries\admin.txt -Port 80 

`PS > Get-HTTPStatus -Target google.com -Path \PowerSploit\Recon\Dictionaries\admin.txt -Port 80 | ? {$_.Status -Match "Ok"}


resource : https://github.com/PowerShellMafia/PowerSploit
