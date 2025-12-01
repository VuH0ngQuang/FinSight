import mqtt from 'mqtt'

export type MarketDataPayload = {
  stockId: string
  matchPrice: number
}

// In browsers, mqtt.js uses WebSocket transport automatically
// mqtts:// is converted to wss:// for secure WebSocket connections
const MQTT_BROKER_URL = 'wss://iot.vuhongquang.com:8084/mqtt'
const MQTT_TOPIC = 'market-data'

type MqttClient = ReturnType<typeof mqtt.connect>

let client: MqttClient | null = null
let subscribers: Set<(data: MarketDataPayload) => void> = new Set()
let isConnected = false

// Generate a random client ID
const generateClientId = (): string => {
  return `finsight_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`
}

export const connectMqtt = (): MqttClient => {
  if (client && client.connected) {
    return client
  }

  if (client) {
    client.end()
  }

  const clientId = generateClientId()
  console.log('Connecting with client ID:', clientId)

  // Explicitly configure for WebSocket transport (required in browsers)
  client = mqtt.connect(MQTT_BROKER_URL, {
    protocol: 'wss',
    clientId,
    keepalive: 60, // Send keepalive packets every 60 seconds
    reconnectPeriod: 5000,
    connectTimeout: 10000,
    clean: true, // Clean session
    // Prevent automatic disconnection
    will: undefined,
    // WebSocket specific options
    wsOptions: {
      // Some brokers require a specific path, try '/mqtt' or '/ws' if default doesn't work
      // path: '/mqtt',
    },
  })

  client.on('connect', () => {
    isConnected = true
    console.log('MQTT connected')
    client?.subscribe(MQTT_TOPIC, (err) => {
      if (err) {
        console.error('MQTT subscription error:', err)
      } else {
        console.log(`Subscribed to topic: ${MQTT_TOPIC}`)
      }
    })
  })

  client.on('message', (topic, message) => {
    if (topic === MQTT_TOPIC) {
      try {
        const payload = JSON.parse(message.toString()) as unknown
        if (
          typeof payload === 'object' &&
          payload !== null &&
          'stockId' in payload &&
          'matchPrice' in payload &&
          typeof (payload as MarketDataPayload).stockId === 'string' &&
          typeof (payload as MarketDataPayload).matchPrice === 'number'
        ) {
          const marketData = payload as MarketDataPayload
          subscribers.forEach((callback) => callback(marketData))
        } else {
          console.warn('Invalid MQTT payload format:', payload)
        }
      } catch (error) {
        console.error('Error parsing MQTT message:', error)
      }
    }
  })

  client.on('error', (error) => {
    console.error('MQTT error:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('Connection URL:', MQTT_BROKER_URL)
    console.error(
      'Note: In browsers, MQTT uses WebSocket transport. Ensure your broker supports WebSocket connections on this port.',
    )
    isConnected = false
  })

  client.on('close', () => {
    console.log('MQTT connection closed')
    // Log additional connection state information
    if (client) {
      console.log('Client disconnected:', !client.connected)
      console.log('Client options:', {
        protocol: client.options?.protocol,
        host: client.options?.host,
        port: client.options?.port,
      })
      console.log('Active subscribers:', subscribers.size)
    }
    isConnected = false
    
    // If there are still subscribers, try to reconnect
    if (subscribers.size > 0) {
      console.log('Attempting to reconnect due to active subscribers...')
      setTimeout(() => {
        if (subscribers.size > 0 && (!client || !client.connected)) {
          console.log('Reconnecting MQTT...')
          connectMqtt()
        }
      }, 2000)
    }
  })

  client.on('end', () => {
    console.log('MQTT client ended (connection terminated)')
    isConnected = false
  })

  client.on('offline', () => {
    console.log('MQTT client offline')
    isConnected = false
  })

  // Handle reconnection
  client.on('reconnect', () => {
    console.log('MQTT reconnecting...')
  })

  return client
}

export const disconnectMqtt = () => {
  if (client) {
    client.end()
    client = null
    subscribers.clear()
    isConnected = false
  }
}

export const subscribeToMarketData = (
  callback: (data: MarketDataPayload) => void,
): (() => void) => {
  if (!client || !client.connected) {
    connectMqtt()
  }

  subscribers.add(callback)

  return () => {
    subscribers.delete(callback)
    // Only disconnect if there are no more subscribers
    // But keep the connection alive if there are still subscribers
    if (subscribers.size === 0 && client) {
      // Don't disconnect immediately, wait a bit in case new subscribers come in
      setTimeout(() => {
        if (subscribers.size === 0 && client) {
          disconnectMqtt()
        }
      }, 1000)
    }
  }
}

export const getMqttConnectionStatus = (): boolean => {
  return isConnected && client?.connected === true
}

