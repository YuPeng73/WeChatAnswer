// components/wrongModal/wrongModal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 是否显示
    modalShow: {
      type: Boolean,
      value: false
    },
    // 题库
    questionList: {
      type: Array,
      value: []
    },
    // 课程ID
    testId: {
      type: String,
      value: '101-1'
    },
    // 题库乱序index
    shuffleIndex: {
      type: Array,
      value: []
    },
    // 错题题数-乱序
    wrongList: {
      type: Array,
      value: []
    },
    // 错题题数-正序
    wrongListSort: {
      type: Array,
      value: []
    },
    // 选择的答案
    chooseValue: {
      type: Array,
      value: []
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    index: 0 // wrongList的index
  },
  /**
   * 组件所在页面的生命周期
   */
  pageLifetimes: {
    show: function () {
      // 页面被展示
      console.log('show')
      console.log(this.data.questionList)
      console.log(this.data.wrongList)
    },
    hide: function () {
      // 页面被隐藏
    },
    resize: function (size) {
      // 页面尺寸变化
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 下一题
    next: function(){
      if (this.data.index < this.data.wrongList.length - 1){
        // 渲染下一题
        this.setData({
          index: this.data.index + 1
        })
      }
    },
    // 关闭弹窗
    closeModal: function(){
      this.setData({
        modalShow: false
      })
    },
    // 再来一次
    again: function(){
      wx.reLaunch({
        url: '../test/test?testId=' + this.data.testId
      })
    },
    // 返回首页
    toIndex: function () {
      wx.reLaunch({
        url: '../home/home'
      })
    },
  }
})
