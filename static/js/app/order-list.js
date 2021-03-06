/*
 * @Author: Lu Xiaohan 
 * @Date: 2020-11-11 19:15:45
 * @LastEditTime: 2020-11-12 11:52:24
 * @Description: file that implements the order management function
 * @FilePath: \VSLibrary\Team Work E\static\js\app\order-list.js
 */

requirejs.config({
    "baseUrl": "/static/js/lib",
    "paths": {
        "publicTip": "/static/js/app/public-tip",
        "zepto": "zepto.min"
    },
    "shim": {
        "jquery.Spinner": ["jquery"]
    }
});

requirejs(["jquery", "vue", "vue-resource", "publicTip"], function($, Vue, vueResource, publicTip) {
    Vue.use(vueResource);

    $(function() {
        var ocVm = new Vue({
            el: '#orderContent',
            http: {
                timeout: 5000
            },
            data: {
                sorders: [],
                loading: false,
                limit: 3,
                offset: 0,
                hasdata: false,
                loadMoreflag: false,
                status: parseInt($('#orderStatus').val())
            },
            created: function() {
                this.getOrderList(false, null);
            },
            methods: {
                wePayV: function(orderId) {
                    wePay(orderId, this.getOrderList);
                },
                reminderV: function(orderId) {
                    reminder(orderId, this.getOrderList);
                },
                confirmV: function(orderId) {
                    confirm(orderId, this.getOrderList);
                },
                delV: function(orderId) {
                    del(orderId, this.getOrderList);
                },
                cancelV: function(orderId) {
                    cancel(orderId, this.getOrderList);
                },
                getOrderList: function(isLoadMore, statusIn) {
                    var that = this;
                    that.loading = true;
                    that.loadMoreflag = isLoadMore;
                    if (statusIn != null) {
                        that.status = statusIn;
                    }

                    if (isLoadMore) {
                        that.offset = that.offset + that.limit;
                    } else {
                        that.limit = 3;
                        that.offset = 0;
                    }

                    that.$resource('/zshop/userapi/getOrderList').save({ limit: that.limit, offset: that.offset, status: that.status }).then(function(resp) {
                        that.loading = false;
                        var result = resp.json();

                        if (result.length > 0) {
                            that.hasdata = true;
                        } else {
                            that.hasdata = false;
                        }

                        if (isLoadMore) {
                            that.sorders = that.sorders.concat(result);
                        } else {
                            that.sorders = result;
                        }
                    }, function(resp) {
                        that.loading = false;
                        var respJson = resp.json();
                        publicTip.showTipForStr(respJson.message, respJson.code);
                    });
                }
            }
        });

        function wePay(orderId, getOrderList) {
            publicTip.showLoadingToast(true, 'In the operation');
            $.ajax({
                type: 'post',
                dataType: 'json',
                url: '/zshop/userapi/confirmOrder',
                data: { orderId: orderId }
            }).done(function(r) {
                publicTip.showLoadingToast(false);
                var confirmMsg = "Confirm the payment<font color='red'>" + r.totalPrice + "</font>??????<div style='margin-top: 8px;'>???????????????" + r.payEndTime + "</div>";
                publicTip.showConfirm(confirmMsg, function() {
                    payOrder(r.totalPrice, getOrderList, orderId);
                });
            }).fail(function(jqXHR, textStatus) { // Not 200
                publicTip.showLoadingToast(false);
                publicTip.showTip(jqXHR.responseJSON);
            });
        }

        function payOrder(totalPrice, getOrderList, orderId) {
            publicTip.showLoadingToast(true, "In the payment");
            $.ajax({
                type: 'post',
                dataType: 'json',
                url: '/zshop/userapi/payOrder',
                data: {
                    orderId: orderId,
                    totalPrice: totalPrice
                }
            }).done(function(r) {
                window.location.href = '/zshop/user/paySuccess/' + orderId;
            }).fail(function(jqXHR, textStatus) { // Not 200
                publicTip.showLoadingToast(false);
                publicTip.showTip(jqXHR.responseJSON);
            });
        }

        function reminder(orderId) {
            publicTip.showToast("Have to remind");
        }

        function confirm(orderId, getOrderList) {
            publicTip.showConfirm("Please confirm whether you have received the goods", function() {
                publicTip.showLoadingToast(true, 'Have to remind');

                $.ajax({
                    type: 'post',
                    dataType: 'json',
                    url: '/zshop/userapi/confirmReceipt',
                    data: { orderId: orderId }
                }).done(function(r) {
                    publicTip.showLoadingToast(false);
                    getOrderList(false, null);
                }).fail(function(jqXHR, textStatus) { // Not 200
                    publicTip.showLoadingToast(false);
                    publicTip.showTip(jqXHR.responseJSON);
                });
            });
        }

        function del(orderId, getOrderList) {
            publicTip.showConfirm("Confirm deletion of order?", function() {
                publicTip.showLoadingToast(true, 'In the payment');

                $.ajax({
                    type: 'post',
                    dataType: 'json',
                    url: '/zshop/userapi/delOrder',
                    data: { orderId: orderId }
                }).done(function(r) {
                    publicTip.showLoadingToast(false);
                    getOrderList(false, null);
                }).fail(function(jqXHR, textStatus) { // Not 200
                    publicTip.showLoadingToast(false);
                    publicTip.showTip(jqXHR.responseJSON);
                });
            });
        }

        function cancel(orderId, getOrderList) {
            publicTip.showConfirm("Confirm deletion of order?", function() {
                publicTip.showLoadingToast(true, 'In the payment');

                $.ajax({
                    type: 'post',
                    dataType: 'json',
                    url: '/zshop/userapi/cancelOrder',
                    data: { orderId: orderId }
                }).done(function(r) {
                    publicTip.showLoadingToast(false);
                    getOrderList(false, null);
                }).fail(function(jqXHR, textStatus) { // Not 200
                    publicTip.showLoadingToast(false);
                    publicTip.showTip(jqXHR.responseJSON);
                });
            });
        }

    });

})