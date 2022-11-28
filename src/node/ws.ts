import connect from 'connect'
import { red } from 'picocolors'
import { WebSocketServer, WebSocket } from 'ws'
import { MessageTypeEnum } from '../enums/wss'

export function createWebSocketServer(server: connect.Server): {
	send: (msg: Record<string, any>) => void,
	close: () => void
} {
	let wss: WebSocketServer
	wss = new WebSocketServer({ port: 24678 })
	wss.on('connection', (socket) => {
		socket.send(JSON.stringify({ type: MessageTypeEnum.CONNECT }))
	})
	wss.on('error', (error: Error & { code: string}) => {
		if (error.code !== 'EADDRINUSE') {
			console.error(red(`Websocket server error:\n${error.stack || error.message}`))
		}
	})

	return {
		send(payload: Record<string, any>) {
			const stringified = JSON.stringify(payload)
			wss.clients.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(stringified)
				}
			})
		},
		close() {
			wss.close()
		}
	}
}