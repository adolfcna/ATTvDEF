
`PS > New-Item -Type File $home\Desktop\salam.txt
`PS > New-Item -Type Directory C:\$home\Desktop\dirname

`PS > New-Item -Type SymbolicLink -Path C:\Users\CNA\Desktop\file -Target C:\Windows\system32\cmd.exe
`PS > New-Item -Type Junction -Path C:\file\dir1 -Target C:\target\dd2
`PS > New-Item -Type HardLink -Name LinkPath -target TargetFilePath

`PS > Delete-Item hkcu:\software\somekey\somevalue 
`PS > Rename-Item hkcu:\software\somekey otherkey