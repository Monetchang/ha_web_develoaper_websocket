const path = require("path")

const router = {}

const pathArray = path.join(__dirname).split("/")
pathArray.splice(5, 2)
const basicRoute = pathArray.join("/")

router.zipPath = path.join(__dirname, "zip")
router.unzipPath = path.join(__dirname, "unzip")

// Android 替换目录路径
router.androidLogoTargetPath = path.join( basicRoute, "/Business-Template-APP/android/app/src/main/res")

// React Native 替换目录路径
router.reactNativeBackgroundTargetPath = path.join( basicRoute, "/Business-Template-APP/app/images/pure/main_background")
router.reactNativeSecurityImageTargetPath = path.join( basicRoute, "/Business-Template-APP/security_image/production/")


module.exports = router