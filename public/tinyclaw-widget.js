(function(w,y){typeof exports=="object"&&typeof module<"u"?y(exports):typeof define=="function"&&define.amd?define(["exports"],y):(w=typeof globalThis<"u"?globalThis:w||self,y(w.TinyClaw={}))})(this,function(w){"use strict";var mt=Object.defineProperty;var wt=(w,y,S)=>y in w?mt(w,y,{enumerable:!0,configurable:!0,writable:!0,value:S}):w[y]=S;var d=(w,y,S)=>wt(w,typeof y!="symbol"?y+"":y,S);var F;function y(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var S=y();function ne(s){S=s}var T={exec:()=>null};function f(s,e=""){let t=typeof s=="string"?s:s.source,r={replace:(n,a)=>{let l=typeof a=="string"?a:a.source;return l=l.replace(v.caret,"$1"),t=t.replace(n,l),r},getRegex:()=>new RegExp(t,e)};return r}var _e=(()=>{try{return!!new RegExp("(?<=1)(?<!1)")}catch{return!1}})(),v={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] +\S/,listReplaceTask:/^\[[ xX]\] +/,listTaskCheckbox:/\[[ xX]\]/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,unescapeTest:/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:s=>new RegExp(`^( {0,3}${s})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:s=>new RegExp(`^ {0,${Math.min(3,s-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:s=>new RegExp(`^ {0,${Math.min(3,s-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:s=>new RegExp(`^ {0,${Math.min(3,s-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:s=>new RegExp(`^ {0,${Math.min(3,s-1)}}#`),htmlBeginRegex:s=>new RegExp(`^ {0,${Math.min(3,s-1)}}<(?:[a-z].*>|!--)`,"i"),blockquoteBeginRegex:s=>new RegExp(`^ {0,${Math.min(3,s-1)}}>`)},Re=/^(?:[ \t]*(?:\n|$))+/,Te=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,Ce=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,A=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,Ee=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,j=/ {0,3}(?:[*+-]|\d{1,9}[.)])/,re=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,ie=f(re).replace(/bull/g,j).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),Ae=f(re).replace(/bull/g,j).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),Z=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,Le=/^[^\n]+/,K=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,ze=f(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",K).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),Pe=f(/^(bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,j).getRegex(),B="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",W=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,Ie=f("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",W).replace("tag",B).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),ae=f(Z).replace("hr",A).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",B).getRegex(),Be=f(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",ae).getRegex(),G={blockquote:Be,code:Te,def:ze,fences:Ce,heading:Ee,hr:A,html:Ie,lheading:ie,list:Pe,newline:Re,paragraph:ae,table:T,text:Le},le=f("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",A).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",B).getRegex(),Me={...G,lheading:Ae,table:le,paragraph:f(Z).replace("hr",A).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",le).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",B).getRegex()},De={...G,html:f(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",W).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:T,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:f(Z).replace("hr",A).replace("heading",` *#{1,6} *[^
]`).replace("lheading",ie).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},qe=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,Oe=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,oe=/^( {2,}|\\)\n(?!\s*$)/,Ne=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,M=/[\p{P}\p{S}]/u,Y=/[\s\p{P}\p{S}]/u,ce=/[^\s\p{P}\p{S}]/u,Fe=f(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,Y).getRegex(),he=/(?!~)[\p{P}\p{S}]/u,He=/(?!~)[\s\p{P}\p{S}]/u,je=/(?:[^\s\p{P}\p{S}]|~)/u,pe=/(?![*_])[\p{P}\p{S}]/u,Ze=/(?![*_])[\s\p{P}\p{S}]/u,Ke=/(?:[^\s\p{P}\p{S}]|[*_])/u,We=f(/link|precode-code|html/,"g").replace("link",/\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-",_e?"(?<!`)()":"(^^|[^`])").replace("code",/(?<b>`+)[^`]+\k<b>(?!`)/).replace("html",/<(?! )[^<>]*?>/).getRegex(),de=/^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/,Ge=f(de,"u").replace(/punct/g,M).getRegex(),Ye=f(de,"u").replace(/punct/g,he).getRegex(),ue="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",Qe=f(ue,"gu").replace(/notPunctSpace/g,ce).replace(/punctSpace/g,Y).replace(/punct/g,M).getRegex(),Ue=f(ue,"gu").replace(/notPunctSpace/g,je).replace(/punctSpace/g,He).replace(/punct/g,he).getRegex(),Ve=f("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,ce).replace(/punctSpace/g,Y).replace(/punct/g,M).getRegex(),Xe=f(/^~~?(?:((?!~)punct)|[^\s~])/,"u").replace(/punct/g,pe).getRegex(),Je="^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)",et=f(Je,"gu").replace(/notPunctSpace/g,Ke).replace(/punctSpace/g,Ze).replace(/punct/g,pe).getRegex(),tt=f(/\\(punct)/,"gu").replace(/punct/g,M).getRegex(),st=f(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),nt=f(W).replace("(?:-->|$)","-->").getRegex(),rt=f("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",nt).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),D=/(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+[^`]*?`+(?!`)|[^\[\]\\`])*?/,it=f(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label",D).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),ge=f(/^!?\[(label)\]\[(ref)\]/).replace("label",D).replace("ref",K).getRegex(),be=f(/^!?\[(ref)\](?:\[\])?/).replace("ref",K).getRegex(),at=f("reflink|nolink(?!\\()","g").replace("reflink",ge).replace("nolink",be).getRegex(),fe=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,Q={_backpedal:T,anyPunctuation:tt,autolink:st,blockSkip:We,br:oe,code:Oe,del:T,delLDelim:T,delRDelim:T,emStrongLDelim:Ge,emStrongRDelimAst:Qe,emStrongRDelimUnd:Ve,escape:qe,link:it,nolink:be,punctuation:Fe,reflink:ge,reflinkSearch:at,tag:rt,text:Ne,url:T},lt={...Q,link:f(/^!?\[(label)\]\((.*?)\)/).replace("label",D).getRegex(),reflink:f(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",D).getRegex()},U={...Q,emStrongRDelimAst:Ue,emStrongLDelim:Ye,delLDelim:Xe,delRDelim:et,url:f(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol",fe).replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:f(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol",fe).getRegex()},ot={...U,br:f(oe).replace("{2,}","*").getRegex(),text:f(U.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},q={normal:G,gfm:Me,pedantic:De},L={normal:Q,gfm:U,breaks:ot,pedantic:lt},ct={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},ke=s=>ct[s];function R(s,e){if(e){if(v.escapeTest.test(s))return s.replace(v.escapeReplace,ke)}else if(v.escapeTestNoEncode.test(s))return s.replace(v.escapeReplaceNoEncode,ke);return s}function xe(s){try{s=encodeURI(s).replace(v.percentDecode,"%")}catch{return null}return s}function me(s,e){var a;let t=s.replace(v.findPipe,(l,i,h)=>{let o=!1,p=i;for(;--p>=0&&h[p]==="\\";)o=!o;return o?"|":" |"}),r=t.split(v.splitPipe),n=0;if(r[0].trim()||r.shift(),r.length>0&&!((a=r.at(-1))!=null&&a.trim())&&r.pop(),e)if(r.length>e)r.splice(e);else for(;r.length<e;)r.push("");for(;n<r.length;n++)r[n]=r[n].trim().replace(v.slashPipe,"|");return r}function z(s,e,t){let r=s.length;if(r===0)return"";let n=0;for(;n<r&&s.charAt(r-n-1)===e;)n++;return s.slice(0,r-n)}function ht(s,e){if(s.indexOf(e[1])===-1)return-1;let t=0;for(let r=0;r<s.length;r++)if(s[r]==="\\")r++;else if(s[r]===e[0])t++;else if(s[r]===e[1]&&(t--,t<0))return r;return t>0?-2:-1}function pt(s,e=0){let t=e,r="";for(let n of s)if(n==="	"){let a=4-t%4;r+=" ".repeat(a),t+=a}else r+=n,t++;return r}function we(s,e,t,r,n){let a=e.href,l=e.title||null,i=s[1].replace(n.other.outputLinkReplace,"$1");r.state.inLink=!0;let h={type:s[0].charAt(0)==="!"?"image":"link",raw:t,href:a,title:l,text:i,tokens:r.inlineTokens(i)};return r.state.inLink=!1,h}function dt(s,e,t){let r=s.match(t.other.indentCodeCompensation);if(r===null)return e;let n=r[1];return e.split(`
`).map(a=>{let l=a.match(t.other.beginningSpace);if(l===null)return a;let[i]=l;return i.length>=n.length?a.slice(n.length):a}).join(`
`)}var O=class{constructor(s){d(this,"options");d(this,"rules");d(this,"lexer");this.options=s||S}space(s){let e=this.rules.block.newline.exec(s);if(e&&e[0].length>0)return{type:"space",raw:e[0]}}code(s){let e=this.rules.block.code.exec(s);if(e){let t=e[0].replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:e[0],codeBlockStyle:"indented",text:this.options.pedantic?t:z(t,`
`)}}}fences(s){let e=this.rules.block.fences.exec(s);if(e){let t=e[0],r=dt(t,e[3]||"",this.rules);return{type:"code",raw:t,lang:e[2]?e[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):e[2],text:r}}}heading(s){let e=this.rules.block.heading.exec(s);if(e){let t=e[2].trim();if(this.rules.other.endingHash.test(t)){let r=z(t,"#");(this.options.pedantic||!r||this.rules.other.endingSpaceChar.test(r))&&(t=r.trim())}return{type:"heading",raw:e[0],depth:e[1].length,text:t,tokens:this.lexer.inline(t)}}}hr(s){let e=this.rules.block.hr.exec(s);if(e)return{type:"hr",raw:z(e[0],`
`)}}blockquote(s){let e=this.rules.block.blockquote.exec(s);if(e){let t=z(e[0],`
`).split(`
`),r="",n="",a=[];for(;t.length>0;){let l=!1,i=[],h;for(h=0;h<t.length;h++)if(this.rules.other.blockquoteStart.test(t[h]))i.push(t[h]),l=!0;else if(!l)i.push(t[h]);else break;t=t.slice(h);let o=i.join(`
`),p=o.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");r=r?`${r}
${o}`:o,n=n?`${n}
${p}`:p;let g=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(p,a,!0),this.lexer.state.top=g,t.length===0)break;let u=a.at(-1);if((u==null?void 0:u.type)==="code")break;if((u==null?void 0:u.type)==="blockquote"){let c=u,x=c.raw+`
`+t.join(`
`),b=this.blockquote(x);a[a.length-1]=b,r=r.substring(0,r.length-c.raw.length)+b.raw,n=n.substring(0,n.length-c.text.length)+b.text;break}else if((u==null?void 0:u.type)==="list"){let c=u,x=c.raw+`
`+t.join(`
`),b=this.list(x);a[a.length-1]=b,r=r.substring(0,r.length-u.raw.length)+b.raw,n=n.substring(0,n.length-c.raw.length)+b.raw,t=x.substring(a.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:r,tokens:a,text:n}}}list(s){var t,r;let e=this.rules.block.list.exec(s);if(e){let n=e[1].trim(),a=n.length>1,l={type:"list",raw:"",ordered:a,start:a?+n.slice(0,-1):"",loose:!1,items:[]};n=a?`\\d{1,9}\\${n.slice(-1)}`:`\\${n}`,this.options.pedantic&&(n=a?n:"[*+-]");let i=this.rules.other.listItemRegex(n),h=!1;for(;s;){let p=!1,g="",u="";if(!(e=i.exec(s))||this.rules.block.hr.test(s))break;g=e[0],s=s.substring(g.length);let c=pt(e[2].split(`
`,1)[0],e[1].length),x=s.split(`
`,1)[0],b=!c.trim(),m=0;if(this.options.pedantic?(m=2,u=c.trimStart()):b?m=e[1].length+1:(m=c.search(this.rules.other.nonSpaceChar),m=m>4?1:m,u=c.slice(m),m+=e[1].length),b&&this.rules.other.blankLine.test(x)&&(g+=x+`
`,s=s.substring(x.length+1),p=!0),!p){let E=this.rules.other.nextBulletRegex(m),H=this.rules.other.hrRegex(m),Se=this.rules.other.fencesBeginRegex(m),$e=this.rules.other.headingBeginRegex(m),kt=this.rules.other.htmlBeginRegex(m),xt=this.rules.other.blockquoteBeginRegex(m);for(;s;){let ee=s.split(`
`,1)[0],I;if(x=ee,this.options.pedantic?(x=x.replace(this.rules.other.listReplaceNesting,"  "),I=x):I=x.replace(this.rules.other.tabCharGlobal,"    "),Se.test(x)||$e.test(x)||kt.test(x)||xt.test(x)||E.test(x)||H.test(x))break;if(I.search(this.rules.other.nonSpaceChar)>=m||!x.trim())u+=`
`+I.slice(m);else{if(b||c.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||Se.test(c)||$e.test(c)||H.test(c))break;u+=`
`+x}b=!x.trim(),g+=ee+`
`,s=s.substring(ee.length+1),c=I.slice(m)}}l.loose||(h?l.loose=!0:this.rules.other.doubleBlankLine.test(g)&&(h=!0)),l.items.push({type:"list_item",raw:g,task:!!this.options.gfm&&this.rules.other.listIsTask.test(u),loose:!1,text:u,tokens:[]}),l.raw+=g}let o=l.items.at(-1);if(o)o.raw=o.raw.trimEnd(),o.text=o.text.trimEnd();else return;l.raw=l.raw.trimEnd();for(let p of l.items){if(this.lexer.state.top=!1,p.tokens=this.lexer.blockTokens(p.text,[]),p.task){if(p.text=p.text.replace(this.rules.other.listReplaceTask,""),((t=p.tokens[0])==null?void 0:t.type)==="text"||((r=p.tokens[0])==null?void 0:r.type)==="paragraph"){p.tokens[0].raw=p.tokens[0].raw.replace(this.rules.other.listReplaceTask,""),p.tokens[0].text=p.tokens[0].text.replace(this.rules.other.listReplaceTask,"");for(let u=this.lexer.inlineQueue.length-1;u>=0;u--)if(this.rules.other.listIsTask.test(this.lexer.inlineQueue[u].src)){this.lexer.inlineQueue[u].src=this.lexer.inlineQueue[u].src.replace(this.rules.other.listReplaceTask,"");break}}let g=this.rules.other.listTaskCheckbox.exec(p.raw);if(g){let u={type:"checkbox",raw:g[0]+" ",checked:g[0]!=="[ ]"};p.checked=u.checked,l.loose?p.tokens[0]&&["paragraph","text"].includes(p.tokens[0].type)&&"tokens"in p.tokens[0]&&p.tokens[0].tokens?(p.tokens[0].raw=u.raw+p.tokens[0].raw,p.tokens[0].text=u.raw+p.tokens[0].text,p.tokens[0].tokens.unshift(u)):p.tokens.unshift({type:"paragraph",raw:u.raw,text:u.raw,tokens:[u]}):p.tokens.unshift(u)}}if(!l.loose){let g=p.tokens.filter(c=>c.type==="space"),u=g.length>0&&g.some(c=>this.rules.other.anyLine.test(c.raw));l.loose=u}}if(l.loose)for(let p of l.items){p.loose=!0;for(let g of p.tokens)g.type==="text"&&(g.type="paragraph")}return l}}html(s){let e=this.rules.block.html.exec(s);if(e)return{type:"html",block:!0,raw:e[0],pre:e[1]==="pre"||e[1]==="script"||e[1]==="style",text:e[0]}}def(s){let e=this.rules.block.def.exec(s);if(e){let t=e[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),r=e[2]?e[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",n=e[3]?e[3].substring(1,e[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):e[3];return{type:"def",tag:t,raw:e[0],href:r,title:n}}}table(s){var l;let e=this.rules.block.table.exec(s);if(!e||!this.rules.other.tableDelimiter.test(e[2]))return;let t=me(e[1]),r=e[2].replace(this.rules.other.tableAlignChars,"").split("|"),n=(l=e[3])!=null&&l.trim()?e[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],a={type:"table",raw:e[0],header:[],align:[],rows:[]};if(t.length===r.length){for(let i of r)this.rules.other.tableAlignRight.test(i)?a.align.push("right"):this.rules.other.tableAlignCenter.test(i)?a.align.push("center"):this.rules.other.tableAlignLeft.test(i)?a.align.push("left"):a.align.push(null);for(let i=0;i<t.length;i++)a.header.push({text:t[i],tokens:this.lexer.inline(t[i]),header:!0,align:a.align[i]});for(let i of n)a.rows.push(me(i,a.header.length).map((h,o)=>({text:h,tokens:this.lexer.inline(h),header:!1,align:a.align[o]})));return a}}lheading(s){let e=this.rules.block.lheading.exec(s);if(e)return{type:"heading",raw:e[0],depth:e[2].charAt(0)==="="?1:2,text:e[1],tokens:this.lexer.inline(e[1])}}paragraph(s){let e=this.rules.block.paragraph.exec(s);if(e){let t=e[1].charAt(e[1].length-1)===`
`?e[1].slice(0,-1):e[1];return{type:"paragraph",raw:e[0],text:t,tokens:this.lexer.inline(t)}}}text(s){let e=this.rules.block.text.exec(s);if(e)return{type:"text",raw:e[0],text:e[0],tokens:this.lexer.inline(e[0])}}escape(s){let e=this.rules.inline.escape.exec(s);if(e)return{type:"escape",raw:e[0],text:e[1]}}tag(s){let e=this.rules.inline.tag.exec(s);if(e)return!this.lexer.state.inLink&&this.rules.other.startATag.test(e[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(e[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(e[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(e[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:e[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:e[0]}}link(s){let e=this.rules.inline.link.exec(s);if(e){let t=e[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(t)){if(!this.rules.other.endAngleBracket.test(t))return;let a=z(t.slice(0,-1),"\\");if((t.length-a.length)%2===0)return}else{let a=ht(e[2],"()");if(a===-2)return;if(a>-1){let l=(e[0].indexOf("!")===0?5:4)+e[1].length+a;e[2]=e[2].substring(0,a),e[0]=e[0].substring(0,l).trim(),e[3]=""}}let r=e[2],n="";if(this.options.pedantic){let a=this.rules.other.pedanticHrefTitle.exec(r);a&&(r=a[1],n=a[3])}else n=e[3]?e[3].slice(1,-1):"";return r=r.trim(),this.rules.other.startAngleBracket.test(r)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(t)?r=r.slice(1):r=r.slice(1,-1)),we(e,{href:r&&r.replace(this.rules.inline.anyPunctuation,"$1"),title:n&&n.replace(this.rules.inline.anyPunctuation,"$1")},e[0],this.lexer,this.rules)}}reflink(s,e){let t;if((t=this.rules.inline.reflink.exec(s))||(t=this.rules.inline.nolink.exec(s))){let r=(t[2]||t[1]).replace(this.rules.other.multipleSpaceGlobal," "),n=e[r.toLowerCase()];if(!n){let a=t[0].charAt(0);return{type:"text",raw:a,text:a}}return we(t,n,t[0],this.lexer,this.rules)}}emStrong(s,e,t=""){let r=this.rules.inline.emStrongLDelim.exec(s);if(!(!r||r[3]&&t.match(this.rules.other.unicodeAlphaNumeric))&&(!(r[1]||r[2])||!t||this.rules.inline.punctuation.exec(t))){let n=[...r[0]].length-1,a,l,i=n,h=0,o=r[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(o.lastIndex=0,e=e.slice(-1*s.length+n);(r=o.exec(e))!=null;){if(a=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!a)continue;if(l=[...a].length,r[3]||r[4]){i+=l;continue}else if((r[5]||r[6])&&n%3&&!((n+l)%3)){h+=l;continue}if(i-=l,i>0)continue;l=Math.min(l,l+i+h);let p=[...r[0]][0].length,g=s.slice(0,n+r.index+p+l);if(Math.min(n,l)%2){let c=g.slice(1,-1);return{type:"em",raw:g,text:c,tokens:this.lexer.inlineTokens(c)}}let u=g.slice(2,-2);return{type:"strong",raw:g,text:u,tokens:this.lexer.inlineTokens(u)}}}}codespan(s){let e=this.rules.inline.code.exec(s);if(e){let t=e[2].replace(this.rules.other.newLineCharGlobal," "),r=this.rules.other.nonSpaceChar.test(t),n=this.rules.other.startingSpaceChar.test(t)&&this.rules.other.endingSpaceChar.test(t);return r&&n&&(t=t.substring(1,t.length-1)),{type:"codespan",raw:e[0],text:t}}}br(s){let e=this.rules.inline.br.exec(s);if(e)return{type:"br",raw:e[0]}}del(s,e,t=""){let r=this.rules.inline.delLDelim.exec(s);if(r&&(!r[1]||!t||this.rules.inline.punctuation.exec(t))){let n=[...r[0]].length-1,a,l,i=n,h=this.rules.inline.delRDelim;for(h.lastIndex=0,e=e.slice(-1*s.length+n);(r=h.exec(e))!=null;){if(a=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!a||(l=[...a].length,l!==n))continue;if(r[3]||r[4]){i+=l;continue}if(i-=l,i>0)continue;l=Math.min(l,l+i);let o=[...r[0]][0].length,p=s.slice(0,n+r.index+o+l),g=p.slice(n,-n);return{type:"del",raw:p,text:g,tokens:this.lexer.inlineTokens(g)}}}}autolink(s){let e=this.rules.inline.autolink.exec(s);if(e){let t,r;return e[2]==="@"?(t=e[1],r="mailto:"+t):(t=e[1],r=t),{type:"link",raw:e[0],text:t,href:r,tokens:[{type:"text",raw:t,text:t}]}}}url(s){var t;let e;if(e=this.rules.inline.url.exec(s)){let r,n;if(e[2]==="@")r=e[0],n="mailto:"+r;else{let a;do a=e[0],e[0]=((t=this.rules.inline._backpedal.exec(e[0]))==null?void 0:t[0])??"";while(a!==e[0]);r=e[0],e[1]==="www."?n="http://"+e[0]:n=e[0]}return{type:"link",raw:e[0],text:r,href:n,tokens:[{type:"text",raw:r,text:r}]}}}inlineText(s){let e=this.rules.inline.text.exec(s);if(e){let t=this.lexer.state.inRawBlock;return{type:"text",raw:e[0],text:e[0],escaped:t}}}},$=class te{constructor(e){d(this,"tokens");d(this,"options");d(this,"state");d(this,"inlineQueue");d(this,"tokenizer");this.tokens=[],this.tokens.links=Object.create(null),this.options=e||S,this.options.tokenizer=this.options.tokenizer||new O,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let t={other:v,block:q.normal,inline:L.normal};this.options.pedantic?(t.block=q.pedantic,t.inline=L.pedantic):this.options.gfm&&(t.block=q.gfm,this.options.breaks?t.inline=L.breaks:t.inline=L.gfm),this.tokenizer.rules=t}static get rules(){return{block:q,inline:L}}static lex(e,t){return new te(t).lex(e)}static lexInline(e,t){return new te(t).inlineTokens(e)}lex(e){e=e.replace(v.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let t=0;t<this.inlineQueue.length;t++){let r=this.inlineQueue[t];this.inlineTokens(r.src,r.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],r=!1){var n,a,l;for(this.options.pedantic&&(e=e.replace(v.tabCharGlobal,"    ").replace(v.spaceLine,""));e;){let i;if((a=(n=this.options.extensions)==null?void 0:n.block)!=null&&a.some(o=>(i=o.call({lexer:this},e,t))?(e=e.substring(i.raw.length),t.push(i),!0):!1))continue;if(i=this.tokenizer.space(e)){e=e.substring(i.raw.length);let o=t.at(-1);i.raw.length===1&&o!==void 0?o.raw+=`
`:t.push(i);continue}if(i=this.tokenizer.code(e)){e=e.substring(i.raw.length);let o=t.at(-1);(o==null?void 0:o.type)==="paragraph"||(o==null?void 0:o.type)==="text"?(o.raw+=(o.raw.endsWith(`
`)?"":`
`)+i.raw,o.text+=`
`+i.text,this.inlineQueue.at(-1).src=o.text):t.push(i);continue}if(i=this.tokenizer.fences(e)){e=e.substring(i.raw.length),t.push(i);continue}if(i=this.tokenizer.heading(e)){e=e.substring(i.raw.length),t.push(i);continue}if(i=this.tokenizer.hr(e)){e=e.substring(i.raw.length),t.push(i);continue}if(i=this.tokenizer.blockquote(e)){e=e.substring(i.raw.length),t.push(i);continue}if(i=this.tokenizer.list(e)){e=e.substring(i.raw.length),t.push(i);continue}if(i=this.tokenizer.html(e)){e=e.substring(i.raw.length),t.push(i);continue}if(i=this.tokenizer.def(e)){e=e.substring(i.raw.length);let o=t.at(-1);(o==null?void 0:o.type)==="paragraph"||(o==null?void 0:o.type)==="text"?(o.raw+=(o.raw.endsWith(`
`)?"":`
`)+i.raw,o.text+=`
`+i.raw,this.inlineQueue.at(-1).src=o.text):this.tokens.links[i.tag]||(this.tokens.links[i.tag]={href:i.href,title:i.title},t.push(i));continue}if(i=this.tokenizer.table(e)){e=e.substring(i.raw.length),t.push(i);continue}if(i=this.tokenizer.lheading(e)){e=e.substring(i.raw.length),t.push(i);continue}let h=e;if((l=this.options.extensions)!=null&&l.startBlock){let o=1/0,p=e.slice(1),g;this.options.extensions.startBlock.forEach(u=>{g=u.call({lexer:this},p),typeof g=="number"&&g>=0&&(o=Math.min(o,g))}),o<1/0&&o>=0&&(h=e.substring(0,o+1))}if(this.state.top&&(i=this.tokenizer.paragraph(h))){let o=t.at(-1);r&&(o==null?void 0:o.type)==="paragraph"?(o.raw+=(o.raw.endsWith(`
`)?"":`
`)+i.raw,o.text+=`
`+i.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=o.text):t.push(i),r=h.length!==e.length,e=e.substring(i.raw.length);continue}if(i=this.tokenizer.text(e)){e=e.substring(i.raw.length);let o=t.at(-1);(o==null?void 0:o.type)==="text"?(o.raw+=(o.raw.endsWith(`
`)?"":`
`)+i.raw,o.text+=`
`+i.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=o.text):t.push(i);continue}if(e){let o="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(o);break}else throw new Error(o)}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){var h,o,p,g,u;let r=e,n=null;if(this.tokens.links){let c=Object.keys(this.tokens.links);if(c.length>0)for(;(n=this.tokenizer.rules.inline.reflinkSearch.exec(r))!=null;)c.includes(n[0].slice(n[0].lastIndexOf("[")+1,-1))&&(r=r.slice(0,n.index)+"["+"a".repeat(n[0].length-2)+"]"+r.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(n=this.tokenizer.rules.inline.anyPunctuation.exec(r))!=null;)r=r.slice(0,n.index)+"++"+r.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);let a;for(;(n=this.tokenizer.rules.inline.blockSkip.exec(r))!=null;)a=n[2]?n[2].length:0,r=r.slice(0,n.index+a)+"["+"a".repeat(n[0].length-a-2)+"]"+r.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);r=((o=(h=this.options.hooks)==null?void 0:h.emStrongMask)==null?void 0:o.call({lexer:this},r))??r;let l=!1,i="";for(;e;){l||(i=""),l=!1;let c;if((g=(p=this.options.extensions)==null?void 0:p.inline)!=null&&g.some(b=>(c=b.call({lexer:this},e,t))?(e=e.substring(c.raw.length),t.push(c),!0):!1))continue;if(c=this.tokenizer.escape(e)){e=e.substring(c.raw.length),t.push(c);continue}if(c=this.tokenizer.tag(e)){e=e.substring(c.raw.length),t.push(c);continue}if(c=this.tokenizer.link(e)){e=e.substring(c.raw.length),t.push(c);continue}if(c=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(c.raw.length);let b=t.at(-1);c.type==="text"&&(b==null?void 0:b.type)==="text"?(b.raw+=c.raw,b.text+=c.text):t.push(c);continue}if(c=this.tokenizer.emStrong(e,r,i)){e=e.substring(c.raw.length),t.push(c);continue}if(c=this.tokenizer.codespan(e)){e=e.substring(c.raw.length),t.push(c);continue}if(c=this.tokenizer.br(e)){e=e.substring(c.raw.length),t.push(c);continue}if(c=this.tokenizer.del(e,r,i)){e=e.substring(c.raw.length),t.push(c);continue}if(c=this.tokenizer.autolink(e)){e=e.substring(c.raw.length),t.push(c);continue}if(!this.state.inLink&&(c=this.tokenizer.url(e))){e=e.substring(c.raw.length),t.push(c);continue}let x=e;if((u=this.options.extensions)!=null&&u.startInline){let b=1/0,m=e.slice(1),E;this.options.extensions.startInline.forEach(H=>{E=H.call({lexer:this},m),typeof E=="number"&&E>=0&&(b=Math.min(b,E))}),b<1/0&&b>=0&&(x=e.substring(0,b+1))}if(c=this.tokenizer.inlineText(x)){e=e.substring(c.raw.length),c.raw.slice(-1)!=="_"&&(i=c.raw.slice(-1)),l=!0;let b=t.at(-1);(b==null?void 0:b.type)==="text"?(b.raw+=c.raw,b.text+=c.text):t.push(c);continue}if(e){let b="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(b);break}else throw new Error(b)}}return t}},N=class{constructor(s){d(this,"options");d(this,"parser");this.options=s||S}space(s){return""}code({text:s,lang:e,escaped:t}){var a;let r=(a=(e||"").match(v.notSpaceStart))==null?void 0:a[0],n=s.replace(v.endingNewline,"")+`
`;return r?'<pre><code class="language-'+R(r)+'">'+(t?n:R(n,!0))+`</code></pre>
`:"<pre><code>"+(t?n:R(n,!0))+`</code></pre>
`}blockquote({tokens:s}){return`<blockquote>
${this.parser.parse(s)}</blockquote>
`}html({text:s}){return s}def(s){return""}heading({tokens:s,depth:e}){return`<h${e}>${this.parser.parseInline(s)}</h${e}>
`}hr(s){return`<hr>
`}list(s){let e=s.ordered,t=s.start,r="";for(let l=0;l<s.items.length;l++){let i=s.items[l];r+=this.listitem(i)}let n=e?"ol":"ul",a=e&&t!==1?' start="'+t+'"':"";return"<"+n+a+`>
`+r+"</"+n+`>
`}listitem(s){return`<li>${this.parser.parse(s.tokens)}</li>
`}checkbox({checked:s}){return"<input "+(s?'checked="" ':"")+'disabled="" type="checkbox"> '}paragraph({tokens:s}){return`<p>${this.parser.parseInline(s)}</p>
`}table(s){let e="",t="";for(let n=0;n<s.header.length;n++)t+=this.tablecell(s.header[n]);e+=this.tablerow({text:t});let r="";for(let n=0;n<s.rows.length;n++){let a=s.rows[n];t="";for(let l=0;l<a.length;l++)t+=this.tablecell(a[l]);r+=this.tablerow({text:t})}return r&&(r=`<tbody>${r}</tbody>`),`<table>
<thead>
`+e+`</thead>
`+r+`</table>
`}tablerow({text:s}){return`<tr>
${s}</tr>
`}tablecell(s){let e=this.parser.parseInline(s.tokens),t=s.header?"th":"td";return(s.align?`<${t} align="${s.align}">`:`<${t}>`)+e+`</${t}>
`}strong({tokens:s}){return`<strong>${this.parser.parseInline(s)}</strong>`}em({tokens:s}){return`<em>${this.parser.parseInline(s)}</em>`}codespan({text:s}){return`<code>${R(s,!0)}</code>`}br(s){return"<br>"}del({tokens:s}){return`<del>${this.parser.parseInline(s)}</del>`}link({href:s,title:e,tokens:t}){let r=this.parser.parseInline(t),n=xe(s);if(n===null)return r;s=n;let a='<a href="'+s+'"';return e&&(a+=' title="'+R(e)+'"'),a+=">"+r+"</a>",a}image({href:s,title:e,text:t,tokens:r}){r&&(t=this.parser.parseInline(r,this.parser.textRenderer));let n=xe(s);if(n===null)return R(t);s=n;let a=`<img src="${s}" alt="${R(t)}"`;return e&&(a+=` title="${R(e)}"`),a+=">",a}text(s){return"tokens"in s&&s.tokens?this.parser.parseInline(s.tokens):"escaped"in s&&s.escaped?s.text:R(s.text)}},V=class{strong({text:s}){return s}em({text:s}){return s}codespan({text:s}){return s}del({text:s}){return s}html({text:s}){return s}text({text:s}){return s}link({text:s}){return""+s}image({text:s}){return""+s}br(){return""}checkbox({raw:s}){return s}},_=class se{constructor(e){d(this,"options");d(this,"renderer");d(this,"textRenderer");this.options=e||S,this.options.renderer=this.options.renderer||new N,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new V}static parse(e,t){return new se(t).parse(e)}static parseInline(e,t){return new se(t).parseInline(e)}parse(e){var r,n;let t="";for(let a=0;a<e.length;a++){let l=e[a];if((n=(r=this.options.extensions)==null?void 0:r.renderers)!=null&&n[l.type]){let h=l,o=this.options.extensions.renderers[h.type].call({parser:this},h);if(o!==!1||!["space","hr","heading","code","table","blockquote","list","html","def","paragraph","text"].includes(h.type)){t+=o||"";continue}}let i=l;switch(i.type){case"space":{t+=this.renderer.space(i);break}case"hr":{t+=this.renderer.hr(i);break}case"heading":{t+=this.renderer.heading(i);break}case"code":{t+=this.renderer.code(i);break}case"table":{t+=this.renderer.table(i);break}case"blockquote":{t+=this.renderer.blockquote(i);break}case"list":{t+=this.renderer.list(i);break}case"checkbox":{t+=this.renderer.checkbox(i);break}case"html":{t+=this.renderer.html(i);break}case"def":{t+=this.renderer.def(i);break}case"paragraph":{t+=this.renderer.paragraph(i);break}case"text":{t+=this.renderer.text(i);break}default:{let h='Token with "'+i.type+'" type was not found.';if(this.options.silent)return console.error(h),"";throw new Error(h)}}}return t}parseInline(e,t=this.renderer){var n,a;let r="";for(let l=0;l<e.length;l++){let i=e[l];if((a=(n=this.options.extensions)==null?void 0:n.renderers)!=null&&a[i.type]){let o=this.options.extensions.renderers[i.type].call({parser:this},i);if(o!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(i.type)){r+=o||"";continue}}let h=i;switch(h.type){case"escape":{r+=t.text(h);break}case"html":{r+=t.html(h);break}case"link":{r+=t.link(h);break}case"image":{r+=t.image(h);break}case"checkbox":{r+=t.checkbox(h);break}case"strong":{r+=t.strong(h);break}case"em":{r+=t.em(h);break}case"codespan":{r+=t.codespan(h);break}case"br":{r+=t.br(h);break}case"del":{r+=t.del(h);break}case"text":{r+=t.text(h);break}default:{let o='Token with "'+h.type+'" type was not found.';if(this.options.silent)return console.error(o),"";throw new Error(o)}}}return r}},P=(F=class{constructor(s){d(this,"options");d(this,"block");this.options=s||S}preprocess(s){return s}postprocess(s){return s}processAllTokens(s){return s}emStrongMask(s){return s}provideLexer(){return this.block?$.lex:$.lexInline}provideParser(){return this.block?_.parse:_.parseInline}},d(F,"passThroughHooks",new Set(["preprocess","postprocess","processAllTokens","emStrongMask"])),d(F,"passThroughHooksRespectAsync",new Set(["preprocess","postprocess","processAllTokens"])),F),ut=class{constructor(...s){d(this,"defaults",y());d(this,"options",this.setOptions);d(this,"parse",this.parseMarkdown(!0));d(this,"parseInline",this.parseMarkdown(!1));d(this,"Parser",_);d(this,"Renderer",N);d(this,"TextRenderer",V);d(this,"Lexer",$);d(this,"Tokenizer",O);d(this,"Hooks",P);this.use(...s)}walkTokens(s,e){var r,n;let t=[];for(let a of s)switch(t=t.concat(e.call(this,a)),a.type){case"table":{let l=a;for(let i of l.header)t=t.concat(this.walkTokens(i.tokens,e));for(let i of l.rows)for(let h of i)t=t.concat(this.walkTokens(h.tokens,e));break}case"list":{let l=a;t=t.concat(this.walkTokens(l.items,e));break}default:{let l=a;(n=(r=this.defaults.extensions)==null?void 0:r.childTokens)!=null&&n[l.type]?this.defaults.extensions.childTokens[l.type].forEach(i=>{let h=l[i].flat(1/0);t=t.concat(this.walkTokens(h,e))}):l.tokens&&(t=t.concat(this.walkTokens(l.tokens,e)))}}return t}use(...s){let e=this.defaults.extensions||{renderers:{},childTokens:{}};return s.forEach(t=>{let r={...t};if(r.async=this.defaults.async||r.async||!1,t.extensions&&(t.extensions.forEach(n=>{if(!n.name)throw new Error("extension name required");if("renderer"in n){let a=e.renderers[n.name];a?e.renderers[n.name]=function(...l){let i=n.renderer.apply(this,l);return i===!1&&(i=a.apply(this,l)),i}:e.renderers[n.name]=n.renderer}if("tokenizer"in n){if(!n.level||n.level!=="block"&&n.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");let a=e[n.level];a?a.unshift(n.tokenizer):e[n.level]=[n.tokenizer],n.start&&(n.level==="block"?e.startBlock?e.startBlock.push(n.start):e.startBlock=[n.start]:n.level==="inline"&&(e.startInline?e.startInline.push(n.start):e.startInline=[n.start]))}"childTokens"in n&&n.childTokens&&(e.childTokens[n.name]=n.childTokens)}),r.extensions=e),t.renderer){let n=this.defaults.renderer||new N(this.defaults);for(let a in t.renderer){if(!(a in n))throw new Error(`renderer '${a}' does not exist`);if(["options","parser"].includes(a))continue;let l=a,i=t.renderer[l],h=n[l];n[l]=(...o)=>{let p=i.apply(n,o);return p===!1&&(p=h.apply(n,o)),p||""}}r.renderer=n}if(t.tokenizer){let n=this.defaults.tokenizer||new O(this.defaults);for(let a in t.tokenizer){if(!(a in n))throw new Error(`tokenizer '${a}' does not exist`);if(["options","rules","lexer"].includes(a))continue;let l=a,i=t.tokenizer[l],h=n[l];n[l]=(...o)=>{let p=i.apply(n,o);return p===!1&&(p=h.apply(n,o)),p}}r.tokenizer=n}if(t.hooks){let n=this.defaults.hooks||new P;for(let a in t.hooks){if(!(a in n))throw new Error(`hook '${a}' does not exist`);if(["options","block"].includes(a))continue;let l=a,i=t.hooks[l],h=n[l];P.passThroughHooks.has(a)?n[l]=o=>{if(this.defaults.async&&P.passThroughHooksRespectAsync.has(a))return(async()=>{let g=await i.call(n,o);return h.call(n,g)})();let p=i.call(n,o);return h.call(n,p)}:n[l]=(...o)=>{if(this.defaults.async)return(async()=>{let g=await i.apply(n,o);return g===!1&&(g=await h.apply(n,o)),g})();let p=i.apply(n,o);return p===!1&&(p=h.apply(n,o)),p}}r.hooks=n}if(t.walkTokens){let n=this.defaults.walkTokens,a=t.walkTokens;r.walkTokens=function(l){let i=[];return i.push(a.call(this,l)),n&&(i=i.concat(n.call(this,l))),i}}this.defaults={...this.defaults,...r}}),this}setOptions(s){return this.defaults={...this.defaults,...s},this}lexer(s,e){return $.lex(s,e??this.defaults)}parser(s,e){return _.parse(s,e??this.defaults)}parseMarkdown(s){return(e,t)=>{let r={...t},n={...this.defaults,...r},a=this.onError(!!n.silent,!!n.async);if(this.defaults.async===!0&&r.async===!1)return a(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof e>"u"||e===null)return a(new Error("marked(): input parameter is undefined or null"));if(typeof e!="string")return a(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(e)+", string expected"));if(n.hooks&&(n.hooks.options=n,n.hooks.block=s),n.async)return(async()=>{let l=n.hooks?await n.hooks.preprocess(e):e,i=await(n.hooks?await n.hooks.provideLexer():s?$.lex:$.lexInline)(l,n),h=n.hooks?await n.hooks.processAllTokens(i):i;n.walkTokens&&await Promise.all(this.walkTokens(h,n.walkTokens));let o=await(n.hooks?await n.hooks.provideParser():s?_.parse:_.parseInline)(h,n);return n.hooks?await n.hooks.postprocess(o):o})().catch(a);try{n.hooks&&(e=n.hooks.preprocess(e));let l=(n.hooks?n.hooks.provideLexer():s?$.lex:$.lexInline)(e,n);n.hooks&&(l=n.hooks.processAllTokens(l)),n.walkTokens&&this.walkTokens(l,n.walkTokens);let i=(n.hooks?n.hooks.provideParser():s?_.parse:_.parseInline)(l,n);return n.hooks&&(i=n.hooks.postprocess(i)),i}catch(l){return a(l)}}}onError(s,e){return t=>{if(t.message+=`
Please report this to https://github.com/markedjs/marked.`,s){let r="<p>An error occurred:</p><pre>"+R(t.message+"",!0)+"</pre>";return e?Promise.resolve(r):r}if(e)return Promise.reject(t);throw t}}},C=new ut;function k(s,e){return C.parse(s,e)}k.options=k.setOptions=function(s){return C.setOptions(s),k.defaults=C.defaults,ne(k.defaults),k},k.getDefaults=y,k.defaults=S,k.use=function(...s){return C.use(...s),k.defaults=C.defaults,ne(k.defaults),k},k.walkTokens=function(s,e){return C.walkTokens(s,e)},k.parseInline=C.parseInline,k.Parser=_,k.parser=_.parse,k.Renderer=N,k.TextRenderer=V,k.Lexer=$,k.lexer=$.lex,k.Tokenizer=O,k.Hooks=P,k.parse=k,k.options,k.setOptions,k.use,k.walkTokens,k.parseInline,_.parse,$.lex;const gt=s=>`
  /* Shadow DOM — styles are fully isolated from the host page */
  :host { display: block; }

  *, *::before, *::after {
    box-sizing: border-box; margin: 0; padding: 0;
    font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
  }

  /* ── Bubble Button ── */
  .tc-bubble-btn {
    width: 62px; height: 62px;
    border-radius: 50%;
    background: #111;
    border: 2px solid ${s}44;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
    transition: border-color 0.3s, box-shadow 0.3s, transform 0.2s;
    position: absolute;
    bottom: 28px; right: 28px;
    padding: 0;
    opacity: 0;
    transform: scale(0.5) translateY(10px);
    pointer-events: none;
  }
  .tc-bubble-btn:hover {
    transform: scale(1.06);
    border-color: ${s}88;
    box-shadow: 0 6px 32px rgba(0,0,0,0.6), 0 0 20px ${s}22;
  }
  .tc-bubble-btn img {
    width: 38px; height: 38px; object-fit: contain;
    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));
  }
  .tc-bubble-btn.tc-ready {
    border-color: ${s}66;
    pointer-events: all;
    animation: tc-entrance 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards,
               tc-pulse-ring 3s ease-out 0.6s;
  }
  @keyframes tc-entrance {
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes tc-pulse-ring {
    0%   { box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 0 0 ${s}55; }
    60%  { box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 0 18px ${s}00; }
    100% { box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 0 0 ${s}00; }
  }

  /* ── Loading ring ── */
  .tc-loading-ring {
    position: absolute;
    bottom: 28px; right: 28px;
    width: 62px; height: 62px;
    display: flex; align-items: center; justify-content: center;
    opacity: 1;
    transition: opacity 0.4s ease;
  }
  .tc-loading-ring.done { opacity: 0; pointer-events: none; }
  .tc-ring-svg {
    position: absolute; top: 0; left: 0;
    width: 62px; height: 62px;
    transform: rotate(-90deg);
  }
  .tc-ring-track {
    fill: none;
    stroke: #1e1e1e;
    stroke-width: 3;
  }
  .tc-ring-fill {
    fill: none;
    stroke: ${s};
    stroke-width: 3;
    stroke-linecap: round;
    stroke-dasharray: 175.9;
    stroke-dashoffset: 175.9;
    transition: stroke-dashoffset 0.4s ease;
    filter: drop-shadow(0 0 4px ${s}88);
  }
  .tc-ring-inner {
    width: 50px; height: 50px;
    border-radius: 50%;
    background: #111;
    border: 1px solid #1e1e1e;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 1px;
  }
  .tc-ring-img {
    width: 26px; height: 26px;
    object-fit: contain;
    opacity: 0.6;
  }
  .tc-ring-pct {
    font-size: 0.5rem;
    color: ${s};
    font-family: 'Fragment Mono', 'Courier New', monospace;
    letter-spacing: 0.02em;
    line-height: 1;
  }

  /* ── Suggestion chips ── */
  .tc-suggestions {
    display: flex; flex-wrap: wrap; gap: 7px;
    padding: 4px 0 10px;
    animation: tcFadeIn 0.35s ease both;
  }
  @keyframes tcFadeIn {
    from { opacity:0; transform: translateY(6px); }
    to   { opacity:1; transform: translateY(0); }
  }
  .tc-chip {
    padding: 6px 12px;
    border-radius: 20px;
    border: 1px solid #2a2a2a;
    background: #161616;
    color: #aaa;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.74rem;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
    line-height: 1.3;
    text-align: left;
  }
  .tc-chip:hover {
    border-color: ${s}88;
    color: #fff;
    background: #1e1e1e;
  }

  .tc-status-badge {
    position: absolute; top: 1px; right: 1px;
    width: 14px; height: 14px; border-radius: 50%;
    background: #333; border: 2px solid #0a0a0a;
    transition: background 0.4s, box-shadow 0.4s;
  }
  .tc-status-badge.ready {
    background: #4ade80;
    box-shadow: 0 0 8px rgba(74,222,128,0.7);
    animation: tc-led 3s ease-in-out infinite;
  }
  .tc-status-badge.loading {
    background: #facc15;
    box-shadow: 0 0 8px rgba(250,204,21,0.7);
    animation: tc-led 0.8s ease-in-out infinite;
  }
  @keyframes tc-led { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

  /* ── Chat Window ── */
  .tc-window {
    position: absolute;
    bottom: 104px; right: 28px;
    width: 360px;
    max-height: 520px;
    background: #0d0d0d;
    border: 1px solid #1e1e1e;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(0,0,0,0.8), 0 0 0 1px #ffffff06, inset 0 1px 0 #ffffff08;
    transform-origin: bottom right;
    transform: scale(0.9) translateY(12px);
    opacity: 0;
    pointer-events: none;
    transition: transform 0.25s cubic-bezier(0.175,0.885,0.32,1.275), opacity 0.2s ease;
  }
  .tc-window.tc-open {
    transform: scale(1) translateY(0);
    opacity: 1;
    pointer-events: all;
  }

  /* ── Header ── */
  .tc-header {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 14px;
    background: linear-gradient(180deg, #141414 0%, #0f0f0f 100%);
    border-bottom: 1px solid #1a1a1a;
    flex-shrink: 0;
    position: relative;
  }
  .tc-header::after {
    content: '';
    position: absolute; bottom: 0; left: 14px; right: 14px; height: 1px;
    background: linear-gradient(90deg, transparent, ${s}22, transparent);
  }
  .tc-header-avatar {
    width: 34px; height: 34px; object-fit: contain; flex-shrink: 0;
    filter: drop-shadow(0 0 8px ${s}44);
  }
  .tc-header-info { flex: 1; min-width: 0; }
  .tc-header-name {
    font-size: 0.85rem; font-weight: 700;
    color: #fff; letter-spacing: 0.01em;
    font-family: 'DM Sans', system-ui, sans-serif;
  }
  .tc-header-status {
    display: flex; align-items: center; gap: 5px; margin-top: 1px;
  }
  .tc-header-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #333; flex-shrink: 0;
    transition: background 0.4s, box-shadow 0.4s;
  }
  .tc-header-dot.ready { background: #4ade80; box-shadow: 0 0 5px rgba(74,222,128,0.8); }
  .tc-header-dot.loading { background: #facc15; animation: tc-led 0.8s infinite; }
  .tc-header-label {
    font-size: 0.68rem; color: #555; font-weight: 500;
    font-family: 'DM Sans', system-ui, sans-serif;
  }
  .tc-new-btn {
    width: 28px; height: 28px; border-radius: 50%;
    background: transparent; border: 1px solid #2a2a2a;
    color: #555; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s; flex-shrink: 0;
  }
  .tc-new-btn:hover { background: #1a1a1a; color: #aaa; border-color: #444; }
  .tc-close-btn {
    margin-left: auto; flex-shrink: 0;
    background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 50%;
    color: #555; cursor: pointer;
    width: 26px; height: 26px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem; transition: all 0.15s;
  }
  .tc-close-btn:hover { background: #252525; color: #ccc; border-color: #3a3a3a; }

  /* ── Download progress ── */
  .tc-download-bar {
    padding: 10px 14px;
    background: #111;
    border-bottom: 1px solid #1a1a1a;
    flex-shrink: 0;
  }
  .tc-download-label {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 0.72rem; color: #555; margin-bottom: 6px;
    font-family: 'DM Sans', system-ui, sans-serif;
  }
  .tc-download-label span:last-child { color: #facc15; font-weight: 600; }
  .tc-download-track {
    height: 3px; background: #1e1e1e; border-radius: 3px; overflow: hidden;
  }
  .tc-download-fill {
    height: 100%; background: ${s};
    border-radius: 3px;
    transition: width 0.3s ease;
    box-shadow: 0 0 6px ${s}66;
  }

  /* ── Messages ── */
  .tc-messages {
    flex: 1; overflow-y: auto; padding: 14px 12px;
    display: flex; flex-direction: column; gap: 8px;
    scrollbar-width: thin; scrollbar-color: #1e1e1e transparent;
    min-height: 0;
  }
  .tc-messages::-webkit-scrollbar { width: 3px; }
  .tc-messages::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }

  .tc-msg {
    display: flex; flex-direction: column; max-width: 86%;
    animation: tc-msg-in 0.18s ease forwards;
  }
  @keyframes tc-msg-in {
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .tc-msg.tc-bot  { align-self: flex-start; }
  .tc-msg.tc-user { align-self: flex-end; }

  .tc-msg-bubble {
    padding: 10px 13px;
    font-size: 0.875rem; line-height: 1.55; font-weight: 400;
    word-break: break-word; border-radius: 14px;
    font-family: 'DM Sans', system-ui, sans-serif;
  }
  .tc-bot .tc-msg-bubble {
    background: #161616; border: 1px solid #222;
    border-bottom-left-radius: 4px; color: #ccc;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  .tc-user .tc-msg-bubble {
    background: ${s}; border: 1px solid ${s};
    border-bottom-right-radius: 4px; color: #000; font-weight: 600;
    box-shadow: 0 2px 12px ${s}44;
  }

  /* ── Typing indicator ── */
  .tc-typing-wrap {
    align-self: flex-start;
    background: #161616; border: 1px solid #2a2a2a;
    border-radius: 14px; border-bottom-left-radius: 4px;
    padding: 10px 14px;
    display: flex; gap: 6px; align-items: center;
  }
  .tc-thinking-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem; color: #777; font-style: italic;
    margin-right: 2px;
  }
  .tc-typing-wrap span {
    width: 5px; height: 5px; background: ${s}; border-radius: 50%;
    animation: tc-dot 1.3s ease infinite;
    flex-shrink: 0;
  }
  .tc-typing-wrap span:nth-child(2) { animation-delay: 0.2s; }
  .tc-typing-wrap span:nth-child(3) { animation-delay: 0.4s; }
  .tc-typing-wrap span:nth-child(4) { animation-delay: 0.6s; }
  @keyframes tc-dot {
    0%, 100% { opacity: 0.25; transform: translateY(0); }
    50%       { opacity: 1;   transform: translateY(-4px); }
  }

  /* ── Markdown rendering in bot bubbles ── */
  .tc-bot .tc-msg-bubble p { margin: 0 0 8px; line-height: 1.65; }
  .tc-bot .tc-msg-bubble p:last-child { margin-bottom: 0; }
  .tc-bot .tc-msg-bubble strong { color: #fff; font-weight: 700; }
  .tc-bot .tc-msg-bubble em { opacity: 0.85; }
  .tc-bot .tc-msg-bubble code {
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 4px; padding: 1px 6px;
    font-family: 'Fragment Mono', 'Courier New', monospace;
    font-size: 0.82em; color: ${s};
  }
  .tc-bot .tc-msg-bubble pre {
    background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px; padding: 12px 14px; overflow-x: auto;
    margin: 8px 0;
  }
  .tc-bot .tc-msg-bubble pre code {
    background: none; border: none; padding: 0;
    font-size: 0.8rem; color: #ccc;
  }
  .tc-bot .tc-msg-bubble ul, .tc-bot .tc-msg-bubble ol {
    padding-left: 18px; margin: 6px 0;
  }
  .tc-bot .tc-msg-bubble li { margin-bottom: 4px; line-height: 1.55; }
  .tc-bot .tc-msg-bubble h1,.tc-bot .tc-msg-bubble h2,.tc-bot .tc-msg-bubble h3 {
    color: #fff; font-family: 'DM Sans', sans-serif;
    font-weight: 700; margin: 12px 0 6px; line-height: 1.3;
  }
  .tc-bot .tc-msg-bubble h1 { font-size: 1rem; }
  .tc-bot .tc-msg-bubble h2 { font-size: 0.92rem; }
  .tc-bot .tc-msg-bubble h3 { font-size: 0.88rem; }
  .tc-bot .tc-msg-bubble a { color: ${s}; text-decoration: none; }
  .tc-bot .tc-msg-bubble a:hover { text-decoration: underline; }
  .tc-bot .tc-msg-bubble blockquote {
    border-left: 3px solid ${s}66; padding-left: 12px;
    margin: 8px 0; color: #888; font-style: italic;
  }
  .tc-bot .tc-msg-bubble hr { border: none; border-top: 1px solid #2a2a2a; margin: 10px 0; }

  /* ── Input bar ── */
  .tc-input-bar {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 12px;
    background: #0a0a0a; border-top: 1px solid #1a1a1a;
    flex-shrink: 0;
  }
  .tc-text-input {
    flex: 1; background: #161616; border: 1px solid #222; border-radius: 22px;
    padding: 10px 16px;
    color: #e8e8e8; font-size: 0.875rem; outline: none;
    font-family: 'DM Sans', system-ui, sans-serif;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .tc-text-input::placeholder { color: #555; }
  .tc-text-input:focus { border-color: #333; box-shadow: 0 0 0 3px ${s}11; }
  .tc-text-input:disabled { opacity: 0.35; }
  .tc-send-btn {
    width: 36px; height: 36px; flex-shrink: 0;
    background: ${s}; border: none; border-radius: 50%;
    color: #000; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; font-weight: 700;
    transition: filter 0.15s, transform 0.1s, box-shadow 0.15s;
    box-shadow: 0 2px 10px ${s}44;
  }
  .tc-send-btn:hover { filter: brightness(1.1); transform: scale(1.06); }
  .tc-send-btn:active { transform: scale(0.94); }
  .tc-send-btn:disabled { opacity: 0.35; cursor: default; transform: none; box-shadow: none; }

  /* ── Footer ── */
  .tc-powered {
    text-align: center; padding: 6px;
    font-size: 0.58rem; color: #555; letter-spacing: 0.08em; text-transform: uppercase;
    flex-shrink: 0; font-family: 'Fragment Mono', monospace;
  }
  .tc-powered a { color: #777; text-decoration: none; transition: color 0.15s; }
  .tc-powered a:hover { color: #aaa; }
`,ye=`
# VibeClaw — Browser-Native OpenClaw Runtime

VibeClaw (vibeclaw.dev) is the world's first one-click deployment of a private, secure, instantly usable OpenClaw AI agent server — running entirely in the browser. No installation, no Docker, no CLI.

## How It Works
1. Visit vibeclaw.dev
2. Select a Flavour (agent personality/squad)
3. Click "Power On"
4. Your OpenClaw server boots in ~5 seconds, entirely in your browser tab

## Key Features
- Full Node.js runtime in the browser via almostnode (40+ shimmed modules)
- Virtual filesystem — read, write, create files
- npm package support — install packages inside the container
- Multi-agent orchestration with team routing
- Your API key goes DIRECT to Anthropic — never touches our servers
- WebSocket gateway for connecting live OpenClaw instances
- Cron jobs & scheduled tasks
- Streaming chat with session management
- Skill management & cost tracking
- Flavour system — swap agent personalities in one click

## Available Flavours
- 🦀 **OpenClaw** (default) — General coding assistant with file access, code review, and project skills
- 🚀 **ShipIt** — DevOps & infrastructure squad (Docker, K8s, CI/CD, monitoring)
- 💀 **R00t** — Security research squad (pen testing, CTF, vulnerability analysis)
- ✨ **Pixie** — Creative studio squad (UI/UX, branding, animation, copy)
- 🎓 **Professor** — Teaching assistant squad (explains concepts, exercises, code review)
- 🦞 **TinyClaw** — Multi-agent orchestrator (Coder, Writer, Reviewer, Designer)

## Pricing
- Free to use — bring your own API key
- Key stored locally in browser, never sent to vibeclaw servers
- Compatible with OpenRouter (free models available) and direct Anthropic

## Tech Stack
- **almostnode** — browser-native Node.js runtime (github.com/macaly/almostnode)
- **OpenClaw** — AI agent framework (openclaw.ai)
- **VibeClaw** — the browser shell & playground (vibeclaw.dev)

## Getting Started
\`\`\`
1. Go to https://vibeclaw.dev
2. Pick a flavour (start with 🦀 OpenClaw)
3. Click Power On
4. Paste your Anthropic or OpenRouter API key
5. Chat with your in-browser AI agent
\`\`\`

## Links
- Site: https://vibeclaw.dev
- GitHub: https://github.com/jasonkneen/vibeclaw
- Docs: https://vibeclaw.dev/docs
- OpenClaw: https://openclaw.ai
- almostnode: https://github.com/macaly/almostnode
`.trim(),X=s=>`You are 🦞 Clawdio, a friendly and enthusiastic assistant for VibeClaw. You are PROOF that this technology works — you're running entirely in the visitor's browser right now, powered by almostnode and OpenClaw.

Keep responses concise and conversational. Be enthusiastic about the tech but not annoying. Use the knowledge base below to answer questions accurately.

${s}

If asked something you don't know, say so honestly. Always encourage people to try VibeClaw — it's free and boots in seconds.`;k.setOptions({async:!1,breaks:!0,gfm:!0});const bt="https://esm.run/@mlc-ai/web-llm",ft="Qwen2.5-1.5B-Instruct-q4f16_1-MLC",ve="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fragment+Mono&display=swap";class J{constructor(e={}){d(this,"cfg");d(this,"host",null);d(this,"shadow",null);d(this,"loadingRing",null);d(this,"ringFill",null);d(this,"ringPct",null);d(this,"bubbleBtn",null);d(this,"abortCtrl",null);d(this,"win",null);d(this,"messagesEl",null);d(this,"inputEl",null);d(this,"sendBtn",null);d(this,"headerDot",null);d(this,"headerLabel",null);d(this,"badge",null);d(this,"dlBar",null);d(this,"dlFill",null);d(this,"dlPct",null);d(this,"history",[]);d(this,"ready",!1);d(this,"engine",null);d(this,"useLocal",!1);d(this,"_suggestionsEl",null);this.cfg={apiKey:e.apiKey||localStorage.getItem("tc-api-key")||"",model:e.model||"upstage/solar-pro-3:free",webllmModel:e.webllmModel||ft,preferLocal:e.preferLocal??!0,kb:e.kb||ye,avatar:e.avatar||"https://vibeclaw.dev/crab.png",accent:e.accent||"#ff5c5c",position:e.position||"bottom-right",title:e.title||"Clawdio",greeting:e.greeting||"Hey! I'm 🦞 Clawdio — running entirely in your browser. Ask me anything about VibeClaw!",openRouterReferer:e.openRouterReferer||(typeof location<"u"?location.origin:"https://vibeclaw.dev")}}mount(e){var h,o,p,g,u;const t=e instanceof HTMLElement?e:e?document.querySelector(e):document.body;if(!t)throw new Error("TinyClaw: mount target not found");if(!document.getElementById("tc-fonts")){const c=document.createElement("link");c.id="tc-fonts",c.rel="stylesheet",c.href=ve,document.head.appendChild(c)}this.host=document.createElement("div"),this.host.id="tc-host";const r=this.cfg.position==="bottom-left"?"left:0":"right:0";this.host.setAttribute("style",`position:fixed;bottom:0;${r};width:0;height:0;z-index:2147483647;overflow:visible;`),t.appendChild(this.host),this.shadow=this.host.attachShadow({mode:"open"});const n=document.createElement("link");n.rel="stylesheet",n.href=ve,this.shadow.appendChild(n);const a=document.createElement("style");a.textContent=gt(this.cfg.accent),this.shadow.appendChild(a);const l=document.createElement("div");l.innerHTML=this._html(),this.shadow.appendChild(l);const i=c=>this.shadow.querySelector(c);return this.loadingRing=i(".tc-loading-ring"),this.ringFill=i(".tc-ring-fill"),this.ringPct=i(".tc-ring-pct"),this.bubbleBtn=i(".tc-bubble-btn"),this.win=i(".tc-window"),this.messagesEl=i(".tc-messages"),this.inputEl=i(".tc-text-input"),this.sendBtn=i(".tc-send-btn"),this.headerDot=i(".tc-header-dot"),this.headerLabel=i(".tc-header-label"),this.badge=i(".tc-status-badge"),this.dlBar=i(".tc-download-bar"),this.dlFill=i(".tc-download-fill"),this.dlPct=i(".tc-dl-pct"),(h=this.bubbleBtn)==null||h.addEventListener("click",()=>this._toggle()),(o=i(".tc-close-btn"))==null||o.addEventListener("click",()=>this._close()),(p=i(".tc-new-btn"))==null||p.addEventListener("click",()=>this._newChat()),(g=this.sendBtn)==null||g.addEventListener("click",()=>this._send()),(u=this.inputEl)==null||u.addEventListener("keydown",c=>{c.key==="Enter"&&!c.shiftKey&&(c.preventDefault(),this._send())}),this._boot(),this}unmount(){var e;(e=this.host)==null||e.remove()}open(){var e,t;(e=this.win)==null||e.classList.add("tc-open"),(t=this.inputEl)==null||t.focus(),localStorage.setItem("tc-open","1")}close(){this._close()}setApiKey(e){this.cfg.apiKey=e,localStorage.setItem("tc-api-key",e)}_html(){return`
      <div class="tc-loading-ring">
        <svg class="tc-ring-svg" viewBox="0 0 62 62">
          <circle class="tc-ring-track" cx="31" cy="31" r="28"/>
          <circle class="tc-ring-fill"  cx="31" cy="31" r="28"/>
        </svg>
        <div class="tc-ring-inner">
          <img src="${this.cfg.avatar}" class="tc-ring-img" alt="">
          <span class="tc-ring-pct">0%</span>
        </div>
      </div>

      <div class="tc-window">
        <div class="tc-header">
          <img src="${this.cfg.avatar}" class="tc-header-avatar" alt="Clawdio">
          <div class="tc-header-info">
            <div class="tc-header-name">${this.cfg.title}</div>
            <div class="tc-header-status">
              <span class="tc-header-dot"></span>
              <span class="tc-header-label">Starting…</span>
            </div>
          </div>
          <button class="tc-new-btn" aria-label="New chat" title="New chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
          <button class="tc-close-btn" aria-label="Close">✕</button>
        </div>
        <div class="tc-download-bar" style="display:none">
          <div class="tc-download-label">
            <span>Downloading local model</span>
            <span class="tc-dl-pct">0%</span>
          </div>
          <div class="tc-download-track"><div class="tc-download-fill" style="width:0%"></div></div>
        </div>
        <div class="tc-messages"></div>
        <div class="tc-input-bar">
          <input class="tc-text-input" placeholder="Ask me anything…" disabled>
          <button class="tc-send-btn" disabled>↑</button>
        </div>
        <div class="tc-powered">Powered by <a href="https://vibeclaw.dev" target="_blank">VibeClaw</a> · running in your browser</div>
      </div>
      <button class="tc-bubble-btn" aria-label="Chat with Clawdio">
        <img src="${this.cfg.avatar}" alt="">
        <span class="tc-status-badge"></span>
      </button>`}async _boot(){this._setStatus("Starting…",!1);const[e]=await Promise.all([this.cfg.preferLocal?this._checkWebGPU():Promise.resolve(!1),this._fetchKB()]);e?await this._loadLocal():(this.loadingRing&&this.loadingRing.classList.add("done"),await new Promise(t=>setTimeout(t,300)),this._setReady())}async _fetchKB(){const e="tc-llm-txt-v2",t="tc-llm-txt-v2-ts";try{const n=localStorage.getItem(e),a=Number(localStorage.getItem(t)||0);if(n&&Date.now()-a<36e5){this.cfg.kb=n;return}const l=await fetch("/llm.txt",{cache:"no-store"});if(l.ok){const i=await l.text();this.cfg.kb=i;try{localStorage.setItem(e,i),localStorage.setItem(t,String(Date.now()))}catch{}}}catch{}}async _checkWebGPU(){try{return"gpu"in navigator?!!await navigator.gpu.requestAdapter():!1}catch{return!1}}async _loadLocal(){this._setStatus("Loading local model…","loading"),this.dlBar&&(this.dlBar.style.display="block");try{const e=await import(bt);this.engine=await e.CreateMLCEngine(this.cfg.webllmModel,{initProgressCallback:t=>{const r=Math.round((t.progress||0)*100);this.dlFill&&(this.dlFill.style.width=`${r}%`),this.dlPct&&(this.dlPct.textContent=`${r}%`),this._setStatus(`Loading ${r}%`,"loading")}}),this.useLocal=!0,this.dlBar&&(this.dlBar.style.display="none"),this._setReady("Local · no API key")}catch(e){console.warn("TinyClaw WebLLM failed, using API fallback",e),this.dlBar&&(this.dlBar.style.display="none"),this._setReady()}}_setReady(e="Ready"){var t;this._setStatus(e,"ready"),this.ready=!0,(t=this.bubbleBtn)==null||t.classList.add("tc-ready"),this.inputEl&&(this.inputEl.disabled=!1),this.sendBtn&&(this.sendBtn.disabled=!1),this._restoreHistory()||(this._addMsg("assistant",this.cfg.greeting),this._addSuggestions())}_newChat(){this.history=[],sessionStorage.removeItem("tc-history"),this.messagesEl&&(this.messagesEl.innerHTML=""),this._suggestionsEl=null,this._addMsg("assistant",this.cfg.greeting),this._addSuggestions()}_saveHistory(){try{sessionStorage.setItem("tc-history",JSON.stringify(this.history))}catch{}}_restoreHistory(){try{const e=sessionStorage.getItem("tc-history");if(!e)return!1;const t=JSON.parse(e);return t.length?(this.history=t,t.forEach(r=>this._addMsg(r.role,r.content)),this._scroll(),!0):!1}catch{return!1}}_addSuggestions(){var r;const e=["What is VibeClaw?","How does Sandbox mode work?","What are Flavours?","What is Live Gateway mode?","Tell me about ClawForge","How do I get an API key?","Is my API key safe?","What models are supported?"],t=document.createElement("div");t.className="tc-suggestions",e.forEach(n=>{const a=document.createElement("button");a.className="tc-chip",a.textContent=n,a.addEventListener("click",()=>{this._removeSuggestions(),this.inputEl&&(this.inputEl.value=n),this._send()}),t.appendChild(a)}),this._suggestionsEl=t,(r=this.messagesEl)==null||r.appendChild(t),this._scroll()}_removeSuggestions(){this._suggestionsEl&&(this._suggestionsEl.style.opacity="0",this._suggestionsEl.style.transition="opacity 0.2s ease",setTimeout(()=>{var e;return(e=this._suggestionsEl)==null?void 0:e.remove()},200),this._suggestionsEl=null)}_setStatus(e,t=!1){this.headerLabel&&(this.headerLabel.textContent=e),this.headerDot&&(this.headerDot.className="tc-header-dot"+(t?` ${t}`:"")),this.badge&&(this.badge.className="tc-status-badge"+(t?` ${t}`:""))}_toggle(){var e;(e=this.win)!=null&&e.classList.contains("tc-open")?this._close():this.open()}_close(){var e;(e=this.win)==null||e.classList.remove("tc-open"),localStorage.setItem("tc-open","0")}_addMsg(e,t){var a;const r=document.createElement("div");r.className=`tc-msg ${e==="user"?"tc-user":"tc-bot"}`;const n=document.createElement("div");return n.className="tc-msg-bubble",e==="assistant"&&t?n.innerHTML=k.parse(t):n.textContent=t,r.appendChild(n),(a=this.messagesEl)==null||a.appendChild(r),this._scroll(),n}_renderMarkdown(e,t){e.innerHTML=k.parse(t)}_showTyping(){var t;const e=document.createElement("div");return e.className="tc-typing-wrap",e.innerHTML='<span class="tc-thinking-label">Thinking</span><span></span><span></span><span></span>',(t=this.messagesEl)==null||t.appendChild(e),this._scroll(),e}_scroll(){this.messagesEl&&(this.messagesEl.scrollTop=this.messagesEl.scrollHeight)}async _send(){var r,n;const e=(n=(r=this.inputEl)==null?void 0:r.value)==null?void 0:n.trim();if(!e||!this.ready)return;this._removeSuggestions(),this.inputEl&&(this.inputEl.value=""),this.inputEl&&(this.inputEl.disabled=!0),this.sendBtn&&(this.sendBtn.disabled=!0),this._addMsg("user",e),this.history.push({role:"user",content:e});const t=this._showTyping();try{this.useLocal&&this.engine?await this._chatLocal(t):await this._chatRemote(t)}catch{t.remove(),this._addMsg("assistant","Sorry, something went wrong. Please try again!"),this.history.pop()}this._saveHistory(),this.inputEl&&(this.inputEl.disabled=!1,this.inputEl.focus()),this.sendBtn&&(this.sendBtn.disabled=!1)}async _chatLocal(e){var l,i;const t=[{role:"system",content:X(this.cfg.kb)},...this.history];e.remove();const r=this._addMsg("assistant","");let n="";const a=await this.engine.chat.completions.create({messages:t,stream:!0});for await(const h of a){const o=((i=(l=h.choices[0])==null?void 0:l.delta)==null?void 0:i.content)||"";o&&(n+=o,r.textContent=n,this._scroll())}this._renderMarkdown(r,n),this._scroll(),this.history.push({role:"assistant",content:n})}async _chatRemote(e){var h,o,p;const t=this.cfg.apiKey||localStorage.getItem("tc-api-key")||"";if(!t){e.remove(),this._showKeyPrompt(),this.history.pop();return}const r=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`,"HTTP-Referer":this.cfg.openRouterReferer,"X-Title":"VibeClaw Clawdio"},body:JSON.stringify({model:this.cfg.model,messages:[{role:"system",content:X(this.cfg.kb)},...this.history],stream:!0})});if(!r.ok)throw new Error(`API ${r.status}`);e.remove();const n=this._addMsg("assistant",""),a=r.body.getReader(),l=new TextDecoder;let i="";for(;;){const{done:g,value:u}=await a.read();if(g)break;for(const c of l.decode(u).split(`
`)){if(!c.startsWith("data:"))continue;const x=c.slice(5).trim();if(x==="[DONE]")break;try{const b=(p=(o=(h=JSON.parse(x).choices)==null?void 0:h[0])==null?void 0:o.delta)==null?void 0:p.content;b&&(i+=b,n.textContent=i,this._scroll())}catch{}}}this._renderMarkdown(n,i),this._scroll(),this.history.push({role:"assistant",content:i})}_showKeyPrompt(){var t,r;const e=document.createElement("div");e.className="tc-msg tc-bot",e.innerHTML=`<div class="tc-msg-bubble" style="background:#161616;border:1px solid #222;border-bottom-left-radius:4px;color:#999;font-size:0.82rem;line-height:1.55;max-width:280px;">
      WebGPU not available. Add an <a href="https://openrouter.ai" target="_blank" style="color:${this.cfg.accent};text-decoration:none;">OpenRouter</a> key:
      <div style="display:flex;margin-top:10px;border-radius:8px;overflow:hidden;border:1px solid #2a2a2a;">
        <input placeholder="sk-or-..." class="tc-key-inp" style="flex:1;background:#0a0a0a;border:none;padding:9px 11px;color:#ccc;font-size:0.8rem;font-family:DM Sans,system-ui,sans-serif;outline:none;">
        <button class="tc-key-ok" style="background:${this.cfg.accent};border:none;color:#000;padding:0 14px;cursor:pointer;font-weight:700;font-size:0.75rem;font-family:DM Sans,system-ui,sans-serif;">SAVE</button>
      </div>
    </div>`,(t=this.messagesEl)==null||t.appendChild(e),this._scroll(),(r=e.querySelector(".tc-key-ok"))==null||r.addEventListener("click",()=>{var a,l;const n=(l=(a=e.querySelector(".tc-key-inp"))==null?void 0:a.value)==null?void 0:l.trim();n&&(this.setApiKey(n),e.remove(),this._addMsg("assistant","Key saved! What would you like to know? 🦞"),this.inputEl&&(this.inputEl.disabled=!1,this.inputEl.focus()),this.sendBtn&&(this.sendBtn.disabled=!1))})}}typeof document<"u"&&document.addEventListener("DOMContentLoaded",()=>{const s=document.querySelector("script[data-tc-auto]");if(!s)return;const e={apiKey:s.dataset.apiKey,model:s.dataset.model,accent:s.dataset.accent,avatar:s.dataset.avatar,position:s.dataset.position,title:s.dataset.title,greeting:s.dataset.greeting};new J(e).mount()}),w.DEFAULT_KB=ye,w.DEFAULT_SYSTEM=X,w.TinyClawWidget=J,w.default=J,Object.defineProperties(w,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}})});
//# sourceMappingURL=tinyclaw-widget.umd.js.map
