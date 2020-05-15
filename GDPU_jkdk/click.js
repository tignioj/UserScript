// ==UserScript==
// @name         GDPU 健康打卡
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://eswis.gdpu.edu.cn/opt_rc_jkdk.aspx?*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    /**
     *
     * @param id 元素的id
     */
    function domId(id) {
        return document.getElementById(id);
    }


    /**
     * 加载location
     */
    function loadLocation() {
        var locationFromDom = domId("ctl00_cph_right_e_location").value;

        var GDPU_JKDK_LOCATION_KEY = "gdpu_jkda_location";
        var locationFromStorage = localStorage.getItem(GDPU_JKDK_LOCATION_KEY);

        //如果没有存储位置信息，则存储
        if (locationFromStorage === null && locationFromDom.length > 0) {
            localStorage.setItem(GDPU_JKDK_LOCATION_KEY, locationFromDom);
        }

        domId("ctl00_cph_right_e_location").value = locationFromStorage;
    }


    //不在学校
    domId("ctl00_cph_right_e_atschool_1").checked = true;

    //当天所在地
    loadLocation();

    //医学观察情况
    domId("ctl00_cph_right_e_observation_0").checked = true;
    //健康状况
    domId("ctl00_cph_right_e_health_0").checked = true;
    //体温
    domId("ctl00_cph_right_e_temp").value = "36.8";

    domId("ctl00_cph_right_e_submit").scrollTo();

})();