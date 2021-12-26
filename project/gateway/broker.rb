require './MQTTBroker'

host = '0.0.0.0'
port = 1883

broker = MQTTBroker.new(host, port)
broker.listen()