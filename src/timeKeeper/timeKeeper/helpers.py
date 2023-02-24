import socket

def get_ipaddress(): 
    
   host_name = socket.gethostname()
   ip_address = socket.gethostbyname(host_name)
   return "http://"+ip_address+""