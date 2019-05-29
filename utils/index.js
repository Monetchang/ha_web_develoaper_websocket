const request = require("request")
const fs = require("fs")
const path = require("path")
const router = require("./router")
const tools = require("./tools")
const extract = require('extract-zip')

const object = {}

/**
 * 拷贝文件到目标目录
 * @param originPath
 * @param type
 */
object.copyToTargetDir = (type, bundleId) => {
  global.copyFileToTargetPath = global.copyFileToTargetPath + 1
  switch (type) {
    case "logo":
      tools.copyLogo()
      break
    case "background":
      tools.copyBackground()
      break
    case "securityImage":
      tools.copySecurityImage(bundleId)
    default:
      break
  }
}

/**
 * 创建文件夹结构
 */
object.createFolderBone = () => {
  tools.isDir(path.join(__dirname, "../log"))
  Object.keys(router).map(key => {
    tools.isDir(router[key])
  })
  
  
  tools.isDir(router.imagesOriginPath)
  tools.isDir(router.zipOriginPath)
  tools.isDir(router.logoOutputPath)
  tools.isDir(router.securityImageOutputPath)
  tools.isDir(router.iOSOutputPath)
  tools.isDir(router.iOSXcodeOutputPath)
  tools.isDir(router.iOSLaunchImageOutputPath)
  // tools.isDir(router.iOSXcodeContentJsonPath)
  tools.isDir(router.androidOutputPath)
  tools.isDir(router.androidHdpiOutputPath)
  tools.isDir(router.androidMdpiOutputPath)
  tools.isDir(router.androidXdpiOutputPath)
  tools.isDir(router.androidXxdpiOutputPath)
  tools.isDir(router.reactnativeOutputPath)
  tools.isDir(router.reactnativeBackgroundOutputPath)
}

/**
 * 拷贝 content.json
 */
object.copyXcodeContentJson = () => {
  global._ws.send("Copy file content.json")
  console.log("Copy file content.json")
  tools.copyFile(router.iOSXcodeContentJsonOriginPath, router.iOSXcodeOutputPath)
}

/**
 * 应用名中英文 && 应用版权号转换图片
 * @param names
 */
object.conversionApplicationNameToLaunchScreen = (names) => {
  const applicationNameZh = path.join(router.imagesOriginPath, "/nameZh.png")
  const applicationNameEn = path.join(router.imagesOriginPath, "/nameEn.png")
  const copyright = path.join(router.imagesOriginPath, "/copyright.png")
  // tools
  tools.wordConversionImage(names.zh, applicationNameZh, () => {
    console.log("Word conversion image name.zh")
    tools.imageManage("nameZh")
  })
  tools.wordConversionImage(names.en, applicationNameEn, () => {
    console.log("Word conversion image name.en")
    tools.imageManage("nameEn")
  })
  tools.wordConversionImage("Copyright @2018-2019 all Rights Reserved", copyright, () => {
    console.log("Word conversion image copyright")
    tools.imageManage("copyright")
  })
}

/**
 * 下载图片文件 && 压缩包
 * @param url
 * @param bundleId
 */
object.downloadFiles = (url, bundleId) => {
  const urlArr = url.split("/")
  const fileName = urlArr[urlArr.length - 1].split(".")[0]
  const fileFormat = urlArr[urlArr.length - 1].split(".")[1]
  const outputFileName = fileName.split("_")[0]
  const fileType = fileName.split("_")[2]
  console.log("Is fileName@@: ", urlArr, fileName, fileFormat)

  if (fileFormat === "zip") {
    console.log("Start download ZIP...")
    const originFilePath = path.join(router.zipOriginPath, `${outputFileName}.${fileFormat}`)
    const outputFilePath = path.join(router.securityImageOutputPath)
    let stream = fs.createWriteStream(originFilePath)
    request(url).pipe(stream).on("close", err => {
      if (err) console.log("Download Failed~")
      console.log(`${outputFileName}.${fileFormat} download success`)
      global._ws.send(`${outputFileName}.${fileFormat} download success`)
      // if (!fs.existsSync(originDirPath)) return

      if (fs.existsSync(outputFilePath)) {
        // 如果解压目标文件夹中已存在相同文件夹名，将其删除
        tools.removeDir(outputFilePath)
      }

      global._ws.send(`${outputFileName}.${fileFormat} unzip start...`)
      extract(originFilePath, {dir: outputFilePath}, function (err) {
        // extraction is complete. make sure to handle the err
        if (err) console.log(err)
        fs.rename(`${outputFilePath}/${outputFileName}`, `${outputFilePath}/${bundleId}`, () => {
          if (err) throw err
        })
        global._ws.send(`${outputFileName}.zip unzip finished`)
        if (bundleId) {
          object.copyToTargetDir(fileType, bundleId)
        } else {
          object.copyToTargetDir(fileType)
        }
      })


    })
  } else if (fileFormat === "png") {
    const originFilePath = path.join(router.imagesOriginPath, `${fileType}.${fileFormat}`)
    global._ws.send(`${outputFileName}.${fileFormat} zoom start...`)
    const options = {
      url: url,
      headers: {'Content-Type': 'application/octet-stream'}
    }
    request(options)
      .on("error", err => console.log(err))
      .pipe(fs.createWriteStream(originFilePath))
      .on("close", err => {
        console.log("PNG FINISHED")
        tools.imageManage(fileType)
      })
  }


}

module.exports = object