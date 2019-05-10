const request = require("request")
const fs = require("fs")
const path = require("path")
const router = require("./router")
const extract = require('extract-zip')

/**
 * 检查目标文件夹是否存在，若不存在则创建该文件夹
 * @param dir
 */
const isDir = (dir) => {
  if (fs.existsSync(dir)) {
    console.log("Dir is exist")
  } else {
    fs.mkdirSync(dir)
  }
}

/**
 * 检查文件是否存在，若存在则删除该文件
 * @param file
 */
const isFile = (file) => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file)
  } else {
    console.log("No files")
  }
}

/**
 * 删除文件
 * @param dir
 */
const removeDir = (dir) => {
  let paths = fs.readdirSync(dir)
  paths.forEach(file => {
    const newPath = path.join(dir, file)
    if (file === ".DS_Store") {
      fs.unlinkSync(newPath)
    } else {
      let stat = fs.statSync(newPath)
      if (stat.isDirectory()) {
        removeDir(newPath)
      } else {
        console.log("Delete file:", newPath)
        fs.unlinkSync(newPath)
      }
    }
  })
  fs.rmdirSync(dir)
}

/**
 * 拷贝文件
 * @param originDirPath
 * @param targetDirPath
 */
const copyFile = (originDirPath, targetDirPath) => {
  console.log("Start copy files")

  let paths = fs.readdirSync(originDirPath)
  paths.forEach(file => {
    console.log("File name@", file)
    if (file !== ".DS_Store") {
      const originPath = path.join(originDirPath, file)
      const targetPath = path.join(targetDirPath, file)
      let stat = fs.statSync(originPath)
      if (stat.isFile()) {
        console.log("Copy file path:", originPath)
        global.copyFileStart = global.copyFileStart + 1
        const originBuffer = fs.readFileSync(originPath)
        const originBase64 = originBuffer.toString("base64")
        const decodeImg = new Buffer(originBase64, "base64")
        fs.writeFile(targetPath, decodeImg, err => {
          if (err) throw err
          console.log("Target file path:", targetPath)
          global.copyFileEnd = global.copyFileEnd + 1
        })
      } else {
        copyFile(originPath, targetPath)
      }
    }
  })
}

/**
 * 拷贝文件到目标目录
 * @param originPath
 * @param type
 */
const copyToTargetDir = (originFilePath, type, bundleId) => {
  global.copyFileToTargetPath = global.copyFileToTargetPath + 1
  switch (type) {
    case "logo":
      copyLogo(originFilePath)
      break
    case "background":
      copyBackground(originFilePath)
      break
    case "securityImage":
      copySecurityImage(originFilePath, bundleId)
    default:
      break
  }

}

/**
 * 拷贝应用图标
 * @param originFilePath
 */
const copyLogo = (originFilePath) => {
  const androidOriginFilePath = path.join(originFilePath, "/Android")
  if (!fs.existsSync(androidOriginFilePath)) {
    alert("Android 应用图标没有上传 Android 文件夹")
    return
  }
  copyFile(androidOriginFilePath, router.androidLogoTargetPath)
}

/**
 * 拷贝背景图片
 * @param originFilePath
 */
const copyBackground = (originFilePath) => {
  copyFile(originFilePath, router.reactNativeBackgroundTargetPath)
}

/**
 * 拷贝安全图片
 * @param originFilePath
 */
const copySecurityImage = (originFilePath, bundleId) => {
  const url = path.join(router.reactNativeSecurityImageTargetPath, bundleId)
  isDir(url)
  copyFile(originFilePath, url)
}

const object = {}

object.downloadZip = (url, bundleId) => {
  const urlArr = url.split("/")
  const zipFileName = urlArr[urlArr.length - 1].split(".")[0]
  const unzipFileName = zipFileName.split("_")[0]

  console.log("zipFileName@@: ", zipFileName)

  const unzipType = zipFileName.split("_")[2]
  const zipFilePath = path.join(router.zipPath, `${zipFileName}.zip`)
  const unzipFilePath = path.join(router.unzipPath, unzipFileName)
  isDir(router.zipPath)
  isDir(router.unzipPath)
  isFile(zipFilePath)
  let stream = fs.createWriteStream(zipFilePath)
  request(url).pipe(stream).on("close", err => {
    if (err) throw err
    console.log(`${zipFileName}.zip download`)
    global._ws.send(`${zipFileName}.zip download success`)
    if (!fs.existsSync(zipFilePath)) return

    if (fs.existsSync(unzipFilePath)) {
      // 如果解压目标文件夹中已存在相同文件夹名，将其删除
      removeDir(unzipFilePath)
    }
    global._ws.send(`${zipFileName}.zip unzip start...`)
    extract(zipFilePath, {dir: router.unzipPath}, function (err) {
      // extraction is complete. make sure to handle the err
      if (err) console.log(err)
      global._ws.send(`${zipFileName}.zip unzip finished`)

      console.log("unzipType@@: ", unzipType)
      if (bundleId) {
        copyToTargetDir(unzipFilePath, unzipType, bundleId)
      } else {
        copyToTargetDir(unzipFilePath, unzipType)
      }
    })
  })
}

module.exports = object