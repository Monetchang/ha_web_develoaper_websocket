/**
 * 构建器
 * 用于调用构建编译工具链指令
 */
const notificationManager = require('./notificationManager')
const notificationType = require("./notificationType")
const builder = require("./builder")

// 运行编译
const runBuild = data => {
    console.log('buildManager runBuild(data)', data)
    notificationManager.post(notificationType.buildStatusChange, {
        status: "building",
    })
    // builder(data.task.value)
    notificationManager.post(notificationType.buildStatusChange, {
        status: "finish",
        id: data.task.id,
    })
}

// 监听云端指令
notificationManager.listen(notificationType.command, (data) => {
    console.log(data)
    runBuild(data)
})