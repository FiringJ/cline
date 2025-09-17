/**
 * PlatformContext.tsx
 *
 * 提供平台相关配置的 React Context 封装。
 *
 * - 使用 PLATFORM_CONFIG（由 platform.config.ts 动态生成）作为 Context 默认值。
 * - PlatformProvider：在应用最外层注入 PLATFORM_CONFIG，使子组件都能访问平台配置。
 * - usePlatform：获取完整的 PlatformConfig 对象（如 messageEncoding、postMessage 等）。
 * - useShowNavbar：便捷 hook，仅返回 showNavbar 开关，用于控制 UI 显隐。
 *
 * 典型用途：
 *   const { postMessage, supportsTerminalMentions } = usePlatform()
 *   const showNavbar = useShowNavbar()
 */

/**
 * createContext 的作用是：在组件树中建立一个“全局可访问的状态容器”，
 * 通过 Provider 提供数据，useContext 获取数据，
 * 底层依赖 Fiber 树的 Context dependency list 实现快速查找和订阅更新。
 */

import React, { createContext, useContext } from "react"
import type { PlatformConfig } from "../config/platform.config"
import { PLATFORM_CONFIG } from "../config/platform.config"

const PlatformContext = createContext<PlatformConfig>(PLATFORM_CONFIG)

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return <PlatformContext.Provider value={PLATFORM_CONFIG}>{children}</PlatformContext.Provider>
}

export const usePlatform = () => {
	return useContext(PlatformContext)
}

// Optional convenience hooks for individual config values
export const useShowNavbar = () => usePlatform().showNavbar
