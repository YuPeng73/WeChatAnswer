# WeChatAnswer
开发答题类微信小程序详细记录，[简书地址](https://www.jianshu.com/p/18efe304ecdb)

前言：这几天在公司闲闲无事，恰好团队有通过在线考试的需求，于是自发撸了一个简单的考试类微信小程序。 纯前端，数据写好在data.json文件里，每一次考试结果利用缓存存储。

## 一、 试题数据
新建小程序项目时，我们看到已经有index和logs页，先不要管他。我们新增一个和pages文件夹同级的data文件夹，新建json.js文件存放我们的数据。

![](https://upload-images.jianshu.io/upload_images/9761590-196102a283f770d0.PNG?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 1. 数据格式：
```
// data/json.js
var json = {
    "001": [
        {
          "question": "爸爸的爸爸叫什么?",
          "option": {
            "A": "爷爷",
            "B": "姥爷",
            "C": "叔叔",
            "D": "伯伯",
            "E": "阿姨",
            "F": "老舅"
          },
          "true": "A",   // 正确答案
          "type": 1,     // 类型 1 单选  2 多选
          "scores": 10,  // 分值
          "checked": false  // 默认没有选中
        },
        {
          "question": "妈妈的姐妹叫什么?",
          "option": {
            "A": "姥姥",
            "B": "奶奶",
            "C": "叔叔",
            "D": "大姨",
            "E": "小姨",
            "F": "老舅"
          },
          "true": ["D", "E"],   // 正确答案
          "type": 2,     // 类型 1 单选  2 多选
          "scores": 10,  // 分值
          "checked": false  // 默认没有选中
        },
        ... ...
    ],
    "002": [
        // ...数据格式同上
    ]

}
```



#### 2. 导出数据
```
// data/json.js

var json = {...}

module.exports = {
  questionList: json
}
```
定义完数据后，要在json.js最后面使用module.exports导出。

#### 3. 导入数据
```
// app.js

// 导入数据
var jsonList = require('data/json.js');

App({
  globalData: {
    questionList: jsonList.questionList  // 拿到答题数据
  }
})
```

在app.js里使用require导入数据，并且定义在全局变量globalData里。将来使用的时候：
```
首先 var app = getApp();
然后 app.globalData.questionList 就可以拿到导出的json数据。
```

因为我们不只有一套试卷，前面在json里定义了两个数组：001和002。之后可以通过
`app.globalData.questionList["001"]`选择性导入试题数据。

## 二、 home页面（考试入口）
在pages文件夹里新增home页面。首页授权登录后点击跳转到该页面，页面上有两个模块：001和002。点击模块进行对应的考试。

#### 1. 主要代码
home.wxml
```
<view class="page">
  <view class="page-title">请选择试题：</view>
  <view class="flex-box">
    <view class="flex-item"><view class="item bc_green" bindtap="toTestPage" data-testId="001">001</view></view>
    <view class="flex-item"><view class="item bc_red" bindtap="toTestPage" data-testId="002">002</view></view>
  </view>
</view>
```

home.js
```
Page({
  data: {

  },
  onLoad: function (options) {

  },
  toTestPage: function (e) {
    let testId = e.currentTarget.dataset['testid'];
    wx.navigateTo({
      url: '../test/test?testId=' + testId
    })
  }
})
```

#### 2. 页面
![](https://upload-images.jianshu.io/upload_images/9761590-43e8d8d5f36503a4.PNG?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


## 三、 答题页 和 答题结束页
不管是001还是002试题，都是共用一套页面模板。在这个页面要实现答题（含：每次进入试卷试题都要乱序排列）、评分、查看错题、记录答题数据（时间/试题id/得分）的功能。

#### 1. 实现简单的问答页面 (test页面)
首先新建一个test页面文件夹，在test.wxml文件里编写我们的答题模板。第一步先不要考虑乱序排列和记录答题功能，只先实现简单的选择答案和下一题、评分的功能。

###### test.wxml 解析
![](https://upload-images.jianshu.io/upload_images/9761590-d80617d34e6304fd.PNG?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


答题模板很简单，主要由题目、答案（单选/多选）、下一题（提交）、退出答题组成。

###### test.wxml 代码
```
<!--pages/test/test.wxml-->
<view class="page">
  <!--标题-->
  <view class='page__hd'>
    <view class="page__title">
      {{index+1}}、{{questionList[index].question}}
      {{questionList[index].type==1?"【单选】":"【多选】"}}
      （{{questionList[index].scores}}分）
    </view>
  </view>
  <!--内容-->
  <view class="page__bd">
    <radio-group class="radio-group" bindchange="radioChange" wx:if="{{questionList[index].type == 1}}">
      <label class="radio my-choosebox" wx:for="{{questionList[index].option}}" wx:for-index="key"  wx:for-item="value">
        <radio value="{{key}}" checked="{{questionList[index].checked}}"/>{{key}}、{{value}}
      </label>
    </radio-group>
    <checkbox-group bindchange="checkboxChange" wx:else>
      <label class="checkbox my-choosebox" wx:for="{{questionList[index].option}}" wx:for-index="key"  wx:for-item="value">
        <checkbox value="{{key}}" checked="{{questionList[index].checked}}"/>{{key}}、{{value}}
      </label>
    </checkbox-group>
  </view>
  <!--按钮-->
  <view class='page_ft'>
    <view class='mybutton'>
      <button bindtap='nextSubmit' wx:if="{{index == questionList.length-1}}">提交</button>
      <button bindtap='nextSubmit' wx:else>下一题</button>
      <text bindtap='outTest' class="toindex-btn">退出答题</text>
    </view>
  </view>
</view>

```

###### test.wxss 样式
```
/* pages/test/test.wxss */
.page {
  padding: 20rpx;
}
.page__bd {
  padding: 20rpx;
}
.my-choosebox {
  display: block;
  margin-bottom: 20rpx;
}
.toindex-btn {
  margin-top: 20rpx;
  display:inline-block;
  line-height:2.3;
  font-size:13px;
  padding:0 1.34em;
  color:#576b95;
  text-decoration:underline;
  float: right;
}
```


###### test.js 解析
![](https://upload-images.jianshu.io/upload_images/9761590-dab434b8815c094a.PNG?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/9761590-9f78c318b8c8cfbf.PNG?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

###### test.js
```
var app = getApp();
Page({
  data: {
    index: 0,  // 题目序列
    chooseValue: [], // 选择的答案序列
    totalScore: 100, // 总分
    wrongList: [], // 错误的题目集合
  },
  onLoad: function (options) {
    console.log(options);
    wx.setNavigationBarTitle({ title: options.testId }) // 动态设置导航条标题

    this.setData({
      questionList: app.globalData.questionList[options.testId],  // 拿到答题数据
      testId: options.testId // 课程ID
    })
  },
  /*
  * 单选事件
  */
  radioChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    this.data.chooseValue[this.data.index] = e.detail.value;
    console.log(this.data.chooseValue);
  },
  /*
  * 多选事件
  */
  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    this.data.chooseValue[this.data.index] = e.detail.value.sort();
    console.log(this.data.chooseValue);
  },
  /*
  * 下一题/提交 按钮
  */
  nextSubmit: function () {
    // 如果没有选择
    if (this.data.chooseValue[this.data.index] == undefined || this.data.chooseValue[this.data.index].length == 0) {
      wx.showToast({
        title: '请选择至少一个答案!',
        icon: 'none',
        duration: 2000,
        success: function () {
          return;
        }
      })
      return;
    }

    // 判断答案是否正确
    this.chooseError();

    // 判断是不是最后一题
    if (this.data.index < this.data.questionList.length - 1) {
      // 渲染下一题
      this.setData({
        index: this.data.index + 1
      })
    } else {
      // 跳转到结果页

    }
  },
  /*
  * 错题处理
  */
  chooseError: function () {
    var trueValue = this.data.questionList[this.data.index]['true'];
    var chooseVal = this.data.chooseValue[this.data.index];
    console.log('选择了' + chooseVal + '答案是' + trueValue);
    if (chooseVal.toString() != trueValue.toString()) {
      this.data.wrongList.push(this.data.index);
      this.setData({
        totalScore: this.data.totalScore - this.data.questionList[this.data.index]['scores']  // 扣分操作
      })
    }
  }
})
```
至此，一个简单的答题、下一题的页面就完成了。

#### 2. 答题结束页（results页面）
前面我们实现了题目的展示和下一题的操作，那到最后一题的提交按钮应该发生什么呢？通常是告诉用户一个答题结果。下面我们新建一个results页面来专门展示用户答题结果（包括得分、评价、查看错题按钮和返回首页按钮）

###### test.js 跳转传参
![](https://upload-images.jianshu.io/upload_images/9761590-0f71c9ab38e44620.PNG?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



```
// 跳转到结果页
let wrongList = JSON.stringify(this.data.wrongList);
let chooseValue = JSON.stringify(this.data.chooseValue);
wx.navigateTo({
    url: '../results/results?totalScore=' + this.data.totalScore + '&wrongList=' + wrongList + '&chooseValue=' + chooseValue
})
```
首先我们要完善test.js里的nextSubmit函数，使点击提交按钮的时候跳转到results结果页。这里我们传入了totalScore得分、wrongList错题集合、chooseValue用户选择的答案集合三个数据。

###### results.wxml 
我们先来看结果页的页面结构
![](https://upload-images.jianshu.io/upload_images/9761590-b0d380931da8edda.PNG?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



results.wxml 代码
```
<view class="page">
  <!--标题-->
  <view class='page-head'>
    <view class="page-title">
      答题结束！您的得分为:
    </view>
    <!--分数-->
    <view class='page-score'>
      <text class="score-num">{{totalScore}}</text>
      <text class="score-text">分</text>
    </view>
    <text class="score-remark">{{totalScore==100?remark[0]:(totalScore>=80?remark[1]:remark[2])}}</text>  <!-- 评价 -->
  </view>
  <!--查询错误-->
  <view class='page-footer'>
    <view class="wrong-view" wx:if="{{wrongList.length > 0}}">
      <text>错误的题数：</text>
      <text wx:for="{{wrongList}}">[{{item-0+1}}]</text> 题
    </view>
    <view class="wrong-btns">
      <button type="default" bindtap="toView" hover-class="other-button-hover" class="wrong-btn" wx:if="{{wrongList.length > 0}}"> 点击查看 </button>
      <button type="default" bindtap="toIndex" hover-class="other-button-hover" class="wrong-btn"> 返回首页 </button>
    </view>
  </view>
</view>
```

###### results.js
```
// pages/results/results.js
var app = getApp();
Page({
  data: {
    totalScore: null, // 分数
    wrongList: [], // 错误的题数
    chooseValue: [], // 选择的答案
    remark: ["好极了！你很棒棒哦", "哎哟不错哦", "别灰心，继续努力哦！"], // 评语
  },
  onLoad: function (options) {
    console.log(options);
    wx.setNavigationBarTitle({ title: options.testId }) // 动态设置导航条标题

    let wrongList = JSON.parse(options.wrongList);
    let chooseValue = JSON.parse(options.chooseValue);
    this.setData({
      totalScore: options.totalScore,
      wrongList: wrongList,
      chooseValue: chooseValue
    })
    console.log(this.data.chooseValue);
  },
  // 查看错题
  toView: function () {

  },
  // 返回首页
  toIndex: function () {
    wx.switchTab({
      url: '../home/home'
    })
  }
})
```

* 解析： 我们可以看到在onLoad函数里，拿到了我们需要的数据：totalScore 用户得分、 wrongList 错题集合、 chooseValue 用户选择的答案。接下来会自动渲染到页面上。
* 数组类型的数据要经过JSON.parse()转换。

## 四、 查看错题弹层组件
#### 查看错题弹窗（wrongModal弹窗组件） 
我们看到results页面有一个点击查看的按钮，当点击它的时候，会弹出一个层，展示用户的错题信息。包括错误的题目，用户选择的答案和该题正确的答案。
![](https://upload-images.jianshu.io/upload_images/9761590-0e2841220506240c.PNG?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


###### results 使用组件弹层
首先要在results.json文件里进行配置
```
// results.json
{
  "navigationBarTitleText": "WeChatTest",
  "usingComponents": {
    "wrong-modal": "/components/wrongModal/wrongModal"
  }
}
```

然后在results.wxml里引入组件
```
<wrong-modal modalShow="{{modalShow}}" wrongList="{{wrongList}}" wrongListSort="{{wrongListSort}}" chooseValue="{{chooseValue}}" questionList="{{questionList}}" testId="{{testId}}"></wrong-modal>
```

###### wrongModal.wxml 
```
<!--components/wrongModal/wrongModal.wxml-->
<view class="modal-page" wx:if="{{modalShow}}">
  <view class="modal-mask" bindtap="closeModal"></view>
  <!-- 内容 -->
  <view class="modal-content">
    <view class="modal-title">
      题目: {{questionList[wrongList[index]].question}} 
      {{questionList[wrongList[index]].type==1?"【单选】":"【多选】"}}
      （{{questionList[wrongList[index]].scores}}分）
    </view>
    <view class="modal-body">
      <radio-group class="radio-group" bindchange="radioChange" wx:if="{{questionList[wrongList[index]].type == 1}}">
        <label class="radio my-choosebox" wx:for="{{questionList[wrongList[index]].option}}" wx:for-index="key"  wx:for-item="value">
          <radio disabled="{{true}}" value="{{key}}" checked="{{questionList[wrongList[index]].checked}}"/>{{key}}、{{value}}
        </label>
      </radio-group>
      <checkbox-group bindchange="checkboxChange" wx:else>
        <label class="checkbox my-choosebox" wx:for="{{questionList[wrongList[index]].option}}" wx:for-index="key"  wx:for-item="value">
          <checkbox disabled="{{true}}" value="{{key}}" checked="{{questionList[wrongList[index]].checked}}"/>{{key}}、{{value}}
        </label>
      </checkbox-group>
    </view>
    <!-- 答案解析 -->
    <view class="modal-answer">
      <text class="answer-text wrong-answer">
        您的答案为 {{chooseValue[wrongList[index]]}}
      </text>
      <text class="answer-text true-answer">
        正确答案为 {{questionList[wrongList[index]]['true']}}
      </text>
    </view>
    <!-- 操作按钮 -->
    <view class="modal-button">
      <view wx:if="{{index == wrongList.length-1}}" class="modal-btns">
        <button bindtap='again' class="modal-btn">再来一次</button>
        <button bindtap='toIndex' class="modal-btn">返回首页</button>
      </view>
      <button bindtap='next' wx:else class="modal-btn">下一题</button>
    </view>
  </view>
</view>
```

###### wrongModal.js
```
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
    // 错题题序集合
    wrongList: {
      type: Array,
      value: []
    },
    // 选择的答案集合
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
   * 组件的方法列表
   */
  methods: {
    // 下一题
    next: function () {
      if (this.data.index < this.data.wrongList.length - 1) {
        // 渲染下一题
        this.setData({
          index: this.data.index + 1
        })
      }
    },
    // 关闭弹窗
    closeModal: function () {
      this.setData({
        modalShow: false
      })
    },
    // 再来一次
    again: function () {
      wx.reLaunch({
        url: '../test/test?testId=' + this.data.testId
      })
    },
    // 返回首页
    toIndex: function () {
      wx.reLaunch({
        url: '../home/home'
      })
    }
  }
})
```

看代码很容易理解，主要是在Component组件的properties定义组件要接收的数据，methods里定义方法。不管是文件结构还是事件都和test页面很像。区别主要是wrongModal页面展示是筛选过的用户答错的题。 

* 解析
```
questionList[wrongList[index]]  // 试题[错题集合[当前index]]
例如用户第2、3题答题错误(index从0开始)  错题集合=[2,3] 当前index=0 下一题index+1
那么依次展示的就是questionList[2]、questionList[3]题
```


现在，一个简单的答题小程序就实现了。 但是现在每次出现的题都是固定的，假如我们001题库里有20道题，要求每次随机抽选10道题考核，并且这10道题乱序排列。应该怎么做呢？只要加一个乱序的步骤就可以了。


## 五、 乱序抽题
#### 1. 实现乱序抽题
![](https://upload-images.jianshu.io/upload_images/9761590-0ac0913dd68fa887.PNG?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



###### js代码
```
  onLoad: function (options) {
    // ... ...省略

    let count = this.generateArray(0, this.data.questionList.length - 1); 
    this.setData({
      shuffleIndex: this.shuffle(count).slice(0, 10) // 生成随机题序并进行截取
    })
    console.log(this.data.shuffleIndex); // [2,0,3,1,5,4...]
  },
  /*
  * 数组乱序/洗牌
  */
  shuffle: function (arr) {
    let i = arr.length;
    while (i) {
      let j = Math.floor(Math.random() * i--);
      [arr[j], arr[i]] = [arr[i], arr[j]];
    }
    return arr;
  },
  /**
   * 生成一个从 start 到 end 的连续数组
   */
  generateArray: function (start, end) {
    return Array.from(new Array(end + 1).keys()).slice(start)
  },
```

###### test.wxml
![](https://upload-images.jianshu.io/upload_images/9761590-5cc3e23dc2085ccc.PNG?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


* 解析：
把页面上所有的`questionList[index]` 替换成 `questionList[shuffleIndex[index]]`, 
`shuffleIndex` 是一个数组，里面存放乱序以后的题目下标。用index控制依次展示乱序后的题。

#### 2. 完善结果页 和 错题弹层组件
* 做完以上哪些，我们发现：
1. results页面错误的题序也乱序了
2. 点击查看弹出的wrongModal的错题和用户答错的题不一致（因为wrongModal里的数据依然是正序排列的题目下标）
3. 用户选择的答案和wrongModal里展示的选择的答案不一致。（原因同上）

* 解决：

###### test页面（test.js）
① data
```
data: {
    index: 0,  // 题目序列
    chooseValue: [], // 选择的答案序列
    totalScore: 100, // 总分
    wrongList: [], // 错误的题目集合-乱序
    wrongListSort: [], // 错误的题目集合-正序
},
```
data里新增wrongListSort集合

② chooseError方法
```
// chooseError 错题处理方法更改如下
chooseError: function () {
    var trueValue = this.data.questionList[this.data.shuffleIndex[this.data.index]]['true'];
    var chooseVal = this.data.chooseValue[this.data.index];
    console.log('选择了' + chooseVal + '答案是' + trueValue);
    if (chooseVal.toString() != trueValue.toString()) {
      this.data.wrongList.push(this.data.shuffleIndex[this.data.index]);
      this.data.wrongListSort.push(this.data.index);
      this.setData({
        totalScore: this.data.totalScore - this.data.questionList[this.data.shuffleIndex[this.data.index]]['scores']  // 扣分操作
      })
    }
  }
```

* 解析：
```
var trueValue = this.data.questionList[this.data.shuffleIndex[this.data.index]]['true'];
// 当前正确答案更新为 乱序排列后的当前题的正确答案

this.data.wrongList.push(this.data.shuffleIndex[this.data.index]);
// wrongList错题集合里保存 乱序排列后的错题题序，
如错误的题为: [2,0,3] 相当于 001题库的[2,0,3]

this.data.wrongListSort.push(this.data.index);
// wrongListSort错题集合里保存 当前题目相对于乱序排列后的题的下标 
例如 shuffleIndex = [2,0,1,3] 用户做错了第3、4题， wrongListSort保存为[2,3]

this.setData({
    totalScore: this.data.totalScore - this.data.questionList[this.data.shuffleIndex[this.data.index]]['scores']  // 扣分操作
})
// 扣分操作，逻辑同上，扣的是乱序后对应的题目分值
```

③ nextSubmit 方法
```
// 判断是不是最后一题
if (this.data.index < this.data.questionList.length - 1) {
    // ...
} else {
  // 跳转到结果页
  let wrongList = JSON.stringify(this.data.wrongList);
  let wrongListSort = JSON.stringify(this.data.wrongListSort);
  let chooseValue = JSON.stringify(this.data.chooseValue);
  wx.navigateTo({
    url: '../results/results?totalScore=' + this.data.totalScore + '&wrongList=' + wrongList + '&chooseValue=' + chooseValue + '&wrongListSort=' + wrongListSort + '&testId=' + this.data.testId
  })
}
```
把wrongListSort传递给results页面（注：这里的wrongList也已经更新为乱序后的题目集合）

###### results页面
① results.js
```
// results.js
data: {
    wrongList: [], // 错误的题数-乱序
    wrongListSort: [],  // 错误的题数-正序
},
onLoad: function (options) {
    // ... 省略

    let wrongList = JSON.parse(options.wrongList);
    let wrongListSort = JSON.parse(options.wrongListSort);

    this.setData({
      wrongList: wrongList,
      wrongListSort: wrongListSort,
    })
},
```
data里定义wrongListSort，onLoad生命周期里接收并且赋值。

② results.wxml
```
// results.wxml
<view class="wrong-view" wx:if="{{wrongList.length > 0}}">
    <text>错误的题数：</text>
    <text wx:for="{{wrongListSort}}">[{{item-0+1}}]</text> 题
</view>

<wrong-modal modalShow="{{modalShow}}" wrongList="{{wrongList}}" wrongListSort="{{wrongListSort}}" chooseValue="{{chooseValue}}" questionList="{{questionList}}" testId="{{testId}}"></wrong-modal>
```
* 解析：
错误的题数: 如果展示wrongList则是[2],[0],[3]的相对于题库的乱序效果，wrongListSort 则显示相对于当次测试的错题index。

`<wrong-modal>`组件绑定`wrongListSort`数据。因为：
wrongListSort还有另一个需要用到的场景，即wrongModal错题弹层，展示“你选择的答案是XX”。在test.js里，我们保存用户本次考试的选项集合是根据当前题目的下标，
```
// test.js
this.data.chooseValue[this.data.index] = e.detail.value;
```
例如一共有三道题，this.data.chooseValue = ["B","C",["A","D"]]对应三道题的用户选项，
假如用户答错第二、三题，wrongListSort里存放的就是[1,2]的错题下标，通过index切换可以依次得到当前错题的用户选项。
```
// wrongModal.wxml
{{chooseValue[wrongListSort[index]]}}
```

###### wrongModal组件
① wrongModal.js
```
// wrongModal.js
  properties: {
    // ... 省略
    // 错题题数-乱序
    wrongList: {
      type: Array,
      value: []
    },
    // 错题题数-正序
    wrongListSort: {
      type: Array,
      value: []
    }
  },
```
properties新定义要接收的 wrongListSort 数据

① wrongModal.wxml
```
// wrongModal.wxml
<!-- 答案解析 -->
<view class="modal-answer">
  <text class="answer-text wrong-answer">
    您的答案为 {{chooseValue[wrongListSort[index]]}}
  </text>
  <text class="answer-text true-answer">
    正确答案为 {{questionList[wrongList[index]]['true']}}
  </text>
</view>
```
【您的答案为】 表达式更新。

## 五、 缓存用户的答题数据
首先我们需要一个Logs页面来展示用户的答题数据。在新建小程序项目时已经生成了一个Logs页面，我们就在上面改改就好。
#### 1. 设置缓存
因为是纯前端的小程序，所以我们用缓存来保存答题记录。 在test.js里设置。
![](https://upload-images.jianshu.io/upload_images/9761590-f636fa5d876974eb.PNG?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


```
// test.js

  // 设置缓存
  var logs = wx.getStorageSync('logs') || []
  let logsList = { "date": Date.now(), "testId": this.data.testId, "score": this.data.totalScore }
  logs.unshift(logsList);
  wx.setStorageSync('logs', logs);
```
每次答题结束都拿到当前的logs缓存数据，在logList手动定义数据格式（当前时间戳/试题id/得分），追加到拿到的logs数据里，最后调用`wx.setStorageSync()`接口保存logs数据。

#### 2. 拿到缓存
logs.js
```
//logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    logs: [],
  },
  onShow: function () {
    this.setData({
      logs: this.formatLogs()
    })
  },
  // 拿到缓存并格式化日期数据
  formatLogs: function () {
    let newList = [];
    (wx.getStorageSync('logs') || []).forEach(log => {
      if (log.date) {
        log['date'] = util.formatTime(new Date(log.date));
        newList.push(log);
      }
    })
    return newList;
  }
})
```
因为数据的时间是个时间戳，所以我们导入util.js文件，使用里面的formatTime方法来转换时间格式。
在data里我们定义了logs空数组，在formatLogs函数里进行`wx.getStorageSync('logs')`拿到缓存并遍历-转换时间格式-添加到新的空数组，最后返回新数组的操作。在OnShow生命周期里，我们调用formatLogs方法，给logs赋值。

#### 3. 数据渲染
###### logs.wxml
```
<!--logs.wxml-->
<view class="page">
  <view class="table" wx:if="{{logs.length>0}}">
    <view class="tr bg-w">
      <view class="th first">时间</view>
      <view class="th">试题</view>
      <view class="th ">得分</view>
    </view>
    <block wx:for="{{logs}}" wx:for-item="item">
      <view class="tr">
        <view class="td first">{{item.date}}</view>
        <view class="td">{{item.testId}}</view>
        <view class="td">{{item.score}}</view>
      </view>
    </block>
  </view>
  <view class="no-record" wx:else>
    <image src="/image/wechat.png" class="no-image"></image>
    <text class="no-text">没有数据哦~</text>
  </view>
</view>
```
自己写一个table结构，遍历logs缓存数据，展示 答题时间/试题id/得分 等数据。 这里我们还进行了判断，如果没有数据，展示没有数据的提示。

###### logs.wxss 
```
.table {
 border: 0px solid darkgray;
 font-size: 12px;
}
.tr {
 display: flex;
 width: 100%;
 justify-content: center;
 height: 2rem;
 align-items: center;
}
.td {
  width:40%;
  justify-content: center;
  text-align: center;
}
.bg-w{
 background: snow;
}
.th {
 width: 40%;
 justify-content: center;
 background: #3366FF;
 color: #fff;
 display: flex;
 height: 2rem;
 align-items: center;
}
.first {
  flex:1 0 auto;
}
.no-record {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.no-image {
  width: 200rpx;
  height: 200rpx;
  margin-top: 200rpx;
  margin-bottom: 40rpx;
}
.no-text {
  font-size: 16px;
  color: #ccc;
  display: block;
}
```

#### 4. tabBar页面
这里我们已经完成了logs页面，但是它的入口在哪里呢？不要急，我们现在把home页改改，改成tabBar页面。

###### app.json
```
  "tabBar": {
    "color": "#666666",
    "selectedColor": "#3cc51f",
    "borderStyle": "black",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/home/home",
        "iconPath": "image/icon_component.png",
        "selectedIconPath": "image/icon_component_HL.png",
        "text": "答题"
      },
      {
        "pagePath": "pages/logs/logs",
        "iconPath": "image/icon_API.png",
        "selectedIconPath": "image/icon_API_HL.png",
        "text": "记录"
      }
    ]
  }
```
首先在app.json里配置tabBar参数。图片放在和pages同级的image文件夹中。

在index.js中，使用 `wx.switchTab` 跳转到tabBar页。
```
// index.js
bindViewTap: function() {
    wx.switchTab({
      url: '../home/home'
    })
}
```

###### 效果
![](https://upload-images.jianshu.io/upload_images/9761590-273df180347333c7.PNG?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/9761590-62f9f88e54570dd5.PNG?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


end.
