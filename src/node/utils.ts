import path from 'path'

export function getShortName(file: string, root: string) {
	// 如果文件是绝对路径，则将其改为相对路径
	// /User/..../src/main.tsx -> src/main.tsx
  return file.startsWith(root + '/') ? path.posix.relative(root, file) : file
}
