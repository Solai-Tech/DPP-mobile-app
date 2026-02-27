/** Shared JS snippets injected into WebViews across the app. */

/** Hide certification sections and transform the Documentation tab into an admin-style UI. */
export const HIDE_SECTIONS_JS = `
try {
  var s = document.createElement('style');
  s.innerHTML = '.chat-tab-2{display:none!important}flowise-chatbot{position:fixed!important;z-index:9999!important}';
  if(document.head){document.head.appendChild(s);}
  else if(document.documentElement){document.documentElement.appendChild(s);}
  function h(){
    try{
      var d=document.querySelectorAll('h2,h3,h4');
      for(var i=0;i<d.length;i++){
        var t=(d[i].textContent||'').trim();
        if(t.indexOf('Certifications')>-1||t.indexOf('Compliance Certificates')>-1){
          var p=d[i].parentElement;while(p&&p.tagName!=='BODY'){if(p.classList&&(p.classList.contains('nordic-card')||p.classList.contains('card')||p.className.indexOf('cert')>-1||p.className.indexOf('section')>-1)){p.style.display='none';break;}p=p.parentElement;}
          if(!p||p.tagName==='BODY'){d[i].parentElement.style.display='none';}
        }
      }
    }catch(x){}
  }
  h();setTimeout(h,800);setTimeout(h,2000);setTimeout(h,4000);

  // Replace Documentation tab content with admin-style UI
  var docTransformed=false;
  function transformDocTab(){
    if(docTransformed) return;
    try{
      // First collect all PDF links from the page
      var pdfs={warranty:'',repair:'',recycle:'',manuals:'',compliance:''};
      var allLinks=document.querySelectorAll('a[href]');
      for(var i=0;i<allLinks.length;i++){
        var hr=(allLinks[i].href||'').toLowerCase();
        if(hr.indexOf('warranty')>-1) pdfs.warranty=allLinks[i].href;
        else if(hr.indexOf('repair')>-1) pdfs.repair=allLinks[i].href;
        else if(hr.indexOf('recycle')>-1||hr.indexOf('recycl')>-1) pdfs.recycle=allLinks[i].href;
        else if(hr.indexOf('manual')>-1) pdfs.manuals=allLinks[i].href;
        else if(hr.indexOf('compliance')>-1) pdfs.compliance=allLinks[i].href;
      }
      // Find documentation tab container
      var docTab=document.getElementById('documentation-tab');
      if(!docTab){
        // Fallback: find by heading text
        var heads=document.querySelectorAll('h2,h3');
        for(var i=0;i<heads.length;i++){
          if((heads[i].textContent||'').trim()==='Documentation'){
            docTab=heads[i].parentElement;break;
          }
        }
      }
      if(!docTab) return;
      function fname(url){if(!url)return'';return decodeURIComponent(url.split('/').pop()||'');}
      function row(label,icon,pdfUrl){
        var fn=fname(pdfUrl);
        return '<div style="border-bottom:1px solid #eee;padding:16px 0">'
          +'<div style="font-size:15px;color:#555;margin-bottom:8px">'+label+'</div>'
          +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">'
          +'<span style="font-size:22px">'+icon+'</span>'
          +'<input type="file" style="font-size:14px">'
          +'</div>'
          +(fn?'<div style="font-size:13px;color:#333;margin-bottom:6px">Current: <a href="'+pdfUrl+'" style="color:#4285f4;text-decoration:underline" onclick="event.stopPropagation()">'+fn+'</a></div>':'')
          +'<div style="display:flex;align-items:center;gap:6px;margin-top:6px">'
          +'<span style="font-size:16px;color:#e53935">\\ud83d\\udcc5</span>'
          +'<span style="font-size:13px;color:#666">Expiry Date:</span>'
          +'</div>'
          +'<input type="date" placeholder="yyyy-mm-dd" style="margin-top:4px;padding:8px 10px;border:1px solid #ddd;border-radius:4px;font-size:14px;width:250px">'
          +'</div>';
      }
      var html='<div style="padding:12px">'
        +'<h2 style="font-size:22px;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px">'
        +'<span style="font-size:24px">\\ud83d\\udcc4</span> Documentation</h2>'
        +row('Warranty','\\ud83d\\udee1\\ufe0f',pdfs.warranty)
        +row('Recycle','\\u267b\\ufe0f',pdfs.recycle)
        +'</div>';
      docTab.innerHTML=html;
      docTransformed=true;
    }catch(x){}
  }
  setTimeout(transformDocTab,2500);setTimeout(transformDocTab,5000);setTimeout(transformDocTab,8000);
  document.addEventListener('click',function(e){
    var t=e.target;while(t){
      if((t.textContent||'').indexOf('Documentation')>-1&&t.tagName){
        docTransformed=false;
        setTimeout(transformDocTab,1000);setTimeout(transformDocTab,3000);
        break;
      }
      t=t.parentElement;
    }
  },true);
} catch(e){}
true;
`;

/** Intercept clicks on PDF links and forward them via postMessage. */
export const PDF_INTERCEPT_JS = `
(function() {
  document.addEventListener('click', function(e) {
    var el = e.target;
    while (el && el.tagName !== 'A') el = el.parentElement;
    if (!el || !el.href) return;
    if (el.href.match(/\\.pdf(\\?|#|$)/i) || el.hasAttribute('download') ||
        (el.textContent && el.textContent.toLowerCase().includes('download pdf'))) {
      e.preventDefault();
      e.stopPropagation();
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'pdf_download', url: el.href }));
      return false;
    }
  }, true);
  true;
})();
`;

/** Force desktop-width viewport (1400px) before content loads. */
export const DESKTOP_VIEWPORT_JS = `try{var m=document.querySelector('meta[name="viewport"]');if(m){m.setAttribute('content','width=1400');}else{var v=document.createElement('meta');v.name='viewport';v.content='width=1400';document.head.appendChild(v);}}catch(e){}true;`;

/** Chrome desktop user-agent string for desktop mode. */
export const DESKTOP_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Measures document height and posts it back to React Native.
 * Runs immediately, on retries, and watches for DOM mutations / resizes.
 */
export const HEIGHT_MEASURE_JS = `
(function() {
  function sendHeight() {
    var h = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    if (h > 0) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'height', value: h }));
    }
  }
  sendHeight();
  setTimeout(sendHeight, 1000);
  setTimeout(sendHeight, 3000);
  setTimeout(sendHeight, 6000);
  new MutationObserver(function() { setTimeout(sendHeight, 300); })
    .observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', sendHeight);
})();
`;
