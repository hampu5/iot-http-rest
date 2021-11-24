require './MQTTBroker'

host = 'localhost'
port = 1883

broker = MQTTBroker.new(host, port)
broker.listen()