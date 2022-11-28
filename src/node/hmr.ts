import type { ServerContext } from '../server/index'
import { blue, green } from 'picocolors'
import { MessageTypeEnum, UpdateTypeEnum } from '../esums/wss'
import { getShortName } from './utils'

export function bindingHMREvents(serverContext: ServerContext) {
	const { watcher, ws, root, moduleGraph } = serverContext

	watcher.on('change', async (file) => {
		// file: 修改文件的绝对路径
		console.log(`✨${blue('[hmr]')} ${green(file)} changed`)
		// 清除模块缓存
		await moduleGraph.invalidateModule(file)
		ws.send({
			type: MessageTypeEnum.UPDATE,
			updates: [
				{
					type: UpdateTypeEnum.JS,
					timestamp: Date.now(),
					path: '/' + getShortName(file, root),
					acceptedPath: '/' + getShortName(file, root)
				}
			]
		})
	})
}