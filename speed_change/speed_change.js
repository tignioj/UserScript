// ==UserScript==
// @name         视频变速器0.23
// @namespace    http://tampermonkey.net/
// @version      0.23
// @description  默认两倍速 ‘Ctrl+Alt+, 视频减速0.25, ‘Ctrl+Alt+.’视频加速速0.25, Ctrl+Alt+数字键则改为对应的速度, Ctrl+Alt+h 彻底隐藏窗口
// @author       tignioj
// @match      *://*/*
// @exclude    https://cn.bing.com/?toWww*
// @grant        none
// ==/UserScript==

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement/contentWindow
 *
 * TODO:需要考虑iframe里面的video
 *
 */


(function () {
    'use strict';

    //利用Object.assign 改变css
    let setStylesOnElement = function (styles, ...elements
        ) {
            for (var i = 0; i < elements.length; i++) {
                Object.assign(elements[i].style, styles);
            }
        }
    ;

//创建窗体
    var appDiv = document.createElement("div");
    appDiv.id = "appDiv";
    setStylesOnElement({
        left: "0px",
        top: "100px",
        position: "fixed",
        border: "1px solid red",
        background: "rgba(255,255,255,0.5)",
        zIndex: "1000"
    }, appDiv);
//

//创建头部
    var headerDiv = document.createElement("div");
    var title = document.createElement("span");
    title.id = "title";
    title.innerText = "视频变速器";

    var toggleBtn = document.createElement("span");
    toggleBtn.innerText = "隐藏";
    setStylesOnElement({
        border: "1px solid red",
        float: "right"
    }, toggleBtn);


    var isHidden = false;
    toggleBtn.onclick = toogleWindow;


    function toogleWindow() {
        if (!isHidden) {
            toggleBtn.innerText = "显示";
            setStylesOnElement({
                display: "none",
            }, title, sliderContainer)
        } else {
            toggleBtn.innerText = "隐藏";
            setStylesOnElement({
                display: "inline-block",
            }, title, sliderContainer)
        }
        isHidden = !isHidden;
    }

    headerDiv.appendChild(title);
    headerDiv.appendChild(toggleBtn);

    var infoEle = document.createElement("div");

    setStylesOnElement({
        fontWeight: "bold",
        margin: 0,
        padding: 0
    }, title, infoEle);

//显示速度
    function changeShowValue(v) {
        slider.value = v;
        infoEle.innerText = "‘Ctrl+Alt+,’视频减速0.25 \n" +
            "‘Ctrl+Alt+.’视频加速速0.25 \n" +
            "Ctrl+Alt+数字键 \n" +
            "则改为对应的速度 \n" +
            "Ctrl+Alt+h 彻底隐藏窗口\n" +
            "当前速度" + v;
    }

    var sliderContainer = document.createElement("div");

//创建slider
    var slider = document.createElement("input");
    slider.id = "slider";
    slider.min = 0.25;
    slider.max = 10;
    slider.step = 0.25;
    slider.type = "range";
    slider.value = globalRate;
    slider.oninput = function (ev) {
        //防止事件被父元素捕捉
        ev.stopPropagation();
        speedChange(this.value);
    }


    var btnGroup = document.createElement("div");
    btnGroup.appendChild(getBtn(0.75));
    btnGroup.appendChild(getBtn(1));
    btnGroup.appendChild(getBtn(2));
    btnGroup.appendChild(getBtn(3));


//创建按钮组同时给按钮添加监听
    function getBtn(value) {
        var v1 = document.createElement("button");
        v1.innerText = value;
        v1.style.fontSize = "1.5em";
        v1.style.width = "50%";
        v1.onclick = function (ev) {

            speedChange(value);
            //当按钮点击，重新激活interval
            loopWatch();
            ev.stopPropagation();
        }
        return v1;
    }


    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(btnGroup);
    sliderContainer.appendChild(infoEle);


//添加文本和按钮到窗体
    appDiv.appendChild(headerDiv);
    appDiv.appendChild(sliderContainer);


    /**
     * 更改速度
     * @param rate
     */
    function speedChange(rate) {
        rate = Number(rate);
        if (rate < 0.25) {
            rate = 0.25;
        }
        if (rate > 10) {
            rate = 10;
        }
        //更改全局速度
        globalRate = rate;

        var videos = getVideoEleFromDocument();

        for (let i = 0; i < videos.length; i++) {
            let video = videos[i];
            if (video.playbackRate !== rate) {
                video.playbackRate = rate;
                changeShowValue(rate);
            }
        }
    }

    /**
     * 从当前document中获取video元素， 如果没有则抛出异常
     */
    function getVideoEleFromDocument() {
        //拿到htmlCollection
        var videos = document.getElementsByTagName("video");
        if (videos.length === 0 || typeof (videos[0]) === "undefined") {
            throw "没有检测到视频哦~";
        }
        // if (video.length > 1) {
        //     throw "视频数量过多，无法指定";
        // }


        return videos;
    }

//设置全局速度
    var DEFAULT_RATE = 2;
    var globalRate = DEFAULT_RATE;


    /**
     * app的隐藏和显示来回切换
     */
    function toogleApp() {
        var d = (appDiv.style.display || "block");
        var result = d === "block" ? "none" : "block";
        appDiv.style.display = result;
    }

//加速重试次数
    var retryTime = 0;


    /**
     * 加载窗口
     */
    function loadApp() {
        console.log("加载App")

        //检测按键行为
        var targArea = document;
        targArea.addEventListener('keydown', reportKeyEvent);

        /**
         * 根据按键响应不同的行为
         */
        function reportKeyEvent(zEvent) {
            //--- Was a Ctrl-Alt- combo pressed?
            if (zEvent.ctrlKey && zEvent.altKey) {  // case sensitive
                switch (zEvent.key) {
                    case ",":
                        speedChange(globalRate - 0.25)
                        break;
                    case ".":
                        speedChange(globalRate + 0.25)
                        break;
                    case "/":
                        speedChange(DEFAULT_RATE);
                        break;
                    case "h":
                        toogleApp();
                }
                for (var i = 0; i <= 9; i++) {
                    if (String(i) === zEvent.key) {
                        speedChange(i)
                    }
                }
            }

            //zEvent.stopPropagation ();
            //zEvent.preventDefault ()
        }

        document.body.appendChild(appDiv);
    }

    /**
     * 设置整个appDiv是否显示
     * @param b
     */
    function setAppIsShow(b) {
        if (b) {
            appDiv.style.display = "block";
        } else {
            appDiv.style.display = "none";
        }
    }

    /**
     * 循环监听视频速度
     */
    function loopWatch() {
        clearInterval(document.watchSpeedTask);
        document.watchSpeedTask = setInterval(function () {
            try {
                speedChange(globalRate);
            } catch (e) {
                retryTime++;
                console.error("出错1：", e, "正在重试第" + retryTime + "次");
                if (retryTime >= 10) {
                    clearInterval(document.watchSpeedTask);
                    console.error("加速失败，请刷新页面")
                    retryTime = 0;
                }
            }
        }, 1000);
    }

    /**
     * 程序入口
     */
    function main() {
        setAppIsShow(true);
        loadApp();
        loopWatch();
    }


    window.addEventListener('click', function () {
        // console.log("加载文档完毕");
        try {
            //如果没有video则会抛异常
            getVideoEleFromDocument();

            main();
            // console.log("成功:", "对应的文档", document)
        } catch (e) {
            // console.error("出错:" , e, "对应文档", document);
        }
    });
})();