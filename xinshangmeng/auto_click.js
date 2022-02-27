// ==UserScript==
// @name         新商盟订烟自动点击
// @namespace    https://github.com/tignioj/UserScript/tree/master/xinshangmeng
// @version      0.2
// @description  新商盟订烟每次需要手动请求可用量，用这个脚本自动获取可用量。有多少点多少。
// @author       tignioj
// @match        http://gd.xinshangmeng.com:9090/eciop/orderForCC/cgtListForCC.htm?*
// @icon         https://www.google.com/s2/favicons?domain=xinshangmeng.com
// @grant        none
// ==/UserScript==


(function () {
    'use strict';
    // 创造事件常量,请勿修改这些常量
    const EVENT_MOUSE_ENTER = "mouseenter"
    const EVENT_MOUSE_OUT = "mouseout"
    const EVENT_MOUSE_CLICK = "click"
    var totalCount = 0; // 总计多少条烟

    //利用Object.assign 改变css
    /**
     * 举例
     * setStylesOnElement({
     *      border: "1px solid red",
     *      float: "right",
     *      cursor:'pointer',
     * }, ele1,ele2);
     * @param styles
     * @param elements
     */
    let setStylesOnElement = function (styles, ...elements
        ) {
            for (var i = 0; i < elements.length; i++) {
                Object.assign(elements[i].style, styles);
            }
        }
    ;

    // 创建UI
    function createUI() {
        // 创建窗体
        let divEle = document.createElement("div");
        setStylesOnElement({
            position: "fixed",
            zIndex: 9999,
            top: "5%",
            left: "50%",
            transform: "translate(-50%, 0%)",
        }, divEle);
        // 显示信息
        let infoEle = document.createElement("div")
        infoEle.textContent = "一键点满需求量"
        setStylesOnElement({
            boxShadow: "black 4px 4px 3px",
            backgroundColor: "white",
            borderRadius: "2px",
            border: "1px solid black",
            fontSize: "1.3em"
        }, infoEle)
        infoEle.id = "auto_click_info_ele"


        // 创建按钮
        let buttonEle = document.createElement("button");
        buttonEle.id = "auto_click_button_ele_1"
        buttonEle.textContent = "一键1倍"
        buttonEle.addEventListener("click", function () {
            oneClickOrder(1);
        });
        setStylesOnElement({
            position: "relative",
            cursor: "pointer",
            fontSize: "3em",
            boxShadow: "4px 4px 3px black"
        }, buttonEle);

        let buttonDoubleEle = document.createElement("button");
        buttonDoubleEle.id = "auto_click_button_ele_2"
        buttonDoubleEle.textContent = "一键2倍"
        buttonDoubleEle.addEventListener("click", function () {
            oneClickOrder(2)
        });
        setStylesOnElement({
            position: "relative",
            cursor: "pointer",
            fontSize: "3em",
            boxShadow: "4px 4px 3px black"
        }, buttonDoubleEle);

        // 隐藏按钮
        const buttonHideEle = document.createElement("button");
        buttonHideEle.textContent = "隐藏"
        setStylesOnElement({
            position: "absolute",
            cursor: "pointer",
            top: "0px",
            right: "0px",
            fontSize: "1.2em"
        }, buttonHideEle)
        buttonHideEle.onclick = function () {
            if (buttonHideEle.textContent === "隐藏" ) {
                buttonEle.style.display = "none"
                buttonDoubleEle.style.display = "none"
                divEle.style.opacity = "30%"
                buttonHideEle.textContent = "显示"
            } else {
                buttonEle.style.display = "inline-block"
                buttonDoubleEle.style.display = "inline-block"
                divEle.style.opacity = "100%"
                buttonHideEle.textContent = "隐藏"
            }
        }

        // 添加元素到窗体
        divEle.appendChild(infoEle)
        divEle.appendChild(buttonHideEle)
        divEle.appendChild(buttonEle)
        divEle.appendChild(buttonDoubleEle)
        return divEle;
    }

    function showInfo(msg) {
        document.getElementById("auto_click_info_ele").innerText = msg;
    }


    /**
     * 获取事件
     * @param ev 事件常量
     * @returns {MouseEvent}
     */
    function getEvt(ev) {
        if ((ev === EVENT_MOUSE_ENTER) || ev === EVENT_MOUSE_CLICK || ev === EVENT_MOUSE_OUT) {
            return new MouseEvent(ev, {
                bubbles: true,
                cancelable: true,
                view: window,
            });
        } else {
            throw "no such event";
        }
    }

    /**
     * 创建信息元素
     * @param text
     * @returns {HTMLSpanElement}
     */
    function getErrorEle(text) {
        let infoEle = document.createElement("span")
        infoEle.classList.add("info-ele")
        infoEle.appendChild(document.createTextNode(text))
        infoEle.style.fontWeight = "bold"
        infoEle.style.fontSize = "1.2em"
        infoEle.style.color = "white";
        // 信息元素定位到需要显示信息的地方, 这里指定为“单位”
        infoEle.style.position = "absolute";
        // 信息元素添加边框
        infoEle.style.border = "1px solid black"
        infoEle.style.backgroundColor = "red"
        return infoEle;
    }

    /**
     * 把所有可用数量显示出来, 由于网页的特性，必须要先鼠标进入、点击加号或者减号、鼠标移出，才能获取到真正的订购量
     */
    function requireAvailableNumber() {
        // 获取加号列表
        let adds = document.querySelectorAll(".adda");
        for (let i = 0; i < adds.length; i++) {
            // for (let i = 5; i < 10; i++) {
            let ele = adds[i];
            ele.dispatchEvent(getEvt(EVENT_MOUSE_ENTER))
            ele.dispatchEvent(getEvt(EVENT_MOUSE_CLICK))
            ele.dispatchEvent(getEvt(EVENT_MOUSE_OUT))
        }
    }


    /**
     * 根据限制的数量设置实际数量
     * 步骤：
     * 1. 鼠标移入
     * 2. 点击加号
     * 3. 根据数量调整input标签的value属性
     * 4. 鼠标移出
     *
     * 验证
     *  根据订购量和可用量判断是否操作成功
     *  @param times 几倍订购量
     */
    function setActualNumberByLimit(times) {
        let rows = document.querySelectorAll(".xsm-utable-body");
        for (let i = 0; i < rows.length; i++) {
            let ele = rows[i];
            let adda = ele.getElementsByClassName("adda")[0];
            // 鼠标进入
            adda.dispatchEvent(getEvt(EVENT_MOUSE_ENTER))
            adda.dispatchEvent(getEvt(EVENT_MOUSE_CLICK))

            // 获取实际数量
            let eleActual = ele.getElementsByClassName("cgt-col-qtl-lmt")[0];
            let limitNum = eleActual.textContent;

            // 设置实际数量
            let eleInput = ele.getElementsByClassName("xsm-order-list-shuru-input")[0];
            // 没有显示可用量，说明上一轮的点击失败了
            if (limitNum.trim() !== '--') {
                eleInput.value = String(parseInt(limitNum) * times);
                // 移动鼠标
                adda.dispatchEvent(getEvt(EVENT_MOUSE_OUT))

                // 检测是否操作成功，成功则绿色，失败红色
                // 成功标志：订购量==可用量，且都是数字
                /**
                 * 分三种情况：
                 * 成功两种：
                 *  可用量 == 订购量，且都是数字
                 *      1. 可用量和订购量都是0，显示浅绿色
                 *      2. 可用量和订购量大于0，显示深绿色
                 * 失败两种：
                 *   1. 可用量 == '--', 这是在第一次请求的时候就没有请求成功
                 *   2. 订购量 == '--' ,说明没有操作成功
                 * 这里把请求失败设置为黄色:可能是网络原因
                 * 把请求后，元素修改失败设置为红色: 可能是程序的bug
                 */
                let orderNum = ele.getElementsByClassName("cgt-col-ord")[0].textContent
                if (orderNum !== '--' && orderNum === limitNum) {
                    if (orderNum === '0') {
                        ele.style.backgroundColor = "lightgreen"
                    }
                    if (orderNum > 0) {
                        totalCount += parseInt(orderNum)
                        ele.style.backgroundColor = "green"
                    }
                } else {
                    ele.style.backgroundColor = "red"
                    let infoEle = getErrorEle("订购量未能成功修改，请手动修改！")
                    ele.appendChild(infoEle);
                }
            } else { // 获取可用量失败，在当前行提示需要手动操作
                ele.style.backgroundColor = "yellow"
                // 创建信息元素
                let infoEle = getErrorEle("获取可用量失败，请手动修改！")
                // 将信息元素显示在当前行
                ele.appendChild(infoEle);
            }
        }
    }


    function oneClickOrder(times) {
        showInfo("请稍后...")
        const btn1 = document.getElementById("auto_click_button_ele_1");
        const btn2 = document.getElementById("auto_click_button_ele_2");
        btn1.disabled = true
        btn1.style.cursor = "wait"
        btn2.disabled = true
        btn2.style.cursor = "wait"

        totalCount = 0;
        // 请求订烟数量
        setTimeout(function () {
            requireAvailableNumber();
            // 根据数量调整订购量
            setActualNumberByLimit(times);
            alert("总计订购" + totalCount + "条烟")
            showInfo("已获取" + totalCount + "条烟")
            btn1.disabled = false;
            btn1.style.cursor = "pointer"
            btn2.disabled = false;
            btn2.style.cursor = "pointer"
        },0)
    }

    window.addEventListener('load', function () {
        document.body.appendChild(createUI())
    });

})();