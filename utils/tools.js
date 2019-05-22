const fs = require("fs")
const path = require("path")
const router = require("./router")
const {createCanvas, loadImage} = require("canvas")


const tools = {}

/**
 * 检查目标文件夹是否存在，若不存在则创建该文件夹
 * @param dir
 */
tools.isDir = (dir) => {
  if (fs.existsSync(dir)) {
    console.log(`${dir} is exist`)
    global._ws.send(`${dir} is exist`)
  } else {
    global._ws.send(`Create ${dir}`)
    fs.mkdirSync(dir)
  }
}

/**
 * 检查文件是否存在，若存在则删除该文件
 * @param file
 */
tools.isFile = (file) => {
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
tools.removeDir = (dir) => {
  let paths = fs.readdirSync(dir)
  paths.forEach(file => {
    const newPath = path.join(dir, file)
    if (file === ".DS_Store") {
      fs.unlinkSync(newPath)
    } else {
      let stat = fs.statSync(newPath)
      if (stat.isDirectory()) {
        tools.removeDir(newPath)
      } else {
        console.log("Delete file:", newPath)
        fs.unlinkSync(newPath)
      }
    }
  })
  fs.rmdirSync(dir)
}

/**
 * 拷贝文件 && 文件夹
 * @param originDirPath
 * @param targetDirPath
 */
tools.copyFile = (originDirPath, targetDirPath) => {
  let stat = fs.statSync(originDirPath)
  if (stat.isFile()) {
    // Is file
    const extname = path.extname(originDirPath)
    console.log("extname@@", extname)
    // if(extname === ".png"){
    //   const originBuffer = fs.readFileSync(originDirPath)
    //   const originBase64 = originBuffer.toString("base64")
    //   const decodeImg = new Buffer(originBase64, "base64")
    //   fs.writeFile(targetDirPath, decodeImg, err => {
    //     if (err) throw err
    //     console.log("Target file path:", targetDirPath)
    //     global.copyFileEnd = global.copyFileEnd + 1
    //   })
    // }else{
    global.copyFileStart = global.copyFileStart + 1
    let readStream = fs.createReadStream(originDirPath)
    let writeStream = fs.createWriteStream(router.iOSXcodeContentJsonOutputPath)
    writeStream.on("open", () => {
      readStream.pipe(writeStream)
    })
    writeStream.on("finish", () => {
      global.copyFileEnd = global.copyFileEnd + 1
    })
    // }
  } else {
    // Is folder
    let paths = fs.readdirSync(originDirPath)
    paths.forEach(file => {
      console.log("File name@", file)
      if (file !== ".DS_Store") {
        const originPath = path.join(originDirPath, file)
        const targetPath = path.join(targetDirPath, file)
        let _stat = fs.statSync(originPath)
        if (_stat.isFile()) {
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
          tools.isDir(targetPath)
          tools.copyFile(originPath, targetPath)
        }
      }
    })
  }
}

/**
 * 拷贝应用图标
 */
tools.copyLogo = () => {
  tools.copyFile(router.iOSLaunchImageOutputPath, router.iOSLogoTargrtPath)
  tools.copyFile(router.iOSXcodeOutputPath, router.iOSXcodeLogoTargrtPath)
  tools.copyFile(router.androidOutputPath, router.androidLogoTargetPath)
  tools.copyFile(router.reactnativeOutputPath, router.reactNativeLogoTargetPath)
}

/**
 * 拷贝背景图片
 */
tools.copyBackground = () => {
  tools.copyFile(router.reactnativeBackgroundOutputPath, router.reactNativeBackgroundTargetPath)
}

/**
 * 拷贝安全图片
 * @param originFilePath
 */
tools.copySecurityImage = (bundleId) => {
  const origin = path.join(router.securityImageOutputPath, bundleId)
  const output = path.join(router.reactNativeSecurityImageTargetPath, bundleId)
  // Create folder
  tools.isDir(output)

  // Copy android && iOS
  const androidOutput = path.join(output, 'Android')
  const iOSOutput = path.join(output, "iOS")
  tools.isDir(androidOutput)
  tools.isDir(iOSOutput)
  tools.copyFile(origin, output)
}

/**
 * 缩放图片
 * @param originFilePath
 * @param outputDirPath
 * @param size
 */
tools.zoomImage = (originFilePath, outputDirPath, width, height, name) => {
  global.zoomFiles = global.zoomFiles + 1
  loadImage(originFilePath).then(image => {
    let canvas = createCanvas(width, height)
    const ctx = canvas.getContext("2d")
    ctx.drawImage(image, 0, 0, width, height)
    // canvas.
    const imagePath = `${outputDirPath}/${name}.png`
    const outputStream = fs.createWriteStream(imagePath)

    const stream = canvas.createPNGStream()
    stream.pipe(outputStream)

    outputStream.on("finish", () => {
      global.zoomTargetFiles = global.zoomTargetFiles + 1
      console.log(`Zoom finished: ${imagePath}`)
    })
  })
}

/**
 * 文字转换图片函数
 * @param text
 * @param outputDirPath
 * @param callback
 */
tools.wordConversionImage = (text, outputDirPath, callback) => {
  const IsEn = new RegExp("[A-Za-z]+").test(text)
  const Iscopyright = new RegExp("[@]+").test(text)
  let canvas, ctx, size, width, height, color

  console.log("IsEn@@", IsEn)
  console.log("Iscopyright@@", Iscopyright)
  if (Iscopyright) {
    size = 29, width = 708, height = size + 4, color = "#FFF"
    canvas = createCanvas(width, height)
    ctx = canvas.getContext("2d")
    ctx.font = size + "px Arial"
  } else {
    if (IsEn) {
      size = 50, width = 320, height = size + 4, color = "#333"
      canvas = createCanvas(width, height)
      ctx = canvas.getContext("2d")
      ctx.font = size + "px Arial"
    } else {
      size = 50, width = 251, height = size + 4, color = "#333"
      canvas = createCanvas(width, height)
      ctx = canvas.getContext("2d")
      ctx.font = size + "px 微软雅黑"
    }
  }

  ctx.fillStyle = color
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(text, width / 2, size / 2)

  const imagePath = outputDirPath
  const outputStream = fs.createWriteStream(imagePath)
  const stream = canvas.createPNGStream()
  stream.pipe(outputStream)

  outputStream.on("finish", () => {
    callback()
    console.log(`Conversion finished: ${imagePath}`)
  })
}

/**
 * 图片转换管理
 * @param originFilePath
 * @param outputDirPath
 * @param type
 */
tools.imageManage = (type) => {
  const originFilePath = path.join(router.imagesOriginPath, `${type}.png`)
  if (type === "logo") {
    const sizes = [20, 24, 29, 40, 60, 81, 512]
    for (let i = 0; i < sizes.length; i++) {
      if (sizes[i] === 60) {
        // Launch image
        tools.zoomImage(originFilePath, router.iOSLaunchImageOutputPath, sizes[i], sizes[i], `icon`)
        tools.zoomImage(originFilePath, router.iOSLaunchImageOutputPath, sizes[i] * 2, sizes[i] * 2, `icon@2x`)
        tools.zoomImage(originFilePath, router.iOSLaunchImageOutputPath, sizes[i] * 3, sizes[i] * 3, `icon@3x`)
        tools.zoomImage(originFilePath, router.androidMdpiOutputPath, sizes[i], sizes[i], `launch_icon`)
        tools.zoomImage(originFilePath, router.androidXdpiOutputPath, sizes[i], sizes[i], `launch_icon`)
        tools.zoomImage(originFilePath, router.androidXxdpiOutputPath, sizes[i], sizes[i], `launch_icon`)
      }
      if ([20, 29, 40, 60, 512].indexOf(sizes[i]) >= 0) {
        // iOS
        tools.zoomImage(originFilePath, router.iOSXcodeOutputPath, sizes[i], sizes[i], `icon_${sizes[i]}`)
        tools.zoomImage(originFilePath, router.iOSXcodeOutputPath, sizes[i] * 2, sizes[i] * 2, `icon_${sizes[i]}@2x`)
        tools.zoomImage(originFilePath, router.iOSXcodeOutputPath, sizes[i] * 3, sizes[i] * 3, `icon_${sizes[i]}@3x`)
      } else if (sizes[i] === 24) {
        // Android
        tools.zoomImage(originFilePath, router.androidHdpiOutputPath, sizes[i] * 3, sizes[i] * 3, `ic_launcher`)
        tools.zoomImage(originFilePath, router.androidMdpiOutputPath, sizes[i] * 3, sizes[i] * 3, `ic_launcher`)
        tools.zoomImage(originFilePath, router.androidXdpiOutputPath, sizes[i] * 4, sizes[i] * 4, `ic_launcher`)
        tools.zoomImage(originFilePath, router.androidXxdpiOutputPath, sizes[i] * 6, sizes[i] * 6, `ic_launcher`)
      } else if (sizes[i] === 81) {
        tools.zoomImage(originFilePath, router.reactnativeOutputPath, sizes[i], sizes[i], `icon`)
        tools.zoomImage(originFilePath, router.reactnativeOutputPath, sizes[i] * 2, sizes[i] * 2, `icon@2x`)
        tools.zoomImage(originFilePath, router.reactnativeOutputPath, sizes[i] * 3, sizes[i] * 3, `icon@3x`)
      }
    }
  } else if (type === "background") {
    const size = {width: 375, height: 667}
    tools.zoomImage(originFilePath, router.reactnativeBackgroundOutputPath, size.width, size.height, `bg`)
    tools.zoomImage(originFilePath, router.reactnativeBackgroundOutputPath, size.width * 2, size.height * 2, `bg@2x`)
    tools.zoomImage(originFilePath, router.reactnativeBackgroundOutputPath, size.width * 3, size.height * 3, `bg@3x`)
  } else if (type === "launch") {
    const size = {width: 375, height: 667}
    tools.zoomImage(originFilePath, router.iOSLaunchImageOutputPath, size.width, size.height, `bg`)
    tools.zoomImage(originFilePath, router.iOSLaunchImageOutputPath, size.width * 2, size.height * 2, `bg@2x`)
    tools.zoomImage(originFilePath, router.iOSLaunchImageOutputPath, size.width * 3, size.height * 3, `bg@3x`)
    tools.zoomImage(originFilePath, router.androidMdpiOutputPath, size.width, size.height, `launch_bg`)
    tools.zoomImage(originFilePath, router.androidXdpiOutputPath, size.width * 3, size.height * 3, `launch_bg`)
    tools.zoomImage(originFilePath, router.androidXxdpiOutputPath, size.width * 3, size.height * 3, `launch_bg`)
  } else if (type === "nameZh") {
    const size = {width: 84, height: 19}
    tools.zoomImage(originFilePath, router.iOSLaunchImageOutputPath, size.width, size.height, `logo`)
    tools.zoomImage(originFilePath, router.iOSLaunchImageOutputPath, size.width * 2, size.height * 2, `logo@2x`)
    tools.zoomImage(originFilePath, router.iOSLaunchImageOutputPath, size.width * 3, size.height * 3, `logo@3x`)
    tools.zoomImage(originFilePath, router.androidMdpiOutputPath, size.width, size.height, `launch_logo`)
    tools.zoomImage(originFilePath, router.androidXdpiOutputPath, size.width * 2, size.height * 2, `launch_logo`)
    tools.zoomImage(originFilePath, router.androidXxdpiOutputPath, size.width * 3, size.height * 3, `launch_logo`)
  } else if (type === "nameEn") {
    const size = {width: 107, height: 18}
    tools.zoomImage(originFilePath, router.iOSLaunchImageOutputPath, size.width, size.height, `logo_en`)
    tools.zoomImage(originFilePath, router.iOSLaunchImageOutputPath, size.width * 2, size.height * 2, `logo_en@2x`)
    tools.zoomImage(originFilePath, router.iOSLaunchImageOutputPath, size.width * 3, size.height * 3, `logo_en@3x`)
    tools.zoomImage(originFilePath, router.androidMdpiOutputPath, size.width, size.height, `launch_logo_en`)
    tools.zoomImage(originFilePath, router.androidXdpiOutputPath, size.width * 2, size.height * 2, `launch_logo_en`)
    tools.zoomImage(originFilePath, router.androidXxdpiOutputPath, size.width * 3, size.height * 3, `launch_logo_en`)
  } else if (type === "copyright") {
    const size = {width: 236, height: 11}
    tools.zoomImage(originFilePath, router.iOSLaunchImageOutputPath, size.width, size.height, `copyright`)
    tools.zoomImage(originFilePath, router.iOSLaunchImageOutputPath, size.width * 2, size.height * 2, `copyright@2x`)
    tools.zoomImage(originFilePath, router.iOSLaunchImageOutputPath, size.width * 3, size.height * 3, `copyright@3x`)
    tools.zoomImage(originFilePath, router.androidMdpiOutputPath, size.width, size.height, `launch_copyright`)
    tools.zoomImage(originFilePath, router.androidXdpiOutputPath, size.width * 2, size.height * 2, `launch_copyright`)
    tools.zoomImage(originFilePath, router.androidXxdpiOutputPath, size.width * 3, size.height * 3, `launch_copyright`)
  }
}

module.exports = tools