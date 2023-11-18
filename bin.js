var bin = {};
bin.TXT_CHR_LF = '|';
bin.TXT_CHR_CR = '_';

bin.CHR_CRLF = '&#x21b5;';
bin.CHR_LF = '&#x2193;';
bin.CHR_CR = '&#x2190;';
bin.CHR_CRLF_S = '<span style="color:#0cf" class="cc">' + bin.CHR_CRLF + '</span>';
bin.CHR_LF_S = '<span style="color:#0f0" class="cc">' + bin.CHR_LF + '</span>';
bin.CHR_CR_S = '<span style="color:#f00" class="cc">' + bin.CHR_CR + '</span>';
bin.EOF = '<span style="color:#08f" class="cc">[EOF]</span>';
bin.DEFAULT_FONT_SIZE = 14;
bin.DEFAULT_MODE = 'auto';
bin.DEFAULT_MODE_ACTIVE = 'hex';

bin.ENCODING_NAME = {
  'ascii': 'ASCII',
  'utf8': 'UTF-8',
  'utf8_bom': 'UTF-8 BOM',
  'utf16': 'UTF-16 (?)',
  'utf16le': 'UTF-16LE',
  'utf16be': 'UTF-16BE',
  'utf16be_bom': 'UTF-16BE BOM',
  'utf16le_bom': 'UTF-16LE BOM',
  'iso2022jp': 'ISO-2022-JP',
  'sjis': 'Shift_JIS',
  'euc_jp': 'EUC-JP'
};

bin.FILETYPES = {
  bmp: {head: '42 4D', mime: 'image/bmp', ext: 'bmp'},
  cab: {head: '4D 53 43 46 00 00 00 00', mime: 'application/vnd.ms-cab-compressed', ext: 'cab'},
  class: {head: 'CA FE BA BE', mime: 'application/octet-stream', ext: 'class'},
  exe: {head: '4D 5A', mime: 'application/x-msdownload', ext: 'exe'},
  gif: {head: '47 49 46 38', mime: 'image/gif', ext: 'gif'},
  gz: {head: '1F 8B', mime: 'application/gzip', ext: 'gz'},
  html: {head: '3C 21 44 4F 43 54 59 50 45 20 68 74 6D 6C', mime: 'text/html', ext: 'html'},
  jpg: {head: 'FF D8', mime: 'image/jpeg', ext: 'jpg'},
  mov: {head: 'xx xx xx xx 6D 6F 6F 76', mime: 'video/quicktime', ext: 'mov'},
  mp3: {head: ['FF FA', 'FF FB', '49 44 33'], mime: 'audio/mpeg', ext: 'mp3'},
  mp4: {head: 'xx xx xx xx 66 74 79 70', mime: 'video/mp4', ext: 'mp4'},
  msg: {head: 'D0 CF 11 E0 A1 B1 1A E1', mime: 'application/octet-stream', ext: 'msg'},
  pdf: {head: '25 50 44 46 2D', mime: 'application/pdf', ext: 'pdf'},
  png: {head: '89 50 4E 47 0D 0A 1A 0A 00', mime: 'image/png', ext: 'png'},
  txt_utf8_bom: {head: 'EF BB BF', mime: 'text/plain', ext: 'txt', encoding: 'utf8_bom'},
  txt_utf16be_bom: {head: 'FE FF', mime: 'text/plain', ext: 'txt', encoding: 'utf16be_bom'},
  txt_utf16le_bom: {head: 'FF FE', mime: 'text/plain', ext: 'txt', encoding: 'utf16le_bom'},
  wav: {head: '52 49 46 46 xx xx xx xx 57 41 56 45 66 6D 74', mime: 'audio/wav', ext: 'wav'},
  webp: {head: '52 49 46 46 xx xx xx xx 57 45 42 50', mime: 'image/webp', ext: 'webp'},
  xml: {head: '3C 3F 78 6D 6C 20', mime: 'text/xml', ext: 'xml'},
  zip: {head: '50 4B', mime: 'application/x-zip-compressed', ext: 'zip'},
  xlsx: {hexptn: '77 6F 72 6B 62 6F 6F 6B 2E 78 6D 6C', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: 'xlsx', supertype: 'zip'},
  docx: {hexptn: '77 6F 72 64 2F 64 6F 63 75 6D 65 6E 74 2E 78 6D 6C', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: 'docx', supertype: 'zip'},
  pptx: {hexptn: '70 70 74 2F 70 72 65 73 65 6E 74 61 74 69 6F 6E 2E 78 6D 6C', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', ext: 'pptx', supertype: 'zip'},
  war: {hexptn: '57 45 42 2D 49 4E 46 2F', mime: 'application/x-zip', ext: 'war', supertype: 'zip'},
  jar: {hexptn: '4D 45 54 41 2D 49 4E 46 2F', mime: 'application/java-archive', ext: 'jar', supertype: 'zip'}
};

bin.auto = true;
bin.buf = null;

$onReady = function() {
  util.clock('#clock');

  var opt = {
    mode: 'blob'
  };
  bin.dndHandler = util.addDndHandler('#src', bin.onDnd, opt);

  var mode = util.getQuery('mode');
  if (!mode) mode = bin.DEFAULT_MODE;
  bin.setMode(mode);
  if (mode == 'auto') {
    bin.activeMode(bin.DEFAULT_MODE_ACTIVE);
  }

  var fontSize = util.getQuery('fontsize') | 0;
  if (!fontSize) fontSize = bin.DEFAULT_FONT_SIZE;
  bin.setFontSize(fontSize);

  $el('#src').addEventListener('input', bin.onInput);
  $el('#src').addEventListener('change', bin.onInput);
  $el('#src').focus();
};

bin.getMode = function() {
  return $el('#mode').value;
};

bin.isB64Mode = function() {
  var mode = bin.getMode();
  if ((mode == 'b64') || (mode == 'b64s') || (mode == 'bsb64')) {
    return true;
  }
  return false;
};

bin.switchRadix = function(mode, buf) {
  var r;
  switch (mode) {
    case 'hex':
    case 'bin':
      r = bin.getHexDump(mode, buf);
      break;
    case 'bsb64':
      var n = $el('#n').value | 0;
      var b64 = util.BSB64.encode(buf, n);
      r = bin.formatB64(b64);
      break;
    case 'b64s':
      var key = $el('#key').value;
      b64 = util.encodeBase64s(buf, key);
      r = bin.formatB64(b64);
      break;
    default:
      b64 = util.encodeBase64(buf, true);
      r = bin.formatB64(b64);
  }
  bin.drawBinInfo(buf);
  bin.setSrcValue(r);
  bin.showPreview();
};

bin.setMode = function(mode, onlyMode) {
  if (mode != 'auto') {
    bin.setDndHandlerMode(mode);
    $el('#mode').value = mode;
    $el('.mode-ind').removeClass('mode-ind-active');
    $el('#mode-ind-' + mode).addClass('mode-ind-active');
    if (bin.buf) {
      bin.switchRadix(mode, bin.buf);
    }
  }

  if (onlyMode) return;
  $el('.mode-button').removeClass('mode-active');
  $el('#mode-button-' + mode).addClass('mode-active');
  bin.auto = (mode == 'auto');
  if (mode == 'auto') {
    bin.onAutoMode();
  }
};

bin.onAutoMode = function() {
  bin.detectCurrentMode();
};

bin.activeMode = function(mode) {
  bin.setMode(mode, true);
};

bin.setDndHandlerMode = function(mode) {
  if (mode == 'b64') {
    bin.dndHandler.setMode('data');
  } else {
    bin.dndHandler.setMode('blob');
  }
};

bin.dump = function(s) {
  var mode = bin.getMode();
  var r;
  switch (mode) {
    case 'hex':
    case 'bin':
      var buf = new Uint8Array(s);
      r = bin.getHexDump(mode, buf);
      break;
    case 'bsb64':
      var n = $el('#n').value | 0;
      var buf = new Uint8Array(s);
      var b64 = util.BSB64.encode(buf, n);
      r = bin.formatB64(b64);
      break;
    case 'b64s':
      var key = $el('#key').value;
      buf = new Uint8Array(s);
      b64 = util.encodeBase64s(buf, key);
      r = bin.formatB64(b64);
      break;
    default:
      buf = bin.decodeBase64(s);
      r = bin.formatB64(s);
  }
  bin.drawBinInfo(buf);
  bin.setSrcValue(r);
  bin.showPreview();
  bin.buf = buf;
};

bin.decodeBase64 = function(s) {
  s = s.trim().replace(/\n/g, '');
  if (s.startsWith('data:')) {
    var a = s.split(',');
    s = a[1];
  }
  return util.decodeBase64(s, true);
};

bin.getMimeType = function(buf) {
  var mode = bin.getMode();
  var tp = bin.getFileType(buf);
  return tp['mime'];
};

bin.drawBinInfo = function(buf) {
  var s = '';
  s += 'Type    : ' + bin.getBinTypeInfo(buf) + '\n';
  s += 'Size    : ' + bin.buildSizeInfoString(buf) + ' bytes\n';
  s += bin.getHashInfo(buf);
  bin.drawInfo(s);
};

bin.buildSizeInfoString = function(buf) {
  var n = buf.length;
  var s = util.formatNumber(n);
  return s;
};

bin.getBinTypeInfo = function(b) {
  var tp = bin.getFileType(b);
  if (tp['mime'] == 'application/x-zip-compressed') {
    var w = bin.getZipContentType(b);
    if (w) tp = w;
  }
  var s = '.' + tp['ext'] + '  ' + tp['mime'];
  if (tp['encoding']) s += '  ' + bin.getEncodingName(tp['encoding']);
  if (tp['bin_detail']) s += '  ' + tp['bin_detail'];
  return s;
}

bin.getEncodingName = function(id) {
  var name = '';
  if (id in bin.ENCODING_NAME) {
    name = bin.ENCODING_NAME[id];
  };
  return name;
};

bin.getHashInfo = function(b) {
  var s = 'SHA-1   : ' + bin.getSHA('SHA-1', b, 1) + '\n';
  s += 'SHA-256 : ' + bin.getSHA('SHA-256', b, 1);
  return s;
};

bin.getSHA = function(a, b, f) {
  var s = new window.jsSHA(a, (f ? 'UINT8ARRAY' : 'TEXT'));
  s.update(b);
  return s.getHash('HEX');
};

bin.showBinInfo = function() {
  try {
    bin._showBinInfo();
  } catch(e) {
    bin.drawInfo('ERROR: ' + e);
  }
  bin.showPreview();
};
bin._showBinInfo = function() {
  var mode = bin.getMode();
  var s = bin.getSrcValue();
  var a = bin.str2buf(mode, s);
  bin.drawBinInfo(a);
};

bin.hex2uint8Array = function(s) {
  return bin.str2binArr(s, 2, '0x');
};

bin.bin2uint8Array = function(s) {
  return bin.str2binArr(s, 8, '0b');
};

bin.b642uint8Array = function(s) {
  try {
    var a = bin.decodeBase64(s);
  } catch(e) {
    a = [];
  }
  return a;
};

bin.str2binArr = function(str, blkSize, pFix) {
  var a = [];
  for (var i = 0; i < str.length; i += blkSize) {
    var v = str.substr(i, blkSize);
    if (v.length == blkSize) {
      a.push(bin.parseInt(pFix + v));
    }
  }
  return a;
};

bin.parseInt = function(v) {
  var rdx = bin.checkRadix(v);
  if (rdx == 0) {
    return 0;
  } else if (rdx == 2) {
    v = v.substr(2);
  }
  return parseInt(v, rdx);
};

bin.checkRadix = function(v) {
  if (v.match(/^-{0,1}0x[0-9A-Fa-f\s]+$/i)) {
    return 16;
  } else if (v.match(/^-{0,1}0[0-7\s]+$/i)) {
    return 8;
  } else if (v.match(/^-{0,1}0b[01\s]+$/i)) {
    return 2;
  } else if (v.match(/^-{0,1}[0-9,]+$/)) {
    return 10;
  }
  return 0;
};

bin.getHexDump = function(mode, buf) {
  var showSp = 1;
  var showAddr = 1;
  var showAscii = 1;
  var dmp = '';

  var lm = 0;
  var bLen = buf.length;
  if (lm == 0) lm = bLen;
  var len = ((bLen > lm) ? lm : bLen);
  if (len % 0x10 != 0) {
    len = (((len / 0x10) + 1) | 0) * 0x10;
  }

  var hd = '';
  if (showAddr) {
    hd += 'ADDRESS    ';
  }
  if (mode == 'bin') {
    if (showSp) {
      hd += '+0       +1       +2       +3       +4       +5       +6       +7        +8       +9       +A       +B       +C       +D       +E       +F      ';
    } else {
      hd += '+0      +1      +2      +3      +4      +5      +6      +7      +8      +9      +A      +B      +C      +D      +E      +F      ';
    }
  } else {
    if (showSp) {
      hd += '+0 +1 +2 +3 +4 +5 +6 +7  +8 +9 +A +B +C +D +E +F';
    } else {
      hd += '+0+1+2+3+4+5+6+7+8+9+A+B+C+D+E+F';
    }
  }
  if (showAscii) {
    hd += '  ASCII           ';
  }
  hd += '\n';
  hd += util.repeatCh('-', hd.length - 1) + '\n';

  var dmp = '';
  if (showAddr || showAscii) {
    dmp += hd;
  }
  if (showAddr) {
    dmp += bin.dumpAddr(0);
  }

  for (var i = 0; i < len; i++) {
    dmp += bin.getDump(mode, i, buf, len, showSp, showAddr, showAscii);
  }
  if (bLen > lm) {
    if (bLen - lm > (0x10 * lastRows)) {
      dmp += '\n<span style="color:#ccc">...</span>';
    }
    if (lastRows > 0) {
      var rem = (bLen % 0x10);
      var st = (rem == 0 ? (bLen - lastLen) : ((bLen - rem) - (0x10 * (lastRows - 1))));
      if (st < len) {
        rem = ((len - st) % 0x10);
        st = len + rem;
      }
      var ed = bLen + (rem == 0 ? 0 : (0x10 - rem));
      dmp += '\n';
      if (showAddr) {
        dmp += bin.dumpAddr(st);
      }
      for (i = st; i < ed; i++) {
        dmp += bin.getDump(mode, i, buf, ed, showSp, showAddr, showAscii);
      }
    }
  }
  dmp += '\n';

  return dmp;
};

bin.getDump = function(mode, i, buf, len, showSp, showAddr, showAscii) {
  var b;
  if (mode == 'bin') {
    b = bin.dumpBin(i, buf);
  } else {
    b = bin.dumpHex(i, buf);
  }
  if ((i + 1) % 0x10 == 0) {
    if (showAscii) {
      b += '  ' + bin.dumpAscii(((i + 1) - 0x10), buf);
    }
    if ((i + 1) < len) {
      b += '\n';
      if (showAddr) b += bin.dumpAddr(i + 1);
    }
  } else if (showSp) {
    b += (((i + 1) % 8 == 0) ? '  ' : ' ');
  }
  return b;
},

bin.dumpAddr = function(i) {
  return ('0000000' + i.toString(16)).slice(-8).toUpperCase() + ' : ';
};
bin.dumpBin = function(i, buf) {
  return ((buf[i] == undefined) ? '        ' : bin.toBin(buf[i]));
};
bin.dumpDec = function(i, buf) {
  return ((buf[i] == undefined) ? '   ' : ('  ' + buf[i].toString()).slice(-3));
};
bin.dumpHex = function(i, buf) {
  return ((buf[i] == undefined) ? '  ' : ('0' + buf[i].toString(16)).slice(-2).toUpperCase());
};

bin.i2hex = function(i) {
  return ((i == undefined) ? '' : ('0' + i.toString(16)).slice(-2).toUpperCase());
};

bin.dumpAscii = function(pos, buf) {
  var dumpMB = $el('#dump-multibyte').checked;
  var b = '';
  var end = pos + 0x10;
  for (var i = pos; i < end; i++) {
    var code = buf[i];
    if (code == undefined) break;

    if (dumpMB) {
      var uri = null;
      var pd = '';
      var skip = 0;
      if ((code & 0xF0) == 0xF0) {
        var c0 = bin.i2hex(buf[i]);
        var c1 = bin.i2hex(buf[i + 1]);
        var c2 = bin.i2hex(buf[i + 2]);
        var c3 = bin.i2hex(buf[i + 3]);
        if ((c1 != '') && (c2 != '') && (c3 != '')) {
          uri = '%' + c0 + '%' + c1 + '%' + c2 + '%' + c3;
        }
        skip = 3;
        pd = '  ';
      } else if ((code & 0xE0) == 0xE0) {
        var c0 = bin.i2hex(buf[i]);
        var c1 = bin.i2hex(buf[i + 1]);
        var c2 = bin.i2hex(buf[i + 2]);
        if ((c1 != '') && (c2 != '')) {
          uri = '%' + c0 + '%' + c1 + '%' + c2;
        }
        skip = 2;
        pd = ' ';
      } else if ((code & 0xC0) == 0xC0) {
        var c0 = bin.i2hex(buf[i]);
        var c1 = bin.i2hex(buf[i + 1]);
        if ((c1 != '') && (c2 != '')) {
          uri = '%' + c0 + '%' + c1;
        }
        skip = 1;
      }

      try {
        if (uri) {
          var c = decodeURI(uri);
          b += c + pd;
          i += skip;
          continue;
        }
      } catch(e) {}
    }

    switch (code) {
      case 0x0A:
        b += bin.TXT_CHR_LF;
        break;
      case 0x0D:
        b += bin.TXT_CHR_CR;
        break;
      default:
        if ((code >= 0x20) && (code <= 0x7E)) {
          b += String.fromCharCode(code);
        } else {
          b += '.';
        }
    }
  }
  return b;
};

bin.getEncoding = function(buf) {
  var type = 'ascii';

  if (bin.isUtf16Le(buf)) {
    return 'utf16le';
  } else if (bin.isUtf16Be(buf)) {
    return 'utf16be';
  }

  var b = '';
  for (var i = 0; i < buf.length; i++) {
    var code = buf[i];
    var uri = null;
    var skip = 0;
    if ((code & 0xF0) == 0xF0) {
      var c0 = bin.i2hex(buf[i]);
      var c1 = bin.i2hex(buf[i + 1]);
      var c2 = bin.i2hex(buf[i + 2]);
      var c3 = bin.i2hex(buf[i + 3]);
      if ((c1 != '') && (c2 != '') && (c3 != '')) {
        uri = '%' + c0 + '%' + c1 + '%' + c2 + '%' + c3;
      }
      skip = 3;
    } else if ((code & 0xE0) == 0xE0) {
      var c0 = bin.i2hex(buf[i]);
      var c1 = bin.i2hex(buf[i + 1]);
      var c2 = bin.i2hex(buf[i + 2]);
      if ((c1 != '') && (c2 != '')) {
        uri = '%' + c0 + '%' + c1 + '%' + c2;
      }
      skip = 2;
    } else if ((code & 0xC0) == 0xC0) {
      var c0 = bin.i2hex(buf[i]);
      var c1 = bin.i2hex(buf[i + 1]);
      if ((c1 != '') && (c2 != '')) {
        uri = '%' + c0 + '%' + c1;
      }
      skip = 1;
    } else if (code > 0x7F) {
      type = 'utf16';
    } else if (code == 0x00) {
      type = 'utf16';
    }

    try {
      if (uri) {
        var c = decodeURI(uri);
        i += skip;
        type = 'utf8';
        break;
      }
    } catch(e) {}

    if (bin.isSjis(buf, i, true)) {
      type = 'sjis';
      break;
    }

    if (bin.isIso2022jp(buf, i)) {
      type = 'iso2022jp';
      break;
    }

    if (bin.isEuc(buf, i, true)) {
      type = 'euc_jp';
      break;
    }
  }
  return type;
};

bin.getFileType = function(b) {
  var filetypes = bin.FILETYPES;
  var ftype = {
    mime: 'text/plain',
    ext: 'txt',
    encoding: null,
    info: null
  };

  for (var k in filetypes) {
    var tp = filetypes[k]
    if (!tp['head']) continue;
    if (bin._hasBinaryPattern(b, 0, tp['head'])) {
      ftype = tp;
      break;
    }
  }

  if ((ftype['ext'] == 'txt') && (!ftype['encoding'])) {
    ftype['encoding'] = bin.getEncoding(b);
  } else {
    var binDetail = bin.getBinDetail(ftype['ext'], b);
    if (binDetail) ftype['bin_detail'] = binDetail;
  }

  return ftype;
};

bin.hasBinaryPattern = function(buf, binPattern) {
  var ptn = binPattern.split(' ');
  if (buf.length < ptn.length) return false;
  for (var i = 0; i < buf.length; i++) {
    if (bin._hasBinaryPattern(buf, i, binPattern)) return true;
  }
  return false;
};

bin._hasBinaryPattern = function(buf, pos, binPattern) {
  if (binPattern instanceof Array) {
    for (var i = 0; i < binPattern.length; i++) {
      if (bin.__hasBinaryPattern(buf, pos, binPattern[i])) return true;
    }
  } else {
    return bin.__hasBinaryPattern(buf, pos, binPattern);
  }
  return false;
};

bin.__hasBinaryPattern = function(buf, pos, binPattern) {
  var ptn = binPattern.split(' ');
  if (buf.length < ptn.length) return false;
  for (var i = 0; i < ptn.length; i++) {
    var hex = ptn[i];
    if (hex == 'xx') continue;
    var v = +('0x' + hex);
    if (v != buf[i + pos]) return false;
  }
  return true;
};

bin.isAscii = function(b) {
  return ((b >= 0) && (b <= 0x7F));
};

bin.isUtf16Le = function(buf) {
  if (buf.length < 2) return false;
  if ((buf[0] != 0x00) && (buf[1] == 0x00)) return true;
  return false;
};

bin.isUtf16Be = function(buf) {
  if (buf.length < 2) return false;
  if ((buf[0] == 0x00) && (buf[1] != 0x00)) return true;
  return false;
};

bin.isSjis = function(buf, pos, exclAscii) {
  var b1 = buf[pos];
  var b2 = buf[pos + 1];
  if ((b1 == undefined) || (b2 == undefined)) return false;
  if (exclAscii) {
    if (bin.isAscii(b1) && bin.isAscii(b2)) return false;
  }
  return (bin.isSjis1x(b1) && bin.isSjis2(b2));
};
bin.isSjis1x = function(b) {
  return (((b >= 0x81) && (b <= 0x9F)) || ((b >= 0xE0) && (b <= 0xFC)));
};
bin.isSjis2 = function(b) {
  return (((b >= 0x40) && (b <= 0xFC)) && (b != 0x7F));
};

bin.isIso2022jp = function(buf, pos) {
  var ESCSEQ_ASCII = '1B 28 42';
  var ESCSEQ_LATIN = '1B 28 4A';
  var ESCSEQ_JA = '1B 24 42';
  if (bin._hasBinaryPattern(buf, pos, ESCSEQ_ASCII)) return true;
  if (bin._hasBinaryPattern(buf, pos, ESCSEQ_LATIN)) return true;
  if (bin._hasBinaryPattern(buf, pos, ESCSEQ_JA)) return true;
  return false;
};

bin.isEuc = function(buf, pos, exclAscii) {
  var b1 = buf[pos];
  var b2 = buf[pos + 1];
  if ((b1 == undefined) || (b2 == undefined)) return false;
  if (exclAscii) {
    if (bin.isAscii(b1) && bin.isAscii(b2)) return false;
  }
  return (bin.isEucByte(b1) && bin.isEucByte(b2));
};
bin.isEucByte = function(b) {
  if ((b >= 0x80) && (b <= 0xA0)) return false;
  if ((b & 0x80) == 0x80) return true;
};

bin.getZipContentType = function(buf) {
  for (var k in bin.FILETYPES) {
    var ftype = bin.FILETYPES[k];
    var hexptn = ftype['hexptn'];
    if (ftype['supertype'] == 'zip') {
      if (bin.hasBinaryPattern(buf, hexptn)) return ftype;
    }
  }
  return null;
};

bin.toBin = function(v) {
  return ('0000000' + v.toString(2)).slice(-8);
};

bin.formatB64 = function(s) {
  var isDataUrl = (s.match(/,/) ? true : false);
  if (isDataUrl) {
    var a = s.split(',');
    s = a[1];
  }
  var b64 = bin.inertNewline(s);
  var r = (isDataUrl ? (a[0] + ',\n') : '') + b64;
  return r;
};

bin.inertNewline = function(s, n) {
  if (n == undefined) n = 76;
  var r = util.insertCh(s, '\n', n);
  return r;
};

bin.copyObjField = function(src, dest, key) {
  if (key in src) dest[key] = src[key];
  return dest;
};

bin.getBinDetail = function(type, b) {
  var r = '';
  if (type == 'exe') {
    var a = bin.getExeArch(b);
    if (a) r = 'Arch: ' + a;
  } else if (type == 'class') {
    var j = bin.getJavaClassVersion(b);
    if (j) r = j;
  }
  return r;
};

bin.getExeArch = function(b) {
  var pe = -1;
  var len = 512;
  for (var i = 0; i < len; i++) {
    if (i + 3 >= len) break;
    var ptn = bin.scanBin(b, i, 4);
    if (ptn == 0x50450000) {
      pe = i;break;
    }
  }
  var v = 0;
  if ((pe >= 0) && (pe + 5 < len)) {
    v = bin.scanBin(b, pe + 4, 2);
  }
  var arch = '';
  if (v == 0x6486) {
    arch = 'x86-64 (64bit)';
  } else if (v == 0x4C01) {
    arch = 'x86 (32bit)';
  }
  return arch;
};

bin.getJavaClassVersion = function(b) {
  var v = b[7];
  var j;
  if (v <= 48) {
    j = '1.' + v - 44;
  } else {
    j = v - 44;
  }
  var s = 'Java version: Java SE ' + j + ' = ' + v + ' (' + bin.toHex(v, true, '0x', 2) + ')';
  return s;
};

bin.scanBin = function(b, p, ln) {
  var upto = 6;
  if ((p + (ln - 1) >= b.length) || (ln > upto)) return -1;
  var r = 0;
  for (var i = 0; i < ln; i++) {
    var d = b[p + i] * Math.pow(256, ln - (i + 1));
    r += d;
  }
  return r;
};

bin.toHex = function(v, uc, pFix, d) {
  var hex = parseInt(v).toString(16);
  return bin.formatHex(hex, uc, pFix, d);
};

bin.formatHex = function(hex, uc, pFix, d) {
  if (uc) hex = hex.toUpperCase();
  if ((d) && (hex.length < d)) {
    hex = (util.repeatCh('0', d) + hex).slice(d * (-1));
  }
  if (pFix) hex = pFix + hex;
  return hex;
};

bin.extractBinTextPart = function(mode, s) {
  var unit = (mode == 'bin' ? 8 : 2);
  var vStart = 11;
  var eEnd = unit * 16 + 16;
  s = s.trim();
  if (!s.toUpperCase().startsWith('ADDRESS')) return s;
  var a = util.text2list(s);
  var b = '';
  for (var i = 2; i < a.length; i++) {
    var l = a[i];
    var w = l.substr(vStart, eEnd);
    b += w + '\n';
  }
  return b;
};

bin.onInput = function() {
  bin.buf = null;
  bin.forceNewline();
  if (!bin.auto) return;
  bin.showBinInfo();
  bin.detectCurrentMode();
};

bin.forceNewline = function(s) {
  var TH = 10240;
  var s = bin.getSrcValue();
  if (s.length <= TH) return;
  var a = util.text2list(s);
  var r = '';
  for (var i = 0; i < a.length; i++) {
    var v = a[i];
    if (i > 0) r += '\n';
    if (v.length > TH) {
      var w = util.insertCh(v, '\n', TH);
      r += w;
    } else {
      r += v;
    }
  }
  bin.setSrcValue(r);
};

bin.onDnd = function(s, f) {
  if ((s instanceof ArrayBuffer) || (f && bin.isB64Mode())) {
    bin.dump(s);
  } else {
    bin.setSrcValue(s);
  }
  bin.forceNewline();
};

bin.getSrcValue = function() {
  return $el('#src').value;
};

bin.setSrcValue = function(s) {
  $el('#src').value = s;
  $el('#src').scrollToTop();
};

bin.detectCurrentMode = function() {
  var m = 'b64';
  var v = bin.getSrcValue();
  if (v.match(/^[01\s\n]+$/)) {
    m = 'bin';
  } else if (v.match(/^[0-9A-Fa-f\s\n]+$/)) {
    m = 'hex';
  }
  bin.activeMode(m);
};

bin.drawInfo = function(s) {
  $el('#info').innerHTML = s;
};

bin.str2buf = function(mode, s) {
  if ((mode == 'bin') || (mode == 'hex')) {
    s = bin.extractBinTextPart(mode, s);
  }
  s = s.replace(/\s/g, '');
  var a;
  switch (mode) {
    case 'hex':
      a = bin.hex2uint8Array(s);
      break;
    case 'bin':
      a = bin.bin2uint8Array(s);
      break;
    default:
      a = bin.b642uint8Array(s);
  }
  return a;
};

bin.showPreview = function() {
  var mode = bin.getMode();
  var s = bin.getSrcValue();
  var b = bin.str2buf(mode, s);
  try {
    bin._showPreview(s, b);
  } catch (e) {
    var m = 'ERROR: ' + e;
    bin.drawPreview(m);
  }
}

bin._showPreview = function(s, b) {
  var mime = bin.getMimeType(b);
  var dc = mime.split('/')[0];
  if (dc == 'image') {
    bin.showImagePreview(b);
  } else if (dc == 'video') {
    bin.showVideoPreview(b);
  } else if (dc == 'audio') {
    bin.showAudioPreview(b);
  } else {
    bin.showTextPreview(b);
  }
};

bin.showTextPreview = function(b) {
  b64 = util.encodeBase64(b, true);
  var s = util.decodeBase64(b64);
  s = util.escHtml(s);
  s = s.replace(/\r\n/g, bin.CHR_CRLF_S + '\n');
  s = s.replace(/([^>])\n/g, '$1' + bin.CHR_LF_S + '\n');
  s = s.replace(/\r/g, bin.CHR_CR_S + '\n');
  s = s + bin.EOF + '\n';
  bin.drawPreview(s);
};

bin.showImagePreview = function(b) {
  var b64 = util.encodeBase64(b, true);
  var d = 'data:image/png;base64,' + b64;
  var v = '<img src="' + d + '" style="max-width:100%;max-height:100%;">';
  bin.drawPreview(v);
};

bin.showVideoPreview = function(b) {
  var b64 = util.encodeBase64(b, true);
  var d = 'data:video/mp4;base64,' + b64;
  var v = '<video src="' + d + '" style="max-width:100%;max-height:100%;" controls>';
  bin.drawPreview(v);
};

bin.showAudioPreview = function(b) {
  var b64 = util.encodeBase64(b, true);
  var d = 'data:audio/wav;base64,' + b64;
  var v = '<audio src="' + d + '" style="max-width:100%;max-height:100%;" controls>';
  bin.drawPreview(v);
};

bin.drawPreview = function(s) {
  $el('#preview').innerHTML = s;
};

bin.confirmClear = function() {
  util.confirm('Clear?', bin.clear);
};

bin.clear = function() {
  bin.drawInfo('');
  bin.setSrcValue('');
  bin.drawPreview('');
  $el('#src').focus();
};

bin.submit = function() {
  $el('#key-h').value = $el('#key').value;
  $el('#n-h').value = $el('#n').value;
  document.f1.submit();
};

bin.str2arr = function(s) {
  return s.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\s\S]/g) || [];
};

bin.onFontRangeChanged = function(el) {
  var v = el.value;
  bin.setFontSize(v);
};
bin.setFontSize = function(v) {
  var fontSize = v + 'px';
  $el('#font-range').value = v;
  $el('#src').style.fontSize = fontSize;
  $el('#fontsize').innerHTML = fontSize;
};
bin.resetFontSize = function() {
  bin.setFontSize(bin.DEFAULT_FONT_SIZE);
};

bin.fontFamily = '';
bin.onFontChanged = function(el) {
  var v = el.value;
  bin.fontFamily = v;
  bin._setFont(v);
};
bin._setFont = function(v) {
  $el('#src').style.fontFamily = v;
};
bin.setFont = function(n) {
  $el('#font').value = n;
  bin._setFont(n);
};
bin.changeFont = function(n) {
  bin.setFont(n);
  bin.fontFamily = n;
};

bin.UTF8 = {};
bin.UTF8.toByteArray = function(s) {
  var a = [];
  if (!s) return a;
  var chs = bin.str2arr(s);
  for (var i = 0; i < chs.length; i++) {
    var ch = chs[i];
    var c = ch.charCodeAt(0);
    if (c <= 0x7F) {
      a.push(c);
    } else {
      var e = encodeURIComponent(ch);
      var w = e.split('%');
      for (var j = 1; j < w.length; j++) {
        a.push(('0x' + w[j]) | 0);
      }
    }
  }
  return a;
};
bin.UTF8.fromByteArray = function(b) {
  if (!b) return null;
  var e = '';
  for (var i = 0; i < b.length; i++) {
    e += '%' + bin.toHex(b[i], true, '', 2);
  }
  return decodeURIComponent(e);
};
