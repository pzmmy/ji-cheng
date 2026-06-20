import"../chunks/Bzak7iHL.js";import{p as D,e as r,r as o,P as c,E as R,Q as T,a as s,b as F,T as l2,g,S as c2,d as $,F as x,O as M,h as z,U as d2,V as J,s as G,y as s2,c as W,f as U,u as L2}from"../chunks/DBTPyyER.js";import{i as j,a as B,p as w2,d as M2}from"../chunks/DEVj8csf.js";import{g as v2}from"../chunks/BzQFXtJd.js";import{A as k2,i as b2,a as y2}from"../chunks/C4826At7.js";import{S as u2}from"../chunks/2k4Cq4Ct.js";import{P as C2,O as N}from"../chunks/DYWenj9E.js";import{c as Q,a as Y,b as r2,s as p2,I as g2,P as h2,j as o2,o as x2}from"../chunks/BDg9sZUs.js";import{A as P2,U as S2}from"../chunks/DNegLIy7.js";import{t as q}from"../chunks/BZWRwi3l.js";import{I as $2}from"../chunks/CJBFm7k9.js";import{n as j2}from"../chunks/BAleDKy5.js";import{s as V2}from"../chunks/qC72EZRq.js";var Z2=z('<div class="analytics-confirmation__actions svelte-bavak5"><!></div>'),H2=z('<div class="analytics-confirmation svelte-bavak5"><h1 class="title text-serif-42 svelte-bavak5"> </h1> <!> <!></div>');function A2(k,e){D(e,!0);const u=()=>l2(g(f),"$appSettings",a),[a,h]=c2(),C=j(u2),f=$(()=>C.appSettings),v=j(C2);var m=H2(),w=r(m),p=r(w,!0);o(w);var _=c(w,2);k2(_,{});var S=c(_,2);{var b=n=>{var l=Z2(),d=r(l);P2(d,{style:"pop",get testId(){return Q.OnboardingPageAnalyticsSettingsContinueButton},icon:"chevron-right",action:async()=>{await C.updateOnboardingComplete(!0),b2(u(),v,!0).then(()=>{v.captureOnboarding(N.ConfirmedAnalytics)})},children:(V,E)=>{x();var Z=M();R(H=>T(Z,H),[()=>q("onboarding.analytics.continue")]),s(V,Z)},$$slots:{default:!0}}),o(l),s(n,l)};B(S,n=>{u()!==void 0&&n(b)})}o(m),R(n=>T(p,n),[()=>q("onboarding.analytics.beforeWeBegin")]),s(k,m),F(),h()}var I2=z('<div class="action__spinner svelte-1czdgcg"><!></div>'),z2=z('<button type="button"><div class="icon svelte-1czdgcg"><!></div> <div class="action__content svelte-1czdgcg"><div class="action__title text-18 text-bold svelte-1czdgcg"> </div> <div><!></div></div> <!></button>');function i2(k,e){const u=w2(e,"loading",3,!1);var a=z2();let h;var C=r(a),f=r(C);Y(f,()=>e.icon),o(C);var v=c(C,2),m=r(v),w=r(m,!0);o(m);var p=c(m,2);let _;var S=r(p);Y(S,()=>e.message),o(p),o(v);var b=c(v,2);{var n=l=>{var d=I2(),V=r(d);g2(V,{name:"spinner"}),o(d),s(l,d)};B(b,l=>{u()&&l(n)})}o(a),R(()=>{h=r2(a,1,"action__wrapper svelte-1czdgcg",null,h,{loading:u(),row:e.row,"row-reverse":e.rowReverse}),a.disabled=u(),p2(a,"data-testid",e.testId),T(w,e.title),_=r2(p,1,"action__message text-12 text-body svelte-1czdgcg",null,_,{"dim-message":e.dimMessage})}),J("click",a,function(...l){var d;(d=e.onclick)==null||d.apply(this,l)}),J("mousedown",a,function(...l){var d;(d=e.onmousedown)==null||d.apply(this,l)}),s(k,a)}d2(["click","mousedown"]);var E2=z('<button type="button" class="link svelte-1kuywir"><!> <span class="text-12"><!></span></button>');function I(k,e){D(e,!0);const u=j(S2);var a=E2(),h=r(a);g2(h,{get name(){return e.icon}});var C=c(h,2),f=r(C);Y(f,()=>e.children),o(C),o(a),J("click",a,async()=>await u.openExternalUrl(e.href)),s(k,a),F()}d2(["click"]);const O2=`<svg width="100" height="90" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M0 12C0 5.37258 5.37258 0 12 0H88C94.6274 0 100 5.37258 100 12V78C100 84.6274 94.6274 90 88 90H12C5.37258 90 0 84.6274 0 78V12Z"
    fill="var(--art-scene-bg)" />
  <path d="M42 39C42 35.6863 44.6863 33 48 33H82V75H48C44.6863 75 42 72.3137 42 69V39Z"
    fill="var(--art-scene-fill)" stroke="var(--art-scene-outline)" stroke-width="1.2" />
  <path d="M18 21C18 17.6863 20.6863 15 24 15H58V57H24C20.6863 57 18 54.3137 18 51V21Z"
    fill="var(--art-scene-fill)" stroke="var(--art-scene-outline)" stroke-width="1.2" />
  <path d="M18 49C18 45.6863 20.6863 43 24 43H58V57H24C20.6863 57 18 54.3137 18 51V49Z"
    fill="var(--art-scene-fill)" stroke="var(--art-scene-outline)" stroke-width="1.2" />
  <path
    d="M23 49C23 48.4477 23.4477 48 24 48H37C37.5523 48 38 48.4477 38 49V60.8675C38 62.5395 36.0703 63.4734 34.7591 62.436L30.5 59.0665L26.2409 62.436C24.9297 63.4734 23 62.5395 23 60.8675V49Z"
    fill="var(--art-scene-outline)" />
</svg>`,B2=`<svg width="100" height="90" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M0 12C0 5.37258 5.37258 0 12 0H88C94.6274 0 100 5.37258 100 12V78C100 84.6274 94.6274 90 88 90H12C5.37258 90 0 84.6274 0 78V12Z"
    fill="var(--art-scene-bg)" />
  <path d="M76 20H32C27.5817 20 24 23.5817 24 28V63C24 67.4183 27.5817 71 32 71H76V20Z"
    fill="var(--art-scene-fill)" stroke="var(--art-scene-outline)" stroke-width="1.2" />
  <path d="M51 28V51M62 39.5L40 39.5" stroke="var(--art-scene-outline)" stroke-width="1.2" />
  <path d="M76 57H31C27.134 57 24 60.134 24 64C24 67.866 27.134 71 31 71H76V57Z"
    fill="var(--art-scene-fill)" stroke="var(--art-scene-outline)" stroke-width="1.2" />
  <path
    d="M32 64C32 63.4477 32.4477 63 33 63H47C47.5523 63 48 63.4477 48 64V77.7443C48 79.4375 46.0272 80.3647 44.7236 79.2841L40 75.3684L35.2764 79.2841C33.9728 80.3647 32 79.4375 32 77.7443V64Z"
    fill="var(--art-scene-outline)" />
</svg>`;var R2=z('<div class="welcome svelte-1tz5j56"><h1 class="welcome-title text-serif-42 svelte-1tz5j56"> </h1> <div class="welcome__actions svelte-1tz5j56"><div class="welcome__actions--repo svelte-1tz5j56"><input type="text" hidden="" data-testid="test-directory-path"/> <!> <!></div> <!></div> <div class="links svelte-1tz5j56"><div class="links__section svelte-1tz5j56"><p class="links__title text-14 text-bold">Quick start</p> <div class="education-links svelte-1tz5j56"><!> <!></div></div> <div class="links__section svelte-1tz5j56"><p class="links__title text-14 text-bold">Join our community</p> <div class="community-links svelte-1tz5j56"><!> <!> <!> <!></div></div></div></div>');function T2(k,e){D(e,!0);const u=j(h2),a=j(C2),h=$(()=>u.serverCapabilities()),C=$(()=>{var t;return((t=g(h).response)==null?void 0:t.canAddProjects)??!0});let f=s2(!1),v=s2(void 0);async function m(){var t;G(f,!0);try{const L=(t=g(v))==null?void 0:t.value,i=await u.addProject(L??"");a.captureOnboarding(N.AddLocalProject),i&&x2(i)}catch(L){a.captureOnboarding(N.AddLocalProjectFailed,L)}finally{G(f,!1)}}async function w(){v2("/onboarding/clone")}var p=R2(),_=r(p),S=r(_,!0);o(_);var b=c(_,2),n=r(b),l=r(n);M2(l,t=>G(v,t),()=>g(v));var d=c(l,2);{var V=t=>{i2(t,{title:"Add local project",get loading(){return g(f)},onclick:m,dimMessage:!0,get testId(){return Q.WelcomePageAddLocalProjectButton},icon:P=>{var A=W(),_2=U(A);o2(_2,()=>B2),s(P,A)},message:P=>{x();var A=M("Should be a valid git repository");s(P,A)},$$slots:{icon:!0,message:!0}})};B(d,t=>{g(C)&&t(V)})}var E=c(d,2);i2(E,{title:"Clone repository",onclick:w,dimMessage:!0,icon:i=>{var P=W(),A=U(P);o2(A,()=>O2),s(i,P)},message:i=>{x();var P=M("Clone a repo using a URL");s(i,P)},$$slots:{icon:!0,message:!0}}),o(n);var Z=c(n,2);y2(Z,{}),o(b);var H=c(b,2),O=r(H),y=c(r(O),2),K=r(y);I(K,{icon:"docs",href:"https://docs.gitbutler.com/features/virtual-branches/branch-lanes",children:(t,L)=>{x();var i=M("GitButler docs");s(t,i)},$$slots:{default:!0}});var f2=c(K,2);I(f2,{icon:"youtube",href:"https://www.youtube.com/@gitbutlerapp",children:(t,L)=>{x();var i=M("Watch tutorials");s(t,i)},$$slots:{default:!0}}),o(y),o(O);var X=c(O,2),t2=c(r(X),2),e2=r(t2);I(e2,{icon:"discord",href:"https://discord.gg/MmFkmaJ42D",children:(t,L)=>{x();var i=M("Discord");s(t,i)},$$slots:{default:!0}});var n2=c(e2,2);I(n2,{icon:"bluesky",href:"https://bsky.app/profile/gitbutler.com",children:(t,L)=>{x();var i=M("Bluesky");s(t,i)},$$slots:{default:!0}});var a2=c(n2,2);I(a2,{icon:"instagram",href:"https://www.instagram.com/gitbutler/",children:(t,L)=>{x();var i=M("Instagram");s(t,i)},$$slots:{default:!0}});var m2=c(a2,2);I(m2,{icon:"youtube",href:"https://www.youtube.com/@gitbutlerapp",children:(t,L)=>{x();var i=M("YouTube");s(t,i)},$$slots:{default:!0}}),o(t2),o(X),o(H),o(p),R(t=>{p2(p,"data-testid",Q.WelcomePage),T(S,t)},[()=>q("onboarding.welcome.title")]),s(k,p),F()}const W2=`<svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse opacity="0.12" cx="236.439" cy="387.746" rx="124.59" ry="9.24645"
    fill="var(--art-scene-outline)" />
  <path
    d="M68.7074 191L164.207 4L161.707 65.5L203.207 26.5L191.207 74L228.707 49.5L219.207 117.5M300.707 201L346.707 218L257.207 248"
    stroke="#5BC7C7" stroke-width="1.2" />
  <path
    d="M199.207 244.5L204.899 246.397L204.899 246.397L199.207 244.5ZM208.471 178.442C207.886 175.18 204.769 173.01 201.507 173.594C198.245 174.178 196.074 177.296 196.659 180.558L208.471 178.442ZM157.957 285C181.959 285 198.463 265.707 204.899 246.397L193.515 242.603C187.952 259.293 174.741 273 157.957 273V285ZM204.899 246.397C205.859 243.52 206.693 238.855 207.385 233.638C208.097 228.27 208.715 221.864 209.14 215.242C209.976 202.188 210.109 187.59 208.471 178.442L196.659 180.558C198.02 188.16 197.996 201.498 197.164 214.475C196.754 220.869 196.161 227.001 195.489 232.059C194.798 237.268 194.077 240.917 193.515 242.603L204.899 246.397Z"
    fill="var(--art-scene-outline)" />
  <path
    d="M270.272 334.848C291.485 334.848 330.145 356.9 337.764 389.057H230.633H136.995C141.305 366.569 177.463 334.577 206.328 334.577L239.842 198.374L251.148 200.087L263.482 202.485L270.272 334.848Z"
    fill="var(--art-scene-fill)" />
  <path
    d="M251.148 200.087L230.633 389.057M251.148 200.087L263.482 202.485L270.272 334.848C291.485 334.848 330.145 356.9 337.764 389.057H230.633M251.148 200.087L239.842 198.374L206.328 334.577C177.463 334.577 141.305 366.569 136.995 389.057H230.633"
    stroke="var(--art-scene-outline)" stroke-width="1.2" />
  <path
    d="M277.567 69.5366C287.306 67.834 296.596 74.3052 298.374 84.0307L307.026 131.358C308.095 137.211 311.989 142.157 317.426 144.572L326.394 148.555C331.903 151.001 335.822 156.043 336.833 161.985L338.702 172.968C340.368 182.751 333.801 192.036 324.022 193.726L180.537 218.517C170.724 220.213 161.398 213.618 159.727 203.8L143.947 111.087C142.284 101.317 148.831 92.0417 158.592 90.3352L277.567 69.5366Z"
    fill="var(--art-scene-fill)" stroke="var(--art-scene-outline)" stroke-width="1.2" />
  <path
    d="M207.289 200.368L210.186 218.596L225.409 208.728L242.587 213.383L240.134 195.411L224.354 204.174L207.289 200.368Z"
    fill="var(--art-scene-outline)" />
  <path
    d="M268.879 203.236L273.599 202.448C283.427 200.808 290.053 191.495 288.38 181.672L272.541 88.652C270.864 78.8049 261.49 72.2063 251.654 73.9499L250.173 74.2125"
    stroke="var(--art-scene-outline)" stroke-width="1.2" />
  <rect opacity="0.13" x="152.315" y="101.926" width="110.438" height="101.801" rx="7.86364"
    transform="rotate(-9.65945 152.315 101.926)" fill="var(--art-scene-outline)" />
  <path
    d="M177.097 157.175C173.495 134.97 172.731 117.018 184.9 114.375C197.068 111.733 201.571 127.972 204.215 152.189"
    stroke="var(--art-scene-outline)" stroke-width="1.2" />
  <path
    d="M225.078 147.972C221.476 125.767 220.463 109.313 232.632 106.671C244.8 104.028 249.638 118.859 252.282 143.076"
    stroke="var(--art-scene-outline)" stroke-width="1.2" />
  <path
    d="M236.314 156.793C237.674 166.315 236.058 180.326 221.079 183.453C206.101 186.58 198.228 175.564 198.228 163.866"
    stroke="var(--art-scene-outline)" stroke-width="1.2" />
  <path
    d="M313.502 169.268L325.949 162.811M314.618 175.826L327.066 169.37M315.734 182.382L328.182 175.925"
    stroke="var(--art-scene-outline)" stroke-width="1.2" />
  <path
    d="M309.113 161.442C308.529 158.18 305.411 156.01 302.15 156.594C298.888 157.178 296.717 160.296 297.301 163.558L309.113 161.442ZM244.457 217.75C252.042 217.75 262.963 219.885 274.242 221.42C279.616 222.151 285.039 222.727 289.671 222.643C291.995 222.601 294.33 222.392 296.472 221.862C298.575 221.343 300.92 220.411 302.823 218.616L294.591 209.884C294.745 209.739 294.589 209.967 293.594 210.213C292.637 210.449 291.276 210.612 289.454 210.645C285.798 210.711 281.142 210.249 275.86 209.53C265.827 208.165 253.123 205.75 244.457 205.75V217.75ZM302.823 218.616C305.872 215.741 307.555 211.306 308.599 207.221C309.708 202.88 310.369 197.786 310.696 192.555C311.348 182.104 310.706 170.333 309.113 161.442L297.301 163.558C298.709 171.417 299.317 182.221 298.719 191.808C298.42 196.596 297.832 200.886 296.972 204.25C296.048 207.869 295.042 209.459 294.591 209.884L302.823 218.616Z"
    fill="var(--art-scene-outline)" />
  <path
    d="M248.457 205.937C244.629 197.883 234.184 197.607 231.835 202.761C222.593 202.361 201.327 207.498 188.19 219.642C171.769 234.822 173.083 258.884 186.565 257.232C194.112 256.307 191.134 244.167 194.917 237.699C196.346 245.143 200.116 250.561 205.459 251.417C210.802 252.274 214.895 251.148 219.385 247.64C223.007 247.796 231.06 247.524 238.284 241.7C247.092 234.6 246.132 228.026 242.917 224.259C248.851 223.014 252.586 214.624 248.457 205.937Z"
    fill="var(--art-scene-fill)" />
  <path
    d="M231.835 202.761C234.184 197.607 244.629 197.883 248.457 205.937C252.586 214.624 248.851 223.014 242.917 224.259M231.835 202.761C222.593 202.361 201.327 207.498 188.19 219.642C171.769 234.822 173.083 258.884 186.565 257.232C194.112 256.307 191.134 244.167 194.917 237.699M231.835 202.761C234.146 203.319 238.284 205.562 239.52 210.687M242.917 224.259C246.132 228.026 247.092 234.6 238.284 241.7C231.06 247.524 223.007 247.796 219.385 247.64M242.917 224.259C241.943 223.294 240.637 222.632 239.115 222.353M219.385 247.64C214.895 251.148 210.802 252.274 205.459 251.417C200.116 250.561 196.346 245.143 194.917 237.699M219.385 247.64C205.745 244.798 202.434 228.765 213.638 218.49M194.917 237.699C194.317 234.212 195.121 225.904 200.332 221.125M222.275 232.876C227.742 224.245 234.449 221.499 239.115 222.353M239.115 222.353C239.625 221.569 240.545 218.463 240.395 216.313"
    stroke="var(--art-scene-outline)" stroke-width="1.2" />
  <path
    d="M142.032 190.085L177.717 258.101L228.961 251.858L231.974 264.969L171.941 272.161L99.4723 278.425L61.2457 204.318L131.672 191.98L142.032 190.085Z"
    fill="var(--art-scene-fill)" />
  <path
    d="M171.941 272.161L231.974 264.969L228.961 251.858L177.717 258.101L142.032 190.085L131.672 191.98M171.941 272.161L99.4723 278.425L61.2457 204.318L131.672 191.98M171.941 272.161L131.672 191.98"
    stroke="var(--art-scene-outline)" stroke-width="1.2" />
  <path
    d="M163.957 272.75C165.207 289.75 157.256 294.348 148.207 292.375C134.707 301.5 114.057 303.55 98.9574 296.25C79.1249 286.662 79.0567 260.81 80.9574 256.375C82.8324 252 88.0199 252.25 89.3324 253.625C89.3324 248.625 90.8575 244.441 95.8949 243.938C100.27 243.5 103.166 248.375 104.207 251.125C104.832 248.5 106.727 246.784 109.832 246.875C120.52 247.188 117.207 269.125 128.582 275.625L152.768 273.659L163.957 272.75Z"
    fill="var(--art-scene-fill)" />
  <path
    d="M148.207 292.375C157.256 294.348 165.207 289.75 163.957 272.75L152.768 273.659M148.207 292.375C134.707 301.5 114.057 303.55 98.9574 296.25C79.1249 286.662 79.0567 260.81 80.9574 256.375C82.8324 252 88.0199 252.25 89.3324 253.625M148.207 292.375C150.227 291.106 153.966 285.587 152.768 273.659M89.3324 253.625C89.3324 248.625 90.8575 244.441 95.8949 243.938C100.27 243.5 103.166 248.375 104.207 251.125M89.3324 253.625C89.2908 259.125 90.7699 272.75 99.7699 282.188M104.207 251.125C104.832 248.5 106.727 246.784 109.832 246.875C120.52 247.188 117.207 269.125 128.582 275.625L152.768 273.659M104.207 251.125C103.791 256.792 105.57 270.963 113.02 279.313M112.832 286.625C114.937 288.146 120.37 291.712 123.27 292.812M121.77 283.438C123.645 284.875 128.332 287.75 131.145 288.75M103.77 289.75C105.499 291.042 110.92 294.387 114.27 295.188"
    stroke="var(--art-scene-outline)" stroke-width="1.2" />
  <ellipse opacity="0.16" cx="114.019" cy="235.144" rx="6.95152" ry="9.59788"
    transform="rotate(-27.0243 114.019 235.144)" fill="var(--art-scene-outline)" />
</svg>`;function n1(k,e){D(e,!0);const u=()=>l2(g(f),"$appSettings",a),[a,h]=c2(),C=j(u2),f=$(()=>C.appSettings),v=$(()=>{var n;return(n=u())==null?void 0:n.onboardingComplete}),m=j(h2),w=$(()=>m.projects());L2(()=>{g(w).response&&g(w).response.length>0&&V2(50).then(()=>{v2("/")})});var p=W(),_=U(p);{var S=n=>{var l=M("loading...");s(n,l)},b=n=>{{let l=$(()=>g(v)?j2:W2);$2(n,{get img(){return g(l)},get testId(){return Q.OnboardingPage},children:(d,V)=>{var E=W(),Z=U(E);{var H=y=>{T2(y,{})},O=y=>{A2(y,{})};B(Z,y=>{g(v)?y(H):y(O,-1)})}s(d,E)},$$slots:{default:!0}})}};B(_,n=>{g(v)===void 0?n(S):n(b,-1)})}s(k,p),F(),h()}export{n1 as component};
//# sourceMappingURL=10.C2PcDDlI.js.map
