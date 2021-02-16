import request from '../../utils/request'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        videoGroupList: [],
        currentNavId: '',
        videoList: [],
        videoLength: 0,
        videoId: '',
        videoTimeUpdate: [],
        isTrigger: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getVideoGroupListData();
    },
    // 跳转到搜素
    toSearch() {
        wx.navigateTo({
            url: '/pages/search/search'
        });
    },
    // 点击切换导航栏选中的回调
    native(event) {
        // let navId = event.currentTarget.id
        let navId = event.currentTarget.dataset.id
            // event.currentTarget.id方法，自动把id转为string
            // event.currentTarget.dataset.id方法，不会自动把id转为string，id是number
        this.setData({
            // navId乘1 转换为number，才能使navId和currentaId相等
            // currentId: navId * 1

            // 不需要乘1转number
            currentNavId: navId
        })
        this.getVideoList(this.data.currentNavId);
        wx.showLoading({
            title: "正在加载",
            mask: true
        });
    },
    // 获取导航栏视频列表数据
    async getVideoGroupListData() {
        let videoGroupListData = await request('/video/group/list')
        let videoGroupList = videoGroupListData.data.slice(0, 14)
        this.setData({
                videoGroupList,
                currentNavId: videoGroupListData.data[0].id
            })
            // 获取视频列表数据
        this.getVideoList(this.data.currentNavId);
    },
    // 获取视频列表数据功能函数
    async getVideoList(currentNavId) {
        this.setData({
            videoList: []
        })
        wx.showLoading({
            title: "正在加载",
            mask: true
        });
        let videoListData = await request('/video/group', { id: currentNavId })
            // 关闭消息提示框
        wx.hideLoading();
        let index = 0;
        let videoList = videoListData.datas.map(item => {
            item.id = index++;
            return item;
        })
        this.setData({
            videoList,
            isTrigger: false,
            videoLength: videoListData.datas.length
        })
        if (!this.data.videoLength) {
            wx.showToast({
                title: '暂无推荐视频，请稍后再试',
                icon: 'none'
            });
        }
    },
    // 点击播放/继续播放的回调
    /*  多个视频同步播放的问题：
        需求：
            1、在点击播放事件中，找到上一个播放的视频
            2、点击新视频前关闭上一个视频
        关键：
            1、如何找到上一个视频的id
                把当前id赋值给this.id保存起来，在下个视频播放时，this.id就是上一个视频id
            2、如何确定点击的播放的视频和正在播放的视频不是同一个
                把当前视频实例对象赋值给this.实例对象保存起来，在下个视频播放时，this.实例对象就是上一个视频实例对象，再进行判断
                id不相等，this.实例对象存在，就停止this.实例对象（就是上一个实例对象）

        方法一：单例模式：
            1、在需要创建多个对象的场景下，通过一个变量接收，始终保持一个对象
            2、节省内存空间

        方法二：图片转video，实现需求，性能优化，代码少
            1、给图片和video相同的id，点击事件时id相等时，相应id的图片才转相同id的video，自始至终只有一个video，其他都图片，不存在多个
               video播放的问题
    */
    // 点击播放/继续播放的回调
    handlePlay(event) {
        /**
         * 方法一：
         * // 当前的id
            let vid = event.currentTarget.id;
                //  关闭上一个视频思路：
                    // this.id和当前id不一样 与 有video实例对象时，执行停止当前实例对象
                    //  第一次没有this.vid不相等，也没有实例对象，不执行
                    //  之后点击其他视频时，下面赋值了this.vid是第一个vid，但创建了一个新的vid，不相等，也在第一次创建
                    //  了video实例（就是前一个视频的实例），所以前一个视频停止
                //
            this.vid !== vid && this.videoContext && this.videoContext.stop();
            // 赋值一个最新的当前的vid给this.vid
            this.vid = vid;
            // 创建一个控制当前id的video标签的实例对象
            this.videoContext = wx.createVideoContext(vid);
         */
        /**方法二： */
        let vid = event.currentTarget.id;
        this.setData({
            videoId: vid
        })
        this.videoContext = wx.createVideoContext(vid)
            // 如果播放过，跳转到之前位置继续播放
        let { videoTimeUpdate } = this.data
        let videoItem = videoTimeUpdate.find(item => item.vid === vid)
        if (videoItem) {
            this.videoContext.seek(videoItem.currentTime);
        }
        this.videoContext.play();
    },
    // 监听视频播放进度，播放时长记录及再次播放到之前进度条位置
    handleTimeUpdate(event) {
        let TimeUpdateObj = { vid: event.currentTarget.id, currentTime: event.detail.currentTime }
        let { videoTimeUpdate } = this.data;
        let TimeItem = videoTimeUpdate.find(item => item.vid === TimeUpdateObj.vid)
        if (TimeItem) {
            TimeItem.currentTime = event.detail.currentTime
        } else {
            videoTimeUpdate.push(TimeUpdateObj);
        }
        this.setData({
            videoTimeUpdate
        })
    },
    // 播放结束后移除播放进度
    handleEnd(event) {
        let { videoTimeUpdate } = this.data;
        // 找到当前的视频的id的下标
        let videoItem = videoTimeUpdate.findIndex(item => item.vid === event.currentTarget.id)
            // 移除videoTimeUpdate数组里的相应坐标，数量1个
        videoTimeUpdate.splice(videoItem, 1)
        this.setData({
            videoTimeUpdate
        })
    },
    // 下拉刷新
    handleFresh() {
        this.getVideoList(this.data.currentNavId);
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
        return {
            title: "云音乐，分享你的好心情！"
        }
    }
})