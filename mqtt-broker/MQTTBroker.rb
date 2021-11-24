require 'socket'

module TYPE
    CONNECT = 1
    CONNACK = 2
    PUBLISH = 3
    PUBACK = 4 # Try with simple ACK only
    SUBSCRIBE = 8
    SUBACK = 9
    UNSUBSCRIBE = 10
    UNSUBACK = 11
    PINGREQ = 12
    PINGRESP = 13
    DISCONNECT = 14
end

class MQTTBroker
    def initialize(host, port)
        @tcp_host = host
        @tcp_port = port
        @tcp_server = TCPServer.new(@tcp_host, @tcp_port)
        @connected_clients = {}
    end

    def listen()
        puts "Listening on #{@tcp_host}:#{@tcp_port}"
        loop do
            Thread.start(@tcp_server.accept) do |clientp|
                client = clientp
                puts "Client connected: #{client.peeraddr[2]}:#{client.peeraddr[1]}"
                loop do
                    # Wait for data from the client
                    data_string = client.recv(64) # 32 Bytes, can be less
                    # if data_string.length == 0
                    #     next
                    # end
                    data = data_string.bytes
                    puts "Got message from socket #{client.peeraddr[2]}:#{client.peeraddr[1]}"
                    counter = 0
            
                    # First Byte
                    packet_type = data[counter] >> 4
                    dup_flag = (0x0F & data[counter]) >> 3
                    qos_level = (0b00000111 & data[counter]) >> 1
                    retain = (0b00000001)
                    counter += 1
                
                    response = ''
                    
                    case packet_type
                    when TYPE::CONNECT
                        response = handle_connect(data, data_string, client, counter)
                    when TYPE::PINGREQ
                        response = handle_ping(data, data_string, client, counter)
                    when TYPE::DISCONNECT
                        client.close
                    else
                        response = 'Could not process request!'
                    end
                    
                    client.write(response)
                end
            end
        end
    end

    def stop_listening()
        @connected_clients.each_value do |client|
            client.close
        end
    end

    def handle_connect(data, data_string, client, counter)
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

        # Optional Payload (client ID)
        payload_data = ''
        start_of_payload_byte = counter
        for i in 0..(remaining_length - start_of_payload_byte) do
            payload_data += data_string[counter]
            counter += 1
        end
        
        if !@connected_clients[payload_data]
            @connected_clients[payload_data] = client
        end

        # Response
        return [0x20, 0x02, 0x00, 0x00].pack('C*')
    end

    def handle_ping(data, data_string, client, counter)
        puts 'This was a ping'
        return [0xD0, 0x00].pack('C*')
    end
end



# server.close