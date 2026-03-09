META approval stopped me from deploying this due to needing a verified business connected.

the idea: 
Receive an Instagram message containing a user’s email address and requested workout PDF. 
A webhook sends the message data to my server, where I use regex to extract the email address and then trigger an automated email response using sendgrid.

everything that was working:
Node/Express webhook service hosted on Render. Extracted user email text and sent PDF resources automatically via sengrid.
