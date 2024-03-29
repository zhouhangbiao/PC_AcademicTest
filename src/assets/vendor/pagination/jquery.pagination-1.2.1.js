﻿!function (a) {
  var e = function (b, c) {
    this.ele = b, this.defaults = {
      currentPage: 1,
      totalPage: 10,
      isShow: !0,
      count: 5,
      homePageText: "首页",
      endPageText: "尾页",
      prevPageText: "上一页",
      nextPageText: "下一页",
      callback: function () {
      }
    }, this.opts = a.extend({}, this.defaults, c), this.current = this.opts.currentPage, this.total = this.opts.totalPage, this.init()
  };
  e.prototype = {
    init: function () {
      this.render(), this.eventBind()
    }, render: function () {
      var a = this.opts, b = this.current, c = this.total, d = this.getPagesTpl(), e = this.ele.empty();
      this.isRender = !0, this.homePage = '<a href="javascript:void(0);" class="ui-pagination-page-item" data-current="1">' + a.homePageText + "</a>", this.prevPage = '<a href="javascript:void(0);" class="ui-pagination-page-item" data-current="' + (b - 1) + '">' + a.prevPageText + "</a>", this.nextPage = '<a href="javascript:void(0);" class="ui-pagination-page-item" data-current="' + (b + 1) + '">' + a.nextPageText + "</a>", this.endPage = '<a href="javascript:void(0);" class="ui-pagination-page-item" data-current="' + c + '">' + a.endPageText + "</a>", this.checkPage(), this.isRender && e.html("<div class='ui-pagination-container'>" + this.homePage + this.prevPage + d + this.nextPage + this.endPage + "</div>")
    }, checkPage: function () {
      var a = this.opts, b = this.total, c = this.current;
      a.isShow || (this.homePage = this.endPage = ""), 1 === c && (this.homePage = this.prevPage = ""), c === b && (this.endPage = this.nextPage = ""), 1 === b && (this.homePage = this.prevPage = this.endPage = this.nextPage = ""), 1 >= b && (this.isRender = !1)
    }, getPagesTpl: function () {
      var f, g, h, i, j, k, a = this.opts, b = this.total, c = this.current, d = "", e = a.count;
      if ( e >= b ) for ( k = 1; b >= k; k++ ) d += k === c ? '<a href="javascript:void(0);" class="ui-pagination-page-item active" data-current="' + k + '">' + k + "</a>" : '<a href="javascript:void(0);" class="ui-pagination-page-item" data-current="' + k + '">' + k + "</a>"; else if ( f = e / 2, f >= c ) for ( k = 1; e >= k; k++ ) d += k === c ? '<a href="javascript:void(0);" class="ui-pagination-page-item active" data-current="' + k + '">' + k + "</a>" : '<a href="javascript:void(0);" class="ui-pagination-page-item" data-current="' + k + '">' + k + "</a>"; else for ( g = Math.floor(f), h = c + g, i = c - g, j = 0 == e % 2, h > b && (j ? (i -= h - b - 1, h = b + 1) : (i -= h - b, h = b)), j || h++, k = i; h > k; k++ ) d += k === c ? '<a href="javascript:void(0);" class="ui-pagination-page-item active" data-current="' + k + '">' + k + "</a>" : '<a href="javascript:void(0);" class="ui-pagination-page-item" data-current="' + k + '">' + k + "</a>";
      return d + '<input type="text" class="jumpToPageNum"/><a class="ui-pagination-page-btn" href="#">GO</a>'
    }, setPage: function (a, b) {
      return a === this.current && b === this.total ? this.ele : (this.current = a, this.total = b, this.render(), this.ele)
    }, getPage: function () {
      return {current: this.current, total: this.total}
    },
    eventBind: function () {
      var b = this.total, c = this, d = this.opts.callback;
        this.ele.off("click").on("keydown", ".jumpToPageNum", function (e) {
          if ( e.keyCode == 13 ) {
            var e = parseInt(a(this)[ 0 ].parentNode.getElementsByTagName("input")[ 0 ].value);
            e && "NaN" != e && e > 0 && c.current != e && b >= e && (c.current = e, c.render(), d && "function" == typeof d && d(e))
          }
        });
      this.ele.off("click").on("click", ".ui-pagination-page-item", function () {
        var b = a(this).data("current");
        c.current != b && (c.current = b, c.render(), d && "function" == typeof d && d(b))
      }).on("click", ".ui-pagination-page-btn", function () {
        var e = parseInt(a(this)[ 0 ].parentNode.getElementsByTagName("input")[ 0 ].value);
        e && "NaN" != e && e > 0 && c.current != e && b >= e && (c.current = e, c.render(), d && "function" == typeof d && d(e))
      })
    }
  }, a.fn.pagination = function (a, b, c) {
    if ( "object" == typeof a ) {
      var d = new e(this, a);
      this.data("pagination", d)
    }
    return "string" == typeof a ? this.data("pagination")[ a ](b, c) : this
  }
}(jQuery, window, document);
