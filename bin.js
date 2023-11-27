/*!
 * Binary Decoder
 * Copyright 2023 Takashi Harano
 * Released under the MIT license
 * https://github.com/takashiharano/binarydecoder
 */
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

bin.UI_ST_NONE = 0;
bin.UI_ST_AREA_RESIZING = 1;

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
  accdb: {head: '00 01 00 00 53 74 61 6E 64 61 72 64 20 41 43 45 20 44 42', mime: 'application/msaccess', ext: 'accdb'},
  bmp: {head: '42 4D', mime: 'image/bmp', ext: 'bmp'},
  cab: {head: '4D 53 43 46 00 00 00 00', mime: 'application/vnd.ms-cab-compressed', ext: 'cab'},
  class: {head: 'CA FE BA BE', mime: 'application/octet-stream', ext: 'class'},
  eps: {head: 'C5 D0 D3 C6', mime: 'application/postscript', ext: 'eps'},
  exe: {head: '4D 5A', mime: 'application/x-msdownload', ext: 'exe'},
  gif: {head: '47 49 46 38', mime: 'image/gif', ext: 'gif'},
  gz: {head: '1F 8B', mime: 'application/gzip', ext: 'gz'},
  html: {head: '3C 21 44 4F 43 54 59 50 45 20 68 74 6D 6C', mime: 'text/html', ext: 'html'},
  jpg: {head: 'FF D8', mime: 'image/jpeg', ext: 'jpg'},
  lzh: {head: 'xx xx 2D 6C 68 xx 2D', mime: 'application/octet-stream', ext: 'lzh'},
  mid: {head: '4D 54 68 64', mime: 'audio/midi', ext: 'mid'},
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
  zip: {head: '50 4B 03 04', mime: 'application/x-zip-compressed', ext: 'zip'},
  xlsx: {hexptn: '77 6F 72 6B 62 6F 6F 6B 2E 78 6D 6C', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: 'xlsx', supertype: 'zip'},
  docx: {hexptn: '77 6F 72 64 2F 64 6F 63 75 6D 65 6E 74 2E 78 6D 6C', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: 'docx', supertype: 'zip'},
  pptx: {hexptn: '70 70 74 2F 70 72 65 73 65 6E 74 61 74 69 6F 6E 2E 78 6D 6C', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', ext: 'pptx', supertype: 'zip'},
  war: {hexptn: '57 45 42 2D 49 4E 46 2F', mime: 'application/x-zip', ext: 'war', supertype: 'zip'},
  jar: {hexptn: '4D 45 54 41 2D 49 4E 46 2F', mime: 'application/java-archive', ext: 'jar', supertype: 'zip'}
};

bin.CODE_BLOCKS = [
  {
    name: 'bmp',
    fullname: 'Basic Multilingual Plane',
    label: 'U+0000-U+FFFF   ',
    cp_s: 0x0000,
    cp_e: 0xFFFF,
    plane: true,
    skip_check: true
  },
  {
    name: 'ascii',
    fullname: 'ASCII',
    label: 'A',
    cp_s: 0x0000,
    cp_e: 0x007F,
    skip_check: true
  },
  {
    name: 'latin1_suppl',
    fullname: 'Latin-1 Supplement',
    label: 'Ü',
    cp_s: 0x0080,
    cp_e: 0x00FF,
    utf16_s: 0x0080,
    utf16_e: 0x00FF
  },
  {
    name: 'nbsp',
    fullname: 'Non-breaking space',
    label: 'NBSP',
    cp_s: 0x00A0,
    utf16_s: 0x00A0,
    utf8_s: 0xC2A0,
    caution: true
  },
  {
    name: 'thai',
    fullname: 'Thai',
    label: 'ไทย',
    utf16_s: 0x0E00,
    utf16_e: 0x0E7F,
    cp_s: 0x0E00,
    cp_e: 0x0E7F,
    utf8_s: 0xE0B880,
    utf8_e: 0xE0B9BF
  },
  {
    name: 'symbols',
    fullname: 'Symbols',
    label: '☆',
    cp_s: 0x2000,
    cp_e: 0x2BFF,
    utf16_s: 0x2000,
    utf16_e: 0x2BFF,
    utf8_s: 0xE28080,
    utf8_e: 0xE2AFBF
  },
  {
    name: 'zwsp',
    fullname: 'Zero-width space',
    label: 'ZWSP',
    cp_s: 0x200B,
    utf16_s: 0x200B,
    utf8_s: 0xE2808B,
    caution: true
  },
  {
    name: 'rlm',
    fullname: 'Right-to-left mark',
    label: 'RLM',
    cp_s: 0x200F,
    utf16_s: 0x200F,
    utf8_s: 0xE2808F,
    caution: true
  },
  {
    name: 'hiragana',
    fullname: 'Hiragana',
    label: 'あ',
    cp_s: 0x3040,
    cp_e: 0x3096,
    utf16_s: 0x3040,
    utf16_e: 0x3096,
    utf8_s: 0xE38181,
    utf8_e: 0xE38296
  },
  {
    name: 'katakana',
    fullname: 'Katakana',
    label: 'ア',
    cp_s: 0x30A1,
    cp_e: 0x30FF,
    utf16_s: 0x30A1,
    utf16_e: 0x30FF,
    utf8_s: 0xE382A1,
    utf8_e: 0xE383BF
  },
  {
    name: 'bopomofo',
    fullname: 'Bopomofo',
    label: 'ㄅ',
    cp_s: 0x3100,
    cp_e: 0x312F,
    utf16_s: 0x3100,
    utf16_e: 0x312F,
    utf8_s: 0xE38480,
    utf8_e: 0xE384AF
  },
  {
    name: 'kanji',
    fullname: 'CJK unified ideographs',
    label: '漢',
    cp_s: 0x3400,
    cp_e: 0x9FFF,
    utf16_s: 0x3400,
    utf16_e: 0x9FFF,
    utf8_s: 0xE39080,
    utf8_e: 0xE9BFBF
  },
  {
    name: 'hangul',
    fullname: 'Hangul',
    label: '한',
    cp_s: 0xAC00,
    cp_e: 0xD7AF,
    utf16_s: 0xAC00,
    utf16_e: 0xD7AF,
    utf8_s: 0xEAB080,
    utf8_e: 0xED9EAF
  },
  {
    name: 'surrogates',
    fullname: 'Surrogates',
    label: 'SURR',
    cp_s: 0xD800,
    cp_e: 0xDFFF,
    utf16_s: 0xD800,
    utf16_e: 0xDFFF,
    utf8_s: 0xEFBFBD,
    utf8_e: 0xEFBFBD,
    caution: {
      utf8: true
    }
  },
  {
    name: 'pua',
    fullname: 'Private Use Area',
    label: 'PUA',
    cp_s: 0xE000,
    cp_e: 0xF8FF,
    utf16_s: 0xE000,
    utf16_e: 0xF8FF,
    utf8_s: 0xEE8080,
    utf8_e: 0xEFA3BF,
    caution: true
  },
  {
    name: 'kanji_comp',
    fullname: 'CJK Compatibility Ideographs',
    label: '漢2',
    cp_s: 0xF900,
    cp_e: 0xFAFF,
    utf16_s: 0xF900,
    utf16_e: 0xFAFF,
    utf8_s: 0xEFA480,
    utf8_e: 0xEFABBF
  },
  {
    name: 'variation_selectors',
    fullname: 'Variation Selectors',
    label: 'VS',
    cp_s: 0xFE00,
    cp_e: 0xFE0F,
    utf16_s: 0xFE00,
    utf16_e: 0xFE0F,
    utf8_s: 0xEFB880,
    utf8_e: 0xEFB88F
  },
  {
    name: 'fillwidth_forms',
    fullname: 'Fullwidth Forms',
    label: 'Ａ',
    cp_s: 0xFF00,
    cp_e: 0xFF5E,
    utf16_s: 0xFF00,
    utf16_e: 0xFF5E,
    utf8_s: 0xEFBC80,
    utf8_e: 0xEFBD9E
  },
  {
    name: 'half_kana',
    fullname: 'Halfwidth Kana',
    label: 'ｱ',
    cp_s: 0xFF61,
    cp_e: 0xFF9F,
    utf16_s: 0xFF61,
    utf16_e: 0xFF9F,
    utf8_s: 0xEFBDA1,
    utf8_e: 0xEFBE9F
  },
  {
    name: 'non_bmp',
    label: 'U+10000-U+10FFFF',
    fullname: '4 bytes character',
    cp_s: 0x10000,
    cp_e: 0x10FFFF,
    plane: true,
    skip_check: true
  },
  {
    name: 'smp',
    fullname: 'Supplementary Multilingual Plane',
    label: '1:SMP',
    cp_s: 0x10000,
    cp_e: 0x1FFFF,
    utf16_s: 0xD800DC00,
    utf16_e: 0xD83FDFFF,
    utf8_s: 0xF0908080,
    utf8_e: 0xF09FBFBF
  },
  {
    name: 'emoji',
    fullname: 'Emoji',
    label: 'Emoji',
    cp_s: 0x1F300,
    cp_e: 0x1FBFF,
    utf16_s: 0xD83CDF00,
    utf16_e: 0xD83EDFFF,
    utf8_s: 0xF09F8C80,
    utf8_e: 0xF09FAFBF
  },
  {
    name: 'sip',
    fullname: 'Supplementary Ideographic Plane',
    label: '2:SIP',
    cp_s: 0x20000,
    cp_e: 0x2FFFF,
    utf16_s: 0xD840DC00,
    utf16_e: 0xD87FDFFF,
    utf8_s: 0xF0A08080,
    utf8_e: 0xF0AFBFBF
  },
  {
    name: 'tip',
    fullname: 'Tertiary Ideographic Plane',
    label: '3:TIP',
    cp_s: 0x30000,
    cp_e: 0x3FFFF,
    utf16_s: 0xD880DC00,
    utf16_e: 0xDB3FDFFF,
    utf8_s: 0xF0B08080,
    utf8_e: 0xF39FBFBF
  },
  {
    name: 'ssp',
    fullname: 'Supplementary Special-purpose Plane',
    label: '14:SSP',
    cp_s: 0xE0000,
    cp_e: 0xEFFFF,
    utf16_s: 0xDB40DC00,
    utf16_e: 0xDB7FDFFF,
    utf8_s: 0xF3A08080,
    utf8_e: 0xF3AFBFBF
  },
  {
    name: 'variation_selectors2',
    fullname: 'Variation Selector 17-256',
    label: 'VS2',
    cp_s: 0xE0100,
    cp_e: 0xE01EF,
    utf16_s: 0xDB40DD00,
    utf16_e: 0xDB40DDEF,
    utf8_s: 0xF3A08480,
    utf8_e: 0xF3A087AF
  },
  {
    name: 'pua15',
    fullname: 'Private Use Plane',
    label: '15:PUA',
    cp_s: 0xF0000,
    cp_e: 0xFFFFF,
    utf16_s: 0xDB80DC00,
    utf16_e: 0xDBBFDFFF,
    utf8_s: 0xF3B08080,
    utf8_e: 0xF3BFBFBF
  },
  {
    name: 'pua16',
    fullname: 'Private Use Plane',
    label: '16:PUA',
    cp_s: 0x100000,
    cp_e: 0x10FFFF,
    utf16_s: 0xDBC0DC00,
    utf16_e: 0xDBFFDFFE,
    utf8_s: 0xF4808080,
    utf8_e: 0xF48FBFBF
  }
];

bin.auto = true;
bin.buf = null;
bin.file = null;
bin.uiStatus = bin.UI_ST_NONE;
bin.areaSize = {
  orgX: 0,
  orgSP1: 0,
  orgSP2: 0,
  orgDW: 0,
  dW: 0
};

bin.onselectstart = document.onselectstart;

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

  bin.storeAreaSize();
  window.addEventListener('mousemove', bin.onMouseMove, true);
  window.addEventListener('mouseup', bin.onMouseUp, true);
  $el('#adjuster').addEventListener('mousedown', bin.onAreaResizeStart);
  $el('#adjuster').addEventListener('dblclick', bin.resetAreaSize);

  $el('#dump-flag-show-addr').addEventListener('input', bin.onChangeDumpFlag);
  $el('#dump-flag-show-sp').addEventListener('input', bin.onChangeDumpFlag);
  $el('#dump-flag-show-ascii').addEventListener('input', bin.onChangeDumpFlag);

  $el('#bsb64-n').addEventListener('change', bin.onChangeBsb64);

  $el('#src').addEventListener('input', bin.onInput);
  $el('#src').addEventListener('change', bin.onInput);
  bin.clear();
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
    case 'dec':
    case 'bin':
      var b64 = util.encodeBase64(buf, true);
      r = bin.getHexDump(mode, buf);
      break;
    case 'b64s':
      var key = $el('#key').value;
      b64s = util.encodeBase64s(buf, key);
      r = bin.formatB64(b64s);
      b64 = util.encodeBase64(buf, true);
      break;
    case 'bsb64':
      var n = $el('#bsb64-n').value | 0;
      var b64s = util.BSB64.encode(buf, n);
      r = bin.formatB64(b64s);
      b64 = util.encodeBase64(buf, true);
      break;
    case 'txt':
      b64 = util.encodeBase64(buf, true);
      r = util.decodeBase64(b64);
      break;
    default:
      b64 = util.encodeBase64(buf, true);
      r = bin.formatB64(b64);
  }
  var ftype = bin.analyzeBinary(buf);
  bin.drawBinInfo(ftype, buf, b64);
  bin.setSrcValue(r, false);
  bin.showPreview(ftype, b64);
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
    case 'dec':
    case 'bin':
      var buf = new Uint8Array(s);
      var b64 = util.encodeBase64(buf, true);
      r = bin.getHexDump(mode, buf);
      break;
    case 'b64s':
      var key = $el('#key').value;
      buf = new Uint8Array(s);
      b64s = util.encodeBase64s(buf, key);
      r = bin.formatB64(b64s);
      b64 = util.encodeBase64(buf, true);
      break;
    case 'bsb64':
      var n = $el('#bsb64-n').value | 0;
      var buf = new Uint8Array(s);
      var b64s = util.BSB64.encode(buf, n);
      r = bin.formatB64(b64s);
      b64 = util.encodeBase64(buf, true);
      break;
    case 'txt':
      var buf = new Uint8Array(s);
      b64 = util.encodeBase64(buf, true);
      r = util.decodeBase64(b64);
      break;
    default:
      buf = bin.decodeBase64(s);
      r = bin.formatB64(s);
      b64 = bin.extractB64fromDataUrl(s);
  }
  var ftype = bin.analyzeBinary(buf);
  bin.drawBinInfo(ftype, buf, b64);
  bin.setSrcValue(r, true);
  bin.showPreview(ftype, b64);
  bin.buf = buf;
  $el('#key-update-button').disabled = false;
};

bin.decodeBase64 = function(s) {
  s = bin.extractB64fromDataUrl(s);
  return util.decodeBase64(s, true);
};

bin.extractB64fromDataUrl = function(s) {
  s = s.trim().replace(/\n/g, '');
  if (s.startsWith('data:')) {
    var a = s.split(',');
    s = a[1];
  }
  return s;
};

bin.drawBinInfo = function(ftype, buf, b64) {
  var bLen = buf.length;
  var b64Len = b64.length;
  var x = ((bLen == 0) ?  0 : util.round(b64Len / bLen, 2));
  var bSize = util.formatNumber(bLen);
  var b64Size = util.formatNumber(b64Len);

  var fileName = '-';
  var lastMod = '-';
  if (bin.file) {
    fileName = bin.file.name;
    lastMod = util.getDateTimeString(bin.file.lastModified);
  }

  var sizeInfo = bSize + ' bytes';
  if (bLen > 1024) {
    sizeInfo += ' (' + util.convByte(bLen) + 'B)';
  }
  sizeInfo += ' : ' + b64Size + ' bytes in Base64 (x ' + x + ')';

  var s = '';
  s += 'FileName: ' + fileName + '\n';
  s += 'LastMod : ' + lastMod + '\n';
  s += 'Size    : ' + sizeInfo + '\n';
  s += 'SHA-1   : ' + bin.getSHA('SHA-1', buf, 1) + '\n';
  s += 'SHA-256 : ' + bin.getSHA('SHA-256', buf, 1) + '\n';
  s += 'Type    : ' + '.' + ftype['ext'] + '  ' + ftype['mime'] + '\n';

  if (ftype['encoding']) {
    s += '\n' + bin.buildTextFileInfo(ftype);
  }

  var binDetail = ftype['bin_detail'];

  if (bin.isImage(ftype)) {
    if (binDetail) {
      s += bin.buildImageInfo(binDetail);
    }
  } else if (bin.isZip(ftype)) {
    if (binDetail['has_pw']) {
      s += '<span class="caution">PW LOCKED</span>'
    }
  } else if (binDetail && (typeof binDetail == 'string')) {
    s += '' + binDetail;
  }

  bin.drawInfo(s);
};

bin.buildImageInfo = function(binDetail) {
  var s = 'ImgSize : W ' + binDetail['w'] + ' x ' + 'H '  + binDetail['h'];
  return s;
};

bin.buildTextFileInfo = function(ftype) {
  var encInfo = ftype['encoding'];
  var type = encInfo.type;

  var newline = encInfo['newline'];
  var clzCrLf = 'status-inactive';
  var clzLf = 'status-inactive';
  var clzCr = 'status-inactive';

  var ttCrLf = '0';
  var ttLf = '0';
  var ttCr = '0';

  if (newline['crlf']) {
    clzCrLf = 'status-active';
    ttCrLf = newline['crlf'];
  }
  if (newline['lf']) {
    clzLf = 'status-active';
    ttLf = newline['lf'];
  }
  if (newline['cr']) {
    clzCr = 'status-active';
    ttCr = newline['cr'];
  }

  var s = 'Encoding: ' + bin.getEncodingName(type) + '  ';
  s += '<span class="' + clzCrLf + '" data-tooltip="' + ttCrLf + '">[CRLF]</span>';
  s += '<span class="' + clzLf + '" data-tooltip="' + ttLf + '">[LF]</span>';
  s += '<span class="' + clzCr + '" data-tooltip="' + ttCr + '">[CR]</span>\n';

  if (bin.isUnicode(type)) {
    var i, blockName;
    var clz = {};

    var codeblockInd = encInfo['codeblock_ind'];

    for (i = 0; i < bin.CODE_BLOCKS.length; i++) {
      codeBlock = bin.CODE_BLOCKS[i];
      blockName = codeBlock['name'];

      var caution = codeBlock['caution'];
      clz[blockName] = 'status-inactive';
      if (codeblockInd[blockName]) {
        clz[blockName] = 'status-active';
        if ((caution === true) || (caution && caution[type])) {
          clz[blockName] += ' caution';
        }
      }
    }

    s += '';
    for (i = 0; i < bin.CODE_BLOCKS.length; i++) {
      codeBlock = bin.CODE_BLOCKS[i];
      blockName = codeBlock['name'];

      var cpRange = bin.buildCodeRangeString(codeBlock);
      var tooltip = codeBlock['fullname'] + ' (' + cpRange + ')';

      if (codeBlock['plane']) {
        s += '\n';
      }

      var clazz = clz[blockName];
      if (bin.isSingleCode(codeBlock)) {
        clazz += ' code-single';
      }

      s += '<span class="' + clazz + '">';
      if (!codeBlock['plane']) {
        s += '[';
      }

      s += '<span data-tooltip="' + tooltip + '">' + codeBlock['label'] + '</span>';
      if (codeBlock['plane']) {
        s += ': ';
      } else {
        s += ']';
      }

      s += '</span>';
    }
  }

  return s;
};

bin.buildCodeRangeString = function(codeBlock) {
  var cp_s = codeBlock['cp_s'];
  var cp_e = codeBlock['cp_e'];
  var s = 'U+' + bin.toHex(cp_s, true, '', 4);
  if (cp_e) {
    s += '-U+' + bin.toHex(cp_e, true, '', 4);
  }
  return s;
};

bin.isSingleCode = function(codeBlock) {
  return (codeBlock['cp_e'] == undefined);
};

bin.isUnicode = function(type) {
  var pFix = type.substr(0, 3);
  return (pFix == 'utf');
};

bin.getEncodingName = function(id) {
  var name = '';
  if (id in bin.ENCODING_NAME) {
    name = bin.ENCODING_NAME[id];
  };
  return name;
};

bin.getSHA = function(a, b, f) {
  var s = new window.jsSHA(a, (f ? 'UINT8ARRAY' : 'TEXT'));
  s.update(b);
  return s.getHash('HEX');
};

bin.decode = function() {
  bin.buf = bin.updateInfoAndPreview();
  $el('#key-update-button').disabled = false;
};

bin.updateInfoAndPreview = function() {
  var mode = bin.getMode();
  var s = bin.getSrcValue();
  var b = bin.str2buf(mode, s);
  var b64 = util.encodeBase64(b, true);
  var ftype = bin.analyzeBinary(b);
  bin.drawBinInfo(ftype, b, b64);
  bin.showPreview(ftype, b64);
  return b;
};

bin.bin2uint8Array = function(s) {
  s = s.replace(/\s/g, '');
  return bin.str2binArr(s, 8, '0b');
};

bin.dec2uint8Array = function(s) {
  s = s.replace(/\n/g, ' ');
  s = s.replace(/\s{2,}/g, ' ');
  var w = s.split(' ');
  var a = [];
  for (var i = 0; i < w.length; i++) {
    a.push(w[i] | 0);
  }
  return a;
};

bin.hex2uint8Array = function(s) {
  s = s.replace(/\s/g, '');
  return bin.str2binArr(s, 2, '0x');
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
  var showAddr = $el('#dump-flag-show-addr').checked;
  var showSp = $el('#dump-flag-show-sp').checked;
  var showAscii = $el('#dump-flag-show-ascii').checked;
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
  } else if (mode == 'dec') {
    if (showSp) {
      hd += ' +0  +1  +2  +3  +4  +5  +6  +7   +8  +9  +A  +B  +C  +D  +E  +F';
    } else {
      hd += ' +0 +1 +2 +3 +4 +5 +6 +7 +8 +9 +A +B +C +D +E +F';
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
    if (i < buf.length || showAscii) {
      dmp += bin.getDump(mode, i, buf, len, showSp, showAddr, showAscii);
    }
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
        if (i < buf.length || showAscii) {
          dmp += bin.getDump(mode, i, buf, ed, showSp, showAddr, showAscii);
        }
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
  } else if (mode == 'dec') {
    b = bin.dumpDec(i, buf);
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
  var typeScore = {
    ascii: 1,
    utf8: 0,
    utf16: 0,
    sjis: 0,
    iso2022jp: 0,
    euc_jp: 0,
    bin: 0
  };

  var flags = {
    general: {
      newline: {
        lf: 0,
        cr: 0,
        crlf: 0
      }
    },
    utf8: {
      codeblock_ind: {}
    },
    utf16be: {
      newline: {
        lf: 0,
        cr: 0,
        crlf: 0
      },
      codeblock_ind: {}
    },
    utf16le: {
      newline: {
        lf: 0,
        cr: 0,
        crlf: 0
      },
      codeblock_ind: {}
    },
    wk: {
      tmpNL: null
    }
  };

  var f = false;
  if (bin.isUtf8Bom(buf)) {
    typeScore = bin.setScore(typeScore, 'utf8');
    f = true;
    typeScore['utf16'] = -1;
  } else if (bin.isUtf16LeBom(buf)) {
    typeScore = bin.setScore(typeScore, 'utf16le_bom');
    f = true;
    typeScore['utf8'] = -1;
  } else if (bin.isUtf16BeBom(buf)) {
    typeScore = bin.setScore(typeScore, 'utf16be_bom');
    f = true;
    typeScore['utf8'] = -1;
  }

  if (f) {
    typeScore['sjis'] = -1;
    typeScore['iso2022jp'] = -1;
    typeScore['euc_jp'] = -1;
  }

  var evn = ((buf.length % 2) == 0);
  var cnt = 0;
  for (var i = 0; i < buf.length; i++) {
    var code = buf[i];
    var leftLen = buf.length - i;

    var ptn4 = bin.fetchBufAsIntByBE(buf, i, 4);
    var ptn3 = bin.fetchBufAsIntByBE(buf, i, 3);
    var ptn2 = bin.fetchBufAsIntByBE(buf, i, 2);

    var ptn2U = ptn2;
    var ptn2L = (ptn4 & 0xFFFF);
    var ptn2Ur = bin.switchEndian(ptn2U);
    var ptn2Lr = bin.switchEndian(ptn2L);

    var chunk = {
      leftLen: leftLen,
      ptn4: ptn4,
      ptn2: ptn2,
      ptn2U: ptn2U,
      ptn2L: ptn2L,
      ptn2Ur: ptn2Ur,
      ptn2Lr: ptn2Lr,
      ptn3: ptn3
    };

    bin.checkNewline(buf, i, code, chunk, flags);
    bin.checkAscii(buf, i, code, chunk, flags);
    bin.checkNonBmp(buf, i, code, chunk, flags);

    for (var j = 0; j < bin.CODE_BLOCKS.length; j++) {
      var codeBlock = bin.CODE_BLOCKS[j];
      var cpS = codeBlock['cp_s'];
      if (!codeBlock['cp_s']['skip_check']) {
        if (cpS >= 0x10000) {
          bin.checkCodeBlock2(buf, i, code, chunk, flags, codeBlock);
        } else {
          bin.checkCodeBlock(buf, i, code, chunk, flags, codeBlock);
        }
      }
    }

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
      flags['utf8']['codeblock_ind']['non_bmp'] = true;
    } else if ((code & 0xE0) == 0xE0) {
      var c0 = bin.i2hex(buf[i]);
      var c1 = bin.i2hex(buf[i + 1]);
      var c2 = bin.i2hex(buf[i + 2]);
      if ((c1 != '') && (c2 != '')) {
        uri = '%' + c0 + '%' + c1 + '%' + c2;
      }
      skip = 2;
      flags['utf8']['codeblock_ind']['bmp'] = true;
    } else if ((code & 0xC0) == 0xC0) {
      var c0 = bin.i2hex(buf[i]);
      var c1 = bin.i2hex(buf[i + 1]);
      if ((c1 != '') && (c2 != '')) {
        uri = '%' + c0 + '%' + c1;
      }
      skip = 1;
      flags['utf8']['codeblock_ind']['bmp'] = true;
    } else if (code >= 0x80) {
      typeScore['ascii'] = -1;
      typeScore['utf8'] = -1;
      if (evn) {
        typeScore = bin.incrementScore(typeScore, 'utf16');
        cnt++;
      } else {
        if (typeScore['bin'] != -1) {
          typeScore['bin'] = 1;
        }
      }
    } else if (code == 0x00) {
      typeScore['utf8'] = -1;
      typeScore['sjis'] = -1;
      typeScore['iso2022jp'] = -1;
      typeScore['euc_jp'] = -1;

      if (evn) {
        typeScore = bin.incrementScore(typeScore, 'utf16');
        cnt++;
      } else {
        if (typeScore['bin'] != -1) {
          typeScore['bin'] = 1;
        }
      }
    } else {
      flags['utf8']['codeblock_ind']['ascii'] = true;
    }

    if (uri && (typeScore['utf8'] >= 0)) {
      try {
        var c = decodeURI(uri);
        i += skip;
        typeScore = bin.incrementScore(typeScore, 'utf8');
        var cp = c.charCodeAt(0);
        if (bin.inRange(cp, 0x80, 0xFF)) {
          flags['utf8']['codeblock_ind']['latin1_suppl'] = true;
        }
        cnt++;
      } catch(e) {}
    }

    if (typeScore['sjis'] >= 0) {
      if (bin.isSjis(buf, i, true)) {
        typeScore = bin.incrementScore(typeScore, 'sjis');
        typeScore['utf16'] = -1;
        cnt++;
      }
    }

    if (typeScore['iso2022jp'] >= 0) {
      if (bin.isIso2022jp(buf, i)) {
        typeScore = bin.incrementScore(typeScore, 'iso2022jp');
        typeScore['utf16'] = -1;
        cnt++;
      }
    }

    if (typeScore['euc_jp'] >= 0) {
      if (bin.isEuc(buf, i, true)) {
        typeScore = bin.incrementScore(typeScore, 'euc_jp');
        typeScore['utf16'] = -1;
        cnt++;
      }
    }
  }

  typeScore = util.sortObjectKeyByValue(typeScore, true);
  for (var type in typeScore) {
    break;
  }

  if (type == 'utf16') {
    if (bin.isUtf16Le(buf)) {
      type = 'utf16le';
    } else if (bin.isUtf16Be(buf)) {
      type = 'utf16be';
    } else {
      type = 'bin';
    }
  }

  var encoding = {
    type: type,
    newline: flags['general']['newline'],
    codeblock_ind: {}
  };

  if (bin.isUnicode(type)) {
    var wType = type.replace(/_bom$/, '');
    var srcFlags = flags[wType];
    for (var key in encoding) {
      if (key in srcFlags) {
        encoding[key] = srcFlags[key];
      }
    }
  }

  return encoding;
};

bin.checkNewline = function(buf, pos, code, chunk, flags) {
  if (pos % 2 == 0) {
    if (chunk['ptn4'] == 0x000D000A) {
      flags['utf16be']['newline']['crlf']++;
    } else if (chunk['ptn4'] == 0x0D000A00) {
      flags['utf16le']['newline']['crlf']++;
    } else if ((chunk['ptn2L'] == 0x000A) && (chunk['ptn2U'] != 0x000D)) {
      flags['utf16be']['newline']['lf']++;
    } else if ((chunk['ptn2L'] == 0x0A00) && (chunk['ptn2U'] != 0x0D00)) {
      flags['utf16le']['newline']['lf']++;
    } else if ((chunk['ptn2U'] == 0x000D) && (chunk['ptn2L'] != 0x000A)) {
      flags['utf16be']['newline']['cr']++;
    } else if ((chunk['ptn2U'] == 0x0D00) && (chunk['ptn2L'] != 0x0AA0)) {
      flags['utf16le']['newline']['cr']++;
    }
  }

  if (chunk['ptn2U'] == 0x0D0A) {
    flags['general']['newline']['crlf']++;
  }

  if (code == 0x0D) {
    flags['wk']['tmpNL'] = 'CR';
    if (pos == buf.length - 1) {
      flags['general']['newline']['cr']++;
    }
  } else if (code == 0x0A) {
    if (flags['wk']['tmpNL'] != 'CR') {
      flags['general']['newline']['lf']++;
    }
    flags['wk']['tmpNL'] = null;
  } else {
    if (flags['wk']['tmpNL'] == 'CR') {
      flags['general']['newline']['cr']++;
    }
    flags['wk']['tmpNL'] = null;
  }

  return flags;
};

bin.checkAscii = function(buf, pos, code, chunk, flags) {
  if (pos % 2 == 0) {
    if ((chunk['ptn2U'] >= 0x0020) && (chunk['ptn2U'] <= 0x007F)) {
      flags['utf16be']['codeblock_ind']['ascii'] = true;
    } else if ((chunk['ptn2Ur'] >= 0x0020) && (chunk['ptn2Ur'] <= 0x007F)) {
      flags['utf16le']['codeblock_ind']['ascii'] = true;
    }
  }

  if ((code >= 0x0020) && (code <= 0x007F)) {
    flags['utf8']['codeblock_ind']['ascii'] = true;
  }

  return flags;
};

bin.checkCodeBlock = function(buf, pos, code, chunk, flags, codeBlock) {
  var blockName = codeBlock['name'];
  var utf16S = codeBlock['utf16_s'];
  var utf16E = codeBlock['utf16_e'];
  var utf8S = codeBlock['utf8_s'];
  var utf8E = codeBlock['utf8_e'];

  if (utf16E == undefined) {
    utf16E = utf16S;
  }

  if (utf8E == undefined) {
    utf8E = utf8S;
  }

  if (pos % 2 == 0) {
    if ((chunk['ptn2U'] >= utf16S) && (chunk['ptn2U'] <= utf16E)) {
      flags['utf16be']['codeblock_ind'][blockName] = true;
    } else if ((chunk['ptn2Ur'] >= utf16S) && (chunk['ptn2Ur'] <= utf16E)) {
      flags['utf16le']['codeblock_ind'][blockName] = true;
    }
  }

  var utf8B = chunk['ptn3'];
  if (bin.inRange(utf8S, 0xC280, 0xDFBF)) {
    utf8B = chunk['ptn2'];
  }

  if ((utf8B >= utf8S) && (utf8B <= utf8E)) {
    flags['utf8']['codeblock_ind'][blockName] = true;
  }

  return flags;
};

bin.checkCodeBlock2 = function(buf, pos, code, chunk, flags, codeBlock) {
  if (chunk['leftLen'] < 4) {
    return flags;
  }

  var blockName = codeBlock['name'];
  var utf16S = codeBlock['utf16_s'];
  var utf16E = codeBlock['utf16_e'];
  var utf8S = codeBlock['utf8_s'];
  var utf8E = codeBlock['utf8_e'];

  if (utf16E == undefined) {
    utf16E = utf16S;
  }

  if (utf8E == undefined) {
    utf8E = utf8S;
  }

  if (pos % 2 == 0) {
    var u4r = (chunk['ptn2Ur'] * (2 ** 16));
    var ptn4r = u4r + chunk['ptn2Lr'];
    if ((chunk['ptn4'] >= utf16S) && (chunk['ptn4'] <= utf16E)) {
      flags['utf16be']['codeblock_ind'][blockName] = true;
    } else if ((ptn4r >= utf16S) && (ptn4r <= utf16E)) {
      flags['utf16le']['codeblock_ind'][blockName] = true;
    }
  }

  if ((chunk['ptn4'] >= utf8S) && (chunk['ptn4'] <= utf8E)) {
    flags['utf8']['codeblock_ind'][blockName] = true;
  }
  return flags;
};

bin.checkNonBmp = function(buf, pos, code, chunk, flags) {
  if (pos % 2 == 0) {
    if (bin.isUpperSurrogate(chunk['ptn2U']) && bin.isLowerSurrogate(chunk['ptn2L'])) {
      flags['utf16be']['codeblock_ind']['non_bmp'] = true;
    } else if (bin.isUpperSurrogate(chunk['ptn2Ur']) && bin.isLowerSurrogate(chunk['ptn2Lr'])) {
      flags['utf16le']['codeblock_ind']['non_bmp'] = true;
    } else {
      if (!(bin.isUtf16BomSeq(chunk['ptn2U']) || bin.isUtf16BomSeq(chunk['ptn2Ur']) || bin.isSurrogate(chunk['ptn2U']) || bin.isSurrogate(chunk['ptn2Ur']))) {
        flags['utf16le']['codeblock_ind']['bmp'] = true;
        flags['utf16be']['codeblock_ind']['bmp'] = true;
      }
    }
  }
  return flags;
};

bin.inRange = function(c, s, e) {
  return ((c >= s) && (c <= e));
};

bin.isSurrogate = function(v) {
  return (bin.isUpperSurrogate(v) || bin.isLowerSurrogate(v));
};

bin.isUpperSurrogate = function(v) {
  return bin.inRange(v, 0xD800, 0xDBFF);
};

bin.isLowerSurrogate = function(v) {
  return bin.inRange(v, 0xDC00, 0xDFFF);
};

bin.isUtf16BomSeq = function(v) {
  return ((v == 0xFFFE) || (v == 0xFEFF));
};

bin.switchEndian = function(u16) {
  var vU = (u16 >> 8) & 0xFF;
  var vL = u16 & 0xFF;
  var r = ((vL << 8) + vU) & 0xFFFF;
  return r;
};

bin.setScore = function(o, k) {
  o = bin.disableAllScore(o);
  o[k] = 1;
  return o;
};

bin.incrementScore = function(o, k) {
  if (o[k] >= 0) o[k]++;
  o['ascii'] = -1;
  return o;
};

bin.disableAllScore = function(o) {
  for (var k in o) {
    o[k] = -1;
  }
  return o;
};

bin.analyzeBinary = function(b){
  var tp = bin.getFileType(b);
  return tp;
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

  var dc = ftype['mime'].split('/')[0];
  if (dc == 'text') {
    var enc = bin.getEncoding(b);
    if (enc['type'] == 'bin') {
      ftype['mime'] = 'application/octet-stream';
      ftype['ext'] = '???';
    } else {
      ftype['encoding'] = enc;
    }
  } else {
    var binDetail = bin.getBinDetail(ftype['ext'], b);
    if (binDetail) ftype['bin_detail'] = binDetail;
  }

  if (bin.isZip(ftype)) {
    var w = bin.getZipContentType(b);
    if (w) ftype = w;
  }

  return ftype;
};

bin.hasBinaryPattern = function(buf, bytesPattern) {
  var ptn = bytesPattern.split(' ');
  if (buf.length < ptn.length) return false;
  for (var i = 0; i < buf.length; i++) {
    if (bin._hasBinaryPattern(buf, i, bytesPattern)) return true;
  }
  return false;
};

bin._hasBinaryPattern = function(buf, pos, bytesPattern) {
  if (bytesPattern instanceof Array) {
    for (var i = 0; i < bytesPattern.length; i++) {
      if (bin.bytecmp(buf, pos, bytesPattern[i])) return true;
    }
  } else {
    return bin.bytecmp(buf, pos, bytesPattern);
  }
  return false;
};

bin.bytecmp = function(buf, pos, bytesPattern) {
  var ptn = bytesPattern.split(' ');
  if (buf.length < ptn.length) {
    return false;
  }
  var v;
  for (var i = 0; i < ptn.length; i++) {
    var hex = ptn[i];
    if (hex == 'xx') {
      continue;
    }
    if (hex.match(/\|/)) {
      var w = hex.split('|');
      for (var j = 0; j < w.length; j++) {
        v = +('0x' + w[j]);
        if (v == buf[i + pos]) {
          break;
        }
      }
      if (j == w.length) {
        return false;
      }
    } else {
      v = +('0x' + hex);
      if (v != buf[i + pos]) {
        return false;
      }
    }
  }
  return true;
};

bin.isImage = function(ftype) {
  return (ftype['mime'].startsWith('image/'));
};

bin.isZip = function(ftype) {
  return (ftype['mime'] == 'application/x-zip-compressed');
};

bin.isAscii = function(b) {
  return ((b >= 0) && (b <= 0x7F));
};

bin.isUtf8Bom = function(buf) {
  return bin._hasBinaryPattern(buf, 0, 'EF BB BF');
};

bin.isUtf16BeBom = function(buf) {
  return bin._hasBinaryPattern(buf, 0, 'FE FF');
};

bin.isUtf16LeBom = function(buf) {
  return bin._hasBinaryPattern(buf, 0, 'FF FE');
};

bin.isUtf16Le = function(buf) {
  if (buf.length % 2 != 0) return false;
  if (buf.length < 2) return false;
  var f = false;
  for (var i = 0; i < buf.length - 1; i++) {
    if ((i % 2) == 0) {
      if (buf[i] == 0x00) {
        return false;
      } if ((buf[i] != 0x00) && (buf[i + 1] == 0x00)) {
        f = true;
      }
    }
  }
  return f;
};

bin.isUtf16Be = function(buf) {
  if (buf.length % 2 != 0) return false;
  if (buf.length < 2) return false;
  var f = false;
  for (var i = 0; i < buf.length - 1; i++) {
    if ((i % 2) == 0) {
      if ((buf[i] == 0x00) && (buf[i + 1] != 0x00)) {
        f = true;
      }
    } else {
      if (buf[i] == 0x00) {
        return false;
      }
    }
  }
  return f;
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

bin.isSjis = function(buf, pos, exclAscii) {
  var b1 = buf[pos];
  var b2 = buf[pos + 1];
  if ((b1 == undefined) || (b2 == undefined)) return false;
  if (exclAscii) {
    if (bin.isAscii(b1) && bin.isAscii(b2)) return false;
  }
  return (bin.isSjisMultiByte1(b1) && bin.isSjisMultiByte2(b2));
};
bin.isSjisMultiByte1 = function(b) {
  return (((b >= 0x81) && (b <= 0x9F)) || ((b >= 0xE0) && (b <= 0xFC)));
};
bin.isSjisMultiByte2 = function(b) {
  return (((b >= 0x40) && (b <= 0xFC)) && (b != 0x7F));
};

bin.isEuc = function(buf, pos, exclAscii) {
  var b1 = buf[pos];
  var b2 = buf[pos + 1];
  if ((b1 == undefined) || (b2 == undefined)) return false;
  if (exclAscii) {
    if (bin.isAscii(b1) && bin.isAscii(b2)) return false;
  }
  return (bin.isEucMultiByte1(b1) && bin.isEucMultiByte2(b2));
};
bin.isEucMultiByte1 = function(b) {
  if ((b == 0x8E) || (b == 0x8F) || ((b >= 0xA1) && (b <= 0xFE))) {
    return true;
  }
  return false;
};
bin.isEucMultiByte2 = function(b) {
  if ((b >= 0xA1) && (b <= 0xFE)) {
    return true;
  }
  return false;
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

bin.getBinDetail = function(ext, b) {
  var r = '';
  if (ext == 'bmp') {
    r = bin.getBmpInfo(b);
  } else if (ext == 'class') {
    r = bin.getJavaClassVersion(b);
  } else if (ext == 'exe') {
    var a = bin.getExeArch(b);
    r = 'Arch    : ' + a;
  } else if (ext == 'jpg') {
    r = bin.getJpegInfo(b);
  } else if (ext == 'png') {
    r = bin.getPngInfo(b);
  } else if (ext == 'zip') {
    r = bin.getZipInfo(b);
  }
  return r;
};

bin.getExeArch = function(b) {
  var pe = -1;
  var len = 512;
  for (var i = 0; i < len; i++) {
    if (i + 3 >= len) break;
    var ptn = bin.fetchBufAsIntByBE(b, i, 4);
    if (ptn == 0x50450000) {
      pe = i;break;
    }
  }
  var v = 0;
  if ((pe >= 0) && (pe + 5 < len)) {
    v = bin.fetchBufAsIntByBE(b, pe + 4, 2);
  }
  var arch = '';
  if (v == 0x6486) {
    arch = 'x86-64 (64bit)';
  } else if (v == 0x4C01) {
    arch = 'x86 (32bit)';
  }
  return arch;
};

bin.getBmpInfo = function(b) {
  var r = {w: 0, h: 0};
  if (b.length < 26) {
    return r;
  }
  var posW = 0x12;
  var posH = 0x16;
  var w = bin.fetchBufAsIntByLE(b, posW, 4);
  var h = bin.fetchBufAsIntByLE(b, posH, 4);
  r['w'] = w;
  r['h'] = h;
  return r;
};

bin.getJpegInfo = function(b) {
  var r = {w: 0, h: 0};
  var SOF = 'FF C0|C2';
  var p = bin.scanBuf(b, SOF);
  if (p == -1) {
    return r;
  }
  var offsetH = 5;
  var offsetW = 7;
  var posH = p + offsetH;
  var posW = p + offsetW;
  var h = bin.fetchBufAsIntByBE(b, posH, 2);
  var w = bin.fetchBufAsIntByBE(b, posW, 2);
  r['w'] = w;
  r['h'] = h;
  return r;
};

bin.getPngInfo = function(b) {
  var r = {w: 0, h: 0};
  if (b.length < 26) {
    return r;
  }
  var posIHDR = 0x08;
  var posW = posIHDR + 0x08;
  var posH = posIHDR + 0x0C;
  var w = bin.fetchBufAsIntByBE(b, posW, 4);
  var h = bin.fetchBufAsIntByBE(b, posH, 4);
  r['w'] = w;
  r['h'] = h;
  return r;
};

bin.getZipInfo = function(b) {
  var hasPw = b[6] & 1;
  var r = {
    has_pw: hasPw
  };
  return r;
};

bin.getJavaClassVersion = function(b) {
  var v = b[7];
  var j;
  if (v <= 48) {
    j = '1.' + v - 44;
  } else {
    j = v - 44;
  }
  var s = 'Java    : Java SE ' + j + ' : version = ' + v + ' (' + bin.toHex(v, true, '0x', 2) + ')';
  return s;
};

bin.fetchBufAsIntByLE = function(b, pos, size) {
  if (pos == undefined) {
    pos = 0;
  }
  if ((pos + size) > b.length) {
    return -1;
  }
  var r = 0;
  for (var i = 0; i < size; i++) {
    r += b[pos + i] << (8 * i);
  }
  return r;
};

bin.fetchBufAsIntByBE = function(b, pos, size) {
  if (pos == undefined) {
    pos = 0;
  }
  if ((pos + size) > b.length) {
    return -1;
  }
  var r = 0;
  for (var i = 0; i < size; i++) {
    r += b[pos + i] << (8 * (size - i - 1));
  }
  return r;
};

bin.scanBuf = function(buf, bytesPattern, pos) {
  if (pos == undefined) {
    pos = 0;
  }
  var targetLen = buf.length - pos;
  if (targetLen < bytesPattern.length) {
    return -1;
  }
  for (var i = pos; i < buf.length; i++) {
    if (bin.bytecmp(buf, i, bytesPattern)) {
      return i;
    }
  }
  return -1;
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
  var unit = 2;
  if (mode == 'bin') {
    unit = 8;
  } else if (mode == 'dec') {
    unit = 3;
  }
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
  bin.clearBuf();
  bin.forceNewline();
  if (bin.auto) {
    bin.detectCurrentMode();
  }
  if ($el('#show-preview').checked) {
    bin.updateInfoAndPreview();
  }
};

bin.onChangeDumpFlag = function() {
  if (!bin.buf) {
    return;
  }
  var mode = bin.getMode();
  switch (mode) {
    case 'hex':
    case 'dec':
    case 'bin':
      bin.switchRadix(mode, bin.buf);
  }
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
  bin.setSrcValue(r, false);
};

bin.onDnd = function(s, f) {
  bin.file = f;
  if ((s instanceof ArrayBuffer) || (f && bin.isB64Mode())) {
    bin.dump(s);
  } else {
    bin.setSrcValue(s, true);
    if (bin.auto) {
      bin.detectCurrentMode();
      bin.updateInfoAndPreview();
    }
  }
  bin.forceNewline();
};

bin.getSrcValue = function() {
  return $el('#src').value;
};

bin.setSrcValue = function(s, resetPos) {
  $el('#src').value = s;
  if (resetPos) {
    $el('#src').scrollToTop();
    $el('#src').scrollToLeft();
  }
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
  if ((mode == 'bin') || (mode == 'dec') || (mode == 'hex')) {
    s = bin.extractBinTextPart(mode, s);
  }
  var b;
  switch (mode) {
    case 'hex':
      b = bin.hex2uint8Array(s);
      break;
    case 'dec':
      b = bin.dec2uint8Array(s);
      break;
    case 'bin':
      b = bin.bin2uint8Array(s);
      break;
    case 'b64s':
      var k = $el('#key').value;
      b = util.decodeBase64s(s, k, true);
      break;
    case 'bsb64':
      var n = $el('#bsb64-n').value | 0;
      b = util.decodeBSB64(s, n, true);
      break;
    case 'txt':
      var b64 = util.encodeBase64(s);
      b = bin.b642uint8Array(b64);
      break;
    default:
      b = bin.b642uint8Array(s);
  }
  return b;
};

bin.showPreview = function(ftype, b64) {
  if (!$el('#show-preview').checked) {
    bin.drawPreview('');
    return;
  }
  var dc = ftype['mime'].split('/')[0];
  if (dc == 'image') {
    bin.showImagePreview(b64);
  } else if (dc == 'video') {
    bin.showVideoPreview(b64);
  } else if ((dc == 'audio') && (ftype['mime'] != 'audio/midi')) {
    bin.showAudioPreview(b64);
  } else {
    bin.showTextPreview(b64);
  }
};

bin.showTextPreview = function(b64) {
  var s = util.decodeBase64(b64);
  s = util.escHtml(s);
  s = s.replace(/\r\n/g, bin.CHR_CRLF_S + '\n');
  s = s.replace(/([^>])\n/g, '$1' + bin.CHR_LF_S + '\n');
  s = s.replace(/\r/g, bin.CHR_CR_S + '\n');
  s = s + bin.EOF + '\n';
  bin.drawPreview(s);
};

bin.showImagePreview = function(b64) {
  var d = 'data:image/png;base64,' + b64;
  var v = '<img src="' + d + '" style="max-width:100%;max-height:calc(100% - 8px);">';
  bin.drawPreview(v);
};

bin.showVideoPreview = function(b64) {
  var d = 'data:video/mp4;base64,' + b64;
  var v = '<video src="' + d + '" style="max-width:100%;max-height:100%;" controls>';
  bin.drawPreview(v);
};

bin.showAudioPreview = function(b64) {
  var d = 'data:audio/wav;base64,' + b64;
  var v = '<audio src="' + d + '" style="max-width:100%;max-height:100%;" controls>';
  bin.drawPreview(v);
};

bin.drawPreview = function(s) {
  $el('#preview').innerHTML = s;
  $el('#preview-area').scrollToTop();
  $el('#preview-area').scrollToLeft();
};

bin.confirmClear = function() {
  var v = bin.getSrcValue();
  if (v && !bin.buf) {
    util.confirm('Clear?', bin.clear);
  } else {
    bin.clear();
  }
};

bin.clear = function() {
  bin.clearBuf();
  bin.setSrcValue('', true);
  bin.drawInfo('<span style="color:#888;">CONTENT INFO</span>');
  bin.drawPreview('<span style="color:#888;">PREVIEW</span>');
  $el('#src').focus();
};

bin.clearBuf = function() {
  bin.buf = null;
  bin.file = null;
  $el('#key-update-button').disabled = true;
};

bin.submit = function() {
  var v = ''
  var mode = bin.getMode();
  switch (mode) {
    case 'b64s':
      v  = $el('#key').value;
      break;
    case 'bsb64':
      v = $el('#bsb64-n').value;
      break;
  }
  $el('#h-key').value = v;
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

bin.switchKeyViewHide = function() {
  var type = (($el('#key').type == 'text') ? 'password' : 'text');
  $el('#key').type = type;
  if (type == 'password') {
    $el('#key-hide-button').removeClass('button-inactive');
  } else {
    $el('#key-hide-button').addClass('button-inactive');
  }
};

bin.updateB64sKey = function() {
  var mode = bin.getMode();
  if ((mode == 'b64s') && (bin.buf)) {
    bin.switchRadix(mode, bin.buf);
  }
};

bin.onChangeBsb64 = function() {
  var mode = bin.getMode();
  if ((mode == 'bsb64') && (bin.buf)) {
    bin.switchRadix(mode, bin.buf);
  }
};

bin.onMouseMove = function(e) {
  if (bin.uiStatus == bin.UI_ST_AREA_RESIZING) {
    bin.onAreaResize(e);
  }
};
bin.onMouseUp = function(e) {
  if (bin.uiStatus == bin.UI_ST_AREA_RESIZING) {
    bin.onAreaResizeEnd(e);
  }
};

bin.getSelfSizePos = function(el) {
  var rect = el.getBoundingClientRect();
  var resizeBoxSize = 6;
  var sp = {};
  sp.w = el.clientWidth;
  sp.h = el.clientHeight;
  sp.x1 = rect.left - resizeBoxSize / 2;
  sp.y1 = rect.top - resizeBoxSize / 2;
  sp.x2 = sp.x1 + el.clientWidth;
  sp.y2 = sp.y1 + el.clientHeight;
  return sp;
};

bin.nop = function() {
  return false;
};
bin.disableTextSelect = function() {
  document.onselectstart = bin.nop;
};
bin.enableTextSelect = function() {
  document.onselectstart = bin.onselectstart;
};

bin.onAreaResizeStart = function(e) {
  bin.uiStatus = bin.UI_ST_AREA_RESIZING;
  var x = e.clientX;
  var y = e.clientY;
  var sp1 = bin.getSelfSizePos($el('#input-area'));
  var sp2 = bin.getSelfSizePos($el('#right-area'));
  bin.areaSize.orgX = x;
  bin.areaSize.orgSP1 = sp1;
  bin.areaSize.orgSP2 = sp2;
  bin.areaSize.orgDW = bin.areaSize.dW;
  bin.disableTextSelect();
  document.body.style.cursor = 'ew-resize';
};
bin.onAreaResize = function(e) {
  var x = e.clientX;
  var y = e.clientY;
  var adj = 8;
  var dX = bin.areaSize.orgX - x;
  var w1 = bin.areaSize.orgSP1.w - dX - adj;
  var w2 = bin.areaSize.orgSP2.w + dX - adj;
  var dW = bin.areaSize.orgDW - dX;
  bin.areaSize.dW = dW;
  var bw = document.body.clientWidth;
  if ((w1 < 200) || (w1 > (bw - 200))) {
    return;
  }
  bin.setAreaSize(w1, dW);
};
bin.storeAreaSize = function() {
  var sp1 = bin.getSelfSizePos($el('#input-area'));
  var adj = 8;
  var w1 = sp1.w + adj;
  bin.orgW = {w1: w1};
};
bin.resetAreaSize = function() {
  bin.setAreaSize(bin.orgW.w1, 0);
  bin.areaSize.orgDW = 0;
  bin.areaSize.dW = 0;
};

bin.setAreaSize = function(w1, dW) {
  var adj = 8;
  $el('#input-area').style.width = w1 + adj + 'px';
  var w2 = w1 + 28;
  $el('#right-area').style.width = 'calc(100% - ' + w2 + 'px)';
};
bin.onAreaResizeEnd = function(e) {
  bin.enableTextSelect();
  document.body.style.cursor = 'auto';
  bin.uiStatus = bin.UI_ST_NONE;
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
