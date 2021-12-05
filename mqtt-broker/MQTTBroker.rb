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

# Class that holds a value for a topic and its subscribers
class Topic
    def initialize(topic, value)
        @topic = topic
        @value = value
        @clients = []
    end

    def change_value(value)
        @value = value
    end

    def add_client(client)
        @clients.append(client)
    end

    def remove_client(client)
        @clients.delete(client)
    end
end

class Topics
    def initialize()
        @topics = []
    end

    def publish_to(topic, value)
        @topics.append(Topic.new(topic, value))
    end

    def remove_client(client)


# This class represents a connected client
class MQTTClientConnection
    def initialize(client)
        @client = client # Socket to client
        @client_id = ''
        @topics = {}
    end

    def receive(connected_clients, topics)
        loop do
            # Wait for data from the client
            data_string = @client.recv(64) # 32 Bytes, can be less
            data = data_string.bytes
            # puts "Got message from socket #{@client.peeraddr[2]}:#{@client.peeraddr[1]}"
            counter = 0
    
            # First Byte (first 4 bits)
            packet_type = data[counter] >> 4
        
            response = ''
            
            case packet_type
            when TYPE::CONNECT
                response = handle_connect(data, data_string, connected_clients, counter)
            when TYPE::PUBLISH
                response = handle_publish(data, data_string, connected_clients, topics, counter)
            when TYPE::SUBSCRIBE
                response = handle_subscribe(data, data_string, connected_clients, topics, counter)
            when TYPE::UNSUBSCRIBE
                response = handle_unsubscribe(data, data_string, connected_clients, counter)
            when TYPE::PINGREQ
                response = handle_ping()
            when TYPE::DISCONNECT
                puts 'Disconnect!'
                connected_clients.delete(@client_id)
                topics.each do |e_topic|
                    puts e_topic
                    topics[e_topic][1].delete(@client_id)
                end
                @client.close
                return
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
        connected_clients[@client_id] = @client

        # CONNACK
        return [0x20, 0x02, 0x00, 0x00].pack('C*')
    end

    def handle_publish(data, data_string, connected_clients, topics, counter)
        # First Byte (second 4 bits)
        dup_flag = (0x0F & data[counter]) >> 3
        qos_level = (0b00000111 & data[counter]) >> 1 # Should be 1
        retain = (0b00000001)
        counter += 1

        # Second Byte
        remaining_length = data[counter]
        counter += 1
        
        # Third and Fourth Bytes (length in connect/publish)
        topic_length_msb = data[counter]
        counter += 1
        topic_length_lsb = data[counter]
        topic_length = (topic_length_msb << 8) | topic_length_lsb
        counter += 1

        # Topic characters
        topic = ''
        for i in 0..topic_length-1 do
            topic += data_string[counter]
            counter += 1
        end

        # Payload (Value that is published)
        payload = ''
        start_of_payload_byte = counter
        for i in 0..(remaining_length - start_of_payload_byte) do
            payload += data_string[counter]
            counter += 1
        end

        # If the topic is registered in the broker
        if topics.key?(topic)
            # If the topic is registered for this client
            if @topics.key?(topic)
                # Just change the value for this topic
                topics[topic][0] = payload
            else
                # Change the value of the topic and add this client as a subscriber
                topics[topic] = [payload, topics[topic][1].append(@client_id)]
                # Add the topic to this clients topics
                @topics[topic] = payload
            end
        else
            # Add the value and add the client as the first subscriber
            topics[topic] = [payload, [@client_id]]
            # Add the topic to this clients topics
            @topics[topic] = payload
        end

        # Publish new value to each subscriber
        topics[topic][1].each { |x| connected_clients[x].write(data_string) }

        # PUBACK
        return
    end

    def handle_subscribe(data, data_string, connected_clients, topics, counter)
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

        # Fifth and Sixth Bytes - Topic length
        topic_length_msb = data[counter]
        counter += 1
        topic_length_lsb = data[counter]
        topic_length = (topic_length_msb << 8) | topic_length_lsb
        counter += 1

        # Payload - Topic Filter
        topic = ''
        for i in 0..topic_length-1 do
            topic += data_string[counter]
            counter += 1
        end
        
        # Last Byte (doesn't seem to work)
        last_qos = data[counter]
        
        # If the topic is registered in the broker
        if topics.key?(topic)
            # If the topic isn't registered for this client
            if !@topics.key?(topic)
                # Add this client as a subscriber
                topics[topic][2] = topics[topic][1].append(@client_id)
                # Add the topic to this clients topics
                @topics[topic] = nil
            end
        else
            # Add the value nil and add the client as the first subscriber
            topics[topic] = [nil, [@client_id]]
            # Add the topic to this clients topics
            @topics[topic] = nil
        end

        # SUBACK
        return [0x90, 0x03, packet_id_msb, packet_id_lsb, 0x01].pack('C*') # Success Maximum QoS 1
    end

    def handle_unsubscribe(data, data_string, connected_clients, counter)
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

        # Fifth and Sixth Bytes - Topic length
        topic_length_msb = data[counter]
        counter += 1
        topic_length_lsb = data[counter]
        topic_length = (topic_length_msb << 8) | topic_length_lsb
        counter += 1

        # Payload - Topic Filter
        topic = ''
        for i in 0..topic_length-1 do
            topic += data_string[counter]
            counter += 1
        end

        # UNSUBACK
        return [0xB0, 0x02, packet_id_msb, packet_id_lsb].pack('C*')
    end

    def handle_ping()
        # puts 'This was a ping'
        # PINGRESP
        return [0xD0, 0x00].pack('C*')
    end
end

class MQTTBroker
    def initialize(host, port)
        @tcp_host = host
        @tcp_port = port
        @tcp_server = TCPServer.new(@tcp_host, @tcp_port)
        @connected_clients = {}
        # @topics = {'sensor' => 5} #Create one for testing
        @topics = {}
    end

    def listen()
        puts "Listening on #{@tcp_host}:#{@tcp_port}"
        loop do
            Thread.start(@tcp_server.accept) do |client|
                puts "TCP client connected: #{client.peeraddr[2]}:#{client.peeraddr[1]}"
                client_connection = MQTTClientConnection.new(client)
                # client_id = ''
                client_connection.receive(@connected_clients, @topics)
                
            end
        end
    end
end



# server.close