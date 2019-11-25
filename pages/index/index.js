const constants = require('../../utils/constants.js');
// 右侧每一类的 bar 的高度（固定）
const RIGHT_BAR_HEIGHT = 20;   
// 右侧每个子类的高度（固定）
const RIGHT_ITEM_HEIGHT = 100;   
// 左侧每个类的高度（固定）
const LEFT_ITEM_HEIGHT = 50       

Page({
  data: {
    //是否显示下面的购物车
    HZL_isCat:0,
    //购物车的商品
    HZL_my_cat:[],
    // 购物车的数量
    HZL_num:0,
    //分类的数组
    HZL_categories: [
      '菜单',
      '评论',
      '商家'
    ],
    //swiper滑动的数组
    HZL_swiper_ID:0,

    //模拟 数据
    constants: [],      
    // 左 => 右联动 右scroll-into-view 所需的id
    HZL_toView: null,  
    // 当前左侧选择的
    HZL_currentLeftSelect: null,   
    // 右侧每类数据到顶部的距离（用来与 右 => 左 联动时监听右侧滚动到顶部的距离比较）
    HZL_eachRightItemToTop: [],       
    HZL_leftToTop: 0
  },
  onLoad: function () {
    var that = this;
    //导航栏的文字
    wx.setNavigationBarTitle({
      title: '点餐',
    }),
      // 导航栏的文字颜色和背景的颜色
    wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#e64340',
        animation: {
          duration: 400,
          timingFunc: 'easeIn'
        }
      })
    //高度大小
    wx.getSystemInfo({
      success: function (res) {
        var HZL_height = res.windowHeight - 160
        var HZL_height1 = res.windowHeight - 110
        that.setData({
          HZL_height: HZL_height,
          HZL_height1: HZL_height1
        })
      }
    });

    that.setData({
      constants: constants,
      HZL_currentLeftSelect: constants[0].id,
      HZL_eachRightItemToTop: this.HZL_getEachRightItemToTop()
    })
  },
  onShow: function () {


  },
  //记录swiper滚动的
  HZL_swiperchange: function(e){
    var that = this;
    that.setData({
      HZL_swiper_ID: e.detail.current,
    })
  },
  //点击分类栏
  HZL_categories:function(e){
    var that = this;
    that.setData({
      HZL_swiper_ID: e.currentTarget.dataset.index
    })
  },

  // 获取每个右侧的 bar 到顶部的距离，用来做后面的计算。
  HZL_getEachRightItemToTop: function () {  
    var obj = {};
    var totop = 0;
     // 右侧第一类肯定是到顶部的距离为 0
    obj[constants[0].id] = totop     
    // 循环来计算每个子类到顶部的高度
    for (let i = 1; i < (constants.length + 1); i++) {  
      totop += (RIGHT_BAR_HEIGHT + constants[i - 1].category.length * RIGHT_ITEM_HEIGHT)
      // 这个的目的是 例如有两类，最后需要 0-1 1-2 2-3 的数据，所以需要一个不存在的 'last' 项，此项即为第一类加上第二类的高度。
      obj[constants[i] ? constants[i].id : 'last'] = totop    
    }
    return obj
  },
  // 监听右侧的滚动事件与 HZL_eachRightItemToTop 的循环作对比 从而判断当前可视区域为第几类，从而渲染左侧的对应类。
  right: function (e) {  
     console.log('监听右侧的滚动事件',e)
    for (let i = 0; i < this.data.constants.length; i++) {
      let left = this.data.HZL_eachRightItemToTop[this.data.constants[i].id]
      let right = this.data.HZL_eachRightItemToTop[this.data.constants[i + 1] ? this.data.constants[i + 1].id : 'last']
      if (e.detail.scrollTop < right && e.detail.scrollTop >= left) {
        this.setData({
          HZL_currentLeftSelect: this.data.constants[i].id,
          HZL_leftToTop: LEFT_ITEM_HEIGHT * i
        })
      }
    }
  },
  
  // 左侧类的点击事件，点击时，右侧会滚动到对应分类
  left: function (e) {  
    console.log("左侧类的点击事件e",e)  
    this.setData({
      HZL_toView: e.target.id || e.target.dataset.id,
      HZL_currentLeftSelect: e.target.id || e.target.dataset.id
    })
  },


  //是否显示下面的购物车
  HZL_isCat:function(e){
    var that = this;
    if (that.data.HZL_isCat == 0 && that.data.HZL_num > 0) {
      that.setData({
        HZL_isCat: 1
      })
    } else if (that.data.HZL_isCat == 1 && that.data.HZL_num > 0) {
      that.setData({
        HZL_isCat: 0
      })
    }
  },

  //关闭
  HZL_isCat_close:function(e){
    this.setData({
      HZL_isCat: 0
    })
  },

  //清空
  HZL_zero:function(e){
    for (var i = 0; i < this.data.constants.length; i++) {
      for (var j = 0; j < this.data.constants[i].category.length; j++) {
        this.data.constants[i].category[j].num = 0
      }
    }
    this.setData({
      HZL_isCat: 0,
      HZL_num: 0,
      HZL_my_cat: [],
      constants: this.data.constants,
    })
  },

  // 增加
  HZL_jia:function(e){
    var index = e.currentTarget.dataset.index;
    var parentIndex = e.currentTarget.dataset.parentindex;
    var HZL_my_cat = this.HZL_my_jia(parentIndex, index)
    this.setData({
      HZL_num: this.data.HZL_num,
      HZL_my_cat: HZL_my_cat,
      constants: this.data.constants,
    })
  },

  //减少
  HZL_jian:function(e){
    var index = e.currentTarget.dataset.index;
    var parentIndex = e.currentTarget.dataset.parentindex;
    var HZL_my_cat = this.HZL_my_jian(parentIndex, index)

    if (this.data.HZL_num == 0) {
      this.data.HZL_isCat = 0;
    } else {
      this.data.HZL_isCat = 1;
    }

    this.setData({
      HZL_num: this.data.HZL_num,
      HZL_my_cat: HZL_my_cat,
      constants: this.data.constants,
    })
  },

  // 下面购物车增加
  HZL_jia1: function (e) {
    var index = e.currentTarget.dataset.index;
    var parentIndex = e.currentTarget.dataset.parentindex;
    var HZL_my_cat = this.HZL_my_jia(parentIndex, index)
    this.setData({
      HZL_num: this.data.HZL_num,
      HZL_my_cat: HZL_my_cat,
      constants: this.data.constants,
    })
  },

  //下面购物车减少
  HZL_jian1: function (e) {
    var index = e.currentTarget.dataset.index;
    var parentIndex = e.currentTarget.dataset.parentindex;
    var HZL_my_cat = this.HZL_my_jian(parentIndex, index)

    if (this.data.HZL_num == 0) {
      this.data.HZL_isCat = 0;
    } else {
      this.data.HZL_isCat = 1;
    }

    this.setData({
      HZL_num: this.data.HZL_num,
      HZL_my_cat: HZL_my_cat,
      constants: this.data.constants,
      HZL_isCat: this.data.HZL_isCat
    })
  },

  //封装加的方法
  HZL_my_jia: function (parentIndex, index) {
    this.data.HZL_num++;
    var index = index;
    var parentIndex = parentIndex;
    var id = this.data.constants[parentIndex].category[index].category_id;
    var name = this.data.constants[parentIndex].category[index].category_name;
    var num = ++this.data.constants[parentIndex].category[index].num ;
    //弄一个元素判断会不会是重复的
    var mark = 'a' + index + 'b' + parentIndex + 'c' + '0' + 'd' + '0'
    var obj = { num: num, name: name,mark: mark, index: index, parentIndex: parentIndex };
    var HZL_my_cat = this.data.HZL_my_cat;
    HZL_my_cat.push(obj)

    var arr = [];
    //去掉重复的
    for (var i = 0; i < HZL_my_cat.length; i++) {
      if (obj.mark == HZL_my_cat[i].mark) {
        HZL_my_cat.splice(i, 1, obj)
      }
      if (arr.indexOf(HZL_my_cat[i]) == -1) {
        arr.push(HZL_my_cat[i]);
      }
    }

    return arr
  },

  //封装减的方法
  HZL_my_jian: function (parentIndex, index) {
    this.data.HZL_num--;
    var index = index;
    var parentIndex = parentIndex;
    var id = this.data.constants[parentIndex].category[index].category_id;
    var name = this.data.constants[parentIndex].category[index].category_name;
    var num = --this.data.constants[parentIndex].category[index].num;
    //弄一个元素判断会不会是重复的
    var mark = 'a' + index + 'b' + parentIndex + 'c' + '0' + 'd' + '0'
    var obj = { num: num, name: name, mark: mark, index: index, parentIndex: parentIndex };
    var HZL_my_cat = this.data.HZL_my_cat;
    HZL_my_cat.push(obj)

    var arr = [];
    //去掉重复的
    for (var i = 0; i < HZL_my_cat.length; i++) {
      if (obj.mark == HZL_my_cat[i].mark) {
        HZL_my_cat.splice(i, 1, obj)
      }
    }
    

    var arr1 = [];
    //当数量大于1的时候加
    for (var i = 0; i < HZL_my_cat.length; i++) {
      if (arr1.indexOf(HZL_my_cat[i]) == -1) {
        arr1.push(HZL_my_cat[i]);
        if (HZL_my_cat[i].num > 0) {
          arr.push(arr1[i])
        }
      }
    }

    return arr
  },

})