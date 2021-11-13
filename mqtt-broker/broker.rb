require 'socket'

host = 'localhost'
port = 1883

server = TCPServer.new(host, port)
puts "Listening on #{host}:#{port}"

loop do
    client = server.accept
    data = client.recv(32) # 32 Bytes, can be less
    puts data
    client.puts "Your data: #{data}"
    client.close
end

socket.close