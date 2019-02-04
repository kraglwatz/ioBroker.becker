function Model(t)
{
    t = t ||
    {};
    var e, n = this;
    e = t.data ||
    {}, t.request, t.binding, t.map, t.error, t.allowRetry, update = t.update || [];
    var o = [];
    this.set = function (t, n)
    {
        o.forEach(function (e)
        {
            e.selector === t && setTimeout(function ()
            {
                e.action(n)
            })
        });
        var r, i = {},
            s = 0;
        for (t = t.split("."), 1 === t.length && (e[t] = n); t.length;) r = t.shift(), void 0 === e[r] && 0 === s && t.length > 0 ? (e[r] = {}, i = e[r]) : 0 === s && t.length > 0 ? "object" != typeof e[r] ? (e[r] = {}, i = e[r]) : i = e[r] : t.length > 0 ? "object" != typeof i[r] ? (i[r] = {}, i = i[r]) : i = i[r] : 0 === t.length && (i[r] = n), s++;
        return i = null, this
    }, this.setAll = function (t)
    {
        return e = t, this
    }, this.get = function (t)
    {
        t = t.split(".");
        for (var n = e; n && t.length;) n = n[t.shift()];
        return n || void 0
    };
    var r = [],
        i = [];
    return this.remote = function (t, o, s, a)
    {
        function c(t)
        {
            0 !== r.length && r.forEach(function (e, o)
            {
                n.set(e, t)
            })
        }
        var u = [],
            l = o || [],
            p = [];
        t.forEach(function (t)
        {
            var e = "";
            t.deviced && (e = "deviced"), t.systemd && (e = "systemd"), u.push(
            {
                method: e + "." + t[e],
                params: t.params
            })
        });
        var h = new Request(
        {
            batch: !0,
            request: u,
            url: jsonpath + "cc51rpc.cgi",
            allowRetry: e["allow-retry"],
            type: "socket",
            complete: function (t)
            {
                var e = [],
                    o = [];
                if (void 0 === s && (s = []), void 0 === o && (o = []), t.forEach(function (t, n)
                    {
                        t.error ? (e.push(t.error), o.push(t.error)) : e.push(t.result)
                    }), l.length > 0)
                {
                    if ("function" == typeof l[0])
                    {
                        var r = l.splice(0, 1)[0](e, s, o);
                        s.push(e), n.remote(r, l, s, o).on(function ()
                        {
                            p.forEach(function (t)
                            {
                                t.apply(this, s)
                            })
                        })
                    }
                }
                else s.push(e), c(s), p.forEach(function (t)
                {
                    "function" == typeof t && (t.apply(this, s), o.length > 0 ? n.set("remote-error", o) : n.set("remote-response", s))
                })
            },
            error: function ()
            {
                n.set("response-error")
            }
        });
        i.push(h), h.post();
        var f = {};
        return f.store = function (t)
        {
            return "object" == typeof t ? t.forEach(function (t)
            {
                r.push(t)
            }) : r.push(t), f
        }, f.then = function (t)
        {
            return l.push(t), f
        }, f.on = function (t)
        {
            return p.push(t), f
        }, f
    }, this.cancelRemotes = function ()
    {
        i.forEach(function (t)
        {
            t.cancel()
        })
    }, this.on = function (t, e)
    {
        "string" == typeof t && o.push(
        {
            selector: t,
            action: e
        })
    }, this.off = function (t)
    {
        "number" == typeof t ? o.splice(t, 1) : "function" == typeof t && o.forEach(function (e, n)
        {
            e.action === t && o.splice(n, 1)
        })
    }, this.clear = function ()
    {
        e = {}, o = []
    }, this
}

function Request(t)
{
    function e(e)
    {
        if (null !== t.error) return void t.error(e);
        throw {
            name: "Request Error",
            message: e,
            toString: function ()
            {
                return this.name + ": " + e
            }
        }
    }
    var n, o = this;
    t = t ||
    {}, t.url = t.url || "", t.complete = t.complete || function () {}, t.method = t.method || "", t.type = t.type || "default", t.batch = t.batch || "false", t.error = t.error || null, t.allowRetry = !1 !== t.allowRetry;
    return "socket" !== t.type && (n = new XMLHttpRequest), "default" === t.type && (n.onreadystatechange = function ()
    {
        if (4 === n.readyState && 200 === n.status)
        {
            var o = "" === n.responseText ? [
            {
                result:
                {
                    error: "empty-response"
                }
            }] : JSON.parse(n.responseText);
            t.complete(o)
        }
        else 4 === n.readyState && 200 !== n.status && (!0 === t.allowRetry || e("Failed to load " + t.url))
    }), this.get = function (e)
    {
        return o.lastQuery = e, "default" === t.type ? (e = e ||
        {}, e.id = this._vars.count++, e.params = e.params ||
        {}, e.jsonrpc = "2.0", e.t = (new Date).getTime(), n.open("GET", t.url, !0), n.send()) : this.jsonp(e), this
    }, this.post = function (e)
    {
        if (o.lastQuery = e, "default" === t.type)
        {
            if (!0 === t.batch)
            {
                var r = [];
                u.each(t.request, function (t, e)
                {
                    t && t.params && (t.params = t.params);
                    var n;
                    n = "function" == typeof t.params ? t.params(t.getParams) : void 0 === t.params ?
                    {} : t.params, r.push(
                    {
                        id: o._vars.count++,
                        params: n,
                        method: t.method,
                        jsonrpc: "2.0"
                    })
                }), e = r
            }
            else
            {
                e && e.params && (e.params = e.params), e = e ||
                {}, e.id = this._vars.count++;
                var i = {};
                i = "function" == typeof e.params ? e.params(e.getParams) : void 0 === e.params ?
                {} : e.params, e.getParams = void 0, e.params = i, e.jsonrpc = "2.0", e.method = t.method
            }
            t.forceGet ? (n.open("GET", t.url + "?t=" + (new Date).getTime(), !0), n.send()) : (n.open("POST", t.url + "?t=" + (new Date).getTime(), !0), n.setRequestHeader("Content-type", "application/x-www-form-urlencoded"), n.send(JSON.stringify(e)))
        }
        else "jsonp" === t.type ? this.jsonp(e) : "socket" === t.type && socket.request(t.request, function (e)
        {
            t.complete(e)
        });
        return this
    }, this.cancel = function ()
    {
        return socket.cancel(), this
    }, this
}
var u, i18n = null,
    _ = null,
    l = {},
    lang = {},
    jsonpath = "cgi-bin/",
    localIP = "",
    localCam = "cgi-bin/camproxy.cgi/",
    checkMoveEvent = !1,
    click, evt = "addEventListener" in window ? "addEventListener" : "attachEvent",
    listen = "bind";
Element.prototype.bind = function (t, e, n)
{
    this[evt](t, e, n)
};
var socket = {},
    onlineState = null,
    _socket = function ()
    {
        function t(t)
        {
            "https:" === p.protocol && window.location.href.indexOf("gw.b-tronic.net/beta") > -1 ? (u = "wss://" + t, camPath = "https://" + t + "cgi-bin/camproxy.cgi/") : "https:" === p.protocol ? (u = "wss://" + p.host + "/" + window.location.pathname.split("/")[1] + "/", camPath = window.location.origin + window.location.pathname + "cgi-bin/camproxy.cgi/") : window.location.href.indexOf("http://localhost") > -1 ? (u = "ws://192.168.13.35/", camPath = "http://192.168.254.51/cgi-bin/camproxy.cgi/") : (u = "ws://" + p.host + "/", camPath = "http://" + p.host + "/cgi-bin/camproxy.cgi/"), u += "jrpc", null === onlineState && (onlineState = setInterval(function ()
            {
                "onLine" in navigator && !1 === navigator.onLine || (m = !1), f || !1 !== m || $("#connection-error").remove()
            }, 1e3)), l = new WebSocket(u, "binary"), l.onopen = i, l.onmessage = a, l.onclose = n, l.onerror = o
        }

        function e()
        {
            null !== l && (console.log("CONNECTION WAS CLOSED"), l.close(), l = null)
        }

        function n(t)
        {
            !0 !== f && (f = !0, $("#connection-error").length || $("body").append('<div id="connection-error"><span class="text"><b>Connection lost or unable to connect.</b><br />Attempting to reconnect...</span><div>'), setTimeout(function ()
            {
                l = new WebSocket(u, "binary"), l.onopen = s, l.onmessage = a, l.onClose = n, l.onerror = o
            }, 1e3))
        }

        function o()
        {
            f = !1, n()
        }

        function r(t)
        {
            w = !0, g = [], l.send(JSON.stringify(t) + "\0")
        }

        function i()
        {
            console.log(">>>", v[0].request), r(v[0].request)
        }

        function s()
        {
            $("#connection-error").remove(), console.log("NEW QUEUE", [y].concat(v)), y.request.params.name = "webui_" + (new Date).getTime().toString(), v[0] && "rpc_client_register" === v[0].request.method || (v = [y].concat(v)), console.log(">>>", v[0].request), r(v[0].request)
        }

        function a(t)
        {
            f = !1;
            var e = new FileReader;
            e.readAsText(t.data), e.onload = function ()
            {
                var t;
                if (!(e.result.indexOf("\0") > -1)) return void g.push(e.result);
                g.length > 0 ? (g.push(e.result.split("\0")[0]), t = JSON.parse(g.join("")), g = []) : t = JSON.parse(e.result.split("\0")[0]), console.log("<<<", t), v[0].callback && (Array.isArray(t) && t.sort(function (t, e)
                {
                    return t.id - e.id
                }), v[0].callback(t)), v.splice(0, 1), v.length > 0 ? i() : 0 === v.length && (w = !1)
            }
        }

        function c(t)
        {
            return Array.isArray(t) ? t.map(function (t)
            {
                return c(t)
            }) :
            {
                jsonrpc: "2.0",
                id: h++,
                params: t.params ||
                {},
                method: t.method || void 0
            }
        }
        var u, l, p = window.location,
            h = 0,
            f = !0,
            m = !1,
            d = "webui_" + (new Date).getTime().toString(),
            g = [],
            y = {
                request:
                {
                    id: 0,
                    jsonrpc: "2.0",
                    method: "rpc_client_register",
                    params:
                    {
                        name: d
                    }
                },
                callback: function (t)
                {
                    console.log("Socket Subscription", d, t)
                }
            },
            v = [y],
            w = !0;
        return {
            request: function (t, e)
            {
                t = c(t), v.push(
                {
                    request: t,
                    callback: e
                }), w || i()
            },
            cancel: function ()
            {
                v.splice(0, 1), v.length > 0 ? i() : 0 === v.length && (w = !1)
            },
            connect: t,
            disconnect: e
        }
    };
Request.prototype._vars = {
    count: 0
};
! function ()
{
    "use strict";

    function t(e, o)
    {
        var i;
        if (o = o ||
            {}, this.trackingClick = !1, this.trackingClickStart = 0, this.targetElement = null, this.touchStartX = 0, this.touchStartY = 0, this.lastTouchIdentifier = 0, this.touchBoundary = o.touchBoundary || 10, this.layer = e, this.tapDelay = o.tapDelay || 200, this.tapTimeout = o.tapTimeout || 700, !t.notNeeded(e))
        {
            for (var r = ["onMouse", "onClick", "onTouchStart", "onTouchMove", "onTouchEnd", "onTouchCancel"], a = this, c = 0, s = r.length; c < s; c++) a[r[c]] = function (t, e)
            {
                return function ()
                {
                    return t.apply(e, arguments)
                }
            }(a[r[c]], a);
            n && (e.addEventListener("mouseover", this.onMouse, !0), e.addEventListener("mousedown", this.onMouse, !0), e.addEventListener("mouseup", this.onMouse, !0)), e.addEventListener("click", this.onClick, !0), e.addEventListener("touchstart", this.onTouchStart, !1), e.addEventListener("touchmove", this.onTouchMove, !1), e.addEventListener("touchend", this.onTouchEnd, !1), e.addEventListener("touchcancel", this.onTouchCancel, !1), Event.prototype.stopImmediatePropagation || (e.removeEventListener = function (t, n, o)
            {
                var i = Node.prototype.removeEventListener;
                "click" === t ? i.call(e, t, n.hijacked || n, o) : i.call(e, t, n, o)
            }, e.addEventListener = function (t, n, o)
            {
                var i = Node.prototype.addEventListener;
                "click" === t ? i.call(e, t, n.hijacked || (n.hijacked = function (t)
                {
                    t.propagationStopped || n(t)
                }), o) : i.call(e, t, n, o)
            }), "function" == typeof e.onclick && (i = e.onclick, e.addEventListener("click", function (t)
            {
                i(t)
            }, !1), e.onclick = null)
        }
    }
    var e = navigator.userAgent.indexOf("Windows Phone") >= 0,
        n = navigator.userAgent.indexOf("Android") > 0 && !e,
        o = /iP(ad|hone|od)/.test(navigator.userAgent) && !e,
        i = o && /OS 4_\d(_\d)?/.test(navigator.userAgent),
        r = o && /OS [6-7]_\d/.test(navigator.userAgent),
        a = navigator.userAgent.indexOf("BB10") > 0;
    t.prototype.needsClick = function (t)
    {
        switch (t.nodeName.toLowerCase())
        {
            case "button":
            case "select":
            case "textarea":
                if (t.disabled) return !0;
                break;
            case "input":
                if (o && "file" === t.type || t.disabled) return !0;
                break;
            case "label":
            case "iframe":
            case "video":
                return !0
        }
        return /\bneedsclick\b/.test(t.className)
    }, t.prototype.needsFocus = function (t)
    {
        switch (t.nodeName.toLowerCase())
        {
            case "textarea":
                return !0;
            case "select":
                return !n;
            case "input":
                switch (t.type)
                {
                    case "button":
                    case "checkbox":
                    case "file":
                    case "image":
                    case "radio":
                    case "submit":
                        return !1
                }
                return !t.disabled && !t.readOnly;
            default:
                return /\bneedsfocus\b/.test(t.className)
        }
    }, t.prototype.sendClick = function (t, e)
    {
        var n, o;
        document.activeElement && document.activeElement !== t && document.activeElement.blur(), o = e.changedTouches[0], n = document.createEvent("MouseEvents"), n.initMouseEvent(this.determineEventType(t), !0, !0, window, 1, o.screenX, o.screenY, o.clientX, o.clientY, !1, !1, !1, !1, 0, null), n.forwardedTouchEvent = !0, t.dispatchEvent(n)
    }, t.prototype.determineEventType = function (t)
    {
        return n && "select" === t.tagName.toLowerCase() ? "mousedown" : "click"
    }, t.prototype.focus = function (t)
    {
        var e;
        o && t.setSelectionRange && 0 !== t.type.indexOf("date") && "time" !== t.type && "month" !== t.type ? (e = t.value.length, t.setSelectionRange(e, e)) : t.focus()
    }, t.prototype.updateScrollParent = function (t)
    {
        var e, n;
        if (!(e = t.fastClickScrollParent) || !e.contains(t))
        {
            n = t;
            do {
                if (n.scrollHeight > n.offsetHeight)
                {
                    e = n, t.fastClickScrollParent = n;
                    break
                }
                n = n.parentElement
            } while (n)
        }
        e && (e.fastClickLastScrollTop = e.scrollTop)
    }, t.prototype.getTargetElementFromEventTarget = function (t)
    {
        return t.nodeType === Node.TEXT_NODE ? t.parentNode : t
    }, t.prototype.onTouchStart = function (t)
    {
        var e, n, r;
        if (t.targetTouches.length > 1) return !0;
        if (e = this.getTargetElementFromEventTarget(t.target), n = t.targetTouches[0], o)
        {
            if (r = window.getSelection(), r.rangeCount && !r.isCollapsed) return !0;
            if (!i)
            {
                if (n.identifier && n.identifier === this.lastTouchIdentifier) return t.preventDefault(), !1;
                this.lastTouchIdentifier = n.identifier, this.updateScrollParent(e)
            }
        }
        return this.trackingClick = !0, this.trackingClickStart = t.timeStamp, this.targetElement = e, this.touchStartX = n.pageX, this.touchStartY = n.pageY, t.timeStamp - this.lastClickTime < this.tapDelay && t.preventDefault(), !0
    }, t.prototype.touchHasMoved = function (t)
    {
        var e = t.changedTouches[0],
            n = this.touchBoundary;
        return Math.abs(e.pageX - this.touchStartX) > n || Math.abs(e.pageY - this.touchStartY) > n
    }, t.prototype.onTouchMove = function (t)
    {
        return !this.trackingClick || ((this.targetElement !== this.getTargetElementFromEventTarget(t.target) || this.touchHasMoved(t)) && (this.trackingClick = !1, this.targetElement = null), !0)
    }, t.prototype.findControl = function (t)
    {
        return void 0 !== t.control ? t.control : t.htmlFor ? document.getElementById(t.htmlFor) : t.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea")
    }, t.prototype.onTouchEnd = function (t)
    {
        var e, a, c, s, u, l = this.targetElement;
        if (!this.trackingClick) return !0;
        if (t.timeStamp - this.lastClickTime < this.tapDelay) return this.cancelNextClick = !0, !0;
        if (t.timeStamp - this.trackingClickStart > this.tapTimeout) return !0;
        if (this.cancelNextClick = !1, this.lastClickTime = t.timeStamp, a = this.trackingClickStart, this.trackingClick = !1, this.trackingClickStart = 0, r && (u = t.changedTouches[0], l = document.elementFromPoint(u.pageX - window.pageXOffset, u.pageY - window.pageYOffset) || l, l.fastClickScrollParent = this.targetElement.fastClickScrollParent), "label" === (c = l.tagName.toLowerCase()))
        {
            if (e = this.findControl(l))
            {
                if (this.focus(l), n) return !1;
                l = e
            }
        }
        else if (this.needsFocus(l)) return t.timeStamp - a > 100 || o && window.top !== window && "input" === c ? (this.targetElement = null, !1) : (this.focus(l), this.sendClick(l, t), o && "select" === c || (this.targetElement = null, t.preventDefault()), !1);
        return !(!o || i || !(s = l.fastClickScrollParent) || s.fastClickLastScrollTop === s.scrollTop) || (this.needsClick(l) || (t.preventDefault(), this.sendClick(l, t)), !1)
    }, t.prototype.onTouchCancel = function ()
    {
        this.trackingClick = !1, this.targetElement = null
    }, t.prototype.onMouse = function (t)
    {
        return !this.targetElement || (!!t.forwardedTouchEvent || (!t.cancelable || (!(!this.needsClick(this.targetElement) || this.cancelNextClick) || (t.stopImmediatePropagation ? t.stopImmediatePropagation() : t.propagationStopped = !0, t.stopPropagation(), t.preventDefault(), !1))))
    }, t.prototype.onClick = function (t)
    {
        var e;
        return this.trackingClick ? (this.targetElement = null, this.trackingClick = !1, !0) : "submit" === t.target.type && 0 === t.detail || (e = this.onMouse(t), e || (this.targetElement = null), e)
    }, t.prototype.destroy = function ()
    {
        var t = this.layer;
        n && (t.removeEventListener("mouseover", this.onMouse, !0), t.removeEventListener("mousedown", this.onMouse, !0), t.removeEventListener("mouseup", this.onMouse, !0)), t.removeEventListener("click", this.onClick, !0), t.removeEventListener("touchstart", this.onTouchStart, !1), t.removeEventListener("touchmove", this.onTouchMove, !1), t.removeEventListener("touchend", this.onTouchEnd, !1), t.removeEventListener("touchcancel", this.onTouchCancel, !1)
    }, t.notNeeded = function (t)
    {
        var e, o, i;
        if (void 0 === window.ontouchstart) return !0;
        if (o = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1])
        {
            if (!n) return !0;
            if (e = document.querySelector("meta[name=viewport]"))
            {
                if (-1 !== e.content.indexOf("user-scalable=no")) return !0;
                if (o > 31 && document.documentElement.scrollWidth <= window.outerWidth) return !0
            }
        }
        if (a && (i = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/), i[1] >= 10 && i[2] >= 3 && (e = document.querySelector("meta[name=viewport]"))))
        {
            if (-1 !== e.content.indexOf("user-scalable=no")) return !0;
            if (document.documentElement.scrollWidth <= window.outerWidth) return !0
        }
        return "none" === t.style.msTouchAction || "manipulation" === t.style.touchAction || (!!(+(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [, 0])[1] >= 27 && (e = document.querySelector("meta[name=viewport]")) && (-1 !== e.content.indexOf("user-scalable=no") || document.documentElement.scrollWidth <= window.outerWidth)) || ("none" === t.style.touchAction || "manipulation" === t.style.touchAction))
    }, t.attach = function (e, n)
    {
        return new t(e, n)
    }, "function" == typeof define && "object" == typeof define.amd && define.amd ? define(function ()
    {
        return t
    }) : "undefined" != typeof module && module.exports ? (module.exports = t.attach, module.exports.FastClick = t) : window.FastClick = t
}();

function inputNumber(e)
{
    function t()
    {
        console.log(e.max && n + e.step <= e.max || !e.max, e.step), (e.max && n + e.step <= e.max || !e.max) && (n += e.step, i.value.value = n, s(n))
    }

    function a()
    {
        (e.min && n - e.step >= e.min || !e.min) && (n -= e.step, i.value.value = n, s(n))
    }
    e.step || (e.step = 1);
    var n = parseInt(e.value),
        s = function () {},
        i = function ()
        {
            var s = document.createElement("div");
            if (s.classList.add("input"), s.classList.add("number"), "object" == typeof e.class ? e.class.forEach(function (e)
                {
                    s.classList.add(e)
                }) : "string" == typeof e.class && s.classList.add(e.class), e.label)
            {
                var i = document.createElement("label");
                i.textContent = e.label
            }
            var c = document.createElement("div");
            c.classList.add("increase");
            var l = document.createElement("div");
            l.classList.add("struct-icon"), l.classList.add("add"), c.appendChild(l);
            var d = document.createElement("div");
            d.classList.add("decrease");
            var o = document.createElement("div");
            o.classList.add("struct-icon"), o.classList.add("remove"), d.appendChild(o);
            var r = document.createElement("input");
            return r.value = n, s.appendChild(i), s.appendChild(d), s.appendChild(r), s.appendChild(c), c.addEventListener("click", t), d.addEventListener("click", a),
            {
                core_wrapper: s,
                value: r
            }
        }();
    return {
        element: i.core_wrapper,
        handle: function (e)
        {
            s = e
        },
        getValue: function ()
        {
            return i.value.value
        },
        setValue: function (e)
        {
            n = e, i.value.value = n
        },
        destroy: function ()
        {
            null !== i.core_wrapper.parentNode && i.core_wrapper.parentNode.removeChild(i.core_wrapper)
        }
    }
}

function inputBlocker(e)
{
    var t = function ()
        {
            var t = document.createElement("div");
            if (t.classList.add("input"), t.classList.add("blocker"), t.classList.add("off"), e.is_loader)
            {
                t.classList.add("struct-loader");
                var a = document.createElement("div");
                a.classList.add("struct-icon"), a.classList.add("icon-becker"), a.classList.add("big");
                document.createElement("div").classList.add("text"), t.appendChild(a)
            }
            return {
                core_wrapper: t
            }
        }(),
        a = null;
    return {
        element: t.core_wrapper,
        destroy: function ()
        {
            t.core_wrapper.classList.add("off"), setTimeout(function ()
            {
                window.requestAnimationFrame(function ()
                {
                    !0 === e.is_loader ? t.core_wrapper.style.display = "none" : null !== (a = t.core_wrapper.parentNode) && a.removeChild(t.core_wrapper)
                })
            }, 200)
        },
        attach: function ()
        {
            t.core_wrapper.style.display = "", setTimeout(function ()
            {
                null !== a && t.core_wrapper.classList.add("off"), window.requestAnimationFrame(function ()
                {
                    t.core_wrapper.classList.remove("off")
                })
            }, 50)
        }
    }
}

function inputDate(e)
{
    function t()
    {
        var t = document.createElement("div");
        t.classList.add("select-date"), s.element.appendChild(t);
        var i = document.createElement("div");
        i.classList.add("label-date"), i.textContent = _("Tag");
        var c = document.createElement("div");
        c.classList.add("label-date"), c.textContent = _("Monat");
        var l = document.createElement("div");
        l.classList.add("label-date"), l.textContent = _("Jahr");
        var d = document.createElement("div");
        d.classList.add("select-day");
        var o = document.createElement("div");
        o.classList.add("select-month");
        var r = document.createElement("div");
        r.classList.add("select-year");
        for (var u = new Date(e.date_year, e.date_month, 0), p = [], v = [], m = [], f = 0; f < u.format("dd"); f++)
        {
            var h = document.createElement("div");
            h.textContent = f.length < 2 ? "0" + f + 1 : f + 1, d.appendChild(h), p.push(h)
        }
        for (var f = 0; f < 12; f++)
        {
            var L = document.createElement("div");
            L.textContent = f.length < 2 ? "0" + f + 1 : f + 1, o.appendChild(L), v.push(L)
        }
        for (var f = 1972; f < 2050; f++)
        {
            var E = document.createElement("div");
            E.textContent = f, r.appendChild(E), m.push(E)
        }
        d.addEventListener("click", function (t)
        {
            p.forEach(function (e)
            {
                e.classList.remove("active")
            });
            var a = t.target;
            a.classList.add("active"), e.date_day = a.textContent
        }), o.addEventListener("click", function (t)
        {
            v.forEach(function (e)
            {
                e.classList.remove("active")
            });
            var a = t.target;
            a.classList.add("active"), e.date_month = a.textContent, p.forEach(function (e)
            {
                e.parentNode.removeChild(e)
            }), p = [], u = new Date(e.date_year, e.date_month, 0);
            for (var n = 0; n < u.format("dd"); n++)
            {
                var s = document.createElement("div");
                s.textContent = n.length < 2 ? "0" + n + 1 : n + 1, d.appendChild(s), p.push(s)
            }
            d.scrollTop = 0, p[0].classList.add("active"), e.date_day = "01"
        }), r.addEventListener("click", function (t)
        {
            m.forEach(function (e)
            {
                e.classList.remove("active")
            });
            var a = t.target;
            a.classList.add("active"), e.date_year = a.textContent, p.forEach(function (e)
            {
                e.parentNode.removeChild(e)
            }), p = [], u = new Date(e.date_year, e.date_month, 0);
            for (var n = 0; n < u.format("dd"); n++)
            {
                var s = document.createElement("div");
                s.textContent = n.length < 2 ? "0" + n + 1 : n + 1, d.appendChild(s), p.push(s)
            }
            d.scrollTop = 0, p[0].classList.add("active"), e.date_day = "01"
        }), t.appendChild(i), t.appendChild(c), t.appendChild(l), t.appendChild(d), t.appendChild(o), t.appendChild(r);
        var b = document.createElement("div");
        b.textContent = _("OK"), b.classList.add("confirm"), b.addEventListener("click", function ()
        {
            s.element.removeChild(t), n = new Date(e.date_year, parseInt(e.date_month) - 1, e.date_day), s.day.textContent = n.format("dd"), s.month.textContent = n.format("mm"), s.year.textContent = n.format("yyyy"), a(n)
        }), t.appendChild(b)
    }
    var a = function () {},
        n = new Date(parseInt(e.date_year), parseInt(e.date_month), parseInt(e.date_day)),
        s = function ()
        {
            var a = document.createElement("div");
            if (a.classList.add("input"), a.classList.add("date"), "object" == typeof e.class ? e.class.forEach(function (e)
                {
                    a.classList.add(e)
                }) : "string" == typeof e.class && a.classList.add(e.class), e.label)
            {
                var n = document.createElement("label");
                n.textContent = e.label, a.appendChild(n)
            }
            var s = document.createElement("div");
            s.classList.add("date-selector");
            var i = document.createElement("div");
            i.classList.add("day"), i.textContent = e.date_day;
            var c = document.createElement("div");
            c.classList.add("month"), c.textContent = e.date_month;
            var l = document.createElement("div");
            return l.classList.add("year"), l.textContent = e.date_year, s.appendChild(i), s.appendChild(c), s.appendChild(l), a.appendChild(s), s.addEventListener("click", t),
            {
                element: a,
                select_wrapper: s,
                day: i,
                month: c,
                year: l
            }
        }();
    return {
        element: s.element,
        handle: function (e)
        {
            a = e
        },
        getValue: function ()
        {
            return n
        }
    }
}

function inputTimeRange(e)
{
    var t = function () {},
        a = function () {},
        n = e.start_time || "00:00",
        s = e.end_time || "00:00",
        i = [!1, !1, !1, !1, !1, !1, !1];
    "string" == typeof e.days && (e.days = e.days.split(",")), "object" == typeof e.days && e.days.forEach(function (e, t)
    {
        i[parseInt(e)] = !0
    });
    var c = function ()
    {
        var t = document.createElement("div");
        t.classList.add("input"), t.classList.add("time-range");
        var c = null;
        if ("string" == typeof e.label && (c = document.createElement("label"), c.textContent = e.label, t.appendChild(c)), !0 === e.single_time && t.classList.add("single-time"), e.only_days && t.classList.add("only-days"), "object" == typeof e.class ? e.class.forEach(function (e)
            {
                t.classList.add(e)
            }) : "string" == typeof e.class && t.classList.add(e.class), !e.single_time)
        {
            var l = [_("So"), _("Mo"), _("Di"), _("Mi"), _("Do"), _("Fr"), _("Sa")],
                d = document.createElement("div");
            d.classList.add("days"), l.forEach(function (e, t)
            {
                var a = document.createElement("div");
                a.textContent = e, a.classList.add("day"), a.setAttribute("data-day-id", t), d.appendChild(a), !0 === i[t] && a.classList.add("active")
            }), t.appendChild(d), d.addEventListener("click", function (e)
            {
                if (e.target.classList.contains("day"))
                {
                    var t = parseInt(e.target.getAttribute("data-day-id"));
                    e.target.classList.contains("active") ? (e.target.classList.remove("active"), i[t] = !1) : (e.target.classList.add("active"), i[t] = !0)
                }
            })
        }
        if (!e.only_days)
        {
            var o = document.createElement("div");
            if (o.classList.add("from"), o.textContent = n + " " + _("Uhr"), t.appendChild(o), !e.single_time)
            {
                var r = document.createElement("div");
                r.classList.add("label_from"), r.textContent = _("Zwischen"), t.appendChild(r);
                var u = document.createElement("div");
                u.classList.add("til"), u.textContent = s + " " + _("Uhr"), t.appendChild(u);
                var p = document.createElement("div");
                p.classList.add("label_til"), p.textContent = _("Und"), t.appendChild(p)
            }
            var v = function (e)
            {
                var i = document.createElement("div");
                i.classList.add("select-time"), t.appendChild(i);
                var c = document.createElement("div");
                c.textContent = _("Stunde"), c.classList.add("label-hours"), i.appendChild(c);
                var l = document.createElement("div");
                l.textContent = _("Minute"), l.classList.add("label-minutes"), i.appendChild(l);
                var d = document.createElement("div");
                d.classList.add("select-hours"), i.appendChild(d);
                var r = document.createElement("div");
                r.classList.add("select-minutes"), i.appendChild(r);
                for (var p = [], v = 0; v < 24; v++)
                {
                    var m = document.createElement("div");
                    m.textContent = v < 10 ? "0" + v : v, d.appendChild(m), p.push(m)
                }
                for (var f = [], v = 0; v < 60; v++)
                {
                    var h = document.createElement("div");
                    h.textContent = v < 10 ? "0" + v : v, r.appendChild(h), f.push(h)
                }
                var L = document.createElement("div");
                L.textContent = _("OK"), L.classList.add("confirm"), i.appendChild(L);
                var E = {
                    h: "00",
                    m: "00"
                };
                d.addEventListener("click", function (e)
                {
                    p.forEach(function (e)
                    {
                        e.classList.remove("active")
                    });
                    var t = e.target;
                    E.h = t.textContent, t.classList.add("active")
                }), r.addEventListener("click", function (e)
                {
                    f.forEach(function (e)
                    {
                        e.classList.remove("active")
                    });
                    var t = e.target;
                    E.m = t.textContent, t.classList.add("active")
                }), L.addEventListener("click", function (c)
                {
                    t.removeChild(i), a(), "til" === e ? (u.textContent = E.h + ":" + E.m + " " + _("Uhr"), s = E.h + ":" + E.m) : (o.textContent = E.h + ":" + E.m + " " + _("Uhr"), n = E.h + ":" + E.m)
                })
            }
        }
        return {
            core_wrapper: t,
            time_til_select: u,
            time_from_select: o,
            render_time: v
        }
    }();
    return e.only_days || (e.single_time || c.time_til_select.addEventListener("click", function ()
    {
        t(), c.render_time("til")
    }), c.time_from_select.addEventListener("click", function ()
    {
        t(), c.render_time("from")
    })),
    {
        element: c.core_wrapper,
        pop: function (e)
        {
            t = e
        },
        collapse: function (e)
        {
            a = e
        },
        getValue: function ()
        {
            var e = [];
            return i.forEach(function (t, a)
            {
                !0 === t && e.push(a)
            }),
            {
                days: e,
                time: [n, s]
            }
        },
        destroy: function ()
        {
            null !== c.core_wrapper.parentNode && c.core_wrapper.parentNode.removeChild(c.core_wrapper)
        }
    }
}

function inputInput(e)
{
    var t = e.on || function () {},
        a = function ()
        {
            var t = document.createElement("div");
            t.classList.add("input"), t.classList.add("input-input");
            var a = document.createElement("input");
            if ("string" == typeof e.type && a.setAttribute("type", e.type), "number" == typeof e.maxlength && a.setAttribute("maxlength", e.maxlength), "string" == typeof e.name && a.setAttribute("name", e.name), "string" == typeof e.placeholder && a.setAttribute("placeholder", e.placeholder), "string" == typeof e.label)
            {
                var n = document.createElement("label");
                n.textContent = e.label, t.appendChild(n)
            }
            return "object" == typeof e.class ? e.class.forEach(function (e)
            {
                t.classList.add(e)
            }) : "string" == typeof e.class && t.classList.add(e.class), void 0 !== e.value && (a.value = e.value), !0 === e.readonly && a.setAttribute("readonly", !0), t.appendChild(a),
            {
                wrapper: t,
                input: a
            }
        }();
    return function ()
    {
        a.input.addEventListener("change", function ()
        {
            t(this.value)
        }), a.input.addEventListener("keyup", function ()
        {
            t(this.value)
        }), a.input.addEventListener("mwheelup", function ()
        {
            t(this.value)
        }), a.input.addEventListener("mwheeldown", function ()
        {
            t(this.value)
        })
    }(),
    {
        element: a.wrapper,
        input: a.input,
        setValue: function (e)
        {
            a.input.value = e
        },
        getValue: function ()
        {
            return a.input.value
        },
        setError: function (e)
        {
            a.wrapper.classList.add("error")
        },
        unsetError: function ()
        {
            a.wrapper.classList.remove("error")
        },
        focus: function ()
        {
            a.input.focus()
        }
    }
}

function inputConfirm(e)
{
    var t = function ()
    {
        var t = document.createElement("div");
        t.classList.add("input"), t.classList.add("confirm"), "object" == typeof e.class ? e.class.forEach(function (e)
        {
            t.classList.add(e)
        }) : "string" == typeof e.class && t.classList.add(e.class);
        var a = document.createElement("label");
        a.classList.add("confirm-title"), a.textContent = e.title, t.appendChild(a);
        var n = new inputButton(
            {
                label: e.buttons[0].label,
                icon: e.buttons[0].icon,
                class: e.buttons[0].class,
                on: function ()
                {
                    "function" == typeof e.on && e.on(!0)
                }
            }),
            s = new inputButton(
            {
                label: e.buttons[1].label,
                icon: e.buttons[1].icon,
                class: e.buttons[1].class,
                on: function ()
                {
                    "function" == typeof e.on && e.on(!1)
                }
            });
        return t.appendChild(n.element), t.appendChild(s.element),
        {
            wrapper: t
        }
    }();
    return {
        element: t.wrapper,
        destroy: function ()
        {
            t.wrapper.parentNode.removeChild(t.wrapper)
        }
    }
}

function inputButton(e)
{
    var t = e.on || function () {},
        a = e.selected || !1,
        n = document.createElement("div");
    if (n.classList.add("input"), n.classList.add("button"), !0 === e.needs_click && n.classList.add("needsclick"), !0 === e.selectable && n.classList.add("selectable"), "object" == typeof e.class ? e.class.forEach(function (e)
        {
            n.classList.add(e)
        }) : "string" == typeof e.class && n.classList.add(e.class), "string" == typeof e.icon)
    {
        var s = document.createElement("span");
        s.classList.add("struct-icon"), s.classList.add(e.icon), n.appendChild(s)
    }
    else "object" == typeof e.icon && (n.classList.add("multi-icon"), e.icon.forEach(function (e)
    {
        var t = document.createElement("span");
        t.classList.add("struct-icon"), t.classList.add(e), n.appendChild(t)
    }));
    var i = document.createElement("div");
    i.textContent = e.label, i.classList.add("text"), n.appendChild(i), !0 === e.selectable && !0 === a && (a = !0, n.classList.add("checked")), n.addEventListener("click", function (s)
    {
        s.preventDefault(), !0 === e.selectable && !1 === a ? (a = !0, n.classList.add("checked"), t(!0, c)) : !0 === e.selectable && !0 === a ? (a = !1, n.classList.remove("checked"), t(!1, c)) : t(!0, c)
    });
    var c = {
        element: n,
        destroy: function ()
        {
            null !== n.parentNode && n.parentNode.removeChild(n)
        },
        handle: function (e)
        {
            t = e
        },
        hide: function ()
        {
            n.classList.add("hidden")
        },
        show: function ()
        {
            n.classList.remove("hidden")
        },
        isSelected: function ()
        {
            return a
        },
        select: function ()
        {
            console.log("BUTTON - SELECT IS CALLED"), a = !0, n.classList.add("checked")
        },
        deselect: function ()
        {
            console.log("BUTTON - DESELECT IS CALLED"), a = !1, n.classList.remove("checked")
        }
    };
    return c
}

function inputCheckboxList(e)
{
    e = e ||
    {};
    var t = function () {},
        a = [],
        n = function ()
        {
            var n = document.createElement("div");
            if (n.classList.add("input"), n.classList.add("checkbox-list"), "object" == typeof e.class ? e.class.forEach(function (e)
                {
                    n.classList.add(e)
                }) : "string" == typeof e.class && n.classList.add(e.class), e.force_open && n.classList.add("force-open"), "string" == typeof e.label)
            {
                var s = document.createElement("label");
                s.textContent = e.label, n.appendChild(s)
            }
            return a = [], e.options.forEach(function (s)
            {
                var i = new inputButton(
                {
                    label: s.text,
                    icon: s.icon,
                    class: e.button_class || !1,
                    selectable: !0,
                    selected: s.selected || !1,
                    needs_click: e.sortable || !1
                });
                i.value = s, i.handle(function ()
                {
                    void 0 !== e.multiple && !1 === e.multiple && (a.forEach(function (e)
                    {
                        e.deselect()
                    }), i.select()), t(i.isSelected(), s)
                }), a.push(i), n.appendChild(i.element)
            }),
            {
                core_wrapper: n
            }
        }();
    return {
        element: n.core_wrapper,
        handle: function (e)
        {
            t = e
        },
        setOptions: function (s)
        {
            a.forEach(function (e)
            {
                n.core_wrapper.removeChild(e.element)
            }), a = [], s.forEach(function (s)
            {
                var i = new inputButton(
                {
                    label: s.text,
                    icon: s.icon,
                    class: e.button_class || !1,
                    selectable: !0,
                    selected: s.selected || !1,
                    needs_click: e.sortable || !1
                });
                i.value = s, i.handle(function ()
                {
                    t(i.isSelected(), s)
                }), a.push(i), n.core_wrapper.appendChild(i.element)
            })
        },
        addOption: function (s)
        {
            e.options.push(s);
            var i = new inputButton(
            {
                label: s.text,
                icon: s.icon,
                class: e.button_class || !1,
                selectable: !0,
                selected: s.selected || !1,
                needs_click: e.sortable || !1
            });
            i.value = s, i.handle(function ()
            {
                t(i.isSelected(), s)
            }), a.push(i), n.core_wrapper.appendChild(i.element)
        }
    }
}

function inputSelect(e)
{
    function t()
    {
        i = !0, o.core_wrapper.classList.add("collapsed"), o.label.textContent = e.label, d()
    }

    function a()
    {
        i = !1, o.core_wrapper.classList.remove("collapsed"), o.label.textContent = e.label, l()
    }
    var n = [],
        s = e.on || function () {},
        i = !1,
        c = null,
        l = function () {},
        d = function () {},
        o = function ()
        {
            var t = document.createElement("div");
            t.classList.add("input"), t.classList.add("select"), "object" == typeof e.class ? e.class.forEach(function (e)
            {
                t.classList.add(e)
            }) : "string" == typeof e.class && t.classList.add(e.class), e.force_open && t.classList.add("force-open");
            var a = document.createElement("label");
            return a.textContent = e.label, t.appendChild(a), e.options.forEach(function (e)
            {
                var a = document.createElement("div");
                if (a.classList.add("option"), e.icon)
                {
                    var s = document.createElement("div");
                    s.classList.add("struct-icon"), s.classList.add(e.icon), a.appendChild(s)
                }
                var i = document.createElement("p");
                i.textContent = e.text, i.classList.add("text"), a.appendChild(i), n.push(
                {
                    element: a,
                    value: e.value,
                    text: e.text
                }), t.appendChild(a)
            }),
            {
                core_wrapper: t,
                label: a
            }
        }();
    o.core_wrapper.addEventListener("click", function (t)
    {
        var a = t.target;
        a.parentNode.classList.contains("option") && (a = a.parentNode), n.forEach(function (t, n)
        {
            t.element === a ? (t.element.classList.add("active"), s(t, r), c = t, !0 === e.force_open ? o.label.textContent = e.label : o.label.textContent = e.label + ": " + t.text) : a.classList.contains("option") && t.element.classList.remove("active")
        })
    }), o.label.addEventListener("click", function ()
    {
        i ? a() : e.force_open || t()
    });
    var r = {
        element: o.core_wrapper,
        handle: function (e)
        {
            s = e
        },
        hide: function ()
        {
            o.core_wrapper.classList.add("hidden")
        },
        show: function ()
        {
            o.core_wrapper.classList.remove("hidden")
        },
        collapse: t,
        pop: a,
        destroy: function ()
        {
            o.core_wrapper.parentNode.removeChild(o.core_wrapper)
        },
        getOption: function (e)
        {
            return {
                option: n[e],
                element: r
            }
        },
        getValue: function ()
        {
            return c
        },
        reset: function ()
        {
            c = null, n.forEach(function (e)
            {
                e.element.classList.remove("active")
            }), setTimeout(function ()
            {
                o.label.textContent = e.label, r.setOptions([])
            })
        },
        setOptions: function (t)
        {
            e.options = t, n.forEach(function (e)
            {
                e.element.parentNode.removeChild(e.element)
            }), n = [], e.options.forEach(function (e)
            {
                var t = document.createElement("div");
                if (t.classList.add("option"), e.icon)
                {
                    var a = document.createElement("div");
                    a.classList.add("struct-icon"), "object" == typeof e.icon ? e.icon.forEach(function (e)
                    {
                        a.classList.add(e)
                    }) : a.classList.add(e.icon), t.appendChild(a)
                }
                var s = document.createElement("p");
                s.textContent = e.text, s.classList.add("text"), t.appendChild(s), n.push(
                {
                    element: t,
                    value: e.value,
                    text: e.text
                }), o.core_wrapper.appendChild(t)
            })
        },
        select: function (t)
        {
            n.forEach(function (a, n)
            {
                n === t ? (a.element.classList.add("active"), s(a, r), c = a, !0 === e.force_open ? o.label.textContent = e.label : o.label.textContent = e.label + ": " + a.text) : a.element.classList.remove("active")
            })
        },
        onCollapse: function (e)
        {
            d = e
        },
        onPop: function (e)
        {
            l = e
        }
    };
    return r
}

function inputList(e)
{
    e = e ||
    {};
    var t = function () {},
        a = function () {},
        n = [],
        s = function ()
        {
            var s = document.createElement("div");
            if (s.classList.add("input"), s.classList.add("list"), "string" == typeof e.label)
            {
                var i = document.createElement("label");
                i.textContent = e.label, s.appendChild(i)
            }
            var c = document.createElement("div");
            if (s.appendChild(c), c.classList.add("list-wrapper"), n = [], e.options.forEach(function (a)
                {
                    var s = a.icon;
                    e.sortable && (s = [a.icon, "icon-up-down"]);
                    var i = [];
                    e.button_class && "string" == typeof e.button_class ? i = [e.button_class, "button-alternate"] : e.button_class && "object" == typeof e.button_class ? (e.button_class.push("button-alternate"), i = e.button_class.filter(function ()
                    {
                        return !0
                    })) : i.push("button-alternate"), "prevent" === a.value && i.push("no-icon"), a.button_class && i.push(a.button_class);
                    var l = new inputButton(
                    {
                        label: a.text,
                        icon: s,
                        class: i
                    });
                    i = [], l.value = a, l.handle(function ()
                    {
                        t(a)
                    }), n.push(l), c.appendChild(l.element)
                }), !0 === e.sortable) var l = Sortable.create(c,
            {
                animation: 150,
                handle: ".icon-up-down",
                draggable: ".button",
                onSort: function (e)
                {
                    console.log("ONSROT", e);
                    var t = {};
                    n.forEach(function (a)
                    {
                        a.element === e.item && (t = a.value, t.element = a.element)
                    }), a(e, t)
                }
            });
            else l = null;
            return {
                core_wrapper: s,
                list_wrapper: c,
                sort: l
            }
        }();
    return {
        element: s.core_wrapper,
        handle: function (e)
        {
            t = e
        },
        handle_sort: function (e)
        {
            a = e
        },
        setOptions: function (a)
        {
            n.forEach(function (e)
            {
                s.list_wrapper.removeChild(e.element)
            }), n = [], a.forEach(function (a)
            {
                var i = [a.icon];
                e.sortable && i.push("icon-up-down");
                var c = [];
                e.button_class && "string" == typeof e.button_class ? c = [e.button_class, "button-alternate"] : e.button_class && "object" == typeof e.button_class ? (e.button_class.push("button-alternate"), c = e.button_class) : c.push("button-alternate");
                var l = new inputButton(
                {
                    label: a.text,
                    icon: i,
                    class: c,
                    needs_click: e.sortable || !1
                });
                l.value = a, l.handle(function ()
                {
                    t(a)
                }), n.push(l), s.list_wrapper.appendChild(l.element)
            }), e.options = a
        },
        getOptions: function ()
        {
            return e.options
        }
    }
}

function inputSwitch(e)
{
    e.type = void 0 === e.type ? "pill" : e.type, e.orientation = void 0 === e.orientation ? "vertical" : e.orientation, e.value = 0 !== e.value ? 1 : 0;
    var t = document.createElement("div");
    t.classList.add("input"), t.classList.add("switch"), t.classList.add(e.type), t.classList.add(e.orientation), "object" == typeof e.class ? e.class.forEach(function (e)
    {
        t.classList.add(e)
    }) : "string" == typeof e.class && t.classList.add(e.class);
    var a = document.createElement("div");
    a.textContent = e.values[0], a.classList.add("value");
    var n = document.createElement("div");
    if (n.textContent = e.values[1], n.classList.add("value"), t.appendChild(a), t.appendChild(n), 0 === e.value ? a.classList.add("active") : n.classList.add("active"), "string" == typeof e.icon)
    {
        var s = document.createElement("div");
        s.classList.add("struct-icon"), s.classList.add(e.icon), t.appendChild(s), t.classList.add("switch-icon")
    }
    return t.addEventListener("click", function ()
    {
        0 === e.value ? (a.classList.remove("active"), n.classList.add("active"), e.value = 1) : (a.classList.add("active"), n.classList.remove("active"), e.value = 0)
    }),
    {
        element: t,
        destroy: function ()
        {
            t.parentNode.removeChild(t)
        },
        getValue: function ()
        {
            return e.value
        }
    }
}

function inputHSlider(e)
{
    function t(t)
    {
        var n = t;
        e.map && e.map.index && (t = e.map.index(t));
        for (var s = 0; s < b.length; s++) b[s].classList.remove("active");
        if (!0 !== e.floating_value)
            for (var s = 0; s < b.length && !(s > t); s++) b[s].classList.add("active");
        else b[t].classList.add("active");
        a = n, r.textContent = n
    }
    var a = e.value ? e.value : 0,
        n = e.first_section_width || 5,
        s = e.per_element_style || function ()
        {
            return {}
        },
        i = function () {},
        c = document.createElement("div"),
        l = document.createElement("div"),
        d = e.toggle_values_default_index;
    if (c.classList.add("input"), c.classList.add("h-slider"), "object" == typeof e.class ? e.class.forEach(function (e)
        {
            c.classList.add(e)
        }) : "string" == typeof e.class && c.classList.add(e.class), !0 === e.vertical && c.classList.add("vertical"), e.label)
    {
        var o = document.createElement("label");
        o.textContent = e.label, c.appendChild(o), e.toggle_values && (o.innerHTML = e.toggle_values[d].label, o.addEventListener("click", function ()
        {
            d++, d > e.toggle_values.length - 1 && (d = 0), o.innerHTML = e.toggle_values[d].label
        }))
    }
    var r = document.createElement("label");
    if (r.classList.add("value"), r.textContent = a, c.appendChild(r), !0 === e.buttons)
    {
        var u = document.createElement("div");
        u.classList.add("increase");
        var p = document.createElement("div");
        p.classList.add("struct-icon"), p.classList.add("add"), u.appendChild(p);
        var v = document.createElement("div");
        v.classList.add("decrease");
        var m = document.createElement("div");
        m.classList.add("struct-icon"), m.classList.add("remove"), v.appendChild(m), l.appendChild(v), l.appendChild(u), u.addEventListener("click", function ()
        {
            var n = e.max;
            e.map && e.map.value && (n = e.map.value(e.max)), a < n && t(a + 1)
        }), v.addEventListener("click", function ()
        {
            a > 1 && t(a - 1)
        })
    }
    for (var f, h, L = e.max - e.min, E = "auto" === n ? 100 / (L + 1) : (100 - n) / L, b = [], C = document.createDocumentFragment(), _ = 0; _ <= L; _++)
    {
        f = document.createElement("div"), f.classList.add("part"), f.setAttribute("index", _), !0 === e.vertical ? f.style.height = 0 === _ && "auto" !== n ? n + "%" : E + "%" : f.style.width = 0 === _ && "auto" !== n ? n + "%" : E + "%", h = document.createElement("div"), h.classList.add("part-inner"), !0 === e.show_values && (e.map && e.map.value ? h.textContent = e.map.value(_) : h.textContent = _), f.appendChild(h);
        var g = s(_);
        for (var y in g)
        {
            var x = g[y];
            f.style[y] = x
        }
        C.appendChild(f), b[_] = f
    }
    return f = null, h = null, l.appendChild(C), c.appendChild(l), t(a), new unifiedEvent(
    {
        target: l,
        on: function (a, n)
        {
            var s = null === a.target ? null : a.target.getAttribute("index");
            null !== s && n && (s = e.map && e.map.value ? e.map.value(parseInt(s)) : parseInt(s), t(s), i(s))
        }
    }),
    {
        element: c,
        destroy: function ()
        {
            c.parentNode.removeChild(c)
        },
        getValue: function ()
        {
            return e.toggle_values ? e.toggle_values[d].calc(a) : a
        },
        handle: function (e)
        {
            i = e
        },
        update_per_element_style: function ()
        {
            for (var e = 0; e < b.length; e++)
            {
                var t = s(e);
                for (var a in t)
                {
                    var n = t[a];
                    b[e].style[a] = n
                }
            }
        },
        setValue: t
    }
}

function inputCircle(e)
{
    function t(t, n)
    {
        if (e.map ? (p = e.map(t), u.setValue(e.map(t))) : (p = t, u.setValue(t)), v !== p)
        {
            v = p;
            for (var c = 0; c < a.length; c++) a[c].classList.remove("active");
            for (var c = 0; c < a.length; c++)
                if (c > t)
                {
                    var d = s(c);
                    for (var o in d)
                    {
                        var r = d[o];
                        a[c].querySelector(".part-inner").style[o] = r
                    }
                }
            else
            {
                a[c].classList.add("active");
                var m = i(c);
                for (var o in m)
                {
                    var r = m[o];
                    a[c].querySelector(".part-inner").style[o] = r
                }
            }!0 !== n && l(p)
        }
    }
    var a = [],
        n = document.createElement("div"),
        s = e.per_element_style || function ()
        {
            return {}
        },
        i = e.per_active_element_style || function ()
        {
            return {}
        },
        c = e.radius || 66,
        l = function () {};
    if (n.classList.add("input"), n.classList.add("circle"), e.icon)
    {
        var d = document.createElement("div");
        d.classList.add("struct-icon"), d.classList.add(e.icon), n.appendChild(d)
    }
    else
    {
        var o = document.createElement("label");
        o.textContent = e.label, n.appendChild(o)
    }
    "object" == typeof e.class ? e.class.forEach(function (e)
    {
        n.classList.add(e)
    }) : "string" == typeof e.class && n.classList.add(e.class);
    var r = {
        radius: 100,
        height: 20,
        gap: 120,
        render: function (i)
        {
            this.radius = c, this.height = 20, this.gap = 120, this.labelmin = "", this.labelmax = "", this.min = 0, this.max = "", this.label = "", this.value = 0, this.icon = "", this.type = "normal", this.parts = e.division, this.showOperators = !1, this.operator = 0, this.operators = [
            {
                operator: "less",
                rendered: "<"
            },
            {
                operator: "greater-equal",
                rendered: "≥"
            }], "time" !== this.type && "timeRange" !== this.type || i || (this.gap = 0, this.parts = 24);
            var l = 360 / this.gap,
                d = 1 - this.gap / 360,
                o = 2 * Math.PI * this.radius,
                r = 2 * Math.PI / this.parts,
                u = o * d / this.parts,
                p = document.createDocumentFragment(),
                v = Math.PI / 2 + Math.PI / l + r / l;
            "time" !== this.type && "timeRange" !== this.type || i ? "time" !== this.type && "timeRange" !== this.type || (v = -Math.PI / 2 + r / 2) : v = -Math.PI / 2 + r / 2;
            for (var m = 0; m < this.parts; m++)
            {
                var f = document.createElement("div"),
                    h = document.createElement("div");
                f.appendChild(h), f.classList.add("part"), f.setAttribute("index", m), h.classList.add("part-inner");
                var L = this.radius * Math.cos(v) - u / 2,
                    E = this.radius * Math.sin(v) - this.height / 2;
                f.style.width = u + "px", f.style.height = this.height + "px", f.style.transform = "translate(" + L + "px," + E + "px) rotate(" + (v * (180 / Math.PI) - 90) + "deg)", f.style.webkitTransform = "translate(" + L + "px," + E + "px) rotate(" + (v * (180 / Math.PI) - 90) + "deg)", p.appendChild(f), v += r * d, a[m] = f;
                var b = s(m);
                for (var C in b)
                {
                    var _ = b[C];
                    h.style[C] = _
                }
            }
            var g = document.createElement("div");
            g.classList.add("b-circle"), g.appendChild(p), n.appendChild(g), new unifiedEvent(
            {
                target: n,
                on: function (e, a)
                {
                    var n = e.target.getAttribute("index");
                    null !== n && a && (n = parseInt(n), t(n))
                }
            })
        }
    };
    console.log("ReADONLY?", e);
    var u = new inputInput(
    {
        type: "number",
        minlength: 1,
        maxlength: 2,
        class: "circle-value",
        readonly: e.input_read_only,
        on: function (e)
        {
            e.length > 0 ? (e = parseInt(e), t("number" == typeof e ? e : 0)) : t(0)
        }
    });
    n.appendChild(u.element);
    var p, v;
    return r.render(), t(e.value),
    {
        element: n,
        destroy: function ()
        {
            n.parentNode.removeChild(n)
        },
        getValue: function ()
        {
            return p
        },
        handle: function (e)
        {
            l = e
        },
        setValue: function (e)
        {
            t(e, !0)
        }
    }
}

function tabs(e)
{
    function t(e)
    {
        i.forEach(function (e)
        {
            e.tab.classList.remove("active"), e.content.classList.remove("active")
        }), i[e].tab.classList.add("active"), i[e].content.classList.add("active")
    }
    var a = document.createElement("div");
    a.classList.add("tabs");
    var n = document.createElement("div");
    n.classList.add("tabs-head");
    var s = document.createElement("div");
    s.classList.add("tabs-content");
    var i = [],
        c = function () {};
    return e.forEach(function (e, t)
    {
        var a = document.createElement("div");
        a.classList.add("tab");
        var c = document.createElement("div");
        c.textContent = e, c.classList.add("text"), a.appendChild(c), n.appendChild(a);
        var l = document.createElement("div");
        s.appendChild(l), i.push(
        {
            tab: a,
            content: l,
            text: c
        })
    }), a.appendChild(n), a.appendChild(s), n.addEventListener("click", function (e)
    {
        i.forEach(function (a, n)
        {
            e.target !== a.tab && e.target !== a.text || (t(n), c(n))
        })
    }), t(0),
    {
        element: a,
        tabs: i,
        showTab: t,
        on: function (e)
        {
            c = e
        }
    }
}

function unifiedEvent(e)
{
    function t(e, t, a, n, s)
    {
        return {
            type: e,
            pageX: a,
            pageY: n,
            target: s,
            originalEvent: t
        }
    }

    function a(t)
    {
        e.on(t, n)
    }
    var n = !1,
        s = {
            DOWN: "touchmousedown",
            UP: "touchmouseup",
            MOVE: "touchmousemove"
        },
        i = function (e)
        {
            e.preventDefault();
            var i;
            switch (e.type)
            {
                case "touchstart":
                    i = s.DOWN;
                    break;
                case "touchend":
                    i = s.UP;
                    break;
                case "touchmove":
                    i = s.MOVE;
                    break;
                default:
                    return
            }
            var c = e.touches[0];
            i == s.UP ? (touchMouseEvent = t(i, e, null, null, e.target), n = !1) : i == s.DOWN ? (touchMouseEvent = t(i, e, null, null, e.target), n = !0) : touchMouseEvent = t(i, e, c.pageX, c.pageY, document.elementFromPoint(c.pageX, c.pageY)), a(touchMouseEvent)
        },
        c = function (e)
        {
            var i;
            switch (e.type)
            {
                case "mousedown":
                    i = s.DOWN;
                    break;
                case "mouseup":
                    i = s.UP;
                    break;
                case "mousemove":
                    i = s.MOVE;
                    break;
                default:
                    return
            }
            i === s.DOWN ? n = !0 : i === s.UP && (n = !1), a(t(i, e, e.pageX, e.pageY, e.target))
        };
    e.target.addEventListener("touchstart", i), e.target.addEventListener("touchmove", i), e.target.addEventListener("touchend", i), e.target.addEventListener("mousedown", c), e.target.addEventListener("mouseup", c), e.target.addEventListener("mousemove", c)
}

function logic_grid(e)
{
    var t = [],
        n = null,
        i = 0,
        a = !1,
        o = function ()
        {
            var a = document.createElement("div");
            a.classList.add("grid-wrapper");
            var o = document.createElement("div");
            o.classList.add("full"), a.appendChild(o);
            var l = document.createElement("div");
            l.classList.add("grid-head"), o.appendChild(l);
            var s = null,
                d = null;
            !0 === e.controlls && (s = document.createElement("div"), s.classList.add("grid-controlls"), d = document.createElement("div"), d.classList.add("grid-controlls-inner"), s.appendChild(d), a.appendChild(s));
            var c = document.createElement("div");
            c.classList.add("grid-content"), o.appendChild(c);
            var r = document.createElement("div");
            return r.classList.add("inner-wrapper"), a.appendChild(r), e.wrapper.appendChild(a),
            {
                wrapper: a,
                inner_wrapper: r,
                controlls_wrapper: null === d ? null : d,
                fields:
                {
                    half: t,
                    full:
                    {
                        wrapper: o,
                        head: l,
                        content: c
                    },
                    lowest_empty: 0
                },
                add: function (e, a)
                {
                    var o = document.createElement("div");
                    if (o.classList.add("half"), a)
                    {
                        var l = document.createElement("div");
                        l.classList.add("grid-controll"), l.appendChild(a), null !== n ? d.insertBefore(l, n.head) : d.appendChild(l)
                    }
                    var s = document.createElement("div");
                    s.classList.add("grid-content"), o.appendChild(s), s.appendChild(e), null !== n ? r.insertBefore(o, n.content) : r.appendChild(o), t.push(
                    {
                        wrapper: o,
                        handle: l,
                        content: s,
                        removed: !1
                    }), i++
                }
            }
        }(),
        l = function (e)
        {
            !0 !== t[e].removed && (t[e].wrapper.classList.contains("active") ? s() : (a = e, t[e].wrapper.classList.add("active"), o.wrapper.classList.add("pop-state")))
        },
        s = function ()
        {
            t.forEach(function (e, t)
            {
                e.wrapper.classList.remove("active")
            }), o.wrapper.classList.remove("pop-state"), a = !1
        },
        d = function (e, n)
        {
            var i = new inputConfirm(
            {
                title: n.title,
                buttons: n.buttons,
                on: function (a)
                {
                    if (!0 === a)
                    {
                        t[e].wrapper.classList.add("removed"), t[e].handle.classList.add("removed");
                        var o = document.createElement("div");
                        o.classList.add("removed-message");
                        var l = document.createElement("div");
                        l.classList.add("message-title");
                        var d = document.createElement("div");
                        d.classList.add("message-body"), o.appendChild(l), o.appendChild(d), l.textContent = n.final_message.title, d.textContent = n.final_message.body, t[e].wrapper.appendChild(o), s(), n.on_delete()
                    }
                    i.destroy()
                }
            });
            t[e].removed = !0, t[e].wrapper.appendChild(i.element)
        };
    return {
        fill: function (e, t)
        {
            "full" === e ? (t.head && o.controlls_wrapper.appendChild(t.head), o.fields.full.content.appendChild(t.content)) : "half" === e ? o.add(t.content, t.head) : "static-last" === e && null === n && (n = {
                content: null,
                head: null
            }, n.content = document.createElement("div"), n.content.classList.add("static"), n.content.appendChild(t.content), n.head = document.createElement("div"), n.head.classList.add("static-controll"), n.head.appendChild(t.head), o.controlls_wrapper.appendChild(n.head), o.inner_wrapper.appendChild(n.content))
        },
        controlls:
        {
            toggleTo: l,
            toggleOff: s,
            requestDelete: d
        },
        nextIndex: function ()
        {
            return i
        },
        activeIndex: function ()
        {
            return a
        }
    }
}

function visu(e)
{
    e.wrapper = e.wrapper || null;
    var t = !0,
        n = function ()
        {
            var t = document.createElement("div");
            t.classList.add("visual-wrapper");
            var n = document.createElement("div");
            n.classList.add("area");
            var i = (e.item.device_type, e.item.device_type, document.createElement("input"));
            i.classList.add("name"), i.setAttribute("name", "name"), i.value = e.item_name, i.addEventListener("change", function ()
            {
                var t = this.value;
                e.model.remote([
                {
                    deviced: "item_set_name",
                    params:
                    {
                        item_id: e.item.id,
                        name: t
                    }
                }])
            });
            var a = document.createElement("div");
            a.classList.add("visual");
            var o = document.createElement("div"),
                l = document.createElement("div");
            o.classList.add("struct-control-frontend"), o.classList.add("detailed-icon"), l.classList.add("struct-control-content"), o.appendChild(l);
            var s = {},
                d = document.createElement("div");
            d.classList.add("current");
            var c = new inputButton(
            {
                label: _("Optionen"),
                icon: "icon-gear",
                class: ["green", "align-bottom-right", "no-icon-border", "dynamic-size", "auto-width"]
            });
            c.handle(function ()
            {
                window.location.href = "#/device/options/?i=" + centralControl.objectToURIComponent(e.item)
            });
            var r = angularRootScope.$new(!0),
                u = null;
            return e.remote_type ? (r.item = e.item, u = angularCompile('<sensor context="preview" item="item"></sensor>')(r)) : (r.item = e.item, u = angularCompile('<device context="preview" item="item"></device>')(r), console.log("ELM", elm)), l.appendChild(u[0]), n.appendChild(i), n.appendChild(a), a.appendChild(o), a.appendChild(d), n.appendChild(c.element), t.appendChild(n),
            {
                current_values_display: s,
                visual: a,
                core_wrapper: t,
                type_pict: u,
                type_pict_scope: r
            }
        }();
    return {
        element: n.core_wrapper,
        unload: function ()
        {
            n.type_pict_scope.$destroy(), n.type_pict.remove(), t = !1
        }
    }
}

function logic(e)
{
    function t()
    {
        c.trigger.element.classList.add("locked"), c.trigger.handles.user_save(function ()
        {
            s()
        }), c.trigger.handles.user_delete(function ()
        {
            n()
        })
    }

    function n()
    {
        e.controlls.requestDelete(e.grid_index,
        {
            final_message:
            {
                title: _("Gelöschte Logik"),
                body: _("Die Logik wurde gelöscht und wird beim nächsten Seitenaufruf nicht mehr angezeigt.")
            },
            title: _("Sind Sie sicher, dass Sie die Logik löschen wollen?"),
            buttons: [
            {
                label: _("Löschen"),
                icon: "delete",
                class: ["delete", "no-icon-border"]
            },
            {
                label: _("Abbrechen"),
                icon: "none",
                class: ["green"]
            }],
            on_delete: function ()
            {
                e.model.remote([
                {
                    deviced: "item_delete",
                    params:
                    {
                        item_id: e.logic_id
                    }
                }])
            }
        })
    }

    function i(e)
    {
        console.log("OPTION", e), c.trigger.set("event_name", e.value);
        var t = document.createElement("div");
        t.classList.add("struct-icon"), t.classList.add(e.value.icon), f.core_head.appendChild(t), u = c.trigger.render_tabs(), r = c.trigger.render_controlls(), m = c.trigger.render_trigger(), m.delete.handle(function ()
        {
            n()
        }), m.save.handle(function ()
        {
            s()
        }), u.tabs[0].content.appendChild(m.name.element), u.tabs[0].content.appendChild(m.deleteContainer), u.tabs[0].content.appendChild(m.saveContainer), h = u.tabs[3].content, h = document.createElement("div"), h.style.cssText = "position:absolute; left:0; right:0; bottom:74px; top:0; overflow-y:auto;", u.tabs[3].content.appendChild(h);
        var i = new inputButton(
        {
            label: _("Speichern"),
            icon: "save",
            class: ["green", "no-icon-border", "fixed-bottom", "half-width", "right", "dynamic-size"]
        });
        i.handle(function ()
        {
            s()
        });
        var a = new inputButton(
        {
            label: _("Löschen"),
            icon: "delete",
            class: ["delete", "no-icon-border", "fixed-bottom", "half-width", "dynamic-size"]
        });
        a.handle(function ()
        {
            n()
        }), u.tabs[3].content.appendChild(i.element), u.tabs[3].content.appendChild(a.element), u.tabs[0].content.appendChild(r.container), null !== r.hysteresis && u.tabs[0].content.appendChild(r.hysteresis.element), u.on(function (e)
        {
            1 !== e && 2 !== e || !1 !== v[e] ? 3 === e && h.appendChild(g.element) : o(e)
        }), c.trigger.element.appendChild(u.element)
    }

    function a()
    {
        if (null !== c.trigger.handles.user_logic_new)
            if (c.trigger.handles.user_logic_new_options_length > 1) c.trigger.handles.user_logic_new(function (e, t)
            {
                if ("value-wind" === e.value.command)
                {
                    var n = new inputConfirm(
                    {
                        title: _("Achtung! Bei der Verwendung der Windauswertung ist keine Sensorfunktionsüberwachung aktiv. Im Fall eines Sensordefekts erfolgt keine Sicherheitseinfahrt - bitte lernen Sie den Sensor dazu direkt in den entsprechenden Antrieb ein."),
                        buttons: [
                        {
                            label: _("OK"),
                            icon: "sym-confirm",
                            class: ["delete", "no-icon-border"]
                        },
                        {
                            label: _("Abbrechen"),
                            icon: "undo",
                            class: ["hidden"]
                        }],
                        on: function (a)
                        {
                            c.trigger.element.removeChild(n.element), t.destroy(), i(e)
                        }.bind(this)
                    });
                    c.trigger.element.appendChild(n.element)
                }
                else t.destroy(), i(e)
            });
            else
            {
                var e = c.trigger.handles.user_logic_new_get_option(0);
                e.element.destroy(), i(e.option)
            }
    }

    function o(t)
    {
        var n = [
            {
                value: "sensors",
                text: _("Sensor"),
                icon: "icon-sensor"
            },
            {
                value: "receivers",
                text: _("Empfänger"),
                icon: "icon-receiver"
            },
            {
                value: "internal_objects",
                text: _("Internes Objekt"),
                icon: "icon-internal-object"
            },
            {
                value: "time",
                text: _("Zeitraum"),
                icon: "item-clock"
            }],
            i = new inputSelect(
            {
                options: n,
                label: _("Typ wählen")
            }),
            a = new inputSelect(
            {
                options: [],
                label: _("Ziel wählen")
            }),
            o = new inputSelect(
            {
                options: [],
                label: _("Wert wählen")
            });
        !1 === v[t] ? (u.tabs[t].content.appendChild(i.element), u.tabs[t].content.appendChild(a.element), u.tabs[t].content.appendChild(o.element)) : null !== c.conditions[t - 1] && void 0 !== c.conditions[t - 1] && c.conditions[t - 1].handles.user_delete(function ()
        {
            c.conditions[t - 1].destroy(), c.conditions[t - 1] = null, u.tabs[t].content.appendChild(i.element), u.tabs[t].content.appendChild(a.element), u.tabs[t].content.appendChild(o.element)
        }), i.handle(function (n, s)
        {
            s.collapse();
            var d = [];
            "time" === n.value ? l(
            {
                value: "time"
            },
            {}, t, i, a, o) : (e.model.get(n.value).forEach(function (e)
            {
                d.push(
                {
                    value: e,
                    text: e.name,
                    icon: function ()
                    {
                        return "group" === e.type && "virtual" !== e.backend ? sensorTypeToIconName("group-" + e.device_type) : "remote" === e.type ? "icon-sensor" : "virtual" === e.backend ? "icon-internal-object" : sensorTypeToIconName(e.device_type)
                    }()
                })
            }), a.setOptions(d), a.handle(function (e, n)
            {
                n.collapse();
                var s = e.value,
                    d = centralControl.itemToValueOptions(e.value);
                o.setOptions(d), o.handle(function (e)
                {
                    l(e, s, t, i, a, o)
                })
            }))
        }), v[t] = !0
    }

    function l(e, t, n, i, a, o)
    {
        var l = new condition(
        {
            fresh: !1,
            is_trigger: !1,
            event_name: e.value,
            event_value: 0,
            item: t,
            controlls:
            {}
        });
        l.handles.user_delete(function ()
        {
            l.destroy(), l = null, u.tabs[n].content.appendChild(i.element), u.tabs[n].content.appendChild(a.element), u.tabs[n].content.appendChild(o.element), u.tabs[n].tab.classList.remove("highlight")
        }), i.destroy(), a.destroy(), o.destroy(), c.conditions[n - 1] = l, u.tabs[n].tab.classList.add("highlight"), u.tabs[n].content.appendChild(l.element)
    }

    function s()
    {
        c.trigger.element.classList.add("locked");
        var t = c.trigger.get_values(),
            n = c.trigger.handles.user_name();
        "" === n && (n = _("Unbenannte Logik")), e.logic_id && e.model.remote([
        {
            deviced: "item_delete",
            params:
            {
                item_id: e.logic_id
            }
        }]), e.model.remote([
        {
            deviced: "logic_new",
            params:
            {
                name: n,
                enabled: !0
            }
        }]).then(function (n)
        {
            e.logic_id = n[0].logic_id;
            var i = [];
            return i.push(
            {
                deviced: "condition_new",
                params:
                {
                    parent_id: e.logic_id,
                    item_id: e.parent.id,
                    event_name: t.event.command,
                    condition: t.condition_type,
                    event_value: t.value,
                    hysteresis: null === t.hysteresis ? 0 : t.hysteresis,
                    is_trigger: !0
                }
            }), c.conditions.forEach(function (t)
            {
                if (null !== t)
                    if (t = t.get_values(), !1 === t.ignore && "time" !== t.value_type)
                    {
                        var n = t.value;
                        t = {
                            parent_id: e.logic_id,
                            item_id: t.item_id,
                            event_name: t.event.command,
                            event_value: t.event_value,
                            condition: t.condition_type,
                            hysteresis: null === t.hysteresis ? 0 : t.hysteresis,
                            is_trigger: !1
                        }, "string" != typeof n && (t.event_value = n), i.push(
                        {
                            deviced: "condition_new",
                            params: t
                        })
                    }
                else if (!1 === t.ignore && "time" === t.value_type)
                {
                    var n = t.value;
                    t = {
                        parent_id: e.logic_id,
                        start_time: t.value.time[0],
                        end_time: t.value.time[1],
                        days: t.value.days
                    }, i.push(
                    {
                        deviced: "condition_new_time",
                        params: t
                    })
                }
            }), d = g.getCommands(), d.forEach(function (t)
            {
                var n = {
                    deviced: "command_new",
                    params:
                    {
                        target: "radio" === t.item.type ? "systemd" : "deviced",
                        parent_id: e.logic_id,
                        item_id: "radio" === t.item.type ? t.item.station_id : t.item.id,
                        command: t.action.command,
                        value: t.action.value
                    }
                };
                i.push(n)
            }), console.log("SAVE:", i), i
        }).on(function (e, t)
        {
            console.log("========================="), console.log("SAVE"), console.log("LOGIC", e), console.log("CONDITIONS / COMMANDS", t), console.log("=========================")
        }), f.core_wrapper.classList.add("locked"), e.controlls.toggleOff(), p.setName(n)
    }
    e.fresh = !1 !== e.fresh;
    var d = e.commands || [],
        c = {
            trigger: null,
            conditions: []
        },
        r = null,
        u = null,
        m = null,
        p = function () {},
        v = [!1, !1, !1, !1],
        h = null,
        g = null;
    g = new commandEditor(
    {
        model: e.model,
        commands: e.commands
    }), g.commandsChanged(function (e)
    {
        0 === e.length ? u.tabs[3].tab.classList.remove("highlight") : u.tabs[3].tab.classList.add("highlight")
    });
    var f = function ()
    {
        var i = document.createElement("div");
        i.classList.add("logic-wrapper");
        var l = document.createElement("div");
        l.classList.add("logic-head");
        var d = document.createElement("div");
        d.classList.add("add-condition");
        var r = document.createElement("div");
        r.classList.add("struct-icon"), r.classList.add("right");
        var m = document.createElement("div");
        m.classList.add("struct-icon");
        var f = document.createElement("p");
        if (f.textContent = e.name || _("Unbenannte Logik"), d.appendChild(m), d.appendChild(f), d.appendChild(r), l.appendChild(d), !1 === e.fresh)
        {
            m.classList.add(centralControl.itemToValueOptions(e.trigger.items[0])[0].icon), c.trigger = new condition(
            {
                fresh: !1,
                is_trigger: !0,
                name: e.name,
                condition_type: e.trigger.condition_type,
                event_name: e.trigger.event_name,
                event_value: e.trigger.event_value,
                hysteresis: e.trigger.hysteresis,
                type: e.trigger.type,
                condition_id: e.trigger.id,
                item: e.trigger.items[0],
                controlls:
                {
                    grid: e.controlls,
                    grid_index: e.grid_index,
                    logic: p
                }
            }), u = c.trigger.tabs, h = u.tabs[3].content, h = document.createElement("div"), h.style.cssText = "position:absolute; left:0; right:0; bottom:74px; top:0; overflow-y:auto;", u.tabs[3].content.appendChild(h);
            var y = new inputButton(
            {
                label: _("Speichern"),
                icon: "save",
                class: ["green", "no-icon-border", "fixed-bottom", "half-width", "right", "dynamic-size"]
            });
            y.handle(function ()
            {
                s()
            });
            var w = new inputButton(
            {
                label: _("Löschen"),
                icon: "delete",
                class: ["delete", "no-icon-border", "fixed-bottom", "half-width", "dynamic-size"]
            });
            w.handle(function ()
            {
                n()
            }), u.tabs[3].content.appendChild(y.element), u.tabs[3].content.appendChild(w.element), e.commands && e.commands.length > 0 && u.tabs[3].tab.classList.add("highlight"), i.appendChild(c.trigger.element), u.on(function (e)
            {
                1 === e || 2 === e ? o(e) : 3 === e && h.appendChild(g.element)
            }), e.items.length > 0 && e.items.forEach(function (e, t)
            {
                e.items || (e.type = "condition", e.items = [
                {}], e.event_name = "time", e.time_options = {
                    start_time: e.start_time,
                    end_time: e.end_time,
                    days: e.weekdays
                }), c.conditions.push(new condition(
                {
                    fresh: !1,
                    is_trigger: !1,
                    condition_type: e.condition_type,
                    event_name: e.event_name,
                    event_value: e.event_value,
                    hysteresis: e.hysteresis,
                    type: e.type,
                    item: e.items[0],
                    condition_id: e.id,
                    time_options: e.time_options
                })), v[t + 1] = c.conditions[t], c.trigger.tabs.tabs[t + 1].tab.classList.add("highlight"), c.trigger.tabs.tabs[t + 1].content.appendChild(c.conditions[t].element)
            }), t()
        }
        else !0 === e.fresh && setTimeout(function ()
        {
            c.trigger = new condition(
            {
                fresh: !0,
                is_trigger: !0,
                name: "",
                event_value: 0,
                item: e.parent,
                controlls:
                {
                    grid: e.controlls,
                    grid_index: e.grid_index,
                    logic: p
                }
            }), i.appendChild(c.trigger.element), a(), e.controlls.toggleTo(e.grid_index)
        });
        return {
            core_wrapper: i,
            core_head: l,
            controll_label: f
        }
    }();
    return f.core_head.addEventListener("click", function ()
    {
        e.controlls.toggleTo(e.grid_index)
    }), p.setName = function (e)
    {
        f.controll_label.textContent = e
    },
    {
        element: f.core_wrapper,
        head: f.core_head,
        unload: function ()
        {
            console.log("UNLOAD LOGICS"), console.log("UNLOAD LOGICS", f.type_pict), active = !1
        }
    }
}

function condition(e)
{
    function t()
    {
        var t = document.createElement("div");
        if (t.classList.add("condition-wrapper"), !0 !== e.is_trigger)
        {
            var n = document.createElement("span");
            n.classList.add("label-sm"), n.textContent = _("Zusatzkondition");
            var i = document.createElement("label");
            "time" === e.event_name ? i.textContent = _("Zeitraum") : i.textContent = e.item.name, i.appendChild(n), t.appendChild(i), t.classList.add("condition")
        }
        var a = document.createElement("div");
        a.classList.add("condition-lock");
        var o = document.createElement("div");
        o.classList.add("condition-lock-inner");
        var l = document.createElement("span");
        l.classList.add("struct-icon"), l.classList.add("icon-lock-open"), o.appendChild(l);
        var s = document.createElement("span");
        return s.classList.add("condition-lock-text"), s.textContent = _("Bearbeiten"), o.appendChild(s), o.addEventListener("click", function ()
        {
            t.classList.remove("locked")
        }), a.appendChild(o), t.appendChild(a),
        {
            element: t,
            handles: o
        }
    }

    function n()
    {
        var t = {},
            n = document.createElement("div");
        if (n.classList.add("input"), n.classList.add("container"), s = e.event_name, l = e.event_name, console.log("RENDERING CONDITION CONTROLLS", e), "string" == typeof s && "time" !== s)
        {
            "dimmer" === e.item.device_type && .4 === e.event_value && (s = "switch");
            centralControl.itemToValueOptions(e.item).forEach(function (e)
            {
                s === e.value.name && (s = e.value)
            })
        }
        else "time" === s && (s = {
            type: "time"
        });
        if (console.log("_EVENT", s), void 0 !== e.event_value && "switch" === s.type && ("less" === e.condition_type ? e.event_value = 0 : e.event_value = 1), "switch" === s.type ? (n.classList.add("switch-container"), t.value = new inputSwitch(
            {
                value: e.event_value,
                values: s.values,
                icon: s.icon,
                orientation: "horizontal",
                type: "pill",
                class: s.class || []
            })) : "static" === s.type ? (t.value = {}, t.value.element = document.createElement("div"), t.value.element.classList.add("struct-icon"), t.value.element.classList.add(s.icon), t.value.element.classList.add("condition-icon"), t.value.getValue = function ()
            {
                return s
            }) : "range" === s.type ? (t.condition_type = new inputSwitch(
            {
                value: "less" === e.condition_type ? 0 : 1,
                values: ["<", "≥"],
                orientation: "vertical",
                type: "pill"
            }), "shutter" === e.item.device_type || "venetian" === e.item.device_type || "screen" === e.item.device_type ? (t.value = new inputHSlider(
            {
                class: ["hysteresis"],
                value: e.event_value,
                vertical: !0,
                buttons: !0,
                min: 0,
                max: 20,
                map:
                {
                    index: function (e, t)
                    {
                        return e / 5
                    },
                    value: function (e)
                    {
                        return 5 * e
                    }
                }
            }), n.classList.add("type-shutter")) : t.value = new inputCircle(
            {
                division: s.division,
                value: e.event_value,
                class: s.class || [],
                icon: s.icon,
                label: _("Wert")
            })) : "time" === s.type && (n.classList.add("time-container"), e.time_options || (e.time_options = {}), t.value = new inputTimeRange(
            {
                start_time: e.time_options.start_time,
                end_time: e.time_options.end_time,
                days: e.time_options.days
            }), t.value.pop(function ()
            {
                n.classList.add("pop")
            }), t.value.collapse(function ()
            {
                n.classList.remove("pop")
            })), s.allow_hysteresis)
        {
            var i = 0,
                a = e.hysteresis;
            e.hysteresis > 59 && e.hysteresis < 3600 ? (i = 1, a = e.hysteresis / 60) : e.hysteresis > 3599 && (i = 2, a = e.hysteresis / 3600), t.hysteresis = new inputHSlider(
            {
                label: _("Für (Minuten)"),
                class: ["hysteresis", "value-toggle"],
                value: a,
                min: 0,
                max: 59,
                toggle_values: [
                {
                    label: _("Für (<span>s</span> / min / h)"),
                    calc: function (e)
                    {
                        return e
                    }
                },
                {
                    label: _("Für (s / <span>min</span> / h)"),
                    calc: function (e)
                    {
                        return 60 * e
                    }
                },
                {
                    label: _("Für (s / min / <span>h</span>)"),
                    calc: function (e)
                    {
                        return 3600 * e
                    }
                }],
                toggle_values_default_index: i
            })
        }
        else t.hysteresis = null;
        return t.value && n.appendChild(t.value.element), t.condition_type ? n.appendChild(t.condition_type.element) : t.condition_type = null, t.container = n, r && (r.handles.user_input = t), t
    }

    function i()
    {
        return new tabs([_("wenn"), _("und"), _("und"), _("dann")])
    }

    function a()
    {
        var t = {};
        return t.name = new inputInput(
        {
            type: "text",
            placeholder: _("Logik benennen"),
            minlength: 1,
            class: "condition-name",
            value: e.name,
            on: function (t)
            {
                e.controlls.logic.setName(t)
            }
        }), !0 === e.is_trigger ? (t.save = new inputButton(
        {
            label: _("Speichern"),
            icon: "save",
            class: ["green", "no-icon-border", "dynamic-size", "dynamic-size"]
        }), t.delete = new inputButton(
        {
            label: _("Löschen"),
            icon: "delete",
            class: ["delete", "no-icon-border", "dynamic-size"]
        }), t.saveContainer = document.createElement("div"), t.saveContainer.classList.add("dynamic-half"), t.saveContainer.classList.add("absolute-bottom-right"), t.saveContainer.appendChild(t.save.element)) : (t.delete = new inputButton(
        {
            label: _("Zurücksetzen"),
            icon: "undo",
            class: ["warn", "no-icon-border", "dynamic-size"]
        }), t.save = null), t.deleteContainer = document.createElement("div"), t.deleteContainer.classList.add("dynamic-half"), t.deleteContainer.classList.add("absolute-bottom-left"), t.deleteContainer.appendChild(t.delete.element), r && (r.handles.user_name = t.name.getValue), t
    }

    function o()
    {
        console.log("ITEM TO VALUE OPTIONS FOR NEW LOGIC", centralControl.itemToValueOptions(e.item));
        var t = centralControl.itemToValueOptions(e.item);
        return {
            select_type: new inputSelect(
            {
                options: t,
                label: _("Typ wählen")
            }),
            type_length: t.length
        }
    }
    var l, s = e.event_name,
        d = {},
        c = !1,
        r = function ()
        {
            var l = t(),
                s = null,
                c = null,
                r = null;
            return !1 === e.fresh && !0 === e.is_trigger ? (d = i(), s = a(), d.tabs[0].content.appendChild(s.name.element), d.tabs[0].content.appendChild(s.deleteContainer), d.tabs[0].content.appendChild(s.saveContainer), c = n(), d.tabs[0].content.appendChild(c.container), null !== c.hysteresis && d.tabs[0].content.appendChild(c.hysteresis.element), l.element.appendChild(d.element)) : !0 === e.fresh && !0 === e.is_trigger ? (r = o(), l.element.appendChild(r.select_type.element)) : !0 !== e.fresh && !0 !== e.is_trigger && (c = n(), l.element.appendChild(c.container), s = a(), l.element.appendChild(s.deleteContainer), null !== c.hysteresis && l.element.appendChild(c.hysteresis.element)),
            {
                element: l.element,
                tabs: d,
                handles:
                {
                    user_logic_new: null === r ? null : r.select_type.handle,
                    user_logic_new_options_length: null === r ? null : r.type_length,
                    user_logic_new_get_option: null === r ? null : r.select_type.getOption,
                    user_lock: l.handles,
                    user_select_device_type: null,
                    user_input: null === c ? null : c,
                    user_delete: null === s || null === s.delete ? null : s.delete.handle,
                    user_save: null === s || null === s.save ? null : s.save.handle,
                    user_name: null === s || null === s.name ? null : s.name.getValue
                }
            }
        }();
    return {
        render_controlls: n,
        render_tabs: i,
        render_trigger: a,
        render_logic_new: o,
        handles: r.handles,
        element: r.element,
        tabs: r.tabs,
        destroy: function ()
        {
            r.element.parentNode.removeChild(r.element), c = !0
        },
        set: function (t, n)
        {
            e[t] = n
        },
        get: function (t)
        {
            return e[t]
        },
        get_values: function ()
        {
            return {
                value_type: l,
                event: s,
                item_id: e.item.id,
                item: e.item,
                value: function ()
                {
                    if ("switch" === s.type) return "dimmer" === e.item.device_type ? .4 : 1;
                    if ("static" !== s.type) return null === r.handles.user_input || null === r.handles.user_input.value ? null : r.handles.user_input.value.getValue()
                }(),
                hysteresis: null === r.handles.user_input || null === r.handles.user_input.hysteresis ? null : r.handles.user_input.hysteresis.getValue(),
                condition_type: function ()
                {
                    var e = null === r.handles.user_input || null === r.handles.user_input.value ? null : r.handles.user_input.value.getValue();
                    return "switch" === s.type && null !== e && 0 === e ? "less" : "switch" === s.type && 1 === e ? "greater-equal" : 1 === (null === r.handles.user_input || null === r.handles.user_input.condition_type ? null : r.handles.user_input.condition_type.getValue()) ? "greater-equal" : "less"
                }(),
                logic_name: null === r.handles || null === r.handles.name ? null : r.handles.name,
                ignore: c
            }
        }
    }
}

function commandToIcon(e, t)
{
    return "move" === e.command && -1 === e.value ?
    {
        icon: "ctrl-up",
        text: _("Auf")
    } : "move" === e.command && 1 === e.value ?
    {
        icon: "ctrl-down",
        text: _("Ab")
    } : "moveto" === e.command || "dimto" === e.command ?
    {
        icon: "icon-target-value"
    } : "switch" === e.command && 0 === e.value ?
    {
        icon: "sym-switch-off",
        text: _("Aus")
    } : "switch" === e.command && 1 === e.value ?
    {
        icon: "sym-switch-off",
        text: _("An")
    } : "invoke" === e.command ?
    {
        icon: "icon-play"
    } : "stop" === e.command ?
    {
        icon: "icon-stop"
    } : "start" === e.command ?
    {
        icon: "icon-play"
    } : "movepreset" === e.command ?
    {
        icon: "sym-digit-" + e.value,
        text: _("Pos.") + e.value
    } : "step" === e.command ?
    {
        icon: "sym-switch-off",
        text: _("Schalten")
    } : "tempmode" === e.command ? 0 === e.value ?
    {
        icon: "comfort",
        text: _("Komfort")
    } : 1 === e.value ?
    {
        icon: "eco",
        text: _("Eco")
    } : 2 === e.value ?
    {
        icon: "anti-freeze",
        text: _("Frostschutz")
    } :
    {
        icon: "icon-target-value",
        text: _("Zielwert")
    } : void 0
}

function getItemOptions(e)
{
    if ("scene" === e.type) return [
    {
        text: _("Szenario auslösen"),
        icon: "icon-play",
        value:
        {
            command: "invoke"
        }
    },
    {
        text: _("Szenario stoppen"),
        icon: "icon-stop",
        value:
        {
            command: "stop"
        }
    }];
    if ("radio" === e.type) return [
    {
        text: _("An"),
        icon: "icon-play",
        value:
        {
            command: "start"
        }
    },
    {
        text: _("Aus"),
        icon: "icon-stop",
        value:
        {
            command: "stop"
        }
    }];
    if ("switch" === e.device_type) return [
    {
        text: _("An"),
        icon: "sym-switch-off",
        value:
        {
            command: "switch",
            value: 1
        }
    },
    {
        text: _("Aus"),
        icon: "sym-switch-off",
        value:
        {
            command: "switch",
            value: 0
        }
    }];
    if ("heater" === e.device_type) return [
    {
        text: _("An"),
        icon: "sym-switch-off",
        value:
        {
            command: "switch",
            value: 1
        }
    },
    {
        text: _("Aus"),
        icon: "sym-switch-off",
        value:
        {
            command: "switch",
            value: 0
        }
    },
    {
        text: _("Automatik 120min"),
        icon: "sym-digit-1",
        value:
        {
            command: "movepreset",
            value: 1
        }
    },
    {
        text: _("Automatik 60min"),
        icon: "sym-digit-2",
        value:
        {
            command: "movepreset",
            value: 2
        }
    }];
    if ("shutter" === e.device_type || "roof-window" === e.device_type || "awning" === e.device_type || "screen" === e.device_type || "sun-sail" === e.device_type || "venetian" === e.device_type)
    {
        var t = [
        {
            text: _("Auf"),
            icon: "ctrl-up",
            value:
            {
                command: "move",
                value: -1
            }
        },
        {
            text: _("Ab"),
            icon: "ctrl-down",
            value:
            {
                command: "move",
                value: 1
            }
        },
        {
            text: _("Zwischenposition 1"),
            icon: "sym-digit-1",
            value:
            {
                command: "movepreset",
                value: 1
            }
        }];
        return "roof-window" === e.device_type ? t.push(
        {
            text: _("Lüftung"),
            icon: "sym-shamrock",
            value:
            {
                command: "movepreset",
                value: 2
            }
        }) : t.push(
        {
            text: _("Zwischenposition 2"),
            icon: "sym-digit-2",
            value:
            {
                command: "movepreset",
                value: 2
            }
        }), !0 === e.feedback && t.push(
        {
            text: _("Sollwert"),
            icon: "icon-target-value",
            value:
            {
                command: "moveto"
            }
        }), e.device_type, t
    }
    if ("dimmer" === e.device_type)
    {
        var t = [
        {
            text: _("An"),
            icon: "sym-switch-off",
            value:
            {
                command: "switch",
                value: 1
            }
        },
        {
            text: _("Aus"),
            icon: "sym-switch-off",
            value:
            {
                command: "switch",
                value: 0
            }
        },
        {
            text: _("Zwischenposition 1"),
            icon: "sym-digit-1",
            value:
            {
                command: "dimpreset",
                value: 1
            }
        },
        {
            text: _("Zwischenposition 2"),
            icon: "sym-digit-2",
            value:
            {
                command: "dimpreset",
                value: 2
            }
        }];
        return !0 !== e.feedback && "knx-rf" !== e.backend || t.push(
        {
            text: _("Sollwert"),
            icon: "icon-target-value",
            value:
            {
                command: "dimto"
            }
        }), t
    }
    return "door-pulse" === e.device_type ? [
    {
        text: _("Senden"),
        icon: "device-door",
        value:
        {
            command: "step"
        }
    }] : "thermostat" === e.device_type ? [
    {
        text: _("An"),
        icon: "sym-switch-off",
        value:
        {
            command: "switch",
            value: 1
        }
    },
    {
        text: _("Aus"),
        icon: "sym-switch-off",
        value:
        {
            command: "switch",
            value: 0
        }
    },
    {
        text: _("Frostschutz"),
        icon: "icon-freeze",
        value:
        {
            command: "tempmode",
            value: 1
        }
    },
    {
        text: _("Komfort"),
        icon: "sym-house-inside",
        value:
        {
            command: "tempmode",
            value: 2
        }
    },
    {
        text: _("Eco"),
        icon: "sym-house-outside",
        value:
        {
            command: "tempmode",
            value: 3
        }
    }] : "door" === e.device_type ? [
    {
        text: _("Auf"),
        icon: sensorTypeToIconName("up"),
        value:
        {
            command: "move",
            value: -1
        }
    },
    {
        text: _("Ab"),
        icon: sensorTypeToIconName("down"),
        value:
        {
            command: "move",
            value: 1
        }
    }] : "sun-sail" === e.device_type ? [
    {
        text: _("Einfahren"),
        icon: sensorTypeToIconName("up"),
        value:
        {
            command: "move",
            value: 1
        }
    },
    {
        text: _("Ausfahren"),
        icon: sensorTypeToIconName("down"),
        value:
        {
            command: "move",
            value: -1
        }
    },
    {
        text: _("Zwischenposition 1"),
        icon: "sym-digit-1",
        value:
        {
            command: "movepreset",
            value: 1
        }
    },
    {
        text: _("Zwischenposition 2"),
        icon: "sym-digit-2",
        value:
        {
            command: "movepreset",
            value: 2
        }
    }] : []
}

function sensorTypeToIconName(e)
{
    var t = "icon-unknown";
    switch (e)
    {
        case "sun":
            t = "sunny";
            break;
        case "wind":
            t = "sym-weather-wind";
            break;
        case "rain":
            t = "rain";
            break;
        case "smoke":
            t = "icon-fire";
            break;
        case "open":
            t = "icon-window-open";
            break;
        case "switch":
            t = "device-switch";
            break;
        case "up":
            t = "ctrl-up";
            break;
        case "down":
            t = "ctrl-down";
            break;
        case "sensor-sun-wind-rain":
        case "sensor-sun-wind":
        case "sensor-sun":
        case "sensor-wind":
            t = "sensor-sun-wind-rain";
            break;
        case "shutter":
            t = "remote";
            break;
        case "group-thermostat":
            t = "icon-thermostat";
            break;
        case "group-shutter":
            t = "device-shutter";
            break;
        case "group-dimmer":
            t = "device-dimmer";
            break;
        case "group-switch":
            t = "device-switch";
            break;
        case "open":
            t = "icon-window-open";
            break;
        case "group-roof-window":
            t = "device-roof-window"
    }
    return t
}

function struct_head(e)
{
    var t = function ()
    {
        var t = document.createElement("div");
        t.classList.add("struct-head"), t.classList.add("off");
        var a = document.createElement("div");
        a.classList.add("hidden-desktop"), a.classList.add("head"), t.appendChild(a);
        var n = document.createElement("div");
        return n.classList.add("hidden-mobile"), n.classList.add("head"), t.appendChild(n), e.buttons.forEach(function (e)
        {
            var t = document.createElement("div");
            t.classList.add("struct-icon"), t.classList.add(e.icon), n.appendChild(t);
            var d = document.createElement("div");
            d.classList.add("struct-icon"), d.classList.add(e.icon), a.appendChild(d), t.addEventListener("click", e.click.screen), d.addEventListener("click", e.click.mobile)
        }), centralControl.theme.quickMenu,
        {
            wrapper: t
        }
    }();
    return {
        element: t.wrapper,
        attach: function ()
        {
            !1 === centralControl.theme.transitions ? t.wrapper.classList.remove("off") : setTimeout(function ()
            {
                window.requestAnimationFrame(function ()
                {
                    t.wrapper.classList.remove("off")
                })
            }, 50)
        },
        destroy: function ()
        {
            !1 === centralControl.theme.transitions ? (t.wrapper.classList.add("off"), t.wrapper.parentNode.removeChild(t.wrapper)) : (t.wrapper.classList.add("off"), setTimeout(function ()
            {
                window.requestAnimationFrame(function ()
                {
                    t.wrapper.parentNode.removeChild(t.wrapper)
                })
            }, 200))
        }
    }
}

function structWrapper(e)
{
    e = e ||
    {};
    var r = function ()
    {
        var r = document.createElement("div");
        r.classList.add("struct-wrapper"), r.classList.add("off"), "object" == typeof e && "object" == typeof e.class ? e.class.forEach(function (e)
        {
            r.classList.add(e)
        }) : "object" == typeof e && "string" == typeof e.class && r.classList.add(e.class);
        var t = document.createElement("div");
        return t.classList.add("struct-content"), !0 === e.center_content && t.classList.add("center-content"), !0 === e.overflow_y && r.classList.add("overflow-y"), r.appendChild(t),
        {
            core_wrapper: r,
            core_content: t
        }
    }();
    return {
        element: r.core_wrapper,
        content: r.core_content,
        attach: function ()
        {
            !1 === centralControl.theme.transitions ? r.core_wrapper.classList.remove("off") : setTimeout(function ()
            {
                window.requestAnimationFrame(function ()
                {
                    r.core_wrapper.classList.remove("off")
                })
            }, 100)
        },
        destroy: function ()
        {
            !1 === centralControl.theme.transitions ? (r.core_wrapper.classList.add("off"), r.core_wrapper.parentNode.removeChild(r.core_wrapper)) : (r.core_wrapper.classList.add("off"), setTimeout(function ()
            {
                window.requestAnimationFrame(function ()
                {
                    var e = r.core_wrapper.parentNode;
                    null !== e && (r.core_wrapper.classList.remove("off"), e.removeChild(r.core_wrapper))
                })
            }, 1e3))
        },
        force: function (e)
        {
            "on" === e ? r.core_wrapper.classList.add("force") : "off" === e && r.core_wrapper.classList.remove("force")
        }
    }
}

function structTiles(e)
{
    function t()
    {
        if (null !== i) return p.core_wrapper.classList.remove("collapse"), i.collapse(), void(i = null);
        !0 === s ? (s = !1, p.tiles.forEach(function (e)
        {
            e.element.classList.remove("active")
        }), p.core_wrapper.classList.remove("collapse")) : window.location.href = "#/favourites/"
    }

    function n()
    {
        setTimeout(function ()
        {
            window.requestAnimationFrame(function ()
            {
                p.core_wrapper.classList.remove("collapse"), l()
            })
        }, 50)
    }

    function c()
    {
        p.core_wrapper.classList.add("collapse"), r()
    }

    function a()
    {
        p.core_wrapper.classList.contains("collapse") ? p.core_wrapper.classList.remove("collapse") : p.core_wrapper.classList.add("collapse")
    }

    function o(e)
    {
        c(), setTimeout(function ()
        {
            window.requestAnimationFrame(function ()
            {
                p.core_wrapper.parentNode.removeChild(p.core_wrapper), "function" == typeof e && e()
            })
        }, 500)
    }
    var s = !1,
        i = null,
        l = function () {},
        r = function () {},
        d = function () {},
        p = function ()
        {
            function t(e, t)
            {
                window.requestAnimationFrame(function ()
                {
                    o.forEach(function (e)
                    {
                        e.element.classList.remove("active")
                    }), n.classList.add("collapse"), t.classList.add("active")
                })
            }
            var n = document.createElement("div");
            n.classList.add("struct-tiles"), "object" == typeof e.class ? e.class.forEach(function (e)
            {
                n.classList.add(e)
            }) : "string" == typeof e.class && n.classList.add(e.class);
            var c = document.createElement("div");
            if (c.classList.add("tile-wrapper"), !0 === e.collapse && n.classList.add("collapse"), e.title)
            {
                n.classList.add("with-title");
                var a = document.createElement("div");
                a.classList.add("title"), a.textContent = e.title, n.appendChild(a)
            }
            var o = [];
            return e.tiles.forEach(function (e)
            {
                var t = document.createElement("div");
                t.classList.add("tile"), "string" == typeof e.special && t.classList.add(e.special);
                var n = document.createElement("div");
                n.classList.add("tile-inner"), e.background && (n.style.background = e.background);
                var a = document.createElement("div");
                a.classList.add("struct-icon"), a.classList.add(e.icon), e.icon_color && (a.style.color = e.icon_color), e.icon_shadow && (a.style.textShadow = e.icon_shadow);
                var s = document.createElement("div");
                s.classList.add("text"), s.textContent = e.text, n.appendChild(a), n.appendChild(s), t.appendChild(n), e.content && n.appendChild(e.content), c.appendChild(t), o.push(
                {
                    element: t,
                    text: e.text,
                    icon: e.icon,
                    href: e.href,
                    jump: e.jump
                })
            }), n.addEventListener("click", function (e)
            {
                for (var c = e.target;
                    "HTML" !== c.nodeName;) c = c.parentNode, o.forEach(function (e)
                {
                    c !== e.element || c.classList.contains("active") || e.href || e.jump ? c === e.element && e.href && !e.jump ? (window.location.href = e.href, d()) : c === e.element && e.jump && (n.classList.add("collapse"), e.jump.pop(), i = e.jump) : (t(e, c), s = !0)
                })
            }), n.appendChild(c),
            {
                core_wrapper: n,
                tiles: o
            }
        }();
    return {
        element: p.core_wrapper,
        back: t,
        pop: n,
        collapse: c,
        toggle: a,
        destroy: o,
        onCollapse: function (e)
        {
            r = e
        },
        onPop: function (e)
        {
            l = e
        },
        onClick: function (e)
        {
            d = e
        }
    }
}

function structRouter(n)
{
    function t(n, t, o)
    {
        var a, l, i;
        return t ? (a = o ||
        {}, i = ["#/" + t]) : (p.push(window.location.hash), i = window.location.hash.split("?"), (a = i[1] || "") && (a = e(a.split("=")[1] || btoa("%7B%7D")))), l = i[0].split("#/")[1] || "", l = l.split("/"), null !== c && c.load(), l.length < 1 && (1 !== l.length || "" !== l[0]) ? void console.warn('falsy or old route "' + window.location.hash + '". Aborting."') : (l = l.join("/"), null !== u && !0 !== u.persistent && (u.instantiated = !1, u.unload(), u = null), d.forEach(function (n, t)
        {
            if (!0 === n.instantiated)
            {
                var o = l.substr(0, n.path.length);
                o === n.path ? n.change(
                {
                    path: l
                }) : (n.unload(), n.instantiated = !1)
            }
            else if (!0 !== n.instantiated)
            {
                var o = l.substr(0, n.path.length);
                o === n.path && (h = n, c.load(a), h.instantiated = !0, h.model = new Model, h.load(a))
            }
        }), s.forEach(function (n, t)
        {
            l === n.path && (!0 === n.loader && centralControl.loader.attach(), u = n, u.instantiated = !0, "object" == typeof o && !0 === o.freeze || (u.model = new Model), c.load(a), u.load(a), h = null)
        }), f)
    }

    function o(n)
    {
        return LZString.compressToEncodedURIComponent(JSON.stringify(n)).replace(/\+/g, "%20")
    }

    function e(n)
    {
        n = n.replace(/%20/g, "+");
        try
        {
            json = JSON.parse(LZString.decompressFromEncodedURIComponent(n))
        }
        catch (n)
        {
            console.log("MALFORMED JSON OR CALL TO WRONG ROUTER"), json = {}
        }
        return json
    }

    function a(n)
    {
        if (p.length > 1)
        {
            var t;
            t = n && p.length > 1 + n ? p.splice(p.length - 2 - n, 2 + n) : p.splice(p.length - 2, 2), window.location.hash = t[0]
        }
    }

    function l(n, o)
    {
        t(
        {}, n, o)
    }

    function i(n)
    {
        return !0 === n.global ? null === c ? (c = n, c.instantiated = !1) : console.warn("WARNING! GLOBAL ROUTE ALREADY SET.") : !0 === n.persistent ? d.push(n) : (n.sharePersistentModel = function (t)
        {
            if (null === h) return void console.warn("_active_persistent_route was NULL");
            n.model = h.model
        }, s.push(n)), f
    }

    function r()
    {
        c.model = new Model, c.load(), c.instantiated = !0;
        var n = new inputBlocker(
        {
            is_loader: !0
        });
        document.body.appendChild(n.element), centralControl.loader = n
    }
    var s = [],
        d = [],
        c = null,
        u = null,
        h = null;
    window.addEventListener("hashchange", t, !1);
    var p = [],
        f = {
            addRoute: i,
            init: r,
            objectToURIComponent: o,
            URIComponentToObject: e,
            jumpBack: a,
            invokeRoute: l
        };
    return f
}
var centralControl = new structRouter;
document.addEventListener("DOMContentLoaded", function ()
{
    centralControl.init()
});

function commandEditor(e)
{
    function n()
    {
        for (null === l && (l = document.createElement("div")); l.firstChild;) l.removeChild(l.firstChild);
        c(d.length > 0 ? d : d), d.forEach(function (n, o)
        {
            var i = centralControl.commandToIcon(n.action, n.item),
                s = i.text ? i.text + ": " + n.item.name : n.item.name;
            "moveto" === n.action.command || "dimto" === n.action.command || "tilt" === n.action.command ? s = n.action.value + "% - " + n.item.name : "tempset" === n.action.command && (s = n.action.value + "° - " + n.item.name), "stop" === n.action.command && n.item.station_id && (s = _("Radio aus"));
            var r = [i.icon];
            e.readonly || r.push("delete");
            var m = new inputButton(
                {
                    label: s,
                    icon: r,
                    class: ["action-list", "dynamic-size"]
                }),
                u = !1;
            m.handle(function ()
            {
                if (!0 !== e.readonly && !1 === u)
                {
                    m.element.classList.add("request-delete");
                    var o = new inputConfirm(
                    {
                        buttons: [
                        {
                            label: _("Löschen"),
                            icon: "delete",
                            class: ["delete", "no-icon", t]
                        },
                        {
                            label: _("Abbrechen"),
                            icon: "none",
                            class: ["green", "no-icon", t]
                        }],
                        class: ["context-button"],
                        on: function (e)
                        {
                            !0 === e && (m.destroy(), d.forEach(function (e, t)
                            {
                                e === n && (d.splice(t, 1), a(e))
                            }), c(d)), o.destroy(), m.element.classList.remove("request-delete"), setTimeout(function ()
                            {
                                u = !1
                            })
                        }
                    });
                    u = !0, m.element.appendChild(o.element)
                }
            }), l.appendChild(m.element)
        }), i.appendChild(l)
    }
    var t = "action-editor-dummy-class";
    t = "dynamic-size";
    var a = function () {},
        o = null,
        l = null;
    document.createElement("div").classList.add("command-editor");
    var i = document.createElement("div");
    if (i.classList.add("actions-wrapper"), e.label)
    {
        var s = document.createElement("label");
        s.classList.add("actions-label"), s.textContent = _(e.label), i.appendChild(s)
    }
    var d = e.commands || [],
        c = function () {};
    return function ()
    {
        if (null === o)
        {
            o = document.createElement("div"), i.appendChild(o);
            var a = ["green", "no-icon-border", "dynamic-size"];
            !0 === e.readonly && a.push("hidden");
            var s = new inputButton(
            {
                label: _("Aktion hinzufügen"),
                icon: "add",
                class: a
            });
            o.appendChild(s.element);
            var c = document.createElement("div"),
                r = document.createElement("div"),
                m = new inputButton(
                {
                    label: _("Abbrechen"),
                    icon: "delete",
                    class: ["warn", "no-icon-border", "dynamic-size"]
                });
            c.appendChild(m.element), m.handle(function ()
            {
                c.classList.add("hidden"), s.show(), n()
            });
            var u = new inputSelect(
            {
                options: [],
                class: [t],
                label: _("Typ wählen")
            });
            c.appendChild(u.element);
            var p = new inputSelect(
            {
                options: [],
                class: [t],
                label: _("Empfänger wählen")
            });
            c.appendChild(p.element);
            var v = new inputSelect(
            {
                options: [],
                class: [t],
                label: _("Aktion wählen")
            });
            c.appendChild(v.element), c.classList.add("hidden"), o.appendChild(c), o.appendChild(r), u.onPop(function ()
            {
                p.collapse(), v.collapse()
            }), p.onPop(function ()
            {
                u.collapse(), v.collapse()
            }), v.onPop(function ()
            {
                u.collapse(), p.collapse()
            }), s.handle(function (t, a)
            {
                for (a.hide(); l.firstChild;) l.removeChild(l.firstChild);
                c.classList.remove("hidden");
                var o = [
                {
                    value: "receivers",
                    text: _("Empfänger"),
                    icon: "icon-receiver"
                },
                {
                    value: "groups",
                    text: _("Gruppen / Klimazonen"),
                    icon: "group"
                },
                {
                    value: "internal_objects",
                    text: _("Interne Objekte"),
                    icon: "icon-internal-object"
                },
                {
                    value: "scenes",
                    text: _("Szenarien"),
                    icon: "scene"
                },
                {
                    value: "radios",
                    text: _("Radios"),
                    icon: "icon-music"
                }];
                u.setOptions(o), u.pop(), u.handle(function (t, a)
                {
                    var o = [];
                    if ("receivers" === t.value) o = e.model.get("receivers"), o = o.concat(e.model.get("receivers_no_feedback"));
                    else if ("groups" === t.value)
                    {
                        var l = e.model.get("groups"),
                            i = e.model.get("climate_zones");
                        o = i && i.length > 0 ? l.concat(i) : l
                    }
                    else o = e.model.get(t.value);
                    var m = [];
                    o.forEach(function (e, n)
                    {
                        var t = centralControl.itemToValueOptions(e);
                        m[n] = {
                            value: e,
                            text: e.name,
                            icon: t[0].icon
                        }
                    }), "radios" === t.value && m.push(
                    {
                        value:
                        {
                            name: "Radio aus",
                            station_id: 1,
                            type: "radio",
                            force_off: !0,
                            url: "http://br_mp3-bayern3_m.akacast.akamaistream.net/7/442/142692/v1/gnl.akacast.akamaistream.net/br_mp3_bayern3_m"
                        },
                        text: _("Radio aus"),
                        icon: "ctrl-stop"
                    }), p.setOptions(m), p.pop(), p.handle(function (e, a)
                    {
                        "radios" === t.value && (u.reset(), u.pop(), p.reset(), v.reset(), s.show(), c.classList.add("hidden"), !0 === e.value.force_off ? d.push(
                        {
                            action: centralControl.getItemOptions(e.value)[1].value,
                            item: e.value,
                            fresh: !0
                        }) : d.push(
                        {
                            action: centralControl.getItemOptions(e.value)[0].value,
                            item: e.value,
                            fresh: !0
                        }), n()), v.setOptions(centralControl.getItemOptions(e.value)), v.pop(), v.handle(function (t, a)
                        {
                            if ("moveto" === t.value.command || "dimto" === t.value.command || "tempset" === t.value.command || "tilt" === t.value.command)
                            {
                                c.classList.add("hidden");
                                var o = 100,
                                    l = 0;
                                "tempset" === t.value.command && (o = 44, l = 22);
                                var i = new inputHSlider(
                                    {
                                        label: _("Sollwert"),
                                        class: ["hysteresis"],
                                        value: l,
                                        min: 0,
                                        max: o
                                    }),
                                    m = document.createElement("div");
                                m.classList.add("struct-hr");
                                var h = new inputButton(
                                    {
                                        label: _("OK"),
                                        icon: "sym-confirm",
                                        class: ["green", "no-icon-border"]
                                    }),
                                    f = new inputButton(
                                    {
                                        label: _("Abbrechen"),
                                        icon: "delete",
                                        class: ["delete", "no-icon-border"]
                                    });
                                r.appendChild(i.element), r.appendChild(m), r.appendChild(h.element), r.appendChild(f.element), h.handle(function ()
                                {
                                    u.reset(), u.pop(), p.reset(), v.reset(), s.show(), c.classList.add("hidden"), t.value.value = i.getValue(), d.push(
                                    {
                                        action: t.value,
                                        item: e.value,
                                        fresh: !0
                                    }), i.destroy(), r.removeChild(m), h.destroy(), f.destroy(), c.classList.add("hidden"), n()
                                }), f.handle(function ()
                                {
                                    i.destroy(), r.removeChild(m), h.destroy(), f.destroy(), c.classList.remove("hidden")
                                })
                            }
                            else u.reset(), u.pop(), p.reset(), v.reset(), s.show(), c.classList.add("hidden"), d.push(
                            {
                                action: t.value,
                                item: e.value,
                                fresh: !0
                            }), n()
                        })
                    })
                })
            })
        }
    }(), n(),
    {
        element: i,
        getCommands: function ()
        {
            return d
        },
        commandsChanged: function (e)
        {
            c = e
        },
        handleRemove: function (e)
        {
            a = e
        }
    }
}

function structGrid(e)
{
    function t(e, t)
    {
        var n = -1,
            l = 0;
        return t.forEach(function (t, a)
        {
            var i = t.indexOf(e);
            i > -1 && -1 === n && (n = a), i > -1 && (l = a - n + 1)
        }), [n, l]
    }

    function n(e, t)
    {
        var n = -1,
            l = -1;
        return t.forEach(function (t, a)
        {
            n < 0 && t === e && (n = a), t === e && (l = a - n + 1)
        }), [n, l]
    }
    var l = [],
        a = e.editMode || !1;
    e.onLayoutChange = e.onLayoutChange || function () {};
    var i = [
        [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12]
        ],
        [
            [1, 1, 2, 2],
            [1, 1, 2, 2],
            [3, 4, 5, 6]
        ],
        [
            [1, 1, 1, 2],
            [1, 1, 1, 2],
            [3, 4, 5, 6]
        ],
        [
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1]
        ]
    ];
    console.log("GRID LAYOUT", e), e.detail = e.detail || [], e.layouts.forEach(function (t, n)
    {
        e.detail[n] = i[t]
    });
    var o = function ()
    {
        var t = document.createElement("div");
        t.classList.add("struct-grid"), a && t.classList.add("grid-edit-mode");
        var n = [];
        if (e.columns)
            for (var l = 0; l < e.columns; l++)
            {
                var i = document.createElement("div");
                if (i.classList.add("column"), a)
                {
                    var o = document.createElement("div");
                    o.classList.add("column-head");
                    var s = document.createElement("div");
                    s.setAttribute("layout-mode", "0"), s.setAttribute("column-id", l), s.classList.add("struct-icon"), s.classList.add("icon-layout-1");
                    var c = document.createElement("div");
                    c.setAttribute("layout-mode", "1"), c.setAttribute("column-id", l), c.classList.add("struct-icon"), c.classList.add("icon-layout-2");
                    var d = document.createElement("div");
                    d.setAttribute("layout-mode", "2"), d.setAttribute("column-id", l), d.classList.add("struct-icon"), d.classList.add("icon-layout-3");
                    var r = document.createElement("div");
                    r.setAttribute("layout-mode", "3"), r.setAttribute("column-id", l), r.classList.add("struct-icon"), r.classList.add("icon-layout-4"), o.appendChild(s), o.appendChild(c), o.appendChild(d), o.appendChild(r), o.addEventListener("click", function (t)
                    {
                        var n = parseInt(t.target.getAttribute("column-id")),
                            l = parseInt(t.target.getAttribute("layout-mode"));
                        e.layouts[n] = l, e.changeLayout(e.layouts), e.onLayoutChange(
                        {
                            layouts: e.layouts
                        })
                    }), i.appendChild(o)
                }
                for (var u = [], m = 0; m < e.division[1]; m++)
                    for (var v = 0; v < e.division[0]; v++)
                    {
                        var p = 100 / e.division[0],
                            f = 100 / e.division[1],
                            h = document.createElement("div");
                        h.classList.add("cell"), h.style.cssText = "width:" + p + "%; height:" + f + "%; left:" + p * v + "%; top:" + f * m + "%;", u.push(h), i.appendChild(h)
                    }
                n.push(
                {
                    element: i,
                    cells: u
                }), t.appendChild(i)
            }
        return {
            element: t,
            columns: n
        }
    }();
    return function ()
    {
        cells = [];
        for (var a = 100 / e.division[0], i = 100 / e.division[1], s = 0; s < e.detail.length; s++)
        {
            o.columns[s].cells.forEach(function (e)
            {
                e.parentNode.removeChild(e)
            });
            var c = [];
            e.detail[s].forEach(function (l)
            {
                l.forEach(function (d)
                {
                    if (c.indexOf(d) < 0)
                    {
                        var r = [n(d, l), t(d, e.detail[s])];
                        c.push(d);
                        var u = document.createElement("div");
                        u.classList.add("cell"), u.style.top = i * r[1][0] + "%", u.style.left = a * r[0][0] + "%", u.style.height = i * r[1][1] + "%", u.style.width = a * r[0][1] + "%";
                        var m = document.createElement("div");
                        if (m.classList.add("sortable"), u.appendChild(m), o.columns[s].element.appendChild(u), u.classList.add("c" + r[0][1] + "x" + r[1][1]), cells.push(
                            {
                                element: u,
                                content: m,
                                size: r[0][1] + "x" + r[1][1]
                            }), cells[cells.length - 1].index = cells.length - 1, u.setAttribute("data-index", cells.length - 1), e.sortable)
                        {
                            e.parentElement && (u.addEventListener("touchstart", function ()
                            {
                                e.parentElement.style.overflow = "hidden"
                            }), u.addEventListener("touchend", function ()
                            {
                                e.parentElement.style.overflow = ""
                            }));
                            var v = null;
                            new Sortable(u,
                            {
                                group: "grid",
                                draggable: ".sortable",
                                scrollSensitivity: 30,
                                onMove: function (e)
                                {
                                    var t = parseInt($(e.from).closest(".cell").attr("data-index")),
                                        n = parseInt($(e.to).closest(".cell").attr("data-index")),
                                        l = cells[t],
                                        a = cells[n];
                                    e.to, e.from, v && (l = v, t = parseInt($(v.element).attr("data-index")));
                                    var i = {
                                            content: l.content,
                                            element: a.element,
                                            favorite: l.favorite,
                                            cp: l.cp,
                                            scope: null,
                                            size: a.size,
                                            rerender: !0,
                                            index: n
                                        },
                                        o = {
                                            content: a.content,
                                            element: l.element,
                                            favorite: a.favorite,
                                            scope: null,
                                            cp: a.cp,
                                            size: l.size,
                                            rerender: !0,
                                            index: t
                                        };
                                    cells[n] = i, cells[t] = o, $(o.element).append($(o.content)), $(i.element).append($(i.content)), v = {
                                        content: cells[n].content,
                                        element: cells[n].element,
                                        favorite: cells[n].favorite,
                                        scope: null,
                                        cp: cells[n].cp,
                                        size: cells[n].size,
                                        rerender: !0,
                                        index: n
                                    }
                                },
                                onSort: function (t)
                                {
                                    e.onSort("update"), v = null
                                }
                            })
                        }
                    }
                })
            })
        }
        l = cells
    }(),
    {
        element: o.element,
        cells: l
    }
}
var grid_config = {
    columns: 4,
    division: [3, 2],
    detail: [
        [
            [1, 1, 1],
            [3, 3, 4],
            [3, 3, 5]
        ]
    ]
};
var locale, hw_variant, update_avail;
centralControl.addRoute(
{
    path: "",
    global: !0,
    load: function () {}
}), centralControl.addRoute(
{
    path: "",
    persistent: !0,
    load: function () {},
    change: function () {}
}).addRoute(
{
    path: "deactivate/",
    load: function ()
    {
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        });
        var t = document.createElement("div");
        t.classList.add("struct-message"), t.classList.add("center-center"), t.textContent = "Für Messe deaktiviert", this.wrapper.content.appendChild(t), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element), this.wrapper.attach(), this.head.attach()
    },
    unload: function ()
    {
        this.wrapper.destroy(), this.head.destroy()
    }
});
centralControl.addRoute(
{
    path: "settings/",
    persistent: !0,
    load: function ()
    {
        this.jump = "settings/", this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), this.head.attach(), document.body.appendChild(this.head.element)
    },
    change: function (e) {},
    unload: function ()
    {
        this.head.destroy()
    }
}).addRoute(
{
    path: "settings/",
    load: function ()
    {
        this.view(), this.tile_grid.pop()
    },
    unload: function ()
    {
        this.tile_grid.destroy(function ()
        {
            this.body.element.parentNode.removeChild(this.body.element)
        }.bind(this))
    },
    view: function ()
    {
        this.body = {
            element: document.createElement("div")
        }, this.body.element.classList.add("struct-content"), this.body.element.classList.add("struct-settings");
        var e = [
        {
            text: _("Hausinstallation"),
            icon: "gear",
            href: "#/settings/installation/"
        },
        {
            text: _("Mein Haus"),
            icon: "home",
            href: "#/settings/my-home/"
        },
        {
            text: _("Automatiken"),
            icon: "icon-automation",
            href: "#/settings/automation/"
        },
        {
            text: _("Zugriffe"),
            icon: "icon-key",
            href: "#/settings/access/"
        },
        {
            text: _("Ansicht"),
            icon: "icon-draw",
            href: "#/settings/view/"
        },
        {
            text: _("Informationen"),
            icon: "icon-information",
            href: "#/settings/information/"
        },
        {
            text: _("System"),
            icon: "icon-system",
            href: "#/settings/system/"
        }];
        window.location.href.indexOf("gw.b-tronic") > -1 && e.push(
        {
            text: _("Gateway"),
            icon: "cloudy",
            href: "#/settings/gateway/"
        }), this.tile_grid = new structTiles(
        {
            collapse: !0,
            title: _("Einstellungen"),
            tiles: e
        }), this.body.element.classList.add("auto-overflow"), this.body.element.appendChild(this.tile_grid.element), document.body.appendChild(this.body.element)
    }
}).addRoute(
{
    path: "settings/my-home/",
    load: function ()
    {
        this.view(), this.tile_grid.pop()
    },
    unload: function ()
    {
        this.tile_grid.destroy(function ()
        {
            this.body.element.parentNode.removeChild(this.body.element)
        }.bind(this))
    },
    view: function ()
    {
        this.body = {
            element: document.createElement("div")
        }, this.body.element.classList.add("struct-content"), this.body.element.classList.add("struct-settings"), this.tile_grid = new structTiles(
        {
            collapse: !0,
            title: _("Mein Haus"),
            tiles: [
            {
                text: _("Räume"),
                icon: "room",
                href: "#/list/?p=" + centralControl.objectToURIComponent(
                {
                    list_type: "rooms"
                })
            },
            {
                text: _("Gruppen"),
                icon: "group",
                href: "#/list/?p=" + centralControl.objectToURIComponent(
                {
                    list_type: "groups"
                })
            },
            {
                text: _("Szenarien"),
                icon: "scene",
                href: "#/list/?p=" + centralControl.objectToURIComponent(
                {
                    list_type: "scenes"
                })
            },
            {
                text: _("Kameras"),
                icon: "icon-camera",
                href: "#/list/cams/"
            },
            {
                text: _("Radios"),
                icon: "icon-music",
                href: "#/list/?p=" + centralControl.objectToURIComponent(
                {
                    list_type: "radios"
                })
            }]
        }), this.body.element.appendChild(this.tile_grid.element), document.body.appendChild(this.body.element)
    }
}).addRoute(
{
    path: "settings/installation/",
    load: function ()
    {
        this.view(), this.tile_grid.pop()
    },
    unload: function ()
    {
        this.tile_grid.destroy(function ()
        {
            this.body.element.parentNode.removeChild(this.body.element)
        }.bind(this))
    },
    view: function ()
    {
        this.body = {
            element: document.createElement("div")
        }, this.body.element.classList.add("struct-content"), this.body.element.classList.add("struct-settings"), this.tile_grid = new structTiles(
        {
            collapse: !0,
            title: _("Hausinstallation"),
            tiles: [
            {
                text: _("Empfänger"),
                icon: "icon-receiver",
                href: "#/list/?p=" + centralControl.objectToURIComponent(
                {
                    list_type: "receivers"
                })
            },
            {
                text: _("Sender"),
                icon: "remote",
                href: "#/list/?p=" + centralControl.objectToURIComponent(
                {
                    list_type: "remotes"
                })
            },
            {
                text: _("Sensoren"),
                icon: "icon-sensor",
                href: "#/list/?p=" + centralControl.objectToURIComponent(
                {
                    list_type: "sensors"
                })
            },
            {
                text: _("Interne Objekte"),
                icon: "icon-internal-object",
                href: "#/list/?p=" + centralControl.objectToURIComponent(
                {
                    list_type: "internal_objects"
                })
            }]
        }), this.body.element.appendChild(this.tile_grid.element), document.body.appendChild(this.body.element)
    }
}).addRoute(
{
    path: "settings/automation/",
    load: function ()
    {
        this.view(), this.tile_grid.pop()
    },
    unload: function ()
    {
        this.tile_grid.destroy(function ()
        {
            this.body.element.parentNode.removeChild(this.body.element)
        }.bind(this))
    },
    view: function ()
    {
        this.body = {
            element: document.createElement("div")
        }, this.body.element.classList.add("struct-content"), this.body.element.classList.add("struct-settings"), this.tile_grid = new structTiles(
        {
            collapse: !0,
            title: _("Automatiken"),
            tiles: [
            {
                text: _("Zeitschaltuhren"),
                icon: "item-clock",
                href: "#/list/?p=" + centralControl.objectToURIComponent(
                {
                    list_type: "clocks"
                })
            },
            {
                text: _("Heizung"),
                icon: "icon-thermostat",
                href: "#/edit/climate-zones/"
            },
            {
                text: _("Urlaubsfunktion"),
                icon: "icon-vacation",
                href: "#/edit-automation/vacation/"
            },
            {
                text: _("Dachfenster"),
                icon: "device-roof-window",
                href: "#/edit-automation/roof-window/"
            },
            {
                text: _("Memo-Abschaltung"),
                icon: "icon-memory",
                href: "#/edit-automation/memory-function/"
            },
            {
                text: _("Sonnenschutz"),
                icon: "sunny",
                href: "#/solar-protection/"
            }]
        }), this.body.element.appendChild(this.tile_grid.element), document.body.appendChild(this.body.element)
    }
}).addRoute(
{
    path: "settings/access/",
    load: function ()
    {
        this.view(), this.tile_grid.pop()
    },
    unload: function ()
    {
        this.tile_grid.destroy(function ()
        {
            this.body.element.parentNode.removeChild(this.body.element)
        }.bind(this))
    },
    view: function ()
    {
        this.body = {
            element: document.createElement("div")
        }, this.body.element.classList.add("struct-content"), this.body.element.classList.add("struct-settings");
        var e = [
        {
            text: _("Fernzugriff"),
            icon: "cloudy",
            href: "#/remote-access/"
        },
        {
            text: _("Support"),
            icon: "icon-support",
            href: "#/service/"
        },
        {
            text: _("Sperrkennwort"),
            icon: "icon-lock-closed",
            href: "#/edit-auth/"
        }]; - 1 === window.location.href.indexOf("gw.b-tronic") && e.push(
        {
            text: _("VNC"),
            icon: "icon-eye",
            href: "vnc/"
        }), this.tile_grid = new structTiles(
        {
            collapse: !0,
            title: _("Zugriffe"),
            tiles: e
        }), this.body.element.appendChild(this.tile_grid.element), document.body.appendChild(this.body.element)
    }
}).addRoute(
{
    path: "settings/view/",
    load: function ()
    {
        this.view(), this.tile_grid.pop()
    },
    unload: function ()
    {
        this.tile_grid.destroy(function ()
        {
            this.body.element.parentNode.removeChild(this.body.element)
        }.bind(this))
    },
    view: function ()
    {
        this.body = {
            element: document.createElement("div")
        }, this.body.element.classList.add("struct-content"), this.body.element.classList.add("struct-settings"), console.log(centralControl.theme), this.tile_grid = new structTiles(
        {
            collapse: !0,
            title: _("Ansicht"),
            tiles: [
            {
                text: _("Farbe"),
                icon: "icon-draw",
                href: "#/edit-view/color/"
            },
            {
                text: _("Effekte"),
                icon: "icon-effects",
                href: "#/edit-view/effects/"
            },
            {
                text: _("Zurücksetzen"),
                icon: "undo",
                href: "#/edit-view/reset/"
            }]
        }), this.body.element.appendChild(this.tile_grid.element), document.body.appendChild(this.body.element)
    }
}).addRoute(
{
    path: "settings/information/",
    load: function ()
    {
        this.view(), this.tile_grid.pop()
    },
    unload: function ()
    {
        this.tile_grid.destroy(function ()
        {
            this.body.element.parentNode.removeChild(this.body.element)
        }.bind(this))
    },
    view: function ()
    {
        this.body = {
            element: document.createElement("div")
        }, this.body.element.classList.add("struct-content"), this.body.element.classList.add("struct-settings"), this.tile_grid = new structTiles(
        {
            collapse: !0,
            title: _("Informationen"),
            tiles: [
            {
                text: _("Übersicht Fehler"),
                icon: "item-logmsg",
                href: "#/log/errors/"
            },
            {
                text: _("Logs"),
                icon: "item-logmsg",
                href: "#/log/messages/"
            },
            {
                text: _("System-Info"),
                icon: "icon-information",
                href: "#/systeminfo/"
            },
            {
                text: _("Update Neuigkeiten"),
                icon: "icon-information",
                href: "#/changelog/"
            }]
        }), this.body.element.appendChild(this.tile_grid.element), document.body.appendChild(this.body.element)
    }
}).addRoute(
{
    path: "settings/system/",
    load: function ()
    {
        this.view(), this.tile_grid.pop()
    },
    unload: function ()
    {
        this.tile_grid.destroy(function ()
        {
            this.body.element.parentNode.removeChild(this.body.element)
        }.bind(this))
    },
    view: function ()
    {
        this.body = {
            element: document.createElement("div")
        }, this.body.element.classList.add("struct-content"), this.body.element.classList.add("struct-settings"), this.tile_grid = new structTiles(
        {
            collapse: !0,
            title: _("System"),
            tiles: [
            {
                text: _("Sprache"),
                icon: "icon-language",
                href: "#/edit/locale/"
            },
            {
                text: _("Standort"),
                icon: "icon-location",
                href: "#/edit/location/"
            },
            {
                text: _("Datum / Uhrzeit"),
                icon: "item-clock",
                href: "#/edit-time/"
            },
            {
                text: _("Netzwerk"),
                icon: "icon-network",
                href: "#/edit/network/"
            },
            {
                text: _("Aktualisierung"),
                icon: "redo",
                href: "#/update/"
            },
            {
                text: _("Sicherung"),
                icon: "icon-backup",
                href: "#/backup/"
            },
            {
                text: _("Werksreset"),
                icon: "icon-restore",
                href: "#/factory-reset/"
            },
            {
                text: _("Neustart"),
                icon: "icon-reboot",
                href: "#/reboot/"
            }]
        }), this.body.element.appendChild(this.tile_grid.element), document.body.appendChild(this.body.element)
    }
}).addRoute(
{
    path: "settings/wizard/",
    load: function ()
    {
        this.view(), this.tile_grid.pop()
    },
    unload: function ()
    {
        this.tile_grid.destroy(function ()
        {
            this.body.element.parentNode.removeChild(this.body.element)
        }.bind(this))
    },
    view: function ()
    {
        this.body = {
            element: document.createElement("div")
        }, this.body.element.classList.add("struct-content"), this.body.element.classList.add("struct-settings"), this.tile_grid = new structTiles(
        {
            collapse: !0,
            title: _("Was möchten Sie tun?"),
            tiles: [
            {
                text: _("Raum anlegen"),
                icon: "icon-language",
                href: "#/editlanguage/"
            },
            {
                text: _("Empfänger einlernen"),
                icon: "item-clock",
                href: "#/edittime/"
            },
            {
                text: _("Sensor einlernen"),
                icon: "icon-network",
                href: "#/editnetwork/"
            },
            {
                text: _("Sender einlernen"),
                icon: "redo",
                href: "#/update/"
            },
            {
                text: _("Szenario anlegen"),
                icon: "icon-backup",
                href: "#/saverestore/"
            },
            {
                text: _("Gruppe anlegen"),
                icon: "icon-restore",
                href: "#/saverestore/"
            },
            {
                text: _("Zeitschaltuhr anlegen"),
                icon: "icon-restore",
                href: "#/factoryreset/"
            },
            {
                text: _("Informationen"),
                icon: "icon-reboot",
                href: "#/systeminformation/"
            }]
        }), this.body.element.appendChild(this.tile_grid.element), document.body.appendChild(this.body.element)
    }
}).addRoute(
{
    path: "settings/gateway/",
    load: function ()
    {
        this.view(), this.tile_grid.pop()
    },
    unload: function ()
    {
        this.tile_grid.destroy(function ()
        {
            this.body.element.parentNode.removeChild(this.body.element)
        }.bind(this))
    },
    view: function ()
    {
        this.body = {
            element: document.createElement("div")
        }, this.body.element.classList.add("struct-content"), this.body.element.classList.add("struct-settings"), this.tile_grid = new structTiles(
        {
            collapse: !0,
            title: _("Gateway"),
            tiles: [
            {
                text: _("Verbindung trennen"),
                icon: "cloudy",
                href: "https://gw.b-tronic.net/index.psp"
            },
            {
                text: _("Mein Konto"),
                icon: "cloudy",
                href: "https://gw.b-tronic.net/myaccount.psp"
            },
            {
                text: _("Gerät hinzufügen"),
                icon: "cloudy",
                href: "https://gw.b-tronic.net/newdevice.psp"
            },
            {
                text: _("Geräte verwalten"),
                icon: "cloudy",
                href: "https://gw.b-tronic.net/deletedevice.psp"
            },
            {
                text: _("Abmelden"),
                icon: "cloudy",
                href: "https://gw.b-tronic.net/index.psp?ab=1"
            }]
        }), this.body.element.appendChild(this.tile_grid.element), document.body.appendChild(this.body.element)
    }
});
centralControl.addRoute(
{
    path: "update/",
    loader: !0,
    load: function ()
    {
        function e()
        {
            new Request(
            {
                url: jsonpath + "cc51rpc.cgi",
                method: "systemd.info_ping",
                allowRetry: !1,
                complete: function ()
                {
                    window.location.reload(!0)
                },
                error: function ()
                {
                    setTimeout(e, 2e3)
                }
            }).post(
            {
                params:
                {}
            })
        }

        function t()
        {
            this.model.remote([
            {
                systemd: "srv_fw_update",
                params:
                {
                    action: "status"
                }
            }]).on(function (n)
            {
                if ("filelist_in_progress" === n[0].status) setTimeout(function ()
                {
                    t.bind(this)()
                }.bind(this), 500);
                else if (!0 === n[0].update_avail && !1 === s) centralControl.loader.destroy(), i.textContent = _("Neue Version verfügbar"), this.wrapper.content.appendChild(o.element);
                else if (!0 === s)
                {
                    if (this.page_overlay.classList.remove("hidden"), "download_in_progress" === n[0].status) this.page_overlay.innerHTML = _("Update wird heruntergeladen. Dieser Vorgang kann einige Minuten in Anspruch nehmen.");
                    else if ("install_in_progress" === n[0].status) this.page_overlay.innerHTML = _("Das Update wird installiert. Dieser Vorgang kann einige Minuten in Anspruch nehmen.");
                    else if (n[0].status && n[0].status.indexOf("err") > -1) this.page_overlay.innerHTML = _("Während der Installation des Updates ist ein Fehler aufgetreten") + " " + n[0].status;
                    else
                    {
                        if ("download_ok" === n[0].status) return this.page_overlay.innerHTML = _("Ihre CentralControl wird jetzt neu gestartet."), void e();
                        console.log("STATUS", n), this.page_overlay.innerHTML = _("Bitte warten...")
                    }
                    setTimeout(function ()
                    {
                        t.bind(this)()
                    }.bind(this), 500)
                }
                else centralControl.loader.destroy(), i.textContent = _("Keine neue Version verfügbar")
            }.bind(this))
        }

        function n()
        {
            this.model.remote([
            {
                systemd: "info_ping"
            }]).on(function ()
            {
                window.location.reload()
            }.bind(this))
        }
        this.page_overlay = document.createElement("div"), this.page_overlay.classList.add("page-overlay"), this.page_overlay.classList.add("hidden"), this.model.set("allow-retry", !1);
        var i = document.createElement("label");
        i.classList.add("page-label");
        var o = new inputButton(
            {
                label: _("Jetzt aktualisieren"),
                class: ["green", "icon-right", "dynamic-size", "no-icon-border"],
                icon: "redo"
            }),
            s = !1;
        o.handle(function ()
        {
            s = !0, this.model.remote([
            {
                systemd: "srv_fw_update",
                params:
                {
                    action: "install"
                }
            }]).on(function ()
            {
                t.bind(this)(), centralControl.loader.attach()
            }.bind(this))
        }.bind(this)), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), this.model.remote([
        {
            systemd: "srv_fw_update",
            params:
            {
                action: "refresh_list"
            }
        }]).on(function (e, n)
        {
            t.bind(this)()
        }.bind(this)), this.model.on("response-error", function ()
        {
            n.bind(this)()
        }.bind(this)), this.model.on("remote-error", function ()
        {
            n.bind(this)()
        }.bind(this)), document.body.appendChild(this.page_overlay), this.wrapper.content.appendChild(i), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element), this.wrapper.attach(), this.head.attach()
    },
    unload: function ()
    {
        this.page_overlay.parentNode.removeChild(this.page_overlay), this.wrapper.destroy(), this.head.destroy()
    }
});
centralControl.addRoute(
{
    path: "reboot/",
    load: function ()
    {
        function e()
        {
            new Request(
            {
                url: jsonpath + "cc51rpc.cgi",
                method: "systemd.info_ping",
                allowRetry: !1,
                complete: function ()
                {
                    window.location.reload(!0)
                },
                error: function ()
                {
                    setTimeout(e, 2e3)
                }
            }).post(
            {
                params:
                {}
            })
        }
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        });
        var t = new inputConfirm(
        {
            class: ["no-bg"],
            title: _("System neu starten?"),
            buttons: [
            {
                label: _("Ja"),
                icon: "sym-confirm",
                class: ["green", "no-icon-border", "dynamic-size"]
            },
            {
                label: _("Nein"),
                icon: "delete",
                class: ["delete", "no-icon-border", "dynamic-size"]
            }],
            on: function (t)
            {
                !0 === t ? (centralControl.loader.attach(), this.model.remote([
                {
                    systemd: "os_reboot",
                    params:
                    {}
                }]).on(function ()
                {
                    setTimeout(e, 5e3)
                }.bind(this))) : centralControl.jumpBack()
            }.bind(this)
        });
        this.wrapper.content.appendChild(t.element), this.wrapper.attach(), this.head.attach(), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element)
    },
    unload: function ()
    {
        this.head.destroy(), this.wrapper.destroy()
    }
});
var serviceCode = {};
if (document.cookie.indexOf("serviceCode") > -1)
{
    var cookieParts = document.cookie.split(" and time=");
    serviceCode.code = cookieParts[0].split("=")[1], serviceCode.time = new Date, serviceCode.time.setTime(cookieParts[1].split(";")[0])
}
centralControl.addRoute(
{
    path: "service/",
    load: function ()
    {
        this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        });
        var e = document.createElement("label");
        e.classList.add("page-label"), e.textContent = _("Support");
        var t = document.createElement("div");
        t.classList.add("struct-hr"), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var n = new inputButton(
        {
            label: _("Funkprotokoll erstellen"),
            class: ["warn", "dynamic-size", "no-icon-border", "icon-right"],
            icon: "right"
        });
        new inputButton(
        {
            label: _("Log Dump erstellen"),
            class: ["warn", "dynamic-size", "no-icon-border", "icon-right"],
            icon: "right"
        }).handle(function ()
        {
            this.model.remote([
            {
                deviced: "deviced_log_get",
                params:
                {
                    include: ["item-event"]
                }
            }]).on(function ()
            {
                console.log(arguments)
            })
        }.bind(this)), n.handle(function ()
        {
            window.location.href = "#/service/radiolog/"
        });
        var o = new inputButton(
        {
            label: _("Service-Code erstellen"),
            class: ["warn", "dynamic-size", "no-icon-border", "icon-right"],
            icon: "right"
        });
        o.handle(function ()
        {
            window.location.href = "#/service/code/"
        }), this.wrapper.content.appendChild(e), this.wrapper.content.appendChild(n.element), this.wrapper.content.appendChild(t.cloneNode(!0)), this.wrapper.content.appendChild(o.element), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element), this.wrapper.attach(), this.head.attach()
    },
    unload: function ()
    {
        this.head.destroy(), this.wrapper.destroy()
    }
}).addRoute(
{
    path: "service/radiolog/",
    loader: !0,
    load: function ()
    {
        this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.model.remote([
        {
            systemd: "log_deviced_log_store"
        }]).on(function ()
        {
            centralControl.loader.destroy(), n.innerHTML += (new Date).format("dd.mm.yyyy - HH:MM"), this.wrapper.attach(), this.head.attach()
        }.bind(this));
        var e = document.createElement("label");
        e.classList.add("page-label"), e.textContent = _("Support");
        var t, n, o = document.createElement("div");
        o.classList.add("text-content"), t = _("Das Funkprotokoll wurde auf dem Speichermedium erstellt.") + "<br />", t += _("Zeitpunkt der Speicherung:") + "<br />", n = document.createElement("p"), n.innerHTML = t, o.appendChild(n), document.createElement("div").classList.add("struct-hr");
        var r = new inputButton(
        {
            label: _("OK"),
            class: ["warn", "dynamic-size", "no-icon-border", "icon-right"],
            icon: "right"
        });
        r.handle(function ()
        {
            centralControl.jumpBack()
        }), this.wrapper.content.appendChild(e), this.wrapper.content.appendChild(o), this.wrapper.content.appendChild(r.element), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element)
    },
    unload: function ()
    {
        this.head.destroy(), this.wrapper.destroy()
    }
}).addRoute(
{
    path: "service/code/",
    loader: !0,
    load: function ()
    {
        this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.model.remote([
        {
            systemd: "srv_service",
            params:
            {
                action: "code_gen"
            }
        }]).on(function (e)
        {
            if (console.log("SERVICE CODE", e[0], serviceCode), "have_code" === e[0].status && e[0].code)
            {
                serviceCode = e[0], serviceCode.time = new Date;
                var r = new Date;
                r.setTime(r.getTime() + 36e5), document.cookie = "serviceCode=" + serviceCode.code + " and time=" + serviceCode.time.getTime() + "; expires=" + r.toUTCString(), n.setValue(e[0].code), t.textContent += " (60 Min.)"
            }
            else if ("have_code" === e[0].status && !e[0].code && serviceCode.code)
            {
                var i = new Date - serviceCode.time;
                n.setValue(serviceCode.code), t.textContent += " (" + (60 - parseInt(i / 1e3 / 60)) + " Min.)"
            }
            else
            {
                if (e[0].status)
                {
                    var a = "";
                    switch (e[0].status)
                    {
                        case "err_nonet":
                            a = "Error: No networking connection to the gateway";
                            break;
                        case "err_fileio":
                            a = "Error: Filesystem error";
                            break;
                        case "err_generate":
                            a = "Error: Code generation failed, e.g. due to missing signup";
                            break;
                        default:
                            a = "Error: " + _("Es wurde bereits ein Code generiert.")
                    }
                }
                else a = _("Es ist ein unbekannter Fehler aufgetreten.");
                o.textContent = a, o.style.display = "", t.style.display = "none", n.element.style.display = "none"
            }
            centralControl.loader.destroy(), this.wrapper.attach(), this.head.attach()
        }.bind(this));
        var e = document.createElement("label");
        e.classList.add("page-label"), e.textContent = _("Service-Code erstellen");
        var t = document.createElement("label");
        t.textContent = _("Service-Code");
        var n = new inputInput(
            {
                type: "text",
                class: ["inset", "dynamic-size"]
            }),
            o = document.createElement("div");
        o.classList.add("struct-error-message"), o.style.display = "none";
        var r = new inputButton(
        {
            label: _("OK"),
            class: ["warn", "dynamic-size", "no-icon-border", "icon-right"],
            icon: "right"
        });
        r.handle(function ()
        {
            centralControl.jumpBack()
        }), this.wrapper.content.appendChild(e), this.wrapper.content.appendChild(o), this.wrapper.content.appendChild(t), this.wrapper.content.appendChild(n.element), this.wrapper.content.appendChild(r.element), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element)
    },
    unload: function ()
    {
        this.head.destroy(), this.wrapper.destroy()
    }
});
centralControl.addRoute(
{
    path: "remote-access/",
    loader: !0,
    load: function ()
    {
        this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.model.remote([
        {
            systemd: "srv_connector",
            params:
            {
                action: "status"
            }
        }]).on(function (e)
        {
            "pairing_done" === e[0].status ? (t.textContent = _("Diese Einheit ist bereits für den Fernzugriff eingerichtet. Dieser Vorgang kann nicht erneut ausgeführt werden."), n.classList.add("green"), centralControl.loader.destroy(), this.wrapper.attach(), this.head.attach()) : this.model.remote([
            {
                systemd: "srv_connector",
                params:
                {
                    action: "signup"
                }
            }]).on(function (e)
            {
                var a = _("Es ist ein unbekannter Fehler aufgetreten");
                switch (e[0].status)
                {
                    case "err_invalid_command":
                        a = "Connector script received an invalid command";
                        break;
                    case "err_pairing_failed":
                        a = "Failure to establish connection with the gateway";
                        break;
                    case "err_busy":
                        a = "Another action is currently in progress";
                        break;
                    case "err_uh_oh":
                        a = "Something wicked this way comes";
                        break;
                    case "pairing_done":
                        a = "Signup with the gateway was successful";
                        break;
                    case "pairing_needed":
                        a = "Signup with the gateway is pending"
                }
                if (e[0].status.indexOf("err_") > -1) n.classList.remove("struct-message"), n.classList.add("struct-error-message");
                else if ("pairing_needed" === e[0].status)
                {
                    n.innerHTML = '<label class="struct-label">' + _("Code") + '</label><br /><p class="page-description">' + _("Verwenden Sie diesen Code, um sich auf <a style='color:#fff;text-decoration:underline; href='https://gw.b-tronic.net/'>gw.b-tronic.net</a> anzumelden:") + "</p>", n.classList.remove("struct-message"), n.classList.remove("page-description");
                    var s = new inputInput(
                    {
                        type: "text",
                        class: ["inset", "dynamic-size"]
                    });
                    s.setValue(e[0].code), n.appendChild(s.element)
                }
                else n.classList.add("green");
                t.textContent = a, centralControl.loader.destroy(), this.wrapper.attach(), this.head.attach()
            }.bind(this))
        }.bind(this));
        var e = document.createElement("label");
        e.classList.add("page-label"), e.textContent = _("Fernzugriff");
        var t, n = document.createElement("div");
        n.classList.add("struct-message"), n.classList.add("page-description"), t = document.createElement("p"), n.appendChild(t);
        var a = new inputButton(
        {
            label: _("OK"),
            class: ["warn", "dynamic-size", "no-icon-border", "icon-right"],
            icon: "right"
        });
        a.handle(function ()
        {
            centralControl.jumpBack()
        }), this.wrapper.content.appendChild(e), this.wrapper.content.appendChild(n), this.wrapper.content.appendChild(a.element), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element)
    },
    unload: function ()
    {
        this.head.destroy(), this.wrapper.destroy()
    }
});
centralControl.addRoute(
{
    path: "changelog/",
    loader: !0,
    load: function ()
    {
        centralControl.updateNews ? (this.view(), centralControl.loader.destroy()) : this.model.remote([
        {
            systemd: "info_release_news_read",
            params:
            {
                force: 1
            }
        }]).on(function (e)
        {
            centralControl.loader.destroy(), centralControl.updateNews = e[0].news, this.view()
        }.bind(this))
    },
    view: function ()
    {
        this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var e = document.createElement("p");
        if (e.classList.add("struct-text"), centralControl.updateNews)
        {
            news_read = !0, centralControl.updateNews.forEach(function (t)
            {
                var n = document.createElement("span");
                n.innerHTML = t, e.appendChild(n), e.appendChild(document.createElement("br")), e.appendChild(document.createElement("br"))
            });
            var t = new inputButton(
            {
                label: _("OK"),
                class: ["green", "icon-right", "dynamic-size", "no-icon-border"],
                icon: "right"
            });
            t.handle(function ()
            {
                centralControl.loader.attach(), this.model.remote([
                {
                    systemd: "info_release_news_seen_set"
                }]).on(function ()
                {
                    centralControl.loader.destroy(), window.location.href = "#/favorites/"
                })
            }.bind(this)), e.appendChild(t.element)
        }
        this.wrapper.content.appendChild(e), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element), this.wrapper.attach(), this.head.attach()
    },
    unload: function ()
    {
        console.log("UNLOAD?"), this.wrapper.destroy(), this.head.destroy()
    }
});
centralControl.addRoute(
{
    path: "log/errors/",
    loader: !0,
    load: function ()
    {
        this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        window.history.back()
                    }.bind(this),
                    mobile: function ()
                    {
                        window.history.back()
                    }.bind(this)
                }
            }]
        }), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.model.remote([
        {
            systemd: "log_top_event_id_read"
        }]).then(function (e)
        {
            return console.log(e[0]), [
            {
                systemd: "log_entries_read",
                params:
                {
                    event_id: e[0].event_id,
                    forward: !0
                }
            }]
        }).on(function (e, t)
        {
            centralControl.loader.destroy();
            var n = document.createElement("label");
            n.classList.add("page-label"), n.textContent = _("Übersicht Fehler");
            var i = document.createElement("div");
            i.classList.add("text-content");
            var o = 0,
                a = [];
            t[0].entries.forEach(function (e)
            {
                if (1 !== e.shown && !0 !== e.shown)
                {
                    a.push(
                    {
                        systemd: "log_entries_set_shown",
                        params:
                        {
                            domain: e.domain,
                            shown: !0
                        }
                    }), o++;
                    var t = new Date;
                    t.setTime(1e3 * e.tstamp), t = t.format("dd.mm.yyyy - HH:MM"), i.innerHTML += "<p><b>" + t + "</b><br />", i.innerHTML += e.message + "</p>"
                }
            }), 0 === o && (i.innerHTML += "<p>" + _("Die Liste ist leer") + "<br />"), this.dismiss = new inputButton(
            {
                label: _("Löschen"),
                icon: "delete",
                class: ["warn", "dynamic-size", "no-icon-border"]
            }), this.dismiss.handle(function ()
            {
                this.model.remote(a).on(function (e)
                {
                    window.history.back()
                })
            }.bind(this)), this.wrapper.content.appendChild(n), this.wrapper.content.appendChild(i), this.wrapper.content.appendChild(this.dismiss.element), this.wrapper.attach(), this.head.attach()
        }.bind(this)), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element)
    },
    unload: function ()
    {
        this.head.destroy(), this.wrapper.destroy()
    }
}).addRoute(
{
    path: "log/messages/",
    loader: !0,
    load: function ()
    {
        this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var e = document.createElement("label");
        e.classList.add("page-label"), e.textContent = _("Aktivitäten");
        var t = document.createElement("div");
        t.classList.add("text-content"), this.model.remote([
        {
            deviced: "deviced_log_get",
            params:
            {
                include: ["item-event"]
            }
        }]).on(function (n)
        {
            n[0].log.reverse().forEach(function (e, n)
            {
                n > 50 || (t.innerHTML += "<p><b>" + e.date + " " + e.time + "</b><br />", t.innerHTML += e.message + "</p><br />")
            }), centralControl.loader.destroy(), this.wrapper.content.appendChild(e), this.wrapper.content.appendChild(t), this.wrapper.attach(), this.head.attach()
        }.bind(this)), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element)
    },
    unload: function ()
    {
        this.head.destroy(), this.wrapper.destroy()
    }
});
centralControl.addRoute(
{
    path: "edit-view/",
    persistent: !0,
    load: function ()
    {
        this.jump = "settings/", this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), this.head.attach(), document.body.appendChild(this.head.element)
    },
    change: function (t)
    {
        this.jump = t.path
    },
    unload: function ()
    {
        this.head.destroy()
    }
}).addRoute(
{
    path: "edit-view/color/",
    load: function ()
    {
        this.view()
    },
    unload: function ()
    {
        this.wrapper.destroy()
    },
    view: function ()
    {
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.brightness = centralControl.theme.color.brightness, this.hue = centralControl.theme.color.hue, this.saturation = centralControl.theme.color.saturation, this.brightness_slider = new inputHSlider(
        {
            min: 0,
            max: 9,
            floating_value: !0,
            first_section_width: "auto",
            label: _("Helligkeit"),
            class: ["color-picker"],
            per_element_style: function (t)
            {
                var e = 120 - (100 - 5 * t);
                return {
                    opacity: "1",
                    background: "hsl(" + this.hue + "," + this.saturation + "%," + e + "%)"
                }
            }.bind(this)
        }), this.brightness_slider.handle(function (t)
        {
            centralControl.theme.changed = !0, this.brightness = 120 - (100 - 5 * t), centralControl.theme.color = {
                hue: this.hue,
                saturation: this.saturation,
                brightness: this.brightness
            }, this.hue_slider.update_per_element_style(), this.saturation_slider.update_per_element_style()
        }.bind(this)), this.saturation_slider = new inputHSlider(
        {
            min: 0,
            max: 9,
            floating_value: !0,
            first_section_width: "auto",
            label: _("Sättigung"),
            class: ["color-picker"],
            per_element_style: function (t)
            {
                var e = 10 * t;
                return {
                    opacity: "1",
                    background: "hsl(" + this.hue + "," + e + "%," + this.brightness + "%)"
                }
            }.bind(this)
        }), this.saturation_slider.handle(function (t)
        {
            centralControl.theme.changed = !0, this.saturation = 10 * t, centralControl.theme.color = {
                hue: this.hue,
                saturation: this.saturation,
                brightness: this.brightness
            }, this.hue_slider.update_per_element_style(), this.brightness_slider.update_per_element_style()
        }.bind(this)), this.hue_slider = new inputHSlider(
        {
            min: 0,
            max: 59,
            label: _("Farbton"),
            floating_value: !0,
            first_section_width: "auto",
            class: ["color-picker"],
            per_element_style: function (t)
            {
                return {
                    opacity: "1",
                    background: "hsl(" + 6 * (t + 1) + "," + this.saturation + "%," + this.brightness + "%)"
                }
            }.bind(this)
        }), this.hue_slider.handle(function (t)
        {
            centralControl.theme.changed = !0, this.hue = 6 * (t + 1), centralControl.theme.color = {
                hue: this.hue,
                saturation: this.saturation,
                brightness: this.brightness
            }, this.brightness_slider.update_per_element_style(), this.saturation_slider.update_per_element_style()
        }.bind(this)), this.user_save = new inputButton(
        {
            label: _("Speichern"),
            icon: "save",
            class: ["green", "dynamic-size", "no-icon-border"]
        }), this.user_save.handle(function ()
        {
            this.model.remote([
            {
                systemd: "prefs_color_scheme_set",
                params:
                {
                    name: "webui",
                    scheme: JSON.stringify(
                    {
                        static_background: centralControl.theme.static_background,
                        shape: centralControl.theme.shape,
                        changed: !0,
                        opactiy: centralControl.theme.opacity,
                        version: 1,
                        transitions: centralControl.theme.transitions,
                        static_background_instantiated: !1,
                        static_background_color: centralControl.theme.static_background_color,
                        favorites_grid: centralControl.theme.favorites_grid,
                        color:
                        {
                            hue: centralControl.theme.color.hue,
                            saturation: centralControl.theme.color.saturation,
                            brightness: centralControl.theme.color.brightness
                        }
                    })
                }
            }]).on(function (t)
            {
                centralControl.jumpBack()
            })
        }.bind(this));
        var t = document.createElement("label");
        t.classList.add("struct-label"), t.textContent = _("Farbton");
        var e = document.createElement("label");
        e.classList.add("struct-label"), e.textContent = _("Sättigung");
        var n = document.createElement("label");
        n.classList.add("struct-label"), n.textContent = _("Helligkeit"), this.wrapper.content.appendChild(t), this.wrapper.content.appendChild(this.hue_slider.element), this.wrapper.content.appendChild(e), this.wrapper.content.appendChild(this.saturation_slider.element), this.wrapper.content.appendChild(n), this.wrapper.content.appendChild(this.brightness_slider.element), this.wrapper.content.appendChild(this.user_save.element), document.body.appendChild(this.wrapper.element), this.wrapper.attach()
    }
}).addRoute(
{
    path: "edit-view/effects/",
    load: function ()
    {
        this.view()
    },
    unload: function ()
    {
        this.wrapper.destroy()
    },
    view: function ()
    {
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var t = new inputSelect(
            {
                options: [
                {
                    value: "static",
                    text: _("Statisch (Standard)")
                },
                {
                    value: "animation",
                    text: _("Animation")
                },
                {
                    value: "none",
                    text: _("Nur Farbe")
                }],
                force_open: !0,
                label: _("Hintergrund"),
                class: ["dynamic-size"]
            }),
            e = document.createElement("label");
        e.textContent = _("Hintergrund Deckkraft");
        var n = new inputHSlider(
            {
                min: 0,
                max: 9,
                floating_value: !0,
                first_section_width: "auto",
                label: _("Helligkeit"),
                class: ["color-picker"],
                per_element_style: function (t)
                {
                    return {
                        opacity: (6 * t + 40) / 100,
                        background: "#fff"
                    }
                }.bind(this)
            }),
            r = new inputSelect(
            {
                options: [
                {
                    value: "circle",
                    text: _("Kreis")
                },
                {
                    value: "square",
                    text: _("Quadrat")
                }],
                force_open: !0,
                label: _("Effekte"),
                class: ["dynamic-size"]
            }),
            a = new inputSelect(
            {
                options: [
                {
                    value: "on",
                    text: _("An")
                },
                {
                    value: "off",
                    text: _("Aus")
                }],
                force_open: !0,
                label: _("Effekte"),
                class: ["dynamic-size"]
            }),
            o = new inputButton(
            {
                label: _("Speichern"),
                icon: "save",
                class: ["green", "dynamic-size", "no-icon-border"]
            });
        this.wrapper.content.appendChild(t.element), this.wrapper.content.appendChild(r.element), this.wrapper.content.appendChild(a.element), this.wrapper.content.appendChild(e), this.wrapper.content.appendChild(n.element), this.wrapper.content.appendChild(o.element), t.handle(function (t)
        {
            centralControl.theme.changed = !0, centralControl.theme.static_background_instantiated = !1, "animation" === t.value ? (centralControl.theme.static_background = !1, centralControl.theme.static_background_color = !1) : "static" === t.value ? (centralControl.theme.static_background = !0, centralControl.theme.static_background_color = !1) : "none" === t.value && (centralControl.theme.static_background = !0, centralControl.theme.static_background_color = !0)
        }), r.handle(function (t)
        {
            centralControl.theme.changed = !0, centralControl.theme.static_background_instantiated = !1, centralControl.theme.shape = t.value
        }), n.handle(function (t)
        {
            centralControl.theme.changed = !0, centralControl.theme.static_background_instantiated = !1, centralControl.theme.opacity = (6 * t + 40) / 100
        }), a.handle(function (t)
        {
            centralControl.changed = !1, "on" === t.value ? centralControl.theme.transitions = !0 : centralControl.theme.transitions = !1, console.log(centralControl.theme.transitions)
        }), o.handle(function ()
        {
            this.model.remote([
            {
                systemd: "prefs_color_scheme_set",
                params:
                {
                    name: "webui",
                    scheme: JSON.stringify(
                    {
                        static_background: centralControl.theme.static_background,
                        shape: centralControl.theme.shape,
                        changed: !0,
                        opactiy: centralControl.theme.opacity,
                        version: 1,
                        transitions: centralControl.theme.transitions,
                        static_background_instantiated: !1,
                        static_background_color: centralControl.theme.static_background_color,
                        favorites_grid: centralControl.theme.favorites_grid,
                        color:
                        {
                            hue: centralControl.theme.color.hue,
                            saturation: centralControl.theme.color.saturation,
                            brightness: centralControl.theme.color.brightness
                        }
                    })
                }
            }]).on(function (t)
            {
                centralControl.jumpBack()
            })
        }.bind(this)), document.body.appendChild(this.wrapper.element), this.wrapper.attach()
    }
}).addRoute(
{
    path: "edit-view/reset/",
    load: function ()
    {
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var t = new inputConfirm(
        {
            class: ["no-bg"],
            title: _("Farbschema auf Werkseinstellungen zurücksetzen?"),
            buttons: [
            {
                label: _("Zurücksetzen"),
                icon: "sym-confirm",
                class: ["green", "no-icon-border", "dynamic-size"]
            },
            {
                label: _("Abbrechen"),
                icon: "delete",
                class: ["delete", "no-icon-border", "dynamic-size"]
            }],
            on: function (e)
            {
                !0 === e ? (centralControl.theme = {
                    static_background: !0,
                    shape: "circle",
                    background_opacity: 1,
                    changed: !0,
                    opactiy: 1,
                    theme_version: 1,
                    static_background_instantiated: !1,
                    static_background_color: !1,
                    transitions: !0,
                    favorites_grid: [0, 0, 0, 0, 0, 0],
                    color:
                    {
                        hue: 205,
                        saturation: 100,
                        brightness: 30
                    }
                }, centralControl.jumpBack(), this.model.remote([
                {
                    systemd: "prefs_color_scheme_set",
                    params:
                    {
                        name: "webui",
                        scheme: JSON.stringify(
                        {
                            static_background: centralControl.theme.static_background,
                            shape: centralControl.theme.shape,
                            changed: !0,
                            opactiy: centralControl.theme.opacity,
                            version: 1,
                            transitions: centralControl.theme.transitions,
                            static_background_instantiated: !1,
                            static_background_color: centralControl.theme.static_background_color,
                            favorites_grid: [0, 0, 0, 0, 0, 0],
                            color:
                            {
                                hue: centralControl.theme.color.hue,
                                saturation: centralControl.theme.color.saturation,
                                brightness: centralControl.theme.color.brightness
                            }
                        })
                    }
                }]).on(function (t) {}), t.destroy()) : centralControl.jumpBack()
            }.bind(this)
        });
        this.wrapper.content.appendChild(t.element), document.body.appendChild(this.wrapper.element), this.wrapper.attach()
    },
    unload: function ()
    {
        this.wrapper.destroy()
    }
});
centralControl.addRoute(
{
    path: "list/",
    loader: !0,
    load: function (e)
    {
        function t(t)
        {
            function i(t, i, n)
            {
                var s = t.newIndex;
                if ("radios" === e.list_type || "cams" === e.list_type)
                {
                    var o = {
                        position: s
                    };
                    "radios" === e.list_type ? o.item_id = n.value.station_id : o.item_id = n.value.webcam_id, this.model.remote([
                    {
                        systemd: "item_set_index",
                        params: o
                    }])
                }
                else this.model.remote([
                {
                    deviced: "item_set_index",
                    params:
                    {
                        position: s,
                        item_id: n.value.id
                    }
                }])
            }
            var n = [];
            n = "internal_objects" === e.list_type ? t[0].item_list.filter(function (e)
            {
                return "virtual" === e.backend
            }) : "remotes" === e.list_type ? t[0].item_list.filter(function (e)
            {
                return "shutter" === e.remote_type || "switch" === e.remote_type
            }) : "sensors" === e.list_type ? t[0].item_list.filter(function (e)
            {
                return "shutter" !== e.remote_type && "switch" !== e.remote_type
            }) : "radios" === e.list_type ? t[0].station_list : t[0].item_list;
            var s = [];
            centralControl.loader.destroy(), this.label = document.createElement("label"), this.label.classList.add("page-label");
            var o = {
                receivers: _("Empfänger"),
                sensors: _("Sensoren"),
                remotes: _("Sender"),
                internal_objects: _("Interne Objekte"),
                groups: _("Gruppen"),
                scenes: _("Szenarien"),
                clocks: _("Zeitschaltuhren"),
                rooms: _("Räume"),
                radios: _("Radios")
            };
            this.label.textContent = o[e.list_type], o = {
                clocks: _("Zeitschaltuhr hinzufügen"),
                rooms: _("Raum hinzufügen"),
                receivers: _("Empfänger hinzufügen"),
                sensors: _("Sensor hinzufügen"),
                remotes: _("Handsender hinzufügen"),
                internal_objects: _("Internes Objekt hinzufügen"),
                groups: _("Gruppe hinzufügen"),
                scenes: _("Szenario hinzufügen"),
                cameras: _("Kamera hinzufügen"),
                radios: _("Radio hinzufügen")
            }, this.add_item_button = new inputButton(
            {
                label: o[e.list_type],
                class: ["green", "dynamic-size", "force-border", "no-icon-border"],
                icon: "add"
            }), "groups" === e.list_type && (this.syncGroups = new inputButton(
            {
                label: _("Gruppen Synchronisieren"),
                icon: "redo",
                class: ["warn", "no-icon-border", "dynamic-size"]
            }), this.syncGroups.handle(function ()
            {
                this.model.remote([
                {
                    deviced: "deviced_sync_groups",
                    params:
                    {}
                }])
            }.bind(this))), n.forEach(function (t)
            {
                var i;
                i = "clocks" === e.list_type ? "item-clock" : "rooms" === e.list_type ? "room" : "remote" !== t.type || "shutter" !== t.remote_type && "switch" !== t.remote_type ? centralControl.itemToValueOptions(t)[0].icon : "remote", console.log("ITEM ITEM ITEM", t), s.push(
                {
                    value: t,
                    text: t.name,
                    icon: i,
                    button_class: 1 === t.active ? "active" : "inactive"
                })
            });
            var r = !1,
                l = "";
            "webcams" !== e.list_type && "radios" !== e.list_type && "groups" !== e.list_type && "internal_objects" !== e.list_type && "rooms" !== e.list_type && "scenes" !== e.list_type && "clocks" !== e.list_type && "receivers" !== e.list_type || (r = !0, "" === e.list_type || ("radios" === e.list_type ? ("item_set_index", l = "") : "receivers" === e.list_type || "internal_objects" === e.list_type ? ("group", l = "") : "groups" === e.list_type ? ("group", l = "grouping") : "rooms" === e.list_type ? ("room", l = "grouping") : "scenes" === e.list_type ? ("scene", l = "scene") : "clocks" === e.list_type && ("clock", l = "clock"))), o = {
                timers: _("Eingelernte Zeitschaluhren"),
                rooms: _("Eingelernte Räume"),
                receivers: _("Eingelernte Empfänger"),
                sensors: _("Eingelernte Sensoren"),
                remotes: _("Eingelernte Handsender"),
                internal_objects: _("Angelegte Interne Objekte"),
                groups: _("Angelegte Gruppen"),
                scenes: _("Angelegte Szenarien"),
                cameras: _("Angelegte Kameras"),
                radios: _("Angelegte Radios")
            };
            var a = o[e.list_type];
            "receivers" === e.list_type && (a = _("B-Tronic / KNX-RF Empfänger"));
            var o = {
                receivers: _("Empfänger"),
                sensors: _("Sensoren"),
                remotes: _("Sender"),
                internal_objects: _("Interne Objekte"),
                groups: _("Gruppen"),
                scenes: _("Szenarien"),
                clocks: _("Zeitschaltuhren"),
                rooms: _("Räume"),
                radios: _("Radios")
            };
            if (this.add_item_button.handle(function (t)
                {
                    "radios" === e.list_type ? window.location.href = "#/edit/radio/?i=" + centralControl.objectToURIComponent(
                    {
                        fresh: !0,
                        name: o[e.list_type] + " (" + _("neu") + ")",
                        list_type: e.list_type
                    }) : "receivers" === e.list_type || "internal_objects" === e.list_type ? window.location.href = "#/learn/?i=" + centralControl.objectToURIComponent(
                    {
                        fresh: !0,
                        name: o[e.list_type] + " (" + _("neu") + ")",
                        list_type: e.list_type
                    }) : "remotes" === e.list_type || "sensors" === e.list_type ? window.location.href = "#/learn/?i=" + centralControl.objectToURIComponent(
                    {
                        fresh: !0,
                        name: o[e.list_type] + " (" + _("neu") + ")",
                        list_type: e.list_type
                    }) : window.location.href = "#/edit/" + l + "/?i=" + centralControl.objectToURIComponent(
                    {
                        fresh: !0,
                        name: o[e.list_type] + " (" + _("neu") + ")",
                        list_type: e.list_type
                    })
                }), 0 === s.length && s.push(
                {
                    value: "prevent",
                    text: _("Liste leer"),
                    class: "test"
                }), "receivers" === e.list_type && (s = s.filter(function (e)
                {
                    return "knx-rf" === e.value.backend && "thermostat" !== e.value.device_type
                })), this.list = new inputList(
                {
                    options: s,
                    sortable: r,
                    button_class: ["dark", "no-icon-border", "dynamic-size"],
                    label: a
                }), "receivers" === e.list_type)
            {
                s = [], n.forEach(function (e)
                {
                    if (console.log("ITEM RUNNER", e), "thermostat" !== e.device_type && "centronic" === e.backend && "virtual" !== e.backend)
                    {
                        var t = centralControl.itemToValueOptions(e)[0].icon;
                        s.push(
                        {
                            value: e,
                            text: e.name,
                            icon: t
                        })
                    }
                }), 0 === s.length && s.push(
                {
                    value: "prevent",
                    text: _("Liste leer")
                }), console.log("ITEM LIST NO FEEDBACK", s), this.list_no_feedback_receivers = new inputList(
                {
                    options: s,
                    sortable: r,
                    button_class: ["dark", "no-icon-border", "dynamic-size"],
                    label: _("Centronic Empfänger")
                }), this.list_no_feedback_receivers.handle(function (e)
                {
                    "prevent" !== e.value && (window.location.href = "#/edit/logic/?i=" + centralControl.objectToURIComponent(e.value))
                });
                var c = 0,
                    p = [];
                c++, n.forEach(function (e)
                {
                    if ("thermostat" === e.device_type)
                    {
                        var t;
                        t = centralControl.itemToValueOptions(e)[0].icon, p.push(
                        {
                            value: e,
                            text: e.name,
                            icon: t
                        })
                    }
                }), 0 === c && p.push(
                {
                    value: "prevent",
                    text: _("Liste leer")
                }), this.list_thermostats = new inputList(
                {
                    options: p,
                    sortable: r,
                    button_class: ["dark", "no-icon-border", "dynamic-size"],
                    label: _("Heizungsstellantriebe")
                }), this.list_thermostats.handle(function (e)
                {
                    "prevent" !== e.value && (window.location.href = "#/edit/logic/?i=" + centralControl.objectToURIComponent(e.value))
                })
            }
            this.list.handle(function (t)
            {
                "prevent" !== t.value && ("radios" === e.list_type ? window.location.href = "#/edit/radio/?i=" + centralControl.objectToURIComponent(t.value) : "groups" !== e.list_type && "rooms" !== e.list_type && "scenes" !== e.list_type && "clocks" !== e.list_type ? (t.value.list_type = e.list_type, window.location.href = "#/edit/logic/?i=" + centralControl.objectToURIComponent(t.value)) : (t.value.list_type = e.list_type, window.location.href = "#/edit/" + l + "/?i=" + centralControl.objectToURIComponent(t.value)))
            }), !0 === r && (this.list.handle_sort(function (e, t)
            {
                i.bind(this)(e, "first", t)
            }.bind(this)), "receivers" === e.list_type && this.list_no_feedback_receivers.handle_sort(function (e, t)
            {
                i.bind(this)(e, "first", t)
            }.bind(this))), this.wrapper.content.appendChild(this.label), this.wrapper.content.appendChild(this.add_item_button.element), "groups" === e.list_type && this.wrapper.content.appendChild(this.syncGroups.element), this.wrapper.content.appendChild(this.list.element), "receivers" === e.list_type && (this.wrapper.content.appendChild(this.list_no_feedback_receivers.element), this.wrapper.content.appendChild(this.list_thermostats.element)), document.body.appendChild(this.wrapper.element), this.wrapper.attach()
        }
        this.view();
        var i = [];
        "receivers" === e.list_type || "internal_objects" === e.list_type ? i = [
        {
            deviced: "deviced_get_item_list",
            params:
            {
                list_type: "receivers"
            }
        }] : "groups" === e.list_type ? i = [
        {
            deviced: "deviced_get_item_list",
            params:
            {
                list_type: "groups"
            }
        }] : "remotes" === e.list_type || "sensors" === e.list_type ? i = [
        {
            deviced: "deviced_get_item_list",
            params:
            {
                item_type: "remote"
            }
        }] : "radios" === e.list_type ? i = [
        {
            systemd: "radio_station_list_get"
        }] : "scenes" === e.list_type ? i = [
        {
            deviced: "deviced_get_item_list",
            params:
            {
                item_type: "scene"
            }
        }] : "clocks" === e.list_type ? i = [
        {
            deviced: "deviced_get_item_list",
            params:
            {
                item_type: "clock"
            }
        }] : "rooms" === e.list_type ? i = [
        {
            deviced: "deviced_get_item_list",
            params:
            {
                item_type: "room"
            }
        }] : i.push(
        {
            systemd: "radio_station_list_get"
        }), "clocks" === e.list_type ? this.model.remote(i).on(function (e)
        {
            var i = e[0].item_list;
            this.model.remote(e[0].item_list.map(function (e)
            {
                return {
                    deviced: "clock_get_info",
                    params:
                    {
                        clock_id: e.id
                    }
                }
            }.bind(this))).on(function (e)
            {
                console.log("CLOCK INFO", e);
                e.map(function (e, t)
                {
                    return i[t].active = e.active, i[t]
                });
                t.bind(this)([
                {
                    item_list: i
                }])
            }.bind(this))
        }.bind(this)) : this.model.remote(i).on(t.bind(this))
    },
    unload: function ()
    {
        this.wrapper.destroy(), this.head.destroy()
    },
    view: function ()
    {
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), document.body.appendChild(this.head.element), this.head.attach()
    }
});
centralControl.addRoute(
{
    path: "edit/logic/",
    loader: !0,
    load: function (e)
    {
        var t = this.model;
        this.wrapper = new structWrapper;
        var i = this.wrapper.content,
            o = e,
            n = [],
            c = this;
        if (void 0 !== o.remote_type)
        {
            o.remote_type.split("-").forEach(function (e, t)
            {
                t > 0 && n.push(
                {
                    type: e,
                    icon: e
                })
            })
        }
        t.on("logics", function (e)
        {
            centralControl.loader.destroy(), e.forEach(function (e)
            {
                var i = new logic(
                {
                    parent:
                    {
                        id: o.id,
                        remote_type: o.remote_type,
                        device_type: o.device_type,
                        feedback: o.feedback,
                        type: o.type,
                        backend: o.backend
                    },
                    items: e.items,
                    name: e.name,
                    trigger: e.trigger,
                    logic_id: e.id,
                    fresh: !1,
                    controlls: c.logic_grid.controlls,
                    grid_index: c.logic_grid.nextIndex(),
                    model: t,
                    commands: e.commands
                });
                c.logic_grid.fill("half",
                {
                    head: i.head,
                    content: i.element
                })
            })
        }), "group" === e.type && "centronic" === e.backend ? (console.log("LOGIC.ROUTE", e.type, e.backend), centralControl.loader.destroy()) : (console.log("LOGIC.ROUTE", e.type, e.backend), t.remote([
        {
            deviced: "deviced_get_item_list"
        },
        {
            systemd: "radio_station_list_get"
        }]).on(function (e)
        {
            var i = e[1].station_list,
                e = e[0].item_list,
                n = [],
                c = [],
                s = [],
                r = [],
                d = [],
                a = [],
                l = [],
                p = [],
                m = [],
                h = [],
                u = [];
            e.forEach(function (e)
            {
                "virtual" === e.backend ? r.push(e) : "remote" !== e.type || "shutter" !== e.remote_type && "switch" !== e.remote_type ? "remote" === e.type && "shutter" !== e.remote_type ? a.push(e) : "group" === e.type && !0 === e.feedback && e.backend ? "thermostat" !== e.device_type && c.push(e) : "group" !== e.type || e.backend ? "group" === e.type && !1 === e.feedback && e.backend ? s.push(e) : "command" === e.type ? l.push(e) : "commandset" === e.type ? p.push(e) : "condition" === e.type ? m.push(e) : "logic" === e.type ? n.push(e) : "scene" === e.type && u.push(e) : h.push(e) : d.push(e)
            }), t.set("receivers", c), t.set("internal_objects", r), t.set("sensors", a), t.set("remotes", d), t.set("radios", i), t.set("receivers_no_feedback", s), t.set("groups", h), t.set("scenes", u);
            var g = [];
            n.forEach(function (t, n)
            {
                var c = [],
                    s = [];
                m.forEach(function (i)
                {
                    t.items && t.items.forEach(function (n, c)
                    {
                        i.id === n && !0 !== i.is_trigger ? (e.forEach(function (e)
                        {
                            i.items && e.id === i.items[0] && (i.items = [e])
                        }), s.push(i)) : i.id === n && i.items[0] === o.id && !0 === i.is_trigger && (e.forEach(function (e)
                        {
                            i.items && e.id === i.items[0] && (i.items = [e])
                        }), t.computed = !0, t.trigger = i)
                    })
                }), t.items && t.items.forEach(function (t, o)
                {
                    p.forEach(function (o)
                    {
                        t === o.id && o.items && o.items.forEach(function (t)
                        {
                            l.forEach(function (n)
                            {
                                n.items && t === n.id ? n.items.forEach(function (t)
                                {
                                    e.forEach(function (e)
                                    {
                                        e.id === t && "deviced" === n.target && c.push(
                                        {
                                            action: n,
                                            item: e
                                        })
                                    }), i.forEach(function (e)
                                    {
                                        e.station_id === t && "systemd" === n.target && c.push(
                                        {
                                            action: n,
                                            item: e
                                        })
                                    })
                                }) : n.items || t !== n.id || console.log("Command was found but has no items. Command deleted.", n.id, n, o)
                            })
                        })
                    })
                }), !0 === t.computed && (t.commands = c, t.items = s, g.push(t))
            }), t.set("logics", g)
        })), this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    },
                    mobile: function ()
                    {
                        !1 !== c.logic_grid.activeIndex() ? c.logic_grid.controlls.toggleOff() : centralControl.jumpBack()
                    }
                }
            }]
        }), this.logic_grid = new logic_grid(
        {
            wrapper: i,
            controlls: !0
        }), this.visu = new visu(
        {
            item_name: o.name,
            item_icon: o.remote_type,
            item_type_name: o.remote_type,
            remote_type: o.remote_type,
            item_offered_values: n,
            item_id: o.id,
            item: o,
            model: t
        }), console.log("VISU?", this.visu), this.logic_grid.fill("full",
        {
            content: this.visu.element
        });
        var s = function (e)
        {
            c.logic = new logic(
            {
                parent:
                {
                    id: o.id,
                    remote_type: o.remote_type,
                    device_type: o.device_type,
                    feedback: o.feedback,
                    type: o.type,
                    backend: o.backend
                },
                model: t,
                fresh: !0,
                controlls: c.logic_grid.controlls,
                grid_index: c.logic_grid.nextIndex()
            }), c.logic_grid.fill("half",
            {
                head: c.logic.head,
                content: c.logic.element
            })
        };
        if ("group" === e.type && "centronic" === e.backend);
        else
        {
            var r = new inputButton(
                {
                    label: _("Logik hinzufügen"),
                    icon: "add",
                    class: ["light", "no-context", "no-icon-border"],
                    on: s
                }),
                d = new inputButton(
                {
                    label: _("Logik hinzufügen"),
                    class: ["fill", "no-icon-border"],
                    icon: "add",
                    on: s
                });
            this.logic_grid.fill("static-last",
            {
                content: d.element,
                head: r.element
            })
        }
        document.body.appendChild(this.head.element), document.body.appendChild(this.wrapper.element), this.wrapper.attach(), this.head.attach()
    },
    unload: function ()
    {
        this.wrapper.destroy(), this.wrapper = null, this.head.destroy(), this.head = null, this.visu.unload(), this.visu = null
    }
});
centralControl.addRoute(
{
    path: "edit/grouping/",
    persistent: !0,
    load: function (e)
    {
        this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), document.body.appendChild(this.head.element), this.head.attach()
    },
    change: function () {},
    unload: function ()
    {
        this.head.destroy()
    }
}).addRoute(
{
    path: "edit/grouping/",
    load: function (e)
    {
        !0 === e.fresh && centralControl.invokeRoute("edit/grouping/new/", e)
    },
    unload: function () {}
}).addRoute(
{
    path: "edit/grouping/",
    loader: !0,
    load: function (e)
    {
        function t(t, o)
        {
            !0 !== e.fresh && (o = t), centralControl.loader.destroy();
            var a = [],
                r = [],
                d = document.createElement("label");
            d.classList.add("page-label"), "rooms" === e.list_type ? !0 === e.fresh ? d.textContent = _("Raum anlegen") : d.textContent = _("Raum überarbeiten") : "groups" === e.list_type && (!0 === e.fresh ? d.textContent = _("Gruppe anlegen") : d.textContent = _("Gruppe überarbeiten")), o[0].item_list.forEach(function (t)
            {
                t.stored = !1, ("group" === t.type || "rooms" === e.list_type && "remote" === t.type) && a.push(
                {
                    value: t,
                    text: t.name,
                    icon: centralControl.itemToValueOptions(t)[0].icon
                })
            }), o[1].item_list.forEach(function (t)
            {
                t.stored = !0, ("group" === t.type || "rooms" === e.list_type && "remote" === t.type) && r.push(
                {
                    value: t,
                    text: t.name,
                    icon: centralControl.itemToValueOptions(t)[0].icon
                })
            });
            var l = new inputList(
                {
                    options: a,
                    label: _("Elemente zuordnen"),
                    class: ["dynamic-size", "dark"],
                    button_class: ["dark", "dynamic-size", "no-icon-border"]
                }),
                c = new inputList(
                {
                    options: r,
                    label: _("Zugeordnete Elemente"),
                    class: ["dynamic-size", "dark"],
                    button_class: ["green", "dynamic-size", "no-icon-border"],
                    sortable: !0
                });
            this.wrapper = new structWrapper(
            {
                center_content: !0,
                overflow_y: !0
            });
            var s = _("Raum Name"),
                p = _("Raum löschen");
            "groups" === e.list_type && (s = _("Gruppen Name"), p = _("Gruppe löschen"));
            var u = new inputInput(
                {
                    type: "text",
                    placeholder: s,
                    minlength: 1,
                    class: ["inset", "dynamic-size", "dark"],
                    value: !0 === e.fresh ? "" : e.name
                }),
                m = new inputButton(
                {
                    label: _("Speichern"),
                    class: ["green", "dynamic-size", "no-icon-border"],
                    icon: "save"
                }),
                h = new inputButton(
                {
                    label: p,
                    class: ["delete", "dynamic-size", "no-icon-border"],
                    icon: "delete"
                });
            l.handle(function (e)
            {
                a.forEach(function (t, n)
                {
                    e.value.id === t.value.id && a.splice(n, 1)
                }), l.setOptions(a), r.push(e), c.setOptions(r)
            }), c.handle(function (e)
            {
                r.forEach(function (t, n)
                {
                    e.value.id === t.value.id && r.splice(n, 1)
                }), c.setOptions(r), a.push(e), l.setOptions(a)
            }), c.handle_sort(function (e, t)
            {
                r.splice(e.oldIndex, 1), r.splice(e.newIndex, 0, t);
                var i = [];
                r.forEach(function (e, t)
                {
                    i.push(
                    {
                        deviced: "room_set_item_index",
                        params:
                        {
                            room_id: n,
                            item_id: e.value.id,
                            position: t
                        }
                    })
                }), this.model.remote(i)
            }.bind(this)), h.handle(function ()
            {
                centralControl.invokeRoute("edit/grouping/delete-group/", e)
            }.bind(this)), m.handle(function ()
            {
                var t = [];
                t.push(
                {
                    deviced: "item_set_name",
                    params:
                    {
                        item_id: n,
                        name: u.getValue()
                    }
                }), a.forEach(function (i)
                {
                    !0 === i.value.stored && ("rooms" === e.list_type ? t.push(
                    {
                        deviced: "room_del_item",
                        params:
                        {
                            room_id: n,
                            item_id: i.value.id
                        }
                    }) : "groups" === e.list_type && t.push(
                    {
                        deviced: "group_del_child_group",
                        params:
                        {
                            group_id: n,
                            child_group_id: i.value.id
                        }
                    }))
                }), r.forEach(function (i)
                {
                    !1 === i.value.stored && ("rooms" === e.list_type ? t.push(
                    {
                        deviced: "room_add_item",
                        params:
                        {
                            room_id: n,
                            item_id: i.value.id
                        }
                    }) : "groups" === e.list_type && t.push(
                    {
                        deviced: "group_add_child_group",
                        params:
                        {
                            group_id: n,
                            child_group_id: i.value.id
                        }
                    }))
                }), u.getValue().length > 2 ? (this.model.remote(t).then(function ()
                {
                    return r.map(function (t, i)
                    {
                        return "rooms" === e.list_type ?
                        {
                            deviced: "room_set_item_index",
                            params:
                            {
                                room_id: n,
                                item_id: t.value.id,
                                position: i
                            }
                        } : "groups" === e.list_type ?
                        {
                            deviced: "group_set_item_index",
                            params:
                            {
                                room_id: n,
                                item_id: t.value.id,
                                position: i
                            }
                        } : void 0
                    })
                }), centralControl.jumpBack()) : (this.wrapper.element.scrollTop = 0, u.setError())
            }.bind(this));
            var v = document.createElement("div");
            if (v.classList.add("struct-hr"), this.wrapper.content.appendChild(d), this.wrapper.content.appendChild(u.element), this.wrapper.content.appendChild(document.createElement("br")), "rooms" === e.list_type || "scenes" === e.list_type)
            {
                var g = document.createElement("div");
                g.classList.add("icon-picker");
                var f = document.createElement("div");
                document.createElement("label").classList.add("page-label"), __ICONLIST.forEach(function (t)
                {
                    if (t.indexOf("icon.room") > -1 || t.indexOf("icon.number") > -1 || t.indexOf("icon.letter") > -1)
                    {
                        var n = document.createElement("div");
                        t === e.icon && n.classList.add("active"), n.style.cssText = "background:url(img/" + t + ".svg) center center no-repeat; background-size:contain;", f.appendChild(n), n.addEventListener("click", function ()
                        {
                            var n = f.querySelector(".active");
                            null !== n && n.classList.remove("active"), this.classList.add("active"), i.model.remote([
                            {
                                deviced: "item_set_icon",
                                params:
                                {
                                    item_id: e.id,
                                    icon: t
                                }
                            }])
                        })
                    }
                }), g.appendChild(f), this.wrapper.content.appendChild(g), this.wrapper.content.appendChild(document.createElement("br"))
            }
            this.wrapper.content.appendChild(c.element), this.wrapper.content.appendChild(document.createElement("br")), this.wrapper.content.appendChild(l.element), this.wrapper.content.appendChild(v), this.wrapper.content.appendChild(m.element), this.wrapper.content.appendChild(h.element), document.body.appendChild(this.wrapper.element), this.wrapper.attach()
        }
        var n = 0,
            i = this;
        "rooms" === e.list_type ? !0 === e.fresh ? this.model.remote([
        {
            deviced: "room_new",
            params:
            {
                name: _("Unbenannter Raum")
            }
        }]).then(function (e)
        {
            return n = e[0].room_id, [
            {
                deviced: "deviced_get_item_list",
                params:
                {
                    parent_id: e[0].room_id,
                    action: "add"
                }
            },
            {
                deviced: "deviced_get_item_list",
                params:
                {
                    parent_id: e[0].room_id,
                    action: "del"
                }
            }]
        }).on(t.bind(this)) : (n = e.id, this.model.remote([
        {
            deviced: "deviced_get_item_list",
            params:
            {
                parent_id: n,
                action: "add"
            }
        },
        {
            deviced: "deviced_get_item_list",
            params:
            {
                parent_id: n,
                action: "del"
            }
        }]).on(t.bind(this))) : !0 === e.fresh ? (centralControl.loader.destroy(), centralControl.invokeRoute("edit/grouping/new-group/")) : (n = e.id, this.model.remote([
        {
            deviced: "deviced_get_item_list",
            params:
            {
                parent_id: n,
                action: "add"
            }
        },
        {
            deviced: "deviced_get_item_list",
            params:
            {
                parent_id: n,
                action: "del"
            }
        }]).on(t.bind(this)))
    },
    unload: function ()
    {
        this.wrapper && this.wrapper.destroy()
    }
}).addRoute(
{
    path: "edit/grouping/new-group/",
    load: function (e)
    {
        var t = document.createElement("label");
        t.classList.add("page-label"), t.textContent = _("Gruppe hinzufügen"), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var n = [
            {
                value: "shutter",
                text: _("Rollladen"),
                icon: "device-shutter"
            },
            {
                value: "awning",
                text: _("Sonnenschutz"),
                icon: "device-awning"
            },
            {
                value: "heater",
                text: _("Markisenheizung"),
                icon: "device-heater"
            },
            {
                value: "venetian",
                text: _("Jalousie"),
                icon: "device-venetian"
            },
            {
                value: "switch",
                text: _("Schaltaktor"),
                icon: "device-switch"
            },
            {
                value: "dimmer",
                text: _("Dimmaktor"),
                icon: "device-dimmer"
            },
            {
                value: "door",
                text: _("Tor"),
                icon: "device-door"
            },
            {
                value: "door-pulse",
                text: _("Tor (Impuls)"),
                icon: "device-door"
            },
            {
                value: "thermostat",
                text: _("Thermostat"),
                icon: "device-thermostat"
            },
            {
                value: "roof-window",
                text: _("Dachfenster"),
                icon: "device-roof-window"
            }],
            i = new inputInput(
            {
                type: "text",
                placeholder: _("Gruppen Name"),
                minlength: 1,
                class: ["inset", "dynamic-size", "dark"]
            }),
            o = new inputSelect(
            {
                options: n,
                label: _("Gruppen Typ"),
                force_open: !0,
                class: ["dynamic-size", "dark"]
            });
        o.select(0);
        var a = new inputButton(
        {
            label: _("Weiter"),
            class: ["green", "dynamic-size", "no-icon-border", "icon-right"],
            icon: "right"
        });
        a.handle(function ()
        {
            i.getValue().length < 2 ? (i.setError(), this.wrapper.element.scrollTop = 0) : (centralControl.loader.attach(), this.model.remote([
            {
                deviced: "group_new",
                params:
                {
                    device_type: o.getValue().value,
                    name: i.getValue()
                }
            }]).on(function (e)
            {
                centralControl.invokeRoute("edit/grouping/",
                {
                    list_type: "groups",
                    id: e[0].group_id,
                    name: i.getValue()
                })
            }))
        }.bind(this)), this.wrapper.content.appendChild(t), this.wrapper.content.appendChild(i.element), this.wrapper.content.appendChild(o.element), this.wrapper.content.appendChild(a.element), document.body.appendChild(this.wrapper.element), this.wrapper.attach()
    },
    unload: function ()
    {
        this.wrapper.destroy()
    }
}).addRoute(
{
    path: "edit/grouping/delete-group/",
    load: function (e)
    {
        var t = _("Wollen Sie die Gruppe wirklich löschen?");
        "rooms" === e.list_type && (t = _("Wollen Sie den Raum wirklich löschen?")), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var n = new inputConfirm(
        {
            buttons: [
            {
                label: _("Löschen"),
                icon: "delete",
                class: ["green", "dynamic-size", "no-icon-border"]
            },
            {
                label: _("Abbrechen"),
                icon: "undo",
                class: ["delete", "no-icon-border", "dynamic-size"]
            }],
            class: ["no-bg"],
            on: function (t)
            {
                !0 === t ? (centralControl.loader.attach(), this.model.remote([
                {
                    deviced: "item_delete",
                    params:
                    {
                        item_id: e.id
                    }
                }]).on(function ()
                {
                    centralControl.jumpBack()
                })) : centralControl.invokeRoute("edit/grouping/", e)
            }.bind(this),
            title: t
        });
        this.wrapper.content.appendChild(n.element), document.body.appendChild(this.wrapper.element), this.wrapper.attach()
    },
    unload: function ()
    {
        this.wrapper.destroy()
    }
});
centralControl.addRoute(
{
    path: "edit/scene/",
    loader: !0,
    load: function (e)
    {
        function t(t)
        {
            var n = [],
                i = this;
            centralControl.item_list_genarator(this.model, function ()
            {
                this.model.on("ready", function ()
                {
                    this.view(e), centralControl.loader.destroy(), this.name_input = new inputInput(
                    {
                        type: "text",
                        placeholder: _("Szenario Name"),
                        minlength: 1,
                        class: ["inset", "dynamic-size"],
                        value: e.name
                    }), this.command_editor = new commandEditor(
                    {
                        dynamic_size: !0,
                        model: this.model,
                        commands: this.model.get("bound-commands")
                    }), this.user_save = new inputButton(
                    {
                        label: _("Szenario Speichern"),
                        icon: "save",
                        class: ["green", "dynamic-size", "no-icon-border"]
                    }), this.user_delete = new inputButton(
                    {
                        label: _("Szenario Löschen"),
                        icon: "delete",
                        class: ["delete", "dynamic-size", "no-icon-border"]
                    }), this.user_delete.handle(function ()
                    {
                        centralControl.invokeRoute("edit/scene/delete/", e)
                    }.bind(this));
                    var t = document.createElement("div");
                    t.classList.add("struct-hr"), this.command_editor.handleRemove(function (e)
                    {
                        !0 !== e.fresh && n.push(e.action.id)
                    }), this.user_save.handle(function ()
                    {
                        var t = [];
                        t.push(
                        {
                            deviced: "item_set_name",
                            params:
                            {
                                item_id: e.id,
                                name: this.name_input.getValue()
                            }
                        }), n.forEach(function (e)
                        {
                            t.push(
                            {
                                deviced: "item_delete",
                                params:
                                {
                                    item_id: e
                                }
                            })
                        }), this.command_editor.getCommands().forEach(function (n)
                        {
                            if (!0 === n.fresh)
                            {
                                n.fresh = !1, "tilt" === n.action.command && (n.action.value = 100 - n.action.value);
                                var i = {
                                    deviced: "command_new",
                                    params:
                                    {
                                        target: "radio" === n.item.type ? "systemd" : "deviced",
                                        parent_id: e.id,
                                        item_id: "radio" === n.item.type ? n.item.station_id : n.item.id,
                                        command: n.action.command,
                                        value: n.action.value
                                    }
                                };
                                t.push(i)
                            }
                        }), this.model.remote(t), centralControl.jumpBack()
                    }.bind(this));
                    var a = document.createElement("div");
                    a.classList.add("icon-picker");
                    var o = document.createElement("div");
                    document.createElement("label").classList.add("page-label"), __ICONLIST.forEach(function (t)
                    {
                        if (t.indexOf("icon.room") > -1 || t.indexOf("icon.number") > -1 || t.indexOf("icon.letter") > -1 || t.indexOf("icon.scene") > -1)
                        {
                            var n = document.createElement("div");
                            t === e.icon && n.classList.add("active"), n.style.cssText = "background:url(img/" + t + ".svg) center center no-repeat; background-size:contain;", o.appendChild(n), n.addEventListener("click", function ()
                            {
                                var n = o.querySelector(".active");
                                null !== n && n.classList.remove("active"), this.classList.add("active"), i.model.remote([
                                {
                                    deviced: "item_set_icon",
                                    params:
                                    {
                                        item_id: e.id,
                                        icon: t
                                    }
                                }])
                            })
                        }
                    }), a.appendChild(o), this.wrapper.content.appendChild(a), this.wrapper.content.appendChild(document.createElement("br")), this.wrapper.content.appendChild(this.name_input.element), this.wrapper.content.appendChild(a), this.wrapper.content.appendChild(this.command_editor.element), this.wrapper.content.appendChild(t), this.wrapper.content.appendChild(this.user_save.element), this.wrapper.content.appendChild(this.user_delete.element), document.body.appendChild(this.head.element), document.body.appendChild(this.wrapper.element), this.head.attach(), this.wrapper.attach()
                }.bind(this))
            }.bind(this))
        }
        if (!0 === e.fresh)
        {
            console.log("FRESH IS TRUE", e);
            _("Unbenanntes Szenario");
            this.model.remote([
            {
                deviced: "scene_new",
                params:
                {
                    name: _("Unbenanntes Szenario")
                }
            }]).on(function (n)
            {
                console.log("NEW NEW NEW NEW", n), e.fresh = !1, e.id = n[0].scene_id, t.bind(this)(n[0].scene_id), this.model.set("id", n[0].scene_id)
            }.bind(this))
        }
        else this.model.set("id", e.id), t.bind(this)(e.id)
    },
    unload: function ()
    {
        this.wrapper.destroy(), this.head.destroy()
    },
    view: function (e)
    {
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), this.label = document.createElement("label"), this.label.classList.add("page-label"), this.label.textContent = _("Szenario überarbeiten"), this.wrapper.content.appendChild(this.label)
    }
}).addRoute(
{
    path: "edit/scene/delete/",
    load: function (e)
    {
        console.log("DELETE", e), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.invokeRoute("edit/scene/", e)
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.invokeRoute("edit/scene/", e)
                    }.bind(this)
                }
            }]
        });
        var t = new inputConfirm(
        {
            buttons: [
            {
                label: _("Löschen"),
                icon: "delete",
                class: ["green", "no-icon-border", "dynamic-size"]
            },
            {
                label: _("Abbrechen"),
                icon: "undo",
                class: ["delete", "no-icon-border", "dynamic-size"]
            }],
            class: ["no-bg"],
            on: function (t)
            {
                !0 === t ? (centralControl.loader.attach(), this.model.remote([
                {
                    deviced: "item_delete",
                    params:
                    {
                        item_id: e.id
                    }
                }]).on(function ()
                {
                    centralControl.jumpBack()
                })) : centralControl.invokeRoute("edit/scene/", e)
            }.bind(this),
            title: _("Wollen Sie das Szenario wirklich löschen?")
        });
        this.wrapper.content.appendChild(t.element), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element), this.wrapper.attach(), this.head.attach()
    },
    unload: function ()
    {
        this.wrapper.destroy(), this.head.destroy()
    }
});
centralControl.addRoute(
{
    path: "edit/clock/",
    loader: !0,
    load: function (e)
    {
        function t(t)
        {
            var n, i = [],
                a = !1,
                d = !1,
                l = "time";
            centralControl.item_list_genarator(this.model, function ()
            {
                this.model.remote([
                {
                    deviced: "clock_get_info",
                    params:
                    {
                        clock_id: e.id
                    }
                },
                {
                    deviced: "clock_get_next_time",
                    params:
                    {
                        clock_id: e.id
                    }
                }]).on(function (t)
                {
                    centralControl.loader.destroy(), n = t[0];
                    var o = t[0].time,
                        s = !1;
                    o.indexOf("-") > -1 ? (s = !0, n.offset_time = parseInt(-1 * o.split("-")[1])) : o.indexOf("+") > -1 ? (s = !0, n.offset_time = parseInt(o.split("+")[1])) : n.offset_time = 0, this.view(e), this.name_input = new inputInput(
                    {
                        type: "text",
                        placeholder: _("Zeitschaltuhr Name"),
                        minlength: 1,
                        class: ["inset", "dynamic-size"],
                        value: e.name
                    });
                    var c = new inputButton(
                    {
                        label: _("Aktiv"),
                        class: ["dark", "dynamic-size"],
                        selectable: !0,
                        selected: !1
                    });
                    c.handle(function (e)
                    {
                        a = e
                    }), 1 === n.active && (a = !0, c.select());
                    var r = new inputSelect(
                        {
                            options: [
                            {
                                value: "time",
                                text: _("Uhrzeit")
                            },
                            {
                                value: "sunrise",
                                text: _("Astro Morgens")
                            },
                            {
                                value: "sunset",
                                text: _("Astro Abends")
                            }],
                            label: _("Typ"),
                            force_open: !0,
                            class: ["dynamic-size", "dark"]
                        }),
                        m = new inputTimeRange(
                        {
                            days: n.days,
                            only_days: !0,
                            label: _("An folgenden Tagen"),
                            class: ["floating", "dynamic-size"]
                        }),
                        h = document.createElement("div");
                    "(?)" === n.time && (n.time = "00:00");
                    var p = new inputTimeRange(
                        {
                            single_time: !0,
                            start_time: !0 === s ? "00:00" : n.time,
                            label: _("Uhrzeit"),
                            class: ["floating", "dynamic-size"]
                        }),
                        u = new inputButton(
                        {
                            label: _("Sperrzeit aktiv"),
                            class: ["dark", "dynamic-size"],
                            selectable: !0,
                            selected: !1
                        }),
                        b = new inputTimeRange(
                        {
                            single_time: !0,
                            start_time: n.block_time,
                            label: _("Sperrzeit"),
                            class: ["floating", "dynamic-size"]
                        }),
                        f = new inputNumber(
                        {
                            label: _("Verschiebung (Minuten)"),
                            value: n.offset_time,
                            class: ["dynamic-size"],
                            min: -60,
                            max: 60
                        });
                    "00:00" !== n.block_time ? (u.select(), d = !0) : (b.element.classList.add("readonly"), d = !1), u.handle(function (e)
                    {
                        d = e, !0 === e ? b.element.classList.remove("readonly") : b.element.classList.add("readonly")
                    });
                    var v = document.createElement("label");
                    this.command_editor = new commandEditor(
                    {
                        model: this.model,
                        commands: this.model.get("bound-commands"),
                        dynamic_size: !0,
                        label: _("Aktionen")
                    }), this.user_save = new inputButton(
                    {
                        label: _("Zeitschaltuhr Speichern"),
                        icon: "save",
                        class: ["green", "no-icon-border", "dynamic-size"]
                    }), this.user_delete = new inputButton(
                    {
                        label: _("Zeitschaltuhr Löschen"),
                        icon: "delete",
                        class: ["delete", "no-icon-border", "dynamic-size"]
                    });
                    var k = new inputConfirm(
                    {
                        buttons: [
                        {
                            label: _("Löschen"),
                            icon: "delete",
                            class: ["green", "no-icon-border"]
                        },
                        {
                            label: _("Abbrechen"),
                            icon: "undo",
                            class: ["delete", "no-icon-border"]
                        }],
                        on: function (t)
                        {
                            !0 === t ? (this.model.remote([
                            {
                                deviced: "item_delete",
                                params:
                                {
                                    item_id: e.id
                                }
                            }]), centralControl.jumpBack()) : this.wrapper.content.removeChild(k.element)
                        }.bind(this),
                        title: _("Wollen Sie das Zeitschaltuhr wirklich löschen?")
                    });
                    this.user_delete.handle(function ()
                    {
                        centralControl.invokeRoute("edit/clock/delete/", e)
                    }.bind(this));
                    var C = document.createElement("div");
                    C.classList.add("struct-hr"), this.command_editor.handleRemove(function (e)
                    {
                        !0 !== e.fresh && i.push(e.action.id)
                    }), r.handle(function (e)
                    {
                        l = e.value, "sunrise" === e.value || "sunset" === e.value ? (p.destroy(), h.appendChild(u.element), h.appendChild(b.element), h.appendChild(f.element)) : (u.destroy(), b.destroy(), f.destroy(), h.appendChild(p.element))
                    }), this.user_save.handle(function ()
                    {
                        var t = [];
                        (t.push(
                        {
                            deviced: "item_set_name",
                            params:
                            {
                                item_id: e.id,
                                name: this.name_input.getValue()
                            }
                        }), i.forEach(function (e)
                        {
                            t.push(
                            {
                                deviced: "item_delete",
                                params:
                                {
                                    item_id: e
                                }
                            })
                        }), this.command_editor.getCommands().forEach(function (n)
                        {
                            if (!0 === n.fresh)
                            {
                                n.fresh = !1;
                                var i = {
                                    deviced: "command_new",
                                    params:
                                    {
                                        target: "radio" === n.item.type ? "systemd" : "deviced",
                                        parent_id: e.id,
                                        item_id: "radio" === n.item.type ? n.item.station_id : n.item.id,
                                        command: n.action.command,
                                        value: n.action.value
                                    }
                                };
                                t.push(i)
                            }
                        }), "time" === l) ? (t.push(
                        {
                            deviced: "clock_set_time",
                            params:
                            {
                                clock_id: e.id,
                                time: p.getValue().time[0],
                                days: m.getValue().days
                            }
                        }), t.push(
                        {
                            deviced: "clock_set_features",
                            params:
                            {
                                clock_id: e.id,
                                block_time: "00:00"
                            }
                        })) : (f.getValue(), f.getValue(), t.push(
                        {
                            deviced: "clock_set_time",
                            params:
                            {
                                clock_id: e.id,
                                time: l + f.getValue(),
                                days: m.getValue().days
                            }
                        }), t.push(
                        {
                            deviced: "clock_set_features",
                            params:
                            {
                                clock_id: e.id,
                                block_time: !0 === d ? b.getValue().time[0] : "00:00"
                            }
                        }));
                        t.push(
                        {
                            deviced: "clock_set_active",
                            params:
                            {
                                clock_id: e.id,
                                active: !1 === a ? 0 : 1
                            }
                        }), this.model.remote(t), centralControl.jumpBack()
                    }.bind(this)), n.time.indexOf("sunrise") > -1 ? (r.select(1), h.appendChild(b.element), h.appendChild(f.element), l = "sunrise") : n.time.indexOf("sunset") > -1 ? (r.select(2), h.appendChild(b.element), h.appendChild(f.element), l = "sunset") : (r.select(0), h.appendChild(p.element), l = "time"), this.wrapper.content.appendChild(this.name_input.element), this.wrapper.content.appendChild(c.element), this.wrapper.content.appendChild(r.element), this.wrapper.content.appendChild(C.cloneNode()), this.wrapper.content.appendChild(h), this.wrapper.content.appendChild(C.cloneNode()), this.wrapper.content.appendChild(m.element), this.wrapper.content.appendChild(C.cloneNode()), this.wrapper.content.appendChild(v), this.wrapper.content.appendChild(this.command_editor.element), this.wrapper.content.appendChild(C.cloneNode()), this.wrapper.content.appendChild(this.user_save.element), this.wrapper.content.appendChild(this.user_delete.element), document.body.appendChild(this.head.element), document.body.appendChild(this.wrapper.element), this.head.attach(), this.wrapper.attach()
                }.bind(this))
            }.bind(this))
        }
        if (!0 === e.fresh)
        {
            console.log("FRESH IS TRUE", e);
            _("Unbenannte Zeitschaltuhr");
            this.model.remote([
            {
                deviced: "clock_new",
                params:
                {
                    name: _("Unbenannte Zeitschaltuhr")
                }
            }]).on(function (n)
            {
                console.log("NEW NEW NEW NEW", n), e.fresh = !1, e.id = n[0].clock_id, t.bind(this)(n[0].clock_id), this.model.set("id", n[0].clock_id)
            }.bind(this))
        }
        else this.model.set("id", e.id), t.bind(this)(e.id)
    },
    unload: function ()
    {
        this.wrapper.destroy(), this.head.destroy()
    },
    view: function (e)
    {
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        !0 === e.fresh ? (centralControl.loader.attach(), this.model.remote([
                        {
                            deviced: "item_delete",
                            params:
                            {
                                item_id: e.id
                            }
                        }]).on(function ()
                        {
                            centralControl.jumpBack()
                        })) : centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        !0 === e.fresh ? (centralControl.loader.attach(), this.model.remote([
                        {
                            deviced: "item_delete",
                            params:
                            {
                                item_id: e.id
                            }
                        }]).on(function ()
                        {
                            centralControl.jumpBack()
                        })) : centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), this.label = document.createElement("label"), this.label.classList.add("page-label"), this.label.textContent = _("Zeitschaltuhr überarbeiten"), this.wrapper.content.appendChild(this.label)
    }
}).addRoute(
{
    path: "edit/clock/delete/",
    load: function (e)
    {
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.invokeRoute("edit/clock/", e)
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.invokeRoute("edit/clock/", e)
                    }.bind(this)
                }
            }]
        });
        var t = new inputConfirm(
        {
            buttons: [
            {
                label: _("Löschen"),
                icon: "delete",
                class: ["green", "no-icon-border", "dynamic-size"]
            },
            {
                label: _("Abbrechen"),
                icon: "undo",
                class: ["delete", "no-icon-border", "dynamic-size"]
            }],
            class: ["no-bg"],
            on: function (t)
            {
                !0 === t ? (centralControl.loader.attach(), this.model.remote([
                {
                    deviced: "item_delete",
                    params:
                    {
                        item_id: e.id
                    }
                }]).on(function ()
                {
                    centralControl.jumpBack()
                })) : centralControl.invokeRoute("edit/clock/", e)
            }.bind(this),
            title: _("Wollen Sie die Zeitschaltuhr wirklich löschen?")
        });
        this.wrapper.content.appendChild(t.element), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element), this.wrapper.attach(), this.head.attach()
    },
    unload: function ()
    {
        this.wrapper.destroy(), this.head.destroy()
    }
});
centralControl.addRoute(
{
    path: "edit/radio/",
    load: function (e)
    {
        !0 === e.fresh && (e.name = ""), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        });
        var t = document.createElement("label");
        t.classList.add("page-label"), !0 === e.fresh ? t.textContent = _("Radio überarbeiten") : t.textContent = _("Radio hinzufügen");
        var n = new inputInput(
            {
                type: "text",
                placeholder: _("Name"),
                minlength: 1,
                class: ["inset", "dynamic-size"],
                value: e.name
            }),
            a = new inputInput(
            {
                type: "text",
                placeholder: _("URL"),
                minlength: 1,
                class: ["inset", "dynamic-size"],
                value: e.url
            }),
            r = new inputSelect(
            {
                options: [
                {
                    value: "MP3",
                    text: _("MP3 / M3U")
                },
                {
                    value: "OGG",
                    text: _("OGG Vorbis")
                }],
                label: _("Stream Typ"),
                force_open: !0,
                class: ["dynamic-size", "dark"]
            });
        !0 === e.fresh || "MP3" === e.stream_type ? r.select(0) : "OGG" === e.stream_type && r.select(1);
        var i = new inputButton(
        {
            label: _("Radio Speichern"),
            icon: "save",
            class: ["green", "no-icon-border", "dynamic-size"]
        });
        i.handle(function ()
        {
            var t = {
                    name: n.getValue(),
                    stream_type: r.getValue().value,
                    url: a.getValue()
                },
                i = !1;
            t.name.length < 2 ? (n.setError(), i = !0) : n.unsetError(), t.url.length < 2 ? (a.setError(), i = !0) : a.unsetError(), !1 === i && (!0 === e.fresh ? this.model.remote([
            {
                systemd: "radio_station_data_set",
                params:
                {
                    name: t.name,
                    stream_type: t.stream_type,
                    url: t.url
                }
            }]) : this.model.remote([
            {
                systemd: "radio_station_data_set",
                params:
                {
                    station_id: e.station_id,
                    name: t.name,
                    stream_type: t.stream_type,
                    url: t.url
                }
            }]), centralControl.jumpBack())
        }.bind(this));
        var o = new inputButton(
        {
            label: _("Radio löschen"),
            icon: "delete",
            class: ["delete", "no-icon-border", "dynamic-size"]
        });
        o.handle(function ()
        {
            centralControl.invokeRoute("edit/radio/delete/", e)
        }), this.wrapper.content.appendChild(t), this.wrapper.content.appendChild(n.element), this.wrapper.content.appendChild(a.element), this.wrapper.content.appendChild(r.element), this.wrapper.content.appendChild(i.element), this.wrapper.content.appendChild(o.element), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element), this.head.attach(), this.wrapper.attach()
    },
    unload: function (e)
    {
        this.wrapper.destroy(), this.head.destroy()
    }
}).addRoute(
{
    path: "edit/radio/delete/",
    load: function (e)
    {
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        });
        var t = new inputConfirm(
        {
            title: _("Wollen Sie das Radio wirklich löschen?"),
            buttons: [
            {
                label: _("Löschen"),
                icon: "delete",
                class: ["delete", "no-icon-border", "dynamic-size"]
            },
            {
                label: _("Abbrechen"),
                icon: "undo",
                class: ["green", "no-icon-border", "dynamic-size"]
            }],
            on: function (t)
            {
                !1 === t ? centralControl.invokeRoute("edit/radio/", e) : (centralControl.loader.attach(), this.model.remote([
                {
                    systemd: "radio_station_del",
                    params:
                    {
                        station_id: e.station_id
                    }
                }]).on(function ()
                {
                    centralControl.jumpBack()
                }))
            }.bind(this),
            class: ["no-bg"]
        });
        this.wrapper.content.appendChild(t.element), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element), this.head.attach(), this.wrapper.attach()
    },
    unload: function ()
    {
        this.head.destroy(), this.wrapper.destroy()
    }
});
centralControl.addRoute(
{
    path: "edit-automation/",
    persistent: !0,
    load: function (e)
    {
        this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), document.body.appendChild(this.head.element), this.head.attach()
    },
    unload: function (e)
    {
        this.head.destroy()
    }
}).addRoute(
{
    path: "edit-automation/vacation/",
    loader: !0,
    load: function (e)
    {
        var t = !1;
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var n = document.createElement("label");
        n.classList.add("page-label"), n.textContent = _("Urlaubsfunktion");
        var a = document.createElement("p");
        a.classList.add("page-description"), a.textContent = _("Zufällige zusätzliche Zeitspanne für Urlaubsfunktionen");
        var i = new inputButton(
            {
                label: _("Aktivieren"),
                class: ["dark", "dynamic-size"],
                selectable: !0,
                selected: !1
            }),
            o = new inputNumber(
            {
                label: "Minuten",
                value: 0,
                class: ["dynamic-size"],
                min: 0,
                max: 60
            }),
            r = new inputButton(
            {
                label: _("Speichern"),
                icon: "save",
                class: ["green", "no-icon-border", "dynamic-size"]
            });
        i.handle(function (e)
        {
            t = e
        }), r.handle(function ()
        {
            this.model.remote([
            {
                deviced: "deviced_set_vacation",
                params:
                {
                    enable: t,
                    amount: parseInt(o.getValue())
                }
            }]), centralControl.jumpBack()
        }.bind(this)), this.model.remote([
        {
            deviced: "deviced_get_info"
        }]).on(function (e)
        {
            !0 === e[0].jitter && (i.select(), t = !0), o.setValue(e[0].jitter_time), this.wrapper.content.appendChild(n), this.wrapper.content.appendChild(a), this.wrapper.content.appendChild(i.element), this.wrapper.content.appendChild(o.element), this.wrapper.content.appendChild(document.createElement("br")), this.wrapper.content.appendChild(document.createElement("br")), this.wrapper.content.appendChild(r.element), document.body.appendChild(this.wrapper.element), this.wrapper.attach(), centralControl.loader.destroy()
        }.bind(this))
    },
    unload: function ()
    {
        this.wrapper.destroy()
    }
}).addRoute(
{
    path: "edit-automation/memory-function/",
    loader: !0,
    load: function (e)
    {
        var t = !1;
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var n = document.createElement("label");
        n.classList.add("page-label"), n.textContent = _("Empfänger-Memory-Funktion");
        var a = document.createElement("p");
        a.classList.add("page-description"), a.textContent = _("Empfänger-Memory-Funktion in Empfängern");
        var i = new inputButton(
            {
                label: _("Deaktivieren"),
                class: ["dark", "dynamic-size"],
                selectable: !0
            }),
            o = new inputButton(
            {
                label: _("Speichern"),
                icon: "save",
                class: ["green", "no-icon-border", "dynamic-size"]
            });
        i.handle(function (e)
        {
            t = e
        }), o.handle(function ()
        {
            this.model.remote([
            {
                deviced: "deviced_set_auto_reset",
                params:
                {
                    auto_reset: !0 === t ? 1 : 0
                }
            }]), centralControl.jumpBack()
        }.bind(this)), this.model.remote([
        {
            deviced: "deviced_get_info"
        }]).on(function (e)
        {
            1 === e[0].auto_reset && (i.select(), t = !0), this.wrapper.content.appendChild(n), this.wrapper.content.appendChild(a), this.wrapper.content.appendChild(i.element), this.wrapper.content.appendChild(document.createElement("br")), this.wrapper.content.appendChild(document.createElement("br")), this.wrapper.content.appendChild(o.element), this.wrapper.attach(), centralControl.loader.destroy()
        }.bind(this)), document.body.appendChild(this.wrapper.element)
    },
    unload: function ()
    {
        this.wrapper.destroy()
    }
}).addRoute(
{
    path: "edit-automation/roof-window/",
    loader: !0,
    load: function (e)
    {
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var t = document.createElement("label");
        t.classList.add("page-label"), t.textContent = _("Automatik Dachfenster");
        var n = document.createElement("p");
        n.classList.add("page-description"), n.textContent = _("Zeitspanne bis Dachfenster automatisch schließen");
        var a = new inputNumber(
            {
                label: "Minuten",
                value: 3,
                class: ["dynamic-size"],
                min: 1,
                max: 60
            }),
            i = new inputButton(
            {
                label: _("Speichern"),
                icon: "save",
                class: ["green", "no-icon-border", "dynamic-size"]
            });
        i.handle(function ()
        {
            this.model.remote([
            {
                deviced: "deviced_set_auto_roof_window_time",
                params:
                {
                    auto_roof_window_time: parseInt(a.getValue())
                }
            }]), centralControl.jumpBack()
        }.bind(this)), this.model.remote([
        {
            deviced: "deviced_get_info"
        }]).on(function (e)
        {
            a.setValue(e[0].auto_roof_window_time), this.wrapper.content.appendChild(t), this.wrapper.content.appendChild(n), this.wrapper.content.appendChild(a.element), this.wrapper.content.appendChild(document.createElement("br")), this.wrapper.content.appendChild(document.createElement("br")), this.wrapper.content.appendChild(i.element), centralControl.loader.destroy(), this.wrapper.attach()
        }.bind(this)), document.body.appendChild(this.wrapper.element)
    },
    unload: function ()
    {
        this.wrapper.destroy()
    }
});
centralControl.addRoute(
{
    path: "edit/climate-zones/",
    persistent: !0,
    load: function ()
    {
        this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), document.body.appendChild(this.head.element), this.head.attach()
    },
    unload: function ()
    {
        this.head.destroy()
    },
    change: function () {}
}).addRoute(
{
    path: "edit/climate-zones/",
    loader: !0,
    load: function ()
    {
        var e = [];
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.model.remote([
        {
            deviced: "deviced_get_item_list",
            params:
            {
                list_type: "climate-zones"
            }
        }]).on(function (t)
        {
            t[0].item_list.forEach(function (t)
            {
                e.push(
                {
                    value: t,
                    text: t.name,
                    icon: "device-thermostat"
                })
            }), 0 === e.length && e.push(
            {
                value: "prevent",
                text: _("Liste leer"),
                class: "test"
            }), centralControl.loader.destroy(), this.zones_list = new inputList(
            {
                options: e,
                sortable: !1,
                button_class: ["dark", "no-icon-border", "dynamic-size"],
                label: _("Klimazonen")
            }), this.zones_list.handle(function (t)
            {
                if ("prevent" !== t.value)
                {
                    var n = {
                        value: t.value,
                        zones: e
                    };
                    window.location.href = "#/edit/climate-zones/climate-zone/?i=" + centralControl.objectToURIComponent(n)
                }
            }), this.wrapper.content.appendChild(this.zones_list.element)
        }.bind(this)), document.body.appendChild(this.wrapper.element), this.wrapper.attach()
    },
    unload: function ()
    {
        this.wrapper.destroy()
    }
}).addRoute(
{
    path: "edit/climate-zones/climate-zone/",
    loader: !0,
    load: function (e)
    {
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var t = !1;
        this.model.remote([
        {
            deviced: "hvac_zone_get_temperature",
            params:
            {
                hvac_id: e.value.id,
                mode: "eco"
            }
        },
        {
            deviced: "hvac_zone_get_temperature",
            params:
            {
                hvac_id: e.value.id,
                mode: "comfort"
            }
        },
        {
            deviced: "hvac_zone_get_schedule",
            params:
            {
                hvac_id: e.value.id
            }
        }]).on(function ()
        {
            var n = arguments[0][0],
                a = arguments[0][1],
                o = arguments[0][2];
            centralControl.loader.destroy();
            var i = document.createElement("label");
            i.classList.add("page-label"), i.textContent = _("Klimazone") + ": " + e.value.name;
            var l = new inputButton(
            {
                label: _("Zeitsteuerung aktiv"),
                class: ["dark", "dynamic-size"],
                selectable: !0
            });
            !0 === o.enabled && (l.select(), t = !0), l.handle(function (e)
            {
                t = !!e
            });
            var r = new inputNumber(
                {
                    label: _("Eco-Temperatur"),
                    value: n.temp,
                    class: ["dynamic-size"],
                    min: 4,
                    max: 45,
                    step: .5
                }),
                d = new inputNumber(
                {
                    label: _("Komfort-Temperatur"),
                    value: a.temp,
                    class: ["dynamic-size"],
                    min: 4,
                    max: 45,
                    step: .5
                }),
                c = new inputButton(
                {
                    label: _("Speichern"),
                    class: ["green", "dynamic-size", "force-border", "no-icon-border"],
                    icon: "save"
                }),
                s = new inputButton(
                {
                    label: _("Einstellungen übernehmen"),
                    class: ["warn", "dynamic-size", "force-border", "no-icon-border", "icon-right"],
                    icon: "right"
                });
            s.handle(function ()
            {
                window.location.href = "#/edit/climate-zones/copy/?i=" + centralControl.objectToURIComponent(e)
            });
            var p = new inputButton(
            {
                label: _("Zeitsteuerung überarbeiten"),
                class: ["warn", "dynamic-size", "force-border", "no-icon-border", "icon-right"],
                icon: "right"
            });
            p.handle(function ()
            {
                e.schedule = o.schedule, e.enabled = t, window.location.href = "#/edit/climate-zones/schedule/?i=" + centralControl.objectToURIComponent(e)
            });
            var h = new inputButton(
            {
                label: _("Zurücksetzen"),
                class: ["warn", "dynamic-size", "force-border", "no-icon-border"],
                icon: "icon-reboot"
            });
            h.handle(function ()
            {
                window.location.href = "#/edit/climate-zones/reset/?i=" + centralControl.objectToURIComponent(e)
            });
            var u = new inputButton(
            {
                label: _("Abbrechen"),
                class: ["delete", "dynamic-size", "force-border", "no-icon-border"],
                icon: "delete"
            });
            u.handle(function ()
            {
                centralControl.jumpBack()
            }), c.handle(function ()
            {
                centralControl.loader.attach(), this.model.remote([
                {
                    deviced: "hvac_zone_set_schedule",
                    params:
                    {
                        enabled: t,
                        hvac_id: e.value.id
                    }
                },
                {
                    deviced: "hvac_zone_set_temperature",
                    params:
                    {
                        mode: "eco",
                        hvac_id: e.value.id,
                        temp: parseFloat(r.getValue())
                    }
                },
                {
                    deviced: "hvac_zone_set_temperature",
                    params:
                    {
                        mode: "comfort",
                        hvac_id: e.value.id,
                        temp: parseFloat(d.getValue())
                    }
                }]).on(function ()
                {
                    centralControl.jumpBack()
                })
            }.bind(this));
            var m = document.createElement("br"),
                v = document.createElement("div");
            v.classList.add("struct-hr"), this.wrapper.content.appendChild(i), this.wrapper.content.appendChild(l.element), this.wrapper.content.appendChild(r.element), this.wrapper.content.appendChild(m.cloneNode()), this.wrapper.content.appendChild(m.cloneNode()), this.wrapper.content.appendChild(m.cloneNode()), this.wrapper.content.appendChild(d.element), this.wrapper.content.appendChild(m.cloneNode()), this.wrapper.content.appendChild(m.cloneNode()), this.wrapper.content.appendChild(p.element), this.wrapper.content.appendChild(v.cloneNode()), this.wrapper.content.appendChild(h.element), this.wrapper.content.appendChild(v.cloneNode()), this.wrapper.content.appendChild(s.element), this.wrapper.content.appendChild(v.cloneNode()), this.wrapper.content.appendChild(c.element), this.wrapper.content.appendChild(u.element), document.body.appendChild(this.wrapper.element), this.wrapper.attach()
        }.bind(this))
    },
    unload: function (e)
    {
        this.wrapper.destroy()
    }
}).addRoute(
{
    path: "edit/climate-zones/copy/",
    load: function (e)
    {
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var t = [];
        e.zones.forEach(function (n)
        {
            n.value.id !== e.value.id && t.push(
            {
                value: n.value,
                text: n.value.name,
                icon: "device-thermostat"
            })
        });
        var n = new inputSelect(
            {
                options: t,
                label: _("Klimazonendaten übernehmen"),
                force_open: !0,
                class: ["dynamic-size", "dark"]
            }),
            a = new inputButton(
            {
                label: _("Einstellungen übernehmen"),
                class: ["green", "dynamic-size", "force-border", "no-icon-border", "icon-right"],
                icon: "save"
            }),
            o = new inputButton(
            {
                label: _("Abbrechen"),
                class: ["delete", "dynamic-size", "force-border", "no-icon-border"],
                icon: "delete"
            });
        a.handle(function ()
        {
            var t = n.getValue().value.id,
                a = e.value.id;
            centralControl.loader.attach(), this.model.remote([
            {
                deviced: "hvac_zone_copy_config",
                params:
                {
                    hvac_id: t,
                    target_id: a
                }
            }]).on(function ()
            {
                centralControl.jumpBack()
            })
        }.bind(this)), o.handle(function ()
        {
            centralControl.jumpBack()
        }), this.wrapper.content.appendChild(n.element), this.wrapper.content.appendChild(a.element), this.wrapper.content.appendChild(o.element), document.body.appendChild(this.wrapper.element), this.wrapper.attach()
    },
    unload: function ()
    {
        this.wrapper.destroy()
    }
}).addRoute(
{
    path: "edit/climate-zones/schedule/",
    loader: !0,
    load: function (e)
    {
        console.log("ZONES", e.zones), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.model.remote([
        {
            deviced: "hvac_zone_get_schedule",
            params:
            {
                hvac_id: e.value.id
            }
        }]).on(function (t)
        {
            centralControl.loader.destroy();
            var n = t[0].schedule,
                t = [];
            n.forEach(function (e, n)
            {
                var a = [_("So"), _("Mo"), _("Di"), _("Mi"), _("Do"), _("Fr"), _("Sa")],
                    o = e.split("/"),
                    i = o[0].split(""),
                    l = "",
                    r = {
                        comfort: _("Komfort"),
                        eco: _("Eco"),
                        individual: _("Individualtemperatur"),
                        "anti-freeze": _("Frostschutz")
                    };
                i.forEach(function (e, t)
                {
                    l += a[e] + ", "
                }), l += o[1], "comfort" !== o[2] && "eco" !== o[2] && "anti-freeze" !== o[2] ? l += " " + o[2] + "°" : l += " " + r[o[2]], t.push(
                {
                    value:
                    {
                        schedule: e,
                        index: n
                    },
                    text: l,
                    icon: "item-clock"
                })
            }), 0 === t.length && t.push(
            {
                value: "prevent",
                text: _("Liste leer"),
                class: "test"
            });
            var a = new inputList(
            {
                options: t,
                sortable: !1,
                button_class: ["dark", "no-icon-border", "dynamic-size", "multi-icon"],
                label: _("Zeitsteuerung überarbeiten")
            });
            a.handle(function (t)
            {
                "prevent" !== t.value && (window.location.href = "#/edit/climate-zones/edit-schedule/?i=" + centralControl.objectToURIComponent(
                {
                    fresh: !1,
                    id: e.value.id,
                    enabled: e.enabled,
                    schedule: n,
                    selected_schedule: t.value.schedule,
                    selected_schedule_index: t.value.index
                }))
            });
            var o = new inputButton(
            {
                label: _("Zeitsteuerung hinzufügen"),
                class: ["green", "dynamic-size", "force-border", "no-icon-border"],
                icon: "add"
            });
            o.handle(function ()
            {
                window.location.href = "#/edit/climate-zones/edit-schedule/?i=" + centralControl.objectToURIComponent(
                {
                    fresh: !0,
                    id: e.value.id,
                    enabled: e.enabled,
                    schedule: n,
                    selected_schedule: "0123456/06:00/eco"
                })
            }), this.wrapper.content.appendChild(a.element), this.wrapper.content.appendChild(o.element), document.body.appendChild(this.wrapper.element), this.wrapper.attach()
        }.bind(this))
    },
    unload: function ()
    {
        this.wrapper.destroy()
    }
}).addRoute(
{
    path: "edit/climate-zones/reset/",
    load: function (e)
    {
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var t = new inputConfirm(
        {
            title: _("Möchten Sie die Klimazone wirklich zurücksetzen?"),
            buttons: [
            {
                label: _("Zurücksetzen"),
                icon: "delete",
                class: ["delete", "no-icon", "dynamic-size"]
            },
            {
                label: _("Abbrechen"),
                icon: "none",
                class: ["green", "no-icon", "dynamic-size"]
            }],
            class: ["no-bg"],
            on: function (t)
            {
                !0 === t ? (centralControl.loader.attach(), this.model.remote([
                {
                    deviced: "hvac_zone_reset_config",
                    params:
                    {
                        hvac_id: e.value.id
                    }
                }]).on(function ()
                {
                    centralControl.jumpBack()
                })) : centralControl.jumpBack()
            }.bind(this)
        });
        this.wrapper.content.appendChild(t.element), document.body.appendChild(this.wrapper.element), this.wrapper.attach()
    },
    unload: function ()
    {
        this.wrapper.destroy()
    }
}).addRoute(
{
    path: "edit/climate-zones/edit-schedule/",
    load: function (e)
    {
        console.log("SCHEDULE", e);
        var t = e.selected_schedule,
            n = t.split("/")[0].split(""),
            a = t.split("/")[1],
            o = t.split("/")[2],
            i = 22,
            l = !1;
        "comfort" !== o && "eco" !== o && "anti-freeze" !== o && (i = o, o = "individual", l = !0);
        var r = document.createElement("label");
        r.classList.add("page-label"), r.textContent = _("Zeitsteuerung überarbeiten");
        var d = document.createElement("div"),
            c = new inputHSlider(
            {
                label: _("Individualtemperatur"),
                min: 0,
                max: 40,
                value: i,
                class: ["dynamic-size"]
            });
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var s, p = new inputSelect(
        {
            options: [
            {
                value: "eco",
                text: _("Eco")
            },
            {
                value: "comfort",
                text: _("Komfort")
            },
            {
                value: "anti-freeze",
                text: _("Frostschutz")
            },
            {
                value: "individual",
                text: _("Individualtemperatur")
            }],
            label: _("Modus"),
            force_open: !0,
            class: ["dynamic-size", "dark"]
        });
        "eco" === o && (s = 0), "comfort" === o && (s = 1), "anti-freeze" === o && (s = 2), "individual" === o && (s = 3), p.select(s);
        var h = new inputTimeRange(
            {
                single_time: !0,
                start_time: a,
                label: _("Uhrzeit"),
                class: ["floating", "dynamic-size"]
            }),
            u = new inputTimeRange(
            {
                days: n,
                only_days: !0,
                label: _("An folgenden Tagen"),
                class: ["floating", "dynamic-size"]
            }),
            m = document.createElement("div");
        m.classList.add("struct-hr");
        var v = document.createElement("div");
        v.classList.add("struct-hr"), p.handle(function (e)
        {
            "individual" === e.value ? (d.appendChild(v), d.appendChild(c.element), l = !0) : !0 === l && (d.removeChild(v), d.removeChild(c.element), l = !1)
        }), !0 === l && (d.appendChild(v), d.appendChild(c.element));
        var b = new inputButton(
        {
            label: _("Speichern"),
            class: ["green", "dynamic-size", "force-border", "no-icon-border"],
            icon: "save"
        });
        b.handle(function ()
        {
            var t = h.getValue().time[0],
                n = u.getValue().days,
                a = p.getValue().value;
            !0 === l && (a = c.getValue()), centralControl.loader.attach(), !1 === e.fresh ? e.schedule[e.selected_schedule_index] = n.join("") + "/" + t + "/" + a : e.schedule.push(n.join("") + "/" + t + "/" + a), this.model.remote([
            {
                deviced: "hvac_zone_set_schedule",
                params:
                {
                    hvac_id: e.id,
                    enabled: e.enabled,
                    schedule: e.schedule
                }
            }]).on(function ()
            {
                centralControl.jumpBack()
            })
        }.bind(this));
        var w = new inputButton(
        {
            label: _("Löschen"),
            class: ["delete", "dynamic-size", "force-border", "no-icon-border"],
            icon: "delete"
        });
        w.handle(function ()
        {
            centralControl.loader.attach(), !1 === e.fresh ? (e.schedule.splice(e.selected_schedule_index, 1), this.model.remote([
            {
                deviced: "hvac_zone_set_schedule",
                params:
                {
                    hvac_id: e.id,
                    enabled: e.enabled,
                    schedule: e.schedule
                }
            }]).on(function ()
            {
                centralControl.jumpBack()
            })) : centralControl.jumpBack()
        }.bind(this));
        var f = new inputButton(
        {
            label: _("Abbrechen"),
            class: ["warn", "dynamic-size", "force-border", "no-icon-border"],
            icon: "back"
        });
        f.handle(function ()
        {
            centralControl.jumpBack()
        }), this.wrapper.content.appendChild(r), this.wrapper.content.appendChild(p.element), this.wrapper.content.appendChild(d), this.wrapper.content.appendChild(m.cloneNode()), this.wrapper.content.appendChild(h.element), this.wrapper.content.appendChild(m.cloneNode()), this.wrapper.content.appendChild(u.element), this.wrapper.content.appendChild(m.cloneNode()), this.wrapper.content.appendChild(b.element), this.wrapper.content.appendChild(w.element), this.wrapper.content.appendChild(m.cloneNode()), this.wrapper.content.appendChild(f.element), document.body.appendChild(this.wrapper.element), this.wrapper.attach()
    },
    unload: function ()
    {
        this.wrapper.destroy()
    }
});
centralControl.addRoute(
{
    path: "list/cams/",
    loader: !0,
    load: function ()
    {
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), this.model.remote([
        {
            systemd: "webcam_cam_list_get"
        }]).on(function (e)
        {
            var t = e[0].webcam_list;
            centralControl.loader.destroy();
            var n = document.createElement("label");
            n.classList.add("page-label"), n.textContent = _("Kameras");
            var a = new inputButton(
                {
                    label: _("Kamera hinzufügen"),
                    class: ["green", "dynamic-size", "force-border", "no-icon-border"],
                    icon: "add"
                }),
                e = new inputList(
                {
                    options: function ()
                    {
                        var e = [];
                        return t.forEach(function (t)
                        {
                            e.push(
                            {
                                value: t,
                                icon: "icon-camera",
                                text: t.name
                            })
                        }), 0 === e.length && e.push(
                        {
                            value: "prevent",
                            text: _("Liste leer"),
                            class: "test"
                        }), e
                    }(),
                    sortable: !0,
                    button_class: ["dark", "no-icon-border", "dynamic-size"],
                    label: _("Eingelernte Kameras")
                });
            e.handle(function (e)
            {
                "prevent" !== e.value && (window.location.href = "#/edit/cam/?i=" + centralControl.objectToURIComponent(e.value))
            }), e.handle_sort(function (e, n)
            {
                t.splice(e.oldIndex, 1), t.splice(e.newIndex, 0, n.value);
                var a = [];
                t.forEach(function (e, t)
                {
                    a.push(
                    {
                        systemd: "webcam_cam_index_set",
                        params:
                        {
                            webcam_id: e.webcam_id,
                            position: t
                        }
                    })
                }), this.model.remote(a)
            }.bind(this)), a.handle(function ()
            {
                window.location.href = "#/edit/cam/?p=" + centralControl.objectToURIComponent(
                {
                    fresh: !0
                })
            }), this.wrapper.content.appendChild(n), this.wrapper.content.appendChild(a.element), this.wrapper.content.appendChild(e.element), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element), this.head.attach(), this.wrapper.attach()
        }.bind(this))
    },
    unload: function ()
    {
        this.head.destroy(), this.wrapper.destroy()
    }
}).addRoute(
{
    path: "edit/cam/",
    load: function (e)
    {
        var t = "MJPEG" === e.stream_type,
            n = "MJPEG_UNSCALED";
        !0 === e.fresh && (e.name = ""), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        });
        var a = document.createElement("label");
        a.classList.add("page-label"), !0 === e.fresh ? a.textContent = _("Kamera überarbeiten") : a.textContent = _("Kamera hinzufügen");
        var r = new inputInput(
            {
                type: "text",
                placeholder: _("Name"),
                minlength: 1,
                class: ["inset", "dynamic-size"],
                value: e.name
            }),
            o = new inputInput(
            {
                type: "text",
                placeholder: _("URL"),
                minlength: 1,
                class: ["inset", "dynamic-size"],
                value: e.url
            }),
            i = new inputButton(
            {
                label: _("Größe anpassen"),
                class: ["dark", "dynamic-size"],
                selectable: !0
            });
        i.handle(function (e)
        {
            n = e ? "MJPEG" : "MJPEG_UNSCALED"
        }), !0 === t && i.select();
        var c = new inputButton(
            {
                label: _("Kamera speichern"),
                icon: "save",
                class: ["green", "no-icon-border", "dynamic-size"]
            }),
            l = new inputButton(
            {
                label: _("Kamera löschen"),
                icon: "delete",
                class: ["delete", "no-icon-border", "dynamic-size"]
            });
        l.handle(function ()
        {
            centralControl.invokeRoute("edit/cam/delete/", e)
        }), c.handle(function ()
        {
            var t = {
                    name: r.getValue(),
                    stream_type: n,
                    url: o.getValue()
                },
                a = !1;
            t.name.length < 2 ? (r.setError(), a = !0) : r.unsetError(), t.url.length < 2 ? (o.setError(), a = !0) : o.unsetError(), !1 === a && (centralControl.loader.attach(), !0 === e.fresh ? this.model.remote([
            {
                systemd: "webcam_cam_data_set",
                params:
                {
                    name: t.name,
                    stream_type: t.stream_type,
                    url: t.url
                }
            }]).on(function ()
            {
                centralControl.jumpBack()
            }) : this.model.remote([
            {
                systemd: "webcam_cam_data_set",
                params:
                {
                    webcam_id: e.webcam_id,
                    name: t.name,
                    stream_type: t.stream_type,
                    url: t.url
                }
            }]).on(function ()
            {
                centralControl.jumpBack()
            }))
        }.bind(this)), this.wrapper.content.appendChild(a), this.wrapper.content.appendChild(r.element), this.wrapper.content.appendChild(o.element), this.wrapper.content.appendChild(i.element), this.wrapper.content.appendChild(c.element), this.wrapper.content.appendChild(l.element), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element), this.head.attach(), this.wrapper.attach()
    },
    unload: function (e)
    {
        this.wrapper.destroy(), this.head.destroy()
    }
}).addRoute(
{
    path: "edit/cam/delete/",
    load: function (e)
    {
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        });
        var t = new inputConfirm(
        {
            title: _("Wollen Sie die Kamera wirklich löschen?"),
            buttons: [
            {
                label: _("Löschen"),
                icon: "delete",
                class: ["delete", "no-icon-border", "dynamic-size"]
            },
            {
                label: _("Abbrechen"),
                icon: "undo",
                class: ["green", "no-icon-border", "dynamic-size"]
            }],
            on: function (t)
            {
                !1 === t ? centralControl.invokeRoute("edit/cam/", e) : (centralControl.loader.attach(), this.model.remote([
                {
                    systemd: "webcam_cam_del",
                    params:
                    {
                        webcam_id: e.webcam_id
                    }
                }]).on(function ()
                {
                    centralControl.jumpBack()
                }))
            }.bind(this),
            class: ["no-bg"]
        });
        this.wrapper.content.appendChild(t.element), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element), this.head.attach(), this.wrapper.attach()
    },
    unload: function ()
    {
        this.head.destroy(), this.wrapper.destroy()
    }
});
centralControl.addRoute(
{
    path: "edit-time/",
    loader: !0,
    load: function ()
    {
        this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.model.remote([
        {
            systemd: "os_clock_cfg_read"
        },
        {
            systemd: "os_clock_read"
        },
        {
            systemd: "location_get",
            params:
            {
                type: "position"
            }
        }]).on(function (e)
        {
            console.log("CLOCK SETTINGS", e);
            var t = document.createElement("label");
            t.classList.add("page-label"), t.textContent = _("Uhrzeit Einstellungen");
            var n = new inputSelect(
            {
                options: [
                {
                    value: 1,
                    text: _("automatisch (NTP)")
                },
                {
                    value: 0,
                    text: _("manuell")
                }],
                force_open: !0,
                label: _("Uhrzeit"),
                class: ["dynamic-size", "dark"]
            });
            1 === e[0].use_ntp ? n.select(0) : n.select(1);
            var a = document.createElement("div"),
                l = new inputTimeRange(
                {
                    single_time: !0,
                    start_time: e[1].time_hours + ":" + (e[1].time_mins < 10 ? "0" + e[1].time_mins : e[1].time_mins),
                    label: _("Uhrzeit"),
                    class: ["floating", "dynamic-size"]
                }),
                o = new Date(e[1].date_year, e[1].date_month, e[1].date_day),
                i = new inputDate(
                {
                    date_day: o.format("dd"),
                    date_month: o.format("mm"),
                    date_year: o.format("yyyy"),
                    label: _("Datum"),
                    class: ["floating", "dynamic-size"]
                }),
                s = new inputSelect(
                {
                    options: [
                    {
                        value: 0,
                        text: _("24h: 13:24")
                    },
                    {
                        value: 1,
                        text: _("12h: 01:24am")
                    }],
                    force_open: !0,
                    label: _("Uhrzeitformat"),
                    class: ["dynamic-size", "dark"]
                });
            1 === e[0].format_24h ? s.select(1) : s.select(0);
            var r, p, d, c = new inputSelect(
            {
                options: [
                {
                    value: 0,
                    text: _("TT.MM.JJJJ")
                },
                {
                    value: 1,
                    text: _("MM/TT/JJJJ")
                }],
                force_open: !0,
                label: _("Datumsformat"),
                class: ["dynamic-size", "dark"]
            });
            e[2].tz || (r = 0, d = 0);
            var m = timezones.map(function (t, n)
                {
                    return console.log("TZ", e[2]), e[2].tz && t.group === e[2].tz.split("/")[0] && (r = n, p = e[2].tz.split("/")[1]),
                    {
                        value: t.group,
                        text: t.group
                    }
                }),
                u = document.createElement("div"),
                h = document.createElement("label");
            h.textContent = _("NTP Einstellungen"), h.classList.add("struct-label");
            var y = new inputSelect(
                {
                    options: m,
                    label: _("Region"),
                    class: ["dynamic-size", "dark"]
                }),
                f = new inputSelect(
                {
                    options: [],
                    label: _("Region"),
                    class: ["dynamic-size", "dark"]
                });
            y.handle(function (e)
            {
                timezones.forEach(function (t)
                {
                    t.group === e.value && f.setOptions(t.zones.map(function (e, t)
                    {
                        return p === e.name && (d = t),
                        {
                            value: e.value,
                            text: e.name
                        }
                    }))
                }), f.select(d), f.pop(), y.collapse()
            }), e[2].tz && (y.select(r), f.select(d)), f.collapse(), f.handle(function (e)
            {
                f.collapse(), y.collapse()
            }), 1 === e[0].format_type ? c.select(1) : c.select(0);
            var C = new inputButton(
            {
                label: _("Speichern"),
                icon: "save",
                class: ["green", "no-icon-border", "dynamic-size"]
            });
            n.handle(function (e)
            {
                0 === e.value ? (a.appendChild(l.element), a.appendChild(i.element), u.removeChild(y.element), u.removeChild(f.element)) : (a.removeChild(l.element), a.removeChild(i.element), u.appendChild(h), u.appendChild(y.element), u.appendChild(f.element))
            }), C.handle(function ()
            {
                centralControl.loader.attach();
                var e = [],
                    t = n.getValue().value,
                    a = s.getValue().value,
                    o = c.getValue().value;
                if (0 === t)
                {
                    var r = l.getValue().time[0].split(":"),
                        p = i.getValue();
                    console.log(r, p), e.push(
                    {
                        systemd: "os_clock_set",
                        params:
                        {
                            format_type: o,
                            format_24h: a,
                            use_ntp: t,
                            date_day: parseInt(p.format("dd")),
                            date_month: parseInt(p.format("mm")),
                            date_year: parseInt(p.format("yyyy")),
                            time_hours: parseInt(r[0]),
                            time_mins: parseInt(r[1])
                        }
                    })
                }
                else
                {
                    var d = f.getValue().value;
                    e.push(
                    {
                        systemd: "os_clock_set",
                        params:
                        {
                            format_type: o,
                            format_24h: a,
                            use_ntp: t
                        }
                    }), e.push(
                    {
                        systemd: "location_set",
                        params:
                        {
                            type: "position",
                            tz: d
                        }
                    })
                }
                this.model.remote(e).on(function ()
                {
                    centralControl.loader.destroy(), centralControl.jumpBack()
                })
            }.bind(this)), centralControl.loader.destroy(), this.wrapper.content.appendChild(t), this.wrapper.content.appendChild(n.element), 0 === e[0].use_ntp && (a.appendChild(l.element), a.appendChild(i.element)), this.wrapper.content.appendChild(a), this.wrapper.content.appendChild(s.element), this.wrapper.content.appendChild(c.element), 1 === e[0].use_ntp && (u.appendChild(h), u.appendChild(y.element), u.appendChild(f.element)), this.wrapper.content.appendChild(u), this.wrapper.content.appendChild(C.element), this.wrapper.attach(), this.head.attach()
        }.bind(this)), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element)
    },
    unload: function ()
    {
        this.head.destroy(), this.wrapper.destroy()
    }
});
centralControl.addRoute(
{
    path: "edit/network/",
    loader: !0,
    load: function ()
    {
        console.log("EDIT NETWORK");
        var e = 0,
            t = -1;
        this.model.remote([
        {
            systemd: "net_cfg_read",
            params:
            {}
        },
        {
            systemd: "net_wlan_info_read",
            params:
            {}
        }]).on(function (i)
        {
            console.log("CFG", i[0], i[1]), e = i[0].hostap, t = i[0].wifi_drv, n.setValue(i[0].hostname), p.setValue(i[0].wifi_psk), r.setValue(i[0].ip_address), o.setValue(i[0].ip_gateway), u.setValue(i[0].ip_dns), c.setValue(i[0].ip_netmask), s.setValue(i[0].wifi_ssid), h.select(0), 1 === i[0].use_dhcp ? d.select(0) : d.select(1), 1 === i[0].use_wifi ? a.select(0) : a.select(1), 1 === i[0].wifi_drv ? h.select(1) : h.select(0);
            var m = -1,
                w = i[1].wlan_list.filter(function (e)
                {
                    return "" !== e.ssid
                }).map(function (e, t)
                {
                    return i[0].wifi_ssid === e.ssid && (m = t),
                    {
                        value: e.ssid,
                        text: e.ssid,
                        icon: ["icon-wifi", "strength-" + e.quality]
                    }
                });
            w.push(
            {
                value: "manual",
                text: _("Manuell")
            }), -1 === m && (m = w.length - 1), l.setOptions(w), l.select(m), centralControl.loader.destroy()
        }), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        });
        var n = new inputInput(
            {
                type: "text",
                placeholder: _("Hostname"),
                minlength: 1,
                class: ["inset", "dynamic-size"],
                value: ""
            }),
            a = new inputSelect(
            {
                options: [
                {
                    value: "wifi",
                    text: _("WiFi")
                },
                {
                    value: "ethernet",
                    text: _("Ethernet")
                }],
                label: _("Schnittstelle"),
                force_open: !0,
                class: ["dynamic-size", "dark"]
            });
        a.handle(function (e)
        {
            "wifi" === e.value ? b.style.display = "inline" : b.style.display = "none"
        });
        var l = new inputSelect(
        {
            options: [],
            label: _("SSID / Netzwerkname"),
            force_open: !0,
            class: ["dynamic-size", "dark"]
        });
        l.handle(function (e)
        {
            "manual" === e.value ? x.style.display = "inline" : (s.setValue(e.value), x.style.display = "none")
        });
        var i = document.createElement("label");
        i.textContent = _("SSID / Netzwerkname");
        var s = new inputInput(
            {
                type: "text",
                placeholder: _("SSID / Netzwerkname"),
                minlength: 1,
                class: ["inset", "dynamic-size"],
                value: ""
            }),
            p = new inputInput(
            {
                type: "password",
                placeholder: _("Netzwerkschlüssel"),
                minlength: 6,
                class: ["inset", "dynamic-size"],
                value: ""
            }),
            d = new inputSelect(
            {
                options: [
                {
                    value: "dhcp",
                    text: _("Automatisch (DHCP)")
                },
                {
                    value: "manual",
                    text: _("Manuell")
                }],
                label: _("Netzwerkkonfiguration"),
                force_open: !0,
                class: ["dynamic-size", "dark"]
            });
        d.handle(function (e)
        {
            "manual" === e.value ? z.style.display = "inline" : z.style.display = "none"
        });
        var r = new inputInput(
            {
                type: "text",
                placeholder: _("IP"),
                minlength: 7,
                class: ["inset", "dynamic-size"],
                value: ""
            }),
            o = new inputInput(
            {
                type: "text",
                placeholder: _("Gateway"),
                minlength: 7,
                class: ["inset", "dynamic-size"],
                value: ""
            }),
            c = new inputInput(
            {
                type: "text",
                placeholder: _("Netzmaske"),
                minlength: 7,
                class: ["inset", "dynamic-size"],
                value: ""
            }),
            u = new inputInput(
            {
                type: "text",
                placeholder: _("DNS"),
                minlength: 7,
                class: ["inset", "dynamic-size"],
                value: ""
            }),
            h = new inputSelect(
            {
                options: [
                {
                    value: 0,
                    text: "v3.3.2_3192"
                },
                {
                    value: 1,
                    text: "v3.4.4_4749"
                }],
                label: _("Netzwerktreiber"),
                force_open: !0,
                class: ["dynamic-size", "dark"]
            }),
            m = new inputButton(
            {
                label: _("Konfiguration Speichern"),
                icon: "save",
                class: ["green", "no-icon-border", "dynamic-size"]
            }),
            w = document.createElement("label");
        w.classList.add("page-label"), w.textContent = _("Netzwerk Konfiguration");
        var v = document.createElement("label");
        v.textContent = _("Hostname");
        var y = document.createElement("label");
        y.textContent = _("Netzwerkschlüssel");
        var C = document.createElement("label");
        C.textContent = _("IP-Adresse");
        var f = document.createElement("label");
        f.textContent = _("Netzwerkmaske");
        var g = document.createElement("label");
        g.textContent = _("DNS");
        var k = document.createElement("label");
        k.textContent = _("Gateway");
        var b = document.createElement("div"),
            x = document.createElement("div"),
            z = document.createElement("div");
        this.wrapper.content.appendChild(w), this.wrapper.content.appendChild(v), this.wrapper.content.appendChild(n.element), this.wrapper.content.appendChild(a.element), b.appendChild(l.element), x.appendChild(i), x.appendChild(s.element), b.appendChild(x), b.appendChild(y), b.appendChild(p.element), this.wrapper.content.appendChild(b), this.wrapper.content.appendChild(d.element), z.appendChild(C), z.appendChild(r.element), z.appendChild(f), z.appendChild(c.element), z.appendChild(k), z.appendChild(o.element), z.appendChild(g), z.appendChild(u.element), this.wrapper.content.appendChild(z), t > -1 && this.wrapper.content.appendChild(h.element), this.wrapper.content.appendChild(m.element), document.body.appendChild(this.head.element), document.body.appendChild(this.wrapper.element), this.wrapper.attach(), this.head.attach(), m.handle(function ()
        {
            var t = n.getValue(),
                l = r.getValue(),
                i = c.getValue(),
                m = o.getValue(),
                _ = u.getValue(),
                w = s.getValue(),
                v = p.getValue(),
                y = h.getValue().value,
                C = "wifi" === a.getValue().value ? 1 : 0,
                f = "dhcp" === d.getValue().value ? 1 : 0;
            centralControl.loader.attach(), this.model.remote([
            {
                systemd: "net_cfg_perform",
                params:
                {
                    hostap: e,
                    hostname: t,
                    ip_address: l,
                    ip_netmask: i,
                    ip_gateway: m,
                    ip_dns: _,
                    wifi_ssid: w,
                    wifi_psk: v,
                    wifi_drv: y,
                    use_wifi: C,
                    use_dhcp: f
                }
            }]).on(function ()
            {
                centralControl.loader.destroy(), centralControl.jumpBack()
            })
        }.bind(this))
    },
    unload: function ()
    {
        this.wrapper.destroy(), this.head.destroy()
    }
});
centralControl.addRoute(
{
    path: "edit/location/",
    loader: !0,
    load: function ()
    {
        function t()
        {
            this.locationInput = new inputInput(
            {
                type: "text",
                placeholder: _("Stadt / Ort"),
                minlength: 1,
                class: ["inset", "dynamic-size", "dark"]
            }), this.searchButton = new inputButton(
            {
                label: _("Suchen"),
                class: ["warn", "dynamic-size", "no-icon-border", "icon-right"],
                icon: "right"
            }), this.locationSelect = new inputSelect(
            {
                options: [],
                label: _("Stadt / Ort"),
                force_open: !0,
                class: ["dynamic-size", "dark"]
            }), this.searchButton.handle(function ()
            {
                centralControl.loader.attach(), new Request(
                {
                    url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + this.locationInput.getValue() + "&key=AIzaSyDm-Iysg4753v-nOre0lwfXp47eX5asTrU",
                    complete: function (t)
                    {
                        var e = t.results.map(function (t, e)
                        {
                            var n = [];
                            return t.address_components.forEach(function (t, e)
                            {
                                -1 === t.types.indexOf("street_number") && n.push(t.long_name)
                            }), n = n.join(", "),
                            {
                                text: n,
                                value:
                                {
                                    name: n,
                                    lat: t.geometry.location.lat,
                                    lng: t.geometry.location.lng
                                }
                            }
                        });
                        this.locationSelect.element.style.display = "inline", n.element.style.display = "inline", this.locationSelect.setOptions(e), this.locationSelect.select(0), centralControl.loader.destroy()
                    }.bind(this)
                }).get()
            }.bind(this))
        }
        this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var e = null,
            n = null;
        this.model.remote([
        {
            systemd: "location_get",
            params:
            {
                type: "position"
            }
        },
        {
            systemd: "location_get",
            params:
            {
                type: "weather"
            }
        }]).on(function (o)
        {
            var a = document.createElement("label");
            a.classList.add("page-label"), a.textContent = _("Standort");
            var i = document.createElement("div");
            i.classList.add("text-content"), i.innerHTML = "<b>" + o[0].name + "</b> (LAT: " + o[0].lat + ", LON: " + o[0].lon + ")", n = new inputButton(
            {
                label: _("Standort speichern"),
                class: ["green", "dynamic-size", "no-icon-border"],
                icon: "save"
            });
            var l = this;
            n.handle(function ()
            {
                centralControl.loader.attach();
                var t = this.locationSelect.getValue().value;
                new Request(
                {
                    url: "https://maps.googleapis.com/maps/api/timezone/json?location=" + t.lat + "," + t.lng + "&timestamp=" + (new Date).getTime() / 1e3 + "&key=AIzaSyDm-Iysg4753v-nOre0lwfXp47eX5asTrU",
                    complete: function (e)
                    {
                        var n = {
                            name: t.name,
                            lat: t.lat,
                            lon: t.lng,
                            tz: e.timeZoneId,
                            type: "position"
                        };
                        l.model.remote([
                        {
                            systemd: "location_set",
                            params: n
                        }]).on(function ()
                        {
                            centralControl.loader.destroy(), centralControl.jumpBack()
                        })
                    }
                }).get()
            }.bind(this)), "https:" === window.location.protocol ? t.bind(this)() : (e = document.createElement("p"), e.textContent = "This function is currently only available when accessing the webinterface via our gateway server. We are working on a solution.", e.classList.add("struct-error-message")), n.element.style.display = "none", this.wrapper.content.appendChild(a), this.wrapper.content.appendChild(i), "https:" === window.location.protocol ? (this.locationSelect.element.style.display = "none", this.wrapper.content.appendChild(this.locationInput.element), this.wrapper.content.appendChild(this.searchButton.element), this.wrapper.content.appendChild(this.locationSelect.element)) : this.wrapper.content.appendChild(e), this.wrapper.content.appendChild(n.element), centralControl.loader.destroy()
        }.bind(this)), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element), this.wrapper.attach(), this.head.attach()
    },
    unload: function ()
    {
        this.head.destroy(), this.wrapper.destroy()
    }
});
centralControl.addRoute(
{
    path: "edit/locale/",
    loader: !0,
    load: function ()
    {
        this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.model.remote([
        {
            systemd: "os_lang_locales_avail"
        },
        {
            systemd: "os_lang_locale_read"
        }]).on(function (e)
        {
            var t = document.createElement("label");
            t.classList.add("page-label"), t.textContent = _("Sprache");
            var n = new inputSelect(
                {
                    options: [],
                    force_open: !0,
                    class: ["dynamic-size", "dark"]
                }),
                a = 0;
            n.setOptions(e[0].locales.map(function (t, n)
            {
                return t[0] === e[1].locale && (a = n),
                {
                    text: t[1],
                    value: t[0]
                }
            })), n.select(a);
            var o = new inputButton(
            {
                label: _("Sprache speichern"),
                class: ["green", "dynamic-size", "no-icon-border"],
                icon: "save"
            });
            o.handle(function ()
            {
                centralControl.loader.attach(), this.model.remote([
                {
                    systemd: "os_lang_locale_store",
                    params:
                    {
                        locale: n.getValue().value
                    }
                }]).on(function ()
                {
                    window.location.reload()
                })
            }.bind(this)), this.wrapper.content.appendChild(t), this.wrapper.content.appendChild(n.element), this.wrapper.content.appendChild(o.element), centralControl.loader.destroy()
        }.bind(this)), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element), this.wrapper.attach(), this.head.attach()
    },
    unload: function ()
    {
        this.head.destroy(), this.wrapper.destroy()
    }
});
centralControl.addRoute(
{
    path: "edit-auth/",
    loader: !0,
    load: function ()
    {
        var e = 0;
        this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var t = document.createElement("label");
        t.classList.add("page-label"), t.textContent = _("Sperrkennwort");
        var n = new inputButton(
            {
                label: _("Aktiv"),
                class: ["dark", "dynamic-size"],
                selectable: !0
            }),
            r = new inputInput(
            {
                type: "password",
                placeholder: _("Aktuelles Passwort"),
                minlength: 1,
                class: ["inset", "dynamic-size"]
            }),
            s = new inputInput(
            {
                type: "password",
                placeholder: _("Neues Passwort"),
                minlength: 1,
                class: ["inset", "dynamic-size"]
            }),
            a = new inputInput(
            {
                type: "password",
                placeholder: _("Neues Passwort wiederholen"),
                minlength: 1,
                class: ["inset", "dynamic-size"]
            }),
            o = document.createElement("p");
        o.classList.add("hidden"), o.classList.add("struct-error-message"), o.classList.add("auto-size");
        var i = new inputButton(
            {
                label: _("Speichern"),
                class: ["green", "dynamic-size", "force-border", "no-icon-border", "icon-right"],
                icon: "save"
            }),
            d = document.createElement("div");
        d.classList.add("struct-hr"), this.wrapper.content.appendChild(t), this.wrapper.content.appendChild(n.element), this.wrapper.content.appendChild(d.cloneNode()), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element), this.model.remote([
        {
            systemd: "users_auth_required_read",
            params:
            {
                username: "web"
            }
        }]).on(function (t)
        {
            e = t[0].auth_required, 1 === e ? (this.wrapper.content.appendChild(r.element), this.wrapper.content.appendChild(d.cloneNode()), this.wrapper.content.appendChild(s.element), this.wrapper.content.appendChild(a.element), this.wrapper.content.appendChild(o), this.wrapper.content.appendChild(i.element), n.select()) : (this.wrapper.content.appendChild(s.element), this.wrapper.content.appendChild(a.element), this.wrapper.content.appendChild(o), this.wrapper.content.appendChild(i.element)), centralControl.loader.destroy(), this.head.attach(), this.wrapper.attach()
        }.bind(this)), n.handle(function (t)
        {
            t && 1 === e ? (s.element.classList.remove("hidden"), a.element.classList.remove("hidden")) : t || 1 !== e || (s.element.classList.add("hidden"), a.element.classList.add("hidden"))
        }), i.handle(function ()
        {
            centralControl.loader.attach();
            var t = r.getValue(),
                i = s.getValue(),
                d = a.getValue(),
                l = !0 === n.isSelected() ? 1 : 0,
                c = [];
            r.unsetError(), s.unsetError(), o.classList.add("hidden"), o.innerHTML = "";
            var p = [];
            0 === l ? p.push(
            {
                systemd: "users_auth_required_store",
                params:
                {
                    username: "web",
                    password: t,
                    auth_required: 0
                }
            }) : (p.push(
            {
                systemd: "users_auth_password_store",
                params:
                {
                    username: "web",
                    old_password: t,
                    new_password: i
                }
            }), p.push(
            {
                systemd: "users_auth_required_store",
                params:
                {
                    username: "web",
                    password: i,
                    auth_required: 1
                }
            })), console.log(e, l), 1 === e && 0 === l ? this.model.remote(p).on(function (e)
            {
                centralControl.loader.destroy(), centralControl.jumpBack()
            }) : 1 === e && 1 === l ? d !== i ? (centralControl.loader.destroy(), a.setError(), s.setError(), c.push(_("Die Passwörter stimmen nicht überein."))) : this.model.remote(p).on(function (e)
            {
                centralControl.loader.destroy(), e[0].message ? (o.classList.remove("hidden"), o.innerHTML = _("Authentifizierung fehlgeschlagen. Bitte vergewissern Sie sich, dass Ihr altes Passwort korrekt ist.")) : centralControl.jumpBack()
            }) : 0 === e && 1 === l ? d !== i ? (centralControl.loader.destroy(), a.setError(), s.setError(), c.push(_("Die Passwörter stimmen nicht überein."))) : this.model.remote(p).on(function (e)
            {
                centralControl.loader.destroy(), e[0].message ? (o.classList.remove("hidden"), o.innerHTML = _("Authentifizierung fehlgeschlagen. Bitte vergewissern Sie sich, dass Ihr altes Passwort korrekt ist.")) : centralControl.jumpBack()
            }) : 0 === e && 0 === l && (centralControl.loader.destroy(), centralControl.jumpBack()), c.length > 0 && (o.classList.remove("hidden"), c.forEach(function (e)
            {
                o.innerHTML += e + "<br />"
            }))
        }.bind(this))
    },
    unload: function ()
    {
        this.wrapper.destroy(), this.head.destroy()
    }
});
centralControl.addRoute(
{
    path: "solar-protection/",
    loader: !0,
    load: function ()
    {
        this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.model.remote([
        {
            deviced: "deviced_get_item_list",
            params:
            {
                list_type: "receivers"
            }
        }]).on(function (e)
        {
            var t = e[0].item_list.filter(function (e)
            {
                if ("centronic" !== e.backend) return !1;
                switch (e.device_type)
                {
                    case "sun-sail":
                    case "venetian":
                    case "awning":
                    case "screen":
                        return !0;
                    default:
                        return !1
                }
            }).map(function (e)
            {
                return {
                    text: e.name,
                    value: e,
                    icon: centralControl.itemToValueOptions(e)[0].icon
                }
            });
            0 === t.length && t.push(
            {
                value: "prevent",
                text: _("Liste leer")
            });
            var n = new inputList(
            {
                options: t,
                sortable: !1,
                button_class: ["dark", "no-icon-border", "dynamic-size"],
                label: _("Sonnenschutz Empfänger")
            });
            n.handle(function (e)
            {
                window.location.href = "#/solar-protection/edit/?i=" + centralControl.objectToURIComponent(e.value)
            }), this.wrapper.content.appendChild(n.element), centralControl.loader.destroy(), this.wrapper.attach(), this.head.attach()
        }.bind(this)), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element)
    },
    unload: function ()
    {
        this.head.destroy(), this.wrapper.destroy()
    }
}).addRoute(
{
    path: "solar-protection/edit/",
    loader: !0,
    load: function (e)
    {
        this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.model.remote([
        {
            deviced: "item_get_config",
            params:
            {
                item_id: e.id
            }
        }]).on(function (e)
        {
            centralControl.loader.destroy(), o.setValue(e[0].config["sun-thres-lo"]), r.setValue(e[0].config["sun-thres-hi"]), c.setValue(e[0].config["sun-delay-hi"] / 60), s.setValue(e[0].config["sun-delay-lo"] / 60), p.setValue(e[0].config["wind-thres"]);
            var t = e[0].config["sun-action"];
            "move" === t ? u.select(0) : "pos1" === t ? u.select(1) : "pos2" === t && u.select(2), this.head.attach(), this.wrapper.attach(), !0 === e[0].config["mode-winter"] && h.select()
        }.bind(this));
        var t = document.createElement("div");
        t.classList.add("struct-icon"), t.classList.add("standalone"), t.classList.add("sunny");
        var n = document.createElement("div");
        n.classList.add("struct-icon"), n.classList.add("standalone"), n.classList.add("partlycloudy");
        var a = document.createElement("div");
        a.classList.add("struct-icon"), a.classList.add("standalone"), a.classList.add("sym-weather-wind");
        var i = document.createElement("label");
        i.classList.add("struct-label"), i.textContent = _("Schwellwerte für Sonnensensoren");
        var o = new inputHSlider(
            {
                class: ["solar-protection", "blue"],
                value: 1,
                min: 0,
                max: 14,
                first_section_width: "auto",
                show_values: !0,
                map:
                {
                    value: function (e)
                    {
                        return e + 1
                    },
                    index: function (e)
                    {
                        return e - 1
                    }
                }
            }),
            r = new inputHSlider(
            {
                class: ["solar-protection", "yellow"],
                value: 1,
                min: 0,
                max: 14,
                first_section_width: "auto",
                show_values: !0,
                map:
                {
                    value: function (e)
                    {
                        return e + 1
                    },
                    index: function (e)
                    {
                        return e - 1
                    }
                }
            });
        o.handle(function ()
        {
            var e = r.getValue(),
                t = o.getValue();
            t >= e && t < 15 ? r.setValue(t + 1) : 15 === t && o.setValue(14)
        }), r.handle(function ()
        {
            var e = r.getValue();
            e <= o.getValue() && e > 1 ? o.setValue(e - 1) : 1 === e && r.setValue(2)
        });
        var l = document.createElement("label");
        l.classList.add("struct-label"), l.textContent = _("Verzögerung Sonnenautomatik");
        var s = new inputHSlider(
            {
                class: ["solar-protection", "blue"],
                value: 6,
                min: 0,
                max: 12,
                first_section_width: "auto",
                show_values: !0,
                map:
                {
                    value: function (e)
                    {
                        return 6 + 2 * e
                    },
                    index: function (e)
                    {
                        return (e - 6) / 2
                    }
                }
            }),
            c = new inputHSlider(
            {
                class: ["solar-protection", "yellow"],
                value: 3,
                min: 0,
                max: 12,
                first_section_width: "auto",
                show_values: !0,
                map:
                {
                    value: function (e)
                    {
                        return e + 3
                    },
                    index: function (e)
                    {
                        return e - 3
                    }
                }
            }),
            d = document.createElement("label");
        d.classList.add("struct-label"), d.textContent = _("Schwellwert für Windsensor");
        var p = new inputHSlider(
            {
                class: ["solar-protection", "red-white"],
                value: 1,
                min: 0,
                max: 10,
                first_section_width: "auto",
                show_values: !0,
                map:
                {
                    value: function (e)
                    {
                        return e + 1
                    },
                    index: function (e)
                    {
                        return e - 1
                    }
                }
            }),
            u = new inputSelect(
            {
                options: [
                {
                    value: "move",
                    text: _("Untere Endlage")
                },
                {
                    value: "pos1",
                    text: _("Untere Endlage + Wendung/Tuch")
                },
                {
                    value: "pos2",
                    text: _("Zwischenposition")
                }],
                force_open: !0,
                label: _("Aktion Sonnenschwellwert"),
                class: ["dynamic-size"]
            });
        u.select(0);
        var h = new inputButton(
            {
                label: _("Wintermodus"),
                class: ["dark", "dynamic-size"],
                selectable: !0
            }),
            m = new inputButton(
            {
                label: _("Einstellungen kopieren"),
                icon: "right",
                class: ["warn", "no-icon-border", "dynamic-size", "icon-right"]
            });
        m.handle(function ()
        {
            window.location.href = "#/solar-protection/copy/?i=" + centralControl.objectToURIComponent(
            {
                id: e.id
            })
        });
        var w = new inputButton(
        {
            label: _("Speichern"),
            icon: "save",
            class: ["green", "no-icon-border", "dynamic-size"]
        });
        w.handle(function ()
        {
            centralControl.loader.attach(), this.model.remote([
            {
                deviced: "item_set_config",
                params:
                {
                    item_id: e.id,
                    config:
                    {
                        "sun-thres-hi": r.getValue(),
                        "sun-thres-lo": o.getValue(),
                        "sun-delay-hi": 60 * c.getValue(),
                        "sun-delay-lo": 60 * s.getValue(),
                        "sun-action": u.getValue().value,
                        "mode-winter": !0 === h.isSelected(),
                        "wind-thres": p.getValue()
                    }
                }
            }]).on(function ()
            {
                centralControl.loader.destroy(), centralControl.jumpBack()
            })
        }.bind(this));
        var v = document.createElement("div");
        v.classList.add("struct-hr"), this.wrapper.content.appendChild(i), this.wrapper.content.appendChild(n.cloneNode(!0)), this.wrapper.content.appendChild(o.element), this.wrapper.content.appendChild(t.cloneNode(!0)), this.wrapper.content.appendChild(r.element), this.wrapper.content.appendChild(l), this.wrapper.content.appendChild(n.cloneNode(!0)), this.wrapper.content.appendChild(s.element), this.wrapper.content.appendChild(t.cloneNode(!0)), this.wrapper.content.appendChild(c.element), this.wrapper.content.appendChild(d), this.wrapper.content.appendChild(a.cloneNode(!0)), this.wrapper.content.appendChild(p.element), this.wrapper.content.appendChild(u.element), this.wrapper.content.appendChild(h.element), this.wrapper.content.appendChild(v.cloneNode()), this.wrapper.content.appendChild(m.element), this.wrapper.content.appendChild(v.cloneNode()), this.wrapper.content.appendChild(w.element), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element)
    },
    unload: function ()
    {
        this.head.destroy(), this.wrapper.destroy()
    }
}).addRoute(
{
    path: "solar-protection/copy/",
    loader: !0,
    load: function (e)
    {
        this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.model.remote([
        {
            deviced: "deviced_get_item_list",
            params:
            {
                list_type: "receivers"
            }
        }]).on(function (t)
        {
            var n = t[0].item_list.filter(function (t)
            {
                if ("centronic" !== t.backend || t.id === e.id) return !1;
                switch (t.device_type)
                {
                    case "sun-sail":
                    case "venetian":
                    case "awning":
                    case "screen":
                        return !0;
                    default:
                        return !1
                }
            }).map(function (e)
            {
                return {
                    text: e.name,
                    value: e,
                    icon: centralControl.itemToValueOptions(e)[0].icon
                }
            });
            0 === n.length && n.push(
            {
                value: "prevent",
                text: _("Liste leer")
            });
            var a = new inputList(
            {
                options: n,
                sortable: !1,
                button_class: ["dark", "no-icon-border", "dynamic-size"],
                label: _("Kopieren von")
            });
            a.handle(function (t)
            {
                centralControl.loader.attach(), this.model.remote([
                {
                    deviced: "item_copy_config",
                    params:
                    {
                        item_id: t.value.id,
                        target_id: e.id,
                        names: ["sun-thres-lo", "sun-thres-hi", "sun-delay-hi", "sun-delay-lo", "wind-thres", "sun-action", "mode-winter"]
                    }
                }]).on(function ()
                {
                    centralControl.loader.destroy(), centralControl.jumpBack()
                })
            }.bind(this));
            var i = new inputButton(
                {
                    label: _("Abbrechen"),
                    icon: "delete",
                    class: ["delete", "no-icon-border", "dynamic-size"]
                }),
                o = document.createElement("div");
            o.classList.add("struct-hr"), i.handle(function ()
            {
                centralControl.jumpBack()
            }), this.wrapper.content.appendChild(a.element), this.wrapper.content.appendChild(o), this.wrapper.content.appendChild(i.element), centralControl.loader.destroy(), this.wrapper.attach(), this.head.attach()
        }.bind(this)), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element)
    },
    unload: function ()
    {
        this.head.destroy(), this.wrapper.destroy()
    }
});
centralControl.addRoute(
{
    path: "learn/",
    persistent: !0,
    load: function ()
    {
        this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        !0 === centralControl.linking ? alert("LINK IN PROCESS") : centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        !0 === centralControl.linking ? alert("LINK IN PROCESS") : centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), document.body.appendChild(this.head.element), this.head.attach()
    },
    change: function () {},
    unload: function ()
    {
        this.head.destroy()
    }
}).addRoute(
{
    path: "learn/",
    loader: !0,
    load: function (e)
    {
        var t = 0;
        this.model.remote([
        {
            deviced: "deviced_get_info"
        }]).on(function (n)
        {
            if (centralControl.loader.destroy(), n[0].interfaces.forEach(function (e)
                {
                    "centronic" === e.backend_type && e.hw_version ? t = parseInt(e.hw_version.split(" ")[0].split(":")[1]) : e.hw_version || (t = 0)
                }), e && !0 === e.freeze);
            else
            {
                this.wrapper = new structWrapper(
                {
                    center_content: !0,
                    overflow_y: !0
                });
                var i;
                if ("internal_objects" === e.list_type) i = _("Name");
                else if ("remotes" === e.list_type) i = _("Handsender Name");
                else if ("sensors" === e.list_type) i = _("Sensor Name");
                else var i = _("Empfänger Name");
                this.name_input = new inputInput(
                {
                    type: "text",
                    placeholder: i,
                    minlength: 1,
                    class: ["inset", "dynamic-size", "dark"]
                }), console.log("LIST TYPE", t, e.list_type, e);
                var r;
                r = t >= 11 || "receivers" === e.list_type ? [
                {
                    value: "knx-rf",
                    text: "B-Tronic / KNX-RF"
                },
                {
                    value: "centronic",
                    text: "Centronic"
                }] : [
                {
                    value: "knx-rf",
                    text: "B-Tronic / KNX-RF"
                }], this.user_select_backend = new inputSelect(
                {
                    options: r,
                    force_open: !0,
                    label: _("Funksystem"),
                    class: ["dynamic-size", "dark"]
                });
                var o = [],
                    a = [];
                e.list_type && "receivers" !== e.list_type ? "remotes" === e.list_type ? (o = [
                {
                    value: "shutter",
                    text: _("Rollladen- / Jalousiemodus"),
                    icon: "remote"
                },
                {
                    value: "switch",
                    text: _("Schaltermodus"),
                    icon: "remote"
                }], a = [
                {
                    value: "shutter",
                    text: _("Rollladen- / Jalousiemodus"),
                    icon: "remote"
                }]) : "sensors" === e.list_type && (o = [
                {
                    value: "sensor-open",
                    text: _("Fensterkontakt"),
                    icon: "icon-window-open"
                },
                {
                    value: "sensor-motion",
                    text: _("Bewegungsmelder"),
                    icon: "icon-motion"
                },
                {
                    value: "sensor-presence",
                    text: _("Präsenzmelder"),
                    icon: "icon-motion"
                },
                {
                    value: "sensor-temperature",
                    text: _("Temperatur"),
                    icon: "sym-thermometer"
                },
                {
                    value: "sensor-smoke",
                    text: _("Feuermelder"),
                    icon: "icon-fire"
                },
                {
                    value: "sensor-sun",
                    text: _("Lichtsensor"),
                    icon: "sunny"
                }], a = [
                {
                    value: "sensor-sun",
                    text: _("Sonne"),
                    icon: "sunny"
                },
                {
                    value: "sensor-wind",
                    text: _("Wind"),
                    icon: "sunny"
                },
                {
                    value: "sensor-sun-wind",
                    text: _("Sonne / Wind"),
                    icon: "sunny"
                },
                {
                    value: "sensor-sun-wind-rain",
                    text: _("Sonne / Wind / Regen"),
                    icon: "sunny"
                }]) : (o = [
                {
                    value: "shutter",
                    text: _("Rollladen"),
                    icon: "device-shutter"
                },
                {
                    value: "awning",
                    text: _("Markise"),
                    icon: "device-awning"
                },
                {
                    value: "sun-sail",
                    text: _("Sonnensegel"),
                    icon: "device-sun-sail"
                },
                {
                    value: "venetian",
                    text: _("Jalousie"),
                    icon: "device-venetian"
                },
                {
                    value: "screen",
                    text: _("Screen"),
                    icon: "device-screen"
                },
                {
                    value: "switch",
                    text: _("Schaltaktor"),
                    icon: "device-switch"
                },
                {
                    value: "dimmer",
                    text: _("Dimmaktor"),
                    icon: "device-dimmer"
                },
                {
                    value: "door",
                    text: _("Tor"),
                    icon: "device-door"
                },
                {
                    value: "thermostat",
                    text: _("Thermostat"),
                    icon: "device-thermostat"
                },
                {
                    value: "roof-window",
                    text: _("Dachfenster"),
                    icon: "device-roof-window"
                }], a = [
                {
                    value: "shutter",
                    text: _("Rollladen"),
                    icon: "device-shutter"
                },
                {
                    value: "shutter-foldout",
                    text: _("Rollladen (Ausklappbar)"),
                    icon: "device-shutter-foldout"
                },
                {
                    value: "shutter-blinds",
                    text: _("Rollladen (Jalousierbar)"),
                    icon: "device-shutter-blinds"
                },
                {
                    value: "awning",
                    text: _("Markise"),
                    icon: "device-awning"
                },
                {
                    value: "heater",
                    text: _("Markisenheizung"),
                    icon: "device-heater"
                },
                {
                    value: "sun-sail",
                    text: _("Sonnensegel"),
                    icon: "device-sun-sail"
                },
                {
                    value: "venetian",
                    text: _("Jalousie"),
                    icon: "device-venetian"
                },
                {
                    value: "screen",
                    text: _("Screen"),
                    icon: "device-screen"
                },
                {
                    value: "switch",
                    text: _("Schaltaktor"),
                    icon: "device-switch"
                },
                {
                    value: "dimmer",
                    text: _("Dimmaktor"),
                    icon: "device-dimmer"
                },
                {
                    value: "door",
                    text: _("Tor"),
                    icon: "device-door"
                },
                {
                    value: "door-pulse",
                    text: _("Tor (Impuls)"),
                    icon: "device-door"
                },
                {
                    value: "roof-window",
                    text: _("Dachfenster"),
                    icon: "device-roof-window"
                },
                {
                    value: "door-opener",
                    text: _("Türöffner"),
                    icon: "sym-door"
                },
                {
                    value: "tilt-window",
                    text: _("Fensteröffner"),
                    icon: "icon-window-closed"
                }]), this.user_select_type = new inputSelect(
                {
                    options: [],
                    label: _("Geräte Typ"),
                    force_open: !0,
                    class: ["dynamic-size", "dark"]
                }), this.user_select_backend.handle(function (e, t)
                {
                    "knx-rf" === e.value ? this.user_select_type.setOptions(o) : "centronic" === e.value && this.user_select_type.setOptions(a), this.user_select_type.select(0)
                }.bind(this)), this.user_select_backend.select(0), this.next_button = new inputButton(
                {
                    label: _("Weiter"),
                    class: ["green", "icon-right", "dynamic-size", "no-icon-border"],
                    icon: "right"
                });
                var s = document.createElement("label");
                if (s.classList.add("page-label"), "internal_objects" === e.list_type ? s.textContent = _("Internes Objekt anlegen") : "remotes" === e.list_type ? s.textContent = _("Handsender einlernen") : "sensors" === e.list_type ? s.textContent = _("Sensor einlernen") : s.textContent = _("Empfänger einlernen"), this.wrapper.content.appendChild(s), this.wrapper.content.appendChild(this.name_input.element), t < 11 && ("remotes" === e.list_type || "sensors" === e.list_type))
                {
                    var l = document.createElement("p");
                    l.classList.add("struct-error-message"), l.innerHTML = _("Die gewünschte Funktion erfordert einen neueren Centronic USB-Stick (4035 200 041 0). Diesen erhalten Sie über Ihren Fachhändler - alle bisherigen Funktionen können aber wie gehabt weiter verwendet werden."), this.wrapper.content.appendChild(l)
                }
                "internal_objects" !== e.list_type && (this.wrapper.content.appendChild(this.user_select_backend.element), this.wrapper.content.appendChild(this.user_select_type.element)), this.wrapper.content.appendChild(this.next_button.element)
            }
            this.next_button.handle(function ()
            {
                var t, n;
                "internal_objects" === e.list_type ? (t = {
                    value: "virtual"
                }, n = {
                    value: "switch"
                }) : (t = this.user_select_backend.getValue(), n = this.user_select_type.getValue());
                var i = {
                    backend: null === t ? null : t.value,
                    device_type: null === n ? null : n.value,
                    name: this.name_input.getValue(),
                    list_type: e.list_type
                };
                i.name.length > 2 ? centralControl.invokeRoute("learn/2/", i) : (this.wrapper.element.scrollTop = 0, this.name_input.setError())
            }.bind(this)), document.body.appendChild(this.wrapper.element), this.wrapper.attach()
        }.bind(this))
    },
    unload: function ()
    {
        this.wrapper.destroy()
    }
}).addRoute(
{
    path: "learn/2/",
    load: function (e)
    {
        if ("virtual" === e.backend) centralControl.invokeRoute("learn/on-link/", e);
        else
        {
            this.wrapper = new structWrapper(
            {
                center_content: !0,
                overflow_y: !0
            });
            var t = document.createElement("p");
            t.classList.add("struct-message"), t.classList.add("auto-size"), "sensors" === e.list_type ? t.innerHTML = _("Bitte halten Sie Ihren Sensor bereit und drücken auf „Weiter“.") : "remotes" === e.list_type ? t.innerHTML = _("Bitte halten Sie den Handsender bereit und drücken auf „Weiter“.") : t.innerHTML = _("Bringen Sie den Empfänger jetzt in Lernbereitschaft und drücken auf „Weiter“.");
            var n = new inputButton(
            {
                label: _("Weiter"),
                class: ["green", "icon-right", "dynamic-size", "no-icon-border"],
                icon: "right"
            });
            n.handle(function ()
            {
                centralControl.invokeRoute("learn/on-link/", e)
            }), this.wrapper.content.appendChild(t), this.wrapper.content.appendChild(n.element), document.body.appendChild(this.wrapper.element), this.wrapper.attach()
        }
    },
    unload: function ()
    {
        this.wrapper && this.wrapper.destroy()
    }
}).addRoute(
{
    path: "learn/on-link/",
    loader: !0,
    load: function (e)
    {
        console.log("GET LINK", e), centralControl.linking = !0;
        var t = -1,
            n = -1,
            i = {};
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.link_message = document.createElement("div"), this.link_message.classList.add("struct-message"), this.link_message.classList.add("center-center"), this.link_message.classList.add("auto-size"), this.link_message.textContent = _("Bitte starten Sie jetzt den Einlernvorgang an Ihrem Gerät."), "sensor-smoke" === e.device_type && (this.link_message.textContent = _("Drücken Sie jetzt die Einlerntaste (z.B. 1 bei Hager)"));
        var r = [];
        "sensors" !== e.list_type && "remotes" !== e.list_type || !0 === e.replace ? !0 !== e.replace ? r.push(
        {
            deviced: "group_new",
            params:
            {
                name: e.name,
                backend: e.backend,
                device_type: e.device_type
            }
        }) : console.log("REPLACE", e) : r.push(
        {
            deviced: "remote_new",
            params:
            {
                name: e.name,
                backend: e.backend,
                remote_type: e.device_type
            }
        }), this.model.remote(r).then(function (i)
        {
            if (!0 === e.replace) return t = e.id, [
            {
                deviced: "group_add_device",
                params:
                {
                    group_id: e.id,
                    backend_type: e.backend,
                    replace: !0
                }
            }];
            if ("sensors" === e.list_type || "remotes" === e.list_type)
            {
                centralControl.loader.destroy(), n = i[0].remote_id, this.wrapper.content.appendChild(this.link_message);
                var r = 30;
                return this.countdown = setInterval(function ()
                {
                    if (0 === --r)
                    {
                        this.link_message.innerHTML = _("Bitte starten Sie jetzt den Einlernvorgang an Ihrem Gerät."), "sensor-smoke" === e.device_type && (this.link_message.innerHTML = _("Drücken Sie jetzt die Einlerntaste (z.B. 1 bei Hager)"));
                        var t = new inputButton(
                        {
                            label: _("Abbrechen"),
                            icon: "delete",
                            class: ["delete", "dynamic-size"]
                        });
                        this.link_message.appendChild(t.element), t.handle(function ()
                        {
                            this.model.cancelRemotes(), this.model.set("remote-error", [
                            {
                                code: 100
                            }])
                        }.bind(this)), clearInterval(this.countdown)
                    }
                    else r > 0 && (this.link_message.innerHTML = _("Bitte starten Sie jetzt den Einlernvorgang an Ihrem Gerät."), "sensor-smoke" === e.device_type && (this.link_message.innerHTML = _("Drücken Sie jetzt die Einlerntaste (z.B. 1 bei Hager)")), this.link_message.innerHTML += 1 === r ? "<br />" + _("%d Sekunde verbleibend.", r) : "<br />" + _("%d Sekunden verbleibend.", r))
                }.bind(this), 1e3), this.wrapper.attach(), [
                {
                    deviced: "remote_add_remote",
                    params:
                    {
                        remote_id: i[0].remote_id
                    }
                }]
            }
            return t = i[0].group_id, [
            {
                deviced: "group_add_device",
                params:
                {
                    group_id: i[0].group_id
                }
            }]
        }.bind(this)).on(function (r)
        {
            "virtual" === e.backend && "switch" === e.device_type && (console.log("SET CONFIG HERE"), this.model.remote([
            {
                deviced: "item_set_config",
                params:
                {
                    item_id: t,
                    config:
                    {
                        presentation: JSON.stringify(
                        {
                            template: "switch-alternate-io"
                        })
                    }
                }
            }])), "sensors" === e.list_type || "remotes" === e.list_type ? (i = {
                id: n,
                backend: e.backen,
                remote_type: e.device_type,
                name: e.name
            }, e.id = r[0].remote_id) : (centralControl.loader.destroy(), i = {
                id: t,
                backend: e.backend,
                feedback: "centronic" !== e.backend,
                device_type: e.device_type,
                name: e.name,
                list_type: e.list_type,
                fresh: e.fresh,
                replace: e.replace || !1
            }, !0 !== e.replace && (e.id = r[0].group_id))
        }.bind(this)), this.model.on("remote-response", function (t)
        {
            console.log("LINK", t), centralControl.linking = !1, "sensors" === e.list_type || "remotes" === e.list_type ? !1 === t[1][0].status ? this.model.set("remote-error", []) : !0 === t[1][0].status && centralControl.invokeRoute("learn/confirm-remote/", e) : (centralControl.loader.destroy(), "centronic" === e.backend ? centralControl.invokeRoute("learn/confirm-centronic/", i) : 0 === t[1][0].success ? this.model.set("remote-error", []) : centralControl.invokeRoute("learn/test-device/", e))
        }.bind(this)), this.model.on("remote-error", function (i)
        {
            var r = document.createElement("p");
            r.classList.add("struct-error-message"), t > -1 ? (!0 !== e.replace && this.model.remote([
            {
                deviced: "item_delete",
                params:
                {
                    item_id: t
                }
            }]), r.innerHTML = _("Der Empfänger wurde <b>nicht</b> eingelernt.<br />Einstellungen und Lernbereitschaft prüfen und Vorgang neu starten.")) : n > -1 && (this.wrapper.content.removeChild(this.link_message), !0 !== e.replace && this.model.remote([
            {
                deviced: "item_delete",
                params:
                {
                    item_id: n
                }
            }]), "remotes" === e.list_type ? r.innerHTML = _("Der Handsender wurde <b>nicht</b> eingelernt.<br />Einstellungen und Lernbereitschaft prüfen und Vorgang neu starten.") : "sensors" === e.list_type && (r.innerHTML = _("Der Sensor wurde <b>nicht</b> eingelernt.<br />Einstellungen und Lernbereitschaft prüfen und Vorgang neu starten.")));
            var o = new inputButton(
                {
                    label: _("Erneut versuchen"),
                    icon: "right",
                    class: ["green", "icon-right", "no-icon-border", "dynamic-size"]
                }),
                a = new inputButton(
                {
                    label: _("Einstellungen ändern"),
                    icon: "undo",
                    class: ["warn", "icon-right", "no-icon-border", "dynamic-size"]
                }),
                s = new inputButton(
                {
                    label: _("Abbrechen"),
                    icon: "delete",
                    class: ["delete", "icon-right", "dynamic-size", "no-icon-border"]
                });
            o.handle(function ()
            {
                console.log("GET DATA ON BEFORE REDIRECT", e), centralControl.invokeRoute("learn/on-link/", e)
            }), a.handle(function ()
            {
                centralControl.invokeRoute("learn/",
                {
                    freeze: !0,
                    list_type: e.list_type
                })
            }), s.handle(function ()
            {
                centralControl.jumpBack()
            }), this.wrapper.content.appendChild(r), this.wrapper.content.appendChild(o.element), !0 !== e.replace && this.wrapper.content.appendChild(a.element), this.wrapper.content.appendChild(s.element), this.wrapper.attach()
        }.bind(this)), document.body.appendChild(this.wrapper.element)
    },
    unload: function ()
    {
        this.countdown && clearInterval(this.countdown), this.wrapper.destroy()
    }
}).addRoute(
{
    path: "learn/confirm-centronic/",
    load: function (e)
    {
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var t = document.createElement("p");
        t.classList.add("struct-message"), t.classList.add("auto-size"), t.innerHTML = _("Hat der Empfänger quittiert?<br />War ein Klack-Klack zu hören?");
        var n = new inputButton(
            {
                label: _("Ja"),
                icon: "right",
                class: ["green", "icon-right", "no-icon-border", "dynamic-size"]
            }),
            i = new inputButton(
            {
                label: _("Nein"),
                icon: "undo",
                class: ["warn", "icon-right", "no-icon-border", "dynamic-size"]
            });
        n.handle(function ()
        {
            centralControl.invokeRoute("learn/test-device/", e)
        }.bind(this)), i.handle(function ()
        {
            e.replace && !0 === e.replace ? centralControl.jumpBack() : this.model.remote([
            {
                deviced: "item_delete",
                params:
                {
                    item_id: e.id
                }
            }]).on(function ()
            {
                centralControl.invokeRoute("learn/",
                {
                    freeze: !0
                })
            })
        }.bind(this)), this.wrapper.content.appendChild(t), this.wrapper.content.appendChild(n.element), this.wrapper.content.appendChild(i.element), document.body.appendChild(this.wrapper.element), this.wrapper.attach()
    },
    unload: function ()
    {
        this.wrapper.destroy()
    }
}).addRoute(
{
    path: "learn/test-device/",
    load: function (e)
    {
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var t = document.createElement("p");
        t.classList.add("struct-message"), t.classList.add("green"), t.classList.add("auto-size"), "virtual" === e.backend ? t.innerHTML = _("Das interne Objekt wurde angelegt.") : t.innerHTML = _("Der Empfänger wurde erfolgreich eingelernt."), this.wrapper.content.appendChild(t);
        var n = document.createElement("div"),
            i = document.createElement("div");
        n.classList.add("struct-control-frontend"), n.classList.add("learn-item"), i.classList.add("struct-control-content"), n.appendChild(i);
        var r, o;
        e.remote_type ? (o = angularRootScope.$new(!0), o.item = e, o.item.type = "remote", r = angularCompile('<sensor context="preview" item="item"></sensor>')(o)) : (o = angularRootScope.$new(!0), o.item = e, o.item.type = "group", r = angularCompile('<device context="control" item="item"></device>')(o)), i.appendChild(r[0]), this.wrapper.content.appendChild(n);
        var a = new inputButton(
            {
                label: _("Zu einem Raum hinzufügen"),
                class: ["warn", "dynamic-size", "no-icon-border"],
                icon: "room"
            }),
            s = _("Weiteren Empfänger einlernen");
        "internal_objects" === e.list_type && (s = _("Weiteres Internes Objekt einlernen"));
        var l = new inputButton(
            {
                label: s,
                class: ["warn", "dynamic-size", "no-icon-border"],
                icon: "add"
            }),
            d = new inputButton(
            {
                label: _("Fertig"),
                class: ["green", "dynamic-size", "no-icon-border"],
                icon: "sym-confirm"
            });
        document.createElement("div").classList.add("struct-hr");
        var c = new inputButton(
        {
            label: _("Empfänger löschen"),
            class: ["delete", "dynamic-size"],
            icon: "delete"
        });
        l.handle(function ()
        {
            centralControl.invokeRoute("learn/",
            {
                list_type: e.list_type
            })
        }), a.handle(function ()
        {
            centralControl.invokeRoute("learn/add-to-room/", e)
        }), d.handle(function ()
        {
            centralControl.jumpBack()
        }), c.handle(function ()
        {
            this.model.remote([
            {
                deviced: "item_delete",
                params:
                {
                    item_id: e.id
                }
            }]), centralControl.invokeRoute("learn/")
        }.bind(this)), "thermostat" !== e.device_type && this.wrapper.content.appendChild(a.element), this.wrapper.content.appendChild(l.element), this.wrapper.content.appendChild(d.element), this.type_pict = r, this.type_pict_scope = o, document.body.appendChild(this.wrapper.element), this.wrapper.attach()
    },
    unload: function ()
    {
        this.type_pict_scope.$destroy(), this.type_pict.remove(), this.wrapper.destroy()
    }
}).addRoute(
{
    path: "learn/add-to-room/",
    loader: !0,
    load: function (e)
    {
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.model.remote([
        {
            deviced: "deviced_get_items_info",
            params:
            {
                item_type: "room"
            }
        }]).on(function (t)
        {
            var n = [];
            t[0].item_list.forEach(function (e)
            {
                n.push(
                {
                    value: e,
                    text: e.name
                })
            });
            var i = new inputCheckboxList(
            {
                options: n,
                label: _("Räume"),
                class: ["dynamic-size", "dark"],
                button_class: ["dark", "dynamic-size"]
            });
            i.handle(function (t, n)
            {
                !1 === t ? this.model.remote([
                {
                    deviced: "room_del_item",
                    params:
                    {
                        room_id: n.value.id,
                        item_id: e.id
                    }
                }]) : this.model.remote([
                {
                    deviced: "room_add_item",
                    params:
                    {
                        room_id: n.value.id,
                        item_id: e.id
                    }
                }])
            }.bind(this));
            var r = new inputButton(
                {
                    label: _("Weiteren Empfänger einlernen"),
                    class: ["warn", "dynamic-size", "no-icon-border"],
                    icon: "add"
                }),
                o = new inputButton(
                {
                    label: _("Fertig"),
                    class: ["green", "dynamic-size", "no-icon-border"],
                    icon: "sym-confirm"
                });
            r.handle(function ()
            {
                centralControl.invokeRoute("learn/")
            }), o.handle(function ()
            {
                centralControl.jumpBack()
            });
            var a = new inputInput(
                {
                    type: "text",
                    placeholder: _("Neuen Raum anlegen"),
                    minlength: 1,
                    class: ["inset", "dynamic-size", "dark"]
                }),
                s = new inputButton(
                {
                    label: _("Raum hinzufügen"),
                    class: ["green", "dynamic-size", "no-icon-border"],
                    icon: "add"
                });
            s.handle(function ()
            {
                var e = a.getValue();
                e.length < 2 ? a.setError() : (centralControl.loader.attach(), a.unsetError(), this.model.remote([
                {
                    deviced: "room_new",
                    params:
                    {
                        name: e
                    }
                }]).on(function (t)
                {
                    centralControl.loader.destroy(), i.addOption(
                    {
                        value:
                        {
                            id: t[0].room_id,
                            selected: !0
                        },
                        text: e
                    })
                }))
            }.bind(this));
            var l = document.createElement("div");
            l.classList.add("struct-hr"), this.wrapper.content.appendChild(i.element), this.wrapper.content.appendChild(l.cloneNode()), this.wrapper.content.appendChild(a.element), this.wrapper.content.appendChild(s.element), this.wrapper.content.appendChild(l.cloneNode()), this.wrapper.content.appendChild(r.element), this.wrapper.content.appendChild(o.element), centralControl.loader.destroy(), this.wrapper.attach()
        }.bind(this)), document.body.appendChild(this.wrapper.element)
    },
    unload: function ()
    {
        this.wrapper.destroy()
    }
}).addRoute(
{
    path: "learn/confirm-remote/",
    load: function (e)
    {
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var t = document.createElement("p");
        t.classList.add("struct-message"), t.classList.add("auto-size"), t.classList.add("green");
        var n, i;
        "remotes" === e.list_type ? (n = _("Handsender konfigurieren"), i = _("Weiteren Handsender einlernen"), t.innerHTML = _("Der Handsender wurde erfolgreich eingelernt.")) : "sensors" === e.list_type && (n = _("Sensor konfigurieren"), i = _("Weiteren Sensor einlernen"), t.innerHTML = _("Der Sensor wurde erfolgreich eingelernt."));
        var r = new inputButton(
            {
                label: n,
                class: ["warn", "dynamic-size", "no-icon-border"],
                icon: "icon-gear"
            }),
            o = new inputButton(
            {
                label: i,
                class: ["warn", "dynamic-size", "no-icon-border"],
                icon: "add"
            }),
            a = new inputButton(
            {
                label: _("Fertig"),
                class: ["green", "dynamic-size", "no-icon-border"],
                icon: "sym-confirm"
            });
        this.wrapper.content.appendChild(t), this.wrapper.content.appendChild(r.element), this.wrapper.content.appendChild(o.element), this.wrapper.content.appendChild(a.element), r.handle(function ()
        {
            window.location.href = "#/edit/logic/?i=" + centralControl.objectToURIComponent(
            {
                backend: e.backend,
                id: e.id,
                remote_type: e.device_type,
                name: e.name,
                type: "remote"
            })
        }), o.handle(function ()
        {
            centralControl.invokeRoute("learn/", e)
        }), a.handle(function ()
        {
            centralControl.jumpBack()
        }), document.body.appendChild(this.wrapper.element), this.wrapper.attach()
    },
    unload: function ()
    {
        this.wrapper.destroy()
    }
});
var backup_list = [],
    backup_selected = "";
centralControl.addRoute(
{
    path: "backup/",
    loader: !0,
    load: function ()
    {
        this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var e = document.createElement("label");
        e.classList.add("page-label"), e.textContent = _("Sichern / Wiederherstellen");
        var t = document.createElement("p");
        t.classList.add("page-description"), t.textContent = _("Letzte Sicherung") + ": ";
        var n = new inputButton(
        {
            label: _("Sicherung auswählen"),
            class: ["warn", "dynamic-size", "no-icon-border", "icon-right"],
            icon: "right"
        });
        n.handle(function ()
        {
            window.location.href = "#/backup/restore/"
        });
        var a = new inputButton(
        {
            label: _("Sicherung jetzt durchführen"),
            class: ["warn", "dynamic-size", "no-icon-border", "icon-right"],
            icon: "right"
        });
        a.handle(function ()
        {
            centralControl.loader.attach(), this.model.remote([
            {
                systemd: "bak_backup_create"
            }]).on(function ()
            {
                centralControl.invokeRoute("backup/")
            })
        }.bind(this));
        var r = document.createElement("div");
        r.classList.add("struct-hr");
        var i = document.createElement("div");
        i.classList.add("text-content"), this.wrapper.content.appendChild(e), this.wrapper.content.appendChild(t), this.wrapper.content.appendChild(a.element), this.wrapper.content.appendChild(r), this.wrapper.content.appendChild(n.element), this.wrapper.content.appendChild(i), this.model.remote([
        {
            systemd: "bak_file_list_get"
        }]).then(function (e)
        {
            return e[0].filename_list[0] ? e[0].filename_list.map(function (e)
            {
                return {
                    systemd: "bak_file_mtime_get",
                    params:
                    {
                        filename: e
                    }
                }
            }) : []
        }).on(function (e, n)
        {
            try
            {
                backup_list = e[0].filename_list.map(function (e, t)
                {
                    var a = new Date;
                    return a.setTime(1e3 * n[t].mtime),
                    {
                        text: a.format("dd.mm.yyyy - HH:MM"),
                        value:
                        {
                            filename: e,
                            mtime: n[t].mtime
                        }
                    }
                });
                var a = new Date;
                a.setTime(1e3 * n[0].mtime), t.textContent += a.format("dd.mm.yyyy - HH:MM")
            }
            catch (e)
            {
                t.textContent = _("Keine Sicherung vorhanden")
            }
            centralControl.loader.destroy(), this.wrapper.attach(), this.head.attach()
        }.bind(this)), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element)
    },
    unload: function ()
    {
        this.head.destroy(), this.wrapper.destroy()
    }
}).addRoute(
{
    path: "backup/restore/",
    load: function ()
    {
        this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var e = document.createElement("label");
        e.classList.add("page-label"), e.textContent = _("Sicherung auswählen");
        var t = new inputSelect(
        {
            options: backup_list,
            label: _("Wiederherstellungspunkt"),
            force_open: !0,
            class: ["dynamic-size", "dark"]
        });
        t.select(0);
        var n = new inputButton(
        {
            label: _("Wiederherstellen"),
            class: ["warn", "dynamic-size", "no-icon-border", "icon-right"],
            icon: "right"
        });
        n.handle(function ()
        {
            backup_selected = t.getValue().value.filename, centralControl.invokeRoute("backup/restore/confirm/")
        }.bind(this)), this.wrapper.content.appendChild(e), this.wrapper.content.appendChild(t.element), this.wrapper.content.appendChild(n.element), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element), this.wrapper.attach(), this.head.attach()
    },
    unload: function ()
    {
        this.head.destroy(), this.wrapper.destroy()
    }
}).addRoute(
{
    path: "backup/restore/confirm/",
    load: function ()
    {
        this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.invokeRoute("backup/restore/")
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.invokeRoute("backup/restore/")
                    }.bind(this)
                }
            }]
        }), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var e = new inputConfirm(
        {
            class: ["no-bg"],
            title: _("Sicherung wiederherstellen?"),
            buttons: [
            {
                label: _("Ja"),
                icon: "sym-confirm",
                class: ["green", "no-icon-border", "dynamic-size"]
            },
            {
                label: _("Nein"),
                icon: "delete",
                class: ["delete", "no-icon-border", "dynamic-size"]
            }],
            on: function (e)
            {
                if (!0 === e)
                {
                    centralControl.loader.attach();
                    var t = backup_selected;
                    this.model.remote([
                    {
                        systemd: "bak_backup_restore",
                        params:
                        {
                            filename: t
                        }
                    }]).on(function ()
                    {
                        centralControl.jumpBack()
                    })
                }
                else centralControl.invokeRoute("backup/restore/")
            }.bind(this)
        });
        this.wrapper.content.appendChild(e.element), document.body.appendChild(this.head.element), document.body.appendChild(this.wrapper.element), this.head.attach(), this.wrapper.attach()
    },
    unload: function ()
    {
        this.head.destroy(), this.wrapper.destroy()
    }
});
centralControl.addRoute(
{
    path: "unlearn/",
    persistent: !0,
    load: function ()
    {
        this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), document.body.appendChild(this.head.element), this.head.attach()
    },
    change: function () {},
    unload: function ()
    {
        this.head.destroy()
    }
}).addRoute(
{
    path: "unlearn/",
    load: function (e)
    {
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var t = document.createElement("p");
        t.classList.add("struct-message"), console.log("UNLEARN TYPE", e.type, e), "remote" !== e.type || "shutter" !== e.remote_type && "switch" !== e.remote_type ? "remote" === e.type ? t.innerHTML = _("Bitte halten Sie den Sensor bereit und drücken auf weiter.") : "virtual" === e.backend ? t.innerHTML = _("Wollen Sie das Interne Objekt wirklich löschen?") : t.innerHTML = _("Bringen Sie den Empfänger jetzt in Auslernbereitschaft und drücken auf weiter.") : t.innerHTML = _("Bitte halten Sie Ihren Handsender bereit und drücken auf weiter.");
        var n = new inputButton(
            {
                label: "virtual" === e.backend ? _("Löschen") : _("Weiter"),
                icon: "right",
                class: ["green", "icon-right", "no-icon-border", "dynamic-size"]
            }),
            r = new inputButton(
            {
                label: _("Abbrechen"),
                icon: "undo",
                class: ["delete", "icon-right", "no-icon-border", "dynamic-size"]
            });
        n.handle(function ()
        {
            centralControl.invokeRoute("unlearn/2/", e)
        }), r.handle(function ()
        {
            centralControl.jumpBack()
        }), this.wrapper.content.appendChild(t), this.wrapper.content.appendChild(n.element), this.wrapper.content.appendChild(r.element), document.body.appendChild(this.wrapper.element), this.wrapper.attach()
    },
    unload: function ()
    {
        this.wrapper.destroy()
    }
}).addRoute(
{
    path: "unlearn/2/",
    loader: !0,
    load: function (e)
    {
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        });
        var t = new inputButton(
            {
                label: _("Erneut versuchen"),
                icon: "icon-reboot",
                class: ["warn", "icon-right", "no-icon-border", "dynamic-size"]
            }),
            n = new inputButton(
            {
                label: _("Abbrechen"),
                icon: "undo",
                class: ["delete", "icon-right", "no-icon-border", "dynamic-size"]
            }),
            r = new inputButton(
            {
                label: _("Trotzdem löschen"),
                icon: "delete",
                class: ["warn", "icon-right", "dynamic-size", "no-icon-border"]
            });
        n.handle(function ()
        {
            centralControl.jumpBack()
        }), t.handle(function ()
        {
            centralControl.invokeRoute("unlearn/2/", e)
        }), r.handle(function ()
        {
            this.model.remote([
            {
                deviced: "item_delete",
                params:
                {
                    item_id: e.id
                }
            }]), centralControl.jumpBack(2)
        }.bind(this));
        var i = [];
        if ("remote" === e.type)
        {
            i.push(
            {
                deviced: "remote_del_remote",
                params:
                {
                    remote_id: e.id,
                    backend_type: e.backend
                }
            }), this.status_text = document.createElement("p"), this.status_text.classList.add("struct-message"), this.status_text.classList.add("dark"), this.status_text.classList.add("center-center"), this.status_text.innerHTML = _("Bitte starten Sie jetzt den Auslernvorgang an Ihrem Gerät."), this.wrapper.content.appendChild(this.status_text), this.wrapper.attach();
            var o = 1;
            this.countdown = setInterval(function ()
            {
                if (0 === --o)
                {
                    this.status_text.innerHTML = _("Bitte starten Sie jetzt den Auslernvorgang an Ihrem Gerät.");
                    var e = new inputButton(
                    {
                        label: _("Abbrechen"),
                        icon: "delete",
                        class: ["delete", "dynamic-size", "no-icon-border"]
                    });
                    this.status_text.appendChild(e.element), e.handle(function ()
                    {
                        this.model.cancelRemotes(), this.model.set("remote-error", [
                        {
                            code: 100
                        }])
                    }.bind(this))
                }
                else o > 0 && (this.status_text.innerHTML = _("Bitte starten Sie jetzt den Auslernvorgang an Ihrem Gerät."), this.status_text.innerHTML += 1 === o ? "<br />" + _("1 Sekunde verbleibend") : "<br />" + _("%d Sekunden verbleibend", o))
            }.bind(this), 1e3), centralControl.loader.destroy()
        }
        else i.push(
        {
            deviced: "group_del_device",
            params:
            {
                group_id: e.id,
                backend_type: e.backend
            }
        });
        this.model.remote(i).on(function () {}), this.model.on("remote-response", function (t)
        {
            if ("centronic" === e.backend && "remote" !== e.type)
            {
                centralControl.loader.destroy();
                var n = document.createElement("p");
                n.classList.add("struct-message"), n.classList.add("auto-size"), n.innerHTML = _("War ein Klack-Klack zu hören?");
                "remote" !== e.type || "shutter" !== e.remote_type && "switch" !== e.remote_type ? "remote" === e.type ? text = _("Ja. Sensor löschen.") : text = _("Ja.") : text = _("Ja. Handsender löschen.");
                var r = new inputButton(
                    {
                        label: text,
                        icon: "delete",
                        class: ["green", "dynamic-size", "no-icon-border"]
                    }),
                    i = new inputButton(
                    {
                        label: _("Nein. Erneut versuchen."),
                        icon: "icon-reboot",
                        class: ["delete", "icon-right", "no-icon-border", "dynamic-size"]
                    }),
                    o = new inputButton(
                    {
                        label: _("Abbrechen"),
                        icon: "undo",
                        class: ["delete", "no-icon-border", "dynamic-size"]
                    });
                o.handle(function ()
                {
                    centralControl.jumpBack()
                }), i.handle(function ()
                {
                    centralControl.invokeRoute("unlearn/2/", e)
                }), r.handle(function ()
                {
                    this.model.remote([
                    {
                        deviced: "item_delete",
                        params:
                        {
                            item_id: e.id
                        }
                    }]), centralControl.jumpBack(2)
                }.bind(this)), this.wrapper.content.appendChild(n), this.wrapper.content.appendChild(r.element), this.wrapper.content.appendChild(i.element), this.wrapper.content.appendChild(o.element), this.wrapper.attach()
            }
            else "remote" === e.type ? !1 === t[0][0].status ? this.model.set("remote-error", [
            {
                code: 100
            }]) : (this.model.remote([
            {
                deviced: "item_delete",
                params:
                {
                    item_id: e.id
                }
            }]), centralControl.jumpBack(2)) : "knx-rf" === e.backend && 0 === t[0][0].success ? this.model.set("remote-error", [
            {
                code: 100
            }]) : (this.model.remote([
            {
                deviced: "item_delete",
                params:
                {
                    item_id: e.id
                }
            }]), centralControl.jumpBack(2))
        }.bind(this)), this.model.on("remote-error", function (i)
        {
            if (this.status_text && this.wrapper.content.removeChild(this.status_text), i[0] && i[0].code)
            {
                centralControl.loader.destroy();
                var o = document.createElement("p");
                o.classList.add("struct-error-message"), "remote" !== e.type || "shutter" !== e.remote_type && "switch" !== e.remote_type ? "remote" === e.type ? o.innerHTML = _("Der Sensor befindet sich außerhalb der Reichweite, oder befindet sich nicht in Auslernbereitschaft.<br />Möchten Sie den Sensor trotzdem löschen?") : o.innerHTML = _("Der Empfänger befindet sich außerhalb der Reichweite, oder befindet sich nicht in Auslernbereitschaft.<br />Möchten Sie den Empfänger trotzdem löschen?") : o.innerHTML = _("Der Handsender befindet sich außerhalb der Reichweite, oder befindet sich nicht in Auslernbereitschaft.<br />Möchten Sie den Sender trotzdem löschen?"), this.wrapper.content.appendChild(o), this.wrapper.content.appendChild(r.element), this.wrapper.content.appendChild(t.element), this.wrapper.content.appendChild(n.element), this.wrapper.attach()
            }
        }.bind(this)), document.body.appendChild(this.wrapper.element)
    },
    unload: function ()
    {
        this.wrapper.destroy(), this.countdown && clearInterval(this.countdown)
    }
});
centralControl.addRoute(
{
    path: "device/options/",
    load: function (e)
    {
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        });
        var n = new inputButton(
        {
            label: _("Lernbereitschaft"),
            class: ["warn", "dynamic-size", "force-border", "no-icon-border"],
            icon: "add"
        });
        n.handle(function ()
        {
            this.model.remote([
            {
                deviced: "item_set_feature",
                params:
                {
                    item_id: e.id,
                    feature: "linkable",
                    value: 1
                }
            }]).on(function (e)
            {
                !0 === e[0].success ? n.element.querySelector(".text").innerHTML = _("Wurde hergestellt") : n.element.querySelector(".text").innerHTML = _("Fehler"), setTimeout(function ()
                {
                    n.element.querySelector(".text").innerHTML = _("Lernbereitschaft")
                }, 1e3)
            })
        }.bind(this));
        var t = new inputButton(
        {
            label: _("Auslernbereitschaft"),
            class: ["warn", "dynamic-size", "force-border", "no-icon-border"],
            icon: "remove"
        });
        t.handle(function ()
        {
            this.model.remote([
            {
                deviced: "item_set_feature",
                params:
                {
                    item_id: e.id,
                    feature: "unlinkable",
                    value: 1
                }
            }]).on(function (e)
            {
                !0 === e[0].success ? t.element.querySelector(".text").innerHTML = _("Wurde hergestellt") : t.element.querySelector(".text").innerHTML = _("Fehler"), setTimeout(function ()
                {
                    t.element.querySelector(".text").innerHTML = _("Auslernbereitschaft")
                }, 1e3)
            })
        }.bind(this));
        var o = new inputButton(
        {
            label: _("Ansicht"),
            class: ["green", "dynamic-size", "force-border", "no-icon-border"],
            icon: "icon-draw"
        });
        o.handle(function ()
        {
            window.location.href = "#/select-presentation/" + centralControl.objectToURIComponent(e) + "/"
        });
        var r = new inputButton(
        {
            label: _("Empfänger ersetzen"),
            class: ["warn", "dynamic-size", "force-border", "no-icon-border"],
            icon: "icon-reboot"
        });
        r.handle(function ()
        {
            e.replace = !0, window.location.href = "#/learn/2/?i=" + centralControl.objectToURIComponent(e)
        });
        var i = new inputButton(
        {
            label: _("Empfänger löschen"),
            class: ["delete", "dynamic-size", "force-border", "no-icon-border"],
            icon: "remove"
        });
        if (i.handle(function ()
            {
                window.location.href = "#/unlearn/?i=" + centralControl.objectToURIComponent(e)
            }), "switch" === e.device_type && this.wrapper.content.appendChild(o.element), e.device_type && "knx-rf" === e.backend && (this.wrapper.content.appendChild(n.element), this.wrapper.content.appendChild(t.element)), "remote" === e.type && "sensor-motion" === e.remote_type)
        {
            var c = new inputButton(
            {
                label: _("Totzeit"),
                class: ["warn", "dynamic-size", "force-border", "no-icon-border"],
                icon: "icon-reboot"
            });
            c.handle(function ()
            {
                e.replace = !0, window.location.href = "#/device/sensor-options/" + centralControl.objectToURIComponent(e)
            }), this.wrapper.content.appendChild(c.element)
        }
        this.wrapper.content.appendChild(r.element), this.wrapper.content.appendChild(i.element), document.body.appendChild(this.head.element), this.head.attach(), document.body.appendChild(this.wrapper.element), this.wrapper.attach()
    },
    unload: function ()
    {
        this.head.destroy(), this.wrapper.destroy()
    }
});
centralControl.addRoute(
{
    path: "systeminfo/",
    loader: !0,
    load: function ()
    {
        this.timeInterval = !0, this.model.remote([
        {
            systemd: "net_if_info_read",
            params:
            {
                net_wifi: 0
            }
        },
        {
            systemd: "net_if_info_read",
            params:
            {
                net_wifi: 1
            }
        },
        {
            systemd: "info_hw_variant_read",
            params:
            {}
        },
        {
            systemd: "info_release_data_read",
            params:
            {}
        },
        {
            systemd: "info_hw_serialno_read",
            params:
            {}
        },
        {
            deviced: "deviced_get_info",
            params:
            {}
        },
        {
            systemd: "os_clock_read",
            params:
            {}
        },
        {
            systemd: "srv_fw_update",
            params:
            {
                action: "status"
            }
        }]).on(function (e)
        {
            function t()
            {
                !0 === this.timeInterval && setTimeout(function ()
                {
                    this.model.remote([
                    {
                        systemd: "os_clock_read"
                    }]).on(function (e)
                    {
                        o.innerHTML = _("Systemzeit") + ": " + e[0].date_day + "." + e[0].date_month + "." + e[0].date_year + " - " + e[0].time_hours + ":" + e[0].time_mins + " " + _("Uhr")
                    }), t.bind(this)
                }.bind(this), 6e4)
            }
            centralControl.loader.destroy();
            var n = new Date;
            n.setDate(e[6].date_day), n.setMonth(e[6].date_month), n.setYear(e[6].date_year), n.setHours(e[6].time_hours), n.setMinutes(e[6].time_mins);
            var r, a, i = n.format("dd.mm.yyyy - HH:MM"),
                d = document.createElement("div");
            d.classList.add("text-content"), r = "B-Tronic " + e[2].variant + "<br />(c) " + e[3].rcopy + "<br />by Becker Antriebe GmbH", a = document.createElement("p"), a.innerHTML = r, d.appendChild(a), r = _("Systemzeit") + ": " + i + " " + _("Uhr");
            var o = document.createElement("p");
            o.innerHTML = r, d.appendChild(o), t.bind(this)(), console.log(e[3]), r = _("Release Kanal") + ": " + e[7].channel + "<br />" + _("Version") + ": " + e[3].rcode + " - " + e[3].rdate, a = document.createElement("p"), a.innerHTML = r, d.appendChild(a), r = _("Seriennummer") + ": " + e[4].serialno, a = document.createElement("p"), a.innerHTML = r, d.appendChild(a), r = "", e[5].interfaces.forEach(function (e)
            {
                "virtual" !== e.backend_type && (r += e.backend_type + " Version: " + e.hw_version + "<br />")
            }), a = document.createElement("p"), a.innerHTML = r, d.appendChild(a), console.log(e[7]), e[0].ip ? (r = "IP: " + e[0].ip + "<br />eth0 mac: " + e[0].mac, a = document.createElement("p"), a.innerHTML = r, d.appendChild(a)) : e[1].ip && (r = "IP: " + e[1].ip + "<br />wlan0 mac: " + e[1].mac, a = document.createElement("p"), a.innerHTML = r, d.appendChild(a)), r = _("In diesem Gerät wird freie / OpenSource Software eingesetzt. Die Quelltexte können unter\nhttp://www.b-tronic.net/source/\nheruntergeladen werden. Auf Wunsch wird Becker Antriebe die Quelltexte auf CDROM zur Verfügung stellen. Hierfür kontaktieren Sie bitte\nsource@b-tronic.net"), a = document.createElement("p"), a.innerHTML = r, d.appendChild(a), this.wrapper.content.appendChild(d)
        }.bind(this)), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element), this.wrapper.attach(), this.head.attach()
    },
    unload: function ()
    {
        this.timeInterval = !1, this.wrapper.destroy(), this.head.destroy()
    }
});
centralControl.addRoute(
{
    path: "factory-reset/",
    loader: !0,
    load: function ()
    {
        this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        }), this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.model.remote([
        {
            systemd: "os_lang_locales_avail"
        },
        {
            systemd: "os_lang_locale_read"
        }]).on(function (e)
        {
            var t = document.createElement("label");
            t.classList.add("page-label"), t.textContent = _("Werkseinstellungen");
            var n = document.createElement("div");
            n.classList.add("text-content"), n.innerHTML = _("<b>Alle</b> Einstellungen werden zurückgesetzt!") + "<br />", n.innerHTML += _("Es wird eine Sicherheitskopie der Einstellungen angelegt.");
            var r = new inputButton(
            {
                label: _("Zurücksetzen aller Einstellungen"),
                class: ["delete", "dynamic-size", "no-icon-border"],
                icon: "remove"
            });
            r.handle(function ()
            {
                centralControl.invokeRoute("factory-reset/confirm/")
            }.bind(this)), this.wrapper.content.appendChild(t), this.wrapper.content.appendChild(n), this.wrapper.content.appendChild(r.element), centralControl.loader.destroy()
        }.bind(this)), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element), this.wrapper.attach(), this.head.attach()
    },
    unload: function ()
    {
        this.head.destroy(), this.wrapper.destroy()
    }
}).addRoute(
{
    path: "factory-reset/confirm/",
    load: function ()
    {
        var e = 0;
        this.wrapper = new structWrapper(
        {
            center_content: !0,
            overflow_y: !0
        }), this.head = new struct_head(
        {
            buttons: [
            {
                icon: "back",
                click:
                {
                    screen: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this),
                    mobile: function ()
                    {
                        centralControl.jumpBack()
                    }.bind(this)
                }
            }]
        });
        var t = new inputConfirm(
            {
                class: ["no-bg"],
                title: _("Wirklich fortfahren?"),
                buttons: [
                {
                    label: _("Zurücksetzen"),
                    icon: "sym-confirm",
                    class: ["green", "no-icon-border", "dynamic-size"]
                },
                {
                    label: _("Abbrechen"),
                    icon: "delete",
                    class: ["delete", "no-icon-border", "dynamic-size"]
                }],
                on: function (t)
                {
                    !0 === t ? (centralControl.loader.attach(), this.model.remote([
                    {
                        systemd: "hlf_factory_reset",
                        params:
                        {
                            forced: e
                        }
                    }]).on(function (t)
                    {
                        t[0].code ? (e = 1, n.classList.remove("hidden"), centralControl.loader.destroy()) : (centralControl.loader.destroy(), centralControl.invokeRoute("reboot/"))
                    })) : centralControl.jumpBack()
                }.bind(this)
            }),
            n = document.createElement("p");
        n.classList.add("struct-error-message"), n.classList.add("hidden"), n.innerHTML = _("Kein Speichermedium gefunden oder kein Speicherplatz verfügbar, es kann keine Sicherheitskopie erstellt werden!"), t.element.insertBefore(n, t.element.querySelector(".button.green")), this.wrapper.content.appendChild(t.element), this.wrapper.attach(), this.head.attach(), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.head.element)
    },
    unload: function ()
    {
        this.head.destroy(), this.wrapper.destroy()
    }
});
centralControl.initGlobalMenu = function ()
{
    this.wrapper = new structWrapper(
    {
        class: ["main-nav"]
    }), this.tile_grid = new structTiles(
    {
        collapse: !0,
        auto_collapse: !0,
        tiles: [
        {
            text: "Home",
            icon: "icon-becker",
            href: "#/favorites/",
            special: "home-button"
        },
        {
            text: _("Räume"),
            icon: "room",
            href: "#/control/rooms/"
        },
        {
            text: _("Gruppen"),
            icon: "group",
            href: "#/groups/"
        },
        {
            text: _("Szenarien"),
            icon: "scene",
            href: "#/scenes/"
        },
        {
            text: _("Kameras"),
            icon: "icon-camera",
            href: "#/cams/"
        },
        {
            text: _("Radios"),
            icon: "icon-music",
            href: "#/radios/"
        },
        {
            text: _("Einstellungen"),
            icon: "gear",
            href: "#/settings/"
        }]
    }), this.tile_grid.onClick(function ()
    {
        this.wrapper.element.classList.remove("force"), this.tile_grid.pop(), this.state = !1
    }.bind(this)), this.menu_button = document.createElement("div"), this.menu_button.setAttribute("id", "menu-button");
    var t = document.createElement("span");
    t.classList.add("rip"), this.menu_button.appendChild(t), t = document.createElement("span"), t.classList.add("rip"), this.menu_button.appendChild(t), t = document.createElement("span"), t.classList.add("rip"), this.menu_button.appendChild(t), document.createElement("div").classList.add("bg"), this.wrapper.content.appendChild(this.tile_grid.element), document.body.appendChild(this.wrapper.element), document.body.appendChild(this.menu_button), this.state = !1, this.menu_button.addEventListener("click", function ()
    {
        !1 === this.state ? (this.wrapper.element.classList.add("force"), this.tile_grid.pop(), this.state = !0) : (this.wrapper.element.classList.remove("force"), this.tile_grid.pop(), this.state = !1)
    }.bind(this))
}, centralControl.make_bubble = function (t, e, n, r, a)
{
    var o = document.createElement("div");
    o.classList.add("bubble");
    var i, s, c;
    return n <= 15 ? (i = "rgba(0,0,0," + e + ")", s = "rgba(0,0,0," + 1.2 * e + ")", c = 1) : n > 15 && (i = "rgba(255,255,255," + e + ")", s = "rgba(255,255,255," + 1.2 * e + ")", c = 2), r <= 30 ? (o.style.boxShadow = "0 0 30px 15px rgba(255,255,255," + 2 * e + ")", r *= 1.5, n *= 2, i = "rgba(255,255,255," + 2 * e + ")", s = "rgba(0,0,0,0)", c = 2) : r >= 42 && (o.style.boxShadow = "0 0 30px 15px rgba(0,0,0," + e + ")", r *= .75, n /= 2, i = "rgba(0,0,0," + e + ")", s = "rgba(0,0,0,0)", c = 1), o.style.background = i, o.style.border = "2px solid " + s, o.style.width = n + "vw", o.style.height = n + "vw", o.style.zIndex = c, o.style.opacity = e, a ? o.style.transform = "translate3d(" + Math.round(t - n / 2) + "vw," + Math.round(a - n / 2) + "vh,0)" : (o.style.cssText += "transition: transform " + r + "s linear !important", o.style.transform = "translate3d(" + Math.round(t - n / 2) + "vw,100vh,0)"), "circle" === centralControl.theme.shape ? o.style.borderRadius = "1000px" : o.style.borderRadius = "0", o
}, centralControl.move_bubble = function (t, e, n, r)
{
    t.style.transform = "translate3d(" + Math.round(e - r / 2) + "vw, -" + r + "vw, 0)", setTimeout(function ()
    {
        window.requestAnimationFrame(function ()
        {
            t.parentNode.removeChild(t)
        })
    }, 1e3 * n)
}, centralControl.bake_background = function ()
{
    for (var t = 0; t < 100; t++) centralControl.background_wrapper.appendChild(this.make_bubble(Math.floor(100 * Math.random()), Math.floor(21 * Math.random() + 10) / 100, Math.floor(11 * Math.random() + 10), Math.floor(21 * Math.random() + 30), Math.floor(100 * Math.random())))
}, centralControl.background_interval = function (t)
{
    elm = document.createElement("div"), void 0 !== this.background_wrapper && !0 !== this.theme.changed || (this.background_wrapper = document.createElement("div"), this.background_wrapper.classList.add("background-wrapper"), document.body.appendChild(this.background_wrapper)), null === centralControl.interval_background_interval && centralControl.intervalRunner.bind(centralControl)(!0), centralControl.interval_background_interval = setInterval(centralControl.intervalRunner.bind(centralControl), 600)
}, centralControl.interval_background_interval = null, centralControl.intervalRunner = function (t)
{
    if (void 0 === elm.style.animationName && (this.theme.static_background_color = !0), !0 === this.theme.changed && (this.background_wrapper.parentNode.removeChild(this.background_wrapper), this.background_wrapper = document.createElement("div"), this.background_wrapper.classList.add("background-wrapper"), this.background_wrapper.style.opacity = this.theme.opacity, document.body.appendChild(this.background_wrapper)), !1 === this.theme.transitions ? document.body.classList.add("no-animation") : document.body.classList.remove("no-animation"), !0 !== this.theme.static_background && !0 !== this.theme.static_background_color)
    {
        var e = Math.floor(100 * Math.random()),
            n = Math.floor(21 * Math.random() + 10) / 100,
            r = Math.floor(11 * Math.random() + 10),
            a = Math.floor(21 * Math.random() + 30),
            o = this.make_bubble(e, n, r, a);
        window.requestAnimationFrame(function ()
        {
            centralControl.background_wrapper.appendChild(o), centralControl.setBackground(), window.requestAnimationFrame(function ()
            {
                centralControl.move_bubble(o, e, a, r)
            })
        })
    }
    else !0 === this.theme.static_background && (!0 === this.theme.static_background_instantiated || !0 === this.theme.static_background_color ? this.setBackground() : (this.theme.static_background_instantiated = !0, this.setBackground(), this.bake_background()));
    this.theme.changed = !1
}, centralControl.setBackground = function ()
{
    document.body.style.backgroundColor = "hsl(" + centralControl.theme.color.hue + "," + centralControl.theme.color.saturation + "%," + centralControl.theme.color.brightness + "%)"
}, centralControl.theme = {
    static_background: !0,
    shape: "circle",
    background_opacity: 1,
    changed: !1,
    opactiy: 1,
    theme_version: 1,
    static_background_instantiated: !1,
    static_background_color: !1,
    transitions: !0,
    color:
    {
        hue: 205,
        saturation: 100,
        brightness: 30
    },
    favorites_grid: [1, 1, 1, 1, 1, 1]
};
centralControl.itemToValueOptions = function (e)
{
    if (console.log("ITEM TO VALUE OPTIONS", e), "virtual" === e.backend) return [
    {
        text: _("An / Aus"),
        icon: "icon-internal-object",
        value:
        {
            icon: "icon-internal-object",
            name: "value",
            type: "switch",
            values: [_("Aus"), _("An")],
            command: "value",
            allow_hysteresis: !0
        }
    }];
    if ("remote" === e.type && "shutter" === e.remote_type) return [
    {
        text: _("Auf"),
        icon: "ctrl-up",
        value:
        {
            icon: "ctrl-up",
            name: "up",
            type: "static",
            command: "up",
            allow_hysteresis: !1
        }
    },
    {
        text: _("Stop"),
        icon: "ctrl-stop",
        value:
        {
            icon: "ctrl-stop",
            name: "stop",
            type: "static",
            command: "stop",
            allow_hysteresis: !1
        }
    },
    {
        text: _("Ab"),
        icon: "ctrl-down",
        value:
        {
            icon: "ctrl-down",
            name: "down",
            type: "static",
            command: "down",
            allow_hysteresis: !1
        }
    },
    {
        text: _("Zwischenposition 1"),
        icon: "sym-digit-1",
        value:
        {
            icon: "sym-digit-1",
            name: "pos1",
            type: "static",
            command: "pos1",
            allow_hysteresis: !1
        }
    },
    {
        text: _("Zwischenposition 2"),
        icon: "sym-digit-2",
        value:
        {
            icon: "sym-digit-2",
            name: "pos2",
            type: "static",
            command: "pos2",
            allow_hysteresis: !1
        }
    }];
    if ("remote" === e.type && "switch" === e.remote_type) return [
    {
        text: _("An"),
        icon: "icon-play",
        value:
        {
            icon: "icon-play",
            name: "on",
            type: "static",
            command: "on",
            allow_hysteresis: !1
        }
    },
    {
        text: _("Aus"),
        icon: "icon-stop",
        value:
        {
            icon: "icon-stop",
            name: "off",
            type: "static",
            command: "off",
            allow_hysteresis: !1
        }
    }];
    if ("remote" === e.type && "shutter" !== e.remote_type)
    {
        if ("sensor-temperature" === e.remote_type) return [
        {
            text: _("Temperatur"),
            icon: "sym-thermometer",
            value:
            {
                icon: "sym-thermometer",
                name: "value-temp",
                command: "value-temp",
                type: "range",
                allow_hysteresis: !0,
                division: 41
            }
        }];
        if ("sensor-sun-glass" === e.remote_type) return [
        {
            text: _("Alarm / Aus"),
            icon: "broken-glass",
            value:
            {
                icon: "broken-glass",
                name: "value-glass",
                command: "value-glass",
                value: 0,
                values: [_("Bruch"), _("Aus")],
                type: "switch",
                allow_hysteresis: !1,
                class: ["broken-glass"]
            }
        }];
        if ("sensor-open" === e.remote_type) return [
        {
            text: _("Geöffnet / Geschlossen"),
            icon: "icon-window-open",
            value:
            {
                icon: sensorTypeToIconName("open"),
                name: "value",
                command: "value",
                value: 0,
                values: [_("Geschlossen"), _("Offen")],
                type: "switch",
                allow_hysteresis: !0
            }
        }];
        if ("sensor-smoke" === e.remote_type) return [
        {
            text: _("Feuer"),
            icon: sensorTypeToIconName("smoke"),
            value:
            {
                icon: sensorTypeToIconName("smoke"),
                name: "value",
                command: "value",
                type: "switch",
                values: [_("Kein Alarm"), _("Alarm")],
                allow_hysteresis: !1
            }
        }];
        if ("sensor-sun-wind-rain" === e.remote_type) return [
        {
            text: _("Sonne"),
            icon: sensorTypeToIconName("sun"),
            value:
            {
                icon: sensorTypeToIconName("sun"),
                name: "value-sun",
                command: "value-sun",
                type: "range",
                allow_hysteresis: !0,
                division: 16
            }
        },
        {
            text: _("Wind"),
            icon: sensorTypeToIconName("wind"),
            value:
            {
                icon: sensorTypeToIconName("wind"),
                name: "value-wind",
                command: "value-wind",
                type: "range",
                allow_hysteresis: !0,
                division: 12,
                class: ["wind"]
            }
        },
        {
            text: _("Regen"),
            icon: sensorTypeToIconName("rain"),
            value:
            {
                icon: sensorTypeToIconName("rain"),
                name: "value-rain",
                command: "value-rain",
                values: [_("Kein Regen"), _("Regen")],
                type: "switch",
                allow_hysteresis: !0
            }
        }];
        if ("sensor-sun-wind" === e.remote_type) return [
        {
            text: _("Sonne"),
            icon: sensorTypeToIconName("sun"),
            value:
            {
                icon: sensorTypeToIconName("sun"),
                name: "value-sun",
                command: "value-sun",
                type: "range",
                allow_hysteresis: !0,
                division: 16
            }
        },
        {
            text: _("Wind"),
            icon: sensorTypeToIconName("wind"),
            value:
            {
                icon: sensorTypeToIconName("wind"),
                name: "value-wind",
                command: "value-wind",
                type: "range",
                allow_hysteresis: !0,
                division: 12,
                class: ["wind"]
            }
        }];
        if ("sensor-sun" === e.remote_type) return [
        {
            text: _("Sonne"),
            icon: sensorTypeToIconName("sun"),
            value:
            {
                icon: sensorTypeToIconName("sun"),
                name: "value-sun",
                command: "value-sun",
                type: "range",
                allow_hysteresis: !0,
                division: 16
            }
        }];
        if ("sensor-wind" === e.remote_type) return [
        {
            text: _("Wind"),
            icon: sensorTypeToIconName("wind"),
            value:
            {
                icon: sensorTypeToIconName("wind"),
                name: "value-wind",
                command: "value-wind",
                type: "range",
                allow_hysteresis: !0,
                division: 12,
                class: ["wind"]
            }
        }];
        if ("sensor-motion" === e.remote_type || "sensor-presence" === e.remote_type) return [
        {
            text: _("Bewegung"),
            icon: "icon-motion",
            value:
            {
                icon: "icon-motion",
                name: "value",
                command: "value",
                values: [_("Ruhe"), _("Bewegung")],
                type: "switch",
                allow_hysteresis: !1
            }
        }]
    }
    else
    {
        if ("group" === e.type && !0 === e.feedback) return "shutter" === e.device_type ? [
        {
            text: _("Wert"),
            icon: "device-" + e.device_type,
            value:
            {
                icon: "device-" + e.device_type,
                name: "value",
                command: "value",
                type: "range",
                allow_hysteresis: !0,
                division: 101
            }
        }] : "screen" === e.device_type ? [
        {
            text: _("Screen"),
            icon: "device-screen",
            value:
            {
                icon: "device-switch",
                name: "value",
                command: "value",
                values: [_("Aus"), _("An")],
                type: "range",
                allow_hysteresis: !0
            }
        }] : "switch" === e.device_type ? [
        {
            text: _("Schalter"),
            icon: "device-switch",
            value:
            {
                icon: "device-switch",
                name: "value",
                command: "value",
                values: [_("Aus"), _("An")],
                type: "switch",
                allow_hysteresis: !0
            }
        }] : "dimmer" === e.device_type ? [
        {
            text: _("Wert"),
            icon: "device-dimmer",
            value:
            {
                icon: "device-dimmer",
                name: "value",
                command: "value",
                type: "range",
                division: 100,
                allow_hysteresis: !0
            }
        },
        {
            text: _("Schalter"),
            icon: "device-dimmer",
            value:
            {
                icon: "device-dimmer",
                name: "switch",
                command: "value",
                values: [_("Aus"), _("An")],
                type: "switch",
                allow_hysteresis: !0
            }
        }] : "thermostat" === e.device_type ? [
        {
            text: _("Wert"),
            icon: "device-" + e.device_type,
            value:
            {
                icon: "device-" + e.device_type,
                name: "value",
                command: "value",
                type: "range",
                allow_hysteresis: !0,
                division: 101
            }
        }] : "roof-window" === e.device_type ? [
        {
            text: _("Dachfenster"),
            icon: "device-roof-window",
            value:
            {
                icon: "device-roof-window",
                name: "value",
                command: "value",
                type: "range",
                allow_hysteresis: !0,
                division: 101
            }
        }] : "awning" === e.device_type ? [
        {
            text: _("Wert"),
            icon: "device-" + e.device_type,
            value:
            {
                icon: "device-" + e.device_type,
                name: "value",
                command: "value",
                type: "range",
                allow_hysteresis: !0,
                division: 101
            }
        }] : "sun-sail" === e.device_type ? [
        {
            text: _("Wert"),
            icon: "device-" + e.device_type,
            value:
            {
                icon: "device-" + e.device_type,
                name: "value",
                command: "value",
                type: "range",
                allow_hysteresis: !0,
                division: 101
            }
        }] : "venetian" === e.device_type ? [
        {
            text: _("Wert"),
            icon: "device-" + e.device_type,
            value:
            {
                icon: "device-" + e.device_type,
                name: "value",
                command: "value",
                type: "range",
                allow_hysteresis: !0,
                division: 101
            }
        }] : "door" === e.device_type ? [
        {
            text: _("Wert"),
            icon: "device-" + e.device_type,
            value:
            {
                icon: "device-" + e.device_type,
                name: "value",
                command: "value",
                type: "range",
                allow_hysteresis: !0,
                division: 101
            }
        }] : [
        {
            text: _("???"),
            icon: "icon-unknown",
            name: "value",
            command: "value",
            type: "range",
            allow_hysteresis: !0,
            division: 100
        }];
        if ("group" === e.type && !1 === e.feedback)
        {
            var n = "";
            return n = "tilt-window" === e.device_type ? "icon-window-open" : "door-opener" === e.device_type ? "sym-door" : "device-" + e.device_type, [
            {
                text: _("Wert"),
                icon: n,
                value:
                {
                    icon: "device-" + e.device_type,
                    name: "value",
                    command: "value",
                    type: "range",
                    allow_hysteresis: !0,
                    division: 101
                }
            }]
        }
        if ("radio" === e.type) return [
        {
            text: _("Radio"),
            icon: "icon-music",
            value:
            {}
        }];
        if ("scene" === e.type) return [
        {
            text: _("Szenario"),
            icon: "scene",
            value:
            {}
        }]
    }
};
centralControl.commandToIcon = function (o, t)
{
    if ("move" === o.command && -1 === o.value)
    {
        var e;
        return e = "sun-sail" === t.device_type ? _("Einfahren") : _("Auf"),
        {
            icon: "ctrl-up",
            text: e
        }
    }
    if ("move" === o.command && 1 === o.value)
    {
        var e;
        return e = "sun-sail" === t.device_type ? _("Ausfahren") : _("Ab"),
        {
            icon: "ctrl-down",
            text: e
        }
    }
    return "moveto" === o.command || "dimto" === o.command || "tempset" === o.command || "tilt" === o.command ?
    {
        icon: "icon-target-value"
    } : "switch" === o.command && 0 === o.value ?
    {
        icon: "sym-switch-off",
        text: _("Aus")
    } : "switch" === o.command && 1 === o.value ?
    {
        icon: "sym-switch-off",
        text: _("An")
    } : "invoke" === o.command ?
    {
        icon: "icon-play"
    } : "stop" === o.command ?
    {
        icon: "icon-stop"
    } : "start" === o.command ? t.station_id ?
    {
        icon: "icon-music"
    } :
    {
        icon: "icon-play"
    } : "movepreset" === o.command ? (console.log(o.value, t), "roof-window" === t.device_type && 2 === o.value ?
    {
        icon: "sym-shamrock",
        text: _("Lüftung")
    } : "heater" === t.device_type ? 1 === o.value ?
    {
        icon: "item-clock",
        text: _("Automatik 120min.")
    } :
    {
        icon: "item-clock",
        text: _("Automatik 60min.")
    } :
    {
        icon: "sym-digit-" + o.value,
        text: _("Pos.") + o.value
    }) : "dimpreset" === o.command ? 1 === o.value ?
    {
        icon: "sym-digit-1",
        text: _("Zwischenposition 1")
    } :
    {
        icon: "sym-digit-2",
        text: _("Zwischenposition 2")
    } : "step" === o.command ?
    {
        icon: "sym-switch-off",
        text: _("Schalten")
    } : "tempmode" === o.command ? 2 === o.value ?
    {
        icon: "sym-house-inside",
        text: _("Komfort")
    } : 3 === o.value ?
    {
        icon: "sym-house-outside",
        text: _("Eco")
    } : 1 === o.value ?
    {
        icon: "icon-freeze",
        text: _("Frostschutz")
    } :
    {
        icon: "icon-target-value",
        text: _("Zielwert")
    } : void 0
};
centralControl.item_list_genarator = function (e, t)
{
    var s = [
        {
            deviced: "deviced_get_item_list"
        },
        {
            systemd: "radio_station_list_get"
        }],
        o = e.get("id");
    e.remote([
    {
        deviced: "deviced_get_item_list",
        params:
        {
            list_type: "groups"
        }
    }]).on(function (t)
    {
        e.set("groups", t[0].item_list), e.set("ready", !0)
    }), e.remote(s).on(function (s)
    {
        var i = [],
            c = void 0 !== s[1] ? s[1].station_list : [],
            n = s[0].item_list || [],
            r = [],
            a = [],
            p = [],
            d = [],
            m = [],
            u = [],
            h = [],
            _ = [],
            y = [],
            f = [],
            l = [],
            v = [],
            g = [],
            k = [];
        n.forEach(function (e)
        {
            "virtual" === e.backend ? d.push(e) : "remote" !== e.type || "shutter" !== e.remote_type && "switch" !== e.remote_type ? "remote" === e.type && "shutter" !== e.remote_type && "switch" !== e.remote_type ? u.push(e) : "group" === e.type && e.backend && "knx-rf" === e.backend ? "thermostat" !== e.device_type ? a.push(e) : k.push(e) : "group" !== e.type || e.backend || "thermostat" === e.device_type ? "group" !== e.type || e.backend || "thermostat" !== e.device_type ? "group" === e.type && e.backend && "centronic" === e.backend ? p.push(e) : "command" === e.type ? h.push(e) : "commandset" === e.type ? _.push(e) : "condition" === e.type ? y.push(e) : "logic" === e.type ? r.push(e) : "scene" === e.type ? l.push(e) : "room" === e.type ? v.push(e) : "clock" === e.type ? i.push(e) : console.log("???", e) : g.push(e) : f.push(e) : m.push(e)
        }), e.set("receivers", a), e.set("internal_objects", d), e.set("sensors", u), e.set("remotes", m), e.set("radios", c), e.set("receivers_no_feedback", p), e.set("groups", f), e.set("scenes", l), e.set("rooms", v), e.set("commandsets", _), e.set("logics", r), e.set("conditions", y), e.set("clocks", i), e.set("climate_zones", g), e.set("thermostats", k);
        var b = [];
        l.concat(i).forEach(function (e)
        {
            e.id === o && _.forEach(function (t)
            {
                void 0 !== e.items && void 0 !== e.items[0] && void 0 !== t.items && e.items[0] === t.id && t.items.forEach(function (e)
                {
                    h.forEach(function (t)
                    {
                        e === t.id && (n.forEach(function (e)
                        {
                            e.id === t.items[0] && "deviced" === t.target && b.push(
                            {
                                action: t,
                                item: e
                            })
                        }), c.forEach(function (e)
                        {
                            e.station_id === t.items[0] && "systemd" === t.target && b.push(
                            {
                                action: t,
                                item: e
                            })
                        }))
                    })
                })
            })
        }), t(), e.set("bound-commands", b), e.set("ready", !0)
    })
};
centralControl.getItemOptions = function (e)
{
    if (console.log("GET ITEM OPTIONS", e), "scene" === e.type) return [
    {
        text: _("Szenario auslösen"),
        icon: "icon-play",
        value:
        {
            command: "invoke"
        }
    },
    {
        text: _("Szenario stoppen"),
        icon: "icon-stop",
        value:
        {
            command: "stop"
        }
    }];
    if ("radio" === e.type) return [
    {
        text: _("An"),
        icon: "icon-music",
        value:
        {
            command: "start"
        }
    },
    {
        text: _("Aus"),
        icon: "icon-stop",
        value:
        {
            command: "stop"
        }
    }];
    if ("switch" === e.device_type) return [
    {
        text: _("An"),
        icon: "sym-switch-off",
        value:
        {
            command: "switch",
            value: 1
        }
    },
    {
        text: _("Aus"),
        icon: "sym-switch-off",
        value:
        {
            command: "switch",
            value: 0
        }
    }];
    if ("heater" === e.device_type) return [
    {
        text: _("An"),
        icon: "sym-switch-off",
        value:
        {
            command: "switch",
            value: 1
        }
    },
    {
        text: _("Aus"),
        icon: "sym-switch-off",
        value:
        {
            command: "switch",
            value: 0
        }
    },
    {
        text: _("Automatik 120min"),
        icon: "item-clock",
        value:
        {
            command: "movepreset",
            value: 1
        }
    },
    {
        text: _("Automatik 60min"),
        icon: "item-clock",
        value:
        {
            command: "movepreset",
            value: 2
        }
    }];
    if ("shutter" === e.device_type || "shutter-foldout" === e.device_type || "shutter-blinds" === e.device_type || "roof-window" === e.device_type || "awning" === e.device_type || "screen" === e.device_type || "sun-sail" === e.device_type || "venetian" === e.device_type)
    {
        var t = [
        {
            text: _("Auf"),
            icon: "ctrl-up",
            value:
            {
                command: "move",
                value: -1
            }
        },
        {
            text: _("Stop"),
            icon: "ctrl-stop",
            value:
            {
                command: "stop"
            }
        },
        {
            text: _("Ab"),
            icon: "ctrl-down",
            value:
            {
                command: "move",
                value: 1
            }
        },
        {
            text: _("Zwischenposition 1"),
            icon: "sym-digit-1",
            value:
            {
                command: "movepreset",
                value: 1
            }
        }];
        return "roof-window" === e.device_type ? t.push(
        {
            text: _("Lüftung"),
            icon: "sym-shamrock",
            value:
            {
                command: "movepreset",
                value: 2
            }
        }) : t.push(
        {
            text: _("Zwischenposition 2"),
            icon: "sym-digit-2",
            value:
            {
                command: "movepreset",
                value: 2
            }
        }), !0 !== e.feedback && "knx-rf" !== e.backend || (t.push(
        {
            text: _("Sollwert"),
            icon: "icon-target-value",
            value:
            {
                command: "moveto"
            }
        }), "venetian" === e.device_type && t.push(
        {
            text: _("Wendung"),
            icon: "icon-target-value",
            value:
            {
                command: "tilt"
            }
        })), "sun-sail" === e.device_type ? [
        {
            text: _("Einfahren"),
            icon: sensorTypeToIconName("up"),
            value:
            {
                command: "move",
                value: -1
            }
        },
        {
            text: _("Stop"),
            icon: "ctrl-stop",
            value:
            {
                command: "stop"
            }
        },
        {
            text: _("Ausfahren"),
            icon: sensorTypeToIconName("down"),
            value:
            {
                command: "move",
                value: 1
            }
        },
        {
            text: _("Zwischenposition 1"),
            icon: "sym-digit-1",
            value:
            {
                command: "movepreset",
                value: 1
            }
        },
        {
            text: _("Zwischenposition 2"),
            icon: "sym-digit-2",
            value:
            {
                command: "movepreset",
                value: 2
            }
        },
        {
            text: _("Sollwert"),
            icon: "icon-target-value",
            value:
            {
                command: "dimto"
            }
        }] : t
    }
    if ("dimmer" === e.device_type)
    {
        var t = [
        {
            text: _("An"),
            icon: "sym-switch-off",
            value:
            {
                command: "switch",
                value: 1
            }
        },
        {
            text: _("Aus"),
            icon: "sym-switch-off",
            value:
            {
                command: "switch",
                value: 0
            }
        },
        {
            text: _("Zwischenposition 1"),
            icon: "sym-digit-1",
            value:
            {
                command: "dimpreset",
                value: 1
            }
        },
        {
            text: _("Zwischenposition 2"),
            icon: "sym-digit-2",
            value:
            {
                command: "dimpreset",
                value: 2
            }
        }];
        return !0 !== e.feedback && "knx-rf" !== e.backend || t.push(
        {
            text: _("Sollwert"),
            icon: "icon-target-value",
            value:
            {
                command: "dimto"
            }
        }), t
    }
    return "door-pulse" === e.device_type ? [
    {
        text: _("Senden"),
        icon: "device-switch",
        value:
        {
            command: "step"
        }
    }] : "thermostat" === e.device_type ? [
    {
        text: _("Frostschutz"),
        icon: "icon-freeze",
        value:
        {
            command: "tempmode",
            value: 1
        }
    },
    {
        text: _("Komfort"),
        icon: "sym-house-inside",
        value:
        {
            command: "tempmode",
            value: 2
        }
    },
    {
        text: _("Eco"),
        icon: "sym-house-outside",
        value:
        {
            command: "tempmode",
            value: 3
        }
    },
    {
        text: _("Individual-Temperatur"),
        icon: "icon-target-value",
        value:
        {
            command: "tempset"
        }
    }] : "door" === e.device_type ? [
    {
        text: _("Auf"),
        icon: sensorTypeToIconName("up"),
        value:
        {
            command: "move",
            value: -1
        }
    },
    {
        text: _("Ab"),
        icon: sensorTypeToIconName("down"),
        value:
        {
            command: "move",
            value: 1
        }
    }] : "sun-sail" === e.device_type ? [
    {
        text: _("Einfahren"),
        icon: sensorTypeToIconName("up"),
        value:
        {
            command: "move",
            value: 1
        }
    },
    {
        text: _("Stop"),
        icon: "ctrl-stop",
        value:
        {
            command: "stop"
        }
    },
    {
        text: _("Ausfahren"),
        icon: sensorTypeToIconName("down"),
        value:
        {
            command: "move",
            value: -1
        }
    },
    {
        text: _("Zwischenposition 1"),
        icon: "sym-digit-1",
        value:
        {
            command: "movepreset",
            value: 1
        }
    },
    {
        text: _("Zwischenposition 2"),
        icon: "sym-digit-2",
        value:
        {
            command: "movepreset",
            value: 2
        }
    }] : "tilt-window" === e.device_type ? [
    {
        text: _("Auf"),
        icon: "icon-window-open",
        value:
        {
            command: "move",
            value: -1
        }
    },
    {
        text: _("Zu"),
        icon: "icon-window-closed",
        value:
        {
            command: "move",
            value: 1
        }
    }] : "door-opener" === e.device_type ? [
    {
        text: _("Auf"),
        icon: "sym-door",
        value:
        {
            command: "step",
            value: 1
        }
    }] : []
};

function itemControl(t)
{
    function r()
    {
        var r = document.createElement("div");
        return r.classList.add("cam"), r.style.backgroundImage = "url(" + t.target[0].url + ")", r
    }

    function o()
    {
        var r = t.color,
            o = a(e(d(t.color, .4)), 1),
            n = a(e(d(t.color, 0)), .6),
            c = a(e(d(t.color, -.4)), .2),
            i = a(e(d(t.color, -.6)), .2);
        parseInt(t.color.substring(1, 3), 16), parseInt(t.color.substring(3, 5), 16), parseInt(t.color.substring(5, 7), 16);
        return {
            color: r,
            color_bright: o,
            color_dark: n,
            color_darker: c,
            color_darkest: i
        }
    }

    function a(t, r)
    {
        return "rgba(" + t.r + "," + t.g + "," + t.b + "," + r + ")"
    }

    function e(t)
    {
        var r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);
        return r ?
        {
            r: parseInt(r[1], 16),
            g: parseInt(r[2], 16),
            b: parseInt(r[3], 16)
        } : null
    }

    function d(t, r)
    {
        var o = parseInt(t.slice(1), 16),
            a = r < 0 ? 0 : 255,
            e = r < 0 ? -1 * r : r,
            d = o >> 16,
            n = o >> 8 & 255,
            c = 255 & o;
        return "#" + (16777216 + 65536 * (Math.round((a - d) * e) + d) + 256 * (Math.round((a - n) * e) + n) + (Math.round((a - c) * e) + c)).toString(16).slice(1)
    }
    var n = {
        up_stop_down: '<svg width="37.4" height="100" viewBox="0 0 37.390999 100"><rect id="vis-border" width="35.7" height="98.3" x=".9" y=".9" ry="17.8" fill-opacity="0" stroke="#fff" stroke-width="1.7"/><path d="M18.7 11.3l-.4.6L10 24h17.4l-8.7-13zm0 1.7l7 10.2h-14l7-10.2z" id="vis-up" fill="#fff"/><path d="M10 42.2v15.5h17.3V42.3H10zm1 1h15.3V57H11V43z" id="vis-stop" fill="#fff"/><path d="M10 74.4l8.7 12.8.4-.6 8.6-12.2H10zm1.8 1h13.8l-7 10-6.8-10z" id="vis-down" fill="#fff"/><path d="M10 42.2v15.5h17.3V42.3z" id="hitbox-stop" color="#000" fill-opacity="0"/><path d="M18.7 11.3l-.4.6L10 24h17.4z" id="hitbox-up" color="#000" fill-opacity="0"/><path d="M18.7 87.2l-.4-.6L10 74.4h17.4z" id="hitbox-down" color="#000" fill-opacity="0"/></svg>'
    };
    return {
        element: function ()
        {
            var a = document.createElement("div");
            if (a.classList.add("struct-item-control"), "show-webcam" === t.commands[0].command) a.appendChild(r()), a.classList.add("control-webcam");
            else if ("show-receiver" === t.commands[0].command)
            {
                var e = document.createElement("div");
                e.classList.add("control-container"), e.innerHTML = n.up_stop_down, a.classList.add("control-receiver"), a.appendChild(e)
            }
            else "show-radio" === t.commands[0].command ? a.classList.add("control-radio") : a.classList.add("control-icon");
            var d = document.createElement("div");
            d.classList.add("icon-container");
            var c = document.createElement("div");
            c.classList.add("struct-icon"), c.classList.add(t.commands[0].icon), c.classList.add("struct-fav");
            var i = document.createElement("p");
            i.classList.add("text"), i.textContent = t.name;
            var l = o();
            return a.style.background = "linear-gradient(to bottom right, " + l.color_dark + ", " + l.color_darker + ")", d.appendChild(c), c.appendChild(i), a.appendChild(d),
            {
                core_wrapper: a
            }
        }().core_wrapper
    }
}
var __ICONLIST = ["icon.feedback.bewegung1.0", "icon.feedback.bewegung1.1", "icon.feedback.fenster1.0", "icon.feedback.fenster1.1", "icon.feedback.fenster2.0", "icon.feedback.fenster2.1", "icon.feedback.fenster3.0", "icon.feedback.fenster3.1", "icon.feedback.fenster4.0", "icon.feedback.fenster4.1", "icon.feedback.fensterkontakt1", "icon.feedback.hoftor1.0", "icon.feedback.hoftor1.1", "icon.feedback.lampe1.0", "icon.feedback.lampe1.1", "icon.feedback.rauchmelder1.0", "icon.feedback.rauchmelder1.1", "icon.feedback.rauchmelder1", "icon.feedback.sonne-wind-regen1", "icon.feedback.sonne-wind1", "icon.feedback.sonne1", "icon.feedback.stehlampe1.0", "icon.feedback.stehlampe1.1", "icon.feedback.temperatur1", "icon.feedback.temperatur2", "icon.letter.1a", "icon.letter.1b", "icon.letter.1c", "icon.letter.1d", "icon.letter.1e", "icon.letter.1f", "icon.letter.1g", "icon.letter.1h", "icon.letter.1i", "icon.letter.1j", "icon.letter.1k", "icon.letter.1l", "icon.letter.1m", "icon.letter.1n", "icon.letter.1o", "icon.letter.1p", "icon.letter.1q", "icon.letter.1r", "icon.letter.1s", "icon.letter.1u", "icon.letter.1v", "icon.letter.1w", "icon.letter.1x", "icon.letter.1y", "icon.letter.1z", "icon.number.0", "icon.number.1", "icon.number.2", "icon.number.3", "icon.number.4", "icon.number.5", "icon.number.6", "icon.number.7", "icon.number.8", "icon.number.9", "icon.receiver.switch.on-off-breit1.0", "icon.receiver.switch.on-off-breit1.1", "icon.receiver.switch.on-off-schmal1.0", "icon.receiver.switch.on-off-schmal1.1", "icon.receiver.switch.schloss-gruen1.0", "icon.receiver.switch.schloss-gruen1.1", "icon.receiver.switch.schloss-rot1.0", "icon.receiver.switch.schloss-rot1.1", "icon.receiver.switch.schnee1", "icon.receiver.switch.sonne.wolken1.0", "icon.receiver.switch.sonne.wolken1.1", "icon.receiver.switch.sonne1", "icon.receiver.switch.wind1.0", "icon.receiver.switch.wind1.1", "icon.room.bad1", "icon.room.bad2", "icon.room.buegeln1", "icon.room.buero1", "icon.room.dach1", "icon.room.essen1", "icon.room.essen2", "icon.room.fitness1", "icon.room.fitness2", "icon.room.flur1", "icon.room.garage1", "icon.room.garage2", "icon.room.garten1", "icon.room.garten2", "icon.room.garten3", "icon.room.garten4", "icon.room.kind1", "icon.room.kind2", "icon.room.kind3", "icon.room.kueche1", "icon.room.kueche2", "icon.room.raum1", "icon.room.schlafen1", "icon.room.schlafen2", "icon.room.schlafen3", "icon.room.schlafen4", "icon.room.schwimmen1", "icon.room.terrasse1", "icon.room.terrasse2", "icon.room.terrasse3", "icon.room.terrasse4", "icon.room.tisch1", "icon.room.tisch2", "icon.room.tuer1", "icon.room.tuer2", "icon.room.tuer3", "icon.room.tuer4", "icon.room.tuer5", "icon.room.tv1", "icon.room.waschen1", "icon.room.wohnen1", "icon.scene.flasche1", "icon.scene.flasche2", "icon.scene.glas1", "icon.scene.mond1", "icon.scene.regen1", "icon.scene.regen2", "icon.scene.schloss1", "icon.scene.schloss2", "icon.scene.schloss3", "icon.scene.schloss4", "icon.scene.sonne1", "icon.scene.stern1", "icon.scene.stern2", "icon.scene.tuer1", "icon.scene.tuer2", "icon.scene.tuer3", "icon.scene.tuer4", "icon.scene.universal1", "icon.scene.universal2", "icon.scene.wind1", "icon.scene.wind2", "icon.scene.wind3", "icon.scene.wolken1", "icon.scene.wolken2", "icon.scene.wolken3", "icon.scene.wolken4", "icon.scene.wolken5"];
var App = {};
! function (e)
{
    function n()
    {
        function e(e, n)
        {
            var t, o;
            if (!0 === centralControl.theme.transitions)
            {
                "touch" === e ? (t = n.changedTouches[0].pageX - 25, o = n.changedTouches[0].pageY - 25) : (t = n.pageX - 25, o = n.pageY - 25);
                var a = [];
                a = document.createElement("div"), a.classList.add("click-detector"), a.style.left = t + "px", a.style.top = o + "px", document.body.appendChild(a), setTimeout(function ()
                {
                    null !== a && null !== a.parentNode && window.requestAnimationFrame(function ()
                    {
                        a.parentNode.removeChild(a)
                    })
                }, 1e3)
            }
        }
        FastClick.attach(document.body), window.location.hash = "/", window.addEventListener("click", function (n)
        {
            e("mouse", n)
        })
    }
    window.addEventListener("DOMContentLoaded", n)
}();
! function (t, e)
{
    "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : t.PointerEventsPolyfill = e()
}(this, function ()
{
    "use strict";

    function t(t, e)
    {
        e = e || Object.create(null);
        var n = document.createEvent("Event");
        n.initEvent(t, e.bubbles || !1, e.cancelable || !1);
        for (var i, r = 2; r < a.length; r++) i = a[r], n[i] = e[i] || u[r];
        n.buttons = e.buttons || 0;
        var o = 0;
        return o = e.pressure ? e.pressure : n.buttons ? .5 : 0, n.x = n.clientX, n.y = n.clientY, n.pointerId = e.pointerId || 0, n.width = e.width || 0, n.height = e.height || 0, n.pressure = o, n.tiltX = e.tiltX || 0, n.tiltY = e.tiltY || 0, n.pointerType = e.pointerType || "", n.hwTimestamp = e.hwTimestamp || 0, n.isPrimary = e.isPrimary || !1, n
    }

    function e()
    {
        this.array = [], this.size = 0
    }

    function n(t, e, n, i)
    {
        this.addCallback = t.bind(i), this.removeCallback = e.bind(i), this.changedCallback = n.bind(i), S && (this.observer = new S(this.mutationWatcher.bind(this)))
    }

    function i(t)
    {
        return "body /shadow-deep/ " + r(t)
    }

    function r(t)
    {
        return '[touch-action="' + t + '"]'
    }

    function o(t)
    {
        return "{ -ms-touch-action: " + t + "; touch-action: " + t + "; touch-action-delay: none; }"
    }

    function s(t)
    {
        if (!b.pointermap.has(t)) throw new Error("InvalidPointerId")
    }
    var a = ["bubbles", "cancelable", "view", "detail", "screenX", "screenY", "clientX", "clientY", "ctrlKey", "altKey", "shiftKey", "metaKey", "button", "relatedTarget", "pageX", "pageY"],
        u = [!1, !1, null, null, 0, 0, 0, 0, !1, !1, !1, !1, 0, null, 0, 0],
        c = t,
        l = window.Map && window.Map.prototype.forEach,
        h = l ? Map : e;
    e.prototype = {
        set: function (t, e)
        {
            if (void 0 === e) return this.delete(t);
            this.has(t) || this.size++, this.array[t] = e
        },
        has: function (t)
        {
            return void 0 !== this.array[t]
        },
        delete: function (t)
        {
            this.has(t) && (delete this.array[t], this.size--)
        },
        get: function (t)
        {
            return this.array[t]
        },
        clear: function ()
        {
            this.array.length = 0, this.size = 0
        },
        forEach: function (t, e)
        {
            return this.array.forEach(function (n, i)
            {
                t.call(e, n, i, this)
            }, this)
        }
    };
    var p = h,
        d = ["bubbles", "cancelable", "view", "detail", "screenX", "screenY", "clientX", "clientY", "ctrlKey", "altKey", "shiftKey", "metaKey", "button", "relatedTarget", "buttons", "pointerId", "width", "height", "pressure", "tiltX", "tiltY", "pointerType", "hwTimestamp", "isPrimary", "type", "target", "currentTarget", "which", "pageX", "pageY", "timeStamp"],
        v = [!1, !1, null, null, 0, 0, 0, 0, !1, !1, !1, !1, 0, null, 0, 0, 0, 0, 0, 0, 0, "", 0, !1, "", null, null, 0, 0, 0, 0],
        f = {
            pointerover: 1,
            pointerout: 1,
            pointerenter: 1,
            pointerleave: 1
        },
        m = "undefined" != typeof SVGElementInstance,
        E = {
            pointermap: new p,
            eventMap: Object.create(null),
            captureInfo: Object.create(null),
            eventSources: Object.create(null),
            eventSourceList: [],
            registerSource: function (t, e)
            {
                var n = e,
                    i = n.events;
                i && (i.forEach(function (t)
                {
                    n[t] && (this.eventMap[t] = n[t].bind(n))
                }, this), this.eventSources[t] = n, this.eventSourceList.push(n))
            },
            register: function (t)
            {
                for (var e, n = this.eventSourceList.length, i = 0; i < n && (e = this.eventSourceList[i]); i++) e.register.call(e, t)
            },
            unregister: function (t)
            {
                for (var e, n = this.eventSourceList.length, i = 0; i < n && (e = this.eventSourceList[i]); i++) e.unregister.call(e, t)
            },
            contains: function (t, e)
            {
                try
                {
                    return t.contains(e)
                }
                catch (t)
                {
                    return !1
                }
            },
            down: function (t)
            {
                t.bubbles = !0, this.fireEvent("pointerdown", t)
            },
            move: function (t)
            {
                t.bubbles = !0, this.fireEvent("pointermove", t)
            },
            up: function (t)
            {
                t.bubbles = !0, this.fireEvent("pointerup", t)
            },
            enter: function (t)
            {
                t.bubbles = !1, this.fireEvent("pointerenter", t)
            },
            leave: function (t)
            {
                t.bubbles = !1, this.fireEvent("pointerleave", t)
            },
            over: function (t)
            {
                t.bubbles = !0, this.fireEvent("pointerover", t)
            },
            out: function (t)
            {
                t.bubbles = !0, this.fireEvent("pointerout", t)
            },
            cancel: function (t)
            {
                t.bubbles = !0, this.fireEvent("pointercancel", t)
            },
            leaveOut: function (t)
            {
                this.out(t), this.contains(t.target, t.relatedTarget) || this.leave(t)
            },
            enterOver: function (t)
            {
                this.over(t), this.contains(t.target, t.relatedTarget) || this.enter(t)
            },
            eventHandler: function (t)
            {
                if (!t._handledByPE)
                {
                    var e = t.type,
                        n = this.eventMap && this.eventMap[e];
                    n && n(t), t._handledByPE = !0
                }
            },
            listen: function (t, e)
            {
                e.forEach(function (e)
                {
                    this.addEvent(t, e)
                }, this)
            },
            unlisten: function (t, e)
            {
                e.forEach(function (e)
                {
                    this.removeEvent(t, e)
                }, this)
            },
            addEvent: function (t, e)
            {
                t.addEventListener(e, this.boundHandler)
            },
            removeEvent: function (t, e)
            {
                t.removeEventListener(e, this.boundHandler)
            },
            makeEvent: function (t, e)
            {
                this.captureInfo[e.pointerId] && (e.relatedTarget = null);
                var n = new c(t, e);
                return e.preventDefault && (n.preventDefault = e.preventDefault), n._target = n._target || e.target, n
            },
            fireEvent: function (t, e)
            {
                var n = this.makeEvent(t, e);
                return this.dispatchEvent(n)
            },
            cloneEvent: function (t)
            {
                for (var e, n = Object.create(null), i = 0; i < d.length; i++) e = d[i], n[e] = t[e] || v[i], !m || "target" !== e && "relatedTarget" !== e || n[e] instanceof SVGElementInstance && (n[e] = n[e].correspondingUseElement);
                return t.preventDefault && (n.preventDefault = function ()
                {
                    t.preventDefault()
                }), n
            },
            getTarget: function (t)
            {
                var e = this.captureInfo[t.pointerId];
                return e ? t._target !== e && t.type in f ? void 0 : e : t._target
            },
            setCapture: function (t, e)
            {
                this.captureInfo[t] && this.releaseCapture(t), this.captureInfo[t] = e;
                var n = document.createEvent("Event");
                n.initEvent("gotpointercapture", !0, !1), n.pointerId = t, this.implicitRelease = this.releaseCapture.bind(this, t), document.addEventListener("pointerup", this.implicitRelease), document.addEventListener("pointercancel", this.implicitRelease), n._target = e, this.asyncDispatchEvent(n)
            },
            releaseCapture: function (t)
            {
                var e = this.captureInfo[t];
                if (e)
                {
                    var n = document.createEvent("Event");
                    n.initEvent("lostpointercapture", !0, !1), n.pointerId = t, this.captureInfo[t] = void 0, document.removeEventListener("pointerup", this.implicitRelease), document.removeEventListener("pointercancel", this.implicitRelease), n._target = e, this.asyncDispatchEvent(n)
                }
            },
            dispatchEvent: function (t)
            {
                var e = this.getTarget(t);
                if (e) return e.dispatchEvent(t)
            },
            asyncDispatchEvent: function (t)
            {
                requestAnimationFrame(this.dispatchEvent.bind(this, t))
            }
        };
    E.boundHandler = E.eventHandler.bind(E);
    var b = E,
        T = {
            shadow: function (t)
            {
                if (t) return t.shadowRoot || t.webkitShadowRoot
            },
            canTarget: function (t)
            {
                return t && Boolean(t.elementFromPoint)
            },
            targetingShadow: function (t)
            {
                var e = this.shadow(t);
                if (this.canTarget(e)) return e
            },
            olderShadow: function (t)
            {
                var e = t.olderShadowRoot;
                if (!e)
                {
                    var n = t.querySelector("shadow");
                    n && (e = n.olderShadowRoot)
                }
                return e
            },
            allShadows: function (t)
            {
                for (var e = [], n = this.shadow(t); n;) e.push(n), n = this.olderShadow(n);
                return e
            },
            searchRoot: function (t, e, n)
            {
                if (t)
                {
                    var i, r, o = t.elementFromPoint(e, n);
                    for (r = this.targetingShadow(o); r;)
                    {
                        if (i = r.elementFromPoint(e, n))
                        {
                            var s = this.targetingShadow(i);
                            return this.searchRoot(s, e, n) || i
                        }
                        r = this.olderShadow(r)
                    }
                    return o
                }
            },
            owner: function (t)
            {
                for (var e = t; e.parentNode;) e = e.parentNode;
                return e.nodeType !== Node.DOCUMENT_NODE && e.nodeType !== Node.DOCUMENT_FRAGMENT_NODE && (e = document), e
            },
            findTarget: function (t)
            {
                var e = t.clientX,
                    n = t.clientY,
                    i = this.owner(t.target);
                return i.elementFromPoint(e, n) || (i = document), this.searchRoot(i, e, n)
            }
        },
        g = Array.prototype.forEach.call.bind(Array.prototype.forEach),
        y = Array.prototype.map.call.bind(Array.prototype.map),
        w = Array.prototype.slice.call.bind(Array.prototype.slice),
        P = Array.prototype.filter.call.bind(Array.prototype.filter),
        S = window.MutationObserver || window.WebKitMutationObserver,
        O = {
            subtree: !0,
            childList: !0,
            attributes: !0,
            attributeOldValue: !0,
            attributeFilter: ["touch-action"]
        };
    n.prototype = {
        watchSubtree: function (t)
        {
            this.observer && T.canTarget(t) && this.observer.observe(t, O)
        },
        enableOnSubtree: function (t)
        {
            this.watchSubtree(t), t === document && "complete" !== document.readyState ? this.installOnLoad() : this.installNewSubtree(t)
        },
        installNewSubtree: function (t)
        {
            g(this.findElements(t), this.addElement, this)
        },
        findElements: function (t)
        {
            return t.querySelectorAll ? t.querySelectorAll("[touch-action]") : []
        },
        removeElement: function (t)
        {
            this.removeCallback(t)
        },
        addElement: function (t)
        {
            this.addCallback(t)
        },
        elementChanged: function (t, e)
        {
            this.changedCallback(t, e)
        },
        concatLists: function (t, e)
        {
            return t.concat(w(e))
        },
        installOnLoad: function ()
        {
            document.addEventListener("readystatechange", function ()
            {
                "complete" === document.readyState && this.installNewSubtree(document)
            }.bind(this))
        },
        isElement: function (t)
        {
            return t.nodeType === Node.ELEMENT_NODE
        },
        flattenMutationTree: function (t)
        {
            var e = y(t, this.findElements, this);
            return e.push(P(t, this.isElement)), e.reduce(this.concatLists, [])
        },
        mutationWatcher: function (t)
        {
            t.forEach(this.mutationHandler, this)
        },
        mutationHandler: function (t)
        {
            if ("childList" === t.type)
            {
                this.flattenMutationTree(t.addedNodes).forEach(this.addElement, this);
                this.flattenMutationTree(t.removedNodes).forEach(this.removeElement, this)
            }
            else "attributes" === t.type && this.elementChanged(t.target, t.oldValue)
        }
    };
    var M = n,
        I = ["none", "auto", "pan-x", "pan-y",
        {
            rule: "pan-x pan-y",
            selectors: ["pan-x pan-y", "pan-y pan-x"]
        }],
        R = "",
        C = window.PointerEvent || window.MSPointerEvent,
        Y = !window.ShadowDOMPolyfill && document.head.createShadowRoot,
        _ = b.pointermap,
        L = [1, 4, 2, 8, 16],
        D = !1;
    try
    {
        D = 1 === new MouseEvent("test",
        {
            buttons: 1
        }).buttons
    }
    catch (t)
    {}
    var N, X = {
            POINTER_ID: 1,
            POINTER_TYPE: "mouse",
            events: ["mousedown", "mousemove", "mouseup", "mouseover", "mouseout"],
            register: function (t)
            {
                b.listen(t, this.events)
            },
            unregister: function (t)
            {
                b.unlisten(t, this.events)
            },
            lastTouches: [],
            isEventSimulatedFromTouch: function (t)
            {
                for (var e, n = this.lastTouches, i = t.clientX, r = t.clientY, o = 0, s = n.length; o < s && (e = n[o]); o++)
                {
                    var a = Math.abs(i - e.x),
                        u = Math.abs(r - e.y);
                    if (a <= 25 && u <= 25) return !0
                }
            },
            prepareEvent: function (t)
            {
                var e = b.cloneEvent(t),
                    n = e.preventDefault;
                return e.preventDefault = function ()
                {
                    t.preventDefault(), n()
                }, e.pointerId = this.POINTER_ID, e.isPrimary = !0, e.pointerType = this.POINTER_TYPE, e
            },
            prepareButtonsForMove: function (t, e)
            {
                var n = _.get(this.POINTER_ID);
                t.buttons = n ? n.buttons : 0, e.buttons = t.buttons
            },
            mousedown: function (t)
            {
                if (!this.isEventSimulatedFromTouch(t))
                {
                    var e = _.get(this.POINTER_ID),
                        n = this.prepareEvent(t);
                    D || (n.buttons = L[n.button], e && (n.buttons |= e.buttons), t.buttons = n.buttons), _.set(this.POINTER_ID, t), e ? b.move(n) : b.down(n)
                }
            },
            mousemove: function (t)
            {
                if (!this.isEventSimulatedFromTouch(t))
                {
                    var e = this.prepareEvent(t);
                    D || this.prepareButtonsForMove(e, t), b.move(e)
                }
            },
            mouseup: function (t)
            {
                if (!this.isEventSimulatedFromTouch(t))
                {
                    var e = _.get(this.POINTER_ID),
                        n = this.prepareEvent(t);
                    if (!D)
                    {
                        var i = L[n.button];
                        n.buttons = e ? e.buttons & ~i : 0, t.buttons = n.buttons
                    }
                    _.set(this.POINTER_ID, t), 0 === n.buttons || n.buttons === L[n.button] ? (this.cleanupMouse(), b.up(n)) : b.move(n)
                }
            },
            mouseover: function (t)
            {
                if (!this.isEventSimulatedFromTouch(t))
                {
                    var e = this.prepareEvent(t);
                    D || this.prepareButtonsForMove(e, t), b.enterOver(e)
                }
            },
            mouseout: function (t)
            {
                if (!this.isEventSimulatedFromTouch(t))
                {
                    var e = this.prepareEvent(t);
                    D || this.prepareButtonsForMove(e, t), b.leaveOut(e)
                }
            },
            cancel: function (t)
            {
                var e = this.prepareEvent(t);
                b.cancel(e), this.cleanupMouse()
            },
            cleanupMouse: function ()
            {
                _.delete(this.POINTER_ID)
            }
        },
        k = X,
        A = b.captureInfo,
        F = T.findTarget.bind(T),
        x = T.allShadows.bind(T),
        B = b.pointermap,
        K = {
            events: ["touchstart", "touchmove", "touchend", "touchcancel"],
            register: function (t)
            {
                N.enableOnSubtree(t)
            },
            unregister: function (t) {},
            elementAdded: function (t)
            {
                var e = t.getAttribute("touch-action"),
                    n = this.touchActionToScrollType(e);
                n && (t._scrollType = n, b.listen(t, this.events), x(t).forEach(function (t)
                {
                    t._scrollType = n, b.listen(t, this.events)
                }, this))
            },
            elementRemoved: function (t)
            {
                t._scrollType = void 0, b.unlisten(t, this.events), x(t).forEach(function (t)
                {
                    t._scrollType = void 0, b.unlisten(t, this.events)
                }, this)
            },
            elementChanged: function (t, e)
            {
                var n = t.getAttribute("touch-action"),
                    i = this.touchActionToScrollType(n),
                    r = this.touchActionToScrollType(e);
                i && r ? (t._scrollType = i, x(t).forEach(function (t)
                {
                    t._scrollType = i
                }, this)) : r ? this.elementRemoved(t) : i && this.elementAdded(t)
            },
            scrollTypes:
            {
                EMITTER: "none",
                XSCROLLER: "pan-x",
                YSCROLLER: "pan-y",
                SCROLLER: /^(?:pan-x pan-y)|(?:pan-y pan-x)|auto$/
            },
            touchActionToScrollType: function (t)
            {
                var e = t,
                    n = this.scrollTypes;
                return "none" === e ? "none" : e === n.XSCROLLER ? "X" : e === n.YSCROLLER ? "Y" : n.SCROLLER.exec(e) ? "XY" : void 0
            },
            POINTER_TYPE: "touch",
            firstTouch: null,
            isPrimaryTouch: function (t)
            {
                return this.firstTouch === t.identifier
            },
            setPrimaryTouch: function (t)
            {
                (0 === B.size || 1 === B.size && B.has(1)) && (this.firstTouch = t.identifier, this.firstXY = {
                    X: t.clientX,
                    Y: t.clientY
                }, this.scrolling = !1, this.cancelResetClickCount())
            },
            removePrimaryPointer: function (t)
            {
                t.isPrimary && (this.firstTouch = null, this.firstXY = null, this.resetClickCount())
            },
            clickCount: 0,
            resetId: null,
            resetClickCount: function ()
            {
                var t = function ()
                {
                    this.clickCount = 0, this.resetId = null
                }.bind(this);
                this.resetId = setTimeout(t, 200)
            },
            cancelResetClickCount: function ()
            {
                this.resetId && clearTimeout(this.resetId)
            },
            typeToButtons: function (t)
            {
                var e = 0;
                return "touchstart" !== t && "touchmove" !== t || (e = 1), e
            },
            touchToPointer: function (t)
            {
                var e = this.currentTouchEvent,
                    n = b.cloneEvent(t),
                    i = n.pointerId = t.identifier + 2;
                n.target = A[i] || F(n), n.bubbles = !0, n.cancelable = !0, n.detail = this.clickCount, n.button = 0, n.buttons = this.typeToButtons(e.type), n.width = t.radiusX || t.webkitRadiusX || 0, n.height = t.radiusY || t.webkitRadiusY || 0, n.pressure = t.force || t.webkitForce || .5, n.isPrimary = this.isPrimaryTouch(t), n.pointerType = this.POINTER_TYPE;
                var r = this;
                return n.preventDefault = function ()
                {
                    r.scrolling = !1, r.firstXY = null, e.preventDefault()
                }, n
            },
            processTouches: function (t, e)
            {
                var n = t.changedTouches;
                this.currentTouchEvent = t;
                for (var i, r = 0; r < n.length; r++) i = n[r], e.call(this, this.touchToPointer(i))
            },
            shouldScroll: function (t)
            {
                if (this.firstXY)
                {
                    var e, n = t.currentTarget._scrollType;
                    if ("none" === n) e = !1;
                    else if ("XY" === n) e = !0;
                    else
                    {
                        var i = t.changedTouches[0],
                            r = n,
                            o = "Y" === n ? "X" : "Y",
                            s = Math.abs(i["client" + r] - this.firstXY[r]),
                            a = Math.abs(i["client" + o] - this.firstXY[o]);
                        e = s >= a
                    }
                    return this.firstXY = null, e
                }
            },
            findTouch: function (t, e)
            {
                for (var n, i = 0, r = t.length; i < r && (n = t[i]); i++)
                    if (n.identifier === e) return !0
            },
            vacuumTouches: function (t)
            {
                var e = t.touches;
                if (B.size >= e.length)
                {
                    var n = [];
                    B.forEach(function (t, i)
                    {
                        if (1 !== i && !this.findTouch(e, i - 2))
                        {
                            var r = t.out;
                            n.push(r)
                        }
                    }, this), n.forEach(this.cancelOut, this)
                }
            },
            touchstart: function (t)
            {
                this.vacuumTouches(t), this.setPrimaryTouch(t.changedTouches[0]), this.dedupSynthMouse(t), this.scrolling || (this.clickCount++, this.processTouches(t, this.overDown))
            },
            overDown: function (t)
            {
                B.set(t.pointerId,
                {
                    target: t.target,
                    out: t,
                    outTarget: t.target
                }), b.over(t), b.enter(t), b.down(t)
            },
            touchmove: function (t)
            {
                this.scrolling || (this.shouldScroll(t) ? (this.scrolling = !0, this.touchcancel(t)) : (t.preventDefault(), this.processTouches(t, this.moveOverOut)))
            },
            moveOverOut: function (t)
            {
                var e = t,
                    n = B.get(e.pointerId);
                if (n)
                {
                    var i = n.out,
                        r = n.outTarget;
                    b.move(e), i && r !== e.target && (i.relatedTarget = e.target, e.relatedTarget = r, i.target = r, e.target ? (b.leaveOut(i), b.enterOver(e)) : (e.target = r, e.relatedTarget = null, this.cancelOut(e))), n.out = e, n.outTarget = e.target
                }
            },
            touchend: function (t)
            {
                this.dedupSynthMouse(t), this.processTouches(t, this.upOut)
            },
            upOut: function (t)
            {
                this.scrolling || (b.up(t), b.out(t), b.leave(t)), this.cleanUpPointer(t)
            },
            touchcancel: function (t)
            {
                this.processTouches(t, this.cancelOut)
            },
            cancelOut: function (t)
            {
                b.cancel(t), b.out(t), b.leave(t), this.cleanUpPointer(t)
            },
            cleanUpPointer: function (t)
            {
                B.delete(t.pointerId), this.removePrimaryPointer(t)
            },
            dedupSynthMouse: function (t)
            {
                var e = k.lastTouches,
                    n = t.changedTouches[0];
                if (this.isPrimaryTouch(n))
                {
                    var i = {
                        x: n.clientX,
                        y: n.clientY
                    };
                    e.push(i);
                    var r = function (t, e)
                    {
                        var n = t.indexOf(e);
                        n > -1 && t.splice(n, 1)
                    }.bind(null, e, i);
                    setTimeout(r, 2500)
                }
            }
        };
    N = new M(K.elementAdded, K.elementRemoved, K.elementChanged, K);
    var U, j, z = K,
        H = b.pointermap,
        G = window.MSPointerEvent && "number" == typeof window.MSPointerEvent.MSPOINTER_TYPE_MOUSE,
        q = {
            events: ["MSPointerDown", "MSPointerMove", "MSPointerUp", "MSPointerOut", "MSPointerOver", "MSPointerCancel", "MSGotPointerCapture", "MSLostPointerCapture"],
            register: function (t)
            {
                b.listen(t, this.events)
            },
            unregister: function (t)
            {
                b.unlisten(t, this.events)
            },
            POINTER_TYPES: ["", "unavailable", "touch", "pen", "mouse"],
            prepareEvent: function (t)
            {
                var e = t;
                return G && (e = b.cloneEvent(t), e.pointerType = this.POINTER_TYPES[t.pointerType]), e
            },
            cleanup: function (t)
            {
                H.delete(t)
            },
            MSPointerDown: function (t)
            {
                H.set(t.pointerId, t);
                var e = this.prepareEvent(t);
                b.down(e)
            },
            MSPointerMove: function (t)
            {
                var e = this.prepareEvent(t);
                b.move(e)
            },
            MSPointerUp: function (t)
            {
                var e = this.prepareEvent(t);
                b.up(e), this.cleanup(t.pointerId)
            },
            MSPointerOut: function (t)
            {
                var e = this.prepareEvent(t);
                b.leaveOut(e)
            },
            MSPointerOver: function (t)
            {
                var e = this.prepareEvent(t);
                b.enterOver(e)
            },
            MSPointerCancel: function (t)
            {
                var e = this.prepareEvent(t);
                b.cancel(e), this.cleanup(t.pointerId)
            },
            MSLostPointerCapture: function (t)
            {
                var e = b.makeEvent("lostpointercapture", t);
                b.dispatchEvent(e)
            },
            MSGotPointerCapture: function (t)
            {
                var e = b.makeEvent("gotpointercapture", t);
                b.dispatchEvent(e)
            }
        },
        V = q,
        W = window.navigator;
    return W.msPointerEnabled ? (U = function (t)
        {
            s(t), this.msSetPointerCapture(t)
        }, j = function (t)
        {
            s(t), this.msReleasePointerCapture(t)
        }) : (U = function (t)
        {
            s(t), b.setCapture(t, this)
        }, j = function (t)
        {
            s(t), b.releaseCapture(t, this)
        }),
        function ()
        {
            if (C)
            {
                I.forEach(function (t)
                {
                    String(t) === t ? (R += r(t) + o(t) + "\n", Y && (R += i(t) + o(t) + "\n")) : (R += t.selectors.map(r) + o(t.rule) + "\n", Y && (R += t.selectors.map(i) + o(t.rule) + "\n"))
                });
                var t = document.createElement("style");
                t.textContent = R, document.head.appendChild(t)
            }
        }(),
        function ()
        {
            if (!window.PointerEvent)
            {
                if (window.PointerEvent = c, window.navigator.msPointerEnabled)
                {
                    var t = window.navigator.msMaxTouchPoints;
                    Object.defineProperty(window.navigator, "maxTouchPoints",
                    {
                        value: t,
                        enumerable: !0
                    }), b.registerSource("ms", V)
                }
                else b.registerSource("mouse", k), void 0 !== window.ontouchstart && b.registerSource("touch", z);
                b.register(document)
            }
        }(),
        function ()
        {
            window.Element && !Element.prototype.setPointerCapture && Object.defineProperties(Element.prototype,
            {
                setPointerCapture:
                {
                    value: U
                },
                releasePointerCapture:
                {
                    value: j
                }
            })
        }(),
        {
            dispatcher: b,
            Installer: M,
            PointerEvent: c,
            PointerMap: p,
            targetFinding: T
        }
});
var angularCompile = null,
    angularRootScope = null,
    locale, hw_variant, update_avail, update_news = [],
    auth_required = !1;
! function ()
{
    angular.module("cc51", ["ngRoute", "cc-socket"]), angular.module("cc51").config(["$locationProvider", "$routeProvider", "$compileProvider", function (e, t, a)
    {
        t.when("/control/rooms/",
        {
            template: "<rooms></rooms>",
            reloadOnSearch: !1
        }).when("/control/device/:item/",
        {
            template: "<device-control></device-control>"
        }).when("/control/device-vis/:item/",
        {
            template: "<device></device>"
        }).when("/favorites/add/:item/",
        {
            template: "<add-fav></add-fav>"
        }).when("/scenes/",
        {
            template: "<scenes></scenes>",
            reloadOnSearch: !1
        }).when("/favorites/",
        {
            template: "<favorites></favorites>"
        }).when("/favorites/edit/",
        {
            template: '<favorites mode="edit"></favorites>'
        }).when("/view-device/:item",
        {
            template: "<view-device></view-device>"
        }).when("/select-presentation/:item/",
        {
            template: "<select-presentation></select-presentation>"
        }).when("/cams/",
        {
            template: "<cameras></cameras>"
        }).when("/radios/",
        {
            template: "<radios></radios>"
        }).when("/groups/",
        {
            template: "<groups></groups>",
            reloadOnSearch: !1
        }).when("/state-list/",
        {
            template: "<state-list></state-list>",
            reloadOnSearch: !1
        }).when("/webcam/:id",
        {
            template: '<webcam standalone interval="1000"></webcam>'
        }).when("/webcam/",
        {
            template: '<webcam standalone interval="1000"></webcam>'
        }).when("/login/",
        {
            template: "<login></login>"
        }).when("/gateway-login/",
        {
            template: "<gateway-login></gateway-login>"
        }).when("/news/",
        {
            template: "<news></news>"
        }).when("/update-cache/",
        {
            template: "<update-cache></update-cache>"
        }).when("/device/sensor-options/:get",
        {
            template: "<sensor-options></sensor-options>"
        }).when("/offline/",
        {
            templateUrl: "offline.html",
            resolve:
            {
                translation: ["configService", function (e)
                {
                    return e.getOfflineMessage()
                }],
                reload: ["$q", "$timeout", function (e, t)
                {
                    var a = e.defer();
                    return t(function ()
                    {
                        a.resolve(function ()
                        {
                            window.location.reload()
                        })
                    }, 2e3), a.promise
                }]
            }
        }).when("/",
        {
            template: "",
            resolve:
            {
                config: ["configService", function (e)
                {
                    return e.loadConfig()
                }]
            }
        })
    }]).run(["$rootScope", "$location", "$route", "$compile", "$http", function (e, t, a, o, n)
    {
        n.defaults.withCredentials = !0, angularCompile = o, angularRootScope = e, e.$location = t, e.$route = a, e.keys = Object.keys
    }])
}();
(function ()
{
    "use strict";

    function e(e, c)
    {
        function t(c, t)
        {
            return Array.isArray(c) ? (!0, c = c.map(function (e)
            {
                var c = "";
                return e.deviced && (c = "deviced"), e.systemd && (c = "systemd"),
                {
                    method: c + "." + e[c],
                    params: e.params ||
                    {}
                }
            })) : c = function (e)
            {
                var c = "";
                return e.deviced && (c = "deviced"), e.systemd && (c = "systemd"),
                {
                    method: c + "." + e[c],
                    params: e.params ||
                    {}
                }
            }(c), e(function (e, t)
            {
                n.request(c, function (c)
                {
                    e(c)
                })
            })
        }
        var n = _socket();
        return socket = {
            request: n.request,
            cancel: n.cancel
        },
        {
            request: t,
            disconnect: function ()
            {
                n.disconnect()
            },
            connect: function (e)
            {
                n.connect(e)
            }
        }
    }
    angular.module("cc-socket", []).service("ccsocket", e), e.$inject = ["$q", "$rootScope"]
}).call(this);
! function ()
{
    function e(e, t, n, r)
    {
        function a(e)
        {
            t.connect(e), t.request([
            {
                systemd: "prefs_color_scheme_get",
                params:
                {
                    name: "webui"
                }
            },
            {
                systemd: "os_lang_locale_read"
            },
            {
                systemd: "info_hw_variant_read"
            },
            {
                systemd: "srv_fw_update",
                params:
                {
                    action: "status"
                }
            },
            {
                systemd: "users_auth_required_read",
                params:
                {
                    username: "web"
                }
            },
            {
                systemd: "info_release_news_read"
            }]).then(function (e)
            {
                if (hw_variant = e[2].result.variant, update_avail = e[3].result.update_avail, auth_required = e[4].result.auth_required, update_news = e[5].result.news || [], e[0].result && e[0].result.scheme)
                {
                    var t = JSON.parse(e[0].result.scheme);
                    1 === t.version && (centralControl.theme = t), void 0 === t.favorites_grid || t.favorites_grid.length < 6 ? centralControl.theme.favorites_grid = [0, 0, 0, 0, 0, 0] : centralControl.theme.favorites_grid = t.favorites_grid, console.log("THEME LOADED", centralControl.theme)
                }
                ls = e[1].result.locale.split("_")[0], "unset" === ls && (ls = "en"), l().then(function ()
                {
                    o()
                })
            })
        }

        function o()
        {
            if ($(".remove-on-start").remove(), 1 === auth_required) r.path("/login/");
            else if (update_news.length > 0) r.path("/news/");
            else
            {
                var e = document.getElementById("activeBackground");
                centralControl.theme.changed = !0, centralControl.background_interval(e), centralControl.initGlobalMenu.bind(
                {})(), r.path("/favorites/"), $("body").removeClass("loading")
            }
        }

        function l(t)
        {
            var r = n.defer();
            return t = void 0 === t ? ls : t, e(
            {
                method: "GET",
                url: "lang/" + t + ".json"
            }).then(function (e)
            {
                "offline" === t ? locale = e.data[1][ls] ||
                {} : (locale = e.data ||
                {}, i18n = new Jed(e.data), _ = function (e, t)
                {
                    return void 0 === e || null === e || "" === e ? "" : i18n.translate(e).fetch(t)
                }), r.resolve()
            }), r.promise
        }
        return {
            getOfflineMessage: function ()
            {
                var e = n.defer();
                return l("offline").then(function ()
                {
                    e.resolve(
                    {
                        OFFLINE_HEAD: _("Sie sind offline."),
                        OFFLINE_BODY: _('Stellen Sie eine Netzwerkverbindung her und drücken auf "Aktualiseren".'),
                        OFFLINE_BUTTON_LABEL: _("Aktualiseren")
                    })
                }), e.promise
            },
            loadConfig: function ()
            {
                var e = n.defer();
                return centralControl.loader.destroy(), a(), e.resolve()
            },
            initConfig: a
        }
    }
    angular.module("cc51").service("configService", ["$http", "ccsocket", "$q", "$location", e])
}();
! function ()
{
    function e(e, t, n, r, i)
    {
        function o()
        {
            c = [], l = [], u.forEach(function (e)
            {
                "thermostat" === e.device_type ? (c.push(
                {
                    deviced: "hvac_zone_get_mode",
                    params:
                    {
                        hvac_id: e.id
                    }
                }), l.push(e.id), c.push(
                {
                    deviced: "hvac_zone_get_temperature",
                    params:
                    {
                        hvac_id: e.id,
                        mode: "eco"
                    }
                }), l.push(e.id), c.push(
                {
                    deviced: "hvac_zone_get_temperature",
                    params:
                    {
                        hvac_id: e.id,
                        mode: "comfort"
                    }
                }), l.push(e.id), c.push(
                {
                    deviced: "hvac_zone_get_temperature",
                    params:
                    {
                        hvac_id: e.id,
                        mode: "individual"
                    }
                }), l.push(e.id)) : "remote" === e.type || "group" === e.type && "thermostat" !== e.device_type ? (c.push(
                {
                    deviced: "item_get_state",
                    params:
                    {
                        item_id: e.id
                    }
                }), l.push(e.id), "group" === e.type && (c.push(
                {
                    deviced: "group_get_state",
                    params:
                    {
                        group_id: e.id
                    }
                }), l.push(e.id))) : "log" === e.type && (c.push(
                {
                    systemd: "log_top_event_id_read",
                    params:
                    {
                        group_id: e.id
                    }
                }), l.push("log"))
            }), t.request(c).then(function (n)
            {
                u.length > 0 && (p = i(o, d));
                var r = {};
                l.forEach(function (e, t)
                {
                    void 0 === r[e] && (r[e] = []), r[e].push(n[t].result)
                }), Object.keys(r).forEach(function (n)
                {
                    a[n] = r[n], "log" !== n ? e.$broadcast("item-state:" + n, r[n]) : t.request(
                    {
                        systemd: "log_entry_read",
                        params:
                        {
                            event_id: r[n][0].event_id
                        }
                    }).then(function (t)
                    {
                        var n = {};
                        t.result.entry.code && 4 === t.result.entry.code && 0 === t.result.entry.shown && (n = {
                            domain: t.result.entry.domain,
                            target: t.result.entry.domain.split("-")[0],
                            item_id: parseInt(t.result.entry.domain.split("-")[1]),
                            message: t.result.entry.message,
                            shown: t.result.entry.shown
                        }, s[0] = n, e.$broadcast("deviced-error", n))
                    })
                })
            })
        }
        var d = 1e3,
            u = [
            {
                type: "log"
            }],
            s = [],
            a = {},
            c = [],
            l = [],
            p = null;
        return {
            register: function (e)
            {
                0 !== u.filter(function (t)
                {
                    return t.id === e.id && (t.registered += 1, !0)
                }).length || "remote" !== e.type && !0 !== e.feedback && "virtual" !== e.backend ? console.log("DB IGNORED:", e) : (u.push($.extend(
                {
                    registered: 1
                }, e)), console.log("DB SET:", e)), null === p && u.length > 0 && (p = i(o))
            },
            deregister: function (e)
            {
                u = u.filter(function (t)
                {
                    return t.id !== e.id || (t.registered -= 1, !(t.registered <= 0))
                }), 0 === u.length && (i.cancel(p), p = null)
            },
            lastKnownState: function (e)
            {
                return a[e] || [
                {},
                {},
                {},
                {}]
            },
            send: function (e, n, r, i)
            {
                i = i || function () {}, t.request(
                {
                    deviced: "group_send_command",
                    params:
                    {
                        group_id: e,
                        command: n,
                        value: r
                    }
                }).then(i)
            },
            hvacSend: function (e, n, r, i)
            {
                i = i || function () {}, t.request([
                {
                    deviced: "hvac_zone_set_temperature",
                    params:
                    {
                        mode: n,
                        temp: r,
                        hvac_id: e
                    }
                }]).then(i)
            },
            pause: function ()
            {
                console.log("PAUSE", p), i.cancel(p), p = null
            },
            resume: function ()
            {
                null === p && u.length > 0 && (p = i(o))
            },
            lastError: function ()
            {
                return s.length > 0 ? s[0] : null
            }
        }
    }
    angular.module("cc51").service("itemService", ["$rootScope", "ccsocket", "$route", "$location", "$timeout", e])
}();
! function ()
{
    function e(e, o, n)
    {
        e.LABEL_LOGIN = _("Login"), e.LABEL_PASSWORD = _("Passwort"), e.LABEL_UNLOCK = _("Entsperren"), e.LABEL_ERROR = _("Falsches Passwort!"), e.validate = !1, e.login = {
            password: ""
        }, e.submit = function ()
        {
            e.validate = !0, !0 !== e.login.password.$error.required && (console.log("PASSWORD", e.login.password.$error), o.request(
            {
                systemd: "users_auth_authenticate",
                params:
                {
                    password: e.password,
                    username: "web"
                }
            }).then(function (o)
            {
                if (o.result && 0 !== o.result.auth_ok)
                {
                    if (1 === o.result.auth_ok)
                        if (update_news.length > 0) n.path("/news/");
                        else
                        {
                            var t = document.getElementById("activeBackground");
                            centralControl.theme.changed = !0, console.log("START BACKGROUND INTERVAL"), centralControl.background_interval(t), centralControl.initGlobalMenu.bind(
                            {})(), n.path("/favorites/"), $("body").removeClass("loading")
                        }
                }
                else e.login.password.$error.required = !0
            }))
        }
    }
    angular.module("cc51").component("login",
    {
        controller: ["$scope", "ccsocket", "$location", e],
        bindings:
        {},
        templateUrl: "js/ng/modules/login.module.template.html"
    })
}();
! function ()
{
    function o(o, t, n, e, s, i)
    {
        function r()
        {
            var o = i.defer();
            return $.ajax(
            {
                method: "POST",
                url: "https://gw.b-tronic.net/req/RPC",
                data: JSON.stringify(
                {
                    jsonrpc: "2.0",
                    method: "getLoggedInUser",
                    id: "1",
                    params: []
                })
            }).done(function (t)
            {
                t = JSON.parse(t), t.result && !0 === t.result.success ? o.resolve(!0) : o.resolve(!1)
            }), o.promise
        }

        function a(o)
        {
            $.ajax(
            {
                method: "GET",
                url: "https://gw.b-tronic.net" + o
            }).done(function (o)
            {
                var t = o.match(/https:\/\/gw.b-tronic.net\/(.*?)\//gi);
                null !== t ? (console.log("SUCCESSFUL ON FIRST", t), s.initConfig(t[0].split("://")[1])) : setTimeout(function ()
                {
                    a("/dispatch.psp?next=" + l), l += 1
                }, 500)
            })
        }
        $ctrl = this, o.validate = !1, o.login = {
            user: "",
            password: ""
        }, o.show_login_form = !1, $ctrl.$onInit = function ()
        {
            $(".remove-on-start").remove(), r().then(function (t)
            {
                t ? (a("/dispatch.psp?start=1"), o.show_login_form = !1) : o.show_login_form = !0
            })
        }, o.submit = function ()
        {
            o.validate = !0, o.show_login_form = !1, console.log("MODEL DATA", o.login, o.user, o.password), $.ajax(
            {
                method: "POST",
                url: "https://gw.b-tronic.net/index.psp",
                data: $.param(
                {
                    login: o.user,
                    password: o.password
                })
            }).done(function (t)
            {
                t.indexOf("dispatch.psp") > -1 ? (a("/dispatch.psp?start=1"), o.show_login_form = !1) : o.show_login_form = !0
            })
        };
        var l = 1
    }
    angular.module("cc51").component("gatewayLogin",
    {
        controller: ["$scope", "$http", "$location", "ccsocket", "configService", "$q", o],
        bindings:
        {},
        templateUrl: "js/ng/modules/gateway-login.module.template.html"
    })
}();
! function ()
{
    function a(a, e, c)
    {
        function n()
        {
            if (e.cancel(p), 1 === auth_required) c.path("/login/");
            else if (update_news.length > 0) c.path("/news/");
            else
            {
                var a = document.getElementById("activeBackground");
                centralControl.theme.changed = !0, centralControl.background_interval(a), centralControl.initGlobalMenu.bind(
                {})(), c.path("/favorites/"), $("body").removeClass("loading")
            }
        }

        function t()
        {
            a.LABEL_UPDATE = _("Aktualisierung erfolgreich heruntergeladen. Die App startet jetzt neu."), e.cancel(p), setTimeout(function ()
            {
                window.location.reload(!0)
            }, 3e3)
        }

        function o()
        {
            switch (window.applicationCache.status)
            {
                case window.applicationCache.UNCACHED:
                    return "UNCACHED";
                case window.applicationCache.IDLE:
                    return "IDLE";
                case window.applicationCache.CHECKING:
                    return "CHECKING";
                case window.applicationCache.DOWNLOADING:
                    return "DOWNLOADING";
                case window.applicationCache.UPDATEREADY:
                    return "UPDATEREADY";
                case window.applicationCache.OBSOLETE:
                    return "OBSOLETE";
                default:
                    return "UKNOWN"
            }
        }
        a.LABEL_UPDATE = "Checking for Updates";
        var p, i = "UKNOWN";
        this.$onInit = function ()
        {
            $(".remove-on-start").remove(), p = e(function ()
            {
                if (i = o(), console.log("CACHE STATUS", i), console.log("INIT INTERVAL", appcache_update_avail, appcache_update_done, appcache_cache_ready), a.appcache_update_avail = appcache_update_avail, a.appcache_update_done = appcache_update_done, !appcache_update_avail || appcache_update_done || appcache_cache_ready) !0 === appcache_update_avail && !0 === appcache_update_done ? t() : !0 === appcache_cache_ready ? n() : void 0 === appcache_update_avail && void 0 === appcache_update_done && void 0 === appcache_cache_ready && ("IDLE" === i || "UNCACHED" === i || "CHECKING" === i || "UPDATEREADY" === i ? n() : "DOWNLOADING" === i && (a.LABEL_UPDATE = "Downloading app. This may take a few moments."));
                else
                {
                    if (appcache_cache_progress.length > 1) var e = appcache_cache_progress[appcache_cache_progress.length - 1];
                    else e = {};
                    e.loaded && e.total ? a.LABEL_UPDATE = "Downloading update. " + e.loaded + " / " + e.total : a.LABEL_UPDATE = "Downloading update. This may take a few moments."
                }
            }, 100), n()
        }
    }
    angular.module("cc51").component("updateCache",
    {
        controller: ["$scope", "$interval", "$location", a],
        bindings:
        {},
        templateUrl: "js/ng/modules/update-cache.module.template.html"
    })
}();
! function ()
{
    function e(e, n, t)
    {
        e.news = update_news, e.markAsSeen = function ()
        {
            n.request(
            {
                systemd: "info_release_news_seen_set",
                params:
                {}
            }).then(function ()
            {
                var e = document.getElementById("activeBackground");
                centralControl.theme.changed = !0, centralControl.background_interval(e), centralControl.initGlobalMenu.bind(
                {})(), t.path("/favorites/"), $("body").removeClass("loading")
            })
        }
    }
    angular.module("cc51").component("news",
    {
        controller: ["$scope", "ccsocket", "$location", e],
        bindings:
        {},
        templateUrl: "js/ng/modules/news.module.template.html"
    })
}();
! function ()
{
    function e(e, o, t, i, c, s)
    {
        var r, n = this;
        e.labelRooms = _("Räume"), e.labelDevice = _("Empfänger"), e.roomListReady = !1, e.rooms = [], e.devices = [], e.userSelectedRoom = null, e.userSelectedDevice = null, e.showRoomList = !0, e.showDeviceList = !1, e.showDevice = !1, e.deviceControlClass = "", n.$onInit = function ()
        {
            e.loadingRooms = !0, t.request(
            {
                deviced: "deviced_get_item_list",
                params:
                {
                    item_type: "room"
                }
            }).then(function (o)
            {
                if (o.result.item_list.forEach(function (e)
                    {
                        void 0 !== e.icon && -1 !== e.icon.indexOf("icon.") || (e.icon = "icon.room.tuer5")
                    }), e.rooms = o.result.item_list, e.showRoomList = !0, e.roomListReady = !0, i.room)
                {
                    o.result.item_list;
                    e.userSelectedRoom = o.result.item_list.filter(function (e)
                    {
                        return e.id === parseInt(i.room)
                    })[0], e.showRoomList = !1, e.showDeviceList = !0, e.showDevice = !1, e.roomLoading = !0, e.devices = [], e.userSelectedDevice = null, n._selectRoom(function ()
                    {
                        i.item && (e.userSelectedDevice = e.devices.filter(function (e)
                        {
                            return e.id === parseInt(i.item)
                        })[0], e.showRoomList = !1, e.showDeviceList = !1, e.showDevice = !0, n._selectDevice())
                    })
                }
                e.loadingRooms = !1
            })
        }, e.$on("$locationChangeSuccess", function (o, t, c)
        {
            i.room || i.item ? !i.item && i.room ? (e.showRoomList = !1, e.showDeviceList = !0, e.showDevice = !1, e.roomLoading = !0, e.userSelectedDevice = null, e.userSelectedRoom = e.rooms.filter(function (e)
            {
                return e.id === parseInt(i.room)
            })[0], n._selectRoom()) : r === e.userSelectedRoom.id && i.item ? (e.userSelectedDevice = e.devices.filter(function (e)
            {
                return e.id === parseInt(i.item)
            })[0], e.showRoomList = !1, e.showDeviceList = !1, e.showDevice = !0, n._selectDevice()) : n._selectRoom() : (e.showRoomList = !0, e.showDeviceList = !1, e.showDevice = !1, e.roomLoading = !1, e.devices = [], e.userSelectedRoom = null, e.userSelectedDevice = null)
        }), n._selectDevice = function ()
        {
            e.deviceControlClass = "device device-" + e.userSelectedDevice.device_type, e.controlCount = function ()
            {
                return "switch" !== e.userSelectedDevice.device_type && "door-pulse" !== e.userSelectedDevice.device_type && "thermostat" !== e.userSelectedDevice.device_type && "tilt-window" !== e.userSelectedDevice.device_type && "door-opener" !== e.userSelectedDevice.device_type ? "control-double" : "control-single"
            }()
        }, n.selectDevice = function (o)
        {
            e.userSelectedDevice = o, s.search(
            {
                room: e.userSelectedRoom.id,
                item: o.id
            })
        }, n._selectRoom = function (o)
        {
            o = o || function () {}, e.devices = [], e.loadingDevices = !0, t.request(
            {
                deviced: "room_get_items",
                params:
                {
                    room_id: parseInt(i.room)
                }
            }).then(function (t)
            {
                e.devices = t.result.items, e.loadingDevices = !1, r = null === e.userSelectedRoom ? null : e.userSelectedRoom.id, o()
            })
        }, n.selectRoom = function (o)
        {
            e.userSelectedRoom = o, s.search(
            {
                room: o.id
            })
        }, e.back = function (e)
        {
            e ? s.path(e) : window.history.back()
        }, e.addFav = function (o)
        {
            "room" === o ? s.path("/favorites/add/" + centralControl.objectToURIComponent(e.userSelectedRoom) + "/").search(
            {}) : "device" === o && s.path("/favorites/add/" + centralControl.objectToURIComponent(e.userSelectedDevice) + "/").search(
            {})
        }, e.showPreset = function ()
        {
            return "switch" !== e.userSelectedDevice.device_type && "door-pulse" !== e.userSelectedDevice.device_type
        }
    }
    angular.module("cc51").component("rooms",
    {
        controller: ["$scope", "$element", "ccsocket", "$routeParams", "$timeout", "$location", e],
        templateUrl: "js/ng/modules/rooms.module.template.html"
    })
}();
! function ()
{
    function e(e, t, l, i, n, s)
    {
        var c = this;
        c.wrapper = null, c.slidee = null, e.selectedItem = null, e.LABEL_LIST_EMPTY = _("Die Liste ist leer"), c._selectItem = function (t)
        {
            e.selectedItem = t, c.selectItem(t)
        }, c.active = function (t)
        {
            return t === e.selectedItem
        }, c.$onChanges = function ()
        {
            c.list ? e.list = c.list : e.list = [], e.listLength = e.list.length, s(function ()
            {
                if (null !== c.wrapper) c.wrapper.sly("reload");
                else
                {
                    c.wrapper = t.find(".item-list"), c.slidee = c.wrapper.children("ul");
                    "states" === c.type && (1, null, 40)
                }
            })
        }
    }
    angular.module("cc51").component("itemList",
    {
        controller: ["$scope", "$element", "ccsocket", "$sce", "$routeParams", "$timeout", e],
        bindings:
        {
            list: "<",
            type: "@",
            selectItem: "=",
            loading: "="
        },
        templateUrl: "js/ng/modules/item-list.module.template.html"
    })
}();
! function ()
{
    function e(e, t, i, n, a)
    {
        function o()
        {
            !0 !== g && (g = !0, h = n.find(".touch-target").bind("mousedown", function (e)
            {
                var t = {
                    type: "start",
                    x: e.clientX,
                    y: e.clientY,
                    time: +new Date
                };
                a.pause(), x = t, b = t, s(t)
            }).bind("mousemove", function (e)
            {
                if (null !== b)
                {
                    var t = {
                        type: "move",
                        x: e.clientX,
                        y: e.clientY
                    };
                    x = t, s(t)
                }
            }).bind("mouseup", function (e)
            {
                if (null !== b)
                {
                    var t = {
                        type: "stop",
                        x: x.x,
                        y: x.y,
                        time: +new Date
                    };
                    x = t, s(t), b = null
                }
            }).bind("mouseleave", function (e)
            {
                if (null !== b)
                {
                    var t = {
                        type: "stop",
                        x: e.clientX,
                        y: e.clientY,
                        time: +new Date
                    };
                    x = t, s(t), b = null
                }
            }).bind("touchstart", function (e)
            {
                e.preventDefault();
                var t = {
                    type: "start",
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                    time: +new Date
                };
                a.pause(), x = t, b = t, s(t)
            }).bind("touchmove", function (e)
            {
                if (null !== b)
                {
                    e.preventDefault();
                    var t = {
                        type: "move",
                        x: e.touches[0].clientX,
                        y: e.touches[0].clientY
                    };
                    x = t, s(t)
                }
            }).bind("touchend", function (e)
            {
                if (null !== b)
                {
                    e.preventDefault();
                    s(
                    {
                        type: "stop",
                        x: x.x,
                        y: x.y,
                        time: +new Date
                    }), b = null
                }
            }))
        }

        function s(i)
        {
            if (null !== b)
            {
                var n = {
                        x: i.x - h.offset().left,
                        y: i.y - h.offset().top,
                        w: h.width(),
                        h: h.height()
                    },
                    o = {
                        click: !1,
                        x: Math.round(n.x / (n.w / 100)),
                        y: Math.round(n.y / (n.h / 100))
                    };
                if (i === b && (b.percentage = o.y), o.y <= 0 && (o.y = 0), o.y >= 100 && (o.y = 100), "stop" === i.type)
                {
                    e.sendingEvent = !0, t(function ()
                    {
                        e.sendingEvent = !1
                    }, 500);
                    i.time - b.time < 80 || b.y - i.y < 20 && b.y - i.y > -20 && b.x - i.x < 20 && b.x - i.x > -20 ? r(o) : !0 === e.showFeedback ? "dimmer" === e.item.device_type ? (d(100 - o.y), a.send(e.item.id, "dimto", 100 - o.y)) : "venetian" === e.item.device_type ? o.x <= 25 ? (d(o.y, o.x), a.send(e.item.id, "tilt", o.y)) : (d(100 - o.y), a.send(e.item.id, "moveto", o.y)) : (d(o.y), a.send(e.item.id, "moveto", o.y)) : m(b.y > i.y ? -1 : 1, b.percentage - o.y), a.resume()
                }
                else "move" === i.type && !0 === e.showFeedback && ("dimmer" === e.item.device_type ? d(100 - o.y) : "venetian" === e.item.device_type ? d(o.y, o.x) : d(o.y))
            }
        }

        function r(t)
        {
            "door-pulse" === e.item.device_type || "door-opener" === e.item.device_type ? a.send(e.item.id, "step", 1) : "switch" === e.item.device_type ? a.send(e.item.id, "switch", 0) : "dimmer" === e.item.device_type ? a.send(e.item.id, "dim", 0) : "venetian" === e.item.device_type ? (console.log("CLICK POSITION", t), t.x <= 25 && t.y > 50 ? a.send(e.item.id, "step", 1) : t.x <= 25 && t.x <= 50 ? a.send(e.item.id, "step", -1) : a.send(e.item.id, "move", 0)) : a.send(e.item.id, "move", 0)
        }

        function m(t, i)
        {
            "door-pulse" === e.item.device_type || "door-opener" === e.item.device_type ? a.send(e.item.id, "step", 1) : "switch" === e.item.device_type ? a.send(e.item.id, "switch", -1 === t ? 1 : 0) : "dimmer" === e.item.device_type ? a.send(e.item.id, "dim", -1 === t ? 1 : -1) : a.send(e.item.id, "move", t)
        }

        function d(t, i)
        {
            if (void 0 === e.item.state[1] || 0 !== e.item.state[1].success)
            {
                if (t || e.item.state && e.item.state[0].state)
                {
                    if (!t && e.item.state[1] && void 0 !== e.item.state[1].value && null !== e.item.state[1] && (void 0 === i || i > 25)) t = e.item.state[1].value;
                    else if (!t && 0 !== t) return
                }
                else t = 66, i = 50, "awning" !== e.item.device_type && "sun-sail" !== e.item.device_type && "dimmer" !== e.item.device_type || (t = 100);
                switch (null !== y && y.setValue(t), e.item.device_type)
                {
                    case "thermostat":
                        null !== w && (w && "eco" === e.item.state[0].mode ? w.setValue(2 * (e.item.state[1].temp - 5)) : w && "comfort" === e.item.state[0].mode ? w.setValue(2 * (e.item.state[2].temp - 5)) : w && "individual" === e.item.state[0].mode ? w.setValue(2 * (e.item.state[3].temp - 5)) : w && "anti-freeze" === e.item.state[0].mode && w.setValue(0));
                        break;
                    case "dimmer":
                        window.requestAnimationFrame(function ()
                        {
                            n.find("#dimmer-slider").attr("transform", "translate(0,0)"), n.find("#dimmer-slider").attr("fill-opacity", t / 100)
                        });
                        break;
                    case "shutter":
                        t = 100 - t, window.requestAnimationFrame(function ()
                        {
                            var e = .8 * t;
                            n.find("#shutter-slider").attr("transform", "translate(0,-" + e + ")")
                        });
                        break;
                    case "screen":
                        t = 100 - t, window.requestAnimationFrame(function ()
                        {
                            n.find("#screen-slider").attr("transform", "translate(0,-" + .74 * t + ")")
                        });
                        break;
                    case "venetian":
                        if (i && i <= 25)
                        {
                            n.find(".fin-control .part").each(function (e, i)
                            {
                                $(i).css("transform", "rotate(" + .68 * t + "deg)")
                            })
                        }
                        else t = 100 - t, window.requestAnimationFrame(function ()
                        {
                            var e = .81 * t;
                            n.find("#venetian-slider").attr("transform", "translate(0,-" + e + ")")
                        });
                        break;
                    case "switch":
                        window.requestAnimationFrame(function ()
                        {
                            if (e.presentation && "switch-alternate-io" === e.presentation.templateName);
                            else
                            {
                                var t;
                                t = 1 === e.item.state[1].value ? 9 : 0, n.find("#switch-plug").attr("transform", "translate(" + t + ",-" + t + ")"), n.find("#switch-outlet").attr("transform", "translate(-" + t + "," + t + ")")
                            }
                        });
                        break;
                    case "door":
                        t = 100 - t, window.requestAnimationFrame(function ()
                        {
                            n.find("#door-slider").attr("transform", "translate(0,-" + .37 * t + ")")
                        });
                        break;
                    case "sun-sail":
                        t = 100 - t, n.find("#sunsail-slider").attr("transform", "translate(-" + .45 * t + ",-" + .25 * t + ")");
                        break;
                    case "awning":
                        t = 100 - t, n.find("#awning-slider").attr("transform", "translate(-" + .385 * t + ",-" + .29 * t + ")");
                        break;
                    case "roof-window":
                        t = 100 - t;
                        var a = .005 * t,
                            o = 1 - .004 * t,
                            s = -.11 * t,
                            r = .1 * t;
                        n.find("#roofwindow-slider").attr("transform", "matrix(1, 0, " + a + ", " + o + ", " + s + ", " + r + ")")
                }
            }
        }

        function c()
        {
            null === w && (w = new inputCircle(
            {
                division: 72,
                value: 5,
                class: [],
                label: _("°C"),
                radius: 100,
                input_read_only: !0,
                map: function (e)
                {
                    return (5 + e / 2).toFixed(1)
                },
                per_element_style: function (e)
                {
                    return {
                        background: "rgba(0,0,0,.2)"
                    }
                },
                per_active_element_style: function (e)
                {
                    var t = (Math.round(255 / 72), 0),
                        i = 0;
                    return i = e <= 30 ? Math.round(255 - 8.5 * e) : 0, t = e >= 10 ? Math.round(255 / 62 * (e - 10)) : 0,
                    {
                        background: "rgba(" + t + ",0," + i + ",.8)"
                    }
                }
            }), w.handle(function (t)
            {
                a.hvacSend(e.item.id, "individual", Number(t))
            }), n.find(".temp-wheel").append($(w.element)))
        }

        function l()
        {
            null !== w && ($(w.element).remove(), w = null)
        }

        function u()
        {
            null === y && (y = new inputHSlider(
            {
                label: "",
                class: ["hysteresis"],
                vertical: !0,
                value: 1,
                min: 0,
                max: 49,
                first_section_width: "auto",
                map:
                {
                    index: function (e)
                    {
                        return e / 2
                    },
                    value: function (e)
                    {
                        return 2 * e
                    }
                }
            }), n[0].querySelector(".render-area-right").appendChild(y.element))
        }

        function p()
        {
            null !== y && (n[0].querySelector(".render-area-right").removeChild(y.element), y = null)
        }
        var v = this,
            f = function () {},
            y = null,
            w = null;
        e.LABEL_WINTER_MODE = _("Wintermodus"), e.$on("$destroy", function ()
        {
            a.deregister(v.item)
        }), e.sendingEvent = !1;
        var h = null,
            g = !1,
            x = {
                x: 0,
                y: 0
            },
            b = null;
        e.presentation = null, v.functionalize = function ()
        {
            d()
        }, v.$onChanges = function (n)
        {
            e.item = angular.copy(v.item), e.item.state = a.lastKnownState(e.item.id), a.register(v.item), f(), f = e.$on("item-state:" + v.item.id, function (t, i)
            {
                e.item.state = i, "venetian" === e.item.device_type ? (0 != e.item.state[1].success && d(), d(e.item.state[0].state["value-tilt"], 25)) : d()
            }), n.item.previousValue.id && (d(), a.deregister(n.item.previousValue)), "control" === v.context && t(o), void 0 === e.item.presentation ? i.request(
            {
                deviced: "item_get_config",
                params:
                {
                    item_id: v.item.id
                }
            }).then(function (t)
            {
                if (t.result && t.result.config && !0 === t.result.config["mode-winter"]) e.presentation = {
                    template: "js/ng/device-templates/winter-mode.html"
                };
                else try
                {
                    var i = JSON.parse(t.result.config.presentation);
                    if (!i.template) throw {};
                    e.presentation = {
                        templateName: i.template,
                        template: "js/ng/device-templates/" + i.template + ".html"
                    }
                }
                catch (t)
                {
                    e.presentation = {
                        template_name: v.item.device_type,
                        template: "js/ng/device-templates/" + v.item.device_type + ".html"
                    }
                }
            }) : e.presentation = {
                templateName: e.item.presentation,
                template: "js/ng/device-templates/" + e.item.presentation + ".html"
            }, e.showFeedback = function ()
            {
                return p(), l(), !0 !== v.item.feedback || "preview" === v.context || "favorite" === v.context || "shutter" !== v.item.device_type && "awning" !== v.item.device_type && "sun-sail" !== v.item.device_type && "venetian" !== v.item.device_type && "screen" !== v.item.device_type && "dimmer" !== v.item.device_type && "door" !== v.item.device_type && "roof-window" !== v.item.device_type ? "thermostat" === v.item.device_type && "control" === v.context && (t(function ()
                {
                    c()
                }), !1) : (t(function ()
                {
                    "dimmer" !== v.item.device_type && u()
                }), !0)
            }(), e.deviceClass = function ()
            {
                return "device-" + v.item.device_type + " context-" + v.context
            }(), e.showGestures = function ()
            {
                return !(v.item.device_type && "thermostat" === v.item.device_type || v.item.remote_type || "preview" === v.context || "favorite" === v.context) && (e.gestureLabels = function ()
                {
                    return "switch" === v.item.device_type || "heater" === v.item.device_type ?
                    {
                        up: "on",
                        down: "off",
                        class: ""
                    } : "dimmer" === v.item.device_type ?
                    {
                        up: "+",
                        down: "-",
                        class: "big"
                    } : "awning" === v.item.device_type || "sun-sail" === v.item.device_type ?
                    {
                        up: "close",
                        down: "open",
                        class: ""
                    } : "door-pulse" === v.item.device_type || "door-opener" === v.item.device_type ?
                    {
                        up: "toggle",
                        down: "toggle",
                        class: ""
                    } :
                    {
                        up: "open",
                        down: "close",
                        class: ""
                    }
                }(), !0)
            }()
        }, e.stepDirection = 0, e.step = function (i)
        {
            e.stepDirection = i, a.send(e.item.id, "step", i), t(function ()
            {
                e.stepDirection = 0, a.send(e.item.id, "move", 0)
            }, 300)
        }
    }
    angular.module("cc51").component("device",
    {
        controller: ["$scope", "$timeout", "ccsocket", "$element", "itemService", e],
        bindings:
        {
            item: "<",
            id: "@",
            context: "@"
        },
        templateUrl: "js/ng/modules/_device.module.template.html"
    })
}();
! function ()
{
    function e(e, t, n, i)
    {
        var o = this,
            s = function () {};
        e.LABEL_VALUE_UNKNOWN = _("Unbekannter Wert"), o.functionalize = function () {}, o.$onChanges = function (t)
        {
            e.item = angular.copy(o.item), e.item.state = i.lastKnownState(e.item.id), i.register(o.item), s(), s = e.$on("item-state:" + o.item.id, function (t, n)
            {
                e.item.state = n
            }), e.sensorOptions = centralControl.itemToValueOptions(e.item), e.sensorOptions.filter(function (e, t) {}), e.template = function ()
            {
                return "js/ng/device-templates/" + e.item.remote_type + ".html"
            }(), t.item.previousValue.id && i.deregister(t.item.previousValue)
        }, e.sensorClass = function ()
        {
            return "sensor-" + o.item.remote_type + " context-" + o.context
        }(), e.$on("$destroy", function ()
        {
            i.deregister(o.item)
        })
    }
    angular.module("cc51").component("sensor",
    {
        controller: ["$scope", "$timeout", "$element", "itemService", e],
        bindings:
        {
            item: "<",
            id: "@",
            context: "@"
        },
        templateUrl: "js/ng/modules/sensor.module.template.html"
    })
}();
! function ()
{
    function e(e, t, i, o)
    {
        var c = this,
            n = !1,
            s = !1;
        e.$watch("$ctrl.item", function ()
        {
            console.log("deviceControl: ITEM CHANGED", c.mode, c.item), e.item = c.item, e.LABEL_SENSOR_VALUES = _("Sensoren Werte") + ":", e.presetIcon = [], e.presetClass = ["invisible", "invisible"], e.iconClass = [], e.controlType = function ()
            {
                return "switch" === c.item.device_type ? "switch" : "door-pulse" === c.item.device_type || "door-opener" === c.item.device_type ? "pulse" : "thermostat" === c.item.device_type ? "thermostat" : "heater" === c.item.device_type ? "switch" : "shutter"
            }(), c.setPresetIcons()
        }), c.$onInit = function ()
        {
            console.log("deviceControl: INIT CONTROL", c.mode, c.item)
        }, c.setPresetIcons = function ()
        {
            "shutter-foldout" === c.item.device_type ? (e.presetIcon[0] = "+", e.presetIcon[1] = "#", e.iconClass = ["iconswitch", "iconswitch"]) : (e.presetIcon[0] = "n", e.presetIcon[1] = "roof-window" === e.item.device_type ? "I" : "o", e.iconClass = []), console.log("SET ICONS", e.presetIcon, e.iconClass)
        }, c.pointerDown = function (e, t)
        {
            return "fill" === t ? e === n ? "#ff0000" : "#fff" : "opacity" === t ? e === n ? 1 : 0 : "class" === t ? e === n ? (i(function ()
            {
                n = !1
            }, 500), "visible") : "invisible" : void 0
        }, c.pointerDownPreset = function (e)
        {
            return e === s ? (i(function ()
            {
                s = !1
            }, 500), "visible") : "invisible"
        }, "thermostat" === c.item.device_type && t.request([
        {
            deviced: "hvac_zone_get_temperature",
            params:
            {
                mode: "individual",
                hvac_id: c.item.id
            }
        },
        {
            deviced: "hvac_zone_get_temperature",
            params:
            {
                mode: "comfort",
                hvac_id: c.item.id
            }
        },
        {
            deviced: "hvac_zone_get_temperature",
            params:
            {
                mode: "eco",
                hvac_id: c.item.id
            }
        }]).then(function (e)
        {
            c.item.temperatures = {
                individual: e[0].result.temp,
                comfort: e[1].result.temp,
                eco: e[2].result.temp
            }
        }), c.click = function (o, c)
        {
            var s, m, d = "group_send_command",
                r = {};
            "PRESET" === o ? (m = c, s = "dimmer" === e.item.device_type ? "dimpreset" : "movepreset", 1 === c ? (e.presetClass[0] = "", i(function ()
            {
                e.presetClass[0] = "invisible"
            }, 500)) : 2 === c && (e.presetClass[1] = "", i(function ()
            {
                e.presetClass[1] = "invisible"
            }, 500)), r.group_id = e.item.id, r.command = s, r.value = c) : (n = o, m = o, "dimmer" === e.item.device_type || "heater" === e.item.device_type ? -1 === o || 1 === o ? (s = "switch", m = 1) : 0 === o && (s = "switch", m = 0) : "shutter" === e.item.device_type || "roof-window" === e.item.device_type || "awning" === e.item.device_type || "screen" === e.item.device_type || "venetian" === e.item.device_type || "sun-sail" === e.item.device_type || "shutter-foldout" === e.item.device_type || "shutter-blinds" === e.item.device_type || "door" === e.item.device_type ? s = "move" : "switch" === e.item.device_type ? s = "switch" : "door-pulse" === e.item.device_type ? s = "step" : "door-opener" === e.item.device_type && (s = "step"), r = {
                command: s,
                group_id: e.item.id,
                value: m
            }, "thermostat" === e.item.device_type && (-1 === o ? (d = "hvac_zone_set_mode", r = {
                hvac_id: e.item.id,
                mode: "comfort"
            }) : 1 === o ? (d = "hvac_zone_set_mode", r = {
                hvac_id: e.item.id,
                mode: "anti-freeze"
            }) : 0 === o && (d = "hvac_zone_set_mode", r = {
                hvac_id: e.item.id,
                mode: "eco"
            }))), t.request(
            {
                deviced: d,
                params: r
            })
        }
    }
    angular.module("cc51").component("deviceControl",
    {
        templateUrl: "js/ng/modules/device-control.module.template.html",
        controller: ["$scope", "ccsocket", "$timeout", "itemService", e],
        replace: !0,
        bindings:
        {
            item: "<",
            mode: "<"
        }
    })
}();

function AutomationModeController(t, e, o)
{
    var a = this,
        i = "function" == typeof this.type ? this.type() : this.type,
        u = "function" == typeof this.item ? this.item() : this.item,
        c = {},
        d = {},
        m = {},
        l = "",
        n = "";
    t.LABEL_AUTO_SCHEDULE = _("Heizautomatik"), t.LABEL_AUTO_WEATHER = _("Wetterautomatik"), t.LABEL_AUTO_CLOCK = _("Zeitautomatik"), t.LABEL_AUTO_MANUAL = _("Manuell"), t.automaticModeFill = "#fff", t.$watch("$ctrl.item", function ()
    {
        u = a.item, u && "none" !== u ? u.device_type ? u.device_type && (l = "group_get_automatic", n = "group_set_automatic", d = {
            group_id: u.id
        }, i = "device") : (l = "room_get_automatic", n = "room_set_automatic", d = {
            room_id: u.id
        }, i = "room") : (l = "deviced_get_automatic", n = "deviced_set_automatic", d = {}, i = "rooms"), e.request(
        {
            deviced: l,
            params: d
        }).then(function (e)
        {
            m = {}, Object.keys(e.result).forEach(function (t, e)
            {
                m[t] = !0
            }), c = e.result, t.availableModes = m, t.currentAutoMode = c, 1 === c.automatic || -1 === c.automatic ? (t.automaticModeFill = "rgba(197, 239, 90, .8)", t.manualModeFill = "#fff") : (t.automaticModeFill = "#fff", t.manualModeFill = "rgba(197, 239, 90, .8)")
        }), t.displayModeSelect = "hidden", t.availableModes = m, t.currentAutoMode = c
    }), t.showModeSelect = function ()
    {
        t.displayModeSelect = "hidden" === t.displayModeSelect ? "" : "hidden"
    }, t.toggleMode = function (o)
    {
        "automatic" === o || 0 !== c[o] && -1 !== c[o] && void 0 !== c[o] ? "automatic" !== o && 1 === c[o] ? (c[o] = 0, c.automatic = 1) : "automatic" === o && (c = {
            auto_clock: 0,
            auto_schedule: 0,
            auto_weather: 0,
            automatic: 0
        }, t.automaticModeFill = "#fff") : (t.automaticModeFill = "rgba(197, 239, 90, .8)", c[o] = 1, c.automatic = 1), "device" === i ? c.group_id = u.id : "room" === i && (c.room_id = u.id), t.currentAutoMode = c, e.request(
        {
            deviced: n,
            params: c
        }).then(function (t) {})
    }, t.activeMode = function (t)
    {
        return "automatic" === t && 1 !== c.automatic && -1 !== c.automatic ? "rgba(197, 239, 90, .8)" : "automatic" === t ? "#fff" : 1 === c[t] ? "rgba(197, 239, 90, .8)" : "#fff"
    }
}
angular.module("cc51").component("automationMode",
{
    templateUrl: "js/ng/modules/automation.module.template.html",
    controller: ["$scope", "ccsocket", "$element", AutomationModeController],
    replace: !0,
    bindings:
    {
        item: "<",
        type: "&"
    }
});
! function ()
{
    function e(e, t, i, n, o, m, s)
    {
        function a()
        {
            var i = o.defer();
            return t.request(
            {
                deviced: "favorite_new",
                params:
                {
                    name: e.item.name,
                    color: e.color
                }
            }).then(function (e)
            {
                t.request(
                {
                    deviced: "deviced_get_item_list",
                    params:
                    {
                        item_type: "favorite"
                    }
                }).then(function (n)
                {
                    var o = n.result.item_list.splice(0, 1);
                    n.result.item_list.push(o[0]), t.request(n.result.item_list.map(function (e, t)
                    {
                        return {
                            deviced: "favorite_set_index",
                            params:
                            {
                                favorite_id: e.id,
                                position: t
                            }
                        }
                    })).then(function (t)
                    {
                        i.resolve(e.result.favorite_id)
                    })
                })
            }), i.promise
        }

        function c(i)
        {
            var n = o.defer();
            return t.request(
            {
                deviced: "item_set_icon",
                params:
                {
                    item_id: i,
                    icon: e.icon
                }
            }).then(function ()
            {
                n.resolve()
            }), n.promise
        }

        function r()
        {
            var i = "-";
            "room" === e.item.type && (i = "_"), a().then(function (n)
            {
                t.request(
                {
                    deviced: "command_new",
                    params:
                    {
                        target: "cc-gui",
                        parent_id: n,
                        item_id: e.item.id,
                        command: "show" + i + e.item.type,
                        trigger: "cmd0"
                    }
                }).then(function (e)
                {
                    c(e.result.command_id).then(function ()
                    {
                        m.path("/favorites/")
                    })
                })
            })
        }

        function l()
        {
            a().then(function (i)
            {
                e.commands[0].parent_id = i, t.request(
                {
                    deviced: "command_new",
                    params: e.commands[0]
                }).then(function (e)
                {
                    c(e.result.command_id).then(function ()
                    {
                        m.path("/favorites/")
                    })
                })
            })
        }

        function d()
        {
            a().then(function (i)
            {
                t.request(e.commands.map(function (e, t)
                {
                    return e.parent_id = i,
                    {
                        deviced: "command_new",
                        params: e
                    }
                })).then(function (e)
                {
                    c(e[0].result.command_id).then(function ()
                    {
                        m.path("/favorites/")
                    })
                })
            })
        }
        var u = this;
        e.PAGE_LABEL = _("Favorit anlegen"), e.SAVE_LABEL = _("Speichern"), e.NAME_LABEL = _("Favorit benennen"), e.COLOR_LABEL = _("Farbe"), e.ICON_LABEL = _("Icon"), e.OK_LABEL = _("OK"), e.LABEL_SELECT_ACTION = _("Aktion"), e.LABEL_SELECT_TOGGLE = _("Aktion 2"), e.LABEL_SCENE_STOP = _("Szenario stoppen"), e.icon = "default", e.color = "#FFFFFF", e.favoriteType = "show", e.itemOptions = {}, e.sceneList = [], e.commands = [], e.temperatures = {
            action: 22,
            toggle: 22
        }, e.slider = {
            action: 50,
            toggle: 50,
            toggleTilt: 50,
            actionTilt: 50
        }, e.colors = ["#FFFFFF", "#000000", "#E31E24", "#FFFF00", "#00EE00", "#007DFA", "#9400D3", "#EE30A7", "#CD6839"], e.icons = ["default", "item-logmsg", "device-shutter", "device-screen", "device-awning", "device-thermostat", "device-venetian", "device-switch", "device-dimmer", "device-sun-sail", "hotkey-myhome", "device-roof-window", "device-door", "device-heater", "item-scene", "item-room", "item-webcam", "item-radio", "item-clock", "sym-shamrock", "sym-lamp-ceil", "sym-lamp-desk", "sym-drop", "sym-sun", "sym-thermometer", "sym-switch-off", "sym-fountain", "sym-window", "sym-door", "sym-cancel", "sym-confirm", "sym-info", "sym-dish", "sym-people", "sym-tvscreen", "sym-computer", "sym-couch", "sym-vessel", "sym-shower", "sym-stove", "sym-stairs", "sym-picture", "button-fav-fire", "button-fav-dn", "button-fav-up", "button-fav-stop", "hotkey-mainscreen", "hotkey-config", "item-receiver", "item-group", "sym-teddy-1", "sym-teddy-2", "sym-teddy-3", "sym-bed-1", "sym-bed-2", "sym-bed-3", "sym-weather-sun", "sym-weather-moon", "sym-weather-cloud", "sym-weather-rain", "sym-weather-wind", "sym-weather-snow", "sym-buttons", "sym-meeting", "sym-house-outside", "sym-house-inside", "sym-suitcase", "sym-digit-1", "sym-digit-2", "sym-digit-3", "sym-digit-4", "sym-digit-5", "sym-digit-6", "sym-digit-7", "sym-digit-8", "sym-digit-9", "sym-digit-0", "sym-letter-A", "sym-letter-B", "sym-letter-C", "sym-letter-D", "sym-letter-E", "sym-letter-F", "sym-letter-G", "sym-letter-H", "sym-letter-I", "sym-letter-J", "sym-letter-K", "sym-letter-L", "sym-letter-M", "sym-letter-N", "sym-letter-O", "sym-letter-P", "sym-letter-Q", "sym-letter-R", "sym-letter-S", "sym-letter-T", "sym-letter-U", "sym-letter-V", "sym-letter-W", "sym-letter-X", "sym-letter-Y", "sym-letter-Z"], u.$onInit = function ()
        {
            if (e.item = centralControl.URIComponentToObject(n.item), console.log("ADD ITEM TO FAVORITES", e.item), "scene" === e.item.type || "group" === e.item.type || "radio" === e.item.type)
            {
                e.itemOptions = centralControl.getItemOptions(e.item), e.setAction(e.itemOptions[0]);
                var o = [
                    {
                        value: "show",
                        text: _("Bedienung anzeigen"),
                        selected: !0
                    },
                    {
                        value: "action",
                        text: _("Aktion")
                    },
                    {
                        value: "toggle",
                        text: _("Schalter")
                    }],
                    m = new inputCheckboxList(
                    {
                        multiple: !1,
                        options: o,
                        label: _("Typ"),
                        class: ["dynamic-size", "dark"],
                        button_class: ["dark", "dynamic-size"]
                    });
                m.handle(function (t, n)
                {
                    s(function ()
                    {
                        e.favoriteType = n.value, console.log("COMMANDS NOW", n.value, "scene" !== e.item.type), "toggle" === n.value && "scene" !== e.item.type && e.setToggleAction(e.itemOptions[1]), s(function ()
                        {
                            i.find('input[type="range"]').each(function (e, t)
                            {
                                console.log("SLIDER", $(this), $(e)), $(t).rangeslider(
                                {
                                    polyfill: !1
                                })
                            })
                        })
                    })
                }), "scene" === e.item.type && t.request(
                {
                    deviced: "deviced_get_item_list",
                    params:
                    {
                        item_type: "scene"
                    }
                }).then(function (t)
                {
                    e.sceneList = t.result.item_list, e.setToggleScene(e.sceneList[0])
                }), i.find(".type-select").append($(m.element))
            }
            else "webcam" === e.item.type && ("internal" === e.item.id ? (e.item.name = "CentralControl", e.item.id = void 0) : e.item.id = e.item.webcam_id)
        }, u.save = function ()
        {
            "show" === e.favoriteType ? r() : "action" === e.favoriteType ? l() : "toggle" === e.favoriteType && d()
        }, u.selectIcon = function (t)
        {
            e.icon = e.icons[t]
        }, u.selectColor = function (t)
        {
            e.color = e.colors[t]
        }, e.setAction = function (t)
        {
            "tempset" === t.value.command && (t.value.value = parseFloat(e.temperatures.action)), "dimto" !== t.value.command && "moveto" !== t.value.command || (t.value.value = parseInt(e.slider.action)), "tilt" === t.value.command && (t.value.value = 100 - parseInt(e.slider.actionTilt)), e.commands[0] = {
                target: "deviced",
                command: t.value.command,
                value: t.value.value,
                item_id: e.item.id,
                trigger: "cmd0",
                parent_id: null
            }, console.log("action now set", e.commands[0])
        }, e.setToggleAction = function (t)
        {
            "tempset" === t.value.command && (t.value.value = parseFloat(e.temperatures.toggle)), "dimto" !== t.value.command && "moveto" !== t.value.command || (t.value.value = parseInt(e.slider.toggle)), "tilt" === t.value.command && (t.value.value = 100 - parseInt(e.slider.toggleTilt)), e.commands[1] = {
                target: "deviced",
                command: t.value.command,
                value: t.value.value,
                item_id: e.item.id,
                trigger: "cmd1",
                parent_id: null
            }, console.log("toggle now set", e.commands[1])
        }, e.setToggleScene = function (t)
        {
            e.commands[1] = "stop" === t ?
            {
                target: "deviced",
                command: "stop",
                trigger: "cmd1",
                item_id: t.id,
                parent_id: null
            } :
            {
                target: "deviced",
                command: "invoke",
                trigger: "cmd1",
                item_id: t.id,
                parent_id: null
            }, console.log("toggle now set", e.commands[1])
        }, e.back = function ()
        {
            history.back()
        }
    }
    angular.module("cc51").component("addFav",
    {
        templateUrl: "js/ng/modules/add-fav.module.template.html",
        controller: ["$scope", "ccsocket", "$element", "$routeParams", "$q", "$location", "$timeout", e],
        replace: !0,
        bindings:
        {
            item: "<"
        }
    })
}();
! function ()
{
    function e(e, t, o, n, r, i, s)
    {
        function l(e)
        {
            console.log(e.index), console.log(m.cells[e.index]), t.request(
            {
                deviced: "item_delete",
                params:
                {
                    item_id: e.favorite.id
                }
            }).then(function ()
            {
                m.cells[e.index] = {
                    content: e.content,
                    element: e.element,
                    favorite: null,
                    scope: null,
                    cp: e.cp.remove(),
                    size: e.size,
                    index: e.index
                };
                var o = [],
                    n = m.cells.filter(function (e)
                    {
                        if (e.favorite) return !0
                    }).map(function (e, t)
                    {
                        return o.push(
                        {
                            deviced: "favorite_set_index",
                            params:
                            {
                                favorite_id: parseInt(e.favorite.id),
                                position: t
                            }
                        }), parseInt($(e.element).attr("data-index"))
                    });
                t.request(o).then(function (e)
                {
                    console.log("INDEX WAS SET", e)
                }), centralControl.theme.favorites_order = n, t.request([
                {
                    systemd: "prefs_color_scheme_set",
                    params:
                    {
                        name: "webui",
                        scheme: JSON.stringify(
                        {
                            static_background: centralControl.theme.static_background,
                            shape: centralControl.theme.shape,
                            changed: !0,
                            opactiy: centralControl.theme.opacity,
                            version: 1,
                            transitions: centralControl.theme.transitions,
                            static_background_instantiated: !1,
                            static_background_color: centralControl.theme.static_background_color,
                            favorites_grid: centralControl.theme.favorites_grid,
                            favorites_order: n,
                            color:
                            {
                                hue: centralControl.theme.color.hue,
                                saturation: centralControl.theme.color.saturation,
                                brightness: centralControl.theme.color.brightness
                            }
                        })
                    }
                }]).then(function (e)
                {
                    console.log("SAVED", e)
                })
            })
        }
        $ctrl = this, update_avail && (e.updateAvailable = !0);
        var a = [];
        e.$on("deviced-error", function (t, o)
        {
            e.showError = !0
        }), t.request([
        {
            deviced: "deviced_get_item_list",
            params:
            {
                item_type: "favorite"
            }
        }]).then(function (t)
        {
            a = t[0].result.item_list;
            a.map(function (t, o)
            {
                var r, i = e.$new(!0);
                if (void 0 === centralControl.theme.favorites_order || void 0 === centralControl.theme.favorites_order[o])
                {
                    var s = m.cells.filter(function (e)
                    {
                        return !(centralControl.theme.favorites_order && centralControl.theme.favorites_order.indexOf(e.index) > -1)
                    }).filter(function (e)
                    {
                        return !e.favorite
                    });
                    if (console.log("UNASSIGNED FAVORITES WILL BE RENDERED HERE:", s[0]), !s[0]) return;
                    r = s[0].index
                }
                else r = centralControl.theme.favorites_order[o], console.log("ASSIGNED FAVORITES WILL BE RENDERED HERE:", r);
                if (void 0 !== m.cells[r])
                {
                    i.favorite = t, i.size = "", m.cells[r].element.classList.contains("c1x1") ? i.size = "1x1" : m.cells[r].element.classList.contains("c1x2") ? i.size = "1x2" : m.cells[r].element.classList.contains("c1x3") ? i.size = "1x3" : m.cells[r].element.classList.contains("c2x1") ? i.size = "2x1" : m.cells[r].element.classList.contains("c2x2") ? i.size = "2x2" : m.cells[r].element.classList.contains("c2x3") ? i.size = "2x3" : m.cells[r].element.classList.contains("c3x1") ? i.size = "3x1" : m.cells[r].element.classList.contains("c3x2") ? i.size = "3x2" : m.cells[r].element.classList.contains("c3x3") ? i.size = "3x3" : m.cells[r].element.classList.contains("c4x1") ? i.size = "4x1" : m.cells[r].element.classList.contains("c4x2") ? i.size = "4x2" : m.cells[r].element.classList.contains("c4x3") ? i.size = "4x3" : m.cells[r].element.classList.contains("c4x4") && (i.size = "4x4");
                    var a;
                    $ctrl.mode ? (i.onDelete = function ()
                    {
                        l(m.cells[r])
                    }, a = n('<favorite on-delete="onDelete" editable="true" item="favorite" size="size" mode="\'right\'"></favorite>')(i)) : a = n('<favorite item="favorite" size="size" mode="\'right\'"></favorite>')(i), $(m.cells[r].content).append(a), m.cells[r].scope = i, m.cells[r].cp = a, m.cells[r].favorite = t
                }
            });
            i(function ()
            {
                c.attach()
            })
        }), centralControl.loader.destroy();
        var a = [];
        performance.now();
        e.getFavorite = function (e)
        {
            return a[e]
        };
        var c = new structWrapper(
        {
            overflow_y: !0,
            class: ["favorites"]
        });
        if (console.log("INIT FAVORITES????", centralControl.theme.favorites_grid), $ctrl.mode)
        {
            var d = {
                    layouts: centralControl.theme.favorites_grid
                },
                m = new structGrid(
                {
                    editMode: !0,
                    columns: 6,
                    division: [4, 3],
                    sortable: !0,
                    layouts: d.layouts,
                    parentElement: c.element,
                    onSort: function (o, r, i, s)
                    {
                        console.log("ALL CELLS", m.cells);
                        var a = [];
                        m.cells.filter(function (e)
                        {
                            if (!0 === e.rerender && e.favorite) return !0
                        }).forEach(function (t, o)
                        {
                            $(t.content).empty();
                            var r = e.$new(!0);
                            r.onDelete = function ()
                            {
                                l(t)
                            }, r.favorite = angular.copy(t.favorite,
                            {}), r.size = t.size, t.cp = n('<favorite editable="true" on-delete="onDelete" item="favorite" size="size" mode="\'right\'"></favorite>')(r), t.id = parseInt($(t.element).attr("data-index")), $(t.content).append(t.cp), a.push(t.id), t.rerender = !1
                        });
                        var c = [],
                            d = m.cells.filter(function (e)
                            {
                                if (e.favorite) return !0
                            }).map(function (e, t)
                            {
                                return c.push(
                                {
                                    deviced: "favorite_set_index",
                                    params:
                                    {
                                        favorite_id: parseInt(e.favorite.id),
                                        position: t
                                    }
                                }), parseInt($(e.element).attr("data-index"))
                            });
                        t.request(c).then(function (e)
                        {
                            console.log("INDEX WAS SET", e)
                        }), centralControl.theme.favorites_order = d, t.request([
                        {
                            systemd: "prefs_color_scheme_set",
                            params:
                            {
                                name: "webui",
                                scheme: JSON.stringify(
                                {
                                    static_background: centralControl.theme.static_background,
                                    shape: centralControl.theme.shape,
                                    changed: !0,
                                    opactiy: centralControl.theme.opacity,
                                    version: 1,
                                    transitions: centralControl.theme.transitions,
                                    static_background_instantiated: !1,
                                    static_background_color: centralControl.theme.static_background_color,
                                    favorites_grid: centralControl.theme.favorites_grid,
                                    favorites_order: d,
                                    color:
                                    {
                                        hue: centralControl.theme.color.hue,
                                        saturation: centralControl.theme.color.saturation,
                                        brightness: centralControl.theme.color.brightness
                                    }
                                })
                            }
                        }]).then(function (e)
                        {
                            console.log("SAVED", e)
                        })
                    },
                    changeLayout: function (e)
                    {
                        centralControl.theme.favorites_grid = e, t.request([
                        {
                            systemd: "prefs_color_scheme_set",
                            params:
                            {
                                name: "webui",
                                scheme: JSON.stringify(
                                {
                                    static_background: centralControl.theme.static_background,
                                    shape: centralControl.theme.shape,
                                    changed: !0,
                                    opactiy: centralControl.theme.opacity,
                                    version: 1,
                                    transitions: centralControl.theme.transitions,
                                    static_background_instantiated: !1,
                                    static_background_color: centralControl.theme.static_background_color,
                                    favorites_grid: e,
                                    color:
                                    {
                                        hue: centralControl.theme.color.hue,
                                        saturation: centralControl.theme.color.saturation,
                                        brightness: centralControl.theme.color.brightness
                                    }
                                })
                            }
                        }]).then(function (e)
                        {
                            r.reload()
                        })
                    }
                });
            console.log("CELLS", m.cells)
        }
        else var m = new structGrid(
        {
            columns: 6,
            division: [4, 3],
            layouts: centralControl.theme.favorites_grid
        });
        c.element.appendChild(m.element), o.find(".struct-control-frontend")[0].appendChild(c.element)
    }
    angular.module("cc51").component("favorites",
    {
        templateUrl: "js/ng/modules/favorites.module.template.html",
        controller: ["$scope", "ccsocket", "$element", "$compile", "$route", "$timeout", "itemService", e],
        bindings:
        {
            mode: "@"
        }
    })
}();
! function ()
{
    function e(e, m, s, c, i, t)
    {
        var a = this,
            r = this.item();
        a.$onInit = function ()
        {
            m.request(
            {
                deviced: "favorite_get_commands",
                params:
                {
                    favorite_id: r.id
                }
            }).then(function (e)
            {
                r.commands = e.result.commands, a.init()
            })
        }, a.init = function ()
        {
            e.renderAs = "", e.name = r.name, e.fav = r, r.commands && r.commands[0] && (e.iconClass = r.commands[0].icon, "show-group" === r.commands[0].command || "show-receiver" === r.commands[0].command ? m.request(
            {
                deviced: "item_get_info",
                params:
                {
                    item_id: r.commands[0].items[0]
                }
            }).then(function (n)
            {
                e.item = n.result, "1x1" !== a.size && "2x1" !== a.size && "3x1" !== a.size && "4x1" !== a.size ? e.renderAs = "device" : e.renderAs = "icon"
            }) : "show-scene" === r.commands[0].command ? e.renderAs = "icon" : "show-webcam" === r.commands[0].command ? (console.log("SHOW WEBCAM", a.size), "1x1" !== a.size && "2x1" !== a.size && "3x1" !== a.size && "4x1" !== a.size && "1x2" !== a.size ? e.renderAs = "webcam" : (console.log("RENDER AS ICON", r), e.renderAs = "icon")) : "show-webcam-list" === r.commands[0].command ? e.renderAs = "icon" : "show_room" === r.commands[0].command ? e.renderAs = "icon" : (e.renderAs = "icon", e.iconClass = r.commands[0].icon)), s[0].style.background = n(o(r.color), .5), e.deleteFavorite = function ()
            {
                "function" == typeof a.onDelete && a.onDelete()
            }, e.click = function ()
            {
                !0 !== a.editable && "device" !== e.renderAs && ("show_room" === r.commands[0].command ? t.path("/control/rooms/").search(
                {
                    room: e.fav.commands[0].items[0]
                }) : "show-scene" === r.commands[0].command ? t.path("/scenes/").search(
                {
                    item: e.fav.commands[0].items[0]
                }) : "show-webcam-list" === r.commands[0].command ? t.path("/cams/") : "show-webcam" === r.commands[0].command ? t.path("/webcam/" + r.commands[0].items[0] + "/") : "show-group" === r.commands[0].command ? t.path("/view-device/" + r.commands[0].items[0]) : "show-receiver" === r.commands[0].command ? t.path("/view-device/" + r.commands[0].items[0]) : (e.loading = !0, m.request([
                {
                    deviced: "item_get_info",
                    params:
                    {
                        item_id: r.id
                    }
                }]).then(function (n)
                {
                    r.commands.forEach(function (e)
                    {
                        e.trigger === n[0].result.next_trigger && (r.next_trigger = e.trigger)
                    }), m.request([
                    {
                        deviced: "favorite_invoke",
                        params:
                        {
                            favorite_id: r.id,
                            trigger: r.next_trigger
                        }
                    }]).then(function ()
                    {
                        e.loading = !1, e.success = !0, i(function ()
                        {
                            e.success = !1
                        }, 1e3)
                    })
                })))
            }
        }
    }

    function n(e, n)
    {
        return "rgba(" + e.r + "," + e.g + "," + e.b + "," + n + ")"
    }

    function o(e)
    {
        var n = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);
        return n ?
        {
            r: parseInt(n[1], 16),
            g: parseInt(n[2], 16),
            b: parseInt(n[3], 16)
        } : null
    }
    angular.module("cc51").component("favorite",
    {
        templateUrl: "js/ng/modules/favorite.module.template.html",
        controller: ["$scope", "ccsocket", "$element", "$routeParams", "$timeout", "$location", e],
        bindings:
        {
            item: "&",
            size: "<",
            editable: "=",
            onDelete: "="
        }
    })
}();
! function ()
{
    function e(e, n, o, c, t, i)
    {
        var s = this,
            l = !1;
        e.LABEL_SCENES = _("Szenarien"), e.LABEL_COMMANDS = _("Befehle"), e.LABEL_ACTIONS = _("Aktionen"), e.roomListReady = !1, e.rooms = [], e.showSceneList = !0, e.showScene = !1, s.$onInit = function ()
        {
            e.loadingScenes = !0, o.request(
            {
                deviced: "deviced_get_item_list",
                params:
                {
                    item_type: "scene"
                }
            }).then(function (n)
            {
                c.room && e.selectRoom(centralControl.URIComponentToObject(c.room)), n.result.item_list.forEach(function (e)
                {
                    console.log("SCENE ICON", e.icon), void 0 !== e.icon && -1 !== e.icon.indexOf("icon.") || (e.icon = "icon.room.kind2")
                }), e.scenes = n.result.item_list, e.showSceneList = !0, e.showScene = !1, e.sceneListReady = !0, e.loadingScenes = !1, c.item && s._selectScene()
            })
        }, e.$on("$locationChangeSuccess", function ()
        {
            c.item ? s._selectScene() : (e.showSceneList = !0, e.showScene = !1, e.userSelectedScene = null)
        }), s._selectScene = function ()
        {
            e.userSelectedScene = e.scenes.filter(function (e)
            {
                return e.id === parseInt(c.item)
            })[0], e.showSceneList = !1, e.showScene = !0
        }, s.selectScene = function (e)
        {
            i.search(
            {
                item: e.id
            })
        }, e.addFav = function ()
        {
            i.path("/favorites/add/" + centralControl.objectToURIComponent(e.userSelectedScene) + "/").search(
            {})
        }, e.back = function (e)
        {
            e ? i.path(e) : window.history.back()
        }, s.pointerDown = function (e, n)
        {
            return "fill" === n ? e === l ? "#ff0000" : "#fff" : "opacity" === n ? e === l ? 1 : 0 : "class" === n ? e === l ? (t(function ()
            {
                l = !1
            }, 500), "visible") : "invisible" : void 0
        }, s.click = function (n, c)
        {
            console.log("CLICk");
            var t;
            l = n, t = 1 === n ? "scene_invoke" : "scene_stop", o.request(
            {
                deviced: t,
                params:
                {
                    scene_id: e.userSelectedScene.id
                }
            })
        }
    }
    angular.module("cc51").component("scenes",
    {
        controller: ["$scope", "$element", "ccsocket", "$routeParams", "$timeout", "$location", e],
        bindings:
        {},
        templateUrl: "js/ng/modules/scenes.module.template.html"
    })
}();
! function ()
{
    function n(n, e, o, t, d, c)
    {
        var m = this,
            l = null,
            i = new Model;
        m.$onChanges = function ()
        {
            var o = m.item;
            e.find(".render-content").empty(), i.set("id", o.id), centralControl.item_list_genarator(i, function ()
            {
                e.find(".render-content").empty(), console.log("MODEL", i.get("bound-commands")), c(function ()
                {
                    n.loading = !1, l = new commandEditor(
                    {
                        dynamic_size: !0,
                        readonly: !0,
                        model: i,
                        commands: i.get("bound-commands")
                    }), e.find(".render-content")[0].appendChild(l.element)
                })
            }), n.loading = !0
        }
    }
    angular.module("cc51").component("scene",
    {
        controller: ["$scope", "$element", "ccsocket", "$sce", "$routeParams", "$timeout", n],
        bindings:
        {
            item: "<"
        },
        templateUrl: "js/ng/modules/scene.module.template.html"
    })
}();

function CamerasController(e, t, n, r)
{
    e.userSelectedScene = null, e.hw_variant = hw_variant, e.gateway = window.location.href.indexOf("gw.b-tronic") > -1, e.LABEL_LOKAL = _("Lokal"), t.request(
    {
        systemd: "webcam_cam_list_get"
    }).then(function (t)
    {
        e.cameras = t.result.webcam_list
    }), e.LABEL_CAMERAS = _("Kameras"), e.LABEL_COMMANDS = _("Befehle"), e.getSelectedItem = function ()
    {
        return e.userSelectedScene.preview = !1, e.userSelectedScene
    }, e.selectCam = function (t)
    {
        e.userSelectedCam = t, e.userInCamList = !1, e.userInCamControl = !0
    }, e.userInCamList = !0, e.userInCamControl = !1, e.currentCamList = function ()
    {
        return !0 === e.userInCamList ? "current" : ""
    }, e.currentCamControl = function ()
    {
        return !0 === e.userInCamControl ? "current" : ""
    }, e.showCamList = function ()
    {
        e.userInCamList = !0, e.userInCamControl = !1
    }, e.addFav = function (e)
    {
        window.location.href = "#/favorites/add/" + centralControl.objectToURIComponent(e)
    }, e.back = function ()
    {
        history.back()
    }
}
angular.module("cc51").component("cameras",
{
    templateUrl: "js/ng/modules/cameras.module.template.html",
    controller: ["$scope", "ccsocket", "$element", "$timeout", CamerasController],
    replace: !0
});

function RadiosController(e, t, o, a)
{
    e.LABEL_RADIOS = _("Radios"), e.output = "default", t.request(
    {
        systemd: "radio_station_list_get"
    }).then(function (t)
    {
        e.radios = t.result.station_list, e.userSelectedRadio = e.radios[0]
    });
    var u = new inputHSlider(
    {
        value: 50,
        first_section_width: "auto",
        vertical: !0,
        min: 0,
        max: 99
    });
    t.request([
    {
        systemd: "radio_volume_get",
        params:
        {
            mixer: "default"
        }
    },
    {
        systemd: "radio_volume_get",
        params:
        {
            mixer: "headphone"
        }
    }]).then(function (t)
    {
        1 === t[0].result.muted ? (e.output = "headphone", u.setValue(100 - t[1].result.volume)) : (e.output = "default", u.setValue(100 - t[0].result.volume))
    }), u.handle(function (o)
    {
        "default" === e.output ? t.request(
        {
            systemd: "radio_volume_set",
            params:
            {
                mixer: "default",
                volume: 100 - o
            }
        }) : t.request(
        {
            systemd: "radio_volume_set",
            params:
            {
                mixer: "headphone",
                volume: 100 - o
            }
        })
    }), e.toggleOutput = function ()
    {
        "default" === e.output ? (e.output = "headphone", t.request([
        {
            systemd: "radio_volume_set",
            params:
            {
                mixer: "default",
                mute: 1
            }
        },
        {
            systemd: "radio_volume_set",
            params:
            {
                mixer: "headphone",
                mute: 0
            }
        }]).then(function (e)
        {
            u.setValue(100 - e[1].result.volume)
        })) : (e.output = "default", t.request([
        {
            systemd: "radio_volume_set",
            params:
            {
                mixer: "headphone",
                mute: 1
            }
        },
        {
            systemd: "radio_volume_set",
            params:
            {
                mixer: "default",
                mute: 0
            }
        }]).then(function (e)
        {
            u.setValue(100 - e[1].result.volume)
        }))
    }, e.fill = "#fff", e.getFill = function ()
    {
        return console.log("FILL?"), "default" === e.output ? "#fff" : "green"
    }, e.getOpacity = function ()
    {
        return "default" === e.output ? .4 : 1
    }, o[0].querySelector(".volume-slider").appendChild(u.element), e.selectRadio = function (o)
    {
        e.userSelectedRadio = o, e.userInRadioList = !1, e.userInRadioControl = !0, t.request(
        {
            systemd: "command_dispatch",
            params:
            {
                item_id: o.station_id,
                command: "start"
            }
        })
    }, e.play = function ()
    {
        t.request(
        {
            systemd: "command_dispatch",
            params:
            {
                item_id: e.userSelectedRadio.station_id,
                command: "start"
            }
        })
    }, e.stop = function ()
    {
        t.request(
        {
            systemd: "command_dispatch",
            params:
            {
                item_id: e.userSelectedRadio.station_id,
                command: "stop"
            }
        })
    }, e.addFav = function (e)
    {
        window.location.href = "#/favorites/add/" + centralControl.objectToURIComponent(e)
    }
}
angular.module("cc51").component("radios",
{
    templateUrl: "js/ng/modules/radios.module.template.html",
    controller: ["$scope", "ccsocket", "$element", "$timeout", RadiosController],
    replace: !0
});

function GroupsController(e, t, o, c, i)
{
    var r = this;
    e.labelgroups = _("Räume"), e.labelDevice = _("Empfänger"), e.groupListReady = !1, e.groups = [], e.showGroupList = !0, e.showDevice = !1, r.$onInit = function ()
    {
        e.loadingGroups = !0, t.request(
        {
            deviced: "deviced_get_item_list",
            params:
            {
                list_type: "groups"
            }
        }).then(function (t)
        {
            c.group && e.selectgroup(centralControl.URIComponentToObject(c.group)), t.result.item_list.forEach(function (e)
            {
                void 0 === e.icon && (e.icon = "icon.group.teddy")
            }), e.groups = t.result.item_list, e.showGroupList = !0, e.groupListReady = !0, e.loadingGroups = !1, c.item && r._selectItem()
        })
    }, e.$on("$locationChangeSuccess", function ()
    {
        c.item ? r._selectItem() : (e.showGroupList = !0, e.showDevice = !1, e.userSelectedDevice = null)
    }), r._selectItem = function ()
    {
        e.userSelectedDevice = e.groups.filter(function (e)
        {
            return e.id === parseInt(c.item)
        })[0], e.showGroupList = !1, e.showDevice = !0
    }, r.selectgroup = function (e)
    {
        i.search(
        {
            item: e.id
        })
    }, this.getSelectedItem = function ()
    {
        return e.userSelectedDevice
    }, this.getClass = function ()
    {
        return "device device-" + e.userSelectedDevice.device_type
    }, e.addFav = function ()
    {
        i.path("/favorites/add/" + centralControl.objectToURIComponent(e.userSelectedDevice) + "/").search(
        {})
    }, e.showPreset = function ()
    {
        return "switch" !== e.userSelectedDevice.device_type && "door-pulse" !== e.userSelectedDevice.device_type
    }, e.controlCount = function ()
    {
        return "switch" !== e.userSelectedDevice.device_type && "door-pulse" !== e.userSelectedDevice.device_type && "thermostat" !== e.userSelectedDevice.device_type ? "control-double" : "control-single"
    }, e.back = function (e)
    {
        e ? i.path(e) : window.history.back()
    }
}
angular.module("cc51").component("groups",
{
    templateUrl: "js/ng/modules/groups.module.template.html",
    controller: ["$scope", "ccsocket", "$element", "$routeParams", "$location", GroupsController],
    bindings:
    {}
});
! function ()
{
    function e(e, t, c, o, i)
    {
        function n(e)
        {
            e.sort(function (e, t)
            {
                var c, o;
                return "remote" === e.type ? c = e.remote_type : "group" === e.type && (c = e.device_type), "remote" === t.type ? o = t.remote_type : "group" === t.type && (o = t.device_type), c < o ? -1 : c > o ? 1 : 0
            })
        }
        var r = this;
        e.items = [], e.showGroupList = !0, e.showDevice = !1, e.LABEL_STATE = _("Status"), e.jumpback = function ()
        {
            history.back()
        }, e.showDevice = function (e)
        {
            window.location.href = "#/view-device/" + centralControl.objectToURIComponent(
            {
                id: e.id
            })
        }, r.$onInit = function ()
        {
            e.loadingDevices = !0, t.request([
            {
                deviced: "deviced_get_item_list",
                params:
                {
                    list_type: "receivers"
                }
            },
            {
                deviced: "deviced_get_item_list",
                params:
                {
                    item_type: "remote"
                }
            }]).then(function (t)
            {
                var o = [],
                    i = [];
                t[0].result.item_list.forEach(function (e, t)
                {
                    !0 === e.feedback ? o.push(e) : console.log(e.name)
                }), n(o), t[1].result.item_list.forEach(function (e, t)
                {
                    e.remote_type.indexOf("sensor") > -1 && i.push(e)
                }), n(i), e.items = i.concat(o), e.loadingDevices = !1, c.item && r._selectItem()
            })
        }, e.$on("$locationChangeSuccess", function ()
        {
            c.item ? r._selectItem() : (e.showGroupList = !0, e.showDevice = !1, e.userSelectedDevice = null)
        }), r._selectItem = function ()
        {
            e.userSelectedDevice = e.items.filter(function (e)
            {
                return e.id === parseInt(c.item)
            })[0], e.showGroupList = !1, e.showDevice = !0
        }, r.selectItem = function (e)
        {
            i.path("/view-device/" + e.id)
        }, this.getClass = function ()
        {
            return "device" === e.userSelectedDevice.type ? "device device-" + e.userSelectedDevice.device_type : "remote" === e.userSelectedDevice.type ? "device device-" + e.userSelectedDevice.remote_type : void 0
        }, e.controlCount = function ()
        {
            return "switch" !== e.userSelectedDevice.device_type && "door-pulse" !== e.userSelectedDevice.device_type && "thermostat" !== e.userSelectedDevice.device_type ? "control-double" : "control-single"
        }, e.addFav = function (t)
        {
            var c = "";
            "device" === t ? c = centralControl.objectToURIComponent(e.userSelectedDevice) : "group" === t && (c = centralControl.objectToURIComponent(e.userSelectedgroup)), window.location.href = "#/favorites/add/" + c
        }, e.showPreset = function ()
        {
            return "switch" !== e.userSelectedDevice.device_type && "door-pulse" !== e.userSelectedDevice.device_type
        }, e.back = function ()
        {
            window.history.back()
        }
    }
    angular.module("cc51").component("stateList",
    {
        templateUrl: "js/ng/modules/state-list.module.template.html",
        controller: ["$scope", "ccsocket", "$routeParams", "$element", "$location", e],
        replace: !0,
        bindings:
        {
            item: "<"
        }
    })
}();
! function ()
{
    function e(e, n, t, o, a)
    {
        function i()
        {
            if (!s)
            {
                e.local = !0;
                var t;
                if (m && m.webcam_id ? (e.name = m.name, t = camPath + m.webcam_id + "?" + (new Date).getTime()) : (e.name = _("Lokal"), t = camPath + "?" + (new Date).getTime()), 0 === e.image.length) e.image.push(t), n(function ()
                {
                    i()
                }, l);
                else
                {
                    var o = new Image;
                    o.src = t, o.onload = function ()
                    {
                        n(function ()
                        {
                            e.image.push(t), e.image.length > 2 && (console.log("IMG", e.image.length), e.image.splice(0, 1)), n(function ()
                            {
                                i()
                            }, l)
                        })
                    }, o.onerror = function ()
                    {
                        n(function ()
                        {
                            i()
                        }, l)
                    }
                }
                e.zoom = function ()
                {
                    window.location.href = m ? "#/webcam/" + m.webcam_id : "#/webcam/"
                }
            }
        }
        var c = this,
            m = null,
            l = (window.location.host.indexOf("b-tronic.net"), c.interval || 3e3),
            s = !1;
        c.$onInit = function ()
        {
            e.standalone = void 0 !== c.standalone, console.log("STANDALONE", e.standalone), console.log("WEBCAM CONTROLLER", c.item()), m = c.item(), e.image = [], void 0 === m ? o.id ? t.request(
            {
                systemd: "webcam_cam_data_get",
                params:
                {
                    webcam_id: parseInt(o.id)
                }
            }).then(function (e)
            {
                m = e.result, i()
            }) : i() : "object" == typeof m ? i() : "number" == typeof m && t.request(
            {
                systemd: "webcam_cam_data_get",
                params:
                {
                    webcam_id: m
                }
            }).then(function (e)
            {
                m = e.result, i()
            })
        }, e.back = function ()
        {
            history.back()
        }, e.addFav = function ()
        {
            void 0 === m ? a.path("/favorites/add/" + centralControl.objectToURIComponent(
            {
                type: "webcam",
                id: "internal"
            }) + "/") : a.path("/favorites/add/" + centralControl.objectToURIComponent(m) + "/")
        }, e.$on("$destroy", function ()
        {
            s = !0
        })
    }
    angular.module("cc51").component("webcam",
    {
        templateUrl: "js/ng/modules/webcam.module.template.html",
        controller: ["$scope", "$timeout", "ccsocket", "$routeParams", "$location", e],
        bindings:
        {
            item: "&",
            interval: "@",
            standalone: "@"
        }
    })
}();

function ViewDevice(e, t, c, i)
{
    var o = this;
    o.$onInit = function ()
    {
        e.userSelectedDevice = null, t.request(
        {
            deviced: "item_get_info",
            params:
            {
                item_id: parseInt(c.item)
            }
        }).then(function (t)
        {
            e.userSelectedDevice = t.result, e.userSelectedDeviceInfo = t.result
        })
    }, e.back = function ()
    {
        history.back()
    }, o.getClass = function ()
    {
        return "device device-" + e.userSelectedDevice.device_type
    }, e.addFav = function ()
    {
        i.path("/favorites/add/" + centralControl.objectToURIComponent(e.userSelectedDevice) + "/").search(
        {})
    }, e.showPreset = function ()
    {
        return "switch" !== e.userSelectedDevice.device_type && "door-pulse" !== e.userSelectedDevice.device_type
    }, e.controlCount = function ()
    {
        return "switch" !== e.userSelectedDevice.device_type && "door-pulse" !== e.userSelectedDevice.device_type && "thermostat" !== e.userSelectedDevice.device_type ? "control-double" : "control-single"
    }
}
angular.module("cc51").component("viewDevice",
{
    templateUrl: "js/ng/modules/view-device.module.template.html",
    controller: ["$scope", "ccsocket", "$routeParams", "$location", ViewDevice],
    replace: !0
});
! function ()
{
    function t(t, e, n, o)
    {
        console.log("SELECT PRESENTATION", n.item, centralControl.URIComponentToObject(n.item));
        var c = this,
            i = centralControl.URIComponentToObject(n.item),
            l = [];
        t.LABEL_PRESENTATION = _("Ansicht"), c.$onInit = function ()
        {
            "group" === i.type && "switch" === i.device_type && (l = ["switch", "switch-alternate-io", "switch-alternate-lamp1", "switch-alternate-lamp2", "switch-alternate-toggle"]), t.items = l.map(function (t)
            {
                var e = angular.copy(i);
                return e.presentation = t, e
            }), console.log("ITEMS WITH PRESENTATION", t.items)
        }, c.selectItem = function (t)
        {
            o.request(
            {
                deviced: "item_set_config",
                params:
                {
                    item_id: t.id,
                    config:
                    {
                        presentation: JSON.stringify(
                        {
                            template: t.presentation
                        })
                    }
                }
            }).then(function ()
            {
                console.log("PRESENTATION SET")
            })
        }, t.back = function ()
        {
            centralControl.jumpBack()
        }
    }
    angular.module("cc51").component("selectPresentation",
    {
        controller: ["$scope", "$element", "$routeParams", "ccsocket", t],
        bindings:
        {},
        templateUrl: "js/ng/modules/select-presentation.module.template.html"
    })
}();
! function ()
{
    function e(e, t, n, o)
    {
        var r, i = this;
        window.location.host.indexOf("b-tronic.net"), i.interval;
        e.PAGE_LABEL = _("Totzeit für Bewegungsmelder"), e.PAGE_DESCRIPTION = _("Mindestabstand in Sekunden zwischen zwei Meldungen"), e.time = 60, i.$onInit = function ()
        {
            r = centralControl.URIComponentToObject(n.get), t.request(
            {
                deviced: "item_get_config",
                params:
                {
                    item_id: parseInt(r.id)
                }
            }).then(function (t)
            {
                try
                {
                    null === t.result.config["sensor-hold-time"] ? e.time = 60 : e.time = t.result.config["sensor-hold-time"]
                }
                catch (t)
                {
                    e.time = 60
                }
            })
        }, e.save = function ()
        {
            e.error = null, centralControl.loader.attach(), t.request(
            {
                deviced: "item_set_config",
                params:
                {
                    item_id: r.id,
                    config:
                    {
                        "sensor-hold-time": parseInt(e.time)
                    }
                }
            }).then(function (t)
            {
                centralControl.loader.destroy(), t.error ? e.error = t.error.message : (console.log("SAVE", t), centralControl.jumpBack())
            })
        }, e.back = function ()
        {
            centralControl.jumpBack()
        }
    }
    angular.module("cc51").component("sensorOptions",
    {
        templateUrl: "js/ng/modules/sensor-options.module.template.html",
        controller: ["$scope", "ccsocket", "$routeParams", "$location", e]
    })
}();