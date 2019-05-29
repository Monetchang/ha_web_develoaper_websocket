const wait = async (time = 1000 * 1) => {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, time)
    })
}

module.exports = wait