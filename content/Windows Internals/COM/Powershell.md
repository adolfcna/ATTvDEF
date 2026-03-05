
> [!info] Component Object Management
> ![[Pasted image 20260301123605.png]]
> ### With ProgID
> ```
> $obj = New-Object -ComObject "Wscript.Network" 
> ```
> ```
> $obj
> ```
> ### With CLSID
> ```
> $CLSID = New-Object guid {093FF999-1EA0-4079-9525-9614C3504B74}
> ```
> ```
> $type = [type]::GetTypeFromCLSID($CLSID)
> ```
> ```
> $obj = [Activator]::CreateInstance($type)
> ```
>```
> $obj
> ```
