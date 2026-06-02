import mqtt from 'mqtt'

export type MarketDataPayload = {
  stockId: string
  matchPrice: number
}

const MQTT_BROKER_URL =
  import.meta.env.VITE_MQTT_BROKER_URL ?? 'wss://iot.vuhongquang.com:8084/mqtt'
const MQTT_TOPIC = import.meta.env.VITE_MQTT_TOPIC ?? 'market-data'

type MqttClient = ReturnType<typeof mqtt.connect>

let client: MqttClient | null = null
let subscribers: Set<(data: MarketDataPayload) => void> = new Set()
let statusSubscribers: Set<(isConnected: boolean) => void> = new Set()
let isConnected = false
let connectionHolders = 0

// Generate a random client ID
const generateClientId = (): string => {
  return `finsight_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`
}

const setConnectionStatus = (status: boolean) => {
  if (isConnected === status) return
  isConnected = status
  statusSubscribers.forEach((callback) => callback(status))
}

const shouldKeepConnectionAlive = () => connectionHolders > 0 || subscribers.size > 0

const disconnectIfIdle = () => {
  if (!shouldKeepConnectionAlive() && client) {
    disconnectMqtt()
  }
}

export const connectMqtt = (): MqttClient => {
  if (client) {
    return client
  }

  const clientId = generateClientId()
  console.log('Connecting with client ID:', clientId)

  client = mqtt.connect(MQTT_BROKER_URL, {
    protocol: 'wss',
    clientId,
    keepalive: 60,
    reconnectPeriod: 5000,
    connectTimeout: 10000,
    clean: true,
    will: undefined,
    wsOptions: {},
  })

  client.on('connect', () => {
    setConnectionStatus(true)
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
    setConnectionStatus(false)
  })

  client.on('close', () => {
    console.log('MQTT connection closed')
    if (client) {
      console.log('Client disconnected:', !client.connected)
      console.log('Client options:', {
        protocol: client.options?.protocol,
        host: client.options?.host,
        port: client.options?.port,
      })
      console.log('Active subscribers:', subscribers.size)
    }
    setConnectionStatus(false)
  })

  client.on('end', () => {
    console.log('MQTT client ended (connection terminated)')
    setConnectionStatus(false)
  })

  client.on('offline', () => {
    console.log('MQTT client offline')
    setConnectionStatus(false)
  })

  client.on('reconnect', () => {
    console.log('MQTT reconnecting...')
  })

  return client
}

export const disconnectMqtt = () => {
  if (client) {
    client.end()
    client = null
    setConnectionStatus(false)
  }
}

export const startMqttConnection = (): (() => void) => {
  connectionHolders += 1
  connectMqtt()

  return () => {
    connectionHolders = Math.max(0, connectionHolders - 1)
    setTimeout(disconnectIfIdle, 1000)
  }
}

export const subscribeToMarketData = (
  callback: (data: MarketDataPayload) => void,
): (() => void) => {
  subscribers.add(callback)
  connectMqtt()

  return () => {
    subscribers.delete(callback)
    setTimeout(disconnectIfIdle, 1000)
  }
}

export const getMqttConnectionStatus = (): boolean => {
  return isConnected && client?.connected === true
}

export const subscribeToMqttStatus = (
  callback: (isConnected: boolean) => void,
): (() => void) => {
  statusSubscribers.add(callback)
  callback(getMqttConnectionStatus())

  return () => {
    statusSubscribers.delete(callback)
  }
}
