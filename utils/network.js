const axios = require('axios')
let instance = axios.create({
    baseURL: 'http://localhost:3001',
    timeout: 1000 * 10,
    headers: {}
});

const network = {
    get: async (requestConfig) => {
        let result = null
        let error = null
        try {
            const res = await instance.get(
                requestConfig.path,
                requestConfig.data
            )
            return res.data
        } catch (e) {
            // console.log(error)
            error = e
            return {
                error: e,
                data: null,
            }
        }
    },
    post: async (requestConfig) => {
        let result = null
        let error = null
        // console.log('network post request config', JSON.stringify(requestConfig))
        try {
            const res = await instance.post(
                requestConfig.path,
                requestConfig.data
            )
            return res.data
        } catch (e) {
            // console.log(error)
            error = e
            return {
                error: e,
                data: null,
            }
        }
    },
}

network._ = {
    get: async (path, data) => await network.get({path, data}),
    post: async (path, data) => await network.post({path, data}),
}

network.setup = (baseURL) => {
    console.log(`network.setup(${baseURL})`)
    instance = axios.create({
        baseURL: baseURL,
        timeout: 1000 * 10,
        headers: {}
    });
}

module.exports = network