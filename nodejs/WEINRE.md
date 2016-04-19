# Weinre

> How to debug Kidoju.Widgets on mobile devices

## Requirements

Install weinre by executing ```npm install -g weinre```

Run ```ipconfig``` to find your <IP address>.

Add the following script tag in the head of the html page you want to debug:

```<script src="http://<IP address>:8080/target/target-script-min.js#anonymous"></script>```
 
## Debugging

### Launch Weinre

Run ```weinre --boundHost <IP address>``` in a terminal window.

Launch the Weinre debugger in Chrome on your desktop at ```http://<IP Address>:8080/client/#anonymous```

### Launch your web page

Run ```node nodejs/http.server 8081``` in another terminal window.

Launch the web page on your mobile device at ```http://<IP Address>:8081/src/<page>.html``` 

## Documentation

See:

- https://people.apache.org/~pmuellr/weinre-docs/latest/
- http://stackoverflow.com/questions/15956974/setting-up-weinre-remote-debugging

