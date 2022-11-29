import { MessageTypeEnum, UpdateTypeEnum } from "../enums/wss"

console.log('[vite] connecting')

const socket = new WebSocket(`ws://localhost:__HMR__PORT__`, 'vite-hmr')

socket.addEventListener('message', async ({ data }) => {
	handleMessage(JSON.parse(data)).catch(console.error)
})

async function handleMessage(payload: Record<string, any> & { type: MessageTypeEnum }) {
	switch (payload.type) {
		case MessageTypeEnum.CONNECT:
			console.log('[vite] connected.')
			// 心跳
			setInterval(() => socket.send('ping'), 1000)
			break
		case MessageTypeEnum.UPDATE:
			payload.updates.forEach((update: any) => {
				if (update.type === UpdateTypeEnum.JS) {
					// 接受到更新后，使用 import 动态加载模块
					fetchUpdate({ path: update.path, timestamp: update.timestamp }).then((render) => {
						// render && render()
					})
				}
			})
			break
	}
}

interface HotModule {
	id: string
	callbacks: HotCallback[]
}

interface HotCallback {
	deps: string[]
	fn: (module: Record<string, any>) => void
}

const hotModulesMap = new Map<string, HotModule>()
const pruneMap = new Map<string, (data: any) => void | Promise<void>>()

// 用户的所有模块都会注入 client.ts 代码
// 并注入 import.meta.hot = createHotContext(所属模块路径)
export const createHotContext = (ownerPath: string) => {
	const mod = hotModulesMap.get(ownerPath)
	if (mod) {
		mod.callbacks = []
	}

	function acceptDeps(deps: string[], callback: any) {
		const mod: HotModule = hotModulesMap.get(ownerPath) || {
			id: ownerPath,
			callbacks: []
		}

		mod.callbacks.push({
			deps,
			fn: callback
		})
		hotModulesMap.set(ownerPath, mod)
	}

	return {
		accept(deps: any, callback?: any) {
			if (typeof deps === 'function' || !deps) {
				acceptDeps([ownerPath], ([mod]: any) => deps && deps(mod))
			}
		},

		prune(cb: (data: any) => void) {
			pruneMap.set(ownerPath, cb)
		}
	}
}

async function fetchUpdate({ path, timestamp }: any) {
  const mod = hotModulesMap.get(path);
  if (!mod) return;

  const moduleMap = new Map();
  const modulesToUpdate = new Set<string>();
  modulesToUpdate.add(path);

  await Promise.all(
    Array.from(modulesToUpdate).map(async (dep) => {
      const [path, query] = dep.split(`?`);
      try {
        // 通过动态 import 拉取最新模块
        const newMod = await import(
          path + `?t=${timestamp}${query ? `&${query}` : ""}`
        );
        // moduleMap.set(dep, newMod);
      } catch (e) {}
    })
  );

  return () => {
    // 拉取最新模块后执行更新回调
    for (const { deps, fn } of mod.callbacks) {
      fn(deps.map((dep: any) => moduleMap.get(dep)));
    }
    console.log(`[vite] hot updated: ${path}`);
  };
}