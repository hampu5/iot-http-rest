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

class MQTTClientConnection
    def initialize(client)
        @client = client
        @client_id = ''
        @topics = {'sensor' => 5}
    end

    def receive(connected_clients)
        loop do
            # Wait for data from the client
            data_string = @client.recv(64) # 32 Bytes, can be less
            data = data_string.bytes
            puts "Got message from socket #{@client.peeraddr[2]}:#{@client.peeraddr[1]}"
            counter = 0
    
            # First Byte (first 4 bits)
            packet_type = data[counter] >> 4
        
            response = ''
            
            case packet_type
            when TYPE::CONNECT
                response = handle_connect(data, data_string, connected_clients, counter)
            when TYPE::SUBSCRIBE
                response = handle_subscribe(data, data_string, connected_clients, counter)
            when TYPE::PINGREQ
                response = handle_ping()
            when TYPE::DISCONNECT
                @connected_clients.delete(@client_id)
                @client.close
            else
                response = 'Could not process request!'
            end
            
            @client.write(response)
        end
    end

    def handle_connect(data, data_string, connected_clients, counter)
        # First Byte (second 4 bits)
        dup_flag = (0x0F & data[counter]) >> 3
        qos_level = (0b00000111 & data[counter]) >> 1
        retain = (0b00000001)
        counter += 1

        # Second Byte
        remaining_length = data[counter]
        counter += 1
    
        # Third and Fourth Bytes (length in connect/publish)
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
        start_of_payload_byte = counter
        for i in 0..(remaining_length - start_of_payload_byte) do
            @client_id += data_string[counter]
            counter += 1
        end

        # Add client to list of connected clients in broker
        connected_clients[@client_id] = [@client, []]

        # Response
        return [0x20, 0x02, 0x00, 0x00].pack('C*')
    end

    def handle_subscribe(data, data_string, connected_clients, counter)
        # First Byte (second 4 bits)
        dup_flag = (0x0F & data[counter]) >> 3
        qos_level = (0b00000111 & data[counter]) >> 1 # Should be 1
        retain = (0b00000001)
        counter += 1
        
        # Second Byte
        remaining_length = data[counter]
        counter += 1

        # Third and Fourth Bytes (packet ID in subscribe/unsubscribe)
        packet_id_msb = data[counter]
        counter += 1
        packet_id_lsb = data[counter]
        packet_id = (packet_id_msb << 8) | packet_id_lsb
        counter += 1

        # Fifth and Sixth Bytes - Payload length (in connect)
        payload_length_msb = data[counter]
        counter += 1
        payload_length_lsb = data[counter]
        payload_length = (payload_length_msb << 8) | payload_length_lsb
        counter += 1

        # Payload - Topic Filter
        topic = ''
        for i in 0..payload_length-1 do
            topic += data_string[counter]
            counter += 1
        end
        
        # Last Byte (doesn't seem to work)
        last_qos = data[counter]
        
        if @topics.key?(topic)
            @topics[topic] = nil # No value yet
            # Add topic to this client in connected clients in broker
            connected_clients[@client_id][1].push(topic)
        end

        return [0x90, 0x03, packet_id_msb, packet_id_lsb, 0x01].pack('C*') # Success Maximum QoS 1
    end

    def handle_ping()
        puts 'This was a ping'
        return [0xD0, 0x00].pack('C*')
    end
end

class MQTTBroker
    def initialize(host, port)
        @tcp_host = host
        @tcp_port = port
        @tcp_server = TCPServer.new(@tcp_host, @tcp_port)
        @connected_clients = {}
        @topics = {'sensor' => 5} #Create one for testing
    end

    def listen()
        puts "Listening on #{@tcp_host}:#{@tcp_port}"
        loop do
            Thread.start(@tcp_server.accept) do |client|
                puts "TCP client connected: #{client.peeraddr[2]}:#{client.peeraddr[1]}"
                client_connection = MQTTClientConnection.new(client)
                # client_id = ''
                client_connection.receive(@connected_clients)
                
            end
        end
    end
end



# server.close