const config = {}

// 移动端项目本地路径
config.projectPath = "/Users/chunbohu/Code/ReactNative/Business-Template-APP"

// WebSocket 配置
config.websocket = {
    protocol: "ws",
    host: "localhost",
    port: "8088",
}

// API 服务器配置
config.APIServer = {
    protocol: "http",
    host: "localhost",
    port: "3001",
    keys: {
        accessKey: "",
        secretKey: "",
    }
}

module.exports = config