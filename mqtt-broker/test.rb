require './MQTTBroker'

topics = Topics.new
topics.publish_to('sensor', 5, 'Test')

topics.publish_to('sensor', 9, 'Test2')

