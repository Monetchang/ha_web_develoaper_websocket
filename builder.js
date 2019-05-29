const uploadToCloud = require('./uploadToCloud.js')
const fs = require("fs")
const path = require("path")
const WebSocket = require("ws")
const {exec} = require("child_process")
const logSymbols = require("log-symbols")
const utils = require("./utils")
const config = require("./config")

const applicationProject = `${config.projectPath}/android`
const logStorageFile = "./log"
const switchEnvironmentPath = `${config.projectPath}/tool/environment/package`
const androidReleaseAPK = `${config.projectPath}/android/app/build/outputs/apk/release/app-release.apk`

// Create folder
utils.createFolderBone()

const androidPackageInstruct = `cd ${applicationProject} && npm run android-release`
// const ws = new WebSocket(`${config.websocket.protocol}://${config.websocket.host}:${config.websocket.port}`)
// global._ws = ws
const ws = {
    send: (content) => {
        console.log('ws', content)
    },
}
global._ws = ws

const build = (data) => {
    // Declare variable
    global.downloadPngNumber = 3
    global.zoomFiles = 0
    global.zoomTargetFiles = 0
    global.startCopyFile = false
    global.copyFileToTargetPath = 0
    global.copyFileStart = 0
    global.copyFileEnd = 0

    // Init
    ws.send("Start package...")
    ws.send("Configuration data was successfully fetched...")
    const applicationConfig = data
    console.log("config: ", applicationConfig)
    ws.send("Init tool successfully...")
    ws.send("Application name image init start...")

    // Conversion word
    utils.conversionApplicationNameToLaunchScreen(applicationConfig.app.name)

    // Copy xcode content.json
    utils.copyXcodeContentJson()

    // Download
    ws.send("Start application logo && splash screen download...")
    if (applicationConfig.app.logoImageURL !== "") utils.downloadFiles(applicationConfig.app.logoImageURL)
    ws.send("Start security images download...")
    if (applicationConfig.app.securityImagePath !== "") utils.downloadFiles(applicationConfig.app.securityImagePath, applicationConfig.app.bundleId)
    ws.send("Start app background images download...")
    if (applicationConfig.app.backgroundImageURL !== "") utils.downloadFiles(applicationConfig.app.backgroundImageURL)


    // Listener
    const zoomFileTiming = setInterval(() => {
      console.log("Download png:", global.copyFileStart, "Finished zoom files number:", global.zoomTargetFiles, "Zoom folder number:", global.zoomFiles)
      if ((global.downloadPngNumber === 3) && (global.zoomFiles === global.zoomTargetFiles)) {
        clearInterval(zoomFileTiming)
        console.log("Zoom File End...")
        global._ws.send("Zoom file end, Next copy files start...")
        global.startCopyFile = true
        utils.copyToTargetDir("logo")
        utils.copyToTargetDir("background")
      }
    }, 1000)

    const copyFileTiming = setInterval(() => {
      console.log("Started copy files status:", global.startCopyFile, "Copy files to target path:", global.copyFileToTargetPath, "Finished copy files number:", global.copyFileEnd, "Copy folder number:", global.copyFileStart)
      if((global.startCopyFile === true) && (global.copyFileToTargetPath === 3) && (global.copyFileStart === global.copyFileEnd)) {
        console.log("Copy File End...")
        global._ws.send("Copy file end, Next run tool start...")
        clearInterval(copyFileTiming)
        ws.send("Files moved to the target path")
        const applicationConfigString = JSON.stringify(applicationConfig)
        const switchEnvironment = `node ${switchEnvironmentPath} --key ${data.key} --config '${applicationConfigString}'`
        console.log(switchEnvironment)
        ws.send("Switch environment...")
        execShell(switchEnvironment, "process")
        execShell(androidPackageInstruct, "package") // TODO: 取消此注释
      }
    }, 1000)
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

module.exports = build