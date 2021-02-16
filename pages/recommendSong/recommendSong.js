import PubSub from 'pubsub-js';
import request from '../../utils/request'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        day: '',
        month: '',
        recommendList: [],
        index: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let userInfo = wx.getStorageSync('userInfo');
        if (!userInfo) {
            wx.showToast({
                title: '请登录后再操作',
                icon: 'none',
                success: () => {
                    wx.navigateTo({
                        url: '/pages/login/login'
                    });
                }
            });
        }
        this.setData({
            day: new Date().getDate(),
            month: new Date().getMonth() + 1
        })
        this.getRecommendList();

        // 订阅来自songDetail页面的消息
        PubSub.subscribe('switchType', (msg, type) => {
            let { index, recommendList } = this.data;
            if (type === 'pre') {
                (index === 0) && (index = recommendList.length)
                index -= 1;
            } else {
                (index === recommendList.length - 1) && (index = -1)
                index += 1;
            }
            this.setData({
                index
            })
            let musicId = recommendList[index].id;
            PubSub.publish('switchIndex', musicId)
        })
    },
    async getRecommendList() {
        let recommendListData = await request('/recommend/songs')
        this.setData({
            recommendList: recommendListData.recommend
        })
    },
    toSongDetail(event) {
        let { song, index } = event.currentTarget.dataset;
        this.setData({
            index
        })
        wx.navigateTo({
            // 不转json的话会自动转为字符串，没办法读
            // 在Url传song,value是song JSON.stringify(song)
            // song的长度过长，传输时会被截掉一部分，不能传
            url: '/pages/songDetail/songDetail?musicId=' + song.id
        });
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})