import moment from 'moment'
import PubSub from 'pubsub-js'
import request from '../../utils/request'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isPlay: false,
        musicId: '',
        song: {},
        musicLink: '',
        currentTime: '00:00',
        durationTime: '00:00',
        currentWidth: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        // options：用于接收路由跳转的query参数
        let musicId = options.musicId
        this.setData({
                musicId
            })
            // 获取音乐详情
        this.getSongDetail(musicId);
        // properties(Read only)(duration,currentTime,paused,buffered)
        // properties(src(m4a, aac, mp3, wav),startTime,title,epname,singer,coverImgUrl,webUrl,protocol)
        // 创建背景音频实例 放到this里，this就是页面，在页面的所有函数都能用
        this.backAudioManager = wx.getBackgroundAudioManager();
        // 监听音频实例的播放/暂停/停止，修改isPlay的参数
        this.backAudioManager.onPause(() => {
            this.changePlayState(false);
        });
        this.backAudioManager.onPlay(() => {
            this.changePlayState(true);
        });
        this.backAudioManager.onStop(() => {
            this.changePlayState(false);
        });
        this.backAudioManager.onEnded(() => {
            PubSub.publish('switchType', 'next')
            this.setData({
                currentWidth: 0,
                currentTIme: '00:00',
            })
        })
        this.backAudioManager.onTimeUpdate(() => {
            let currentWidth = this.backAudioManager.currentTime / this.backAudioManager.duration * 450
            let currentTime = moment(this.backAudioManager.currentTime * 1000).format('mm:ss')
            this.setData({
                currentTime,
                currentWidth
            })
        });
    },
    changePlayState(isPlay) {
        this.setData({
            isPlay
        })
    },
    // 请求歌曲详情
    async getSongDetail(musicId) {
        let songData = await request('/song/detail', { ids: musicId })
        let durationTime = moment(songData.songs[0].dt).format('mm:ss')
        this.setData({
            song: songData.songs[0],
            durationTime
        })
        wx.setNavigationBarTitle({
            title: this.data.song.name
        });
    },
    // 点击播放/暂停的回调
    handleMusicPlay() {
        let isPlay = !this.data.isPlay;
        let { musicId, musicLink } = this.data;
        // 控制音乐播放/暂停的功能
        this.musicControl(isPlay, musicId, musicLink);
    },
    // 控制音乐播放/暂停的功能函数
    async musicControl(isPlay, musicId, musicLink) {

        if (isPlay) {
            // 没有播放链接时获取音乐播放链接，有就不用获取，直接执行下面部分播放
            if (!musicLink) {
                let musicData = await request('/song/url', { id: musicId });
                musicLink = musicData.data[0].url;
            }
            this.setData({
                    musicLink
                })
                // 给音频实例链接及名称以播放
            this.backAudioManager.src = musicLink;
            this.backAudioManager.title = this.data.song.name;
        } else {
            this.backAudioManager.pause();
        }
    },
    // 控制切换歌曲
    handleSwitch(event) {
        this.backAudioManager.stop();
        let type = event.currentTarget.id;
        PubSub.subscribe('switchIndex', (msg, musicId) => {
            // 获取音乐信息
            this.getSongDetail(musicId);
            // 自动播放
            this.musicControl(true, musicId)
                // 销毁订阅
            PubSub.unsubscribe('switchIndex');
        })
        PubSub.publish('switchType', type)

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