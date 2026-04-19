

![[481285.jpg]]


# SQL 

> [!info] Show Information
> ```sql
-- Show all available databases
SHOW DATABASES;
>```
>```sql
-- Select a specific database
USE nameofdatabase;
>```
>```sql
-- Show all tables inside the selected database
SHOW TABLES;
> ```

> [!success] Search Query
> ```sql
> SELECT <column> FROM <databasename.tablename> WHERE <condition> 
> ```
> ```sql
> -- UNION-based extraction (for SQL injection scenarios)
SELECT <column> FROM <databasename.tablename> WHERE <condition> UNION SELECT ...;
> ```

> [!example]-
> ```
> SELECT * FROM <tablename>;
> SELECT * FROM <databasename.tablename>;
> ```
> ```
> SELECT User FROM Users WHERE Id=399586;
> ```

> [!danger] Create Table  
> Use this to create a new table in the current database.
>```sql
>CREATE TABLE nikola (
>    id VARCHAR(20),
>    name VARCHAR(100),
>    age VARCHAR(2),
>    email VARCHAR(100),
>    PRIMARY KEY (id)
>    );
>```

> [!hint] Modify Data  
>
>### Insert Data  
>Add a new record into the table:
>
>```sql
INSERT INTO nikola (id, name, age, email) VALUES ("1234", "cna", "44", "example@mail.com");
>```
>
>---
>
>### Update Data  
>Modify an existing record in the table:
>
>```sql
>UPDATE databasename.tablename SET email = "notable@mail.com" WHERE id = "1234";
>```
>
>---
>
>### Delete Data  
>Remove a record from the table:
>
>```sql
>DELETE FROM databasename.tablename WHERE id = "1234";
>```
>

# NOSQL

> [!info] Show Information
> ```
> mongo
> ```
> ```
> -- show databases
> show dbs
> ```
> ```
> -- use databasesname
> use databasename
> ```
> ```
> -- show table
> show collections
> ```
> ```
> -- show information about table
> db.CollectionName.find()
> ```

> [!success] search
> ```
> db.CollectionName.find({"User":"admin"})
> ```
> ```
> db.CollectionName.count()
> ```
> ```
> -- {"id":3456,...}
> db.CollectionName.find({"id":{$gt:123}}).count()
> ```
> ```
> -- {"id":3456,"state":"ML"}
> db.CollectionName.find({$and:[{"id":{$gt:200}},{"state":"FL"}]})
> ```
> ```
> db.CollectionName.find({"state":{$regex:"^M.*"}})
> ```

