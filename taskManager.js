/**
 * 任务管理器
 * 用于监听云端是否有新的任务，并进行任务相关信息的更新等操作
 */

const config = require("./config")
const network = require("./utils/network")
const wait = require("./utils/wait")
const notificationType = require("./notificationType")
const notificationManager = require("./notificationManager")

// 内部标志
const flag = {
    building: false, // 是否正在构建
}

// 初始化 API Server 配置
const baseURL = `${config.APIServer.protocol}://${config.APIServer.host}:${config.APIServer.port}`
network.setup(baseURL)

let main = () => {}

// 请求列表
const requestTaskList = async () => {
    console.log("requestTaskList()")
    const result = await network._.post("/v1/buildTask/awaitList", {
        ...config.APIServer.keys,
    })
    const {
        error,
        data
    } = result
    console.log(error)
    console.log(data)
    return result
}

const postNotification = (message) => {
    notificationManager.post(notificationType.command, message)
}

// 监听消息变化
const onNotification = (message) => {
    console.log('taskManager onNotification()', message)
    if (message === 'building') {
        flag.building = true
    } else {
        flag.building = false
    }
}
notificationManager.listen(notificationType.buildStatusChange, onNotification)

// 主逻辑
main = async () => {
    if (flag.building) {
        return
    }

    const {error,data} = await requestTaskList()
    const taskList = data
    console.log('taskList', taskList)
    if (taskList.length > 0) {
        const task = taskList[0]
        console.log(task)
        postNotification({
            task,
        })
    }

    await wait(1000 * 10) // 间隔 X 秒再次查询
}

// 持续执行主逻辑
global.__mainThreadWorking__ = false
const mainThread = async () => {
    __mainThreadWorking__ = true
    await main()
    __mainThreadWorking__ = false
}

setInterval(() => {
    if (global.__mainThreadWorking__ === false) {
        mainThread()
    }
}, 1000 * 1)