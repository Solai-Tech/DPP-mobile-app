import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import WebView from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import * as ticketDao from '../src/database/ticketDao';
import { getDatabaseSync } from '../src/database/database';
import { TextMuted, TextPrimary } from '../src/theme/colors';
import { s, vs, ms } from '../src/utils/scale';

async function downloadPdf(pdfUrl: string) {
  try {
    const filename = `datasheet-${Date.now()}.pdf`;
    const dest = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.downloadAsync(pdfUrl, dest);
    Alert.alert('Downloaded!', 'PDF has been saved successfully.');
  } catch {
    Alert.alert('Download failed', 'Unable to download the PDF.');
  }
}

const HIDE_SECTIONS_JS = `
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
          +'<span style="font-size:16px;color:#e53935">📅</span>'
          +'<span style="font-size:13px;color:#666">Expiry Date:</span>'
          +'</div>'
          +'<input type="date" placeholder="yyyy-mm-dd" style="margin-top:4px;padding:8px 10px;border:1px solid #ddd;border-radius:4px;font-size:14px;width:250px">'
          +'</div>';
      }
      var html='<div style="padding:12px">'
        +'<h2 style="font-size:22px;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px">'
        +'<span style="font-size:24px">📄</span> Documentation</h2>'
        +row('Warranty','🛡️',pdfs.warranty)
        +row('Recycle','♻️',pdfs.recycle)
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

const PDF_INTERCEPT_JS = `
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

const AUTO_DOWNLOAD_JS = `
(function() {
  function findPdf() {
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      if (links[i].href.match(/\\.pdf(\\?|#|$)/i)) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'pdf_download', url: links[i].href }));
        return;
      }
    }
    for (var i = 0; i < links.length; i++) {
      if (links[i].hasAttribute('download') ||
          (links[i].textContent && links[i].textContent.toLowerCase().includes('download pdf'))) {
        links[i].click();
        return;
      }
    }
    var buttons = document.querySelectorAll('button, [role="button"], .btn');
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].textContent && buttons[i].textContent.toLowerCase().includes('download')) {
        buttons[i].click();
        return;
      }
    }
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'no_pdf_found' }));
  }
  setTimeout(findPdf, 2500);
  true;
})();
`;

export default function WebViewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { url, title, autoDownload, productData, openChat, productId, desktopMode } = useLocalSearchParams<{
    url?: string;
    title?: string;
    autoDownload?: string;
    productData?: string;
    openChat?: string;
    productId?: string;
    desktopMode?: string;
  }>();
  const numericProductId = productId ? Number(productId) : null;
  const safeUrl = typeof url === 'string' ? url : '';
  const safeTitle = typeof title === 'string' ? title : 'Web View';
  const isAutoDownload = autoDownload === 'true';
  const [pdfStatus, setPdfStatus] = useState(isAutoDownload ? 'loading' : '');

  const webViewRef = useRef<WebView>(null);

  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'all_chat_messages' && Array.isArray(data.messages)) {
        const pendingId = numericProductId ? -numericProductId : -1;
        // Full replace — delete old pending, save fresh complete messages
        const db = getDatabaseSync();
        db.runSync('DELETE FROM chat_messages WHERE ticketId = ?', [pendingId]);
        const now = Date.now();
        data.messages.forEach((m: { text: string; sender: string }, i: number) => {
          if (m.text && m.text.trim()) {
            ticketDao.insertChatMessage({
              ticketId: pendingId,
              message: m.text.trim(),
              sender: m.sender === 'user' ? 'user' : 'bot',
              createdAt: now + i,
            });
          }
        });
      }


      if (data.type === 'pdf_download' && data.url) {
        if (isAutoDownload) {
          router.back();
          downloadPdf(data.url);
        } else {
          downloadPdf(data.url);
        }
      }
      if (data.type === 'no_pdf_found' && isAutoDownload) {
        router.back();
        Alert.alert('No PDF found', 'No downloadable PDF found for this product.');
      }
    } catch {
      // ignore
    }
  };

  const handleShouldStartLoad = (request: { url: string }) => {
    if (/\.pdf(\?|#|$)/i.test(request.url) && !request.url.includes('docs.google.com')) {
      if (isAutoDownload) {
        router.back();
        downloadPdf(request.url);
        return false;
      }
      // Open PDF in a new in-app WebView screen using Google Docs viewer
      const viewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(request.url)}`;
      router.push(`/webview?url=${encodeURIComponent(viewerUrl)}&title=${encodeURIComponent('Document')}`);
      return false;
    }
    return true;
  };

  const isChatOnly = openChat === 'true';

  // When opening chat directly: overlay page with loading screen (don't modify page elements)
  // This ensures Flowise chatbot initializes normally with full product context
  const chatOnlyCSS = isChatOnly ? `
try {
  var cs = document.createElement('style');
  cs.innerHTML = 'body::after{content:"Loading assistant...";position:fixed;top:0;left:0;right:0;bottom:0;background:#f5f7fa;display:flex;justify-content:center;align-items:center;font-family:-apple-system,sans-serif;font-size:16px;color:#999;z-index:9998}flowise-chatbot{position:fixed!important;z-index:99999!important}';
  if(document.head){document.head.appendChild(cs);}
  else if(document.documentElement){document.documentElement.appendChild(cs);}
} catch(e){}
true;
` : '';

  const autoOpenChatJS = isChatOnly ? `
try {
  var chatOpened = false;
  function cleanName(t){return t.replace(/^R_/,'').replace(/_/g,' ').trim();}
  function openFlowiseChat(){
    if(chatOpened) return true;
    try{
      var el=document.querySelector('flowise-chatbot');
      if(el&&el.shadowRoot){
        var btn=el.shadowRoot.querySelector('button[part="button"]');
        if(btn){btn.click();chatOpened=true;
          // Clean product name in chatbot header
          setTimeout(function(){
            try{
              var titles=el.shadowRoot.querySelectorAll('h2,h3,[class*="title"],[class*="header"] span,[class*="header"] div');
              titles.forEach(function(t){
                var txt=t.textContent||'';
                if(txt.match(/^R_/)||txt.indexOf('R_')>-1){
                  t.textContent=cleanName(txt);
                }
              });
            }catch(x){}
          },500);
          return true;
        }
      }
    }catch(e){}
    return false;
  }
  var attempts=0;
  var timer=setInterval(function(){
    if(openFlowiseChat()||++attempts>50){clearInterval(timer);}
  },200);
  // Keep cleaning names periodically
  setInterval(function(){
    try{
      var el=document.querySelector('flowise-chatbot');
      if(!el||!el.shadowRoot) return;
      var all=el.shadowRoot.querySelectorAll('*');
      for(var i=0;i<all.length;i++){
        if(all[i].children.length===0){
          var txt=all[i].textContent||'';
          if(txt.match(/R_/)&&txt.length<100){
            all[i].textContent=cleanName(txt);
          }
        }
      }
    }catch(x){}
  },2000);
} catch(e){}
true;
` : '';

  // Capture Flowise chat messages — batch all messages each time, send as one array
  const captureChatJS = isChatOnly ? `
try {
  var lastSnapshot = '';
  function captureAllMessages() {
    try {
      var el = document.querySelector('flowise-chatbot');
      if (!el || !el.shadowRoot) return;
      var root = el.shadowRoot;
      var results = [];

      // Find user and bot messages
      var userMsgs = root.querySelectorAll('.userMessage, [data-testid="user-message"]');
      var botMsgs = root.querySelectorAll('.botMessage, [data-testid="bot-message"]');
      var seen = {};

      if (userMsgs.length > 0 || botMsgs.length > 0) {
        var all = [];
        userMsgs.forEach(function(m){ all.push({el:m, sender:'user'}); });
        botMsgs.forEach(function(m){ all.push({el:m, sender:'bot'}); });
        all.sort(function(a,b){
          var pos = a.el.compareDocumentPosition(b.el);
          return pos & 2 ? 1 : pos & 4 ? -1 : 0;
        });
        all.forEach(function(item){
          var t = (item.el.innerText || item.el.textContent || '').trim();
          if (t && !/^source\\s*\\d+$/i.test(t)) {
            results.push({text:t, sender:item.sender});
          }
        });
      } else {
        var allMsgs = root.querySelectorAll('[class*="bubble"], [class*="guest"], [class*="host"]');
        allMsgs.forEach(function(m) {
          var t = (m.innerText || m.textContent || '').trim();
          if (!t || t.length < 2 || /^source\\s*\\d+$/i.test(t)) return;
          var cls = (m.className || '') + ' ' + ((m.parentElement && m.parentElement.className) || '');
          var sender = cls.match(/user|human|sent|right|guest/i) ? 'user' : 'bot';
          results.push({text:t, sender:sender});
        });
      }

      // Remove consecutive duplicates (same sender+text in a row from nested DOM)
      var deduped = [];
      for (var di = 0; di < results.length; di++) {
        if (di === 0 || results[di].text !== results[di-1].text || results[di].sender !== results[di-1].sender) {
          deduped.push(results[di]);
        }
      }
      results = deduped;

      // Only send if changed
      var snap = JSON.stringify(results);
      if (snap !== lastSnapshot && results.length > 0) {
        lastSnapshot = snap;
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'all_chat_messages',
          messages: results
        }));
      }
    } catch(e) {}
  }

  function startObserver() {
    try {
      var el = document.querySelector('flowise-chatbot');
      if (!el || !el.shadowRoot) return false;
      var observer = new MutationObserver(function() {
        setTimeout(captureAllMessages, 500);
      });
      observer.observe(el.shadowRoot, { childList: true, subtree: true, characterData: true });
      return true;
    } catch(e) { return false; }
  }

  var obsAttempts = 0;
  var obsTimer = setInterval(function() {
    if (startObserver() || ++obsAttempts > 60) clearInterval(obsTimer);
  }, 500);

  setInterval(captureAllMessages, 1500);

  // Capture before page unload
  window.addEventListener('beforeunload', function() { captureAllMessages(); });
  window.addEventListener('pagehide', function() { captureAllMessages(); });
} catch(e) {}
true;
` : '';

  const injectedJS = HIDE_SECTIONS_JS + '\n' + chatOnlyCSS + '\n' + autoOpenChatJS + '\n' + captureChatJS + '\n' + (isAutoDownload
    ? PDF_INTERCEPT_JS + '\n' + AUTO_DOWNLOAD_JS
    : PDF_INTERCEPT_JS);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (isChatOnly && webViewRef.current) {
            // Force capture chat messages before leaving
            webViewRef.current.injectJavaScript('try{captureAllMessages();}catch(e){}true;');
            setTimeout(() => router.back(), 300);
          } else {
            router.back();
          }
        }} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios-new" size={ms(18)} color={TextPrimary} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{safeTitle}</Text>
      </View>

      {/* Auto-download: show loading overlay on top of hidden WebView */}
      {isAutoDownload && pdfStatus ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00E676" />
          <Text style={styles.loadingText}>
            {pdfStatus === 'downloading' ? 'Downloading PDF...' : 'Finding PDF...'}
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {safeUrl ? (
        <WebView
          ref={webViewRef}
          source={{ uri: safeUrl }}
          style={isAutoDownload ? styles.hiddenWeb : styles.web}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
          startInLoadingState={!isAutoDownload}
          allowFileAccess
          {...(desktopMode === 'true' ? { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } : {})}
          injectedJavaScriptBeforeContentLoaded={
            (desktopMode === 'true'
              ? `try{var m=document.querySelector('meta[name="viewport"]');if(m){m.setAttribute('content','width=1400');}else{var v=document.createElement('meta');v.name='viewport';v.content='width=1400';document.head.appendChild(v);}}catch(e){}true;`
              : '')
            + (chatOnlyCSS || '')
            || undefined
          }
          injectedJavaScript={injectedJS}
          onMessage={handleMessage}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          onFileDownload={({ nativeEvent }) => {
            if (nativeEvent.downloadUrl) {
              if (isAutoDownload) router.back();
              downloadPdf(nativeEvent.downloadUrl);
            }
          }}
        />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Invalid URL</Text>
        </View>
      )}

      {/* Floating Chat Button - opens Flowise chatbot on the website (hidden in chat-only mode) */}
      {!isChatOnly && <TouchableOpacity
        style={[styles.chatFab, { bottom: vs(16) + insets.bottom }]}
        onPress={() => {
          webViewRef.current?.injectJavaScript(`
            (function(){
              try {
                var el=document.querySelector('flowise-chatbot');
                if(el&&el.shadowRoot){
                  var btn=el.shadowRoot.querySelector('button[part="button"]');
                  if(btn){btn.click();return;}
                }
                var ct=document.querySelector('.chat-tab-2,.content');
                if(ct){ct.click();}
              }catch(e){}
              true;
            })();
          `);
        }}
        activeOpacity={0.85}
      >
        <View style={styles.chatFabIcon}>
          <MaterialIcons name="chat" size={ms(20)} color="#FFFFFF" />
        </View>
        <View style={styles.chatFabTextWrap}>
          <Text style={styles.chatFabTitle}>Need Help?</Text>
          <Text style={styles.chatFabSub}>Chat with us</Text>
        </View>
        <View style={styles.chatFabDot} />
      </TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    height: vs(48),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(12),
    backgroundColor: '#0A1A14',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    width: s(34),
    height: s(34),
    borderRadius: s(17),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(8),
  },
  title: {
    flex: 1,
    fontSize: ms(14),
    fontWeight: '600',
    color: TextPrimary,
  },
  web: {
    flex: 1,
  },
  hiddenWeb: {
    height: 0,
    opacity: 0,
  },
  loadingOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(16),
  },
  loadingText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#1A1A1A',
  },
  cancelBtn: {
    marginTop: vs(12),
    paddingHorizontal: s(24),
    paddingVertical: vs(10),
    borderRadius: s(10),
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  cancelText: {
    fontSize: ms(14),
    fontWeight: '600',
    color: '#6B6B6B',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: TextMuted,
    fontSize: ms(12),
  },
  chatFab: {
    position: 'absolute',
    right: s(16),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: s(24),
    paddingVertical: vs(10),
    paddingHorizontal: s(14),
    gap: s(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  chatFabIcon: {
    width: s(36),
    height: s(36),
    borderRadius: s(18),
    backgroundColor: '#7C4DFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatFabTextWrap: {
    marginRight: s(4),
  },
  chatFabTitle: {
    fontSize: ms(13),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chatFabSub: {
    fontSize: ms(11),
    color: '#CCCCCC',
  },
  chatFabDot: {
    width: s(8),
    height: s(8),
    borderRadius: s(4),
    backgroundColor: '#00E676',
  },
});
