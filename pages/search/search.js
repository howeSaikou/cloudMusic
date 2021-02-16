import request from "../../utils/request"
let isSearch = true;
// pages/search/search.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        placeholderContent: '',
        hotList: [],
        searchContent: '',
        searchList: [],
        historyList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getInitData();
        this.getHistoryList();
    },
    // 获取初始化数据
    async getInitData() {
        let placeholderData = await request('/search/default');
        let hotListData = await request('/search/hot/detail')
        this.setData({
            placeholderContent: placeholderData.data.showKeyword,
            hotList: hotListData.data
        })
    },
    // 删除搜索
    deleteSearch() {
        this.setData({
            searchContent: '',
            searchList: []
        })
    },
    // 删除历史记录
    deleteHistory() {
        wx.showModal({
            content: '确认删除吗？',
            showCancel: true,
            cancelText: '取消',
            cancelColor: '#000000',
            confirmText: '确定',
            confirmColor: '#3CC51F',
            success: (result) => {
                if (result.confirm) {
                    this.setData({
                        historyList: []
                    })
                    wx.removeStorageSync('searchHistory');
                }
            }
        });

    },
    // 获取历史搜索记录
    getHistoryList() {
        let historyList = wx.getStorageSync('searchHistory');
        if (historyList) {
            this.setData({
                historyList
            })
        }
    },
    // 获取关键词搜索列表
    async getSearchList() {
        let { searchContent, historyList } = this.data;
        if (!searchContent) {
            this.setData({
                searchContent: ''
            })
            return;
        }
        let searchListData = await request('/search', { keywords: searchContent, limit: 10 });
        this.setData({
                searchList: searchListData.result.songs
            })
            // 将搜索记录添加到历史记录中
        if (historyList.indexOf(searchContent) !== -1) {
            historyList.splice(historyList.indexOf(searchContent), 1)
        }
        historyList.unshift(searchContent);
        this.setData({
            historyList
        })
        wx.setStorageSync('searchHistory', historyList);
    },
    handleInput(event) {
        let searchContent = event.detail.value.trim();
        this.setData({
                searchContent
            })
            // 函数节流
        if (!isSearch) {
            return;
        }
        isSearch = false;
        this.getSearchList();
        setTimeout(() => {
            isSearch = true
        }, 300)
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