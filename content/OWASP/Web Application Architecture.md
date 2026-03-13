
> [!info] Web Application Architecture
> 
>```mermaid
>flowchart TD
>	subgraph Client Side
>	    B1(chrome 
>	    HTML/CSS,JavaScript,Cookies,storage)
>	    B2(firefox 
>	    HTML/CSS,JavaScript,Cookies,storage)
>	    B3(Onion 
>	    HTML/CSS,JavaScript,Cookies,storage)
>	end
>	
>	subgraph Server Side
>	    WS[Web Server<br>Nginx,Apache,iis]
>	    AS[Application Server<br>Node.js,php,Django,GO]
>	end
>	
>	subgraph Data Layer
>	    DB[(Database)]
>	end
>	
>	B3 --> WS
>	B2 --> WS
>	B1 --> WS
>	WS --> AS
>	AS --> WS
>	AS --> DB
>	DB --> AS
>```
>1. **User**
>
>   The user is the individual who interacts with the system through a client device such as a desktop computer, laptop, tablet, or smartphone. The user initiates actions like accessing a website, requesting resources, submitting forms, or interacting with application features.
>
>2. **Browser**
>
>   The user communicates with the web infrastructure through a web browser (such as Chrome, Firefox, Edge, or Tor Browser). The browser sends **HTTP/HTTPS requests** to the server and receives responses. It is responsible for rendering the user interface by parsing **HTML**, applying **CSS styles**, and executing **JavaScript code**. It also manages client-side data such as **cookies, local storage, and session storage**.
>
>3. **Web Server (Apache / Nginx / IIS)**
>
>   The web server acts as the entry point of the server-side infrastructure. It receives incoming HTTP/HTTPS requests from client browsers and performs several important tasks:
>
>   - Managing and maintaining HTTP connections
>   - Serving static resources such as **HTML files, CSS stylesheets, JavaScript files, images, and media**
>   - Performing **TLS/SSL termination** for secure HTTPS communication
>   - Acting as a **reverse proxy** that forwards dynamic requests to the application server
>   - Handling request routing, logging, and basic security controls
>
>4. **Web Application (Frontend + Backend)**
>
>   The web application is responsible for processing the main logic of the system and generating responses for users. It consists of two main components:
>
>   - **Frontend:** The client-side interface that runs in the user's browser. It defines how the application appears and behaves from the user's perspective using technologies such as **HTML, CSS, and JavaScript**.
>
>   - **Backend:** The server-side component that handles application logic and processes incoming requests from the web server. It performs tasks such as **input validation, authentication, authorization, session management, business logic processing, and communication with databases or external services**. Backend systems are typically implemented using technologies such as **PHP, Go, Python (Django/Flask), Node.js, or Java frameworks**.

