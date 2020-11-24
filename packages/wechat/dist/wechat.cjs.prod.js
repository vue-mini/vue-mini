/*!
 * vue-mini v0.2.0
 * https://github.com/vue-mini/vue-mini
 * (c) 2019-present Yang Mingshan
 * @license MIT
 */
"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const e={},t=()=>{},n=Object.assign,o=Object.prototype.hasOwnProperty,s=(e,t)=>o.call(e,t),r=Array.isArray,i=e=>"[object Map]"===h(e),c=e=>"function"==typeof e,a=e=>"symbol"==typeof e,l=e=>null!==e&&"object"==typeof e,u=Object.prototype.toString,h=e=>u.call(e),f=e=>"string"==typeof e&&"NaN"!==e&&"-"!==e[0]&&""+parseInt(e,10)===e,d=(e,t)=>e!==t&&(e==e||t==t),_=new WeakMap,p=[];let v;const g=Symbol(""),m=Symbol("");function y(t,n=e){(function(e){return e&&!0===e._isEffect})(t)&&(t=t.raw);const o=function(e,t){const n=function(){if(!n.active)return t.scheduler?void 0:e();if(!p.includes(n)){w(n);try{return T.push(R),R=!0,p.push(n),v=n,e()}finally{p.pop(),x(),v=p[p.length-1]}}};return n.id=b++,n.allowRecurse=!!t.allowRecurse,n._isEffect=!0,n.active=!0,n.raw=e,n.deps=[],n.options=t,n}(t,n);return n.lazy||o(),o}function S(e){e.active&&(w(e),e.options.onStop&&e.options.onStop(),e.active=!1)}let b=0;function w(e){const{deps:t}=e;if(t.length){for(let n=0;n<t.length;n++)t[n].delete(e);t.length=0}}let R=!0;const T=[];function x(){const e=T.pop();R=void 0===e||e}function P(e,t,n){if(!R||void 0===v)return;let o=_.get(e);o||_.set(e,o=new Map);let s=o.get(n);s||o.set(n,s=new Set),s.has(v)||(s.add(v),v.deps.push(s))}function A(e,t,n,o,s,c){const a=_.get(e);if(!a)return;const l=new Set,u=e=>{e&&e.forEach((e=>{(e!==v||e.allowRecurse)&&l.add(e)}))};if("clear"===t)a.forEach(u);else if("length"===n&&r(e))a.forEach(((e,t)=>{("length"===t||t>=o)&&u(e)}));else switch(void 0!==n&&u(a.get(n)),t){case"add":r(e)?f(n)&&u(a.get("length")):(u(a.get(g)),i(e)&&u(a.get(m)));break;case"delete":r(e)||(u(a.get(g)),i(e)&&u(a.get(m)));break;case"set":i(e)&&u(a.get(g))}l.forEach((e=>{e.options.scheduler?e.options.scheduler(e):e()}))}const E=new Set(Object.getOwnPropertyNames(Symbol).map((e=>Symbol[e])).filter(a)),O=H(),j=H(!1,!0),k=H(!0),I=H(!0,!0),C={};function H(e=!1,t=!1){return function(n,o,i){if("__v_isReactive"===o)return!e;if("__v_isReadonly"===o)return e;if("__v_raw"===o&&i===(e?ae:ce).get(n))return n;const c=r(n);if(c&&s(C,o))return Reflect.get(C,o,i);const u=Reflect.get(n,o,i);if(a(o)?E.has(o):"__proto__"===o||"__v_isRef"===o)return u;if(e||P(n,0,o),t)return u;if(ye(u)){return!c||!f(o)?u.value:u}return l(u)?e?fe(u):ue(u):u}}["includes","indexOf","lastIndexOf"].forEach((e=>{const t=Array.prototype[e];C[e]=function(...e){const n=ge(this);for(let e=0,t=this.length;e<t;e++)P(n,0,e+"");const o=t.apply(n,e);return-1===o||!1===o?t.apply(n,e.map(ge)):o}})),["push","pop","shift","unshift","splice"].forEach((e=>{const t=Array.prototype[e];C[e]=function(...e){T.push(R),R=!1;const n=t.apply(this,e);return x(),n}}));function M(e=!1){return function(t,n,o,i){const c=t[n];if(!e&&(o=ge(o),!r(t)&&ye(c)&&!ye(o)))return c.value=o,!0;const a=r(t)&&f(n)?Number(n)<t.length:s(t,n),l=Reflect.set(t,n,o,i);return t===ge(i)&&(a?d(o,c)&&A(t,"set",n,o):A(t,"add",n,o)),l}}const z={get:O,set:M(),deleteProperty:function(e,t){const n=s(e,t),o=Reflect.deleteProperty(e,t);return o&&n&&A(e,"delete",t,void 0),o},has:function(e,t){const n=Reflect.has(e,t);return a(t)&&E.has(t)||P(e,0,t),n},ownKeys:function(e){return P(e,0,r(e)?"length":g),Reflect.ownKeys(e)}},F={get:k,set:(e,t)=>!0,deleteProperty:(e,t)=>!0},L=n({},z,{get:j,set:M(!0)}),B=n({},F,{get:I}),D=e=>l(e)?ue(e):e,N=e=>l(e)?fe(e):e,U=e=>e,W=e=>Reflect.getPrototypeOf(e);function Q(e,t,n=!1,o=!1){const s=ge(e=e.__v_raw),r=ge(t);t!==r&&!n&&P(s,0,t),!n&&P(s,0,r);const{has:i}=W(s),c=n?N:o?U:D;return i.call(s,t)?c(e.get(t)):i.call(s,r)?c(e.get(r)):void 0}function V(e,t=!1){const n=this.__v_raw,o=ge(n),s=ge(e);return e!==s&&!t&&P(o,0,e),!t&&P(o,0,s),e===s?n.has(e):n.has(e)||n.has(s)}function K(e,t=!1){return e=e.__v_raw,!t&&P(ge(e),0,g),Reflect.get(e,"size",e)}function $(e){e=ge(e);const t=ge(this),n=W(t).has.call(t,e),o=t.add(e);return n||A(t,"add",e,e),o}function q(e,t){t=ge(t);const n=ge(this),{has:o,get:s}=W(n);let r=o.call(n,e);r||(e=ge(e),r=o.call(n,e));const i=s.call(n,e),c=n.set(e,t);return r?d(t,i)&&A(n,"set",e,t):A(n,"add",e,t),c}function G(e){const t=ge(this),{has:n,get:o}=W(t);let s=n.call(t,e);s||(e=ge(e),s=n.call(t,e));o&&o.call(t,e);const r=t.delete(e);return s&&A(t,"delete",e,void 0),r}function J(){const e=ge(this),t=0!==e.size,n=e.clear();return t&&A(e,"clear",void 0,void 0),n}function X(e,t){return function(n,o){const s=this,r=s.__v_raw,i=ge(r),c=e?N:t?U:D;return!e&&P(i,0,g),r.forEach(((e,t)=>n.call(o,c(e),c(t),s)))}}function Y(e,t,n){return function(...o){const s=this.__v_raw,r=ge(s),c=i(r),a="entries"===e||e===Symbol.iterator&&c,l="keys"===e&&c,u=s[e](...o),h=t?N:n?U:D;return!t&&P(r,0,l?m:g),{next(){const{value:e,done:t}=u.next();return t?{value:e,done:t}:{value:a?[h(e[0]),h(e[1])]:h(e),done:t}},[Symbol.iterator](){return this}}}}function Z(e){return function(...t){return"delete"!==e&&this}}const ee={get(e){return Q(this,e)},get size(){return K(this)},has:V,add:$,set:q,delete:G,clear:J,forEach:X(!1,!1)},te={get(e){return Q(this,e,!1,!0)},get size(){return K(this)},has:V,add:$,set:q,delete:G,clear:J,forEach:X(!1,!0)},ne={get(e){return Q(this,e,!0)},get size(){return K(this,!0)},has(e){return V.call(this,e,!0)},add:Z("add"),set:Z("set"),delete:Z("delete"),clear:Z("clear"),forEach:X(!0,!1)};function oe(e,t){const n=t?te:e?ne:ee;return(t,o,r)=>"__v_isReactive"===o?!e:"__v_isReadonly"===o?e:"__v_raw"===o?t:Reflect.get(s(n,o)&&o in t?n:t,o,r)}["keys","values","entries",Symbol.iterator].forEach((e=>{ee[e]=Y(e,!1,!1),ne[e]=Y(e,!0,!1),te[e]=Y(e,!1,!0)}));const se={get:oe(!1,!1)},re={get:oe(!1,!0)},ie={get:oe(!0,!1)},ce=new WeakMap,ae=new WeakMap;function le(e){return e.__v_skip||!Object.isExtensible(e)?0:function(e){switch(e){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}((e=>h(e).slice(8,-1))(e))}function ue(e){return e&&e.__v_isReadonly?e:de(e,!1,z,se)}function he(e){return de(e,!1,L,re)}function fe(e){return de(e,!0,F,ie)}function de(e,t,n,o){if(!l(e))return e;if(e.__v_raw&&(!t||!e.__v_isReactive))return e;const s=t?ae:ce,r=s.get(e);if(r)return r;const i=le(e);if(0===i)return e;const c=new Proxy(e,2===i?o:n);return s.set(e,c),c}function _e(e){return pe(e)?_e(e.__v_raw):!(!e||!e.__v_isReactive)}function pe(e){return!(!e||!e.__v_isReadonly)}function ve(e){return _e(e)||pe(e)}function ge(e){return e&&ge(e.__v_raw)||e}const me=e=>l(e)?ue(e):e;function ye(e){return Boolean(e&&!0===e.__v_isRef)}class Se{constructor(e,t=!1){this._rawValue=e,this._shallow=t,this.__v_isRef=!0,this._value=t?e:me(e)}get value(){return P(ge(this),0,"value"),this._value}set value(e){d(ge(e),this._rawValue)&&(this._rawValue=e,this._value=this._shallow?e:me(e),A(ge(this),"set","value",e))}}function be(e,t=!1){return ye(e)?e:new Se(e,t)}function we(e){return ye(e)?e.value:e}const Re={get:(e,t,n)=>we(Reflect.get(e,t,n)),set:(e,t,n,o)=>{const s=e[t];return ye(s)&&!ye(n)?(s.value=n,!0):Reflect.set(e,t,n,o)}};class Te{constructor(e){this.__v_isRef=!0;const{get:t,set:n}=e((()=>P(this,0,"value")),(()=>A(this,"set","value")));this._get=t,this._set=n}get value(){return this._get()}set value(e){this._set(e)}}class xe{constructor(e,t){this._object=e,this._key=t,this.__v_isRef=!0}get value(){return this._object[this._key]}set value(e){this._object[this._key]=e}}function Pe(e,t){return ye(e[t])?e[t]:new xe(e,t)}class Ae{constructor(e,t,n){this._setter=t,this._dirty=!0,this.__v_isRef=!0,this.effect=y(e,{lazy:!0,scheduler:()=>{this._dirty||(this._dirty=!0,A(ge(this),"set","value"))}}),this.__v_isReadonly=n}get value(){return this._dirty&&(this._value=this.effect(),this._dirty=!1),P(ge(this),0,"value"),this._value}set value(e){this._setter(e)}}let Ee=null,Oe=null,je=null;function ke(){return Oe||je}function Ie(e){Ee=e}function Ce(e){Oe=e}function He(e){je=e}function Me(e){const t=ke();t&&(t.__effects__||(t.__effects__=[])).push(e)}let ze=!1,Fe=!1;const Le=[];let Be=0;const De=Promise.resolve();let Ne=null;function Ue(e){0!==Le.length&&Le.includes(e,ze&&e.allowRecurse?Be+1:Be)||(Le.push(e),ze||Fe||(Fe=!0,Ne=De.then(We)))}function We(e){Fe=!1,ze=!0;try{for(Be=0;Be<Le.length;Be++){0,(0,Le[Be])()}}finally{Be=0,Le.length=0,ze=!1,Ne=null}}const{isArray:Qe}=Array;function Ve(e){return Object.prototype.toString.call(e).slice(8,-1)}function Ke(e){return null!==e&&"object"==typeof e}function $e(e){return"function"==typeof e}function qe(e){return`__${e}__`}const Ge={};function Je(e,t,n){return Xe(e,t,n)}function Xe(e,t,{immediate:n,deep:o,flush:s,onTrack:r,onTrigger:i}={}){let c,a,l=!1;if(ye(e)?(c=()=>e.value,l=Boolean(e._shallow)):_e(e)?(c=()=>e,o=!0):c=Qe(e)?()=>e.map((e=>ye(e)?e.value:_e(e)?Ye(e):$e(e)?e():void 0)):$e(e)?t?()=>e():()=>(a&&a(),e(u)):()=>{},t&&o){const e=c;c=()=>Ye(e())}const u=e=>{a=_.options.onStop=()=>e()};let h=Qe(e)?[]:Ge;const f=()=>{if(_.active)if(t){const e=_();(o||l||function(e,t){return e!==t&&(e==e||t==t)}(e,h))&&(a&&a(),t(e,h===Ge?void 0:h,u),h=e)}else _()};let d;f.allowRecurse=Boolean(t),d="sync"===s?f:()=>{Ue(f)};const _=y(c,{lazy:!0,onTrack:r,onTrigger:i,scheduler:d});Me(_),t?n?f():h=_():_();const p=ke();return()=>{S(_),p&&function(e,t){const n=e.indexOf(t);n>-1&&e.splice(n,1)}(p.__effects__,_)}}function Ye(e,t=new Set){if(!Ke(e)||t.has(e))return e;if(t.add(e),ye(e))Ye(e.value,t);else if(Qe(e))for(let n=0;n<e.length;n++)Ye(e[n],t);else if("Set"===Ve(e)||function(e){return"Map"===Ve(e)}(e))e.forEach((e=>{Ye(e,t)}));else for(const n in e)Ye(e[n],t);return e}const Ze=Object.create(null);function et(e,t){const n=e[t];return function(...e){const o=this[qe(t)];o&&o.forEach((t=>t(...e))),void 0!==n&&n.call(this,...e)}}function tt(e){if(function(e){const t=new Set(["undefined","boolean","number","string"]);return null===e||t.has(typeof e)}(e)||$e(e))return e;if(ye(e))return tt(e.value);if(ve(e))return tt(ge(e));if(Qe(e))return e.map((e=>tt(e)));if(function(e){return null!==e&&"Object"===Ve(e)}(e)){const t={};return Object.keys(e).forEach((n=>{t[n]=tt(e[n])})),t}throw new TypeError(`${Ve(e)} value is not supported`)}function nt(e,t){Ke(t)&&Je(ye(t)?t:()=>t,(()=>{this.setData({[e]:tt(t)})}),{deep:!0})}function ot(e,t){const n=e[t];return function(...e){const o=this[qe(t)];o&&o.forEach((t=>t(...e))),void 0!==n&&n.call(this,...e)}}const st={onShow:"show",onHide:"hide",onResize:"resize",ready:"onReady"};function rt(e,t){return at(t,e.lifetimes[t]||e[t])}function it(e,t){return at(t,e.methods[t])}function ct(e,t){return at(t,e.pageLifetimes[st[t]])}function at(e,t){const n=qe(e);return function(...e){const o=this[n];o&&o.forEach((t=>t(...e))),void 0!==t&&t.call(this,...e)}}const lt=Pt("onShow"),ut=Pt("onHide"),ht=Pt("onError"),ft=Pt("onPageNotFound"),dt=Pt("onUnhandledRejection"),_t=Pt("onThemeChange"),pt=At("onShow"),vt=At("onHide"),gt=At("onUnload"),mt=At("onPullDownRefresh"),yt=At("onReachBottom"),St=At("onResize"),bt=At("onTabItemTap"),wt=Et("onLoad"),Rt=Et("moved"),Tt=Et("detached"),xt=Et("error");function Pt(e){return t=>{Ee&&Ot(Ee,e,t)}}function At(e){return t=>{const n=ke();n&&Ot(n,e,t)}}function Et(e){return t=>{je&&Ot(je,e,t)}}function Ot(e,t,n){const o=qe(t);void 0===e[o]&&(e[o]=[]),e[o].push(n)}exports.computed=function(e){const n=function(e){let n,o;return c(e)?(n=e,o=t):(n=e.get,o=e.set),new Ae(n,o,c(e)||!e.set)}(e);return Me(n.effect),n},exports.createApp=function(e){let t,n;if($e(e))t=e,n={};else{if(void 0===e.setup)return App(e);const{setup:o,...s}=e;t=o,n=s}const o=n.onLaunch;return n.onLaunch=function(e){Ie(this);const n=t(e);void 0!==n&&Object.keys(n).forEach((e=>{this[e]=n[e]})),Ie(null),void 0!==o&&o.call(this,e)},n.onShow=et(n,"onShow"),n.onHide=et(n,"onHide"),n.onError=et(n,"onError"),n.onPageNotFound=et(n,"onPageNotFound"),n.onUnhandledRejection=et(n,"onUnhandledRejection"),n.onThemeChange=et(n,"onThemeChange"),App(n)},exports.customRef=function(e){return new Te(e)},exports.defineComponent=function(e,t){let n,o;t={listenPageScroll:!1,canShareToOthers:!1,canShareToTimeline:!1,...t};let s=null;if($e(e))n=e,o={};else{if(void 0===e.setup)return Component(e);const{setup:t,...r}=e;n=t,o=r,o.properties&&(s=Object.keys(o.properties))}void 0===o.lifetimes&&(o.lifetimes={});const r=o.lifetimes.attached||o.attached;o.lifetimes.attached=function(){He(this);const e={};s&&s.forEach((t=>{e[t]=this.data[t]})),this.__props__=he(e);const t={is:this.is,id:this.id,dataset:this.dataset,triggerEvent:this.triggerEvent.bind(this),createSelectorQuery:this.createSelectorQuery.bind(this),createIntersectionObserver:this.createIntersectionObserver.bind(this),selectComponent:this.selectComponent.bind(this),selectAllComponents:this.selectAllComponents.bind(this),selectOwnerComponent:this.selectOwnerComponent.bind(this),getRelationNodes:this.getRelationNodes.bind(this),getTabBar:this.getTabBar.bind(this),getPageId:this.getPageId.bind(this),animate:this.animate.bind(this),clearAnimation:this.clearAnimation.bind(this),getOpenerEventChannel:this.getOpenerEventChannel.bind(this)},o=n(this.__props__,t);void 0!==o&&Object.keys(o).forEach((e=>{const t=o[e];$e(t)?this[e]=t:(this.setData({[e]:tt(t)}),nt.call(this,e,t))})),He(null),void 0!==r&&r.call(this)};const i=rt(o,"detached");return o.lifetimes.detached=function(){i.call(this),this.__effects__&&this.__effects__.forEach((e=>S(e)))},o.lifetimes.ready=at(st.ready,o.lifetimes.ready||o.ready),o.lifetimes.moved=rt(o,"moved"),o.lifetimes.error=rt(o,"error"),void 0===o.methods&&(o.methods={}),(o.methods.onPageScroll||t.listenPageScroll)&&(o.methods.onPageScroll=it(o,"onPageScroll"),o.methods.__listenPageScroll__=()=>!0),void 0===o.methods.onShareAppMessage&&t.canShareToOthers&&(o.methods.onShareAppMessage=function(e){const t=this[qe("onShareAppMessage")];return t?t(e):{}},o.methods.__isInjectedShareToOthersHook__=()=>!0),void 0===o.methods.onShareTimeline&&t.canShareToTimeline&&(o.methods.onShareTimeline=function(){const e=this[qe("onShareTimeline")];return e?e():{}},o.methods.__isInjectedShareToTimelineHook__=()=>!0),void 0===o.methods.onAddToFavorites&&(o.methods.onAddToFavorites=function(e){const t=this[qe("onAddToFavorites")];return t?t(e):{}},o.methods.__isInjectedFavoritesHook__=()=>!0),o.methods.onLoad=it(o,"onLoad"),o.methods.onPullDownRefresh=it(o,"onPullDownRefresh"),o.methods.onReachBottom=it(o,"onReachBottom"),o.methods.onTabItemTap=it(o,"onTabItemTap"),void 0===o.pageLifetimes&&(o.pageLifetimes={}),o.pageLifetimes[st.onShow]=ct(o,"onShow"),o.pageLifetimes[st.onHide]=ct(o,"onHide"),o.pageLifetimes[st.onResize]=ct(o,"onResize"),s&&(void 0===o.observers&&(o.observers={}),s.forEach((e=>{const t=o.observers[e];o.observers[e]=function(n){this.__props__&&(this.__props__[e]=n),void 0!==t&&t.call(this,n)}}))),Component(o)},exports.definePage=function(e,t){let n,o;if(t={listenPageScroll:!1,canShareToOthers:!1,canShareToTimeline:!1,...t},$e(e))n=e,o={};else{if(void 0===e.setup)return Page(e);const{setup:t,...s}=e;n=t,o=s}const s=o.onLoad;o.onLoad=function(e){Ce(this);const t={is:this.is,route:this.route,options:this.options,createSelectorQuery:this.createSelectorQuery.bind(this),createIntersectionObserver:this.createIntersectionObserver.bind(this),selectComponent:this.selectComponent.bind(this),selectAllComponents:this.selectAllComponents.bind(this),getTabBar:this.getTabBar.bind(this),getPageId:this.getPageId.bind(this),animate:this.animate.bind(this),clearAnimation:this.clearAnimation.bind(this),getOpenerEventChannel:this.getOpenerEventChannel.bind(this)},o=n(e,t);void 0!==o&&Object.keys(o).forEach((e=>{const t=o[e];$e(t)?this[e]=t:(this.setData({[e]:tt(t)}),nt.call(this,e,t))})),Ce(null),void 0!==s&&s.call(this,e)};const r=ot(o,"onUnload");return o.onUnload=function(){r.call(this),this.__effects__&&this.__effects__.forEach((e=>S(e)))},(o.onPageScroll||t.listenPageScroll)&&(o.onPageScroll=ot(o,"onPageScroll"),o.__listenPageScroll__=()=>!0),void 0===o.onShareAppMessage&&t.canShareToOthers&&(o.onShareAppMessage=function(e){const t=this[qe("onShareAppMessage")];return t?t(e):{}},o.__isInjectedShareToOthersHook__=()=>!0),void 0===o.onShareTimeline&&t.canShareToTimeline&&(o.onShareTimeline=function(){const e=this[qe("onShareTimeline")];return e?e():{}},o.__isInjectedShareToTimelineHook__=()=>!0),void 0===o.onAddToFavorites&&(o.onAddToFavorites=function(e){const t=this[qe("onAddToFavorites")];return t?t(e):{}},o.__isInjectedFavoritesHook__=()=>!0),o.onShow=ot(o,"onShow"),o.onReady=ot(o,"onReady"),o.onHide=ot(o,"onHide"),o.onPullDownRefresh=ot(o,"onPullDownRefresh"),o.onReachBottom=ot(o,"onReachBottom"),o.onResize=ot(o,"onResize"),o.onTabItemTap=ot(o,"onTabItemTap"),Page(o)},exports.inject=function(e,t,n=!1){return e in Ze?Ze[e]:arguments.length>1?n&&$e(t)?t():t:void 0},exports.isProxy=ve,exports.isReactive=_e,exports.isReadonly=pe,exports.isRef=ye,exports.markRaw=function(e){return((e,t,n)=>{Object.defineProperty(e,t,{configurable:!0,enumerable:!1,value:n})})(e,"__v_skip",!0),e},exports.nextTick=function(e){const t=Ne||De;return e?t.then(e):t},exports.onAddToFavorites=e=>{const t=ke();if(t&&t.__isInjectedFavoritesHook__){const n=qe("onAddToFavorites");void 0===t[n]&&(t[n]=e)}},exports.onAppError=ht,exports.onAppHide=ut,exports.onAppShow=lt,exports.onDetach=Tt,exports.onError=xt,exports.onHide=vt,exports.onLoad=wt,exports.onMove=Rt,exports.onPageNotFound=ft,exports.onPageScroll=e=>{const t=ke();t&&t.__listenPageScroll__&&Ot(t,"onPageScroll",e)},exports.onPullDownRefresh=mt,exports.onReachBottom=yt,exports.onReady=e=>{const t=ke();t&&Ot(t,"onReady",e)},exports.onResize=St,exports.onShareAppMessage=e=>{const t=ke();if(t&&t.onShareAppMessage&&t.__isInjectedShareToOthersHook__){const n=qe("onShareAppMessage");void 0===t[n]&&(t[n]=e)}},exports.onShareTimeline=e=>{const t=ke();if(t&&t.onShareTimeline&&t.__isInjectedShareToTimelineHook__){const n=qe("onShareTimeline");void 0===t[n]&&(t[n]=e)}},exports.onShow=pt,exports.onTabItemTap=bt,exports.onThemeChange=_t,exports.onUnhandledRejection=dt,exports.onUnload=gt,exports.provide=function(e,t){Ze[e]=t},exports.proxyRefs=function(e){return _e(e)?e:new Proxy(e,Re)},exports.reactive=ue,exports.readonly=fe,exports.ref=function(e){return be(e)},exports.shallowReactive=he,exports.shallowReadonly=function(e){return de(e,!0,B,ie)},exports.shallowRef=function(e){return be(e,!0)},exports.toRaw=ge,exports.toRef=Pe,exports.toRefs=function(e){const t=r(e)?new Array(e.length):{};for(const n in e)t[n]=Pe(e,n);return t},exports.triggerRef=function(e){A(ge(e),"set","value",void 0)},exports.unref=we,exports.watch=Je,exports.watchEffect=function(e,t){return Xe(e,null,t)};
