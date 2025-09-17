/**
 * 平台配置入口文件。
 *
 * 功能：
 * 1. 根据编译期注入的 __PLATFORM__ 常量，从 platform-configs.json 选择对应配置。
 * 2. 为 postMessage、消息编码/解码、UI 开关等行为提供统一的 PLATFORM_CONFIG。
 * 3. 业务层通过 PlatformProvider 使用这些配置，在 VSCode、Standalone 等宿主环境下保持一致。
 *
 * 关于 encodeMessage / decodeMessage：
 * - 此处只负责选择策略（"none" | "json"）。
 * - "none" → 原样返回，不做处理。
 * - "json" → 调用调用方传入的 encoder/decoder 函数，本身不实现具体的 JSON.stringify / JSON.parse。
 * - 因此，真正的序列化与反序列化逻辑由业务层决定。
 *
 * 示例：
 *   PLATFORM_CONFIG.encodeMessage(msg, m => JSON.stringify(m))
 *   PLATFORM_CONFIG.decodeMessage(raw, json => JSON.parse(json))
 */

import platformConfigs from "./platform-configs.json"

export interface PlatformConfig {
	messageEncoding: MessageEncoding
	showNavbar: boolean
	postMessage: PostMessageFunction
	encodeMessage: MessageEncoder
	decodeMessage: MessageDecoder
	togglePlanActKeys: string
	supportsTerminalMentions: boolean
}

// Internal type for JSON structure (not exported)
type PlatformConfigJson = {
	messageEncoding: "none" | "json"
	showNavbar: boolean
	postMessageHandler: "vscode" | "standalone"
	togglePlanActKeys: string
	supportsTerminalMentions: boolean
}

type PlatformConfigs = Record<string, PlatformConfigJson>

// Global type declarations for postMessage and vscode API
declare global {
	interface Window {
		// This is the post message handler injected by JetBrains.
		// !! Do not change the name of the handler without updating it on
		// the JetBrains side as well. !!
		standalonePostMessage?: (message: string) => void
	}
	function acquireVsCodeApi(): any
}

// Initialize the vscode API if available
const vsCodeApi = typeof acquireVsCodeApi === "function" ? acquireVsCodeApi() : null

// Implementations for post message handling
const postMessageStrategies: Record<string, PostMessageFunction> = {
	vscode: (message: any) => {
		if (vsCodeApi) {
			vsCodeApi.postMessage(message)
		} else {
			console.log("postMessage fallback: ", message)
		}
	},
	standalone: (message: any) => {
		if (!window.standalonePostMessage) {
			console.error("Standalone postMessage not found.")
			return
		}
		const json = JSON.stringify(message)
		console.log("Standalone postMessage: " + json.slice(0, 200))
		window.standalonePostMessage(json)
	},
}

// Implementations for message encoding
const messageEncoders: Record<string, MessageEncoder> = {
	none: <T>(message: T, _encoder: (_: T) => unknown) => message,
	json: <T>(message: T, encoder: (_: T) => unknown) => encoder(message),
}

// Implementations for message decoding
const messageDecoders: Record<string, MessageDecoder> = {
	none: <T>(message: any, _decoder: (_: { [key: string]: any }) => T) => message,
	json: <T>(message: any, decoder: (_: { [key: string]: any }) => T) => decoder(message),
}

// Local declaration of the platform compile-time constant
declare const __PLATFORM__: string

// Get the specific platform config at compile time
const configs = platformConfigs as PlatformConfigs
const selectedConfig = configs[__PLATFORM__]
console.log("[PLATFORM_CONFIG] Build platform:", __PLATFORM__)

// Build the platform config with injected functions
export const PLATFORM_CONFIG: PlatformConfig = {
	messageEncoding: selectedConfig.messageEncoding,
	showNavbar: selectedConfig.showNavbar,
	postMessage: postMessageStrategies[selectedConfig.postMessageHandler],
	encodeMessage: messageEncoders[selectedConfig.messageEncoding],
	decodeMessage: messageDecoders[selectedConfig.messageEncoding],
	togglePlanActKeys: selectedConfig.togglePlanActKeys,
	supportsTerminalMentions: selectedConfig.supportsTerminalMentions,
}

type MessageEncoding = "none" | "json"

// Function types for platform-specific behaviors
type PostMessageFunction = (message: any) => void
type MessageEncoder = <T>(message: T, encoder: (_: T) => unknown) => any
type MessageDecoder = <T>(message: any, decoder: (_: { [key: string]: any }) => T) => T
