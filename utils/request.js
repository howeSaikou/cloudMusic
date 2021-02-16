import config from './config'
export default (url, data = {}, method = 'GET') => {
    return new Promise((resolve, reject) => {
        // new Promise 初始化Promise实例的状态为pending
        wx.request({
            url: config.mobileHost + url,
            data,
            method,
            header: {
                cookie: wx.getStorageSync('cookies') ? wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1) : ''
            },
            success: (res) => {
                if (data.isLogin) {
                    wx.setStorage({
                        key: 'cookies',
                        data: res.cookies
                    })
                }
                resolve(res.data) //reslove修改promise的状态为成功状态resolved
            },
            fail: (err) => {
                reject(err) //reject修改promise的状态为失败状态rejected
            }
        })
    })
}