/*
 Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

/**
 * @category component/webview
 */

import { ccclass, help, executeInEditMode, menu, tooltip, type, displayOrder, serializable, requireComponent } from 'cc.decorator';
import { EDITOR } from 'internal:constants';
import { UITransform } from '../core/components/ui-base';
import { Component, EventHandler as ComponentEventHandler } from '../core/components';
import { WebViewImpl } from './webview-impl-web';

export enum EventType {
    /**
     * @en None
     * @zh 无
     */
    NONE,
    /**
     * @en Web page Load completed.
     * @zh 网页加载完成
     */
    LOADING,
    /**
     * @en Web page is loading.
     * @zh 网页加载中
     */
    LOADED,
    /**
     * @en Web page error occurs when loading.
     * @zh 网页加载出错
     */
    ERROR,
}

/**
 * @en
 * WebView is a component for display web pages in the game.
 * Because different platforms have different authorization,
 * API and control methods for WebView component.
 * And have not yet formed a unified standard, only Web, iOS, and Android platforms are currently supported.
 * @zh
 * WebView 组件，用于在游戏中显示网页。
 * 由于不同平台对于 WebView 组件的授权、API、控制方式都不同，还没有形成统一的标准，所以目前只支持 Web、iOS 和 Android 平台。
 */
@ccclass('cc.WebView')
@help('i18n:cc.WebView')
@menu('Components/WebView')
@requireComponent(UITransform)
@executeInEditMode
export class WebView extends Component {
    @serializable
    protected _url = 'https://cocos.com';

    protected _impl: WebViewImpl | null = null;

    /**
     * @en WebView event type
     * @zh 网页视图事件类型
     */
    public static EventType = EventType;

    /**
     * @en
     * A given URL to be loaded by the WebView, it should have a http or https prefix.
     * @zh
     * 指定 WebView 加载的网址，它应该是一个 http 或者 https 开头的字符串
     */
    @tooltip('i18n:videoplayer.url')
    get url () {
        return this._url;
    }
    set url (val: string) {
        this._url = val;
        if (this._impl) {
            this._impl.loadURL(val);
        }
    }

    /**
     * @en
     * The webview's event callback , it will be triggered when certain webview event occurs.
     * @zh
     * WebView 的回调事件，当网页加载过程中，加载完成后或者加载出错时都会回调此函数
     */
    @type([ComponentEventHandler])
    @displayOrder(20)
    @tooltip('i18n:videoplayer.webviewEvents')
    public webviewEvents: ComponentEventHandler[] = [];

    /**
     * @en
     * Raw webview objects for user customization
     * @zh
     * 原始网页对象，用于用户定制
     */
    get nativeWebView () {
        return (this._impl && this._impl.webview) || null;
    }

    /**
     * @en
     * Get current audio state.
     * @zh
     * 获取当前视频状态。
     */
    get state () {
        if (!this._impl) { return EventType.NONE; }
        return this._impl.state;
    }

    /**
     * !#en
     * Set javascript interface scheme (see also setOnJSCallback). <br/>
     * Note: Supports only on the Android and iOS. For HTML5, please refer to the official documentation.<br/>
     * Please refer to the official documentation for more details.
     * !#zh
     * 设置 JavaScript 接口方案（与 'setOnJSCallback' 配套使用）。<br/>
     * 注意：只支持 Android 和 iOS ，Web 端用法请前往官方文档查看。<br/>
     * 详情请参阅官方文档
     * @method setJavascriptInterfaceScheme
     * @param {String} scheme
     */
    public setJavascriptInterfaceScheme (scheme: string) {
        if (this._impl) {
            this._impl.setJavascriptInterfaceScheme(scheme);
        }
    }

    /**
     * !#en
     * This callback called when load URL that start with javascript
     * interface scheme (see also setJavascriptInterfaceScheme). <br/>
     * Note: Supports only on the Android and iOS. For HTML5, please refer to the official documentation.<br/>
     * Please refer to the official documentation for more details.
     * !#zh
     * 当加载 URL 以 JavaScript 接口方案开始时调用这个回调函数。<br/>
     * 注意：只支持 Android 和 iOS，Web 端用法请前往官方文档查看。
     * 详情请参阅官方文档
     * @method setOnJSCallback
     * @param {Function} callback
     */
    public setOnJSCallback (callback: Function) {
        if (this._impl) {
            this._impl.setOnJSCallback(callback);
        }
    }

    /**
     * !#en
     * Evaluates JavaScript in the context of the currently displayed page. <br/>
     * Please refer to the official document for more details <br/>
     * Note: Cross domain issues need to be resolved by yourself <br/>
     * !#zh
     * 执行 WebView 内部页面脚本（详情请参阅官方文档） <br/>
     * 注意：需要自行解决跨域问题
     * @method evaluateJS
     * @param {String} str
     */
    public evaluateJS (str: string) {
        if (this._impl) {
            this._impl.evaluateJS(str);
        }
    }

    public onLoad () {
        if (EDITOR) {
            return;
        }
        this._impl = new WebViewImpl(this);
        this._impl.loadURL(this._url);
        this._impl.eventList.set(EventType.LOADING, this.onLoading.bind(this));
        this._impl.eventList.set(EventType.LOADED, this.onLoaded.bind(this));
        this._impl.eventList.set(EventType.ERROR, this.onError.bind(this));
    }

    onLoading () {
        ComponentEventHandler.emitEvents(this.webviewEvents, this, EventType.LOADING);
        this.node.emit('loading', this);
    }

    onLoaded () {
        ComponentEventHandler.emitEvents(this.webviewEvents, this, EventType.LOADED);
        this.node.emit('loaded', this);
    }

    onError () {
        ComponentEventHandler.emitEvents(this.webviewEvents, this, EventType.ERROR);
        this.node.emit('error', this);
    }

    public onEnable() {
        if (this._impl) {
            this._impl.enable();
        }
    }

    public onDisable () {
        if (this._impl) {
            this._impl.disable();
        }
    }

    public onDestroy () {
        if (this._impl) {
            this._impl.destroy();
            this._impl = null;
        }
    }

    public update (dt: number) {
        if (this._impl) {
            this._impl.syncMatrix();
        }
    }
}
