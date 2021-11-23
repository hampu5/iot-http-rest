require 'socket'

host = 'localhost'
port = 1883

server = TCPServer.new(host, port)
puts "Listening on #{host}:#{port}"

loop do
    client = server.accept
    data_string = client.recv(64) # 32 Bytes, can be less
    data = data_string.bytes

    counter = 0

    # First Byte
    packet_type = data[counter] >> 4
    dup_flag = (0x0F & data[counter]) >> 3
    qos_level = (0b00000111 & data[counter]) >> 1
    retain = (0b00000001)
    counter += 1

    # Second Byte
    remaining_length = data[counter]
    counter += 1

    # Third and Fourth Bytes (length in connect/publish, ID in subscribe/unsubscribe)
    msb = data[counter]
    counter += 1
    lsb = data[counter]
    total_length = (msb << 8) | lsb
    counter += 1

    # Optional Header data (protocol name in Connect)
    header_data = ''
    for i in 0..total_length do
        header_data += data_string[counter]
        counter += 1
    end

    # Protocol version (in connect)
    protocol_version = data[counter]
    counter += 1

    # Flags (in connect)
    flags = data[counter]

    # Keep alive (in connect)
    keep_alive_msb = data[counter]
    counter += 1
    keep_alive_lsb = data[counter]
    keep_alive = (keep_alive_msb << 8) | keep_alive_lsb
    counter += 1

    puts keep_alive
    # puts client.addr
    # puts data
    response = [0x20, 0x02, 0x00, 0x00].pack('C*')
    client.puts response
    # client.close
end

socket.close