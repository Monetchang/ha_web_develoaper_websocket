const path = require("path")

const router = {}

const pathArray = path.join(__dirname).split("/")
pathArray.splice(5, 2)
const basicRoute = pathArray.join("/")
const config = require("../config")

router.originPath = path.join(__dirname, "origin/")
router.outputPath = path.join(__dirname, "output/")

// Origin Path
router.imagesOriginPath = path.join(router.originPath, "images")
router.zipOriginPath = path.join(router.originPath, "zip")
router.iOSXcodeContentJsonOriginPath = path.join(__dirname, "Contents.json")

// Output Path
router.logoOutputPath = path.join(router.outputPath, "logo")
router.securityImageOutputPath = path.join(router.outputPath, "securityImage")

// iOS Output Path
router.iOSOutputPath = path.join(router.logoOutputPath, "iOS")
router.iOSXcodeOutputPath = path.join(router.iOSOutputPath, "xcode")
router.iOSLaunchImageOutputPath = path.join(router.iOSOutputPath, "launchImages")
router.iOSXcodeContentJsonOutputPath = path.join(router.iOSXcodeOutputPath, "Contents.json")

// Android Output Path
router.androidOutputPath = path.join(router.logoOutputPath, "android")
router.androidHdpiOutputPath = path.join(router.androidOutputPath, "mipmap-hdpi")
router.androidMdpiOutputPath = path.join(router.androidOutputPath, "mipmap-mdpi")
router.androidXdpiOutputPath = path.join(router.androidOutputPath, "mipmap-xhdpi")
router.androidXxdpiOutputPath = path.join(router.androidOutputPath, "mipmap-xxhdpi")

// React Native Output Path
router.reactnativeOutputPath = path.join(router.logoOutputPath, "reactnative")
router.reactnativeBackgroundOutputPath = path.join(router.outputPath, "background")

// iOS Target Path
router.iOSLogoTargrtPath = path.join( config.projectPath, "/ios/LaunchImages")
router.iOSXcodeLogoTargrtPath = path.join( config.projectPath, "/ios/DvaStarter/Images.xcassets/AppIcon.appiconset")

// Android Target Path
router.androidLogoTargetPath = path.join( config.projectPath, "/android/app/src/main/res")

// React Native Target Path
router.reactNativeLogoTargetPath = path.join( config.projectPath, "/app/images/pure/login_icon")
router.reactNativeBackgroundTargetPath = path.join( config.projectPath, "/app/images/pure/main_background")
router.reactNativeSecurityImageTargetPath = path.join( config.projectPath, "/security_image/production/")


module.exports = router