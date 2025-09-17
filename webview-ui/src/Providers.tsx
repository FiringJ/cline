/**
 * Providers 是一个 集中式 Provider 容器，把应用所需的全局上下文都放在一起。
 * 层级含义
	1.	PlatformProvider
	•	提供运行平台的全局配置（比如 VS Code Webview 环境 vs. 浏览器环境）。
	2.	ExtensionStateContextProvider
	•	管理扩展（Extension）的运行状态，比如当前会话、是否已初始化。
	3.	CustomPostHogProvider
	•	封装 PostHog 埋点 SDK，负责埋点上报。
	4.	ClineAuthProvider
	•	管理用户认证状态（登录、权限等）。
	5.	HeroUIProvider
	•	UI 框架的 Provider，统一主题/样式。
 */

import { HeroUIProvider } from "@heroui/react"
import { type ReactNode } from "react"
import { CustomPostHogProvider } from "./CustomPostHogProvider"
import { ClineAuthProvider } from "./context/ClineAuthContext"
import { ExtensionStateContextProvider } from "./context/ExtensionStateContext"
import { PlatformProvider } from "./context/PlatformContext"

export function Providers({ children }: { children: ReactNode }) {
	return (
		<PlatformProvider>
			<ExtensionStateContextProvider>
				<CustomPostHogProvider>
					<ClineAuthProvider>
						<HeroUIProvider>{children}</HeroUIProvider>
					</ClineAuthProvider>
				</CustomPostHogProvider>
			</ExtensionStateContextProvider>
		</PlatformProvider>
	)
}
