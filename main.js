const uploadToCloud = require('./uploadToCloud.js')
const fs = require("fs")
const path = require("path")
const WebSocket = require("ws")
const {exec} = require("child_process")
const logSymbols = require("log-symbols")
const utils = require("./utils")

const ws = new WebSocket("ws://localhost:8088")

const applicationProject = "../Business-Template-APP/android"
const logStorageFile = "./log"
const switchEnvironmentPath = "../Business-Template-APP/tool/environment/package"
const androidReleaseAPK = "../Business-Template-APP/android/app/build/outputs/apk/release/app-release.apk"

const androidPackageInstruct = " cd " + applicationProject + " && npm run android-release"

global.copyFileStart = 0
global.copyFileEnd = 0
global.copyFileToTargetPath = 0
global._ws = ws

ws.onmessage = function (event) {
  const data = JSON.parse(event.data)


  // console.log("DATA@@", data)
  if (data.type === "websocket_client") {
    ws.send("Start package...")
    ws.send("Configuration data was successfully fetched...")
    const applicationData = JSON.parse(data.config)
    const applicationConfigList = JSON.parse(applicationData.config)
    const applicationConfig = applicationConfigList[applicationData.key]
    ws.send(`Configuration data: ${applicationConfig}`)
    console.log("config environment", applicationConfig)
    console.log("Config@@", applicationConfig)

    ws.send("Init tool successfully...")
    global.copyFileStart = 0
    global.copyFileEnd = 0
    global.copyFileToTargetPath = 0
    let package = false

    ws.send("Start application logo && splash screen download...")
    if (applicationConfig.app.logoImageURL !== "") utils.downloadZip(applicationConfig.app.logoImageURL)
    ws.send("Start security images download...")
    if (applicationConfig.app.securityImagePath !== "") utils.downloadZip(applicationConfig.app.securityImagePath, applicationConfig.app.bundleId)
    ws.send("Start app background images download...")
    if (applicationConfig.app.backgroundImageURL !== "") utils.downloadZip(applicationConfig.app.backgroundImageURL)

    const copyFileTiming = setInterval(() => {
      console.log("Started copy files number:", global.copyFileStart, "Finished copy files number:", global.copyFileEnd, "Copy folder number:", global.copyFileToTargetPath)
      if ((global.copyFileToTargetPath === 3) && (global.copyFileStart === global.copyFileEnd)) {
        console.log("Copy File End................")
        ws.send("Files moved to the target path")
        // package = true
        clearInterval(copyFileTiming)
        const applicationConfigString = JSON.stringify(applicationConfig)
        const switchEnvironment = `node ${switchEnvironmentPath} --key ${data.key} --config '${applicationConfigString}'`
        execShell(switchEnvironment, "process")
        // ws.send("开始打包～")
        execShell(androidPackageInstruct, "package")
      }
    }, 1000)

  }
}

ws.onopen = function () {
  console.log('connect success~')
}


// 默认执行命令行
const execShell = (line, type) => {
  const _process = exec(line, {})
  const timestamp = (new Date()).getTime()
  const key = "app-release-" + timestamp + ".apk"
  const dialogKey = "app-release-" + timestamp + ".txt"
  let dialogContent = ""
  _process.stdout.on("data", data => {
    console.log(logSymbols.success, data)

    // doInteraction(interaction.test2)
    dialogContent = `${data}`
    ws.send(dialogContent)
  })

  _process.stderr.on("data", data => {
    dialogContent = `${data}`
    console.log(logSymbols.error, data)
  })

  _process.on("close", function () {
    if(type === "package"){
      fs.writeFile(path.join(logStorageFile, "app-release-" + timestamp + ".txt"), dialogContent, (err) => {
        if (err) {
          // 一般写文件，如果出现错误，都是因为权限问题(权限不够不能创建文件)
          // 文件夹如果不存在，不会创建文件夹，也会出错
          console.log("err:" + err)
        } else {
          console.log("文件写入成功")
          console.log("打包完成，开始上传")
          ws.send("打包完成，开始上传")
          const dialogLocalFile = logStorageFile + '/' + "app-release-" + timestamp + ".txt"
          uploadToCloud(key, androidReleaseAPK, true)
          uploadToCloud(dialogKey, dialogLocalFile, false)
        }
      })
    }
  })

  // _process.on('exit', function ( code, singal) {
  //     console.log('child process exited with ' +
  //         `code ${code} and signal ${singal}`)
  //
  // })
}