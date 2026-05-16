In command injection, a web application generate bash commands, including data from client. A malicious user adds custom command that **modify** the normal operation of the web application. In a short word, unsafe user supplied data to system shell. the severity is commonly considered as a critical issue.

![[Pasted image 20260516180351.png]]

But why web application need to interact with shell? there are many scenarios:
- Converting an image
- Calling External web service
- Converting video
- Calling a binary

> [!Example]+ video_name comes from user input
> ```
> os.system("/bin/ffmpeg -i {} -c:a copy -c:v vp9 -r 30 /files/user/{}/videos".format(video_name,session.get('user_id')))
>```
