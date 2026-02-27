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
import { getChatbotReply } from '../src/utils/chatbotApi';
import { ScannedProduct } from '../src/types/ScannedProduct';

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

// Support icon as base64 data URI (get-support-icon.png)
const SUPPORT_ICON_B64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFIAAABsCAYAAAD5XOVGAAAMTmlDQ1BJQ0MgUHJvZmlsZQAASImVVwdYU8kWnltSIQQIREBK6E0QkRJASggtgPQuKiEJEEqMCUHFjiy7gmsXEazoKoiCqysgiw11bSyKvS8WVJR1cV3sypsQQJd95XvzfXPnv/+c+eecc+feOwMAvYsvleaimgDkSfJlMcH+rKTkFBbpGUABAzCBPcD4ArmUExUVDmAZbv9eXl8DiLK97KDU+mf/fy1aQpFcAACSBXG6UC7Ig/gnAPBWgVSWDwBRCnnzWflSJV4LsY4MOghxjRJnqnCrEqer8MVBm7gYLsSPACCr8/myTAA0+iDPKhBkQh06jBY4SYRiCcR+EPvk5c0QQrwIYhtoA+ekK/XZ6V/pZP5NM31Ek8/PHMGqWAYLOUAsl+by5/yf6fjfJS9XMTyHNazqWbKQGGXMMG+PcmaEKbE6xG8l6RGREGsDgOJi4aC9EjOzFCHxKnvURiDnwpzB5wzQSfLcWN4QHyPkB4RBbAhxhiQ3InzIpihDHKS0gflDK8T5vDiI9SCuEckDa4dsjslmxAzPey1DxuUM8U/5skEflPqfFTnxHJU+pp0l4g3pY46FWXGJEFMhDigQJ0RArAFxhDwnNmzIJrUwixsxbCNTxChjsYBYJpIE+6v0sfIMWVDMkP3uPPlw7NixLDEvYghfys+KC1HlCnsk4A/6D2PB+kQSTvywjkieFD4ci1AUEKiKHSeLJPGxKh7Xk+b7x6jG4nbS3Kghe9xflBus5M0gjpMXxA6PLciHi1Olj5dI86PiVH7ildn80CiVP/g+EA64IACwgALWdDADZANxR29TL7xT9QQBPpCBTCACDkPM8IjEwR4JvMaCQvA7RCIgHxnnP9grAgWQ/zSKVXLiEU51dQAZQ31KlRzwGOI8EAZy4b1iUEky4kECeAQZ8T884sMqgDHkwqrs//f8MPuF4UAmfIhRDM/Iog9bEgOJAcQQYhDRFjfAfXAvPBxe/WB1xtm4x3AcX+wJjwmdhAeEq4Quws3p4iLZKC8ngy6oHzSUn/Sv84NbQU1X3B/3hupQGWfiBsABd4HzcHBfOLMrZLlDfiuzwhql/bcIvnpCQ3YUJwpKGUPxo9iMHqlhp+E6oqLM9df5UfmaPpJv7kjP6Pm5X2VfCNuw0ZbYd9gB7DR2HDuLtWJNgIUdxZqxduywEo+suEeDK254tphBf3Kgzug18+XJKjMpd6pz6nH6qOrLF83OV76M3BnSOTJxZlY+iwP/GCIWTyJwHMdydnJ2A0D5/1F93l5FD/5XEGb7F27JbwB4Hx0YGPj5Cxd6FIAf3eEn4dAXzoYNfy1qAJw5JFDIClQcrrwQ4JeDDt8+fWAMzIENjMcZuAEv4AcCQSiIBHEgGUyD3mfBdS4Ds8A8sBiUgDKwEqwDlWAL2A5qwF6wHzSBVnAc/ALOg4vgKrgNV083eA76wGvwAUEQEkJDGIg+YoJYIvaIM8JGfJBAJByJQZKRNCQTkSAKZB6yBClDViOVyDakFvkROYQcR84inchN5D7Sg/yJvEcxVB3VQY1QK3Q8ykY5aBgah05FM9GZaCFajC5HK9BqdA/aiB5Hz6NX0S70OdqPAUwNY2KmmAPGxrhYJJaCZWAybAFWipVj1Vg91gKf82WsC+vF3uFEnIGzcAe4gkPweFyAz8QX4MvwSrwGb8RP4pfx+3gf/plAIxgS7AmeBB4hiZBJmEUoIZQTdhIOEk7Bd6mb8JpIJDKJ1kR3+C4mE7OJc4nLiJuIDcRjxE7iQ2I/iUTSJ9mTvEmRJD4pn1RC2kBaQzpKukTqJr0lq5FNyM7kIHIKWUIuIpeTd5OPkC+Rn5A/UDQplhRPSiRFSJlDWUHZQWmhXKB0Uz5QtajWVG9qHDWbuphaQa2nnqLeob5SU1MzU/NQi1YTqy1Sq1Dbp3ZG7b7aO3VtdTt1rnqqukJ9ufou9WPqN9Vf0Wg0K5ofLYWWT1tOq6WdoN2jvdVgaDhq8DSEGgs1qjQaNS5pvKBT6JZ0Dn0avZBeTj9Av0Dv1aRoWmlyNfmaCzSrNA9pXtfs12JoTdCK1MrTWqa1W+us1lNtkraVdqC2ULtYe7v2Ce2HDIxhzuAyBIwljB2MU4xuHaKOtQ5PJ1unTGevTodOn662rotugu5s3Srdw7pdTIxpxeQxc5krmPuZ15jvxxiN4YwRjVk6pn7MpTFv9Mbq+emJ9Er1GvSu6r3XZ+kH6ufor9Jv0r9rgBvYGUQbzDLYbHDKoHeszlivsYKxpWP3j71liBraGcYYzjXcbthu2G9kbBRsJDXaYHTCqNeYaexnnG281viIcY8Jw8THRGyy1uSoyTOWLovDymVVsE6y+kwNTUNMFabbTDtMP5hZm8WbFZk1mN01p5qzzTPM15q3mfdZmFhMtphnUWdxy5JiybbMslxvedryjZW1VaLVt1ZNVk+t9ax51oXWddZ3bGg2vjYzbaptrtgSbdm2ObabbC/aoXaudll2VXYX7FF7N3ux/Sb7znGEcR7jJOOqx113UHfgOBQ41Dncd2Q6hjsWOTY5vhhvMT5l/Krxp8d/dnJ1ynVa4XR7gvaE0AlFE1om/Ols5yxwrnK+MpE2MWjiwonNE1+62LuIXDa73HBluE52/da1zfWTm7ubzK3ercfdwj3NfaP7dbYOO4q9jH3Gg+Dh77HQo9XjnaebZ77nfs8/vBy8crx2ez2dZD1JNGnHpIfeZt58723eXT4snzSfrT5dvqa+fN9q3wd+5n5Cv51+Tzi2nGzOHs4Lfyd/mf9B/zdcT+587rEALCA4oDSgI1A7MD6wMvBekFlQZlBdUF+wa/Dc4GMhhJCwkFUh13lGPAGvltcX6h46P/RkmHpYbFhl2INwu3BZeMtkdHLo5DWT70RYRkgimiJBJC9yTeTdKOuomVE/RxOjo6Kroh/HTIiZF3M6lhE7PXZ37Os4/7gVcbfjbeIV8W0J9ITUhNqEN4kBiasTu5LGJ81POp9skCxObk4hpSSk7EzpnxI4Zd2U7lTX1JLUa1Otp86eenaawbTcaYen06fzpx9II6Qlpu1O+8iP5Ffz+9N56RvT+wRcwXrBc6GfcK2wR+QtWi16kuGdsTrjaaZ35prMnizfrPKsXjFXXCl+mR2SvSX7TU5kzq6cgdzE3IY8cl5a3iGJtiRHcnKG8YzZMzql9tISaddMz5nrZvbJwmQ75Yh8qrw5Xwdu9NsVNopvFPcLfAqqCt7OSph1YLbWbMns9jl2c5bOeVIYVPjDXHyuYG7bPNN5i+fdn8+Zv20BsiB9QdtC84XFC7sXBS+qWUxdnLP41yKnotVFfy1JXNJSbFS8qPjhN8Hf1JVolMhKrn/r9e2W7/DvxN91LJ24dMPSz6XC0nNlTmXlZR+XCZad+37C9xXfDyzPWN6xwm3F5pXElZKV11b5rqpZrbW6cPXDNZPXNK5lrS1d+9e66evOlruUb1lPXa9Y31URXtG8wWLDyg0fK7Mqr1b5VzVsNNy4dOObTcJNlzb7ba7fYrSlbMv7reKtN7YFb2ustqou307cXrD98Y6EHad/YP9Qu9NgZ9nOT7sku7pqYmpO1rrX1u423L2iDq1T1PXsSd1zcW/A3uZ6h/ptDcyGsn1gn2Lfsx/Tfry2P2x/2wH2gfqfLH/aeJBxsLQRaZzT2NeU1dTVnNzceSj0UFuLV8vBnx1/3tVq2lp1WPfwiiPUI8VHBo4WHu0/Jj3Wezzz+MO26W23TySduHIy+mTHqbBTZ34J+uXEac7po2e8z7Se9Tx76Bz7XNN5t/ON7a7tB391/fVgh1tH4wX3C80XPS62dE7qPHLJ99LxywGXf7nCu3L+asTVzmvx125cT73edUN44+nN3JsvbxXc+nB70R3CndK7mnfL7xneq/7N9reGLreuw/cD7rc/iH1w+6Hg4fNH8kcfu4sf0x6XPzF5UvvU+WlrT1DPxWdTnnU/lz7/0Fvyu9bvG1/YvPjpD78/2vuS+rpfyl4O/Lnslf6rXX+5/NXWH9V/73Xe6w9vSt/qv615x353+n3i+ycfZn0kfaz4ZPup5XPY5zsDeQMDUr6MP7gVwIDyaJMBwJ+7AKAlA8CA50bqFNX5cLAgqjPtIAL/CavOkIMF7lzq4Z4+uhfubq4DsG8HAFZQn54KQBQNgDgPgE6cOFKHz3KD505lIcKzwdboT+l56eDfFNWZ9Cu/R7dAqeoCRrf/Aj6fgxAt6BZ/AAAABGNJQ1AMDQABbgPj7wAAAIplWElmTU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAIdpAAQAAAABAAAATgAAAAAAAACQAAAAAQAAAJAAAAABAAOShgAHAAAAEgAAAHigAgAEAAAAAQAAAFKgAwAEAAAAAQAAAGwAAAAAQVNDSUkAAABTY3JlZW5zaG90NYtVWAAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAdVpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDYuMC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+MTA4PC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjgyPC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6VXNlckNvbW1lbnQ+U2NyZWVuc2hvdDwvZXhpZjpVc2VyQ29tbWVudD4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CoUj/WYAAAAcaURPVAAAAAIAAAAAAAAANgAAACgAAAA2AAAANgAADn7/vy5RAAAOSklEQVR4Aexaa5AU1RX+untm9gkriIBGKhSRGKMpKxVfxUvknUpSEKMSLXUVg8pDVEARFogirxAURYNiaWkiKY2ExB/xQUiQpFIaixBUkEc0RBSwRBc2sI/ZmemZnHPuPT2Pfc8OAav2bm1339u3T5/73e+ce+7pcWrrG1LoKp1GwOkCstMYioAuIAuDI7qA7AKyQAgUSEwXI7uALBACBRLTxcguIAuEQIHEdDGyC8gCIVAgMV96RjqOi1QqWSA48heTB5CefZtvz6buBDt2bc9WKuVoXZ8HHCdoJDCMAG3TOj+lbSqhuTP3b6tfKpVo7tGCtJ1UIHkEPHgFrTkwcsHRvjr6zOe1reVz85Pccv/238kDSCs8FTIXjs6yMjNb2TQTs5XSdsd15YafTAqg2p6kOhdmeiaYmdd836OJUBmpjGf43v+znFQgE34a9CSZJrMtaa1d/Z6T4/5cC7yC5BKQ2sYgcz3tZrTXiT/nAaT6OAtCDjN1EMosPetQGDAuCVogmIU+EVLYl3aX2jU4Z5pzLiO5k0sLDreH6WVyprq0w5xVpyRyZkV6FeZwwoGER6sqAaaM84mF/J/yeNAu4jq4VoBsc6h2oQuJG3ARcT0BlI7yqHEPLr3plARSh6fmmc1UZiL7Lh4jAxdL+cQ8Hwlof30++2wxyW7MqLWGN7OR2etZIZ7nIRQKES8NU+Gbp/W+WosyNuM1Hb7sBCP1XQpMUyDZdJmJbLoJcnY8SJ/OOmCWwNeZpTNAqhwFiussP+RYhjpmgdT7JxlIVbfpWYJjcktsynH1gcRELpYMAiTX3bYQ4055lmBqlJkkhxeksBshKyFfmjRBvAKZ+5p8GJoHI3Nfm11n5ZiF0URMbqiyJxtIVsZFCJFIGCGaW570lnzmSQVSAWMmxmIxOCFPfCIDKKacjbddBnIa21XNf8HwUry6uygKh+VNnhWVD3C5qhaMkQxkPJEgkzamrMAqE3MtOTC/XI3arOcHJE+ml/LITycpiKdFiBcimk62HvahGre2+foWOrQbSAVG5bg0HjEPWmPYJ0YJQN9PUHzoCwNzKadAUsisIvI85wekeZl9NynDK3qEdHEpPFOfmadC8lingGQJCWsXDb7xiRTkGH1yKHeqAclKhglI9plewiQ8ZLEkxuZTOg1knCKKxsZGpILwxvhE4mm2PhbYVA61HXVQOe3ZD7dRszJyZetTOqepXGtIGgDLi0qMyedgqKqpnNbOeQEpfoUGzoF2A4XYUiieMXGivu7UBpJ15UCdwyIxcTqzz5RNBLkqLicESIWHNnd6iQQvLjb742tg2E5mpayWyhaidCCXL9JvyWoORhf05gVE3YntGtzLeVSrLFuAtJsBBjDkhQjI7IBdgUyrlr3pIE+rIjv+SwsFUthHjPyyAskIKOC80/EISIowZaHUnc8JB5JTVQ3JhMSJcdo7c2jRbl+nVNNR2HrKMbEd7YFklikwCWbbNJiO6gf1cQ6zlZHptuxH26xZHYpp5+NR/NvmKp6T8WL57faRqowykldpZiXvoU8FIDNNVXVt7cz9WW8uKVp0uBQRkBxfEpyy+Ehjc4fOAqnbKg68GzSLQ0CaYqc1MJjmNEi3cR6Si2cdEE8QD4ychbQf9euwd88eHKo+gPq6BlR0q0C/fv1w3te+LjFgcTyCJLkW1yc/RftnBoaLTKpcdezAz4fJKji+LHJDkmhx7aqelqQ+0VgNAkBJ947+PpIHHKctYKPK7CSQHNhz4cx4IhHHi+tfwO5du3Dw2GFhRyOiApJHLGGQSkJF6N2nL0ZfNgKDBg1CkROBb9kVgGlEdvjIiw2/g4HkckKA1JUrxjlF2sEkaUfA4Q9BIC/XdE5THyY6BYdgtbbfFJJenOT5WP/X32Hzpk04Hq5P92WAiGhsCWR/AmjKIu8mS3Baz9MxafzNuGzAt4VBDAKXjtlGur9HaTZO+ZWGTJaIkxsizzpfhyIEU+yNfFZtBpLjRwaSE7SdAZKZ41ICgUtDoharH3sM7x56j8zKRUNxDGHabQwZMQLnDByIivLuCIdDaKirw5Ej1dj2zjbs3bkTiXraK1PyoaShBM8sfyL4biOstIDa8Zuxt3IMgCed+PkSj0ycFp2CAKkMZAKwcJ8+DfBsxVJmkdFkhOoXKKMNLZyZkSzHZXDq61H11EJ8evAgkmVxyRXeOG4yBg0ehPJUGNFoFAc+r0ZtbR0qepSid+/eKPUiOHz4c7y0ZQP+/uabSBLw3xsyHuO/PwE9G7qLriRIzkxkLgGgOijT3OyRx8q+kicv4hsTb9qxA4zUd2YCyaYcpz8BNtDOvKa9QHIOkE2QDFWY+PbBt0VA+dllmD5rFvq7/fHOu9vx1sbNqDlag8+O/lfu+6lGYeC3zj0fY8eOwRkDz8bW997Gug3Pwj3q4PobKjHu/NHSlxyCcTc2EAxU1UEZlZs98thCZLKRSKTwQPIbEzS7spOxq2rHGWnokXLMbG7asQnrnv8lGkqjKOveHStnPiLm9Ngzq7Hr/Z3wI0lcfd212PPPndjFptyNnqNB6mf0kZeMxo+uvBq7duzGmhdXoaikBMumP4SKigqUNYQsI9WnGcwCQJuF0DQykJRwEyCLk4aRjk0NBo8Fq7V+028ljuTJ0z01C2Ag43FaGHRLmKNV24xMA1lfX4c7Fk9HjJIdfs8kZi+Yj/6pr2LpksU4WHOA/J2HmNuIZQ8/jDIU44GfLkC1/wWvOnDi5k2huhAuvuRS3HzjT3DrnEpJhw0bOAaVlZUCJLOeIcks2bXMO+lrBZI/mpVSRMmlU0CqaMrYyWWM0smc5aEv0WI2uYzU/k3P5nle3bmwj9y6dStWvrJCWHPpBUNw0w2T8OTaJ4iJO4h5MfGh5575TcyccQ961HdDTU0N7nlyHo4fO45kUVTkuLwRIvZMHFuJ17e8gtpjxxAJFWPJ8hU4q76X6Ng096kxr4ho9sBAghYdBrKE0xk8edQkE8P3Mou6CurQZhxZaCDZR65a9QjeqvmbBL8/X/QojlRX42dLlomysbIoscvDww+sptWzVIBk3fcXH8baNU/gw092ygqdpEWP+5XFemDk+NF45eWXKUJycNXEibjqwgnGtC0J0mNvP5AcmJe7xfLoCQFS99bBZKS1bOEqm5HHcQwz7piBuj4x9OrTB8vvXIZHH1mFHYe2W6XDqJw8GWP7D5M41bX+iJNLvNq/uv1PeGPzn3Gw9hMBy6P018KZi7B40QPwuzXgnPO+gftveBA+7b6Kfbt/b49N09uZb8a0iT7kXsoskDoCBtSUDqza+kguIzsL5H++2Ee+cClqetRh4AXn4+5r7sCsu+5CQ1mtrMo/mHANhl58Oc6KVwRAslkxkDzI2jIKv0i53dV7sH3bNuzftw+zJ9+L2TPvRl34KHqf2RerZjwu6kdiFoJTAUjZVZBajS79WoK2hvxLCePIDdS5OgaTZm4TjUwowhl0ZhQH3qseegiNp0Vx8ZBBuG7otbhvzhyUnl2Km265BRf2uUD6FcWLxD+59nlBj2QmKcfFgCbDHNf69CErhGiokWTci0+dQ+jW4zSsue8X0r2s3jAysB69UN0yzmZMZvfk2M1C91CJ6dFkz53xoL1s00d2FkhVSj9FvPaP1/DSi79Bfbc6DBs9ChMHX4M/btyIURPGkfdM4oXHf4VDFKAvqVqKCO1cGEgpdoa2v/8unnv2Ofzwx1fSXnsweUEXsXAMCxcuxEexfSguK8PiKYtxRq8zcEoBqdjHiAmtMbIJE3Wm7Oz6FNnv3bsH9z+/SNJWbkkcg6+4HLcNv00YVkTZnHraBk5adqswcur1U3DRRRehPFoqkpykiQnvXVOFTz7ej/LyYixbugKn15ELIFlz587FR6FDlBFKoke4JxY/uBx9o92NFq0wUceXy0iXMkqZi432k3MQR5oPfpwTbZORKiBfINm0xRRpIn69bh3+sPtVEekUxTB4xHBMGXG71MONIQn4p6++GwmKV1cuWCEhSC6QL239PTa+/jpGjRqOsSO/ix513ZCgbeKC+fPxb/eAyPLqQ5h+550Y0vc7Us/9jGEas48nDEhdoXQy49QQi8doX2N9pLU49ZEaV2qaXr8cMYj8z3Ho008/jb/s3ywjcGj1YCBvv2Ka1CMmDYmEFeBZgQ59vOeiGXPd/jpoNO2xCBpLHGPa2C1tqZiHSVOnYOyZw6TuqnKqrLQ2PXCmnQHlyc9kJLuP5n9AkN45tcjIQgHJ6jKQcfL7T61diy0fbRYlKQ2CoaNGNAFSgXKD3ZdZeVsC0qVFKUrhnvhIZw+/DAzkLdOmYkzfoYLWKQUkTypvEaPESZ41zXBzWJJZgkm3M+FR1oh9q1/kEJBPYcvHb5CPTJLZehhEPnLq5ca0PfqFGBcNt/hKipWfoqiBC2/8pFjfy9UE0XnhgoX4AB/KpLlkRpW3Tca4fmOkq05KoJuR0OSYycgwp+isLwxRTJmklbspK5WRZKUtZchzGclActKCgeTSXiCJIqJAPJzCb9evx4btG2RnQmgKI6cNnyLylDWO+pI8gPxX6gPZc6fiScycNxeXlBkf2V4g2R2x9XCkkQmkTm5eQMro6MDhDwtgIM0vb20+klY1LjrLSkytq49kILn4no/q6iOYtbKK5NBvhCgzPnTECEwbOUnuK7M9G+4E38ltndNuUuwMkzeTqkcDjxb7mF81Hx9jnwDRv9cAzJldhZ7RCvOMPQb+O6s1uyJA2uxPifUz/EMCbtfMVfp7tu5wCIeWGKniM4HUxC6f/TyAZJdwyDsmSYvDxz5D/wEDMPorg+VVLQHJbBCz0hmyQKZs1pZD7noy7XnzqgTIkvJyrKhaSVCE8gbSo4yIJC0skGnrVODSJq04/Q8AAP//Cr9DgQAACV1JREFU7VzNi2RXFT/vq6q7Z9qJxglOEgIBMca0IDoGjEEhojj4gSC4Ew3iTjEL3YhE/Q9GUFy4cOlKIeBCEnHjLMSVzMJZCg5tIuLM4Myku+p9eX7n3t+rV7equl51v24n5p2h6777de65v/u7537Uq4nuvXlQSwcpI5GqqiTXf3VdS6FxhBqYUAnjCyojV6JCnSiSKomkLEtJq9jiC/V8+WlaazuVNA1J5epHiTURV6VM0lJ+9MOX5WbxN9l96IL89Ls/M9t2JlvdbNNSsImSRZlkmf4VsekRKZnlwjp1YTT16dqHTYAEcLkUCoD+xdFaIFEeEsexWlrbQCCFQCKMcldm1g2rYuXx9K3vfUfqSsuoigqhAgmpoVMl0bRJVsjk8FAOHror73rkEbn60lXL2wRIq6AfsGkcjyROYhmVaX9ARhFGxRmPxnJ9znOFM3PAIA2NOzj0GQnLJCgAhkMSD0zlGeGJqDmF5X/t5W/KZHIo1U5pnYqVySalA7KuS1ECSak2JeU5+fSVK/LiJ75qoI9rxygOKOxcJsxP1XoM+nY8FsycRDzzFiqRoW5WIHstI0MgC4UMU/IwclOcxgU4LTQdIt0VyO//4seST3XgzpfWOTIyKl0norhSdlYyGo/l+cufko/sfVQeLd+tQJaSaSMAiUDRVhqH9HaaAzKRLR2ZUwHSEFek0KhOainVV94rD509OsXbMh9r5/DZMUnnKxNc6CvWnpLUQx+JAYVEtWNqhbluCeozlTgGFhy3SlIoRVXAJwNSuQUhaNSN+eBAdgzLNIO+0ZUPGUkmmjr9YB86+MhZB1zlMnKV79cTZaayYWaVFQiibLEVdgcSnZymNNapSDzQlQdHIp3yykgTBRJgEchE62OBjOJM02NJ1O8hHzZaqCMA5hYFZlclBDLNnR4APS8nAJKK6LsI3DTRTk6nUnmnX3mmrAeSGhl6YJvRZTpD5jO+JCS7feON2/DTeifZtsUj0x0CBICCBJH3oXlUOMAVZPhI7ZoXAhkCyHwOcgdGskobSDClHCUGJHwm5EEDEjZiYo5GIxlHungo83SXZJIkifl5ZYExMRq7KQ72Qk4VSGuh9QFmwlcqJ83PFH6VbRU5u8f2KGurGFpM3UyhzLLUAMTi8bvyL3Ljrzdkf+ufkug+8fHdJ+W9l/bkhegxK3/uzZHZjK0dpPL7xESZ64QM9dFmf5msX7VZJQwBJIwrtBOFruIAEixAB85cVgC5k7kNeVzUcu3aNXlVgYTcv5SbnfEdXafV3m+/78ty8eJFOX8wtvxTBZK+kQ4YJwoIgMSUmKiPtCmvi9GZg7kEyDRN5UK9Y1P4z9t/l1de+bVMn/U7jcanZrbZ37r7Tnnuqc/L5yaPWZ9q3dpBamxQWxLpnnVOmhOOEqjryeYoIGMd1YPKAfk/meJLgMQ2ZrfcskH9yfVfyRuv/0Mmlw8cDgTSb7jL/Uw+dvmz8pXJM5Z/qkDORoJ+wo0OthVw5JK6xQdncQhXzmYB9Ao2nfhd6rNMHbunuIpskXlHsWVu56UbV23WjB6fmBUNjurfI12l89u1fODpF+Qb+bOWH+y4sCbNSVTPYyDKzM6MnGmaKQGIPD5y9eZZnHGlRFMVUx/s3UQIEussq80ybSAxtXcVSMgPXv+l3L19R9JHHSMJZIz7Av0HID/49Gfk6/mHrfyZA2mt+k1rrT4SvhFMxBHywO8refhGZ91ixG672l0/lwEY1m1rhi0XonNW5LX4uvzhtd/LdM8xMs6UAGojNupVUUjynx157pkvyhfyJ6w8tz+Bx9A8kogt02cea9WmspkSp9bFa93sQg51a1CokRWH3x/xAPhxZFMg0QaBvL51S377x9/I7Sf/bYtLnOo1XlFKnLrtzt6l5+VheUKu5O8x084ISA9Ds2LNA8MjJfwKgMzVD8GHgo2Qyvsxr+XEAbQ2IJOSvo1Rta2uO5U4Uyt0Z/Hz/Vdl/+ZNmT58IJWebLbq8/KhvY/Ll+L3m5btw8AZrrQuJJPa0HXVXtC5AkiWwxTHcavQ7RCMxubdzrXK1Pb2CM8EmXWPClmWOtpA2r2lVsadL/LHCmSiQEoysfifYucj9+u71sSurtp6KJRPxhfMhu1DnaJab730AmSgJAAUfoWdjWM9enm7ct2DwXcW/lwr3gXwtKqcnbN/FXHZTRwGIFi82J7eXhgQ6gI1jCWrM21G7fVGYGlxQrfkYpG6H9OBsp3EW10714BL62Mwko15Y5YAOWeLshIrO1fxKnEb9sPcXdMTSN2xzEmkN9/oHBhCllhIF6Gh5Wst5sd6m4NzNICEpKXfUHcAEuVr78fxfLT0CiSb8ouM/w5F12zL4M0WS5GZuIYDALyBgQ8F0LwwAOAABmXwBxLZVxVeEYcRUcvXcKyLBr4aSPUkgrRI/YqFwTSt9coNMtsHWlTj7IOLH+fzBIxkczSCXZwHkh1qA4maTK98NcQhAJLPcAUgKhmHfEx5TFsMBAR+MVHWQ/jVQGy3Ok6fZfiPBwzItmmLzwSMezCGTA9rIB2nC0itCxLLIw6WVsENPNLngEV8AbP5QUWd05ZjMPJokwgYO8eQ6WHtMJ3lWY5HTcbbIZibwIf+PwLZ7uhxnhdA8WwNdcGvAkhdp5uscFCajDN46J2RJ7U5BFLhMpXt6cw2BiCJRIeQC49uGNeWDgdhbYUeCzxwjFzVty7TdgByFXpvofS3DCMfdEwHIHsaoQHIAcieEOhJzcDIAcieEOhJzcDIAcieEOhJzcDIvoC8f+Dfhu9J4dtVjTJyunCb93YF4yT9jm7duTcAeRIEfd3ojX/dGoDsA8hhaveAoqoYfGQ/OB4FpPtadfENrJ5abr1/vVzjaba/Tvfm+Ucwcp2y5d3vnrpO/7r87i0tllyne/P8AUhDmcCFkHf/fnwAsj8gw99r8x0S/62dvj3mhKPjo/w2am3+it1V5/r8TfT8Lwz4hplY+6tsO4u2gcfSN3YHIGeD1GUQCeR9/vKcoxf4i+C1Pc9HDfhCXsCUZjXeND9od0H/unxYxjKr2qb1vpy+P2nif6jK3EbP2vzZr2ejewOQupsm8ISyK9BtIJv/0yLwM9TZjPKq/Kbghg8he/zboQta2MlV+QsVOiSwL7QhrBLmMx6Wm8V11eZis6owG1uVP1O22RP1rgNqXf5mrbrS7AttCHWE+YyH5Wbx/wIPQ5jnH0ffOgAAAABJRU5ErkJggg==';

// Clear Flowise cached session + hide DPP page content (only chatbot visible, no flash)
const CLEAR_SESSION_JS = `
try {
  localStorage.clear();
  sessionStorage.clear();
  var s = document.createElement('style');
  s.textContent = 'body{background:#0A1A14!important;margin:0!important} body>*:not(flowise-chatbot){display:none!important} flowise-chatbot{display:block!important}';
  document.documentElement.appendChild(s);
  document.documentElement.style.background = '#0A1A14';
} catch(e) {}
true;
`;

// Auto-open Flowise chatbot, hide star avatar via CSS (no flash), hide header, signal ready
const AUTO_OPEN_CHAT_JS = `
(function() {
  var supportIcon = '${SUPPORT_ICON_B64}';
  var chatOpened = false;
  var readySent = false;
  var styleInjected = false;
  function injectAvatarCSS(sr) {
    if (styleInjected) return;
    styleInjected = true;
    var s = document.createElement('style');
    s.textContent =
      '.chatbot-container > div.absolute { display:none!important; }'
      + ' div[part="bot"] > div > button.absolute { display:none!important; }'
      + ' .chatbot-chat-view { padding-top:10px!important; }';
    sr.appendChild(s);
  }

  function signalReady() {
    if (!readySent) {
      readySent = true;
      window.ReactNativeWebView.postMessage(JSON.stringify({type:'chat_ready'}));
    }
  }

  function openFlowiseChat() {
    if (chatOpened) return true;
    try {
      var el = document.querySelector('flowise-chatbot');
      if (el && el.shadowRoot) {
        injectAvatarCSS(el.shadowRoot);
        var btn = el.shadowRoot.querySelector('button[part="button"]');
        if (btn) {
          btn.click();
          chatOpened = true;
          setTimeout(signalReady, 300);
          return true;
        }
      }
    } catch(e) {}
    return false;
  }
  var attempts = 0;
  var timer = setInterval(function() {
    if (openFlowiseChat() || ++attempts > 50) {
      clearInterval(timer);
      if(!readySent) signalReady();
    }
  }, 200);
  true;
})();
`;

// Capture Flowise chat messages and send to RN for local DB storage (used by Raise Ticket)
const CAPTURE_CHAT_JS = `
(function() {
  var lastSnapshot = '';
  function captureAllMessages() {
    try {
      var el = document.querySelector('flowise-chatbot');
      if (!el || !el.shadowRoot) return;
      var root = el.shadowRoot;
      var chatView = root.querySelector('.chatbot-chat-view');
      if (!chatView) return;
      var results = [];
      var rows = chatView.querySelectorAll('[class*="guest"], [class*="host"], [class*="user"], [class*="bot"], [class*="bubble"]');
      if (rows.length > 0) {
        rows.forEach(function(m) {
          var t = (m.innerText || m.textContent || '').trim();
          if (!t || t.length < 2) return;
          if (/^source\\s*\\d+$/i.test(t)) return;
          var cls = (m.className || '') + ' ' + ((m.parentElement && m.parentElement.className) || '');
          var sender = cls.match(/user|human|sent|right|guest/i) ? 'user' : 'bot';
          results.push({text:t, sender:sender});
        });
      }
      var deduped = [];
      for (var di = 0; di < results.length; di++) {
        if (di === 0 || results[di].text !== results[di-1].text || results[di].sender !== results[di-1].sender) {
          deduped.push(results[di]);
        }
      }
      results = deduped;
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
  window.captureAllMessages = captureAllMessages;
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
  setInterval(captureAllMessages, 3000);
  true;
})();
`;

export default function WebViewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { url, title, autoDownload, productData, openChat, productId } = useLocalSearchParams<{
    url?: string;
    title?: string;
    autoDownload?: string;
    productData?: string;
    openChat?: string;
    productId?: string;
  }>();
  const safeUrl = typeof url === 'string' ? url : '';
  const safeTitle = typeof title === 'string' ? title : 'Web View';
  const isAutoDownload = autoDownload === 'true';
  const isChatOnly = openChat === 'true';
  const numericProductId = productId ? Number(productId) : null;
  const [pdfStatus, setPdfStatus] = useState(isAutoDownload ? 'loading' : '');
  const [chatReady, setChatReady] = useState(isChatOnly ? true : false);

  // Minimal HTML for chat-only mode — loads instantly instead of full DPP page
  let chatHtml = '';
  if (isChatOnly) {
    let chatProductName = safeTitle.replace(' Assistant', '');
    if (productData) {
      try { const pd = JSON.parse(productData); if (pd.name) chatProductName = pd.name; } catch {}
    }
    const esc = chatProductName.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    chatHtml = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#0A1A14;height:100vh;padding-bottom:180px;}</style></head><body><script type="module">
import Chatbot from 'https://demo.cirtag.eu/products/static/dppembed/dpp_v9.js';
Chatbot.init({chatflowid:'b3156ec9-acda-427b-9124-282f79fb291d',apiHost:'https://demo.cirtag.eu',productName:'${esc}',chatflowConfig:{productName:'${esc}'},theme:{button:{backgroundColor:'rgb(65,60,60)',right:20,bottom:20,size:1,iconColor:'white'},chatWindow:{showTitle:true,title:'${esc} Assistant',welcomeMessage:"Hello, I'm ${esc} Support Assistant. How can I help you today?",backgroundColor:'#ffffff',height:600,width:450,fontSize:13,botMessage:{showAvatar:true,avatarSrc:'${SUPPORT_ICON_B64}'}}}});
<\/script></body></html>`;
  }

  // Build JS to intercept Flowise chatbot API calls and route through our OpenAI chatbot
  const webViewRef = useRef<WebView>(null);
  let chatbotInterceptJS = '';
  if (productData) {
    chatbotInterceptJS = `
(function() {
  var pending = {};
  var counter = 0;

  // RN will call this to deliver the OpenAI response
  window.__chatReply = function(id, text) {
    if (pending[id]) {
      pending[id](text);
      delete pending[id];
    }
  };

  var _fetch = window.fetch;
  window.fetch = function(url, opts) {
    // Intercept Flowise prediction API calls
    if (typeof url === 'string' && url.indexOf('/api/v1/prediction/') !== -1) {
      try {
        if (opts && opts.method && opts.method.toUpperCase() === 'POST' && opts.body) {
          var body = JSON.parse(typeof opts.body === 'string' ? opts.body : '{}');
          if (body.question) {
            var id = ++counter;
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'chatbot_question',
              id: id,
              question: body.question
            }));

            return new Promise(function(resolve) {
              pending[id] = function(text) {
                // Build Flowise-format SSE response
                var chatId = 'local-' + Date.now();
                var msgId = 'msg-' + Date.now();
                var sse = '';

                // Start event
                sse += 'data:' + JSON.stringify({event:'start',data:''}) + '\\n\\n';

                // Send full response as one token
                sse += 'data:' + JSON.stringify({event:'token',data:text}) + '\\n\\n';

                // Metadata event
                sse += 'data:' + JSON.stringify({event:'metadata',data:{chatId:chatId,chatMessageId:msgId,question:body.question,sessionId:chatId,memoryType:'Buffer Window Memory'}}) + '\\n\\n';

                // End event
                sse += 'data:' + JSON.stringify({event:'end',data:'[DONE]'}) + '\\n\\n';

                var encoder = new TextEncoder();
                var stream = new ReadableStream({
                  start: function(c) {
                    c.enqueue(encoder.encode(sse));
                    c.close();
                  }
                });
                resolve(new Response(stream, {
                  status: 200,
                  headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache'
                  }
                }));
              };

              setTimeout(function() {
                if (pending[id]) {
                  pending[id]('Sorry, the request timed out. Please try again.');
                }
              }, 30000);
            });
          }
        }
      } catch(e) {}
    }
    return _fetch.apply(this, arguments);
  };
  true;
})();
`;
  }

  const handleMessage = async (event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'chat_ready') {
        setChatReady(true);
        return;
      }

      // Debug logging
      if (data.type === 'debug') {
        console.log('[WebView DBG]', data.msg);
        return;
      }

      // Save captured chat messages to local DB (for Raise Ticket flow)
      if (data.type === 'all_chat_messages' && Array.isArray(data.messages)) {
        try {
          const pendingId = numericProductId ? -numericProductId : -1;
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
        } catch (e) {
          console.log('[WebView] Error saving chat messages:', e);
        }
        return;
      }

      // Handle chatbot question - route through our OpenAI chatbot
      if (data.type === 'chatbot_question' && data.question && productData) {
        console.log('[WebView] chatbot_question received:', data.question);
        try {
          const pd = JSON.parse(productData);
          const product: Partial<ScannedProduct> = {
            id: 0,
            rawValue: safeUrl,
            displayValue: pd.name || '',
            format: '',
            type: '',
            productName: pd.name || '',
            supplier: pd.supplier || '',
            price: pd.price || '',
            weight: pd.weight || '',
            co2Total: pd.co2Total || '',
            co2Details: pd.co2Details || '',
            certifications: pd.certifications || '',
            productDescription: pd.description || '',
            productId: pd.productId || '',
            skuId: pd.skuId || '',
            datasheetUrl: '',
            imageUrl: '',
            scannedAt: Date.now(),
          };
          const reply = await getChatbotReply(data.question, [product as ScannedProduct]);
          const escaped = JSON.stringify(reply);
          webViewRef.current?.injectJavaScript(
            `if(window.__chatReply) window.__chatReply(${data.id}, ${escaped}); true;`
          );
        } catch (err) {
          const fallback = JSON.stringify('Sorry, something went wrong. Please try again.');
          webViewRef.current?.injectJavaScript(
            `if(window.__chatReply) window.__chatReply(${data.id}, ${fallback}); true;`
          );
        }
        return;
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
      if (isAutoDownload) router.back();
      downloadPdf(request.url);
      return false;
    }
    return true;
  };

  // When isChatOnly: let Flowise use its own backend (no intercept) - correct answers from DPP/PDF
  // When viewing product page normally: intercept Flowise API and route through OpenAI
  const injectedJS = (isAutoDownload
    ? PDF_INTERCEPT_JS + '\n' + AUTO_DOWNLOAD_JS
    : PDF_INTERCEPT_JS)
    + (isChatOnly ? '' : '\n' + chatbotInterceptJS)
    + (isChatOnly ? '\n' + AUTO_OPEN_CHAT_JS + '\n' + CAPTURE_CHAT_JS : '');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (isChatOnly && webViewRef.current) {
            // Capture all chat messages before leaving so Raise Ticket can access them
            webViewRef.current.injectJavaScript('if(window.captureAllMessages) window.captureAllMessages(); true;');
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

      {(safeUrl || isChatOnly) ? (
        <WebView
          ref={webViewRef}
          source={isChatOnly ? { html: chatHtml, baseUrl: 'https://demo.cirtag.eu' } : { uri: safeUrl }}
          style={isAutoDownload ? styles.hiddenWeb : styles.web}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
          startInLoadingState={!isAutoDownload && !isChatOnly}
          allowFileAccess
          injectedJavaScriptBeforeContentLoaded={isChatOnly ? CLEAR_SESSION_JS : chatbotInterceptJS}
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
  chatOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A1A14',
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
});
