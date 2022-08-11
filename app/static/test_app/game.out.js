"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __restKey = (key) => typeof key === "symbol" ? key : key + "";
  var __objRest = (source, exclude) => {
    var target = {};
    for (var prop in source)
      if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
        target[prop] = source[prop];
    if (source != null && __getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(source)) {
        if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
          target[prop] = source[prop];
      }
    return target;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // node_modules/peerjs-js-binarypack/lib/bufferbuilder.js
  var require_bufferbuilder = __commonJS({
    "node_modules/peerjs-js-binarypack/lib/bufferbuilder.js"(exports, module) {
      var binaryFeatures = {};
      binaryFeatures.useBlobBuilder = function() {
        try {
          new Blob([]);
          return false;
        } catch (e) {
          return true;
        }
      }();
      binaryFeatures.useArrayBufferView = !binaryFeatures.useBlobBuilder && function() {
        try {
          return new Blob([new Uint8Array([])]).size === 0;
        } catch (e) {
          return true;
        }
      }();
      module.exports.binaryFeatures = binaryFeatures;
      var BlobBuilder = module.exports.BlobBuilder;
      if (typeof window !== "undefined") {
        BlobBuilder = module.exports.BlobBuilder = window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder || window.BlobBuilder;
      }
      function BufferBuilder() {
        this._pieces = [];
        this._parts = [];
      }
      BufferBuilder.prototype.append = function(data) {
        if (typeof data === "number") {
          this._pieces.push(data);
        } else {
          this.flush();
          this._parts.push(data);
        }
      };
      BufferBuilder.prototype.flush = function() {
        if (this._pieces.length > 0) {
          var buf = new Uint8Array(this._pieces);
          if (!binaryFeatures.useArrayBufferView) {
            buf = buf.buffer;
          }
          this._parts.push(buf);
          this._pieces = [];
        }
      };
      BufferBuilder.prototype.getBuffer = function() {
        this.flush();
        if (binaryFeatures.useBlobBuilder) {
          var builder = new BlobBuilder();
          for (var i = 0, ii = this._parts.length; i < ii; i++) {
            builder.append(this._parts[i]);
          }
          return builder.getBlob();
        } else {
          return new Blob(this._parts);
        }
      };
      module.exports.BufferBuilder = BufferBuilder;
    }
  });

  // node_modules/peerjs-js-binarypack/lib/binarypack.js
  var require_binarypack = __commonJS({
    "node_modules/peerjs-js-binarypack/lib/binarypack.js"(exports, module) {
      var BufferBuilder = require_bufferbuilder().BufferBuilder;
      var binaryFeatures = require_bufferbuilder().binaryFeatures;
      var BinaryPack = {
        unpack: function(data) {
          var unpacker = new Unpacker(data);
          return unpacker.unpack();
        },
        pack: function(data) {
          var packer = new Packer();
          packer.pack(data);
          var buffer = packer.getBuffer();
          return buffer;
        }
      };
      module.exports = BinaryPack;
      function Unpacker(data) {
        this.index = 0;
        this.dataBuffer = data;
        this.dataView = new Uint8Array(this.dataBuffer);
        this.length = this.dataBuffer.byteLength;
      }
      Unpacker.prototype.unpack = function() {
        var type = this.unpack_uint8();
        if (type < 128) {
          return type;
        } else if ((type ^ 224) < 32) {
          return (type ^ 224) - 32;
        }
        var size;
        if ((size = type ^ 160) <= 15) {
          return this.unpack_raw(size);
        } else if ((size = type ^ 176) <= 15) {
          return this.unpack_string(size);
        } else if ((size = type ^ 144) <= 15) {
          return this.unpack_array(size);
        } else if ((size = type ^ 128) <= 15) {
          return this.unpack_map(size);
        }
        switch (type) {
          case 192:
            return null;
          case 193:
            return void 0;
          case 194:
            return false;
          case 195:
            return true;
          case 202:
            return this.unpack_float();
          case 203:
            return this.unpack_double();
          case 204:
            return this.unpack_uint8();
          case 205:
            return this.unpack_uint16();
          case 206:
            return this.unpack_uint32();
          case 207:
            return this.unpack_uint64();
          case 208:
            return this.unpack_int8();
          case 209:
            return this.unpack_int16();
          case 210:
            return this.unpack_int32();
          case 211:
            return this.unpack_int64();
          case 212:
            return void 0;
          case 213:
            return void 0;
          case 214:
            return void 0;
          case 215:
            return void 0;
          case 216:
            size = this.unpack_uint16();
            return this.unpack_string(size);
          case 217:
            size = this.unpack_uint32();
            return this.unpack_string(size);
          case 218:
            size = this.unpack_uint16();
            return this.unpack_raw(size);
          case 219:
            size = this.unpack_uint32();
            return this.unpack_raw(size);
          case 220:
            size = this.unpack_uint16();
            return this.unpack_array(size);
          case 221:
            size = this.unpack_uint32();
            return this.unpack_array(size);
          case 222:
            size = this.unpack_uint16();
            return this.unpack_map(size);
          case 223:
            size = this.unpack_uint32();
            return this.unpack_map(size);
        }
      };
      Unpacker.prototype.unpack_uint8 = function() {
        var byte = this.dataView[this.index] & 255;
        this.index++;
        return byte;
      };
      Unpacker.prototype.unpack_uint16 = function() {
        var bytes = this.read(2);
        var uint16 = (bytes[0] & 255) * 256 + (bytes[1] & 255);
        this.index += 2;
        return uint16;
      };
      Unpacker.prototype.unpack_uint32 = function() {
        var bytes = this.read(4);
        var uint32 = ((bytes[0] * 256 + bytes[1]) * 256 + bytes[2]) * 256 + bytes[3];
        this.index += 4;
        return uint32;
      };
      Unpacker.prototype.unpack_uint64 = function() {
        var bytes = this.read(8);
        var uint64 = ((((((bytes[0] * 256 + bytes[1]) * 256 + bytes[2]) * 256 + bytes[3]) * 256 + bytes[4]) * 256 + bytes[5]) * 256 + bytes[6]) * 256 + bytes[7];
        this.index += 8;
        return uint64;
      };
      Unpacker.prototype.unpack_int8 = function() {
        var uint8 = this.unpack_uint8();
        return uint8 < 128 ? uint8 : uint8 - (1 << 8);
      };
      Unpacker.prototype.unpack_int16 = function() {
        var uint16 = this.unpack_uint16();
        return uint16 < 32768 ? uint16 : uint16 - (1 << 16);
      };
      Unpacker.prototype.unpack_int32 = function() {
        var uint32 = this.unpack_uint32();
        return uint32 < Math.pow(2, 31) ? uint32 : uint32 - Math.pow(2, 32);
      };
      Unpacker.prototype.unpack_int64 = function() {
        var uint64 = this.unpack_uint64();
        return uint64 < Math.pow(2, 63) ? uint64 : uint64 - Math.pow(2, 64);
      };
      Unpacker.prototype.unpack_raw = function(size) {
        if (this.length < this.index + size) {
          throw new Error("BinaryPackFailure: index is out of range " + this.index + " " + size + " " + this.length);
        }
        var buf = this.dataBuffer.slice(this.index, this.index + size);
        this.index += size;
        return buf;
      };
      Unpacker.prototype.unpack_string = function(size) {
        var bytes = this.read(size);
        var i = 0;
        var str = "";
        var c;
        var code;
        while (i < size) {
          c = bytes[i];
          if (c < 128) {
            str += String.fromCharCode(c);
            i++;
          } else if ((c ^ 192) < 32) {
            code = (c ^ 192) << 6 | bytes[i + 1] & 63;
            str += String.fromCharCode(code);
            i += 2;
          } else {
            code = (c & 15) << 12 | (bytes[i + 1] & 63) << 6 | bytes[i + 2] & 63;
            str += String.fromCharCode(code);
            i += 3;
          }
        }
        this.index += size;
        return str;
      };
      Unpacker.prototype.unpack_array = function(size) {
        var objects = new Array(size);
        for (var i = 0; i < size; i++) {
          objects[i] = this.unpack();
        }
        return objects;
      };
      Unpacker.prototype.unpack_map = function(size) {
        var map = {};
        for (var i = 0; i < size; i++) {
          var key = this.unpack();
          var value = this.unpack();
          map[key] = value;
        }
        return map;
      };
      Unpacker.prototype.unpack_float = function() {
        var uint32 = this.unpack_uint32();
        var sign = uint32 >> 31;
        var exp = (uint32 >> 23 & 255) - 127;
        var fraction = uint32 & 8388607 | 8388608;
        return (sign === 0 ? 1 : -1) * fraction * Math.pow(2, exp - 23);
      };
      Unpacker.prototype.unpack_double = function() {
        var h32 = this.unpack_uint32();
        var l32 = this.unpack_uint32();
        var sign = h32 >> 31;
        var exp = (h32 >> 20 & 2047) - 1023;
        var hfrac = h32 & 1048575 | 1048576;
        var frac = hfrac * Math.pow(2, exp - 20) + l32 * Math.pow(2, exp - 52);
        return (sign === 0 ? 1 : -1) * frac;
      };
      Unpacker.prototype.read = function(length) {
        var j = this.index;
        if (j + length <= this.length) {
          return this.dataView.subarray(j, j + length);
        } else {
          throw new Error("BinaryPackFailure: read index out of range");
        }
      };
      function Packer() {
        this.bufferBuilder = new BufferBuilder();
      }
      Packer.prototype.getBuffer = function() {
        return this.bufferBuilder.getBuffer();
      };
      Packer.prototype.pack = function(value) {
        var type = typeof value;
        if (type === "string") {
          this.pack_string(value);
        } else if (type === "number") {
          if (Math.floor(value) === value) {
            this.pack_integer(value);
          } else {
            this.pack_double(value);
          }
        } else if (type === "boolean") {
          if (value === true) {
            this.bufferBuilder.append(195);
          } else if (value === false) {
            this.bufferBuilder.append(194);
          }
        } else if (type === "undefined") {
          this.bufferBuilder.append(192);
        } else if (type === "object") {
          if (value === null) {
            this.bufferBuilder.append(192);
          } else {
            var constructor = value.constructor;
            if (constructor == Array) {
              this.pack_array(value);
            } else if (constructor == Blob || constructor == File || value instanceof Blob || value instanceof File) {
              this.pack_bin(value);
            } else if (constructor == ArrayBuffer) {
              if (binaryFeatures.useArrayBufferView) {
                this.pack_bin(new Uint8Array(value));
              } else {
                this.pack_bin(value);
              }
            } else if ("BYTES_PER_ELEMENT" in value) {
              if (binaryFeatures.useArrayBufferView) {
                this.pack_bin(new Uint8Array(value.buffer));
              } else {
                this.pack_bin(value.buffer);
              }
            } else if (constructor == Object || constructor.toString().startsWith("class")) {
              this.pack_object(value);
            } else if (constructor == Date) {
              this.pack_string(value.toString());
            } else if (typeof value.toBinaryPack === "function") {
              this.bufferBuilder.append(value.toBinaryPack());
            } else {
              throw new Error('Type "' + constructor.toString() + '" not yet supported');
            }
          }
        } else {
          throw new Error('Type "' + type + '" not yet supported');
        }
        this.bufferBuilder.flush();
      };
      Packer.prototype.pack_bin = function(blob) {
        var length = blob.length || blob.byteLength || blob.size;
        if (length <= 15) {
          this.pack_uint8(160 + length);
        } else if (length <= 65535) {
          this.bufferBuilder.append(218);
          this.pack_uint16(length);
        } else if (length <= 4294967295) {
          this.bufferBuilder.append(219);
          this.pack_uint32(length);
        } else {
          throw new Error("Invalid length");
        }
        this.bufferBuilder.append(blob);
      };
      Packer.prototype.pack_string = function(str) {
        var length = utf8Length(str);
        if (length <= 15) {
          this.pack_uint8(176 + length);
        } else if (length <= 65535) {
          this.bufferBuilder.append(216);
          this.pack_uint16(length);
        } else if (length <= 4294967295) {
          this.bufferBuilder.append(217);
          this.pack_uint32(length);
        } else {
          throw new Error("Invalid length");
        }
        this.bufferBuilder.append(str);
      };
      Packer.prototype.pack_array = function(ary) {
        var length = ary.length;
        if (length <= 15) {
          this.pack_uint8(144 + length);
        } else if (length <= 65535) {
          this.bufferBuilder.append(220);
          this.pack_uint16(length);
        } else if (length <= 4294967295) {
          this.bufferBuilder.append(221);
          this.pack_uint32(length);
        } else {
          throw new Error("Invalid length");
        }
        for (var i = 0; i < length; i++) {
          this.pack(ary[i]);
        }
      };
      Packer.prototype.pack_integer = function(num) {
        if (num >= -32 && num <= 127) {
          this.bufferBuilder.append(num & 255);
        } else if (num >= 0 && num <= 255) {
          this.bufferBuilder.append(204);
          this.pack_uint8(num);
        } else if (num >= -128 && num <= 127) {
          this.bufferBuilder.append(208);
          this.pack_int8(num);
        } else if (num >= 0 && num <= 65535) {
          this.bufferBuilder.append(205);
          this.pack_uint16(num);
        } else if (num >= -32768 && num <= 32767) {
          this.bufferBuilder.append(209);
          this.pack_int16(num);
        } else if (num >= 0 && num <= 4294967295) {
          this.bufferBuilder.append(206);
          this.pack_uint32(num);
        } else if (num >= -2147483648 && num <= 2147483647) {
          this.bufferBuilder.append(210);
          this.pack_int32(num);
        } else if (num >= -9223372036854776e3 && num <= 9223372036854776e3) {
          this.bufferBuilder.append(211);
          this.pack_int64(num);
        } else if (num >= 0 && num <= 18446744073709552e3) {
          this.bufferBuilder.append(207);
          this.pack_uint64(num);
        } else {
          throw new Error("Invalid integer");
        }
      };
      Packer.prototype.pack_double = function(num) {
        var sign = 0;
        if (num < 0) {
          sign = 1;
          num = -num;
        }
        var exp = Math.floor(Math.log(num) / Math.LN2);
        var frac0 = num / Math.pow(2, exp) - 1;
        var frac1 = Math.floor(frac0 * Math.pow(2, 52));
        var b32 = Math.pow(2, 32);
        var h32 = sign << 31 | exp + 1023 << 20 | frac1 / b32 & 1048575;
        var l32 = frac1 % b32;
        this.bufferBuilder.append(203);
        this.pack_int32(h32);
        this.pack_int32(l32);
      };
      Packer.prototype.pack_object = function(obj) {
        var keys = Object.keys(obj);
        var length = keys.length;
        if (length <= 15) {
          this.pack_uint8(128 + length);
        } else if (length <= 65535) {
          this.bufferBuilder.append(222);
          this.pack_uint16(length);
        } else if (length <= 4294967295) {
          this.bufferBuilder.append(223);
          this.pack_uint32(length);
        } else {
          throw new Error("Invalid length");
        }
        for (var prop in obj) {
          if (obj.hasOwnProperty(prop)) {
            this.pack(prop);
            this.pack(obj[prop]);
          }
        }
      };
      Packer.prototype.pack_uint8 = function(num) {
        this.bufferBuilder.append(num);
      };
      Packer.prototype.pack_uint16 = function(num) {
        this.bufferBuilder.append(num >> 8);
        this.bufferBuilder.append(num & 255);
      };
      Packer.prototype.pack_uint32 = function(num) {
        var n = num & 4294967295;
        this.bufferBuilder.append((n & 4278190080) >>> 24);
        this.bufferBuilder.append((n & 16711680) >>> 16);
        this.bufferBuilder.append((n & 65280) >>> 8);
        this.bufferBuilder.append(n & 255);
      };
      Packer.prototype.pack_uint64 = function(num) {
        var high = num / Math.pow(2, 32);
        var low = num % Math.pow(2, 32);
        this.bufferBuilder.append((high & 4278190080) >>> 24);
        this.bufferBuilder.append((high & 16711680) >>> 16);
        this.bufferBuilder.append((high & 65280) >>> 8);
        this.bufferBuilder.append(high & 255);
        this.bufferBuilder.append((low & 4278190080) >>> 24);
        this.bufferBuilder.append((low & 16711680) >>> 16);
        this.bufferBuilder.append((low & 65280) >>> 8);
        this.bufferBuilder.append(low & 255);
      };
      Packer.prototype.pack_int8 = function(num) {
        this.bufferBuilder.append(num & 255);
      };
      Packer.prototype.pack_int16 = function(num) {
        this.bufferBuilder.append((num & 65280) >> 8);
        this.bufferBuilder.append(num & 255);
      };
      Packer.prototype.pack_int32 = function(num) {
        this.bufferBuilder.append(num >>> 24 & 255);
        this.bufferBuilder.append((num & 16711680) >>> 16);
        this.bufferBuilder.append((num & 65280) >>> 8);
        this.bufferBuilder.append(num & 255);
      };
      Packer.prototype.pack_int64 = function(num) {
        var high = Math.floor(num / Math.pow(2, 32));
        var low = num % Math.pow(2, 32);
        this.bufferBuilder.append((high & 4278190080) >>> 24);
        this.bufferBuilder.append((high & 16711680) >>> 16);
        this.bufferBuilder.append((high & 65280) >>> 8);
        this.bufferBuilder.append(high & 255);
        this.bufferBuilder.append((low & 4278190080) >>> 24);
        this.bufferBuilder.append((low & 16711680) >>> 16);
        this.bufferBuilder.append((low & 65280) >>> 8);
        this.bufferBuilder.append(low & 255);
      };
      function _utf8Replace(m) {
        var code = m.charCodeAt(0);
        if (code <= 2047)
          return "00";
        if (code <= 65535)
          return "000";
        if (code <= 2097151)
          return "0000";
        if (code <= 67108863)
          return "00000";
        return "000000";
      }
      function utf8Length(str) {
        if (str.length > 600) {
          return new Blob([str]).size;
        } else {
          return str.replace(/[^\u0000-\u007F]/g, _utf8Replace).length;
        }
      }
    }
  });

  // node_modules/sdp/sdp.js
  var require_sdp = __commonJS({
    "node_modules/sdp/sdp.js"(exports, module) {
      "use strict";
      var SDPUtils2 = {};
      SDPUtils2.generateIdentifier = function() {
        return Math.random().toString(36).substr(2, 10);
      };
      SDPUtils2.localCName = SDPUtils2.generateIdentifier();
      SDPUtils2.splitLines = function(blob) {
        return blob.trim().split("\n").map(function(line) {
          return line.trim();
        });
      };
      SDPUtils2.splitSections = function(blob) {
        var parts = blob.split("\nm=");
        return parts.map(function(part, index) {
          return (index > 0 ? "m=" + part : part).trim() + "\r\n";
        });
      };
      SDPUtils2.getDescription = function(blob) {
        var sections = SDPUtils2.splitSections(blob);
        return sections && sections[0];
      };
      SDPUtils2.getMediaSections = function(blob) {
        var sections = SDPUtils2.splitSections(blob);
        sections.shift();
        return sections;
      };
      SDPUtils2.matchPrefix = function(blob, prefix) {
        return SDPUtils2.splitLines(blob).filter(function(line) {
          return line.indexOf(prefix) === 0;
        });
      };
      SDPUtils2.parseCandidate = function(line) {
        var parts;
        if (line.indexOf("a=candidate:") === 0) {
          parts = line.substring(12).split(" ");
        } else {
          parts = line.substring(10).split(" ");
        }
        var candidate = {
          foundation: parts[0],
          component: parseInt(parts[1], 10),
          protocol: parts[2].toLowerCase(),
          priority: parseInt(parts[3], 10),
          ip: parts[4],
          address: parts[4],
          port: parseInt(parts[5], 10),
          type: parts[7]
        };
        for (var i = 8; i < parts.length; i += 2) {
          switch (parts[i]) {
            case "raddr":
              candidate.relatedAddress = parts[i + 1];
              break;
            case "rport":
              candidate.relatedPort = parseInt(parts[i + 1], 10);
              break;
            case "tcptype":
              candidate.tcpType = parts[i + 1];
              break;
            case "ufrag":
              candidate.ufrag = parts[i + 1];
              candidate.usernameFragment = parts[i + 1];
              break;
            default:
              candidate[parts[i]] = parts[i + 1];
              break;
          }
        }
        return candidate;
      };
      SDPUtils2.writeCandidate = function(candidate) {
        var sdp = [];
        sdp.push(candidate.foundation);
        sdp.push(candidate.component);
        sdp.push(candidate.protocol.toUpperCase());
        sdp.push(candidate.priority);
        sdp.push(candidate.address || candidate.ip);
        sdp.push(candidate.port);
        var type = candidate.type;
        sdp.push("typ");
        sdp.push(type);
        if (type !== "host" && candidate.relatedAddress && candidate.relatedPort) {
          sdp.push("raddr");
          sdp.push(candidate.relatedAddress);
          sdp.push("rport");
          sdp.push(candidate.relatedPort);
        }
        if (candidate.tcpType && candidate.protocol.toLowerCase() === "tcp") {
          sdp.push("tcptype");
          sdp.push(candidate.tcpType);
        }
        if (candidate.usernameFragment || candidate.ufrag) {
          sdp.push("ufrag");
          sdp.push(candidate.usernameFragment || candidate.ufrag);
        }
        return "candidate:" + sdp.join(" ");
      };
      SDPUtils2.parseIceOptions = function(line) {
        return line.substr(14).split(" ");
      };
      SDPUtils2.parseRtpMap = function(line) {
        var parts = line.substr(9).split(" ");
        var parsed = {
          payloadType: parseInt(parts.shift(), 10)
        };
        parts = parts[0].split("/");
        parsed.name = parts[0];
        parsed.clockRate = parseInt(parts[1], 10);
        parsed.channels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
        parsed.numChannels = parsed.channels;
        return parsed;
      };
      SDPUtils2.writeRtpMap = function(codec) {
        var pt = codec.payloadType;
        if (codec.preferredPayloadType !== void 0) {
          pt = codec.preferredPayloadType;
        }
        var channels = codec.channels || codec.numChannels || 1;
        return "a=rtpmap:" + pt + " " + codec.name + "/" + codec.clockRate + (channels !== 1 ? "/" + channels : "") + "\r\n";
      };
      SDPUtils2.parseExtmap = function(line) {
        var parts = line.substr(9).split(" ");
        return {
          id: parseInt(parts[0], 10),
          direction: parts[0].indexOf("/") > 0 ? parts[0].split("/")[1] : "sendrecv",
          uri: parts[1]
        };
      };
      SDPUtils2.writeExtmap = function(headerExtension) {
        return "a=extmap:" + (headerExtension.id || headerExtension.preferredId) + (headerExtension.direction && headerExtension.direction !== "sendrecv" ? "/" + headerExtension.direction : "") + " " + headerExtension.uri + "\r\n";
      };
      SDPUtils2.parseFmtp = function(line) {
        var parsed = {};
        var kv;
        var parts = line.substr(line.indexOf(" ") + 1).split(";");
        for (var j = 0; j < parts.length; j++) {
          kv = parts[j].trim().split("=");
          parsed[kv[0].trim()] = kv[1];
        }
        return parsed;
      };
      SDPUtils2.writeFmtp = function(codec) {
        var line = "";
        var pt = codec.payloadType;
        if (codec.preferredPayloadType !== void 0) {
          pt = codec.preferredPayloadType;
        }
        if (codec.parameters && Object.keys(codec.parameters).length) {
          var params = [];
          Object.keys(codec.parameters).forEach(function(param) {
            if (codec.parameters[param]) {
              params.push(param + "=" + codec.parameters[param]);
            } else {
              params.push(param);
            }
          });
          line += "a=fmtp:" + pt + " " + params.join(";") + "\r\n";
        }
        return line;
      };
      SDPUtils2.parseRtcpFb = function(line) {
        var parts = line.substr(line.indexOf(" ") + 1).split(" ");
        return {
          type: parts.shift(),
          parameter: parts.join(" ")
        };
      };
      SDPUtils2.writeRtcpFb = function(codec) {
        var lines = "";
        var pt = codec.payloadType;
        if (codec.preferredPayloadType !== void 0) {
          pt = codec.preferredPayloadType;
        }
        if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
          codec.rtcpFeedback.forEach(function(fb) {
            lines += "a=rtcp-fb:" + pt + " " + fb.type + (fb.parameter && fb.parameter.length ? " " + fb.parameter : "") + "\r\n";
          });
        }
        return lines;
      };
      SDPUtils2.parseSsrcMedia = function(line) {
        var sp = line.indexOf(" ");
        var parts = {
          ssrc: parseInt(line.substr(7, sp - 7), 10)
        };
        var colon = line.indexOf(":", sp);
        if (colon > -1) {
          parts.attribute = line.substr(sp + 1, colon - sp - 1);
          parts.value = line.substr(colon + 1);
        } else {
          parts.attribute = line.substr(sp + 1);
        }
        return parts;
      };
      SDPUtils2.parseSsrcGroup = function(line) {
        var parts = line.substr(13).split(" ");
        return {
          semantics: parts.shift(),
          ssrcs: parts.map(function(ssrc) {
            return parseInt(ssrc, 10);
          })
        };
      };
      SDPUtils2.getMid = function(mediaSection) {
        var mid = SDPUtils2.matchPrefix(mediaSection, "a=mid:")[0];
        if (mid) {
          return mid.substr(6);
        }
      };
      SDPUtils2.parseFingerprint = function(line) {
        var parts = line.substr(14).split(" ");
        return {
          algorithm: parts[0].toLowerCase(),
          value: parts[1]
        };
      };
      SDPUtils2.getDtlsParameters = function(mediaSection, sessionpart) {
        var lines = SDPUtils2.matchPrefix(
          mediaSection + sessionpart,
          "a=fingerprint:"
        );
        return {
          role: "auto",
          fingerprints: lines.map(SDPUtils2.parseFingerprint)
        };
      };
      SDPUtils2.writeDtlsParameters = function(params, setupType) {
        var sdp = "a=setup:" + setupType + "\r\n";
        params.fingerprints.forEach(function(fp) {
          sdp += "a=fingerprint:" + fp.algorithm + " " + fp.value + "\r\n";
        });
        return sdp;
      };
      SDPUtils2.parseCryptoLine = function(line) {
        var parts = line.substr(9).split(" ");
        return {
          tag: parseInt(parts[0], 10),
          cryptoSuite: parts[1],
          keyParams: parts[2],
          sessionParams: parts.slice(3)
        };
      };
      SDPUtils2.writeCryptoLine = function(parameters) {
        return "a=crypto:" + parameters.tag + " " + parameters.cryptoSuite + " " + (typeof parameters.keyParams === "object" ? SDPUtils2.writeCryptoKeyParams(parameters.keyParams) : parameters.keyParams) + (parameters.sessionParams ? " " + parameters.sessionParams.join(" ") : "") + "\r\n";
      };
      SDPUtils2.parseCryptoKeyParams = function(keyParams) {
        if (keyParams.indexOf("inline:") !== 0) {
          return null;
        }
        var parts = keyParams.substr(7).split("|");
        return {
          keyMethod: "inline",
          keySalt: parts[0],
          lifeTime: parts[1],
          mkiValue: parts[2] ? parts[2].split(":")[0] : void 0,
          mkiLength: parts[2] ? parts[2].split(":")[1] : void 0
        };
      };
      SDPUtils2.writeCryptoKeyParams = function(keyParams) {
        return keyParams.keyMethod + ":" + keyParams.keySalt + (keyParams.lifeTime ? "|" + keyParams.lifeTime : "") + (keyParams.mkiValue && keyParams.mkiLength ? "|" + keyParams.mkiValue + ":" + keyParams.mkiLength : "");
      };
      SDPUtils2.getCryptoParameters = function(mediaSection, sessionpart) {
        var lines = SDPUtils2.matchPrefix(
          mediaSection + sessionpart,
          "a=crypto:"
        );
        return lines.map(SDPUtils2.parseCryptoLine);
      };
      SDPUtils2.getIceParameters = function(mediaSection, sessionpart) {
        var ufrag = SDPUtils2.matchPrefix(
          mediaSection + sessionpart,
          "a=ice-ufrag:"
        )[0];
        var pwd = SDPUtils2.matchPrefix(
          mediaSection + sessionpart,
          "a=ice-pwd:"
        )[0];
        if (!(ufrag && pwd)) {
          return null;
        }
        return {
          usernameFragment: ufrag.substr(12),
          password: pwd.substr(10)
        };
      };
      SDPUtils2.writeIceParameters = function(params) {
        return "a=ice-ufrag:" + params.usernameFragment + "\r\na=ice-pwd:" + params.password + "\r\n";
      };
      SDPUtils2.parseRtpParameters = function(mediaSection) {
        var description = {
          codecs: [],
          headerExtensions: [],
          fecMechanisms: [],
          rtcp: []
        };
        var lines = SDPUtils2.splitLines(mediaSection);
        var mline = lines[0].split(" ");
        for (var i = 3; i < mline.length; i++) {
          var pt = mline[i];
          var rtpmapline = SDPUtils2.matchPrefix(
            mediaSection,
            "a=rtpmap:" + pt + " "
          )[0];
          if (rtpmapline) {
            var codec = SDPUtils2.parseRtpMap(rtpmapline);
            var fmtps = SDPUtils2.matchPrefix(
              mediaSection,
              "a=fmtp:" + pt + " "
            );
            codec.parameters = fmtps.length ? SDPUtils2.parseFmtp(fmtps[0]) : {};
            codec.rtcpFeedback = SDPUtils2.matchPrefix(
              mediaSection,
              "a=rtcp-fb:" + pt + " "
            ).map(SDPUtils2.parseRtcpFb);
            description.codecs.push(codec);
            switch (codec.name.toUpperCase()) {
              case "RED":
              case "ULPFEC":
                description.fecMechanisms.push(codec.name.toUpperCase());
                break;
              default:
                break;
            }
          }
        }
        SDPUtils2.matchPrefix(mediaSection, "a=extmap:").forEach(function(line) {
          description.headerExtensions.push(SDPUtils2.parseExtmap(line));
        });
        return description;
      };
      SDPUtils2.writeRtpDescription = function(kind, caps) {
        var sdp = "";
        sdp += "m=" + kind + " ";
        sdp += caps.codecs.length > 0 ? "9" : "0";
        sdp += " UDP/TLS/RTP/SAVPF ";
        sdp += caps.codecs.map(function(codec) {
          if (codec.preferredPayloadType !== void 0) {
            return codec.preferredPayloadType;
          }
          return codec.payloadType;
        }).join(" ") + "\r\n";
        sdp += "c=IN IP4 0.0.0.0\r\n";
        sdp += "a=rtcp:9 IN IP4 0.0.0.0\r\n";
        caps.codecs.forEach(function(codec) {
          sdp += SDPUtils2.writeRtpMap(codec);
          sdp += SDPUtils2.writeFmtp(codec);
          sdp += SDPUtils2.writeRtcpFb(codec);
        });
        var maxptime = 0;
        caps.codecs.forEach(function(codec) {
          if (codec.maxptime > maxptime) {
            maxptime = codec.maxptime;
          }
        });
        if (maxptime > 0) {
          sdp += "a=maxptime:" + maxptime + "\r\n";
        }
        sdp += "a=rtcp-mux\r\n";
        if (caps.headerExtensions) {
          caps.headerExtensions.forEach(function(extension) {
            sdp += SDPUtils2.writeExtmap(extension);
          });
        }
        return sdp;
      };
      SDPUtils2.parseRtpEncodingParameters = function(mediaSection) {
        var encodingParameters = [];
        var description = SDPUtils2.parseRtpParameters(mediaSection);
        var hasRed = description.fecMechanisms.indexOf("RED") !== -1;
        var hasUlpfec = description.fecMechanisms.indexOf("ULPFEC") !== -1;
        var ssrcs = SDPUtils2.matchPrefix(mediaSection, "a=ssrc:").map(function(line) {
          return SDPUtils2.parseSsrcMedia(line);
        }).filter(function(parts) {
          return parts.attribute === "cname";
        });
        var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
        var secondarySsrc;
        var flows = SDPUtils2.matchPrefix(mediaSection, "a=ssrc-group:FID").map(function(line) {
          var parts = line.substr(17).split(" ");
          return parts.map(function(part) {
            return parseInt(part, 10);
          });
        });
        if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
          secondarySsrc = flows[0][1];
        }
        description.codecs.forEach(function(codec) {
          if (codec.name.toUpperCase() === "RTX" && codec.parameters.apt) {
            var encParam = {
              ssrc: primarySsrc,
              codecPayloadType: parseInt(codec.parameters.apt, 10)
            };
            if (primarySsrc && secondarySsrc) {
              encParam.rtx = { ssrc: secondarySsrc };
            }
            encodingParameters.push(encParam);
            if (hasRed) {
              encParam = JSON.parse(JSON.stringify(encParam));
              encParam.fec = {
                ssrc: primarySsrc,
                mechanism: hasUlpfec ? "red+ulpfec" : "red"
              };
              encodingParameters.push(encParam);
            }
          }
        });
        if (encodingParameters.length === 0 && primarySsrc) {
          encodingParameters.push({
            ssrc: primarySsrc
          });
        }
        var bandwidth = SDPUtils2.matchPrefix(mediaSection, "b=");
        if (bandwidth.length) {
          if (bandwidth[0].indexOf("b=TIAS:") === 0) {
            bandwidth = parseInt(bandwidth[0].substr(7), 10);
          } else if (bandwidth[0].indexOf("b=AS:") === 0) {
            bandwidth = parseInt(bandwidth[0].substr(5), 10) * 1e3 * 0.95 - 50 * 40 * 8;
          } else {
            bandwidth = void 0;
          }
          encodingParameters.forEach(function(params) {
            params.maxBitrate = bandwidth;
          });
        }
        return encodingParameters;
      };
      SDPUtils2.parseRtcpParameters = function(mediaSection) {
        var rtcpParameters = {};
        var remoteSsrc = SDPUtils2.matchPrefix(mediaSection, "a=ssrc:").map(function(line) {
          return SDPUtils2.parseSsrcMedia(line);
        }).filter(function(obj) {
          return obj.attribute === "cname";
        })[0];
        if (remoteSsrc) {
          rtcpParameters.cname = remoteSsrc.value;
          rtcpParameters.ssrc = remoteSsrc.ssrc;
        }
        var rsize = SDPUtils2.matchPrefix(mediaSection, "a=rtcp-rsize");
        rtcpParameters.reducedSize = rsize.length > 0;
        rtcpParameters.compound = rsize.length === 0;
        var mux = SDPUtils2.matchPrefix(mediaSection, "a=rtcp-mux");
        rtcpParameters.mux = mux.length > 0;
        return rtcpParameters;
      };
      SDPUtils2.parseMsid = function(mediaSection) {
        var parts;
        var spec = SDPUtils2.matchPrefix(mediaSection, "a=msid:");
        if (spec.length === 1) {
          parts = spec[0].substr(7).split(" ");
          return { stream: parts[0], track: parts[1] };
        }
        var planB = SDPUtils2.matchPrefix(mediaSection, "a=ssrc:").map(function(line) {
          return SDPUtils2.parseSsrcMedia(line);
        }).filter(function(msidParts) {
          return msidParts.attribute === "msid";
        });
        if (planB.length > 0) {
          parts = planB[0].value.split(" ");
          return { stream: parts[0], track: parts[1] };
        }
      };
      SDPUtils2.parseSctpDescription = function(mediaSection) {
        var mline = SDPUtils2.parseMLine(mediaSection);
        var maxSizeLine = SDPUtils2.matchPrefix(mediaSection, "a=max-message-size:");
        var maxMessageSize;
        if (maxSizeLine.length > 0) {
          maxMessageSize = parseInt(maxSizeLine[0].substr(19), 10);
        }
        if (isNaN(maxMessageSize)) {
          maxMessageSize = 65536;
        }
        var sctpPort = SDPUtils2.matchPrefix(mediaSection, "a=sctp-port:");
        if (sctpPort.length > 0) {
          return {
            port: parseInt(sctpPort[0].substr(12), 10),
            protocol: mline.fmt,
            maxMessageSize
          };
        }
        var sctpMapLines = SDPUtils2.matchPrefix(mediaSection, "a=sctpmap:");
        if (sctpMapLines.length > 0) {
          var parts = SDPUtils2.matchPrefix(mediaSection, "a=sctpmap:")[0].substr(10).split(" ");
          return {
            port: parseInt(parts[0], 10),
            protocol: parts[1],
            maxMessageSize
          };
        }
      };
      SDPUtils2.writeSctpDescription = function(media, sctp) {
        var output = [];
        if (media.protocol !== "DTLS/SCTP") {
          output = [
            "m=" + media.kind + " 9 " + media.protocol + " " + sctp.protocol + "\r\n",
            "c=IN IP4 0.0.0.0\r\n",
            "a=sctp-port:" + sctp.port + "\r\n"
          ];
        } else {
          output = [
            "m=" + media.kind + " 9 " + media.protocol + " " + sctp.port + "\r\n",
            "c=IN IP4 0.0.0.0\r\n",
            "a=sctpmap:" + sctp.port + " " + sctp.protocol + " 65535\r\n"
          ];
        }
        if (sctp.maxMessageSize !== void 0) {
          output.push("a=max-message-size:" + sctp.maxMessageSize + "\r\n");
        }
        return output.join("");
      };
      SDPUtils2.generateSessionId = function() {
        return Math.random().toString().substr(2, 21);
      };
      SDPUtils2.writeSessionBoilerplate = function(sessId, sessVer, sessUser) {
        var sessionId;
        var version = sessVer !== void 0 ? sessVer : 2;
        if (sessId) {
          sessionId = sessId;
        } else {
          sessionId = SDPUtils2.generateSessionId();
        }
        var user = sessUser || "thisisadapterortc";
        return "v=0\r\no=" + user + " " + sessionId + " " + version + " IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n";
      };
      SDPUtils2.writeMediaSection = function(transceiver, caps, type, stream) {
        var sdp = SDPUtils2.writeRtpDescription(transceiver.kind, caps);
        sdp += SDPUtils2.writeIceParameters(
          transceiver.iceGatherer.getLocalParameters()
        );
        sdp += SDPUtils2.writeDtlsParameters(
          transceiver.dtlsTransport.getLocalParameters(),
          type === "offer" ? "actpass" : "active"
        );
        sdp += "a=mid:" + transceiver.mid + "\r\n";
        if (transceiver.direction) {
          sdp += "a=" + transceiver.direction + "\r\n";
        } else if (transceiver.rtpSender && transceiver.rtpReceiver) {
          sdp += "a=sendrecv\r\n";
        } else if (transceiver.rtpSender) {
          sdp += "a=sendonly\r\n";
        } else if (transceiver.rtpReceiver) {
          sdp += "a=recvonly\r\n";
        } else {
          sdp += "a=inactive\r\n";
        }
        if (transceiver.rtpSender) {
          var msid = "msid:" + stream.id + " " + transceiver.rtpSender.track.id + "\r\n";
          sdp += "a=" + msid;
          sdp += "a=ssrc:" + transceiver.sendEncodingParameters[0].ssrc + " " + msid;
          if (transceiver.sendEncodingParameters[0].rtx) {
            sdp += "a=ssrc:" + transceiver.sendEncodingParameters[0].rtx.ssrc + " " + msid;
            sdp += "a=ssrc-group:FID " + transceiver.sendEncodingParameters[0].ssrc + " " + transceiver.sendEncodingParameters[0].rtx.ssrc + "\r\n";
          }
        }
        sdp += "a=ssrc:" + transceiver.sendEncodingParameters[0].ssrc + " cname:" + SDPUtils2.localCName + "\r\n";
        if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
          sdp += "a=ssrc:" + transceiver.sendEncodingParameters[0].rtx.ssrc + " cname:" + SDPUtils2.localCName + "\r\n";
        }
        return sdp;
      };
      SDPUtils2.getDirection = function(mediaSection, sessionpart) {
        var lines = SDPUtils2.splitLines(mediaSection);
        for (var i = 0; i < lines.length; i++) {
          switch (lines[i]) {
            case "a=sendrecv":
            case "a=sendonly":
            case "a=recvonly":
            case "a=inactive":
              return lines[i].substr(2);
            default:
          }
        }
        if (sessionpart) {
          return SDPUtils2.getDirection(sessionpart);
        }
        return "sendrecv";
      };
      SDPUtils2.getKind = function(mediaSection) {
        var lines = SDPUtils2.splitLines(mediaSection);
        var mline = lines[0].split(" ");
        return mline[0].substr(2);
      };
      SDPUtils2.isRejected = function(mediaSection) {
        return mediaSection.split(" ", 2)[1] === "0";
      };
      SDPUtils2.parseMLine = function(mediaSection) {
        var lines = SDPUtils2.splitLines(mediaSection);
        var parts = lines[0].substr(2).split(" ");
        return {
          kind: parts[0],
          port: parseInt(parts[1], 10),
          protocol: parts[2],
          fmt: parts.slice(3).join(" ")
        };
      };
      SDPUtils2.parseOLine = function(mediaSection) {
        var line = SDPUtils2.matchPrefix(mediaSection, "o=")[0];
        var parts = line.substr(2).split(" ");
        return {
          username: parts[0],
          sessionId: parts[1],
          sessionVersion: parseInt(parts[2], 10),
          netType: parts[3],
          addressType: parts[4],
          address: parts[5]
        };
      };
      SDPUtils2.isValidSDP = function(blob) {
        if (typeof blob !== "string" || blob.length === 0) {
          return false;
        }
        var lines = SDPUtils2.splitLines(blob);
        for (var i = 0; i < lines.length; i++) {
          if (lines[i].length < 2 || lines[i].charAt(1) !== "=") {
            return false;
          }
        }
        return true;
      };
      if (typeof module === "object") {
        module.exports = SDPUtils2;
      }
    }
  });

  // node_modules/rtcpeerconnection-shim/rtcpeerconnection.js
  var require_rtcpeerconnection = __commonJS({
    "node_modules/rtcpeerconnection-shim/rtcpeerconnection.js"(exports, module) {
      "use strict";
      var SDPUtils2 = require_sdp();
      function fixStatsType(stat) {
        return {
          inboundrtp: "inbound-rtp",
          outboundrtp: "outbound-rtp",
          candidatepair: "candidate-pair",
          localcandidate: "local-candidate",
          remotecandidate: "remote-candidate"
        }[stat.type] || stat.type;
      }
      function writeMediaSection(transceiver, caps, type, stream, dtlsRole) {
        var sdp = SDPUtils2.writeRtpDescription(transceiver.kind, caps);
        sdp += SDPUtils2.writeIceParameters(
          transceiver.iceGatherer.getLocalParameters()
        );
        sdp += SDPUtils2.writeDtlsParameters(
          transceiver.dtlsTransport.getLocalParameters(),
          type === "offer" ? "actpass" : dtlsRole || "active"
        );
        sdp += "a=mid:" + transceiver.mid + "\r\n";
        if (transceiver.rtpSender && transceiver.rtpReceiver) {
          sdp += "a=sendrecv\r\n";
        } else if (transceiver.rtpSender) {
          sdp += "a=sendonly\r\n";
        } else if (transceiver.rtpReceiver) {
          sdp += "a=recvonly\r\n";
        } else {
          sdp += "a=inactive\r\n";
        }
        if (transceiver.rtpSender) {
          var trackId = transceiver.rtpSender._initialTrackId || transceiver.rtpSender.track.id;
          transceiver.rtpSender._initialTrackId = trackId;
          var msid = "msid:" + (stream ? stream.id : "-") + " " + trackId + "\r\n";
          sdp += "a=" + msid;
          sdp += "a=ssrc:" + transceiver.sendEncodingParameters[0].ssrc + " " + msid;
          if (transceiver.sendEncodingParameters[0].rtx) {
            sdp += "a=ssrc:" + transceiver.sendEncodingParameters[0].rtx.ssrc + " " + msid;
            sdp += "a=ssrc-group:FID " + transceiver.sendEncodingParameters[0].ssrc + " " + transceiver.sendEncodingParameters[0].rtx.ssrc + "\r\n";
          }
        }
        sdp += "a=ssrc:" + transceiver.sendEncodingParameters[0].ssrc + " cname:" + SDPUtils2.localCName + "\r\n";
        if (transceiver.rtpSender && transceiver.sendEncodingParameters[0].rtx) {
          sdp += "a=ssrc:" + transceiver.sendEncodingParameters[0].rtx.ssrc + " cname:" + SDPUtils2.localCName + "\r\n";
        }
        return sdp;
      }
      function filterIceServers2(iceServers, edgeVersion) {
        var hasTurn = false;
        iceServers = JSON.parse(JSON.stringify(iceServers));
        return iceServers.filter(function(server) {
          if (server && (server.urls || server.url)) {
            var urls = server.urls || server.url;
            if (server.url && !server.urls) {
              console.warn("RTCIceServer.url is deprecated! Use urls instead.");
            }
            var isString2 = typeof urls === "string";
            if (isString2) {
              urls = [urls];
            }
            urls = urls.filter(function(url) {
              var validTurn = url.indexOf("turn:") === 0 && url.indexOf("transport=udp") !== -1 && url.indexOf("turn:[") === -1 && !hasTurn;
              if (validTurn) {
                hasTurn = true;
                return true;
              }
              return url.indexOf("stun:") === 0 && edgeVersion >= 14393 && url.indexOf("?transport=udp") === -1;
            });
            delete server.url;
            server.urls = isString2 ? urls[0] : urls;
            return !!urls.length;
          }
        });
      }
      function getCommonCapabilities(localCapabilities, remoteCapabilities) {
        var commonCapabilities = {
          codecs: [],
          headerExtensions: [],
          fecMechanisms: []
        };
        var findCodecByPayloadType = function(pt, codecs) {
          pt = parseInt(pt, 10);
          for (var i = 0; i < codecs.length; i++) {
            if (codecs[i].payloadType === pt || codecs[i].preferredPayloadType === pt) {
              return codecs[i];
            }
          }
        };
        var rtxCapabilityMatches = function(lRtx, rRtx, lCodecs, rCodecs) {
          var lCodec = findCodecByPayloadType(lRtx.parameters.apt, lCodecs);
          var rCodec = findCodecByPayloadType(rRtx.parameters.apt, rCodecs);
          return lCodec && rCodec && lCodec.name.toLowerCase() === rCodec.name.toLowerCase();
        };
        localCapabilities.codecs.forEach(function(lCodec) {
          for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
            var rCodec = remoteCapabilities.codecs[i];
            if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() && lCodec.clockRate === rCodec.clockRate) {
              if (lCodec.name.toLowerCase() === "rtx" && lCodec.parameters && rCodec.parameters.apt) {
                if (!rtxCapabilityMatches(
                  lCodec,
                  rCodec,
                  localCapabilities.codecs,
                  remoteCapabilities.codecs
                )) {
                  continue;
                }
              }
              rCodec = JSON.parse(JSON.stringify(rCodec));
              rCodec.numChannels = Math.min(
                lCodec.numChannels,
                rCodec.numChannels
              );
              commonCapabilities.codecs.push(rCodec);
              rCodec.rtcpFeedback = rCodec.rtcpFeedback.filter(function(fb) {
                for (var j = 0; j < lCodec.rtcpFeedback.length; j++) {
                  if (lCodec.rtcpFeedback[j].type === fb.type && lCodec.rtcpFeedback[j].parameter === fb.parameter) {
                    return true;
                  }
                }
                return false;
              });
              break;
            }
          }
        });
        localCapabilities.headerExtensions.forEach(function(lHeaderExtension) {
          for (var i = 0; i < remoteCapabilities.headerExtensions.length; i++) {
            var rHeaderExtension = remoteCapabilities.headerExtensions[i];
            if (lHeaderExtension.uri === rHeaderExtension.uri) {
              commonCapabilities.headerExtensions.push(rHeaderExtension);
              break;
            }
          }
        });
        return commonCapabilities;
      }
      function isActionAllowedInSignalingState(action, type, signalingState) {
        return {
          offer: {
            setLocalDescription: ["stable", "have-local-offer"],
            setRemoteDescription: ["stable", "have-remote-offer"]
          },
          answer: {
            setLocalDescription: ["have-remote-offer", "have-local-pranswer"],
            setRemoteDescription: ["have-local-offer", "have-remote-pranswer"]
          }
        }[type][action].indexOf(signalingState) !== -1;
      }
      function maybeAddCandidate(iceTransport, candidate) {
        var alreadyAdded = iceTransport.getRemoteCandidates().find(function(remoteCandidate) {
          return candidate.foundation === remoteCandidate.foundation && candidate.ip === remoteCandidate.ip && candidate.port === remoteCandidate.port && candidate.priority === remoteCandidate.priority && candidate.protocol === remoteCandidate.protocol && candidate.type === remoteCandidate.type;
        });
        if (!alreadyAdded) {
          iceTransport.addRemoteCandidate(candidate);
        }
        return !alreadyAdded;
      }
      function makeError(name, description) {
        var e = new Error(description);
        e.name = name;
        e.code = {
          NotSupportedError: 9,
          InvalidStateError: 11,
          InvalidAccessError: 15,
          TypeError: void 0,
          OperationError: void 0
        }[name];
        return e;
      }
      module.exports = function(window2, edgeVersion) {
        function addTrackToStreamAndFireEvent(track, stream) {
          stream.addTrack(track);
          stream.dispatchEvent(new window2.MediaStreamTrackEvent(
            "addtrack",
            { track }
          ));
        }
        function removeTrackFromStreamAndFireEvent(track, stream) {
          stream.removeTrack(track);
          stream.dispatchEvent(new window2.MediaStreamTrackEvent(
            "removetrack",
            { track }
          ));
        }
        function fireAddTrack(pc, track, receiver, streams) {
          var trackEvent = new Event("track");
          trackEvent.track = track;
          trackEvent.receiver = receiver;
          trackEvent.transceiver = { receiver };
          trackEvent.streams = streams;
          window2.setTimeout(function() {
            pc._dispatchEvent("track", trackEvent);
          });
        }
        var RTCPeerConnection2 = function(config) {
          var pc = this;
          var _eventTarget = document.createDocumentFragment();
          ["addEventListener", "removeEventListener", "dispatchEvent"].forEach(function(method) {
            pc[method] = _eventTarget[method].bind(_eventTarget);
          });
          this.canTrickleIceCandidates = null;
          this.needNegotiation = false;
          this.localStreams = [];
          this.remoteStreams = [];
          this._localDescription = null;
          this._remoteDescription = null;
          this.signalingState = "stable";
          this.iceConnectionState = "new";
          this.connectionState = "new";
          this.iceGatheringState = "new";
          config = JSON.parse(JSON.stringify(config || {}));
          this.usingBundle = config.bundlePolicy === "max-bundle";
          if (config.rtcpMuxPolicy === "negotiate") {
            throw makeError(
              "NotSupportedError",
              "rtcpMuxPolicy 'negotiate' is not supported"
            );
          } else if (!config.rtcpMuxPolicy) {
            config.rtcpMuxPolicy = "require";
          }
          switch (config.iceTransportPolicy) {
            case "all":
            case "relay":
              break;
            default:
              config.iceTransportPolicy = "all";
              break;
          }
          switch (config.bundlePolicy) {
            case "balanced":
            case "max-compat":
            case "max-bundle":
              break;
            default:
              config.bundlePolicy = "balanced";
              break;
          }
          config.iceServers = filterIceServers2(config.iceServers || [], edgeVersion);
          this._iceGatherers = [];
          if (config.iceCandidatePoolSize) {
            for (var i = config.iceCandidatePoolSize; i > 0; i--) {
              this._iceGatherers.push(new window2.RTCIceGatherer({
                iceServers: config.iceServers,
                gatherPolicy: config.iceTransportPolicy
              }));
            }
          } else {
            config.iceCandidatePoolSize = 0;
          }
          this._config = config;
          this.transceivers = [];
          this._sdpSessionId = SDPUtils2.generateSessionId();
          this._sdpSessionVersion = 0;
          this._dtlsRole = void 0;
          this._isClosed = false;
        };
        Object.defineProperty(RTCPeerConnection2.prototype, "localDescription", {
          configurable: true,
          get: function() {
            return this._localDescription;
          }
        });
        Object.defineProperty(RTCPeerConnection2.prototype, "remoteDescription", {
          configurable: true,
          get: function() {
            return this._remoteDescription;
          }
        });
        RTCPeerConnection2.prototype.onicecandidate = null;
        RTCPeerConnection2.prototype.onaddstream = null;
        RTCPeerConnection2.prototype.ontrack = null;
        RTCPeerConnection2.prototype.onremovestream = null;
        RTCPeerConnection2.prototype.onsignalingstatechange = null;
        RTCPeerConnection2.prototype.oniceconnectionstatechange = null;
        RTCPeerConnection2.prototype.onconnectionstatechange = null;
        RTCPeerConnection2.prototype.onicegatheringstatechange = null;
        RTCPeerConnection2.prototype.onnegotiationneeded = null;
        RTCPeerConnection2.prototype.ondatachannel = null;
        RTCPeerConnection2.prototype._dispatchEvent = function(name, event2) {
          if (this._isClosed) {
            return;
          }
          this.dispatchEvent(event2);
          if (typeof this["on" + name] === "function") {
            this["on" + name](event2);
          }
        };
        RTCPeerConnection2.prototype._emitGatheringStateChange = function() {
          var event2 = new Event("icegatheringstatechange");
          this._dispatchEvent("icegatheringstatechange", event2);
        };
        RTCPeerConnection2.prototype.getConfiguration = function() {
          return this._config;
        };
        RTCPeerConnection2.prototype.getLocalStreams = function() {
          return this.localStreams;
        };
        RTCPeerConnection2.prototype.getRemoteStreams = function() {
          return this.remoteStreams;
        };
        RTCPeerConnection2.prototype._createTransceiver = function(kind, doNotAdd) {
          var hasBundleTransport = this.transceivers.length > 0;
          var transceiver = {
            track: null,
            iceGatherer: null,
            iceTransport: null,
            dtlsTransport: null,
            localCapabilities: null,
            remoteCapabilities: null,
            rtpSender: null,
            rtpReceiver: null,
            kind,
            mid: null,
            sendEncodingParameters: null,
            recvEncodingParameters: null,
            stream: null,
            associatedRemoteMediaStreams: [],
            wantReceive: true
          };
          if (this.usingBundle && hasBundleTransport) {
            transceiver.iceTransport = this.transceivers[0].iceTransport;
            transceiver.dtlsTransport = this.transceivers[0].dtlsTransport;
          } else {
            var transports = this._createIceAndDtlsTransports();
            transceiver.iceTransport = transports.iceTransport;
            transceiver.dtlsTransport = transports.dtlsTransport;
          }
          if (!doNotAdd) {
            this.transceivers.push(transceiver);
          }
          return transceiver;
        };
        RTCPeerConnection2.prototype.addTrack = function(track, stream) {
          if (this._isClosed) {
            throw makeError(
              "InvalidStateError",
              "Attempted to call addTrack on a closed peerconnection."
            );
          }
          var alreadyExists = this.transceivers.find(function(s) {
            return s.track === track;
          });
          if (alreadyExists) {
            throw makeError("InvalidAccessError", "Track already exists.");
          }
          var transceiver;
          for (var i = 0; i < this.transceivers.length; i++) {
            if (!this.transceivers[i].track && this.transceivers[i].kind === track.kind) {
              transceiver = this.transceivers[i];
            }
          }
          if (!transceiver) {
            transceiver = this._createTransceiver(track.kind);
          }
          this._maybeFireNegotiationNeeded();
          if (this.localStreams.indexOf(stream) === -1) {
            this.localStreams.push(stream);
          }
          transceiver.track = track;
          transceiver.stream = stream;
          transceiver.rtpSender = new window2.RTCRtpSender(
            track,
            transceiver.dtlsTransport
          );
          return transceiver.rtpSender;
        };
        RTCPeerConnection2.prototype.addStream = function(stream) {
          var pc = this;
          if (edgeVersion >= 15025) {
            stream.getTracks().forEach(function(track) {
              pc.addTrack(track, stream);
            });
          } else {
            var clonedStream = stream.clone();
            stream.getTracks().forEach(function(track, idx) {
              var clonedTrack = clonedStream.getTracks()[idx];
              track.addEventListener("enabled", function(event2) {
                clonedTrack.enabled = event2.enabled;
              });
            });
            clonedStream.getTracks().forEach(function(track) {
              pc.addTrack(track, clonedStream);
            });
          }
        };
        RTCPeerConnection2.prototype.removeTrack = function(sender) {
          if (this._isClosed) {
            throw makeError(
              "InvalidStateError",
              "Attempted to call removeTrack on a closed peerconnection."
            );
          }
          if (!(sender instanceof window2.RTCRtpSender)) {
            throw new TypeError("Argument 1 of RTCPeerConnection.removeTrack does not implement interface RTCRtpSender.");
          }
          var transceiver = this.transceivers.find(function(t) {
            return t.rtpSender === sender;
          });
          if (!transceiver) {
            throw makeError(
              "InvalidAccessError",
              "Sender was not created by this connection."
            );
          }
          var stream = transceiver.stream;
          transceiver.rtpSender.stop();
          transceiver.rtpSender = null;
          transceiver.track = null;
          transceiver.stream = null;
          var localStreams = this.transceivers.map(function(t) {
            return t.stream;
          });
          if (localStreams.indexOf(stream) === -1 && this.localStreams.indexOf(stream) > -1) {
            this.localStreams.splice(this.localStreams.indexOf(stream), 1);
          }
          this._maybeFireNegotiationNeeded();
        };
        RTCPeerConnection2.prototype.removeStream = function(stream) {
          var pc = this;
          stream.getTracks().forEach(function(track) {
            var sender = pc.getSenders().find(function(s) {
              return s.track === track;
            });
            if (sender) {
              pc.removeTrack(sender);
            }
          });
        };
        RTCPeerConnection2.prototype.getSenders = function() {
          return this.transceivers.filter(function(transceiver) {
            return !!transceiver.rtpSender;
          }).map(function(transceiver) {
            return transceiver.rtpSender;
          });
        };
        RTCPeerConnection2.prototype.getReceivers = function() {
          return this.transceivers.filter(function(transceiver) {
            return !!transceiver.rtpReceiver;
          }).map(function(transceiver) {
            return transceiver.rtpReceiver;
          });
        };
        RTCPeerConnection2.prototype._createIceGatherer = function(sdpMLineIndex, usingBundle) {
          var pc = this;
          if (usingBundle && sdpMLineIndex > 0) {
            return this.transceivers[0].iceGatherer;
          } else if (this._iceGatherers.length) {
            return this._iceGatherers.shift();
          }
          var iceGatherer = new window2.RTCIceGatherer({
            iceServers: this._config.iceServers,
            gatherPolicy: this._config.iceTransportPolicy
          });
          Object.defineProperty(
            iceGatherer,
            "state",
            { value: "new", writable: true }
          );
          this.transceivers[sdpMLineIndex].bufferedCandidateEvents = [];
          this.transceivers[sdpMLineIndex].bufferCandidates = function(event2) {
            var end = !event2.candidate || Object.keys(event2.candidate).length === 0;
            iceGatherer.state = end ? "completed" : "gathering";
            if (pc.transceivers[sdpMLineIndex].bufferedCandidateEvents !== null) {
              pc.transceivers[sdpMLineIndex].bufferedCandidateEvents.push(event2);
            }
          };
          iceGatherer.addEventListener(
            "localcandidate",
            this.transceivers[sdpMLineIndex].bufferCandidates
          );
          return iceGatherer;
        };
        RTCPeerConnection2.prototype._gather = function(mid, sdpMLineIndex) {
          var pc = this;
          var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
          if (iceGatherer.onlocalcandidate) {
            return;
          }
          var bufferedCandidateEvents = this.transceivers[sdpMLineIndex].bufferedCandidateEvents;
          this.transceivers[sdpMLineIndex].bufferedCandidateEvents = null;
          iceGatherer.removeEventListener(
            "localcandidate",
            this.transceivers[sdpMLineIndex].bufferCandidates
          );
          iceGatherer.onlocalcandidate = function(evt) {
            if (pc.usingBundle && sdpMLineIndex > 0) {
              return;
            }
            var event2 = new Event("icecandidate");
            event2.candidate = { sdpMid: mid, sdpMLineIndex };
            var cand = evt.candidate;
            var end = !cand || Object.keys(cand).length === 0;
            if (end) {
              if (iceGatherer.state === "new" || iceGatherer.state === "gathering") {
                iceGatherer.state = "completed";
              }
            } else {
              if (iceGatherer.state === "new") {
                iceGatherer.state = "gathering";
              }
              cand.component = 1;
              cand.ufrag = iceGatherer.getLocalParameters().usernameFragment;
              var serializedCandidate = SDPUtils2.writeCandidate(cand);
              event2.candidate = Object.assign(
                event2.candidate,
                SDPUtils2.parseCandidate(serializedCandidate)
              );
              event2.candidate.candidate = serializedCandidate;
              event2.candidate.toJSON = function() {
                return {
                  candidate: event2.candidate.candidate,
                  sdpMid: event2.candidate.sdpMid,
                  sdpMLineIndex: event2.candidate.sdpMLineIndex,
                  usernameFragment: event2.candidate.usernameFragment
                };
              };
            }
            var sections = SDPUtils2.getMediaSections(pc._localDescription.sdp);
            if (!end) {
              sections[event2.candidate.sdpMLineIndex] += "a=" + event2.candidate.candidate + "\r\n";
            } else {
              sections[event2.candidate.sdpMLineIndex] += "a=end-of-candidates\r\n";
            }
            pc._localDescription.sdp = SDPUtils2.getDescription(pc._localDescription.sdp) + sections.join("");
            var complete = pc.transceivers.every(function(transceiver) {
              return transceiver.iceGatherer && transceiver.iceGatherer.state === "completed";
            });
            if (pc.iceGatheringState !== "gathering") {
              pc.iceGatheringState = "gathering";
              pc._emitGatheringStateChange();
            }
            if (!end) {
              pc._dispatchEvent("icecandidate", event2);
            }
            if (complete) {
              pc._dispatchEvent("icecandidate", new Event("icecandidate"));
              pc.iceGatheringState = "complete";
              pc._emitGatheringStateChange();
            }
          };
          window2.setTimeout(function() {
            bufferedCandidateEvents.forEach(function(e) {
              iceGatherer.onlocalcandidate(e);
            });
          }, 0);
        };
        RTCPeerConnection2.prototype._createIceAndDtlsTransports = function() {
          var pc = this;
          var iceTransport = new window2.RTCIceTransport(null);
          iceTransport.onicestatechange = function() {
            pc._updateIceConnectionState();
            pc._updateConnectionState();
          };
          var dtlsTransport = new window2.RTCDtlsTransport(iceTransport);
          dtlsTransport.ondtlsstatechange = function() {
            pc._updateConnectionState();
          };
          dtlsTransport.onerror = function() {
            Object.defineProperty(
              dtlsTransport,
              "state",
              { value: "failed", writable: true }
            );
            pc._updateConnectionState();
          };
          return {
            iceTransport,
            dtlsTransport
          };
        };
        RTCPeerConnection2.prototype._disposeIceAndDtlsTransports = function(sdpMLineIndex) {
          var iceGatherer = this.transceivers[sdpMLineIndex].iceGatherer;
          if (iceGatherer) {
            delete iceGatherer.onlocalcandidate;
            delete this.transceivers[sdpMLineIndex].iceGatherer;
          }
          var iceTransport = this.transceivers[sdpMLineIndex].iceTransport;
          if (iceTransport) {
            delete iceTransport.onicestatechange;
            delete this.transceivers[sdpMLineIndex].iceTransport;
          }
          var dtlsTransport = this.transceivers[sdpMLineIndex].dtlsTransport;
          if (dtlsTransport) {
            delete dtlsTransport.ondtlsstatechange;
            delete dtlsTransport.onerror;
            delete this.transceivers[sdpMLineIndex].dtlsTransport;
          }
        };
        RTCPeerConnection2.prototype._transceive = function(transceiver, send5, recv) {
          var params = getCommonCapabilities(
            transceiver.localCapabilities,
            transceiver.remoteCapabilities
          );
          if (send5 && transceiver.rtpSender) {
            params.encodings = transceiver.sendEncodingParameters;
            params.rtcp = {
              cname: SDPUtils2.localCName,
              compound: transceiver.rtcpParameters.compound
            };
            if (transceiver.recvEncodingParameters.length) {
              params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
            }
            transceiver.rtpSender.send(params);
          }
          if (recv && transceiver.rtpReceiver && params.codecs.length > 0) {
            if (transceiver.kind === "video" && transceiver.recvEncodingParameters && edgeVersion < 15019) {
              transceiver.recvEncodingParameters.forEach(function(p) {
                delete p.rtx;
              });
            }
            if (transceiver.recvEncodingParameters.length) {
              params.encodings = transceiver.recvEncodingParameters;
            } else {
              params.encodings = [{}];
            }
            params.rtcp = {
              compound: transceiver.rtcpParameters.compound
            };
            if (transceiver.rtcpParameters.cname) {
              params.rtcp.cname = transceiver.rtcpParameters.cname;
            }
            if (transceiver.sendEncodingParameters.length) {
              params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
            }
            transceiver.rtpReceiver.receive(params);
          }
        };
        RTCPeerConnection2.prototype.setLocalDescription = function(description) {
          var pc = this;
          if (["offer", "answer"].indexOf(description.type) === -1) {
            return Promise.reject(makeError(
              "TypeError",
              'Unsupported type "' + description.type + '"'
            ));
          }
          if (!isActionAllowedInSignalingState(
            "setLocalDescription",
            description.type,
            pc.signalingState
          ) || pc._isClosed) {
            return Promise.reject(makeError(
              "InvalidStateError",
              "Can not set local " + description.type + " in state " + pc.signalingState
            ));
          }
          var sections;
          var sessionpart;
          if (description.type === "offer") {
            sections = SDPUtils2.splitSections(description.sdp);
            sessionpart = sections.shift();
            sections.forEach(function(mediaSection, sdpMLineIndex) {
              var caps = SDPUtils2.parseRtpParameters(mediaSection);
              pc.transceivers[sdpMLineIndex].localCapabilities = caps;
            });
            pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
              pc._gather(transceiver.mid, sdpMLineIndex);
            });
          } else if (description.type === "answer") {
            sections = SDPUtils2.splitSections(pc._remoteDescription.sdp);
            sessionpart = sections.shift();
            var isIceLite = SDPUtils2.matchPrefix(
              sessionpart,
              "a=ice-lite"
            ).length > 0;
            sections.forEach(function(mediaSection, sdpMLineIndex) {
              var transceiver = pc.transceivers[sdpMLineIndex];
              var iceGatherer = transceiver.iceGatherer;
              var iceTransport = transceiver.iceTransport;
              var dtlsTransport = transceiver.dtlsTransport;
              var localCapabilities = transceiver.localCapabilities;
              var remoteCapabilities = transceiver.remoteCapabilities;
              var rejected = SDPUtils2.isRejected(mediaSection) && SDPUtils2.matchPrefix(mediaSection, "a=bundle-only").length === 0;
              if (!rejected && !transceiver.rejected) {
                var remoteIceParameters = SDPUtils2.getIceParameters(
                  mediaSection,
                  sessionpart
                );
                var remoteDtlsParameters = SDPUtils2.getDtlsParameters(
                  mediaSection,
                  sessionpart
                );
                if (isIceLite) {
                  remoteDtlsParameters.role = "server";
                }
                if (!pc.usingBundle || sdpMLineIndex === 0) {
                  pc._gather(transceiver.mid, sdpMLineIndex);
                  if (iceTransport.state === "new") {
                    iceTransport.start(
                      iceGatherer,
                      remoteIceParameters,
                      isIceLite ? "controlling" : "controlled"
                    );
                  }
                  if (dtlsTransport.state === "new") {
                    dtlsTransport.start(remoteDtlsParameters);
                  }
                }
                var params = getCommonCapabilities(
                  localCapabilities,
                  remoteCapabilities
                );
                pc._transceive(
                  transceiver,
                  params.codecs.length > 0,
                  false
                );
              }
            });
          }
          pc._localDescription = {
            type: description.type,
            sdp: description.sdp
          };
          if (description.type === "offer") {
            pc._updateSignalingState("have-local-offer");
          } else {
            pc._updateSignalingState("stable");
          }
          return Promise.resolve();
        };
        RTCPeerConnection2.prototype.setRemoteDescription = function(description) {
          var pc = this;
          if (["offer", "answer"].indexOf(description.type) === -1) {
            return Promise.reject(makeError(
              "TypeError",
              'Unsupported type "' + description.type + '"'
            ));
          }
          if (!isActionAllowedInSignalingState(
            "setRemoteDescription",
            description.type,
            pc.signalingState
          ) || pc._isClosed) {
            return Promise.reject(makeError(
              "InvalidStateError",
              "Can not set remote " + description.type + " in state " + pc.signalingState
            ));
          }
          var streams = {};
          pc.remoteStreams.forEach(function(stream) {
            streams[stream.id] = stream;
          });
          var receiverList = [];
          var sections = SDPUtils2.splitSections(description.sdp);
          var sessionpart = sections.shift();
          var isIceLite = SDPUtils2.matchPrefix(
            sessionpart,
            "a=ice-lite"
          ).length > 0;
          var usingBundle = SDPUtils2.matchPrefix(
            sessionpart,
            "a=group:BUNDLE "
          ).length > 0;
          pc.usingBundle = usingBundle;
          var iceOptions = SDPUtils2.matchPrefix(
            sessionpart,
            "a=ice-options:"
          )[0];
          if (iceOptions) {
            pc.canTrickleIceCandidates = iceOptions.substr(14).split(" ").indexOf("trickle") >= 0;
          } else {
            pc.canTrickleIceCandidates = false;
          }
          sections.forEach(function(mediaSection, sdpMLineIndex) {
            var lines = SDPUtils2.splitLines(mediaSection);
            var kind = SDPUtils2.getKind(mediaSection);
            var rejected = SDPUtils2.isRejected(mediaSection) && SDPUtils2.matchPrefix(mediaSection, "a=bundle-only").length === 0;
            var protocol = lines[0].substr(2).split(" ")[2];
            var direction = SDPUtils2.getDirection(mediaSection, sessionpart);
            var remoteMsid = SDPUtils2.parseMsid(mediaSection);
            var mid = SDPUtils2.getMid(mediaSection) || SDPUtils2.generateIdentifier();
            if (rejected || kind === "application" && (protocol === "DTLS/SCTP" || protocol === "UDP/DTLS/SCTP")) {
              pc.transceivers[sdpMLineIndex] = {
                mid,
                kind,
                protocol,
                rejected: true
              };
              return;
            }
            if (!rejected && pc.transceivers[sdpMLineIndex] && pc.transceivers[sdpMLineIndex].rejected) {
              pc.transceivers[sdpMLineIndex] = pc._createTransceiver(kind, true);
            }
            var transceiver;
            var iceGatherer;
            var iceTransport;
            var dtlsTransport;
            var rtpReceiver;
            var sendEncodingParameters;
            var recvEncodingParameters;
            var localCapabilities;
            var track;
            var remoteCapabilities = SDPUtils2.parseRtpParameters(mediaSection);
            var remoteIceParameters;
            var remoteDtlsParameters;
            if (!rejected) {
              remoteIceParameters = SDPUtils2.getIceParameters(
                mediaSection,
                sessionpart
              );
              remoteDtlsParameters = SDPUtils2.getDtlsParameters(
                mediaSection,
                sessionpart
              );
              remoteDtlsParameters.role = "client";
            }
            recvEncodingParameters = SDPUtils2.parseRtpEncodingParameters(mediaSection);
            var rtcpParameters = SDPUtils2.parseRtcpParameters(mediaSection);
            var isComplete = SDPUtils2.matchPrefix(
              mediaSection,
              "a=end-of-candidates",
              sessionpart
            ).length > 0;
            var cands = SDPUtils2.matchPrefix(mediaSection, "a=candidate:").map(function(cand) {
              return SDPUtils2.parseCandidate(cand);
            }).filter(function(cand) {
              return cand.component === 1;
            });
            if ((description.type === "offer" || description.type === "answer") && !rejected && usingBundle && sdpMLineIndex > 0 && pc.transceivers[sdpMLineIndex]) {
              pc._disposeIceAndDtlsTransports(sdpMLineIndex);
              pc.transceivers[sdpMLineIndex].iceGatherer = pc.transceivers[0].iceGatherer;
              pc.transceivers[sdpMLineIndex].iceTransport = pc.transceivers[0].iceTransport;
              pc.transceivers[sdpMLineIndex].dtlsTransport = pc.transceivers[0].dtlsTransport;
              if (pc.transceivers[sdpMLineIndex].rtpSender) {
                pc.transceivers[sdpMLineIndex].rtpSender.setTransport(
                  pc.transceivers[0].dtlsTransport
                );
              }
              if (pc.transceivers[sdpMLineIndex].rtpReceiver) {
                pc.transceivers[sdpMLineIndex].rtpReceiver.setTransport(
                  pc.transceivers[0].dtlsTransport
                );
              }
            }
            if (description.type === "offer" && !rejected) {
              transceiver = pc.transceivers[sdpMLineIndex] || pc._createTransceiver(kind);
              transceiver.mid = mid;
              if (!transceiver.iceGatherer) {
                transceiver.iceGatherer = pc._createIceGatherer(
                  sdpMLineIndex,
                  usingBundle
                );
              }
              if (cands.length && transceiver.iceTransport.state === "new") {
                if (isComplete && (!usingBundle || sdpMLineIndex === 0)) {
                  transceiver.iceTransport.setRemoteCandidates(cands);
                } else {
                  cands.forEach(function(candidate) {
                    maybeAddCandidate(transceiver.iceTransport, candidate);
                  });
                }
              }
              localCapabilities = window2.RTCRtpReceiver.getCapabilities(kind);
              if (edgeVersion < 15019) {
                localCapabilities.codecs = localCapabilities.codecs.filter(
                  function(codec) {
                    return codec.name !== "rtx";
                  }
                );
              }
              sendEncodingParameters = transceiver.sendEncodingParameters || [{
                ssrc: (2 * sdpMLineIndex + 2) * 1001
              }];
              var isNewTrack = false;
              if (direction === "sendrecv" || direction === "sendonly") {
                isNewTrack = !transceiver.rtpReceiver;
                rtpReceiver = transceiver.rtpReceiver || new window2.RTCRtpReceiver(transceiver.dtlsTransport, kind);
                if (isNewTrack) {
                  var stream;
                  track = rtpReceiver.track;
                  if (remoteMsid && remoteMsid.stream === "-") {
                  } else if (remoteMsid) {
                    if (!streams[remoteMsid.stream]) {
                      streams[remoteMsid.stream] = new window2.MediaStream();
                      Object.defineProperty(streams[remoteMsid.stream], "id", {
                        get: function() {
                          return remoteMsid.stream;
                        }
                      });
                    }
                    Object.defineProperty(track, "id", {
                      get: function() {
                        return remoteMsid.track;
                      }
                    });
                    stream = streams[remoteMsid.stream];
                  } else {
                    if (!streams.default) {
                      streams.default = new window2.MediaStream();
                    }
                    stream = streams.default;
                  }
                  if (stream) {
                    addTrackToStreamAndFireEvent(track, stream);
                    transceiver.associatedRemoteMediaStreams.push(stream);
                  }
                  receiverList.push([track, rtpReceiver, stream]);
                }
              } else if (transceiver.rtpReceiver && transceiver.rtpReceiver.track) {
                transceiver.associatedRemoteMediaStreams.forEach(function(s) {
                  var nativeTrack = s.getTracks().find(function(t) {
                    return t.id === transceiver.rtpReceiver.track.id;
                  });
                  if (nativeTrack) {
                    removeTrackFromStreamAndFireEvent(nativeTrack, s);
                  }
                });
                transceiver.associatedRemoteMediaStreams = [];
              }
              transceiver.localCapabilities = localCapabilities;
              transceiver.remoteCapabilities = remoteCapabilities;
              transceiver.rtpReceiver = rtpReceiver;
              transceiver.rtcpParameters = rtcpParameters;
              transceiver.sendEncodingParameters = sendEncodingParameters;
              transceiver.recvEncodingParameters = recvEncodingParameters;
              pc._transceive(
                pc.transceivers[sdpMLineIndex],
                false,
                isNewTrack
              );
            } else if (description.type === "answer" && !rejected) {
              transceiver = pc.transceivers[sdpMLineIndex];
              iceGatherer = transceiver.iceGatherer;
              iceTransport = transceiver.iceTransport;
              dtlsTransport = transceiver.dtlsTransport;
              rtpReceiver = transceiver.rtpReceiver;
              sendEncodingParameters = transceiver.sendEncodingParameters;
              localCapabilities = transceiver.localCapabilities;
              pc.transceivers[sdpMLineIndex].recvEncodingParameters = recvEncodingParameters;
              pc.transceivers[sdpMLineIndex].remoteCapabilities = remoteCapabilities;
              pc.transceivers[sdpMLineIndex].rtcpParameters = rtcpParameters;
              if (cands.length && iceTransport.state === "new") {
                if ((isIceLite || isComplete) && (!usingBundle || sdpMLineIndex === 0)) {
                  iceTransport.setRemoteCandidates(cands);
                } else {
                  cands.forEach(function(candidate) {
                    maybeAddCandidate(transceiver.iceTransport, candidate);
                  });
                }
              }
              if (!usingBundle || sdpMLineIndex === 0) {
                if (iceTransport.state === "new") {
                  iceTransport.start(
                    iceGatherer,
                    remoteIceParameters,
                    "controlling"
                  );
                }
                if (dtlsTransport.state === "new") {
                  dtlsTransport.start(remoteDtlsParameters);
                }
              }
              var commonCapabilities = getCommonCapabilities(
                transceiver.localCapabilities,
                transceiver.remoteCapabilities
              );
              var hasRtx = commonCapabilities.codecs.filter(function(c) {
                return c.name.toLowerCase() === "rtx";
              }).length;
              if (!hasRtx && transceiver.sendEncodingParameters[0].rtx) {
                delete transceiver.sendEncodingParameters[0].rtx;
              }
              pc._transceive(
                transceiver,
                direction === "sendrecv" || direction === "recvonly",
                direction === "sendrecv" || direction === "sendonly"
              );
              if (rtpReceiver && (direction === "sendrecv" || direction === "sendonly")) {
                track = rtpReceiver.track;
                if (remoteMsid) {
                  if (!streams[remoteMsid.stream]) {
                    streams[remoteMsid.stream] = new window2.MediaStream();
                  }
                  addTrackToStreamAndFireEvent(track, streams[remoteMsid.stream]);
                  receiverList.push([track, rtpReceiver, streams[remoteMsid.stream]]);
                } else {
                  if (!streams.default) {
                    streams.default = new window2.MediaStream();
                  }
                  addTrackToStreamAndFireEvent(track, streams.default);
                  receiverList.push([track, rtpReceiver, streams.default]);
                }
              } else {
                delete transceiver.rtpReceiver;
              }
            }
          });
          if (pc._dtlsRole === void 0) {
            pc._dtlsRole = description.type === "offer" ? "active" : "passive";
          }
          pc._remoteDescription = {
            type: description.type,
            sdp: description.sdp
          };
          if (description.type === "offer") {
            pc._updateSignalingState("have-remote-offer");
          } else {
            pc._updateSignalingState("stable");
          }
          Object.keys(streams).forEach(function(sid) {
            var stream = streams[sid];
            if (stream.getTracks().length) {
              if (pc.remoteStreams.indexOf(stream) === -1) {
                pc.remoteStreams.push(stream);
                var event2 = new Event("addstream");
                event2.stream = stream;
                window2.setTimeout(function() {
                  pc._dispatchEvent("addstream", event2);
                });
              }
              receiverList.forEach(function(item) {
                var track = item[0];
                var receiver = item[1];
                if (stream.id !== item[2].id) {
                  return;
                }
                fireAddTrack(pc, track, receiver, [stream]);
              });
            }
          });
          receiverList.forEach(function(item) {
            if (item[2]) {
              return;
            }
            fireAddTrack(pc, item[0], item[1], []);
          });
          window2.setTimeout(function() {
            if (!(pc && pc.transceivers)) {
              return;
            }
            pc.transceivers.forEach(function(transceiver) {
              if (transceiver.iceTransport && transceiver.iceTransport.state === "new" && transceiver.iceTransport.getRemoteCandidates().length > 0) {
                console.warn("Timeout for addRemoteCandidate. Consider sending an end-of-candidates notification");
                transceiver.iceTransport.addRemoteCandidate({});
              }
            });
          }, 4e3);
          return Promise.resolve();
        };
        RTCPeerConnection2.prototype.close = function() {
          this.transceivers.forEach(function(transceiver) {
            if (transceiver.iceTransport) {
              transceiver.iceTransport.stop();
            }
            if (transceiver.dtlsTransport) {
              transceiver.dtlsTransport.stop();
            }
            if (transceiver.rtpSender) {
              transceiver.rtpSender.stop();
            }
            if (transceiver.rtpReceiver) {
              transceiver.rtpReceiver.stop();
            }
          });
          this._isClosed = true;
          this._updateSignalingState("closed");
        };
        RTCPeerConnection2.prototype._updateSignalingState = function(newState) {
          this.signalingState = newState;
          var event2 = new Event("signalingstatechange");
          this._dispatchEvent("signalingstatechange", event2);
        };
        RTCPeerConnection2.prototype._maybeFireNegotiationNeeded = function() {
          var pc = this;
          if (this.signalingState !== "stable" || this.needNegotiation === true) {
            return;
          }
          this.needNegotiation = true;
          window2.setTimeout(function() {
            if (pc.needNegotiation) {
              pc.needNegotiation = false;
              var event2 = new Event("negotiationneeded");
              pc._dispatchEvent("negotiationneeded", event2);
            }
          }, 0);
        };
        RTCPeerConnection2.prototype._updateIceConnectionState = function() {
          var newState;
          var states = {
            "new": 0,
            closed: 0,
            checking: 0,
            connected: 0,
            completed: 0,
            disconnected: 0,
            failed: 0
          };
          this.transceivers.forEach(function(transceiver) {
            if (transceiver.iceTransport && !transceiver.rejected) {
              states[transceiver.iceTransport.state]++;
            }
          });
          newState = "new";
          if (states.failed > 0) {
            newState = "failed";
          } else if (states.checking > 0) {
            newState = "checking";
          } else if (states.disconnected > 0) {
            newState = "disconnected";
          } else if (states.new > 0) {
            newState = "new";
          } else if (states.connected > 0) {
            newState = "connected";
          } else if (states.completed > 0) {
            newState = "completed";
          }
          if (newState !== this.iceConnectionState) {
            this.iceConnectionState = newState;
            var event2 = new Event("iceconnectionstatechange");
            this._dispatchEvent("iceconnectionstatechange", event2);
          }
        };
        RTCPeerConnection2.prototype._updateConnectionState = function() {
          var newState;
          var states = {
            "new": 0,
            closed: 0,
            connecting: 0,
            connected: 0,
            completed: 0,
            disconnected: 0,
            failed: 0
          };
          this.transceivers.forEach(function(transceiver) {
            if (transceiver.iceTransport && transceiver.dtlsTransport && !transceiver.rejected) {
              states[transceiver.iceTransport.state]++;
              states[transceiver.dtlsTransport.state]++;
            }
          });
          states.connected += states.completed;
          newState = "new";
          if (states.failed > 0) {
            newState = "failed";
          } else if (states.connecting > 0) {
            newState = "connecting";
          } else if (states.disconnected > 0) {
            newState = "disconnected";
          } else if (states.new > 0) {
            newState = "new";
          } else if (states.connected > 0) {
            newState = "connected";
          }
          if (newState !== this.connectionState) {
            this.connectionState = newState;
            var event2 = new Event("connectionstatechange");
            this._dispatchEvent("connectionstatechange", event2);
          }
        };
        RTCPeerConnection2.prototype.createOffer = function() {
          var pc = this;
          if (pc._isClosed) {
            return Promise.reject(makeError(
              "InvalidStateError",
              "Can not call createOffer after close"
            ));
          }
          var numAudioTracks = pc.transceivers.filter(function(t) {
            return t.kind === "audio";
          }).length;
          var numVideoTracks = pc.transceivers.filter(function(t) {
            return t.kind === "video";
          }).length;
          var offerOptions = arguments[0];
          if (offerOptions) {
            if (offerOptions.mandatory || offerOptions.optional) {
              throw new TypeError(
                "Legacy mandatory/optional constraints not supported."
              );
            }
            if (offerOptions.offerToReceiveAudio !== void 0) {
              if (offerOptions.offerToReceiveAudio === true) {
                numAudioTracks = 1;
              } else if (offerOptions.offerToReceiveAudio === false) {
                numAudioTracks = 0;
              } else {
                numAudioTracks = offerOptions.offerToReceiveAudio;
              }
            }
            if (offerOptions.offerToReceiveVideo !== void 0) {
              if (offerOptions.offerToReceiveVideo === true) {
                numVideoTracks = 1;
              } else if (offerOptions.offerToReceiveVideo === false) {
                numVideoTracks = 0;
              } else {
                numVideoTracks = offerOptions.offerToReceiveVideo;
              }
            }
          }
          pc.transceivers.forEach(function(transceiver) {
            if (transceiver.kind === "audio") {
              numAudioTracks--;
              if (numAudioTracks < 0) {
                transceiver.wantReceive = false;
              }
            } else if (transceiver.kind === "video") {
              numVideoTracks--;
              if (numVideoTracks < 0) {
                transceiver.wantReceive = false;
              }
            }
          });
          while (numAudioTracks > 0 || numVideoTracks > 0) {
            if (numAudioTracks > 0) {
              pc._createTransceiver("audio");
              numAudioTracks--;
            }
            if (numVideoTracks > 0) {
              pc._createTransceiver("video");
              numVideoTracks--;
            }
          }
          var sdp = SDPUtils2.writeSessionBoilerplate(
            pc._sdpSessionId,
            pc._sdpSessionVersion++
          );
          pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
            var track = transceiver.track;
            var kind = transceiver.kind;
            var mid = transceiver.mid || SDPUtils2.generateIdentifier();
            transceiver.mid = mid;
            if (!transceiver.iceGatherer) {
              transceiver.iceGatherer = pc._createIceGatherer(
                sdpMLineIndex,
                pc.usingBundle
              );
            }
            var localCapabilities = window2.RTCRtpSender.getCapabilities(kind);
            if (edgeVersion < 15019) {
              localCapabilities.codecs = localCapabilities.codecs.filter(
                function(codec) {
                  return codec.name !== "rtx";
                }
              );
            }
            localCapabilities.codecs.forEach(function(codec) {
              if (codec.name === "H264" && codec.parameters["level-asymmetry-allowed"] === void 0) {
                codec.parameters["level-asymmetry-allowed"] = "1";
              }
              if (transceiver.remoteCapabilities && transceiver.remoteCapabilities.codecs) {
                transceiver.remoteCapabilities.codecs.forEach(function(remoteCodec) {
                  if (codec.name.toLowerCase() === remoteCodec.name.toLowerCase() && codec.clockRate === remoteCodec.clockRate) {
                    codec.preferredPayloadType = remoteCodec.payloadType;
                  }
                });
              }
            });
            localCapabilities.headerExtensions.forEach(function(hdrExt) {
              var remoteExtensions = transceiver.remoteCapabilities && transceiver.remoteCapabilities.headerExtensions || [];
              remoteExtensions.forEach(function(rHdrExt) {
                if (hdrExt.uri === rHdrExt.uri) {
                  hdrExt.id = rHdrExt.id;
                }
              });
            });
            var sendEncodingParameters = transceiver.sendEncodingParameters || [{
              ssrc: (2 * sdpMLineIndex + 1) * 1001
            }];
            if (track) {
              if (edgeVersion >= 15019 && kind === "video" && !sendEncodingParameters[0].rtx) {
                sendEncodingParameters[0].rtx = {
                  ssrc: sendEncodingParameters[0].ssrc + 1
                };
              }
            }
            if (transceiver.wantReceive) {
              transceiver.rtpReceiver = new window2.RTCRtpReceiver(
                transceiver.dtlsTransport,
                kind
              );
            }
            transceiver.localCapabilities = localCapabilities;
            transceiver.sendEncodingParameters = sendEncodingParameters;
          });
          if (pc._config.bundlePolicy !== "max-compat") {
            sdp += "a=group:BUNDLE " + pc.transceivers.map(function(t) {
              return t.mid;
            }).join(" ") + "\r\n";
          }
          sdp += "a=ice-options:trickle\r\n";
          pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
            sdp += writeMediaSection(
              transceiver,
              transceiver.localCapabilities,
              "offer",
              transceiver.stream,
              pc._dtlsRole
            );
            sdp += "a=rtcp-rsize\r\n";
            if (transceiver.iceGatherer && pc.iceGatheringState !== "new" && (sdpMLineIndex === 0 || !pc.usingBundle)) {
              transceiver.iceGatherer.getLocalCandidates().forEach(function(cand) {
                cand.component = 1;
                sdp += "a=" + SDPUtils2.writeCandidate(cand) + "\r\n";
              });
              if (transceiver.iceGatherer.state === "completed") {
                sdp += "a=end-of-candidates\r\n";
              }
            }
          });
          var desc = new window2.RTCSessionDescription({
            type: "offer",
            sdp
          });
          return Promise.resolve(desc);
        };
        RTCPeerConnection2.prototype.createAnswer = function() {
          var pc = this;
          if (pc._isClosed) {
            return Promise.reject(makeError(
              "InvalidStateError",
              "Can not call createAnswer after close"
            ));
          }
          if (!(pc.signalingState === "have-remote-offer" || pc.signalingState === "have-local-pranswer")) {
            return Promise.reject(makeError(
              "InvalidStateError",
              "Can not call createAnswer in signalingState " + pc.signalingState
            ));
          }
          var sdp = SDPUtils2.writeSessionBoilerplate(
            pc._sdpSessionId,
            pc._sdpSessionVersion++
          );
          if (pc.usingBundle) {
            sdp += "a=group:BUNDLE " + pc.transceivers.map(function(t) {
              return t.mid;
            }).join(" ") + "\r\n";
          }
          sdp += "a=ice-options:trickle\r\n";
          var mediaSectionsInOffer = SDPUtils2.getMediaSections(
            pc._remoteDescription.sdp
          ).length;
          pc.transceivers.forEach(function(transceiver, sdpMLineIndex) {
            if (sdpMLineIndex + 1 > mediaSectionsInOffer) {
              return;
            }
            if (transceiver.rejected) {
              if (transceiver.kind === "application") {
                if (transceiver.protocol === "DTLS/SCTP") {
                  sdp += "m=application 0 DTLS/SCTP 5000\r\n";
                } else {
                  sdp += "m=application 0 " + transceiver.protocol + " webrtc-datachannel\r\n";
                }
              } else if (transceiver.kind === "audio") {
                sdp += "m=audio 0 UDP/TLS/RTP/SAVPF 0\r\na=rtpmap:0 PCMU/8000\r\n";
              } else if (transceiver.kind === "video") {
                sdp += "m=video 0 UDP/TLS/RTP/SAVPF 120\r\na=rtpmap:120 VP8/90000\r\n";
              }
              sdp += "c=IN IP4 0.0.0.0\r\na=inactive\r\na=mid:" + transceiver.mid + "\r\n";
              return;
            }
            if (transceiver.stream) {
              var localTrack;
              if (transceiver.kind === "audio") {
                localTrack = transceiver.stream.getAudioTracks()[0];
              } else if (transceiver.kind === "video") {
                localTrack = transceiver.stream.getVideoTracks()[0];
              }
              if (localTrack) {
                if (edgeVersion >= 15019 && transceiver.kind === "video" && !transceiver.sendEncodingParameters[0].rtx) {
                  transceiver.sendEncodingParameters[0].rtx = {
                    ssrc: transceiver.sendEncodingParameters[0].ssrc + 1
                  };
                }
              }
            }
            var commonCapabilities = getCommonCapabilities(
              transceiver.localCapabilities,
              transceiver.remoteCapabilities
            );
            var hasRtx = commonCapabilities.codecs.filter(function(c) {
              return c.name.toLowerCase() === "rtx";
            }).length;
            if (!hasRtx && transceiver.sendEncodingParameters[0].rtx) {
              delete transceiver.sendEncodingParameters[0].rtx;
            }
            sdp += writeMediaSection(
              transceiver,
              commonCapabilities,
              "answer",
              transceiver.stream,
              pc._dtlsRole
            );
            if (transceiver.rtcpParameters && transceiver.rtcpParameters.reducedSize) {
              sdp += "a=rtcp-rsize\r\n";
            }
          });
          var desc = new window2.RTCSessionDescription({
            type: "answer",
            sdp
          });
          return Promise.resolve(desc);
        };
        RTCPeerConnection2.prototype.addIceCandidate = function(candidate) {
          var pc = this;
          var sections;
          if (candidate && !(candidate.sdpMLineIndex !== void 0 || candidate.sdpMid)) {
            return Promise.reject(new TypeError("sdpMLineIndex or sdpMid required"));
          }
          return new Promise(function(resolve, reject) {
            if (!pc._remoteDescription) {
              return reject(makeError(
                "InvalidStateError",
                "Can not add ICE candidate without a remote description"
              ));
            } else if (!candidate || candidate.candidate === "") {
              for (var j = 0; j < pc.transceivers.length; j++) {
                if (pc.transceivers[j].rejected) {
                  continue;
                }
                pc.transceivers[j].iceTransport.addRemoteCandidate({});
                sections = SDPUtils2.getMediaSections(pc._remoteDescription.sdp);
                sections[j] += "a=end-of-candidates\r\n";
                pc._remoteDescription.sdp = SDPUtils2.getDescription(pc._remoteDescription.sdp) + sections.join("");
                if (pc.usingBundle) {
                  break;
                }
              }
            } else {
              var sdpMLineIndex = candidate.sdpMLineIndex;
              if (candidate.sdpMid) {
                for (var i = 0; i < pc.transceivers.length; i++) {
                  if (pc.transceivers[i].mid === candidate.sdpMid) {
                    sdpMLineIndex = i;
                    break;
                  }
                }
              }
              var transceiver = pc.transceivers[sdpMLineIndex];
              if (transceiver) {
                if (transceiver.rejected) {
                  return resolve();
                }
                var cand = Object.keys(candidate.candidate).length > 0 ? SDPUtils2.parseCandidate(candidate.candidate) : {};
                if (cand.protocol === "tcp" && (cand.port === 0 || cand.port === 9)) {
                  return resolve();
                }
                if (cand.component && cand.component !== 1) {
                  return resolve();
                }
                if (sdpMLineIndex === 0 || sdpMLineIndex > 0 && transceiver.iceTransport !== pc.transceivers[0].iceTransport) {
                  if (!maybeAddCandidate(transceiver.iceTransport, cand)) {
                    return reject(makeError(
                      "OperationError",
                      "Can not add ICE candidate"
                    ));
                  }
                }
                var candidateString = candidate.candidate.trim();
                if (candidateString.indexOf("a=") === 0) {
                  candidateString = candidateString.substr(2);
                }
                sections = SDPUtils2.getMediaSections(pc._remoteDescription.sdp);
                sections[sdpMLineIndex] += "a=" + (cand.type ? candidateString : "end-of-candidates") + "\r\n";
                pc._remoteDescription.sdp = SDPUtils2.getDescription(pc._remoteDescription.sdp) + sections.join("");
              } else {
                return reject(makeError(
                  "OperationError",
                  "Can not add ICE candidate"
                ));
              }
            }
            resolve();
          });
        };
        RTCPeerConnection2.prototype.getStats = function(selector) {
          if (selector && selector instanceof window2.MediaStreamTrack) {
            var senderOrReceiver = null;
            this.transceivers.forEach(function(transceiver) {
              if (transceiver.rtpSender && transceiver.rtpSender.track === selector) {
                senderOrReceiver = transceiver.rtpSender;
              } else if (transceiver.rtpReceiver && transceiver.rtpReceiver.track === selector) {
                senderOrReceiver = transceiver.rtpReceiver;
              }
            });
            if (!senderOrReceiver) {
              throw makeError("InvalidAccessError", "Invalid selector.");
            }
            return senderOrReceiver.getStats();
          }
          var promises = [];
          this.transceivers.forEach(function(transceiver) {
            [
              "rtpSender",
              "rtpReceiver",
              "iceGatherer",
              "iceTransport",
              "dtlsTransport"
            ].forEach(function(method) {
              if (transceiver[method]) {
                promises.push(transceiver[method].getStats());
              }
            });
          });
          return Promise.all(promises).then(function(allStats) {
            var results = /* @__PURE__ */ new Map();
            allStats.forEach(function(stats) {
              stats.forEach(function(stat) {
                results.set(stat.id, stat);
              });
            });
            return results;
          });
        };
        var ortcObjects = [
          "RTCRtpSender",
          "RTCRtpReceiver",
          "RTCIceGatherer",
          "RTCIceTransport",
          "RTCDtlsTransport"
        ];
        ortcObjects.forEach(function(ortcObjectName) {
          var obj = window2[ortcObjectName];
          if (obj && obj.prototype && obj.prototype.getStats) {
            var nativeGetstats = obj.prototype.getStats;
            obj.prototype.getStats = function() {
              return nativeGetstats.apply(this).then(function(nativeStats) {
                var mapStats = /* @__PURE__ */ new Map();
                Object.keys(nativeStats).forEach(function(id) {
                  nativeStats[id].type = fixStatsType(nativeStats[id]);
                  mapStats.set(id, nativeStats[id]);
                });
                return mapStats;
              });
            };
          }
        });
        var methods = ["createOffer", "createAnswer"];
        methods.forEach(function(method) {
          var nativeMethod = RTCPeerConnection2.prototype[method];
          RTCPeerConnection2.prototype[method] = function() {
            var args = arguments;
            if (typeof args[0] === "function" || typeof args[1] === "function") {
              return nativeMethod.apply(this, [arguments[2]]).then(function(description) {
                if (typeof args[0] === "function") {
                  args[0].apply(null, [description]);
                }
              }, function(error3) {
                if (typeof args[1] === "function") {
                  args[1].apply(null, [error3]);
                }
              });
            }
            return nativeMethod.apply(this, arguments);
          };
        });
        methods = ["setLocalDescription", "setRemoteDescription", "addIceCandidate"];
        methods.forEach(function(method) {
          var nativeMethod = RTCPeerConnection2.prototype[method];
          RTCPeerConnection2.prototype[method] = function() {
            var args = arguments;
            if (typeof args[1] === "function" || typeof args[2] === "function") {
              return nativeMethod.apply(this, arguments).then(function() {
                if (typeof args[1] === "function") {
                  args[1].apply(null);
                }
              }, function(error3) {
                if (typeof args[2] === "function") {
                  args[2].apply(null, [error3]);
                }
              });
            }
            return nativeMethod.apply(this, arguments);
          };
        });
        ["getStats"].forEach(function(method) {
          var nativeMethod = RTCPeerConnection2.prototype[method];
          RTCPeerConnection2.prototype[method] = function() {
            var args = arguments;
            if (typeof args[1] === "function") {
              return nativeMethod.apply(this, arguments).then(function() {
                if (typeof args[1] === "function") {
                  args[1].apply(null);
                }
              });
            }
            return nativeMethod.apply(this, arguments);
          };
        });
        return RTCPeerConnection2;
      };
    }
  });

  // node_modules/xstate/lib/_virtual/_tslib.js
  var require_tslib = __commonJS({
    "node_modules/xstate/lib/_virtual/_tslib.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.__assign = function() {
        exports.__assign = Object.assign || function __assign2(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s)
              if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
          }
          return t;
        };
        return exports.__assign.apply(this, arguments);
      };
      function __rest2(s, e) {
        var t = {};
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
          for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
              t[p[i]] = s[p[i]];
          }
        return t;
      }
      function __values2(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
          return m.call(o);
        if (o && typeof o.length === "number")
          return {
            next: function() {
              if (o && i >= o.length)
                o = void 0;
              return { value: o && o[i++], done: !o };
            }
          };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
      }
      function __read2(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
          return o;
        var i = m.call(o), r, ar = [], e;
        try {
          while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
            ar.push(r.value);
        } catch (error3) {
          e = { error: error3 };
        } finally {
          try {
            if (r && !r.done && (m = i["return"]))
              m.call(i);
          } finally {
            if (e)
              throw e.error;
          }
        }
        return ar;
      }
      function __spreadArray2(to, from, pack) {
        if (pack || arguments.length === 2)
          for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
              if (!ar)
                ar = Array.prototype.slice.call(from, 0, i);
              ar[i] = from[i];
            }
          }
        return to.concat(ar || Array.prototype.slice.call(from));
      }
      exports.__read = __read2;
      exports.__rest = __rest2;
      exports.__spreadArray = __spreadArray2;
      exports.__values = __values2;
    }
  });

  // node_modules/xstate/lib/types.js
  var require_types = __commonJS({
    "node_modules/xstate/lib/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ActionTypes = void 0;
      (function(ActionTypes2) {
        ActionTypes2["Start"] = "xstate.start";
        ActionTypes2["Stop"] = "xstate.stop";
        ActionTypes2["Raise"] = "xstate.raise";
        ActionTypes2["Send"] = "xstate.send";
        ActionTypes2["Cancel"] = "xstate.cancel";
        ActionTypes2["NullEvent"] = "";
        ActionTypes2["Assign"] = "xstate.assign";
        ActionTypes2["After"] = "xstate.after";
        ActionTypes2["DoneState"] = "done.state";
        ActionTypes2["DoneInvoke"] = "done.invoke";
        ActionTypes2["Log"] = "xstate.log";
        ActionTypes2["Init"] = "xstate.init";
        ActionTypes2["Invoke"] = "xstate.invoke";
        ActionTypes2["ErrorExecution"] = "error.execution";
        ActionTypes2["ErrorCommunication"] = "error.communication";
        ActionTypes2["ErrorPlatform"] = "error.platform";
        ActionTypes2["ErrorCustom"] = "xstate.error";
        ActionTypes2["Update"] = "xstate.update";
        ActionTypes2["Pure"] = "xstate.pure";
        ActionTypes2["Choose"] = "xstate.choose";
      })(exports.ActionTypes || (exports.ActionTypes = {}));
      exports.SpecialTargets = void 0;
      (function(SpecialTargets2) {
        SpecialTargets2["Parent"] = "#_parent";
        SpecialTargets2["Internal"] = "#_internal";
      })(exports.SpecialTargets || (exports.SpecialTargets = {}));
    }
  });

  // node_modules/xstate/lib/actionTypes.js
  var require_actionTypes = __commonJS({
    "node_modules/xstate/lib/actionTypes.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var types = require_types();
      var start3 = types.ActionTypes.Start;
      var stop3 = types.ActionTypes.Stop;
      var raise3 = types.ActionTypes.Raise;
      var send5 = types.ActionTypes.Send;
      var cancel3 = types.ActionTypes.Cancel;
      var nullEvent2 = types.ActionTypes.NullEvent;
      var assign4 = types.ActionTypes.Assign;
      var after3 = types.ActionTypes.After;
      var doneState2 = types.ActionTypes.DoneState;
      var log4 = types.ActionTypes.Log;
      var init2 = types.ActionTypes.Init;
      var invoke2 = types.ActionTypes.Invoke;
      var errorExecution2 = types.ActionTypes.ErrorExecution;
      var errorPlatform2 = types.ActionTypes.ErrorPlatform;
      var error3 = types.ActionTypes.ErrorCustom;
      var update2 = types.ActionTypes.Update;
      var choose2 = types.ActionTypes.Choose;
      var pure4 = types.ActionTypes.Pure;
      exports.after = after3;
      exports.assign = assign4;
      exports.cancel = cancel3;
      exports.choose = choose2;
      exports.doneState = doneState2;
      exports.error = error3;
      exports.errorExecution = errorExecution2;
      exports.errorPlatform = errorPlatform2;
      exports.init = init2;
      exports.invoke = invoke2;
      exports.log = log4;
      exports.nullEvent = nullEvent2;
      exports.pure = pure4;
      exports.raise = raise3;
      exports.send = send5;
      exports.start = start3;
      exports.stop = stop3;
      exports.update = update2;
    }
  });

  // node_modules/xstate/lib/constants.js
  var require_constants = __commonJS({
    "node_modules/xstate/lib/constants.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var STATE_DELIMITER2 = ".";
      var EMPTY_ACTIVITY_MAP2 = {};
      var DEFAULT_GUARD_TYPE2 = "xstate.guard";
      var TARGETLESS_KEY2 = "";
      exports.DEFAULT_GUARD_TYPE = DEFAULT_GUARD_TYPE2;
      exports.EMPTY_ACTIVITY_MAP = EMPTY_ACTIVITY_MAP2;
      exports.STATE_DELIMITER = STATE_DELIMITER2;
      exports.TARGETLESS_KEY = TARGETLESS_KEY2;
    }
  });

  // node_modules/xstate/lib/environment.js
  var require_environment = __commonJS({
    "node_modules/xstate/lib/environment.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var IS_PRODUCTION2 = false;
      exports.IS_PRODUCTION = IS_PRODUCTION2;
    }
  });

  // node_modules/xstate/lib/utils.js
  var require_utils = __commonJS({
    "node_modules/xstate/lib/utils.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var _tslib = require_tslib();
      var constants = require_constants();
      var environment = require_environment();
      var _a2;
      function keys(value) {
        return Object.keys(value);
      }
      function matchesState2(parentStateId, childStateId, delimiter) {
        if (delimiter === void 0) {
          delimiter = constants.STATE_DELIMITER;
        }
        var parentStateValue = toStateValue2(parentStateId, delimiter);
        var childStateValue = toStateValue2(childStateId, delimiter);
        if (isString2(childStateValue)) {
          if (isString2(parentStateValue)) {
            return childStateValue === parentStateValue;
          }
          return false;
        }
        if (isString2(parentStateValue)) {
          return parentStateValue in childStateValue;
        }
        return Object.keys(parentStateValue).every(function(key) {
          if (!(key in childStateValue)) {
            return false;
          }
          return matchesState2(parentStateValue[key], childStateValue[key]);
        });
      }
      function getEventType2(event2) {
        try {
          return isString2(event2) || typeof event2 === "number" ? "".concat(event2) : event2.type;
        } catch (e) {
          throw new Error("Events must be strings or objects with a string event.type property.");
        }
      }
      function getActionType(action) {
        try {
          return isString2(action) || typeof action === "number" ? "".concat(action) : isFunction2(action) ? action.name : action.type;
        } catch (e) {
          throw new Error("Actions must be strings or objects with a string action.type property.");
        }
      }
      function toStatePath2(stateId, delimiter) {
        try {
          if (isArray2(stateId)) {
            return stateId;
          }
          return stateId.toString().split(delimiter);
        } catch (e) {
          throw new Error("'".concat(stateId, "' is not a valid state path."));
        }
      }
      function isStateLike2(state) {
        return typeof state === "object" && "value" in state && "context" in state && "event" in state && "_event" in state;
      }
      function toStateValue2(stateValue, delimiter) {
        if (isStateLike2(stateValue)) {
          return stateValue.value;
        }
        if (isArray2(stateValue)) {
          return pathToStateValue2(stateValue);
        }
        if (typeof stateValue !== "string") {
          return stateValue;
        }
        var statePath = toStatePath2(stateValue, delimiter);
        return pathToStateValue2(statePath);
      }
      function pathToStateValue2(statePath) {
        if (statePath.length === 1) {
          return statePath[0];
        }
        var value = {};
        var marker = value;
        for (var i = 0; i < statePath.length - 1; i++) {
          if (i === statePath.length - 2) {
            marker[statePath[i]] = statePath[i + 1];
          } else {
            marker[statePath[i]] = {};
            marker = marker[statePath[i]];
          }
        }
        return value;
      }
      function mapValues2(collection, iteratee) {
        var result = {};
        var collectionKeys = Object.keys(collection);
        for (var i = 0; i < collectionKeys.length; i++) {
          var key = collectionKeys[i];
          result[key] = iteratee(collection[key], key, collection, i);
        }
        return result;
      }
      function mapFilterValues2(collection, iteratee, predicate) {
        var e_1, _a3;
        var result = {};
        try {
          for (var _b = _tslib.__values(Object.keys(collection)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var key = _c.value;
            var item = collection[key];
            if (!predicate(item)) {
              continue;
            }
            result[key] = iteratee(item, key, collection);
          }
        } catch (e_1_1) {
          e_1 = {
            error: e_1_1
          };
        } finally {
          try {
            if (_c && !_c.done && (_a3 = _b.return))
              _a3.call(_b);
          } finally {
            if (e_1)
              throw e_1.error;
          }
        }
        return result;
      }
      var path2 = function(props) {
        return function(object) {
          var e_2, _a3;
          var result = object;
          try {
            for (var props_1 = _tslib.__values(props), props_1_1 = props_1.next(); !props_1_1.done; props_1_1 = props_1.next()) {
              var prop = props_1_1.value;
              result = result[prop];
            }
          } catch (e_2_1) {
            e_2 = {
              error: e_2_1
            };
          } finally {
            try {
              if (props_1_1 && !props_1_1.done && (_a3 = props_1.return))
                _a3.call(props_1);
            } finally {
              if (e_2)
                throw e_2.error;
            }
          }
          return result;
        };
      };
      function nestedPath2(props, accessorProp) {
        return function(object) {
          var e_3, _a3;
          var result = object;
          try {
            for (var props_2 = _tslib.__values(props), props_2_1 = props_2.next(); !props_2_1.done; props_2_1 = props_2.next()) {
              var prop = props_2_1.value;
              result = result[accessorProp][prop];
            }
          } catch (e_3_1) {
            e_3 = {
              error: e_3_1
            };
          } finally {
            try {
              if (props_2_1 && !props_2_1.done && (_a3 = props_2.return))
                _a3.call(props_2);
            } finally {
              if (e_3)
                throw e_3.error;
            }
          }
          return result;
        };
      }
      function toStatePaths2(stateValue) {
        if (!stateValue) {
          return [[]];
        }
        if (isString2(stateValue)) {
          return [[stateValue]];
        }
        var result = flatten2(Object.keys(stateValue).map(function(key) {
          var subStateValue = stateValue[key];
          if (typeof subStateValue !== "string" && (!subStateValue || !Object.keys(subStateValue).length)) {
            return [[key]];
          }
          return toStatePaths2(stateValue[key]).map(function(subPath) {
            return [key].concat(subPath);
          });
        }));
        return result;
      }
      function pathsToStateValue(paths) {
        var e_4, _a3;
        var result = {};
        if (paths && paths.length === 1 && paths[0].length === 1) {
          return paths[0][0];
        }
        try {
          for (var paths_1 = _tslib.__values(paths), paths_1_1 = paths_1.next(); !paths_1_1.done; paths_1_1 = paths_1.next()) {
            var currentPath = paths_1_1.value;
            var marker = result;
            for (var i = 0; i < currentPath.length; i++) {
              var subPath = currentPath[i];
              if (i === currentPath.length - 2) {
                marker[subPath] = currentPath[i + 1];
                break;
              }
              marker[subPath] = marker[subPath] || {};
              marker = marker[subPath];
            }
          }
        } catch (e_4_1) {
          e_4 = {
            error: e_4_1
          };
        } finally {
          try {
            if (paths_1_1 && !paths_1_1.done && (_a3 = paths_1.return))
              _a3.call(paths_1);
          } finally {
            if (e_4)
              throw e_4.error;
          }
        }
        return result;
      }
      function flatten2(array) {
        var _a3;
        return (_a3 = []).concat.apply(_a3, _tslib.__spreadArray([], _tslib.__read(array), false));
      }
      function toArrayStrict2(value) {
        if (isArray2(value)) {
          return value;
        }
        return [value];
      }
      function toArray2(value) {
        if (value === void 0) {
          return [];
        }
        return toArrayStrict2(value);
      }
      function mapContext2(mapper, context, _event) {
        var e_5, _a3;
        if (isFunction2(mapper)) {
          return mapper(context, _event.data);
        }
        var result = {};
        try {
          for (var _b = _tslib.__values(Object.keys(mapper)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var key = _c.value;
            var subMapper = mapper[key];
            if (isFunction2(subMapper)) {
              result[key] = subMapper(context, _event.data);
            } else {
              result[key] = subMapper;
            }
          }
        } catch (e_5_1) {
          e_5 = {
            error: e_5_1
          };
        } finally {
          try {
            if (_c && !_c.done && (_a3 = _b.return))
              _a3.call(_b);
          } finally {
            if (e_5)
              throw e_5.error;
          }
        }
        return result;
      }
      function isBuiltInEvent2(eventType) {
        return /^(done|error)\./.test(eventType);
      }
      function isPromiseLike2(value) {
        if (value instanceof Promise) {
          return true;
        }
        if (value !== null && (isFunction2(value) || typeof value === "object") && isFunction2(value.then)) {
          return true;
        }
        return false;
      }
      function isBehavior2(value) {
        return value !== null && typeof value === "object" && "transition" in value && typeof value.transition === "function";
      }
      function partition2(items, predicate) {
        var e_6, _a3;
        var _b = _tslib.__read([[], []], 2), truthy = _b[0], falsy = _b[1];
        try {
          for (var items_1 = _tslib.__values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
            var item = items_1_1.value;
            if (predicate(item)) {
              truthy.push(item);
            } else {
              falsy.push(item);
            }
          }
        } catch (e_6_1) {
          e_6 = {
            error: e_6_1
          };
        } finally {
          try {
            if (items_1_1 && !items_1_1.done && (_a3 = items_1.return))
              _a3.call(items_1);
          } finally {
            if (e_6)
              throw e_6.error;
          }
        }
        return [truthy, falsy];
      }
      function updateHistoryStates2(hist, stateValue) {
        return mapValues2(hist.states, function(subHist, key) {
          if (!subHist) {
            return void 0;
          }
          var subStateValue = (isString2(stateValue) ? void 0 : stateValue[key]) || (subHist ? subHist.current : void 0);
          if (!subStateValue) {
            return void 0;
          }
          return {
            current: subStateValue,
            states: updateHistoryStates2(subHist, subStateValue)
          };
        });
      }
      function updateHistoryValue2(hist, stateValue) {
        return {
          current: stateValue,
          states: updateHistoryStates2(hist, stateValue)
        };
      }
      function updateContext2(context, _event, assignActions, state) {
        if (!environment.IS_PRODUCTION) {
          exports.warn(!!context, "Attempting to update undefined context");
        }
        var updatedContext = context ? assignActions.reduce(function(acc, assignAction) {
          var e_7, _a3;
          var assignment = assignAction.assignment;
          var meta = {
            state,
            action: assignAction,
            _event
          };
          var partialUpdate = {};
          if (isFunction2(assignment)) {
            partialUpdate = assignment(acc, _event.data, meta);
          } else {
            try {
              for (var _b = _tslib.__values(Object.keys(assignment)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                var propAssignment = assignment[key];
                partialUpdate[key] = isFunction2(propAssignment) ? propAssignment(acc, _event.data, meta) : propAssignment;
              }
            } catch (e_7_1) {
              e_7 = {
                error: e_7_1
              };
            } finally {
              try {
                if (_c && !_c.done && (_a3 = _b.return))
                  _a3.call(_b);
              } finally {
                if (e_7)
                  throw e_7.error;
              }
            }
          }
          return Object.assign({}, acc, partialUpdate);
        }, context) : context;
        return updatedContext;
      }
      exports.warn = function() {
      };
      if (!environment.IS_PRODUCTION) {
        exports.warn = function(condition, message) {
          var error3 = condition instanceof Error ? condition : void 0;
          if (!error3 && condition) {
            return;
          }
          if (console !== void 0) {
            var args = ["Warning: ".concat(message)];
            if (error3) {
              args.push(error3);
            }
            console.warn.apply(console, args);
          }
        };
      }
      function isArray2(value) {
        return Array.isArray(value);
      }
      function isFunction2(value) {
        return typeof value === "function";
      }
      function isString2(value) {
        return typeof value === "string";
      }
      function toGuard2(condition, guardMap) {
        if (!condition) {
          return void 0;
        }
        if (isString2(condition)) {
          return {
            type: constants.DEFAULT_GUARD_TYPE,
            name: condition,
            predicate: guardMap ? guardMap[condition] : void 0
          };
        }
        if (isFunction2(condition)) {
          return {
            type: constants.DEFAULT_GUARD_TYPE,
            name: condition.name,
            predicate: condition
          };
        }
        return condition;
      }
      function isObservable2(value) {
        try {
          return "subscribe" in value && isFunction2(value.subscribe);
        } catch (e) {
          return false;
        }
      }
      var symbolObservable2 = /* @__PURE__ */ function() {
        return typeof Symbol === "function" && Symbol.observable || "@@observable";
      }();
      var interopSymbols2 = (_a2 = {}, _a2[symbolObservable2] = function() {
        return this;
      }, _a2[Symbol.observable] = function() {
        return this;
      }, _a2);
      function isMachine2(value) {
        return !!value && "__xstatenode" in value;
      }
      function isActor3(value) {
        return !!value && typeof value.send === "function";
      }
      var uniqueId2 = /* @__PURE__ */ function() {
        var currentId = 0;
        return function() {
          currentId++;
          return currentId.toString(16);
        };
      }();
      function toEventObject2(event2, payload) {
        if (isString2(event2) || typeof event2 === "number") {
          return _tslib.__assign({
            type: event2
          }, payload);
        }
        return event2;
      }
      function toSCXMLEvent2(event2, scxmlEvent) {
        if (!isString2(event2) && "$$type" in event2 && event2.$$type === "scxml") {
          return event2;
        }
        var eventObject = toEventObject2(event2);
        return _tslib.__assign({
          name: eventObject.type,
          data: eventObject,
          $$type: "scxml",
          type: "external"
        }, scxmlEvent);
      }
      function toTransitionConfigArray2(event2, configLike) {
        var transitions = toArrayStrict2(configLike).map(function(transitionLike) {
          if (typeof transitionLike === "undefined" || typeof transitionLike === "string" || isMachine2(transitionLike)) {
            return {
              target: transitionLike,
              event: event2
            };
          }
          return _tslib.__assign(_tslib.__assign({}, transitionLike), {
            event: event2
          });
        });
        return transitions;
      }
      function normalizeTarget2(target) {
        if (target === void 0 || target === constants.TARGETLESS_KEY) {
          return void 0;
        }
        return toArray2(target);
      }
      function reportUnhandledExceptionOnInvocation2(originalError, currentError, id) {
        if (!environment.IS_PRODUCTION) {
          var originalStackTrace = originalError.stack ? " Stacktrace was '".concat(originalError.stack, "'") : "";
          if (originalError === currentError) {
            console.error("Missing onError handler for invocation '".concat(id, "', error was '").concat(originalError, "'.").concat(originalStackTrace));
          } else {
            var stackTrace = currentError.stack ? " Stacktrace was '".concat(currentError.stack, "'") : "";
            console.error("Missing onError handler and/or unhandled exception/promise rejection for invocation '".concat(id, "'. ") + "Original error: '".concat(originalError, "'. ").concat(originalStackTrace, " Current error is '").concat(currentError, "'.").concat(stackTrace));
          }
        }
      }
      function evaluateGuard2(machine, guard, context, _event, state) {
        var guards = machine.options.guards;
        var guardMeta = {
          state,
          cond: guard,
          _event
        };
        if (guard.type === constants.DEFAULT_GUARD_TYPE) {
          return ((guards === null || guards === void 0 ? void 0 : guards[guard.name]) || guard.predicate)(context, _event.data, guardMeta);
        }
        var condFn = guards === null || guards === void 0 ? void 0 : guards[guard.type];
        if (!condFn) {
          throw new Error("Guard '".concat(guard.type, "' is not implemented on machine '").concat(machine.id, "'."));
        }
        return condFn(context, _event.data, guardMeta);
      }
      function toInvokeSource3(src) {
        if (typeof src === "string") {
          return {
            type: src
          };
        }
        return src;
      }
      function toObserver2(nextHandler, errorHandler, completionHandler) {
        if (typeof nextHandler === "object") {
          return nextHandler;
        }
        var noop = function() {
          return void 0;
        };
        return {
          next: nextHandler,
          error: errorHandler || noop,
          complete: completionHandler || noop
        };
      }
      function createInvokeId2(stateNodeId, index) {
        return "".concat(stateNodeId, ":invocation[").concat(index, "]");
      }
      exports.createInvokeId = createInvokeId2;
      exports.evaluateGuard = evaluateGuard2;
      exports.flatten = flatten2;
      exports.getActionType = getActionType;
      exports.getEventType = getEventType2;
      exports.interopSymbols = interopSymbols2;
      exports.isActor = isActor3;
      exports.isArray = isArray2;
      exports.isBehavior = isBehavior2;
      exports.isBuiltInEvent = isBuiltInEvent2;
      exports.isFunction = isFunction2;
      exports.isMachine = isMachine2;
      exports.isObservable = isObservable2;
      exports.isPromiseLike = isPromiseLike2;
      exports.isStateLike = isStateLike2;
      exports.isString = isString2;
      exports.keys = keys;
      exports.mapContext = mapContext2;
      exports.mapFilterValues = mapFilterValues2;
      exports.mapValues = mapValues2;
      exports.matchesState = matchesState2;
      exports.nestedPath = nestedPath2;
      exports.normalizeTarget = normalizeTarget2;
      exports.partition = partition2;
      exports.path = path2;
      exports.pathToStateValue = pathToStateValue2;
      exports.pathsToStateValue = pathsToStateValue;
      exports.reportUnhandledExceptionOnInvocation = reportUnhandledExceptionOnInvocation2;
      exports.symbolObservable = symbolObservable2;
      exports.toArray = toArray2;
      exports.toArrayStrict = toArrayStrict2;
      exports.toEventObject = toEventObject2;
      exports.toGuard = toGuard2;
      exports.toInvokeSource = toInvokeSource3;
      exports.toObserver = toObserver2;
      exports.toSCXMLEvent = toSCXMLEvent2;
      exports.toStatePath = toStatePath2;
      exports.toStatePaths = toStatePaths2;
      exports.toStateValue = toStateValue2;
      exports.toTransitionConfigArray = toTransitionConfigArray2;
      exports.uniqueId = uniqueId2;
      exports.updateContext = updateContext2;
      exports.updateHistoryStates = updateHistoryStates2;
      exports.updateHistoryValue = updateHistoryValue2;
    }
  });

  // node_modules/xstate/lib/actions.js
  var require_actions = __commonJS({
    "node_modules/xstate/lib/actions.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var _tslib = require_tslib();
      var types = require_types();
      var actionTypes = require_actionTypes();
      var utils = require_utils();
      var environment = require_environment();
      var initEvent2 = /* @__PURE__ */ utils.toSCXMLEvent({
        type: actionTypes.init
      });
      function getActionFunction2(actionType, actionFunctionMap) {
        return actionFunctionMap ? actionFunctionMap[actionType] || void 0 : void 0;
      }
      function toActionObject2(action, actionFunctionMap) {
        var actionObject;
        if (utils.isString(action) || typeof action === "number") {
          var exec = getActionFunction2(action, actionFunctionMap);
          if (utils.isFunction(exec)) {
            actionObject = {
              type: action,
              exec
            };
          } else if (exec) {
            actionObject = exec;
          } else {
            actionObject = {
              type: action,
              exec: void 0
            };
          }
        } else if (utils.isFunction(action)) {
          actionObject = {
            type: action.name || action.toString(),
            exec: action
          };
        } else {
          var exec = getActionFunction2(action.type, actionFunctionMap);
          if (utils.isFunction(exec)) {
            actionObject = _tslib.__assign(_tslib.__assign({}, action), {
              exec
            });
          } else if (exec) {
            var actionType = exec.type || action.type;
            actionObject = _tslib.__assign(_tslib.__assign(_tslib.__assign({}, exec), action), {
              type: actionType
            });
          } else {
            actionObject = action;
          }
        }
        return actionObject;
      }
      var toActionObjects2 = function(action, actionFunctionMap) {
        if (!action) {
          return [];
        }
        var actions2 = utils.isArray(action) ? action : [action];
        return actions2.map(function(subAction) {
          return toActionObject2(subAction, actionFunctionMap);
        });
      };
      function toActivityDefinition2(action) {
        var actionObject = toActionObject2(action);
        return _tslib.__assign(_tslib.__assign({
          id: utils.isString(action) ? action : actionObject.id
        }, actionObject), {
          type: actionObject.type
        });
      }
      function raise3(event2) {
        if (!utils.isString(event2)) {
          return send5(event2, {
            to: types.SpecialTargets.Internal
          });
        }
        return {
          type: actionTypes.raise,
          event: event2
        };
      }
      function resolveRaise2(action) {
        return {
          type: actionTypes.raise,
          _event: utils.toSCXMLEvent(action.event)
        };
      }
      function send5(event2, options) {
        return {
          to: options ? options.to : void 0,
          type: actionTypes.send,
          event: utils.isFunction(event2) ? event2 : utils.toEventObject(event2),
          delay: options ? options.delay : void 0,
          id: options && options.id !== void 0 ? options.id : utils.isFunction(event2) ? event2.name : utils.getEventType(event2)
        };
      }
      function resolveSend2(action, ctx, _event, delaysMap) {
        var meta = {
          _event
        };
        var resolvedEvent = utils.toSCXMLEvent(utils.isFunction(action.event) ? action.event(ctx, _event.data, meta) : action.event);
        var resolvedDelay;
        if (utils.isString(action.delay)) {
          var configDelay = delaysMap && delaysMap[action.delay];
          resolvedDelay = utils.isFunction(configDelay) ? configDelay(ctx, _event.data, meta) : configDelay;
        } else {
          resolvedDelay = utils.isFunction(action.delay) ? action.delay(ctx, _event.data, meta) : action.delay;
        }
        var resolvedTarget = utils.isFunction(action.to) ? action.to(ctx, _event.data, meta) : action.to;
        return _tslib.__assign(_tslib.__assign({}, action), {
          to: resolvedTarget,
          _event: resolvedEvent,
          event: resolvedEvent.data,
          delay: resolvedDelay
        });
      }
      function sendParent4(event2, options) {
        return send5(event2, _tslib.__assign(_tslib.__assign({}, options), {
          to: types.SpecialTargets.Parent
        }));
      }
      function sendTo(actor, event2, options) {
        return send5(event2, _tslib.__assign(_tslib.__assign({}, options), {
          to: actor
        }));
      }
      function sendUpdate2() {
        return sendParent4(actionTypes.update);
      }
      function respond(event2, options) {
        return send5(event2, _tslib.__assign(_tslib.__assign({}, options), {
          to: function(_, __, _a2) {
            var _event = _a2._event;
            return _event.origin;
          }
        }));
      }
      var defaultLogExpr = function(context, event2) {
        return {
          context,
          event: event2
        };
      };
      function log4(expr, label) {
        if (expr === void 0) {
          expr = defaultLogExpr;
        }
        return {
          type: actionTypes.log,
          label,
          expr
        };
      }
      var resolveLog2 = function(action, ctx, _event) {
        return _tslib.__assign(_tslib.__assign({}, action), {
          value: utils.isString(action.expr) ? action.expr : action.expr(ctx, _event.data, {
            _event
          })
        });
      };
      var cancel3 = function(sendId) {
        return {
          type: actionTypes.cancel,
          sendId
        };
      };
      function start3(activity) {
        var activityDef = toActivityDefinition2(activity);
        return {
          type: types.ActionTypes.Start,
          activity: activityDef,
          exec: void 0
        };
      }
      function stop3(actorRef) {
        var activity = utils.isFunction(actorRef) ? actorRef : toActivityDefinition2(actorRef);
        return {
          type: types.ActionTypes.Stop,
          activity,
          exec: void 0
        };
      }
      function resolveStop2(action, context, _event) {
        var actorRefOrString = utils.isFunction(action.activity) ? action.activity(context, _event.data) : action.activity;
        var resolvedActorRef = typeof actorRefOrString === "string" ? {
          id: actorRefOrString
        } : actorRefOrString;
        var actionObject = {
          type: types.ActionTypes.Stop,
          activity: resolvedActorRef
        };
        return actionObject;
      }
      var assign4 = function(assignment) {
        return {
          type: actionTypes.assign,
          assignment
        };
      };
      function isActionObject(action) {
        return typeof action === "object" && "type" in action;
      }
      function after3(delayRef, id) {
        var idSuffix = id ? "#".concat(id) : "";
        return "".concat(types.ActionTypes.After, "(").concat(delayRef, ")").concat(idSuffix);
      }
      function done2(id, data) {
        var type = "".concat(types.ActionTypes.DoneState, ".").concat(id);
        var eventObject = {
          type,
          data
        };
        eventObject.toString = function() {
          return type;
        };
        return eventObject;
      }
      function doneInvoke2(id, data) {
        var type = "".concat(types.ActionTypes.DoneInvoke, ".").concat(id);
        var eventObject = {
          type,
          data
        };
        eventObject.toString = function() {
          return type;
        };
        return eventObject;
      }
      function error3(id, data) {
        var type = "".concat(types.ActionTypes.ErrorPlatform, ".").concat(id);
        var eventObject = {
          type,
          data
        };
        eventObject.toString = function() {
          return type;
        };
        return eventObject;
      }
      function pure4(getActions) {
        return {
          type: types.ActionTypes.Pure,
          get: getActions
        };
      }
      function forwardTo2(target, options) {
        return send5(function(_, event2) {
          return event2;
        }, _tslib.__assign(_tslib.__assign({}, options), {
          to: target
        }));
      }
      function escalate(errorData, options) {
        return sendParent4(function(context, event2, meta) {
          return {
            type: actionTypes.error,
            data: utils.isFunction(errorData) ? errorData(context, event2, meta) : errorData
          };
        }, _tslib.__assign(_tslib.__assign({}, options), {
          to: types.SpecialTargets.Parent
        }));
      }
      function choose2(conds) {
        return {
          type: types.ActionTypes.Choose,
          conds
        };
      }
      function resolveActions2(machine, currentState, currentContext, _event, actions2, preserveActionOrder) {
        if (preserveActionOrder === void 0) {
          preserveActionOrder = false;
        }
        var _a2 = _tslib.__read(preserveActionOrder ? [[], actions2] : utils.partition(actions2, function(action) {
          return action.type === actionTypes.assign;
        }), 2), assignActions = _a2[0], otherActions = _a2[1];
        var updatedContext = assignActions.length ? utils.updateContext(currentContext, _event, assignActions, currentState) : currentContext;
        var preservedContexts = preserveActionOrder ? [currentContext] : void 0;
        var resolvedActions = utils.flatten(otherActions.map(function(actionObject) {
          var _a3;
          switch (actionObject.type) {
            case actionTypes.raise:
              return resolveRaise2(actionObject);
            case actionTypes.send:
              var sendAction = resolveSend2(actionObject, updatedContext, _event, machine.options.delays);
              if (!environment.IS_PRODUCTION) {
                utils.warn(
                  !utils.isString(actionObject.delay) || typeof sendAction.delay === "number",
                  "No delay reference for delay expression '".concat(actionObject.delay, "' was found on machine '").concat(machine.id, "'")
                );
              }
              return sendAction;
            case actionTypes.log:
              return resolveLog2(actionObject, updatedContext, _event);
            case actionTypes.choose: {
              var chooseAction = actionObject;
              var matchedActions = (_a3 = chooseAction.conds.find(function(condition) {
                var guard = utils.toGuard(condition.cond, machine.options.guards);
                return !guard || utils.evaluateGuard(machine, guard, updatedContext, _event, currentState);
              })) === null || _a3 === void 0 ? void 0 : _a3.actions;
              if (!matchedActions) {
                return [];
              }
              var _b = _tslib.__read(resolveActions2(machine, currentState, updatedContext, _event, toActionObjects2(utils.toArray(matchedActions), machine.options.actions), preserveActionOrder), 2), resolvedActionsFromChoose = _b[0], resolvedContextFromChoose = _b[1];
              updatedContext = resolvedContextFromChoose;
              preservedContexts === null || preservedContexts === void 0 ? void 0 : preservedContexts.push(updatedContext);
              return resolvedActionsFromChoose;
            }
            case actionTypes.pure: {
              var matchedActions = actionObject.get(updatedContext, _event.data);
              if (!matchedActions) {
                return [];
              }
              var _c = _tslib.__read(resolveActions2(machine, currentState, updatedContext, _event, toActionObjects2(utils.toArray(matchedActions), machine.options.actions), preserveActionOrder), 2), resolvedActionsFromPure = _c[0], resolvedContext = _c[1];
              updatedContext = resolvedContext;
              preservedContexts === null || preservedContexts === void 0 ? void 0 : preservedContexts.push(updatedContext);
              return resolvedActionsFromPure;
            }
            case actionTypes.stop: {
              return resolveStop2(actionObject, updatedContext, _event);
            }
            case actionTypes.assign: {
              updatedContext = utils.updateContext(updatedContext, _event, [actionObject], currentState);
              preservedContexts === null || preservedContexts === void 0 ? void 0 : preservedContexts.push(updatedContext);
              break;
            }
            default:
              var resolvedActionObject = toActionObject2(actionObject, machine.options.actions);
              var exec_1 = resolvedActionObject.exec;
              if (exec_1 && preservedContexts) {
                var contextIndex_1 = preservedContexts.length - 1;
                resolvedActionObject = _tslib.__assign(_tslib.__assign({}, resolvedActionObject), {
                  exec: function(_ctx) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                      args[_i - 1] = arguments[_i];
                    }
                    exec_1.apply(void 0, _tslib.__spreadArray([preservedContexts[contextIndex_1]], _tslib.__read(args), false));
                  }
                });
              }
              return resolvedActionObject;
          }
        }).filter(function(a) {
          return !!a;
        }));
        return [resolvedActions, updatedContext];
      }
      exports.actionTypes = actionTypes;
      exports.after = after3;
      exports.assign = assign4;
      exports.cancel = cancel3;
      exports.choose = choose2;
      exports.done = done2;
      exports.doneInvoke = doneInvoke2;
      exports.error = error3;
      exports.escalate = escalate;
      exports.forwardTo = forwardTo2;
      exports.getActionFunction = getActionFunction2;
      exports.initEvent = initEvent2;
      exports.isActionObject = isActionObject;
      exports.log = log4;
      exports.pure = pure4;
      exports.raise = raise3;
      exports.resolveActions = resolveActions2;
      exports.resolveLog = resolveLog2;
      exports.resolveRaise = resolveRaise2;
      exports.resolveSend = resolveSend2;
      exports.resolveStop = resolveStop2;
      exports.respond = respond;
      exports.send = send5;
      exports.sendParent = sendParent4;
      exports.sendTo = sendTo;
      exports.sendUpdate = sendUpdate2;
      exports.start = start3;
      exports.stop = stop3;
      exports.toActionObject = toActionObject2;
      exports.toActionObjects = toActionObjects2;
      exports.toActivityDefinition = toActivityDefinition2;
    }
  });

  // node_modules/peerjs/dist/bundler.mjs
  var import_peerjs_js_binarypack = __toESM(require_binarypack(), 1);

  // node_modules/webrtc-adapter/src/js/utils.js
  var logDisabled_ = true;
  var deprecationWarnings_ = true;
  function extractVersion(uastring, expr, pos) {
    const match = uastring.match(expr);
    return match && match.length >= pos && parseInt(match[pos], 10);
  }
  function wrapPeerConnectionEvent(window2, eventNameToWrap, wrapper) {
    if (!window2.RTCPeerConnection) {
      return;
    }
    const proto = window2.RTCPeerConnection.prototype;
    const nativeAddEventListener = proto.addEventListener;
    proto.addEventListener = function(nativeEventName, cb) {
      if (nativeEventName !== eventNameToWrap) {
        return nativeAddEventListener.apply(this, arguments);
      }
      const wrappedCallback = (e) => {
        const modifiedEvent = wrapper(e);
        if (modifiedEvent) {
          if (cb.handleEvent) {
            cb.handleEvent(modifiedEvent);
          } else {
            cb(modifiedEvent);
          }
        }
      };
      this._eventMap = this._eventMap || {};
      if (!this._eventMap[eventNameToWrap]) {
        this._eventMap[eventNameToWrap] = /* @__PURE__ */ new Map();
      }
      this._eventMap[eventNameToWrap].set(cb, wrappedCallback);
      return nativeAddEventListener.apply(this, [
        nativeEventName,
        wrappedCallback
      ]);
    };
    const nativeRemoveEventListener = proto.removeEventListener;
    proto.removeEventListener = function(nativeEventName, cb) {
      if (nativeEventName !== eventNameToWrap || !this._eventMap || !this._eventMap[eventNameToWrap]) {
        return nativeRemoveEventListener.apply(this, arguments);
      }
      if (!this._eventMap[eventNameToWrap].has(cb)) {
        return nativeRemoveEventListener.apply(this, arguments);
      }
      const unwrappedCb = this._eventMap[eventNameToWrap].get(cb);
      this._eventMap[eventNameToWrap].delete(cb);
      if (this._eventMap[eventNameToWrap].size === 0) {
        delete this._eventMap[eventNameToWrap];
      }
      if (Object.keys(this._eventMap).length === 0) {
        delete this._eventMap;
      }
      return nativeRemoveEventListener.apply(this, [
        nativeEventName,
        unwrappedCb
      ]);
    };
    Object.defineProperty(proto, "on" + eventNameToWrap, {
      get() {
        return this["_on" + eventNameToWrap];
      },
      set(cb) {
        if (this["_on" + eventNameToWrap]) {
          this.removeEventListener(
            eventNameToWrap,
            this["_on" + eventNameToWrap]
          );
          delete this["_on" + eventNameToWrap];
        }
        if (cb) {
          this.addEventListener(
            eventNameToWrap,
            this["_on" + eventNameToWrap] = cb
          );
        }
      },
      enumerable: true,
      configurable: true
    });
  }
  function disableLog(bool) {
    if (typeof bool !== "boolean") {
      return new Error("Argument type: " + typeof bool + ". Please use a boolean.");
    }
    logDisabled_ = bool;
    return bool ? "adapter.js logging disabled" : "adapter.js logging enabled";
  }
  function disableWarnings(bool) {
    if (typeof bool !== "boolean") {
      return new Error("Argument type: " + typeof bool + ". Please use a boolean.");
    }
    deprecationWarnings_ = !bool;
    return "adapter.js deprecation warnings " + (bool ? "disabled" : "enabled");
  }
  function log() {
    if (typeof window === "object") {
      if (logDisabled_) {
        return;
      }
      if (typeof console !== "undefined" && typeof console.log === "function") {
        console.log.apply(console, arguments);
      }
    }
  }
  function deprecated(oldMethod, newMethod) {
    if (!deprecationWarnings_) {
      return;
    }
    console.warn(oldMethod + " is deprecated, please use " + newMethod + " instead.");
  }
  function detectBrowser(window2) {
    const result = { browser: null, version: null };
    if (typeof window2 === "undefined" || !window2.navigator) {
      result.browser = "Not a browser.";
      return result;
    }
    const { navigator: navigator2 } = window2;
    if (navigator2.mozGetUserMedia) {
      result.browser = "firefox";
      result.version = extractVersion(
        navigator2.userAgent,
        /Firefox\/(\d+)\./,
        1
      );
    } else if (navigator2.webkitGetUserMedia || window2.isSecureContext === false && window2.webkitRTCPeerConnection && !window2.RTCIceGatherer) {
      result.browser = "chrome";
      result.version = extractVersion(
        navigator2.userAgent,
        /Chrom(e|ium)\/(\d+)\./,
        2
      );
    } else if (navigator2.mediaDevices && navigator2.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
      result.browser = "edge";
      result.version = extractVersion(
        navigator2.userAgent,
        /Edge\/(\d+).(\d+)$/,
        2
      );
    } else if (window2.RTCPeerConnection && navigator2.userAgent.match(/AppleWebKit\/(\d+)\./)) {
      result.browser = "safari";
      result.version = extractVersion(
        navigator2.userAgent,
        /AppleWebKit\/(\d+)\./,
        1
      );
      result.supportsUnifiedPlan = window2.RTCRtpTransceiver && "currentDirection" in window2.RTCRtpTransceiver.prototype;
    } else {
      result.browser = "Not a supported browser.";
      return result;
    }
    return result;
  }
  function isObject(val) {
    return Object.prototype.toString.call(val) === "[object Object]";
  }
  function compactObject(data) {
    if (!isObject(data)) {
      return data;
    }
    return Object.keys(data).reduce(function(accumulator, key) {
      const isObj = isObject(data[key]);
      const value = isObj ? compactObject(data[key]) : data[key];
      const isEmptyObject = isObj && !Object.keys(value).length;
      if (value === void 0 || isEmptyObject) {
        return accumulator;
      }
      return Object.assign(accumulator, { [key]: value });
    }, {});
  }
  function walkStats(stats, base, resultSet) {
    if (!base || resultSet.has(base.id)) {
      return;
    }
    resultSet.set(base.id, base);
    Object.keys(base).forEach((name) => {
      if (name.endsWith("Id")) {
        walkStats(stats, stats.get(base[name]), resultSet);
      } else if (name.endsWith("Ids")) {
        base[name].forEach((id) => {
          walkStats(stats, stats.get(id), resultSet);
        });
      }
    });
  }
  function filterStats(result, track, outbound) {
    const streamStatsType = outbound ? "outbound-rtp" : "inbound-rtp";
    const filteredResult = /* @__PURE__ */ new Map();
    if (track === null) {
      return filteredResult;
    }
    const trackStats = [];
    result.forEach((value) => {
      if (value.type === "track" && value.trackIdentifier === track.id) {
        trackStats.push(value);
      }
    });
    trackStats.forEach((trackStat) => {
      result.forEach((stats) => {
        if (stats.type === streamStatsType && stats.trackId === trackStat.id) {
          walkStats(result, stats, filteredResult);
        }
      });
    });
    return filteredResult;
  }

  // node_modules/webrtc-adapter/src/js/chrome/chrome_shim.js
  var chrome_shim_exports = {};
  __export(chrome_shim_exports, {
    fixNegotiationNeeded: () => fixNegotiationNeeded,
    shimAddTrackRemoveTrack: () => shimAddTrackRemoveTrack,
    shimAddTrackRemoveTrackWithNative: () => shimAddTrackRemoveTrackWithNative,
    shimGetDisplayMedia: () => shimGetDisplayMedia,
    shimGetSendersWithDtmf: () => shimGetSendersWithDtmf,
    shimGetStats: () => shimGetStats,
    shimGetUserMedia: () => shimGetUserMedia,
    shimMediaStream: () => shimMediaStream,
    shimOnTrack: () => shimOnTrack,
    shimPeerConnection: () => shimPeerConnection,
    shimSenderReceiverGetStats: () => shimSenderReceiverGetStats
  });

  // node_modules/webrtc-adapter/src/js/chrome/getusermedia.js
  var logging = log;
  function shimGetUserMedia(window2, browserDetails) {
    const navigator2 = window2 && window2.navigator;
    if (!navigator2.mediaDevices) {
      return;
    }
    const constraintsToChrome_ = function(c) {
      if (typeof c !== "object" || c.mandatory || c.optional) {
        return c;
      }
      const cc = {};
      Object.keys(c).forEach((key) => {
        if (key === "require" || key === "advanced" || key === "mediaSource") {
          return;
        }
        const r = typeof c[key] === "object" ? c[key] : { ideal: c[key] };
        if (r.exact !== void 0 && typeof r.exact === "number") {
          r.min = r.max = r.exact;
        }
        const oldname_ = function(prefix, name) {
          if (prefix) {
            return prefix + name.charAt(0).toUpperCase() + name.slice(1);
          }
          return name === "deviceId" ? "sourceId" : name;
        };
        if (r.ideal !== void 0) {
          cc.optional = cc.optional || [];
          let oc = {};
          if (typeof r.ideal === "number") {
            oc[oldname_("min", key)] = r.ideal;
            cc.optional.push(oc);
            oc = {};
            oc[oldname_("max", key)] = r.ideal;
            cc.optional.push(oc);
          } else {
            oc[oldname_("", key)] = r.ideal;
            cc.optional.push(oc);
          }
        }
        if (r.exact !== void 0 && typeof r.exact !== "number") {
          cc.mandatory = cc.mandatory || {};
          cc.mandatory[oldname_("", key)] = r.exact;
        } else {
          ["min", "max"].forEach((mix) => {
            if (r[mix] !== void 0) {
              cc.mandatory = cc.mandatory || {};
              cc.mandatory[oldname_(mix, key)] = r[mix];
            }
          });
        }
      });
      if (c.advanced) {
        cc.optional = (cc.optional || []).concat(c.advanced);
      }
      return cc;
    };
    const shimConstraints_ = function(constraints, func) {
      if (browserDetails.version >= 61) {
        return func(constraints);
      }
      constraints = JSON.parse(JSON.stringify(constraints));
      if (constraints && typeof constraints.audio === "object") {
        const remap = function(obj, a, b) {
          if (a in obj && !(b in obj)) {
            obj[b] = obj[a];
            delete obj[a];
          }
        };
        constraints = JSON.parse(JSON.stringify(constraints));
        remap(constraints.audio, "autoGainControl", "googAutoGainControl");
        remap(constraints.audio, "noiseSuppression", "googNoiseSuppression");
        constraints.audio = constraintsToChrome_(constraints.audio);
      }
      if (constraints && typeof constraints.video === "object") {
        let face = constraints.video.facingMode;
        face = face && (typeof face === "object" ? face : { ideal: face });
        const getSupportedFacingModeLies = browserDetails.version < 66;
        if (face && (face.exact === "user" || face.exact === "environment" || face.ideal === "user" || face.ideal === "environment") && !(navigator2.mediaDevices.getSupportedConstraints && navigator2.mediaDevices.getSupportedConstraints().facingMode && !getSupportedFacingModeLies)) {
          delete constraints.video.facingMode;
          let matches;
          if (face.exact === "environment" || face.ideal === "environment") {
            matches = ["back", "rear"];
          } else if (face.exact === "user" || face.ideal === "user") {
            matches = ["front"];
          }
          if (matches) {
            return navigator2.mediaDevices.enumerateDevices().then((devices) => {
              devices = devices.filter((d) => d.kind === "videoinput");
              let dev = devices.find((d) => matches.some((match) => d.label.toLowerCase().includes(match)));
              if (!dev && devices.length && matches.includes("back")) {
                dev = devices[devices.length - 1];
              }
              if (dev) {
                constraints.video.deviceId = face.exact ? { exact: dev.deviceId } : { ideal: dev.deviceId };
              }
              constraints.video = constraintsToChrome_(constraints.video);
              logging("chrome: " + JSON.stringify(constraints));
              return func(constraints);
            });
          }
        }
        constraints.video = constraintsToChrome_(constraints.video);
      }
      logging("chrome: " + JSON.stringify(constraints));
      return func(constraints);
    };
    const shimError_ = function(e) {
      if (browserDetails.version >= 64) {
        return e;
      }
      return {
        name: {
          PermissionDeniedError: "NotAllowedError",
          PermissionDismissedError: "NotAllowedError",
          InvalidStateError: "NotAllowedError",
          DevicesNotFoundError: "NotFoundError",
          ConstraintNotSatisfiedError: "OverconstrainedError",
          TrackStartError: "NotReadableError",
          MediaDeviceFailedDueToShutdown: "NotAllowedError",
          MediaDeviceKillSwitchOn: "NotAllowedError",
          TabCaptureError: "AbortError",
          ScreenCaptureError: "AbortError",
          DeviceCaptureError: "AbortError"
        }[e.name] || e.name,
        message: e.message,
        constraint: e.constraint || e.constraintName,
        toString() {
          return this.name + (this.message && ": ") + this.message;
        }
      };
    };
    const getUserMedia_ = function(constraints, onSuccess, onError) {
      shimConstraints_(constraints, (c) => {
        navigator2.webkitGetUserMedia(c, onSuccess, (e) => {
          if (onError) {
            onError(shimError_(e));
          }
        });
      });
    };
    navigator2.getUserMedia = getUserMedia_.bind(navigator2);
    if (navigator2.mediaDevices.getUserMedia) {
      const origGetUserMedia = navigator2.mediaDevices.getUserMedia.bind(navigator2.mediaDevices);
      navigator2.mediaDevices.getUserMedia = function(cs) {
        return shimConstraints_(cs, (c) => origGetUserMedia(c).then((stream) => {
          if (c.audio && !stream.getAudioTracks().length || c.video && !stream.getVideoTracks().length) {
            stream.getTracks().forEach((track) => {
              track.stop();
            });
            throw new DOMException("", "NotFoundError");
          }
          return stream;
        }, (e) => Promise.reject(shimError_(e))));
      };
    }
  }

  // node_modules/webrtc-adapter/src/js/chrome/getdisplaymedia.js
  function shimGetDisplayMedia(window2, getSourceId) {
    if (window2.navigator.mediaDevices && "getDisplayMedia" in window2.navigator.mediaDevices) {
      return;
    }
    if (!window2.navigator.mediaDevices) {
      return;
    }
    if (typeof getSourceId !== "function") {
      console.error("shimGetDisplayMedia: getSourceId argument is not a function");
      return;
    }
    window2.navigator.mediaDevices.getDisplayMedia = function getDisplayMedia(constraints) {
      return getSourceId(constraints).then((sourceId) => {
        const widthSpecified = constraints.video && constraints.video.width;
        const heightSpecified = constraints.video && constraints.video.height;
        const frameRateSpecified = constraints.video && constraints.video.frameRate;
        constraints.video = {
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: sourceId,
            maxFrameRate: frameRateSpecified || 3
          }
        };
        if (widthSpecified) {
          constraints.video.mandatory.maxWidth = widthSpecified;
        }
        if (heightSpecified) {
          constraints.video.mandatory.maxHeight = heightSpecified;
        }
        return window2.navigator.mediaDevices.getUserMedia(constraints);
      });
    };
  }

  // node_modules/webrtc-adapter/src/js/chrome/chrome_shim.js
  function shimMediaStream(window2) {
    window2.MediaStream = window2.MediaStream || window2.webkitMediaStream;
  }
  function shimOnTrack(window2) {
    if (typeof window2 === "object" && window2.RTCPeerConnection && !("ontrack" in window2.RTCPeerConnection.prototype)) {
      Object.defineProperty(window2.RTCPeerConnection.prototype, "ontrack", {
        get() {
          return this._ontrack;
        },
        set(f) {
          if (this._ontrack) {
            this.removeEventListener("track", this._ontrack);
          }
          this.addEventListener("track", this._ontrack = f);
        },
        enumerable: true,
        configurable: true
      });
      const origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
      window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
        if (!this._ontrackpoly) {
          this._ontrackpoly = (e) => {
            e.stream.addEventListener("addtrack", (te) => {
              let receiver;
              if (window2.RTCPeerConnection.prototype.getReceivers) {
                receiver = this.getReceivers().find((r) => r.track && r.track.id === te.track.id);
              } else {
                receiver = { track: te.track };
              }
              const event2 = new Event("track");
              event2.track = te.track;
              event2.receiver = receiver;
              event2.transceiver = { receiver };
              event2.streams = [e.stream];
              this.dispatchEvent(event2);
            });
            e.stream.getTracks().forEach((track) => {
              let receiver;
              if (window2.RTCPeerConnection.prototype.getReceivers) {
                receiver = this.getReceivers().find((r) => r.track && r.track.id === track.id);
              } else {
                receiver = { track };
              }
              const event2 = new Event("track");
              event2.track = track;
              event2.receiver = receiver;
              event2.transceiver = { receiver };
              event2.streams = [e.stream];
              this.dispatchEvent(event2);
            });
          };
          this.addEventListener("addstream", this._ontrackpoly);
        }
        return origSetRemoteDescription.apply(this, arguments);
      };
    } else {
      wrapPeerConnectionEvent(window2, "track", (e) => {
        if (!e.transceiver) {
          Object.defineProperty(
            e,
            "transceiver",
            { value: { receiver: e.receiver } }
          );
        }
        return e;
      });
    }
  }
  function shimGetSendersWithDtmf(window2) {
    if (typeof window2 === "object" && window2.RTCPeerConnection && !("getSenders" in window2.RTCPeerConnection.prototype) && "createDTMFSender" in window2.RTCPeerConnection.prototype) {
      const shimSenderWithDtmf = function(pc, track) {
        return {
          track,
          get dtmf() {
            if (this._dtmf === void 0) {
              if (track.kind === "audio") {
                this._dtmf = pc.createDTMFSender(track);
              } else {
                this._dtmf = null;
              }
            }
            return this._dtmf;
          },
          _pc: pc
        };
      };
      if (!window2.RTCPeerConnection.prototype.getSenders) {
        window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
          this._senders = this._senders || [];
          return this._senders.slice();
        };
        const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
        window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
          let sender = origAddTrack.apply(this, arguments);
          if (!sender) {
            sender = shimSenderWithDtmf(this, track);
            this._senders.push(sender);
          }
          return sender;
        };
        const origRemoveTrack = window2.RTCPeerConnection.prototype.removeTrack;
        window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
          origRemoveTrack.apply(this, arguments);
          const idx = this._senders.indexOf(sender);
          if (idx !== -1) {
            this._senders.splice(idx, 1);
          }
        };
      }
      const origAddStream = window2.RTCPeerConnection.prototype.addStream;
      window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
        this._senders = this._senders || [];
        origAddStream.apply(this, [stream]);
        stream.getTracks().forEach((track) => {
          this._senders.push(shimSenderWithDtmf(this, track));
        });
      };
      const origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
      window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
        this._senders = this._senders || [];
        origRemoveStream.apply(this, [stream]);
        stream.getTracks().forEach((track) => {
          const sender = this._senders.find((s) => s.track === track);
          if (sender) {
            this._senders.splice(this._senders.indexOf(sender), 1);
          }
        });
      };
    } else if (typeof window2 === "object" && window2.RTCPeerConnection && "getSenders" in window2.RTCPeerConnection.prototype && "createDTMFSender" in window2.RTCPeerConnection.prototype && window2.RTCRtpSender && !("dtmf" in window2.RTCRtpSender.prototype)) {
      const origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
      window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
        const senders = origGetSenders.apply(this, []);
        senders.forEach((sender) => sender._pc = this);
        return senders;
      };
      Object.defineProperty(window2.RTCRtpSender.prototype, "dtmf", {
        get() {
          if (this._dtmf === void 0) {
            if (this.track.kind === "audio") {
              this._dtmf = this._pc.createDTMFSender(this.track);
            } else {
              this._dtmf = null;
            }
          }
          return this._dtmf;
        }
      });
    }
  }
  function shimGetStats(window2) {
    if (!window2.RTCPeerConnection) {
      return;
    }
    const origGetStats = window2.RTCPeerConnection.prototype.getStats;
    window2.RTCPeerConnection.prototype.getStats = function getStats() {
      const [selector, onSucc, onErr] = arguments;
      if (arguments.length > 0 && typeof selector === "function") {
        return origGetStats.apply(this, arguments);
      }
      if (origGetStats.length === 0 && (arguments.length === 0 || typeof selector !== "function")) {
        return origGetStats.apply(this, []);
      }
      const fixChromeStats_ = function(response) {
        const standardReport = {};
        const reports = response.result();
        reports.forEach((report) => {
          const standardStats = {
            id: report.id,
            timestamp: report.timestamp,
            type: {
              localcandidate: "local-candidate",
              remotecandidate: "remote-candidate"
            }[report.type] || report.type
          };
          report.names().forEach((name) => {
            standardStats[name] = report.stat(name);
          });
          standardReport[standardStats.id] = standardStats;
        });
        return standardReport;
      };
      const makeMapStats = function(stats) {
        return new Map(Object.keys(stats).map((key) => [key, stats[key]]));
      };
      if (arguments.length >= 2) {
        const successCallbackWrapper_ = function(response) {
          onSucc(makeMapStats(fixChromeStats_(response)));
        };
        return origGetStats.apply(this, [
          successCallbackWrapper_,
          selector
        ]);
      }
      return new Promise((resolve, reject) => {
        origGetStats.apply(this, [
          function(response) {
            resolve(makeMapStats(fixChromeStats_(response)));
          },
          reject
        ]);
      }).then(onSucc, onErr);
    };
  }
  function shimSenderReceiverGetStats(window2) {
    if (!(typeof window2 === "object" && window2.RTCPeerConnection && window2.RTCRtpSender && window2.RTCRtpReceiver)) {
      return;
    }
    if (!("getStats" in window2.RTCRtpSender.prototype)) {
      const origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
      if (origGetSenders) {
        window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
          const senders = origGetSenders.apply(this, []);
          senders.forEach((sender) => sender._pc = this);
          return senders;
        };
      }
      const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
      if (origAddTrack) {
        window2.RTCPeerConnection.prototype.addTrack = function addTrack() {
          const sender = origAddTrack.apply(this, arguments);
          sender._pc = this;
          return sender;
        };
      }
      window2.RTCRtpSender.prototype.getStats = function getStats() {
        const sender = this;
        return this._pc.getStats().then((result) => filterStats(result, sender.track, true));
      };
    }
    if (!("getStats" in window2.RTCRtpReceiver.prototype)) {
      const origGetReceivers = window2.RTCPeerConnection.prototype.getReceivers;
      if (origGetReceivers) {
        window2.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
          const receivers = origGetReceivers.apply(this, []);
          receivers.forEach((receiver) => receiver._pc = this);
          return receivers;
        };
      }
      wrapPeerConnectionEvent(window2, "track", (e) => {
        e.receiver._pc = e.srcElement;
        return e;
      });
      window2.RTCRtpReceiver.prototype.getStats = function getStats() {
        const receiver = this;
        return this._pc.getStats().then((result) => filterStats(result, receiver.track, false));
      };
    }
    if (!("getStats" in window2.RTCRtpSender.prototype && "getStats" in window2.RTCRtpReceiver.prototype)) {
      return;
    }
    const origGetStats = window2.RTCPeerConnection.prototype.getStats;
    window2.RTCPeerConnection.prototype.getStats = function getStats() {
      if (arguments.length > 0 && arguments[0] instanceof window2.MediaStreamTrack) {
        const track = arguments[0];
        let sender;
        let receiver;
        let err;
        this.getSenders().forEach((s) => {
          if (s.track === track) {
            if (sender) {
              err = true;
            } else {
              sender = s;
            }
          }
        });
        this.getReceivers().forEach((r) => {
          if (r.track === track) {
            if (receiver) {
              err = true;
            } else {
              receiver = r;
            }
          }
          return r.track === track;
        });
        if (err || sender && receiver) {
          return Promise.reject(new DOMException(
            "There are more than one sender or receiver for the track.",
            "InvalidAccessError"
          ));
        } else if (sender) {
          return sender.getStats();
        } else if (receiver) {
          return receiver.getStats();
        }
        return Promise.reject(new DOMException(
          "There is no sender or receiver for the track.",
          "InvalidAccessError"
        ));
      }
      return origGetStats.apply(this, arguments);
    };
  }
  function shimAddTrackRemoveTrackWithNative(window2) {
    window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      return Object.keys(this._shimmedLocalStreams).map((streamId) => this._shimmedLocalStreams[streamId][0]);
    };
    const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
    window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
      if (!stream) {
        return origAddTrack.apply(this, arguments);
      }
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      const sender = origAddTrack.apply(this, arguments);
      if (!this._shimmedLocalStreams[stream.id]) {
        this._shimmedLocalStreams[stream.id] = [stream, sender];
      } else if (this._shimmedLocalStreams[stream.id].indexOf(sender) === -1) {
        this._shimmedLocalStreams[stream.id].push(sender);
      }
      return sender;
    };
    const origAddStream = window2.RTCPeerConnection.prototype.addStream;
    window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      stream.getTracks().forEach((track) => {
        const alreadyExists = this.getSenders().find((s) => s.track === track);
        if (alreadyExists) {
          throw new DOMException(
            "Track already exists.",
            "InvalidAccessError"
          );
        }
      });
      const existingSenders = this.getSenders();
      origAddStream.apply(this, arguments);
      const newSenders = this.getSenders().filter((newSender) => existingSenders.indexOf(newSender) === -1);
      this._shimmedLocalStreams[stream.id] = [stream].concat(newSenders);
    };
    const origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
    window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      delete this._shimmedLocalStreams[stream.id];
      return origRemoveStream.apply(this, arguments);
    };
    const origRemoveTrack = window2.RTCPeerConnection.prototype.removeTrack;
    window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
      this._shimmedLocalStreams = this._shimmedLocalStreams || {};
      if (sender) {
        Object.keys(this._shimmedLocalStreams).forEach((streamId) => {
          const idx = this._shimmedLocalStreams[streamId].indexOf(sender);
          if (idx !== -1) {
            this._shimmedLocalStreams[streamId].splice(idx, 1);
          }
          if (this._shimmedLocalStreams[streamId].length === 1) {
            delete this._shimmedLocalStreams[streamId];
          }
        });
      }
      return origRemoveTrack.apply(this, arguments);
    };
  }
  function shimAddTrackRemoveTrack(window2, browserDetails) {
    if (!window2.RTCPeerConnection) {
      return;
    }
    if (window2.RTCPeerConnection.prototype.addTrack && browserDetails.version >= 65) {
      return shimAddTrackRemoveTrackWithNative(window2);
    }
    const origGetLocalStreams = window2.RTCPeerConnection.prototype.getLocalStreams;
    window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
      const nativeStreams = origGetLocalStreams.apply(this);
      this._reverseStreams = this._reverseStreams || {};
      return nativeStreams.map((stream) => this._reverseStreams[stream.id]);
    };
    const origAddStream = window2.RTCPeerConnection.prototype.addStream;
    window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
      this._streams = this._streams || {};
      this._reverseStreams = this._reverseStreams || {};
      stream.getTracks().forEach((track) => {
        const alreadyExists = this.getSenders().find((s) => s.track === track);
        if (alreadyExists) {
          throw new DOMException(
            "Track already exists.",
            "InvalidAccessError"
          );
        }
      });
      if (!this._reverseStreams[stream.id]) {
        const newStream = new window2.MediaStream(stream.getTracks());
        this._streams[stream.id] = newStream;
        this._reverseStreams[newStream.id] = stream;
        stream = newStream;
      }
      origAddStream.apply(this, [stream]);
    };
    const origRemoveStream = window2.RTCPeerConnection.prototype.removeStream;
    window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
      this._streams = this._streams || {};
      this._reverseStreams = this._reverseStreams || {};
      origRemoveStream.apply(this, [this._streams[stream.id] || stream]);
      delete this._reverseStreams[this._streams[stream.id] ? this._streams[stream.id].id : stream.id];
      delete this._streams[stream.id];
    };
    window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, stream) {
      if (this.signalingState === "closed") {
        throw new DOMException(
          "The RTCPeerConnection's signalingState is 'closed'.",
          "InvalidStateError"
        );
      }
      const streams = [].slice.call(arguments, 1);
      if (streams.length !== 1 || !streams[0].getTracks().find((t) => t === track)) {
        throw new DOMException(
          "The adapter.js addTrack polyfill only supports a single  stream which is associated with the specified track.",
          "NotSupportedError"
        );
      }
      const alreadyExists = this.getSenders().find((s) => s.track === track);
      if (alreadyExists) {
        throw new DOMException(
          "Track already exists.",
          "InvalidAccessError"
        );
      }
      this._streams = this._streams || {};
      this._reverseStreams = this._reverseStreams || {};
      const oldStream = this._streams[stream.id];
      if (oldStream) {
        oldStream.addTrack(track);
        Promise.resolve().then(() => {
          this.dispatchEvent(new Event("negotiationneeded"));
        });
      } else {
        const newStream = new window2.MediaStream([track]);
        this._streams[stream.id] = newStream;
        this._reverseStreams[newStream.id] = stream;
        this.addStream(newStream);
      }
      return this.getSenders().find((s) => s.track === track);
    };
    function replaceInternalStreamId(pc, description) {
      let sdp = description.sdp;
      Object.keys(pc._reverseStreams || []).forEach((internalId) => {
        const externalStream = pc._reverseStreams[internalId];
        const internalStream = pc._streams[externalStream.id];
        sdp = sdp.replace(
          new RegExp(internalStream.id, "g"),
          externalStream.id
        );
      });
      return new RTCSessionDescription({
        type: description.type,
        sdp
      });
    }
    function replaceExternalStreamId(pc, description) {
      let sdp = description.sdp;
      Object.keys(pc._reverseStreams || []).forEach((internalId) => {
        const externalStream = pc._reverseStreams[internalId];
        const internalStream = pc._streams[externalStream.id];
        sdp = sdp.replace(
          new RegExp(externalStream.id, "g"),
          internalStream.id
        );
      });
      return new RTCSessionDescription({
        type: description.type,
        sdp
      });
    }
    ["createOffer", "createAnswer"].forEach(function(method) {
      const nativeMethod = window2.RTCPeerConnection.prototype[method];
      const methodObj = { [method]() {
        const args = arguments;
        const isLegacyCall = arguments.length && typeof arguments[0] === "function";
        if (isLegacyCall) {
          return nativeMethod.apply(this, [
            (description) => {
              const desc = replaceInternalStreamId(this, description);
              args[0].apply(null, [desc]);
            },
            (err) => {
              if (args[1]) {
                args[1].apply(null, err);
              }
            },
            arguments[2]
          ]);
        }
        return nativeMethod.apply(this, arguments).then((description) => replaceInternalStreamId(this, description));
      } };
      window2.RTCPeerConnection.prototype[method] = methodObj[method];
    });
    const origSetLocalDescription = window2.RTCPeerConnection.prototype.setLocalDescription;
    window2.RTCPeerConnection.prototype.setLocalDescription = function setLocalDescription() {
      if (!arguments.length || !arguments[0].type) {
        return origSetLocalDescription.apply(this, arguments);
      }
      arguments[0] = replaceExternalStreamId(this, arguments[0]);
      return origSetLocalDescription.apply(this, arguments);
    };
    const origLocalDescription = Object.getOwnPropertyDescriptor(
      window2.RTCPeerConnection.prototype,
      "localDescription"
    );
    Object.defineProperty(
      window2.RTCPeerConnection.prototype,
      "localDescription",
      {
        get() {
          const description = origLocalDescription.get.apply(this);
          if (description.type === "") {
            return description;
          }
          return replaceInternalStreamId(this, description);
        }
      }
    );
    window2.RTCPeerConnection.prototype.removeTrack = function removeTrack(sender) {
      if (this.signalingState === "closed") {
        throw new DOMException(
          "The RTCPeerConnection's signalingState is 'closed'.",
          "InvalidStateError"
        );
      }
      if (!sender._pc) {
        throw new DOMException("Argument 1 of RTCPeerConnection.removeTrack does not implement interface RTCRtpSender.", "TypeError");
      }
      const isLocal = sender._pc === this;
      if (!isLocal) {
        throw new DOMException(
          "Sender was not created by this connection.",
          "InvalidAccessError"
        );
      }
      this._streams = this._streams || {};
      let stream;
      Object.keys(this._streams).forEach((streamid) => {
        const hasTrack = this._streams[streamid].getTracks().find((track) => sender.track === track);
        if (hasTrack) {
          stream = this._streams[streamid];
        }
      });
      if (stream) {
        if (stream.getTracks().length === 1) {
          this.removeStream(this._reverseStreams[stream.id]);
        } else {
          stream.removeTrack(sender.track);
        }
        this.dispatchEvent(new Event("negotiationneeded"));
      }
    };
  }
  function shimPeerConnection(window2, browserDetails) {
    if (!window2.RTCPeerConnection && window2.webkitRTCPeerConnection) {
      window2.RTCPeerConnection = window2.webkitRTCPeerConnection;
    }
    if (!window2.RTCPeerConnection) {
      return;
    }
    if (browserDetails.version < 53) {
      ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(method) {
        const nativeMethod = window2.RTCPeerConnection.prototype[method];
        const methodObj = { [method]() {
          arguments[0] = new (method === "addIceCandidate" ? window2.RTCIceCandidate : window2.RTCSessionDescription)(arguments[0]);
          return nativeMethod.apply(this, arguments);
        } };
        window2.RTCPeerConnection.prototype[method] = methodObj[method];
      });
    }
  }
  function fixNegotiationNeeded(window2, browserDetails) {
    wrapPeerConnectionEvent(window2, "negotiationneeded", (e) => {
      const pc = e.target;
      if (browserDetails.version < 72 || pc.getConfiguration && pc.getConfiguration().sdpSemantics === "plan-b") {
        if (pc.signalingState !== "stable") {
          return;
        }
      }
      return e;
    });
  }

  // node_modules/webrtc-adapter/src/js/edge/edge_shim.js
  var edge_shim_exports = {};
  __export(edge_shim_exports, {
    shimGetDisplayMedia: () => shimGetDisplayMedia2,
    shimGetUserMedia: () => shimGetUserMedia2,
    shimPeerConnection: () => shimPeerConnection2,
    shimReplaceTrack: () => shimReplaceTrack
  });

  // node_modules/webrtc-adapter/src/js/edge/filtericeservers.js
  function filterIceServers(iceServers, edgeVersion) {
    let hasTurn = false;
    iceServers = JSON.parse(JSON.stringify(iceServers));
    return iceServers.filter((server) => {
      if (server && (server.urls || server.url)) {
        let urls = server.urls || server.url;
        if (server.url && !server.urls) {
          deprecated("RTCIceServer.url", "RTCIceServer.urls");
        }
        const isString2 = typeof urls === "string";
        if (isString2) {
          urls = [urls];
        }
        urls = urls.filter((url) => {
          if (url.indexOf("stun:") === 0) {
            return false;
          }
          const validTurn = url.startsWith("turn") && !url.startsWith("turn:[") && url.includes("transport=udp");
          if (validTurn && !hasTurn) {
            hasTurn = true;
            return true;
          }
          return validTurn && !hasTurn;
        });
        delete server.url;
        server.urls = isString2 ? urls[0] : urls;
        return !!urls.length;
      }
    });
  }

  // node_modules/webrtc-adapter/src/js/edge/edge_shim.js
  var import_rtcpeerconnection_shim = __toESM(require_rtcpeerconnection());

  // node_modules/webrtc-adapter/src/js/edge/getusermedia.js
  function shimGetUserMedia2(window2) {
    const navigator2 = window2 && window2.navigator;
    const shimError_ = function(e) {
      return {
        name: { PermissionDeniedError: "NotAllowedError" }[e.name] || e.name,
        message: e.message,
        constraint: e.constraint,
        toString() {
          return this.name;
        }
      };
    };
    const origGetUserMedia = navigator2.mediaDevices.getUserMedia.bind(navigator2.mediaDevices);
    navigator2.mediaDevices.getUserMedia = function(c) {
      return origGetUserMedia(c).catch((e) => Promise.reject(shimError_(e)));
    };
  }

  // node_modules/webrtc-adapter/src/js/edge/getdisplaymedia.js
  function shimGetDisplayMedia2(window2) {
    if (!("getDisplayMedia" in window2.navigator)) {
      return;
    }
    if (!window2.navigator.mediaDevices) {
      return;
    }
    if (window2.navigator.mediaDevices && "getDisplayMedia" in window2.navigator.mediaDevices) {
      return;
    }
    window2.navigator.mediaDevices.getDisplayMedia = window2.navigator.getDisplayMedia.bind(window2.navigator);
  }

  // node_modules/webrtc-adapter/src/js/edge/edge_shim.js
  function shimPeerConnection2(window2, browserDetails) {
    if (window2.RTCIceGatherer) {
      if (!window2.RTCIceCandidate) {
        window2.RTCIceCandidate = function RTCIceCandidate2(args) {
          return args;
        };
      }
      if (!window2.RTCSessionDescription) {
        window2.RTCSessionDescription = function RTCSessionDescription2(args) {
          return args;
        };
      }
      if (browserDetails.version < 15025) {
        const origMSTEnabled = Object.getOwnPropertyDescriptor(
          window2.MediaStreamTrack.prototype,
          "enabled"
        );
        Object.defineProperty(window2.MediaStreamTrack.prototype, "enabled", {
          set(value) {
            origMSTEnabled.set.call(this, value);
            const ev = new Event("enabled");
            ev.enabled = value;
            this.dispatchEvent(ev);
          }
        });
      }
    }
    if (window2.RTCRtpSender && !("dtmf" in window2.RTCRtpSender.prototype)) {
      Object.defineProperty(window2.RTCRtpSender.prototype, "dtmf", {
        get() {
          if (this._dtmf === void 0) {
            if (this.track.kind === "audio") {
              this._dtmf = new window2.RTCDtmfSender(this);
            } else if (this.track.kind === "video") {
              this._dtmf = null;
            }
          }
          return this._dtmf;
        }
      });
    }
    if (window2.RTCDtmfSender && !window2.RTCDTMFSender) {
      window2.RTCDTMFSender = window2.RTCDtmfSender;
    }
    const RTCPeerConnectionShim = (0, import_rtcpeerconnection_shim.default)(
      window2,
      browserDetails.version
    );
    window2.RTCPeerConnection = function RTCPeerConnection2(config) {
      if (config && config.iceServers) {
        config.iceServers = filterIceServers(
          config.iceServers,
          browserDetails.version
        );
        log("ICE servers after filtering:", config.iceServers);
      }
      return new RTCPeerConnectionShim(config);
    };
    window2.RTCPeerConnection.prototype = RTCPeerConnectionShim.prototype;
  }
  function shimReplaceTrack(window2) {
    if (window2.RTCRtpSender && !("replaceTrack" in window2.RTCRtpSender.prototype)) {
      window2.RTCRtpSender.prototype.replaceTrack = window2.RTCRtpSender.prototype.setTrack;
    }
  }

  // node_modules/webrtc-adapter/src/js/firefox/firefox_shim.js
  var firefox_shim_exports = {};
  __export(firefox_shim_exports, {
    shimAddTransceiver: () => shimAddTransceiver,
    shimCreateAnswer: () => shimCreateAnswer,
    shimCreateOffer: () => shimCreateOffer,
    shimGetDisplayMedia: () => shimGetDisplayMedia3,
    shimGetParameters: () => shimGetParameters,
    shimGetUserMedia: () => shimGetUserMedia3,
    shimOnTrack: () => shimOnTrack2,
    shimPeerConnection: () => shimPeerConnection3,
    shimRTCDataChannel: () => shimRTCDataChannel,
    shimReceiverGetStats: () => shimReceiverGetStats,
    shimRemoveStream: () => shimRemoveStream,
    shimSenderGetStats: () => shimSenderGetStats
  });

  // node_modules/webrtc-adapter/src/js/firefox/getusermedia.js
  function shimGetUserMedia3(window2, browserDetails) {
    const navigator2 = window2 && window2.navigator;
    const MediaStreamTrack = window2 && window2.MediaStreamTrack;
    navigator2.getUserMedia = function(constraints, onSuccess, onError) {
      deprecated(
        "navigator.getUserMedia",
        "navigator.mediaDevices.getUserMedia"
      );
      navigator2.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
    };
    if (!(browserDetails.version > 55 && "autoGainControl" in navigator2.mediaDevices.getSupportedConstraints())) {
      const remap = function(obj, a, b) {
        if (a in obj && !(b in obj)) {
          obj[b] = obj[a];
          delete obj[a];
        }
      };
      const nativeGetUserMedia = navigator2.mediaDevices.getUserMedia.bind(navigator2.mediaDevices);
      navigator2.mediaDevices.getUserMedia = function(c) {
        if (typeof c === "object" && typeof c.audio === "object") {
          c = JSON.parse(JSON.stringify(c));
          remap(c.audio, "autoGainControl", "mozAutoGainControl");
          remap(c.audio, "noiseSuppression", "mozNoiseSuppression");
        }
        return nativeGetUserMedia(c);
      };
      if (MediaStreamTrack && MediaStreamTrack.prototype.getSettings) {
        const nativeGetSettings = MediaStreamTrack.prototype.getSettings;
        MediaStreamTrack.prototype.getSettings = function() {
          const obj = nativeGetSettings.apply(this, arguments);
          remap(obj, "mozAutoGainControl", "autoGainControl");
          remap(obj, "mozNoiseSuppression", "noiseSuppression");
          return obj;
        };
      }
      if (MediaStreamTrack && MediaStreamTrack.prototype.applyConstraints) {
        const nativeApplyConstraints = MediaStreamTrack.prototype.applyConstraints;
        MediaStreamTrack.prototype.applyConstraints = function(c) {
          if (this.kind === "audio" && typeof c === "object") {
            c = JSON.parse(JSON.stringify(c));
            remap(c, "autoGainControl", "mozAutoGainControl");
            remap(c, "noiseSuppression", "mozNoiseSuppression");
          }
          return nativeApplyConstraints.apply(this, [c]);
        };
      }
    }
  }

  // node_modules/webrtc-adapter/src/js/firefox/getdisplaymedia.js
  function shimGetDisplayMedia3(window2, preferredMediaSource) {
    if (window2.navigator.mediaDevices && "getDisplayMedia" in window2.navigator.mediaDevices) {
      return;
    }
    if (!window2.navigator.mediaDevices) {
      return;
    }
    window2.navigator.mediaDevices.getDisplayMedia = function getDisplayMedia(constraints) {
      if (!(constraints && constraints.video)) {
        const err = new DOMException("getDisplayMedia without video constraints is undefined");
        err.name = "NotFoundError";
        err.code = 8;
        return Promise.reject(err);
      }
      if (constraints.video === true) {
        constraints.video = { mediaSource: preferredMediaSource };
      } else {
        constraints.video.mediaSource = preferredMediaSource;
      }
      return window2.navigator.mediaDevices.getUserMedia(constraints);
    };
  }

  // node_modules/webrtc-adapter/src/js/firefox/firefox_shim.js
  function shimOnTrack2(window2) {
    if (typeof window2 === "object" && window2.RTCTrackEvent && "receiver" in window2.RTCTrackEvent.prototype && !("transceiver" in window2.RTCTrackEvent.prototype)) {
      Object.defineProperty(window2.RTCTrackEvent.prototype, "transceiver", {
        get() {
          return { receiver: this.receiver };
        }
      });
    }
  }
  function shimPeerConnection3(window2, browserDetails) {
    if (typeof window2 !== "object" || !(window2.RTCPeerConnection || window2.mozRTCPeerConnection)) {
      return;
    }
    if (!window2.RTCPeerConnection && window2.mozRTCPeerConnection) {
      window2.RTCPeerConnection = window2.mozRTCPeerConnection;
    }
    if (browserDetails.version < 53) {
      ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(method) {
        const nativeMethod = window2.RTCPeerConnection.prototype[method];
        const methodObj = { [method]() {
          arguments[0] = new (method === "addIceCandidate" ? window2.RTCIceCandidate : window2.RTCSessionDescription)(arguments[0]);
          return nativeMethod.apply(this, arguments);
        } };
        window2.RTCPeerConnection.prototype[method] = methodObj[method];
      });
    }
    const modernStatsTypes = {
      inboundrtp: "inbound-rtp",
      outboundrtp: "outbound-rtp",
      candidatepair: "candidate-pair",
      localcandidate: "local-candidate",
      remotecandidate: "remote-candidate"
    };
    const nativeGetStats = window2.RTCPeerConnection.prototype.getStats;
    window2.RTCPeerConnection.prototype.getStats = function getStats() {
      const [selector, onSucc, onErr] = arguments;
      return nativeGetStats.apply(this, [selector || null]).then((stats) => {
        if (browserDetails.version < 53 && !onSucc) {
          try {
            stats.forEach((stat) => {
              stat.type = modernStatsTypes[stat.type] || stat.type;
            });
          } catch (e) {
            if (e.name !== "TypeError") {
              throw e;
            }
            stats.forEach((stat, i) => {
              stats.set(i, Object.assign({}, stat, {
                type: modernStatsTypes[stat.type] || stat.type
              }));
            });
          }
        }
        return stats;
      }).then(onSucc, onErr);
    };
  }
  function shimSenderGetStats(window2) {
    if (!(typeof window2 === "object" && window2.RTCPeerConnection && window2.RTCRtpSender)) {
      return;
    }
    if (window2.RTCRtpSender && "getStats" in window2.RTCRtpSender.prototype) {
      return;
    }
    const origGetSenders = window2.RTCPeerConnection.prototype.getSenders;
    if (origGetSenders) {
      window2.RTCPeerConnection.prototype.getSenders = function getSenders() {
        const senders = origGetSenders.apply(this, []);
        senders.forEach((sender) => sender._pc = this);
        return senders;
      };
    }
    const origAddTrack = window2.RTCPeerConnection.prototype.addTrack;
    if (origAddTrack) {
      window2.RTCPeerConnection.prototype.addTrack = function addTrack() {
        const sender = origAddTrack.apply(this, arguments);
        sender._pc = this;
        return sender;
      };
    }
    window2.RTCRtpSender.prototype.getStats = function getStats() {
      return this.track ? this._pc.getStats(this.track) : Promise.resolve(/* @__PURE__ */ new Map());
    };
  }
  function shimReceiverGetStats(window2) {
    if (!(typeof window2 === "object" && window2.RTCPeerConnection && window2.RTCRtpSender)) {
      return;
    }
    if (window2.RTCRtpSender && "getStats" in window2.RTCRtpReceiver.prototype) {
      return;
    }
    const origGetReceivers = window2.RTCPeerConnection.prototype.getReceivers;
    if (origGetReceivers) {
      window2.RTCPeerConnection.prototype.getReceivers = function getReceivers() {
        const receivers = origGetReceivers.apply(this, []);
        receivers.forEach((receiver) => receiver._pc = this);
        return receivers;
      };
    }
    wrapPeerConnectionEvent(window2, "track", (e) => {
      e.receiver._pc = e.srcElement;
      return e;
    });
    window2.RTCRtpReceiver.prototype.getStats = function getStats() {
      return this._pc.getStats(this.track);
    };
  }
  function shimRemoveStream(window2) {
    if (!window2.RTCPeerConnection || "removeStream" in window2.RTCPeerConnection.prototype) {
      return;
    }
    window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
      deprecated("removeStream", "removeTrack");
      this.getSenders().forEach((sender) => {
        if (sender.track && stream.getTracks().includes(sender.track)) {
          this.removeTrack(sender);
        }
      });
    };
  }
  function shimRTCDataChannel(window2) {
    if (window2.DataChannel && !window2.RTCDataChannel) {
      window2.RTCDataChannel = window2.DataChannel;
    }
  }
  function shimAddTransceiver(window2) {
    if (!(typeof window2 === "object" && window2.RTCPeerConnection)) {
      return;
    }
    const origAddTransceiver = window2.RTCPeerConnection.prototype.addTransceiver;
    if (origAddTransceiver) {
      window2.RTCPeerConnection.prototype.addTransceiver = function addTransceiver() {
        this.setParametersPromises = [];
        const initParameters = arguments[1];
        const shouldPerformCheck = initParameters && "sendEncodings" in initParameters;
        if (shouldPerformCheck) {
          initParameters.sendEncodings.forEach((encodingParam) => {
            if ("rid" in encodingParam) {
              const ridRegex = /^[a-z0-9]{0,16}$/i;
              if (!ridRegex.test(encodingParam.rid)) {
                throw new TypeError("Invalid RID value provided.");
              }
            }
            if ("scaleResolutionDownBy" in encodingParam) {
              if (!(parseFloat(encodingParam.scaleResolutionDownBy) >= 1)) {
                throw new RangeError("scale_resolution_down_by must be >= 1.0");
              }
            }
            if ("maxFramerate" in encodingParam) {
              if (!(parseFloat(encodingParam.maxFramerate) >= 0)) {
                throw new RangeError("max_framerate must be >= 0.0");
              }
            }
          });
        }
        const transceiver = origAddTransceiver.apply(this, arguments);
        if (shouldPerformCheck) {
          const { sender } = transceiver;
          const params = sender.getParameters();
          if (!("encodings" in params) || params.encodings.length === 1 && Object.keys(params.encodings[0]).length === 0) {
            params.encodings = initParameters.sendEncodings;
            sender.sendEncodings = initParameters.sendEncodings;
            this.setParametersPromises.push(
              sender.setParameters(params).then(() => {
                delete sender.sendEncodings;
              }).catch(() => {
                delete sender.sendEncodings;
              })
            );
          }
        }
        return transceiver;
      };
    }
  }
  function shimGetParameters(window2) {
    if (!(typeof window2 === "object" && window2.RTCRtpSender)) {
      return;
    }
    const origGetParameters = window2.RTCRtpSender.prototype.getParameters;
    if (origGetParameters) {
      window2.RTCRtpSender.prototype.getParameters = function getParameters() {
        const params = origGetParameters.apply(this, arguments);
        if (!("encodings" in params)) {
          params.encodings = [].concat(this.sendEncodings || [{}]);
        }
        return params;
      };
    }
  }
  function shimCreateOffer(window2) {
    if (!(typeof window2 === "object" && window2.RTCPeerConnection)) {
      return;
    }
    const origCreateOffer = window2.RTCPeerConnection.prototype.createOffer;
    window2.RTCPeerConnection.prototype.createOffer = function createOffer() {
      if (this.setParametersPromises && this.setParametersPromises.length) {
        return Promise.all(this.setParametersPromises).then(() => {
          return origCreateOffer.apply(this, arguments);
        }).finally(() => {
          this.setParametersPromises = [];
        });
      }
      return origCreateOffer.apply(this, arguments);
    };
  }
  function shimCreateAnswer(window2) {
    if (!(typeof window2 === "object" && window2.RTCPeerConnection)) {
      return;
    }
    const origCreateAnswer = window2.RTCPeerConnection.prototype.createAnswer;
    window2.RTCPeerConnection.prototype.createAnswer = function createAnswer() {
      if (this.setParametersPromises && this.setParametersPromises.length) {
        return Promise.all(this.setParametersPromises).then(() => {
          return origCreateAnswer.apply(this, arguments);
        }).finally(() => {
          this.setParametersPromises = [];
        });
      }
      return origCreateAnswer.apply(this, arguments);
    };
  }

  // node_modules/webrtc-adapter/src/js/safari/safari_shim.js
  var safari_shim_exports = {};
  __export(safari_shim_exports, {
    shimAudioContext: () => shimAudioContext,
    shimCallbacksAPI: () => shimCallbacksAPI,
    shimConstraints: () => shimConstraints,
    shimCreateOfferLegacy: () => shimCreateOfferLegacy,
    shimGetUserMedia: () => shimGetUserMedia4,
    shimLocalStreamsAPI: () => shimLocalStreamsAPI,
    shimRTCIceServerUrls: () => shimRTCIceServerUrls,
    shimRemoteStreamsAPI: () => shimRemoteStreamsAPI,
    shimTrackEventTransceiver: () => shimTrackEventTransceiver
  });
  function shimLocalStreamsAPI(window2) {
    if (typeof window2 !== "object" || !window2.RTCPeerConnection) {
      return;
    }
    if (!("getLocalStreams" in window2.RTCPeerConnection.prototype)) {
      window2.RTCPeerConnection.prototype.getLocalStreams = function getLocalStreams() {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        return this._localStreams;
      };
    }
    if (!("addStream" in window2.RTCPeerConnection.prototype)) {
      const _addTrack = window2.RTCPeerConnection.prototype.addTrack;
      window2.RTCPeerConnection.prototype.addStream = function addStream(stream) {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        if (!this._localStreams.includes(stream)) {
          this._localStreams.push(stream);
        }
        stream.getAudioTracks().forEach((track) => _addTrack.call(
          this,
          track,
          stream
        ));
        stream.getVideoTracks().forEach((track) => _addTrack.call(
          this,
          track,
          stream
        ));
      };
      window2.RTCPeerConnection.prototype.addTrack = function addTrack(track, ...streams) {
        if (streams) {
          streams.forEach((stream) => {
            if (!this._localStreams) {
              this._localStreams = [stream];
            } else if (!this._localStreams.includes(stream)) {
              this._localStreams.push(stream);
            }
          });
        }
        return _addTrack.apply(this, arguments);
      };
    }
    if (!("removeStream" in window2.RTCPeerConnection.prototype)) {
      window2.RTCPeerConnection.prototype.removeStream = function removeStream(stream) {
        if (!this._localStreams) {
          this._localStreams = [];
        }
        const index = this._localStreams.indexOf(stream);
        if (index === -1) {
          return;
        }
        this._localStreams.splice(index, 1);
        const tracks = stream.getTracks();
        this.getSenders().forEach((sender) => {
          if (tracks.includes(sender.track)) {
            this.removeTrack(sender);
          }
        });
      };
    }
  }
  function shimRemoteStreamsAPI(window2) {
    if (typeof window2 !== "object" || !window2.RTCPeerConnection) {
      return;
    }
    if (!("getRemoteStreams" in window2.RTCPeerConnection.prototype)) {
      window2.RTCPeerConnection.prototype.getRemoteStreams = function getRemoteStreams() {
        return this._remoteStreams ? this._remoteStreams : [];
      };
    }
    if (!("onaddstream" in window2.RTCPeerConnection.prototype)) {
      Object.defineProperty(window2.RTCPeerConnection.prototype, "onaddstream", {
        get() {
          return this._onaddstream;
        },
        set(f) {
          if (this._onaddstream) {
            this.removeEventListener("addstream", this._onaddstream);
            this.removeEventListener("track", this._onaddstreampoly);
          }
          this.addEventListener("addstream", this._onaddstream = f);
          this.addEventListener("track", this._onaddstreampoly = (e) => {
            e.streams.forEach((stream) => {
              if (!this._remoteStreams) {
                this._remoteStreams = [];
              }
              if (this._remoteStreams.includes(stream)) {
                return;
              }
              this._remoteStreams.push(stream);
              const event2 = new Event("addstream");
              event2.stream = stream;
              this.dispatchEvent(event2);
            });
          });
        }
      });
      const origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
      window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
        const pc = this;
        if (!this._onaddstreampoly) {
          this.addEventListener("track", this._onaddstreampoly = function(e) {
            e.streams.forEach((stream) => {
              if (!pc._remoteStreams) {
                pc._remoteStreams = [];
              }
              if (pc._remoteStreams.indexOf(stream) >= 0) {
                return;
              }
              pc._remoteStreams.push(stream);
              const event2 = new Event("addstream");
              event2.stream = stream;
              pc.dispatchEvent(event2);
            });
          });
        }
        return origSetRemoteDescription.apply(pc, arguments);
      };
    }
  }
  function shimCallbacksAPI(window2) {
    if (typeof window2 !== "object" || !window2.RTCPeerConnection) {
      return;
    }
    const prototype = window2.RTCPeerConnection.prototype;
    const origCreateOffer = prototype.createOffer;
    const origCreateAnswer = prototype.createAnswer;
    const setLocalDescription = prototype.setLocalDescription;
    const setRemoteDescription = prototype.setRemoteDescription;
    const addIceCandidate = prototype.addIceCandidate;
    prototype.createOffer = function createOffer(successCallback, failureCallback) {
      const options = arguments.length >= 2 ? arguments[2] : arguments[0];
      const promise = origCreateOffer.apply(this, [options]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.createAnswer = function createAnswer(successCallback, failureCallback) {
      const options = arguments.length >= 2 ? arguments[2] : arguments[0];
      const promise = origCreateAnswer.apply(this, [options]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    let withCallback = function(description, successCallback, failureCallback) {
      const promise = setLocalDescription.apply(this, [description]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.setLocalDescription = withCallback;
    withCallback = function(description, successCallback, failureCallback) {
      const promise = setRemoteDescription.apply(this, [description]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.setRemoteDescription = withCallback;
    withCallback = function(candidate, successCallback, failureCallback) {
      const promise = addIceCandidate.apply(this, [candidate]);
      if (!failureCallback) {
        return promise;
      }
      promise.then(successCallback, failureCallback);
      return Promise.resolve();
    };
    prototype.addIceCandidate = withCallback;
  }
  function shimGetUserMedia4(window2) {
    const navigator2 = window2 && window2.navigator;
    if (navigator2.mediaDevices && navigator2.mediaDevices.getUserMedia) {
      const mediaDevices = navigator2.mediaDevices;
      const _getUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
      navigator2.mediaDevices.getUserMedia = (constraints) => {
        return _getUserMedia(shimConstraints(constraints));
      };
    }
    if (!navigator2.getUserMedia && navigator2.mediaDevices && navigator2.mediaDevices.getUserMedia) {
      navigator2.getUserMedia = function getUserMedia(constraints, cb, errcb) {
        navigator2.mediaDevices.getUserMedia(constraints).then(cb, errcb);
      }.bind(navigator2);
    }
  }
  function shimConstraints(constraints) {
    if (constraints && constraints.video !== void 0) {
      return Object.assign(
        {},
        constraints,
        { video: compactObject(constraints.video) }
      );
    }
    return constraints;
  }
  function shimRTCIceServerUrls(window2) {
    if (!window2.RTCPeerConnection) {
      return;
    }
    const OrigPeerConnection = window2.RTCPeerConnection;
    window2.RTCPeerConnection = function RTCPeerConnection2(pcConfig, pcConstraints) {
      if (pcConfig && pcConfig.iceServers) {
        const newIceServers = [];
        for (let i = 0; i < pcConfig.iceServers.length; i++) {
          let server = pcConfig.iceServers[i];
          if (!server.hasOwnProperty("urls") && server.hasOwnProperty("url")) {
            deprecated("RTCIceServer.url", "RTCIceServer.urls");
            server = JSON.parse(JSON.stringify(server));
            server.urls = server.url;
            delete server.url;
            newIceServers.push(server);
          } else {
            newIceServers.push(pcConfig.iceServers[i]);
          }
        }
        pcConfig.iceServers = newIceServers;
      }
      return new OrigPeerConnection(pcConfig, pcConstraints);
    };
    window2.RTCPeerConnection.prototype = OrigPeerConnection.prototype;
    if ("generateCertificate" in OrigPeerConnection) {
      Object.defineProperty(window2.RTCPeerConnection, "generateCertificate", {
        get() {
          return OrigPeerConnection.generateCertificate;
        }
      });
    }
  }
  function shimTrackEventTransceiver(window2) {
    if (typeof window2 === "object" && window2.RTCTrackEvent && "receiver" in window2.RTCTrackEvent.prototype && !("transceiver" in window2.RTCTrackEvent.prototype)) {
      Object.defineProperty(window2.RTCTrackEvent.prototype, "transceiver", {
        get() {
          return { receiver: this.receiver };
        }
      });
    }
  }
  function shimCreateOfferLegacy(window2) {
    const origCreateOffer = window2.RTCPeerConnection.prototype.createOffer;
    window2.RTCPeerConnection.prototype.createOffer = function createOffer(offerOptions) {
      if (offerOptions) {
        if (typeof offerOptions.offerToReceiveAudio !== "undefined") {
          offerOptions.offerToReceiveAudio = !!offerOptions.offerToReceiveAudio;
        }
        const audioTransceiver = this.getTransceivers().find((transceiver) => transceiver.receiver.track.kind === "audio");
        if (offerOptions.offerToReceiveAudio === false && audioTransceiver) {
          if (audioTransceiver.direction === "sendrecv") {
            if (audioTransceiver.setDirection) {
              audioTransceiver.setDirection("sendonly");
            } else {
              audioTransceiver.direction = "sendonly";
            }
          } else if (audioTransceiver.direction === "recvonly") {
            if (audioTransceiver.setDirection) {
              audioTransceiver.setDirection("inactive");
            } else {
              audioTransceiver.direction = "inactive";
            }
          }
        } else if (offerOptions.offerToReceiveAudio === true && !audioTransceiver) {
          this.addTransceiver("audio");
        }
        if (typeof offerOptions.offerToReceiveVideo !== "undefined") {
          offerOptions.offerToReceiveVideo = !!offerOptions.offerToReceiveVideo;
        }
        const videoTransceiver = this.getTransceivers().find((transceiver) => transceiver.receiver.track.kind === "video");
        if (offerOptions.offerToReceiveVideo === false && videoTransceiver) {
          if (videoTransceiver.direction === "sendrecv") {
            if (videoTransceiver.setDirection) {
              videoTransceiver.setDirection("sendonly");
            } else {
              videoTransceiver.direction = "sendonly";
            }
          } else if (videoTransceiver.direction === "recvonly") {
            if (videoTransceiver.setDirection) {
              videoTransceiver.setDirection("inactive");
            } else {
              videoTransceiver.direction = "inactive";
            }
          }
        } else if (offerOptions.offerToReceiveVideo === true && !videoTransceiver) {
          this.addTransceiver("video");
        }
      }
      return origCreateOffer.apply(this, arguments);
    };
  }
  function shimAudioContext(window2) {
    if (typeof window2 !== "object" || window2.AudioContext) {
      return;
    }
    window2.AudioContext = window2.webkitAudioContext;
  }

  // node_modules/webrtc-adapter/src/js/common_shim.js
  var common_shim_exports = {};
  __export(common_shim_exports, {
    removeExtmapAllowMixed: () => removeExtmapAllowMixed,
    shimAddIceCandidateNullOrEmpty: () => shimAddIceCandidateNullOrEmpty,
    shimConnectionState: () => shimConnectionState,
    shimMaxMessageSize: () => shimMaxMessageSize,
    shimRTCIceCandidate: () => shimRTCIceCandidate,
    shimSendThrowTypeError: () => shimSendThrowTypeError
  });
  var import_sdp = __toESM(require_sdp());
  function shimRTCIceCandidate(window2) {
    if (!window2.RTCIceCandidate || window2.RTCIceCandidate && "foundation" in window2.RTCIceCandidate.prototype) {
      return;
    }
    const NativeRTCIceCandidate = window2.RTCIceCandidate;
    window2.RTCIceCandidate = function RTCIceCandidate2(args) {
      if (typeof args === "object" && args.candidate && args.candidate.indexOf("a=") === 0) {
        args = JSON.parse(JSON.stringify(args));
        args.candidate = args.candidate.substr(2);
      }
      if (args.candidate && args.candidate.length) {
        const nativeCandidate = new NativeRTCIceCandidate(args);
        const parsedCandidate = import_sdp.default.parseCandidate(args.candidate);
        const augmentedCandidate = Object.assign(
          nativeCandidate,
          parsedCandidate
        );
        augmentedCandidate.toJSON = function toJSON() {
          return {
            candidate: augmentedCandidate.candidate,
            sdpMid: augmentedCandidate.sdpMid,
            sdpMLineIndex: augmentedCandidate.sdpMLineIndex,
            usernameFragment: augmentedCandidate.usernameFragment
          };
        };
        return augmentedCandidate;
      }
      return new NativeRTCIceCandidate(args);
    };
    window2.RTCIceCandidate.prototype = NativeRTCIceCandidate.prototype;
    wrapPeerConnectionEvent(window2, "icecandidate", (e) => {
      if (e.candidate) {
        Object.defineProperty(e, "candidate", {
          value: new window2.RTCIceCandidate(e.candidate),
          writable: "false"
        });
      }
      return e;
    });
  }
  function shimMaxMessageSize(window2, browserDetails) {
    if (!window2.RTCPeerConnection) {
      return;
    }
    if (!("sctp" in window2.RTCPeerConnection.prototype)) {
      Object.defineProperty(window2.RTCPeerConnection.prototype, "sctp", {
        get() {
          return typeof this._sctp === "undefined" ? null : this._sctp;
        }
      });
    }
    const sctpInDescription = function(description) {
      if (!description || !description.sdp) {
        return false;
      }
      const sections = import_sdp.default.splitSections(description.sdp);
      sections.shift();
      return sections.some((mediaSection) => {
        const mLine = import_sdp.default.parseMLine(mediaSection);
        return mLine && mLine.kind === "application" && mLine.protocol.indexOf("SCTP") !== -1;
      });
    };
    const getRemoteFirefoxVersion = function(description) {
      const match = description.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
      if (match === null || match.length < 2) {
        return -1;
      }
      const version = parseInt(match[1], 10);
      return version !== version ? -1 : version;
    };
    const getCanSendMaxMessageSize = function(remoteIsFirefox) {
      let canSendMaxMessageSize = 65536;
      if (browserDetails.browser === "firefox") {
        if (browserDetails.version < 57) {
          if (remoteIsFirefox === -1) {
            canSendMaxMessageSize = 16384;
          } else {
            canSendMaxMessageSize = 2147483637;
          }
        } else if (browserDetails.version < 60) {
          canSendMaxMessageSize = browserDetails.version === 57 ? 65535 : 65536;
        } else {
          canSendMaxMessageSize = 2147483637;
        }
      }
      return canSendMaxMessageSize;
    };
    const getMaxMessageSize = function(description, remoteIsFirefox) {
      let maxMessageSize = 65536;
      if (browserDetails.browser === "firefox" && browserDetails.version === 57) {
        maxMessageSize = 65535;
      }
      const match = import_sdp.default.matchPrefix(
        description.sdp,
        "a=max-message-size:"
      );
      if (match.length > 0) {
        maxMessageSize = parseInt(match[0].substr(19), 10);
      } else if (browserDetails.browser === "firefox" && remoteIsFirefox !== -1) {
        maxMessageSize = 2147483637;
      }
      return maxMessageSize;
    };
    const origSetRemoteDescription = window2.RTCPeerConnection.prototype.setRemoteDescription;
    window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription() {
      this._sctp = null;
      if (browserDetails.browser === "chrome" && browserDetails.version >= 76) {
        const { sdpSemantics } = this.getConfiguration();
        if (sdpSemantics === "plan-b") {
          Object.defineProperty(this, "sctp", {
            get() {
              return typeof this._sctp === "undefined" ? null : this._sctp;
            },
            enumerable: true,
            configurable: true
          });
        }
      }
      if (sctpInDescription(arguments[0])) {
        const isFirefox = getRemoteFirefoxVersion(arguments[0]);
        const canSendMMS = getCanSendMaxMessageSize(isFirefox);
        const remoteMMS = getMaxMessageSize(arguments[0], isFirefox);
        let maxMessageSize;
        if (canSendMMS === 0 && remoteMMS === 0) {
          maxMessageSize = Number.POSITIVE_INFINITY;
        } else if (canSendMMS === 0 || remoteMMS === 0) {
          maxMessageSize = Math.max(canSendMMS, remoteMMS);
        } else {
          maxMessageSize = Math.min(canSendMMS, remoteMMS);
        }
        const sctp = {};
        Object.defineProperty(sctp, "maxMessageSize", {
          get() {
            return maxMessageSize;
          }
        });
        this._sctp = sctp;
      }
      return origSetRemoteDescription.apply(this, arguments);
    };
  }
  function shimSendThrowTypeError(window2) {
    if (!(window2.RTCPeerConnection && "createDataChannel" in window2.RTCPeerConnection.prototype)) {
      return;
    }
    function wrapDcSend(dc, pc) {
      const origDataChannelSend = dc.send;
      dc.send = function send5() {
        const data = arguments[0];
        const length = data.length || data.size || data.byteLength;
        if (dc.readyState === "open" && pc.sctp && length > pc.sctp.maxMessageSize) {
          throw new TypeError("Message too large (can send a maximum of " + pc.sctp.maxMessageSize + " bytes)");
        }
        return origDataChannelSend.apply(dc, arguments);
      };
    }
    const origCreateDataChannel = window2.RTCPeerConnection.prototype.createDataChannel;
    window2.RTCPeerConnection.prototype.createDataChannel = function createDataChannel() {
      const dataChannel = origCreateDataChannel.apply(this, arguments);
      wrapDcSend(dataChannel, this);
      return dataChannel;
    };
    wrapPeerConnectionEvent(window2, "datachannel", (e) => {
      wrapDcSend(e.channel, e.target);
      return e;
    });
  }
  function shimConnectionState(window2) {
    if (!window2.RTCPeerConnection || "connectionState" in window2.RTCPeerConnection.prototype) {
      return;
    }
    const proto = window2.RTCPeerConnection.prototype;
    Object.defineProperty(proto, "connectionState", {
      get() {
        return {
          completed: "connected",
          checking: "connecting"
        }[this.iceConnectionState] || this.iceConnectionState;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(proto, "onconnectionstatechange", {
      get() {
        return this._onconnectionstatechange || null;
      },
      set(cb) {
        if (this._onconnectionstatechange) {
          this.removeEventListener(
            "connectionstatechange",
            this._onconnectionstatechange
          );
          delete this._onconnectionstatechange;
        }
        if (cb) {
          this.addEventListener(
            "connectionstatechange",
            this._onconnectionstatechange = cb
          );
        }
      },
      enumerable: true,
      configurable: true
    });
    ["setLocalDescription", "setRemoteDescription"].forEach((method) => {
      const origMethod = proto[method];
      proto[method] = function() {
        if (!this._connectionstatechangepoly) {
          this._connectionstatechangepoly = (e) => {
            const pc = e.target;
            if (pc._lastConnectionState !== pc.connectionState) {
              pc._lastConnectionState = pc.connectionState;
              const newEvent = new Event("connectionstatechange", e);
              pc.dispatchEvent(newEvent);
            }
            return e;
          };
          this.addEventListener(
            "iceconnectionstatechange",
            this._connectionstatechangepoly
          );
        }
        return origMethod.apply(this, arguments);
      };
    });
  }
  function removeExtmapAllowMixed(window2, browserDetails) {
    if (!window2.RTCPeerConnection) {
      return;
    }
    if (browserDetails.browser === "chrome" && browserDetails.version >= 71) {
      return;
    }
    if (browserDetails.browser === "safari" && browserDetails.version >= 605) {
      return;
    }
    const nativeSRD = window2.RTCPeerConnection.prototype.setRemoteDescription;
    window2.RTCPeerConnection.prototype.setRemoteDescription = function setRemoteDescription(desc) {
      if (desc && desc.sdp && desc.sdp.indexOf("\na=extmap-allow-mixed") !== -1) {
        const sdp = desc.sdp.split("\n").filter((line) => {
          return line.trim() !== "a=extmap-allow-mixed";
        }).join("\n");
        if (window2.RTCSessionDescription && desc instanceof window2.RTCSessionDescription) {
          arguments[0] = new window2.RTCSessionDescription({
            type: desc.type,
            sdp
          });
        } else {
          desc.sdp = sdp;
        }
      }
      return nativeSRD.apply(this, arguments);
    };
  }
  function shimAddIceCandidateNullOrEmpty(window2, browserDetails) {
    if (!(window2.RTCPeerConnection && window2.RTCPeerConnection.prototype)) {
      return;
    }
    const nativeAddIceCandidate = window2.RTCPeerConnection.prototype.addIceCandidate;
    if (!nativeAddIceCandidate || nativeAddIceCandidate.length === 0) {
      return;
    }
    window2.RTCPeerConnection.prototype.addIceCandidate = function addIceCandidate() {
      if (!arguments[0]) {
        if (arguments[1]) {
          arguments[1].apply(null);
        }
        return Promise.resolve();
      }
      if ((browserDetails.browser === "chrome" && browserDetails.version < 78 || browserDetails.browser === "firefox" && browserDetails.version < 68 || browserDetails.browser === "safari") && arguments[0] && arguments[0].candidate === "") {
        return Promise.resolve();
      }
      return nativeAddIceCandidate.apply(this, arguments);
    };
  }

  // node_modules/webrtc-adapter/src/js/adapter_factory.js
  function adapterFactory({ window: window2 } = {}, options = {
    shimChrome: true,
    shimFirefox: true,
    shimEdge: true,
    shimSafari: true
  }) {
    const logging2 = log;
    const browserDetails = detectBrowser(window2);
    const adapter2 = {
      browserDetails,
      commonShim: common_shim_exports,
      extractVersion,
      disableLog,
      disableWarnings
    };
    switch (browserDetails.browser) {
      case "chrome":
        if (!chrome_shim_exports || !shimPeerConnection || !options.shimChrome) {
          logging2("Chrome shim is not included in this adapter release.");
          return adapter2;
        }
        if (browserDetails.version === null) {
          logging2("Chrome shim can not determine version, not shimming.");
          return adapter2;
        }
        logging2("adapter.js shimming chrome.");
        adapter2.browserShim = chrome_shim_exports;
        shimAddIceCandidateNullOrEmpty(window2, browserDetails);
        shimGetUserMedia(window2, browserDetails);
        shimMediaStream(window2, browserDetails);
        shimPeerConnection(window2, browserDetails);
        shimOnTrack(window2, browserDetails);
        shimAddTrackRemoveTrack(window2, browserDetails);
        shimGetSendersWithDtmf(window2, browserDetails);
        shimGetStats(window2, browserDetails);
        shimSenderReceiverGetStats(window2, browserDetails);
        fixNegotiationNeeded(window2, browserDetails);
        shimRTCIceCandidate(window2, browserDetails);
        shimConnectionState(window2, browserDetails);
        shimMaxMessageSize(window2, browserDetails);
        shimSendThrowTypeError(window2, browserDetails);
        removeExtmapAllowMixed(window2, browserDetails);
        break;
      case "firefox":
        if (!firefox_shim_exports || !shimPeerConnection3 || !options.shimFirefox) {
          logging2("Firefox shim is not included in this adapter release.");
          return adapter2;
        }
        logging2("adapter.js shimming firefox.");
        adapter2.browserShim = firefox_shim_exports;
        shimAddIceCandidateNullOrEmpty(window2, browserDetails);
        shimGetUserMedia3(window2, browserDetails);
        shimPeerConnection3(window2, browserDetails);
        shimOnTrack2(window2, browserDetails);
        shimRemoveStream(window2, browserDetails);
        shimSenderGetStats(window2, browserDetails);
        shimReceiverGetStats(window2, browserDetails);
        shimRTCDataChannel(window2, browserDetails);
        shimAddTransceiver(window2, browserDetails);
        shimGetParameters(window2, browserDetails);
        shimCreateOffer(window2, browserDetails);
        shimCreateAnswer(window2, browserDetails);
        shimRTCIceCandidate(window2, browserDetails);
        shimConnectionState(window2, browserDetails);
        shimMaxMessageSize(window2, browserDetails);
        shimSendThrowTypeError(window2, browserDetails);
        break;
      case "edge":
        if (!edge_shim_exports || !shimPeerConnection2 || !options.shimEdge) {
          logging2("MS edge shim is not included in this adapter release.");
          return adapter2;
        }
        logging2("adapter.js shimming edge.");
        adapter2.browserShim = edge_shim_exports;
        shimGetUserMedia2(window2, browserDetails);
        shimGetDisplayMedia2(window2, browserDetails);
        shimPeerConnection2(window2, browserDetails);
        shimReplaceTrack(window2, browserDetails);
        shimMaxMessageSize(window2, browserDetails);
        shimSendThrowTypeError(window2, browserDetails);
        break;
      case "safari":
        if (!safari_shim_exports || !options.shimSafari) {
          logging2("Safari shim is not included in this adapter release.");
          return adapter2;
        }
        logging2("adapter.js shimming safari.");
        adapter2.browserShim = safari_shim_exports;
        shimAddIceCandidateNullOrEmpty(window2, browserDetails);
        shimRTCIceServerUrls(window2, browserDetails);
        shimCreateOfferLegacy(window2, browserDetails);
        shimCallbacksAPI(window2, browserDetails);
        shimLocalStreamsAPI(window2, browserDetails);
        shimRemoteStreamsAPI(window2, browserDetails);
        shimTrackEventTransceiver(window2, browserDetails);
        shimGetUserMedia4(window2, browserDetails);
        shimAudioContext(window2, browserDetails);
        shimRTCIceCandidate(window2, browserDetails);
        shimMaxMessageSize(window2, browserDetails);
        shimSendThrowTypeError(window2, browserDetails);
        removeExtmapAllowMixed(window2, browserDetails);
        break;
      default:
        logging2("Unsupported browser!");
        break;
    }
    return adapter2;
  }

  // node_modules/webrtc-adapter/src/js/adapter_core.js
  var adapter = adapterFactory({ window: typeof window === "undefined" ? void 0 : window });
  var adapter_core_default = adapter;

  // node_modules/peerjs/dist/bundler.mjs
  function $parcel$export(e, n, v, s) {
    Object.defineProperty(e, n, { get: v, set: s, enumerable: true, configurable: true });
  }
  var $af8cf1f663f490f4$var$webRTCAdapter = adapter_core_default.default || adapter_core_default;
  var $af8cf1f663f490f4$export$25be9502477c137d = new (function() {
    function class_1() {
      this.isIOS = [
        "iPad",
        "iPhone",
        "iPod"
      ].includes(navigator.platform);
      this.supportedBrowsers = [
        "firefox",
        "chrome",
        "safari"
      ];
      this.minFirefoxVersion = 59;
      this.minChromeVersion = 72;
      this.minSafariVersion = 605;
    }
    class_1.prototype.isWebRTCSupported = function() {
      return typeof RTCPeerConnection !== "undefined";
    };
    class_1.prototype.isBrowserSupported = function() {
      var browser = this.getBrowser();
      var version = this.getVersion();
      var validBrowser = this.supportedBrowsers.includes(browser);
      if (!validBrowser)
        return false;
      if (browser === "chrome")
        return version >= this.minChromeVersion;
      if (browser === "firefox")
        return version >= this.minFirefoxVersion;
      if (browser === "safari")
        return !this.isIOS && version >= this.minSafariVersion;
      return false;
    };
    class_1.prototype.getBrowser = function() {
      return $af8cf1f663f490f4$var$webRTCAdapter.browserDetails.browser;
    };
    class_1.prototype.getVersion = function() {
      return $af8cf1f663f490f4$var$webRTCAdapter.browserDetails.version || 0;
    };
    class_1.prototype.isUnifiedPlanSupported = function() {
      var browser = this.getBrowser();
      var version = $af8cf1f663f490f4$var$webRTCAdapter.browserDetails.version || 0;
      if (browser === "chrome" && version < this.minChromeVersion)
        return false;
      if (browser === "firefox" && version >= this.minFirefoxVersion)
        return true;
      if (!window.RTCRtpTransceiver || !("currentDirection" in RTCRtpTransceiver.prototype))
        return false;
      var tempPc;
      var supported = false;
      try {
        tempPc = new RTCPeerConnection();
        tempPc.addTransceiver("audio");
        supported = true;
      } catch (e) {
      } finally {
        if (tempPc)
          tempPc.close();
      }
      return supported;
    };
    class_1.prototype.toString = function() {
      return "Supports:\n    browser:".concat(this.getBrowser(), "\n    version:").concat(this.getVersion(), "\n    isIOS:").concat(this.isIOS, "\n    isWebRTCSupported:").concat(this.isWebRTCSupported(), "\n    isBrowserSupported:").concat(this.isBrowserSupported(), "\n    isUnifiedPlanSupported:").concat(this.isUnifiedPlanSupported());
    };
    return class_1;
  }())();
  var $06cb531ed7840f78$var$DEFAULT_CONFIG = {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302"
      },
      {
        urls: [
          "turn:eu-0.turn.peerjs.com:3478",
          "turn:us-0.turn.peerjs.com:3478"
        ],
        username: "peerjs",
        credential: "peerjsp"
      }
    ],
    sdpSemantics: "unified-plan"
  };
  var $06cb531ed7840f78$var$Util = function() {
    function Util() {
      this.CLOUD_HOST = "0.peerjs.com";
      this.CLOUD_PORT = 443;
      this.chunkedBrowsers = {
        Chrome: 1,
        chrome: 1
      };
      this.chunkedMTU = 16300;
      this.defaultConfig = $06cb531ed7840f78$var$DEFAULT_CONFIG;
      this.browser = $af8cf1f663f490f4$export$25be9502477c137d.getBrowser();
      this.browserVersion = $af8cf1f663f490f4$export$25be9502477c137d.getVersion();
      this.supports = function() {
        var supported = {
          browser: $af8cf1f663f490f4$export$25be9502477c137d.isBrowserSupported(),
          webRTC: $af8cf1f663f490f4$export$25be9502477c137d.isWebRTCSupported(),
          audioVideo: false,
          data: false,
          binaryBlob: false,
          reliable: false
        };
        if (!supported.webRTC)
          return supported;
        var pc;
        try {
          pc = new RTCPeerConnection($06cb531ed7840f78$var$DEFAULT_CONFIG);
          supported.audioVideo = true;
          var dc = void 0;
          try {
            dc = pc.createDataChannel("_PEERJSTEST", {
              ordered: true
            });
            supported.data = true;
            supported.reliable = !!dc.ordered;
            try {
              dc.binaryType = "blob";
              supported.binaryBlob = !$af8cf1f663f490f4$export$25be9502477c137d.isIOS;
            } catch (e) {
            }
          } catch (e) {
          } finally {
            if (dc)
              dc.close();
          }
        } catch (e) {
        } finally {
          if (pc)
            pc.close();
        }
        return supported;
      }();
      this.pack = import_peerjs_js_binarypack.default.pack;
      this.unpack = import_peerjs_js_binarypack.default.unpack;
      this._dataCount = 1;
    }
    Util.prototype.noop = function() {
    };
    Util.prototype.validateId = function(id) {
      return !id || /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.test(id);
    };
    Util.prototype.chunk = function(blob) {
      var chunks = [];
      var size = blob.size;
      var total = Math.ceil(size / $06cb531ed7840f78$export$7debb50ef11d5e0b.chunkedMTU);
      var index = 0;
      var start3 = 0;
      while (start3 < size) {
        var end = Math.min(size, start3 + $06cb531ed7840f78$export$7debb50ef11d5e0b.chunkedMTU);
        var b = blob.slice(start3, end);
        var chunk = {
          __peerData: this._dataCount,
          n: index,
          data: b,
          total
        };
        chunks.push(chunk);
        start3 = end;
        index++;
      }
      this._dataCount++;
      return chunks;
    };
    Util.prototype.blobToArrayBuffer = function(blob, cb) {
      var fr = new FileReader();
      fr.onload = function(evt) {
        if (evt.target)
          cb(evt.target.result);
      };
      fr.readAsArrayBuffer(blob);
      return fr;
    };
    Util.prototype.binaryStringToArrayBuffer = function(binary) {
      var byteArray = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i++)
        byteArray[i] = binary.charCodeAt(i) & 255;
      return byteArray.buffer;
    };
    Util.prototype.randomToken = function() {
      return Math.random().toString(36).slice(2);
    };
    Util.prototype.isSecure = function() {
      return location.protocol === "https:";
    };
    return Util;
  }();
  var $06cb531ed7840f78$export$7debb50ef11d5e0b = new $06cb531ed7840f78$var$Util();
  var $26088d7da5b03f69$exports = {};
  $parcel$export($26088d7da5b03f69$exports, "Peer", () => $26088d7da5b03f69$export$ecd1fc136c422448, (v) => $26088d7da5b03f69$export$ecd1fc136c422448 = v);
  var $ac9b757d51178e15$exports = {};
  var $ac9b757d51178e15$var$has = Object.prototype.hasOwnProperty;
  var $ac9b757d51178e15$var$prefix = "~";
  function $ac9b757d51178e15$var$Events() {
  }
  if (Object.create) {
    $ac9b757d51178e15$var$Events.prototype = /* @__PURE__ */ Object.create(null);
    if (!new $ac9b757d51178e15$var$Events().__proto__)
      $ac9b757d51178e15$var$prefix = false;
  }
  function $ac9b757d51178e15$var$EE(fn, context, once2) {
    this.fn = fn;
    this.context = context;
    this.once = once2 || false;
  }
  function $ac9b757d51178e15$var$addListener(emitter, event2, fn, context, once2) {
    if (typeof fn !== "function")
      throw new TypeError("The listener must be a function");
    var listener = new $ac9b757d51178e15$var$EE(fn, context || emitter, once2), evt = $ac9b757d51178e15$var$prefix ? $ac9b757d51178e15$var$prefix + event2 : event2;
    if (!emitter._events[evt])
      emitter._events[evt] = listener, emitter._eventsCount++;
    else if (!emitter._events[evt].fn)
      emitter._events[evt].push(listener);
    else
      emitter._events[evt] = [
        emitter._events[evt],
        listener
      ];
    return emitter;
  }
  function $ac9b757d51178e15$var$clearEvent(emitter, evt) {
    if (--emitter._eventsCount === 0)
      emitter._events = new $ac9b757d51178e15$var$Events();
    else
      delete emitter._events[evt];
  }
  function $ac9b757d51178e15$var$EventEmitter() {
    this._events = new $ac9b757d51178e15$var$Events();
    this._eventsCount = 0;
  }
  $ac9b757d51178e15$var$EventEmitter.prototype.eventNames = function eventNames() {
    var names = [], events, name;
    if (this._eventsCount === 0)
      return names;
    for (name in events = this._events)
      if ($ac9b757d51178e15$var$has.call(events, name))
        names.push($ac9b757d51178e15$var$prefix ? name.slice(1) : name);
    if (Object.getOwnPropertySymbols)
      return names.concat(Object.getOwnPropertySymbols(events));
    return names;
  };
  $ac9b757d51178e15$var$EventEmitter.prototype.listeners = function listeners(event2) {
    var evt = $ac9b757d51178e15$var$prefix ? $ac9b757d51178e15$var$prefix + event2 : event2, handlers = this._events[evt];
    if (!handlers)
      return [];
    if (handlers.fn)
      return [
        handlers.fn
      ];
    for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++)
      ee[i] = handlers[i].fn;
    return ee;
  };
  $ac9b757d51178e15$var$EventEmitter.prototype.listenerCount = function listenerCount(event2) {
    var evt = $ac9b757d51178e15$var$prefix ? $ac9b757d51178e15$var$prefix + event2 : event2, listeners2 = this._events[evt];
    if (!listeners2)
      return 0;
    if (listeners2.fn)
      return 1;
    return listeners2.length;
  };
  $ac9b757d51178e15$var$EventEmitter.prototype.emit = function emit(event2, a1, a2, a3, a4, a5) {
    var evt = $ac9b757d51178e15$var$prefix ? $ac9b757d51178e15$var$prefix + event2 : event2;
    if (!this._events[evt])
      return false;
    var listeners2 = this._events[evt], len = arguments.length, args, i;
    if (listeners2.fn) {
      if (listeners2.once)
        this.removeListener(event2, listeners2.fn, void 0, true);
      switch (len) {
        case 1:
          return listeners2.fn.call(listeners2.context), true;
        case 2:
          return listeners2.fn.call(listeners2.context, a1), true;
        case 3:
          return listeners2.fn.call(listeners2.context, a1, a2), true;
        case 4:
          return listeners2.fn.call(listeners2.context, a1, a2, a3), true;
        case 5:
          return listeners2.fn.call(listeners2.context, a1, a2, a3, a4), true;
        case 6:
          return listeners2.fn.call(listeners2.context, a1, a2, a3, a4, a5), true;
      }
      for (i = 1, args = new Array(len - 1); i < len; i++)
        args[i - 1] = arguments[i];
      listeners2.fn.apply(listeners2.context, args);
    } else {
      var length = listeners2.length, j;
      for (i = 0; i < length; i++) {
        if (listeners2[i].once)
          this.removeListener(event2, listeners2[i].fn, void 0, true);
        switch (len) {
          case 1:
            listeners2[i].fn.call(listeners2[i].context);
            break;
          case 2:
            listeners2[i].fn.call(listeners2[i].context, a1);
            break;
          case 3:
            listeners2[i].fn.call(listeners2[i].context, a1, a2);
            break;
          case 4:
            listeners2[i].fn.call(listeners2[i].context, a1, a2, a3);
            break;
          default:
            if (!args)
              for (j = 1, args = new Array(len - 1); j < len; j++)
                args[j - 1] = arguments[j];
            listeners2[i].fn.apply(listeners2[i].context, args);
        }
      }
    }
    return true;
  };
  $ac9b757d51178e15$var$EventEmitter.prototype.on = function on(event2, fn, context) {
    return $ac9b757d51178e15$var$addListener(this, event2, fn, context, false);
  };
  $ac9b757d51178e15$var$EventEmitter.prototype.once = function once(event2, fn, context) {
    return $ac9b757d51178e15$var$addListener(this, event2, fn, context, true);
  };
  $ac9b757d51178e15$var$EventEmitter.prototype.removeListener = function removeListener(event2, fn, context, once2) {
    var evt = $ac9b757d51178e15$var$prefix ? $ac9b757d51178e15$var$prefix + event2 : event2;
    if (!this._events[evt])
      return this;
    if (!fn) {
      $ac9b757d51178e15$var$clearEvent(this, evt);
      return this;
    }
    var listeners2 = this._events[evt];
    if (listeners2.fn) {
      if (listeners2.fn === fn && (!once2 || listeners2.once) && (!context || listeners2.context === context))
        $ac9b757d51178e15$var$clearEvent(this, evt);
    } else {
      for (var i = 0, events = [], length = listeners2.length; i < length; i++)
        if (listeners2[i].fn !== fn || once2 && !listeners2[i].once || context && listeners2[i].context !== context)
          events.push(listeners2[i]);
      if (events.length)
        this._events[evt] = events.length === 1 ? events[0] : events;
      else
        $ac9b757d51178e15$var$clearEvent(this, evt);
    }
    return this;
  };
  $ac9b757d51178e15$var$EventEmitter.prototype.removeAllListeners = function removeAllListeners(event2) {
    var evt;
    if (event2) {
      evt = $ac9b757d51178e15$var$prefix ? $ac9b757d51178e15$var$prefix + event2 : event2;
      if (this._events[evt])
        $ac9b757d51178e15$var$clearEvent(this, evt);
    } else {
      this._events = new $ac9b757d51178e15$var$Events();
      this._eventsCount = 0;
    }
    return this;
  };
  $ac9b757d51178e15$var$EventEmitter.prototype.off = $ac9b757d51178e15$var$EventEmitter.prototype.removeListener;
  $ac9b757d51178e15$var$EventEmitter.prototype.addListener = $ac9b757d51178e15$var$EventEmitter.prototype.on;
  $ac9b757d51178e15$var$EventEmitter.prefixed = $ac9b757d51178e15$var$prefix;
  $ac9b757d51178e15$var$EventEmitter.EventEmitter = $ac9b757d51178e15$var$EventEmitter;
  $ac9b757d51178e15$exports = $ac9b757d51178e15$var$EventEmitter;
  var $1615705ecc6adca3$exports = {};
  $parcel$export($1615705ecc6adca3$exports, "LogLevel", () => $1615705ecc6adca3$export$243e62d78d3b544d, (v) => $1615705ecc6adca3$export$243e62d78d3b544d = v);
  $parcel$export($1615705ecc6adca3$exports, "default", () => $1615705ecc6adca3$export$2e2bcd8739ae039, (v) => $1615705ecc6adca3$export$2e2bcd8739ae039 = v);
  var $1615705ecc6adca3$var$__read = function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m)
      return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
        ar.push(r.value);
    } catch (error3) {
      e = {
        error: error3
      };
    } finally {
      try {
        if (r && !r.done && (m = i["return"]))
          m.call(i);
      } finally {
        if (e)
          throw e.error;
      }
    }
    return ar;
  };
  var $1615705ecc6adca3$var$__spreadArray = function(to, from, pack) {
    if (pack || arguments.length === 2) {
      for (var i = 0, l = from.length, ar; i < l; i++)
        if (ar || !(i in from)) {
          if (!ar)
            ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
  var $1615705ecc6adca3$var$LOG_PREFIX = "PeerJS: ";
  var $1615705ecc6adca3$export$243e62d78d3b544d;
  (function($1615705ecc6adca3$export$243e62d78d3b544d2) {
    $1615705ecc6adca3$export$243e62d78d3b544d2[$1615705ecc6adca3$export$243e62d78d3b544d2["Disabled"] = 0] = "Disabled";
    $1615705ecc6adca3$export$243e62d78d3b544d2[$1615705ecc6adca3$export$243e62d78d3b544d2["Errors"] = 1] = "Errors";
    $1615705ecc6adca3$export$243e62d78d3b544d2[$1615705ecc6adca3$export$243e62d78d3b544d2["Warnings"] = 2] = "Warnings";
    $1615705ecc6adca3$export$243e62d78d3b544d2[$1615705ecc6adca3$export$243e62d78d3b544d2["All"] = 3] = "All";
  })($1615705ecc6adca3$export$243e62d78d3b544d || ($1615705ecc6adca3$export$243e62d78d3b544d = {}));
  var $1615705ecc6adca3$var$Logger = function() {
    function Logger() {
      this._logLevel = $1615705ecc6adca3$export$243e62d78d3b544d.Disabled;
    }
    Object.defineProperty(Logger.prototype, "logLevel", {
      get: function() {
        return this._logLevel;
      },
      set: function(logLevel) {
        this._logLevel = logLevel;
      },
      enumerable: false,
      configurable: true
    });
    Logger.prototype.log = function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++)
        args[_i] = arguments[_i];
      if (this._logLevel >= $1615705ecc6adca3$export$243e62d78d3b544d.All)
        this._print.apply(this, $1615705ecc6adca3$var$__spreadArray([
          $1615705ecc6adca3$export$243e62d78d3b544d.All
        ], $1615705ecc6adca3$var$__read(args), false));
    };
    Logger.prototype.warn = function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++)
        args[_i] = arguments[_i];
      if (this._logLevel >= $1615705ecc6adca3$export$243e62d78d3b544d.Warnings)
        this._print.apply(this, $1615705ecc6adca3$var$__spreadArray([
          $1615705ecc6adca3$export$243e62d78d3b544d.Warnings
        ], $1615705ecc6adca3$var$__read(args), false));
    };
    Logger.prototype.error = function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++)
        args[_i] = arguments[_i];
      if (this._logLevel >= $1615705ecc6adca3$export$243e62d78d3b544d.Errors)
        this._print.apply(this, $1615705ecc6adca3$var$__spreadArray([
          $1615705ecc6adca3$export$243e62d78d3b544d.Errors
        ], $1615705ecc6adca3$var$__read(args), false));
    };
    Logger.prototype.setLogFunction = function(fn) {
      this._print = fn;
    };
    Logger.prototype._print = function(logLevel) {
      var rest = [];
      for (var _i = 1; _i < arguments.length; _i++)
        rest[_i - 1] = arguments[_i];
      var copy = $1615705ecc6adca3$var$__spreadArray([
        $1615705ecc6adca3$var$LOG_PREFIX
      ], $1615705ecc6adca3$var$__read(rest), false);
      for (var i in copy)
        if (copy[i] instanceof Error)
          copy[i] = "(" + copy[i].name + ") " + copy[i].message;
      if (logLevel >= $1615705ecc6adca3$export$243e62d78d3b544d.All)
        console.log.apply(console, $1615705ecc6adca3$var$__spreadArray([], $1615705ecc6adca3$var$__read(copy), false));
      else if (logLevel >= $1615705ecc6adca3$export$243e62d78d3b544d.Warnings)
        console.warn.apply(console, $1615705ecc6adca3$var$__spreadArray([
          "WARNING"
        ], $1615705ecc6adca3$var$__read(copy), false));
      else if (logLevel >= $1615705ecc6adca3$export$243e62d78d3b544d.Errors)
        console.error.apply(console, $1615705ecc6adca3$var$__spreadArray([
          "ERROR"
        ], $1615705ecc6adca3$var$__read(copy), false));
    };
    return Logger;
  }();
  var $1615705ecc6adca3$export$2e2bcd8739ae039 = new $1615705ecc6adca3$var$Logger();
  var $31d11a8d122cb4b7$exports = {};
  $parcel$export($31d11a8d122cb4b7$exports, "Socket", () => $31d11a8d122cb4b7$export$4798917dbf149b79, (v) => $31d11a8d122cb4b7$export$4798917dbf149b79 = v);
  var $60fadef21a2daafc$export$3157d57b4135e3bc;
  (function($60fadef21a2daafc$export$3157d57b4135e3bc2) {
    $60fadef21a2daafc$export$3157d57b4135e3bc2["Data"] = "data";
    $60fadef21a2daafc$export$3157d57b4135e3bc2["Media"] = "media";
  })($60fadef21a2daafc$export$3157d57b4135e3bc || ($60fadef21a2daafc$export$3157d57b4135e3bc = {}));
  var $60fadef21a2daafc$export$9547aaa2e39030ff;
  (function($60fadef21a2daafc$export$9547aaa2e39030ff2) {
    $60fadef21a2daafc$export$9547aaa2e39030ff2["BrowserIncompatible"] = "browser-incompatible";
    $60fadef21a2daafc$export$9547aaa2e39030ff2["Disconnected"] = "disconnected";
    $60fadef21a2daafc$export$9547aaa2e39030ff2["InvalidID"] = "invalid-id";
    $60fadef21a2daafc$export$9547aaa2e39030ff2["InvalidKey"] = "invalid-key";
    $60fadef21a2daafc$export$9547aaa2e39030ff2["Network"] = "network";
    $60fadef21a2daafc$export$9547aaa2e39030ff2["PeerUnavailable"] = "peer-unavailable";
    $60fadef21a2daafc$export$9547aaa2e39030ff2["SslUnavailable"] = "ssl-unavailable";
    $60fadef21a2daafc$export$9547aaa2e39030ff2["ServerError"] = "server-error";
    $60fadef21a2daafc$export$9547aaa2e39030ff2["SocketError"] = "socket-error";
    $60fadef21a2daafc$export$9547aaa2e39030ff2["SocketClosed"] = "socket-closed";
    $60fadef21a2daafc$export$9547aaa2e39030ff2["UnavailableID"] = "unavailable-id";
    $60fadef21a2daafc$export$9547aaa2e39030ff2["WebRTC"] = "webrtc";
  })($60fadef21a2daafc$export$9547aaa2e39030ff || ($60fadef21a2daafc$export$9547aaa2e39030ff = {}));
  var $60fadef21a2daafc$export$89f507cf986a947;
  (function($60fadef21a2daafc$export$89f507cf986a9472) {
    $60fadef21a2daafc$export$89f507cf986a9472["Binary"] = "binary";
    $60fadef21a2daafc$export$89f507cf986a9472["BinaryUTF8"] = "binary-utf8";
    $60fadef21a2daafc$export$89f507cf986a9472["JSON"] = "json";
  })($60fadef21a2daafc$export$89f507cf986a947 || ($60fadef21a2daafc$export$89f507cf986a947 = {}));
  var $60fadef21a2daafc$export$3b5c4a4b6354f023;
  (function($60fadef21a2daafc$export$3b5c4a4b6354f0232) {
    $60fadef21a2daafc$export$3b5c4a4b6354f0232["Message"] = "message";
    $60fadef21a2daafc$export$3b5c4a4b6354f0232["Disconnected"] = "disconnected";
    $60fadef21a2daafc$export$3b5c4a4b6354f0232["Error"] = "error";
    $60fadef21a2daafc$export$3b5c4a4b6354f0232["Close"] = "close";
  })($60fadef21a2daafc$export$3b5c4a4b6354f023 || ($60fadef21a2daafc$export$3b5c4a4b6354f023 = {}));
  var $60fadef21a2daafc$export$adb4a1754da6f10d;
  (function($60fadef21a2daafc$export$adb4a1754da6f10d2) {
    $60fadef21a2daafc$export$adb4a1754da6f10d2["Heartbeat"] = "HEARTBEAT";
    $60fadef21a2daafc$export$adb4a1754da6f10d2["Candidate"] = "CANDIDATE";
    $60fadef21a2daafc$export$adb4a1754da6f10d2["Offer"] = "OFFER";
    $60fadef21a2daafc$export$adb4a1754da6f10d2["Answer"] = "ANSWER";
    $60fadef21a2daafc$export$adb4a1754da6f10d2["Open"] = "OPEN";
    $60fadef21a2daafc$export$adb4a1754da6f10d2["Error"] = "ERROR";
    $60fadef21a2daafc$export$adb4a1754da6f10d2["IdTaken"] = "ID-TAKEN";
    $60fadef21a2daafc$export$adb4a1754da6f10d2["InvalidKey"] = "INVALID-KEY";
    $60fadef21a2daafc$export$adb4a1754da6f10d2["Leave"] = "LEAVE";
    $60fadef21a2daafc$export$adb4a1754da6f10d2["Expire"] = "EXPIRE";
  })($60fadef21a2daafc$export$adb4a1754da6f10d || ($60fadef21a2daafc$export$adb4a1754da6f10d = {}));
  var $0d1ed891c5cb27c0$exports = {};
  $0d1ed891c5cb27c0$exports = JSON.parse('{"name":"peerjs","version":"1.4.7","keywords":["peerjs","webrtc","p2p","rtc"],"description":"PeerJS client","homepage":"https://peerjs.com","bugs":{"url":"https://github.com/peers/peerjs/issues"},"repository":{"type":"git","url":"https://github.com/peers/peerjs"},"license":"MIT","contributors":["Michelle Bu <michelle@michellebu.com>","afrokick <devbyru@gmail.com>","ericz <really.ez@gmail.com>","Jairo <kidandcat@gmail.com>","Jonas Gloning <34194370+jonasgloning@users.noreply.github.com>","Jairo Caro-Accino Viciana <jairo@galax.be>","Carlos Caballero <carlos.caballero.gonzalez@gmail.com>","hc <hheennrryy@gmail.com>","Muhammad Asif <capripio@gmail.com>","PrashoonB <prashoonbhattacharjee@gmail.com>","Harsh Bardhan Mishra <47351025+HarshCasper@users.noreply.github.com>","akotynski <aleksanderkotbury@gmail.com>","lmb <i@lmb.io>","Jairooo <jairocaro@msn.com>","Moritz St\xFCckler <moritz.stueckler@gmail.com>","Simon <crydotsnakegithub@gmail.com>","Denis Lukov <denismassters@gmail.com>","Philipp Hancke <fippo@andyet.net>","Hans Oksendahl <hansoksendahl@gmail.com>","Jess <jessachandler@gmail.com>","khankuan <khankuan@gmail.com>","DUODVK <kurmanov.work@gmail.com>","XiZhao <kwang1imsa@gmail.com>","Matthias Lohr <matthias@lohr.me>","=frank tree <=frnktrb@googlemail.com>","Andre Eckardt <aeckardt@outlook.com>","Chris Cowan <agentme49@gmail.com>","Alex Chuev <alex@chuev.com>","alxnull <alxnull@e.mail.de>","Yemel Jardi <angel.jardi@gmail.com>","Ben Parnell <benjaminparnell.94@gmail.com>","Benny Lichtner <bennlich@gmail.com>","fresheneesz <bitetrudpublic@gmail.com>","bob.barstead@exaptive.com <bob.barstead@exaptive.com>","chandika <chandika@gmail.com>","emersion <contact@emersion.fr>","Christopher Van <cvan@users.noreply.github.com>","eddieherm <edhermoso@gmail.com>","Eduardo Pinho <enet4mikeenet@gmail.com>","Evandro Zanatta <ezanatta@tray.net.br>","Gardner Bickford <gardner@users.noreply.github.com>","Gian Luca <gianluca.cecchi@cynny.com>","PatrickJS <github@gdi2290.com>","jonnyf <github@jonathanfoss.co.uk>","Hizkia Felix <hizkifw@gmail.com>","Hristo Oskov <hristo.oskov@gmail.com>","Isaac Madwed <i.madwed@gmail.com>","Ilya Konanykhin <ilya.konanykhin@gmail.com>","jasonbarry <jasbarry@me.com>","Jonathan Burke <jonathan.burke.1311@googlemail.com>","Josh Hamit <josh.hamit@gmail.com>","Jordan Austin <jrax86@gmail.com>","Joel Wetzell <jwetzell@yahoo.com>","xizhao <kevin.wang@cloudera.com>","Alberto Torres <kungfoobar@gmail.com>","Jonathan Mayol <mayoljonathan@gmail.com>","Jefferson Felix <me@jsfelix.dev>","Rolf Erik Lekang <me@rolflekang.com>","Kevin Mai-Husan Chia <mhchia@users.noreply.github.com>","Pepijn de Vos <pepijndevos@gmail.com>","JooYoung <qkdlql@naver.com>","Tobias Speicher <rootcommander@gmail.com>","Steve Blaurock <sblaurock@gmail.com>","Kyrylo Shegeda <shegeda@ualberta.ca>","Diwank Singh Tomer <singh@diwank.name>","So\u0308ren Balko <Soeren.Balko@gmail.com>","Arpit Solanki <solankiarpit1997@gmail.com>","Yuki Ito <yuki@gnnk.net>","Artur Zayats <zag2art@gmail.com>"],"funding":{"type":"opencollective","url":"https://opencollective.com/peer"},"collective":{"type":"opencollective","url":"https://opencollective.com/peer"},"files":["dist/*"],"sideEffects":["lib/global.ts","lib/supports.ts"],"main":"dist/bundler.cjs","module":"dist/bundler.mjs","browser-minified":"dist/peerjs.min.js","browser-unminified":"dist/peerjs.js","types":"dist/types.d.ts","engines":{"node":">= 10"},"targets":{"types":{"source":"lib/exports.ts"},"main":{"source":"lib/exports.ts","sourceMap":{"inlineSources":true}},"module":{"source":"lib/exports.ts","includeNodeModules":["eventemitter3"],"sourceMap":{"inlineSources":true}},"browser-minified":{"context":"browser","outputFormat":"global","optimize":true,"engines":{"browsers":"cover 99%, not dead"},"source":"lib/global.ts"},"browser-unminified":{"context":"browser","outputFormat":"global","optimize":false,"engines":{"browsers":"cover 99%, not dead"},"source":"lib/global.ts"}},"scripts":{"contributors":"git-authors-cli --print=false && prettier --write package.json && git add package.json package-lock.json && git commit -m \\"chore(contributors): update and sort contributors list\\"","check":"tsc --noEmit","watch":"parcel watch","build":"rm -rf dist && parcel build","prepublishOnly":"npm run build","test":"mocha -r ts-node/register -r jsdom-global/register test/**/*.ts","format":"prettier --write .","semantic-release":"semantic-release"},"devDependencies":{"@parcel/config-default":"^2.5.0","@parcel/packager-ts":"^2.5.0","@parcel/transformer-typescript-tsc":"^2.5.0","@parcel/transformer-typescript-types":"^2.5.0","@semantic-release/changelog":"^6.0.1","@semantic-release/git":"^10.0.1","@types/chai":"^4.3.0","@types/mocha":"^9.1.0","@types/node":"^17.0.18","chai":"^4.3.6","git-authors-cli":"^1.0.40","jsdom":"^19.0.0","jsdom-global":"^3.0.2","mocha":"^9.2.0","mock-socket":"8.0.5","parcel":"^2.5.0","parcel-transformer-tsc-sourcemaps":"^1.0.2","prettier":"^2.6.2","semantic-release":"^19.0.2","standard":"^16.0.4","ts-node":"^10.5.0","typescript":"^4.5.5"},"dependencies":{"@swc/helpers":"^0.3.13","eventemitter3":"^4.0.7","peerjs-js-binarypack":"1.0.1","webrtc-adapter":"^7.7.1"}}');
  var $31d11a8d122cb4b7$var$__extends = function() {
    var extendStatics = function(d1, b1) {
      extendStatics = Object.setPrototypeOf || {
        __proto__: []
      } instanceof Array && function(d, b) {
        d.__proto__ = b;
      } || function(d, b) {
        for (var p in b)
          if (Object.prototype.hasOwnProperty.call(b, p))
            d[p] = b[p];
      };
      return extendStatics(d1, b1);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var $31d11a8d122cb4b7$var$__read = function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m)
      return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
        ar.push(r.value);
    } catch (error3) {
      e = {
        error: error3
      };
    } finally {
      try {
        if (r && !r.done && (m = i["return"]))
          m.call(i);
      } finally {
        if (e)
          throw e.error;
      }
    }
    return ar;
  };
  var $31d11a8d122cb4b7$var$__spreadArray = function(to, from, pack) {
    if (pack || arguments.length === 2) {
      for (var i = 0, l = from.length, ar; i < l; i++)
        if (ar || !(i in from)) {
          if (!ar)
            ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
  var $31d11a8d122cb4b7$var$__values = function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m)
      return m.call(o);
    if (o && typeof o.length === "number")
      return {
        next: function() {
          if (o && i >= o.length)
            o = void 0;
          return {
            value: o && o[i++],
            done: !o
          };
        }
      };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  };
  var $31d11a8d122cb4b7$export$4798917dbf149b79 = function(_super) {
    $31d11a8d122cb4b7$var$__extends($31d11a8d122cb4b7$export$4798917dbf149b792, _super);
    function $31d11a8d122cb4b7$export$4798917dbf149b792(secure, host, port, path2, key, pingInterval) {
      if (pingInterval === void 0)
        pingInterval = 5e3;
      var _this = _super.call(this) || this;
      _this.pingInterval = pingInterval;
      _this._disconnected = true;
      _this._messagesQueue = [];
      var wsProtocol = secure ? "wss://" : "ws://";
      _this._baseUrl = wsProtocol + host + ":" + port + path2 + "peerjs?key=" + key;
      return _this;
    }
    $31d11a8d122cb4b7$export$4798917dbf149b792.prototype.start = function(id, token) {
      var _this = this;
      this._id = id;
      var wsUrl = "".concat(this._baseUrl, "&id=").concat(id, "&token=").concat(token);
      if (!!this._socket || !this._disconnected)
        return;
      this._socket = new WebSocket(wsUrl + "&version=" + $0d1ed891c5cb27c0$exports.version);
      this._disconnected = false;
      this._socket.onmessage = function(event2) {
        var data;
        try {
          data = JSON.parse(event2.data);
          $1615705ecc6adca3$exports.default.log("Server message received:", data);
        } catch (e) {
          $1615705ecc6adca3$exports.default.log("Invalid server message", event2.data);
          return;
        }
        _this.emit($60fadef21a2daafc$export$3b5c4a4b6354f023.Message, data);
      };
      this._socket.onclose = function(event2) {
        if (_this._disconnected)
          return;
        $1615705ecc6adca3$exports.default.log("Socket closed.", event2);
        _this._cleanup();
        _this._disconnected = true;
        _this.emit($60fadef21a2daafc$export$3b5c4a4b6354f023.Disconnected);
      };
      this._socket.onopen = function() {
        if (_this._disconnected)
          return;
        _this._sendQueuedMessages();
        $1615705ecc6adca3$exports.default.log("Socket open");
        _this._scheduleHeartbeat();
      };
    };
    $31d11a8d122cb4b7$export$4798917dbf149b792.prototype._scheduleHeartbeat = function() {
      var _this = this;
      this._wsPingTimer = setTimeout(function() {
        _this._sendHeartbeat();
      }, this.pingInterval);
    };
    $31d11a8d122cb4b7$export$4798917dbf149b792.prototype._sendHeartbeat = function() {
      if (!this._wsOpen()) {
        $1615705ecc6adca3$exports.default.log("Cannot send heartbeat, because socket closed");
        return;
      }
      var message = JSON.stringify({
        type: $60fadef21a2daafc$export$adb4a1754da6f10d.Heartbeat
      });
      this._socket.send(message);
      this._scheduleHeartbeat();
    };
    $31d11a8d122cb4b7$export$4798917dbf149b792.prototype._wsOpen = function() {
      return !!this._socket && this._socket.readyState === 1;
    };
    $31d11a8d122cb4b7$export$4798917dbf149b792.prototype._sendQueuedMessages = function() {
      var e_1, _a2;
      var copiedQueue = $31d11a8d122cb4b7$var$__spreadArray([], $31d11a8d122cb4b7$var$__read(this._messagesQueue), false);
      this._messagesQueue = [];
      try {
        for (var copiedQueue_1 = $31d11a8d122cb4b7$var$__values(copiedQueue), copiedQueue_1_1 = copiedQueue_1.next(); !copiedQueue_1_1.done; copiedQueue_1_1 = copiedQueue_1.next()) {
          var message = copiedQueue_1_1.value;
          this.send(message);
        }
      } catch (e_1_1) {
        e_1 = {
          error: e_1_1
        };
      } finally {
        try {
          if (copiedQueue_1_1 && !copiedQueue_1_1.done && (_a2 = copiedQueue_1.return))
            _a2.call(copiedQueue_1);
        } finally {
          if (e_1)
            throw e_1.error;
        }
      }
    };
    $31d11a8d122cb4b7$export$4798917dbf149b792.prototype.send = function(data) {
      if (this._disconnected)
        return;
      if (!this._id) {
        this._messagesQueue.push(data);
        return;
      }
      if (!data.type) {
        this.emit($60fadef21a2daafc$export$3b5c4a4b6354f023.Error, "Invalid message");
        return;
      }
      if (!this._wsOpen())
        return;
      var message = JSON.stringify(data);
      this._socket.send(message);
    };
    $31d11a8d122cb4b7$export$4798917dbf149b792.prototype.close = function() {
      if (this._disconnected)
        return;
      this._cleanup();
      this._disconnected = true;
    };
    $31d11a8d122cb4b7$export$4798917dbf149b792.prototype._cleanup = function() {
      if (this._socket) {
        this._socket.onopen = this._socket.onmessage = this._socket.onclose = null;
        this._socket.close();
        this._socket = void 0;
      }
      clearTimeout(this._wsPingTimer);
    };
    return $31d11a8d122cb4b7$export$4798917dbf149b792;
  }($ac9b757d51178e15$exports.EventEmitter);
  var $353dee38f9ab557b$exports = {};
  $parcel$export($353dee38f9ab557b$exports, "MediaConnection", () => $353dee38f9ab557b$export$4a84e95a2324ac29, (v) => $353dee38f9ab557b$export$4a84e95a2324ac29 = v);
  var $77f14d3e81888156$exports = {};
  $parcel$export($77f14d3e81888156$exports, "Negotiator", () => $77f14d3e81888156$export$89e6bb5ad64bf4a, (v) => $77f14d3e81888156$export$89e6bb5ad64bf4a = v);
  var $77f14d3e81888156$var$__assign = function() {
    $77f14d3e81888156$var$__assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
      }
      return t;
    };
    return $77f14d3e81888156$var$__assign.apply(this, arguments);
  };
  var $77f14d3e81888156$var$__awaiter = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var $77f14d3e81888156$var$__generator = function(thisArg, body) {
    var _ = {
      label: 0,
      sent: function() {
        if (t[0] & 1)
          throw t[1];
        return t[1];
      },
      trys: [],
      ops: []
    }, f, y, t, g;
    return g = {
      next: verb(0),
      "throw": verb(1),
      "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
      return this;
    }), g;
    function verb(n) {
      return function(v) {
        return step([
          n,
          v
        ]);
      };
    }
    function step(op) {
      if (f)
        throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
            return t;
          if (y = 0, t)
            op = [
              op[0] & 2,
              t.value
            ];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return {
                value: op[1],
                done: false
              };
            case 5:
              _.label++;
              y = op[1];
              op = [
                0
              ];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2])
                _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [
            6,
            e
          ];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5)
        throw op[1];
      return {
        value: op[0] ? op[1] : void 0,
        done: true
      };
    }
  };
  var $77f14d3e81888156$export$89e6bb5ad64bf4a = function() {
    function $77f14d3e81888156$export$89e6bb5ad64bf4a2(connection) {
      this.connection = connection;
    }
    $77f14d3e81888156$export$89e6bb5ad64bf4a2.prototype.startConnection = function(options) {
      var peerConnection = this._startPeerConnection();
      this.connection.peerConnection = peerConnection;
      if (this.connection.type === $60fadef21a2daafc$export$3157d57b4135e3bc.Media && options._stream)
        this._addTracksToConnection(options._stream, peerConnection);
      if (options.originator) {
        if (this.connection.type === $60fadef21a2daafc$export$3157d57b4135e3bc.Data) {
          var dataConnection = this.connection;
          var config = {
            ordered: !!options.reliable
          };
          var dataChannel = peerConnection.createDataChannel(dataConnection.label, config);
          dataConnection.initialize(dataChannel);
        }
        this._makeOffer();
      } else
        this.handleSDP("OFFER", options.sdp);
    };
    $77f14d3e81888156$export$89e6bb5ad64bf4a2.prototype._startPeerConnection = function() {
      $1615705ecc6adca3$exports.default.log("Creating RTCPeerConnection.");
      var peerConnection = new RTCPeerConnection(this.connection.provider.options.config);
      this._setupListeners(peerConnection);
      return peerConnection;
    };
    $77f14d3e81888156$export$89e6bb5ad64bf4a2.prototype._setupListeners = function(peerConnection) {
      var _this = this;
      var peerId = this.connection.peer;
      var connectionId = this.connection.connectionId;
      var connectionType = this.connection.type;
      var provider = this.connection.provider;
      $1615705ecc6adca3$exports.default.log("Listening for ICE candidates.");
      peerConnection.onicecandidate = function(evt) {
        if (!evt.candidate || !evt.candidate.candidate)
          return;
        $1615705ecc6adca3$exports.default.log("Received ICE candidates for ".concat(peerId, ":"), evt.candidate);
        provider.socket.send({
          type: $60fadef21a2daafc$export$adb4a1754da6f10d.Candidate,
          payload: {
            candidate: evt.candidate,
            type: connectionType,
            connectionId
          },
          dst: peerId
        });
      };
      peerConnection.oniceconnectionstatechange = function() {
        switch (peerConnection.iceConnectionState) {
          case "failed":
            $1615705ecc6adca3$exports.default.log("iceConnectionState is failed, closing connections to " + peerId);
            _this.connection.emit("error", new Error("Negotiation of connection to " + peerId + " failed."));
            _this.connection.close();
            break;
          case "closed":
            $1615705ecc6adca3$exports.default.log("iceConnectionState is closed, closing connections to " + peerId);
            _this.connection.emit("error", new Error("Connection to " + peerId + " closed."));
            _this.connection.close();
            break;
          case "disconnected":
            $1615705ecc6adca3$exports.default.log("iceConnectionState changed to disconnected on the connection with " + peerId);
            break;
          case "completed":
            peerConnection.onicecandidate = $06cb531ed7840f78$export$7debb50ef11d5e0b.noop;
            break;
        }
        _this.connection.emit("iceStateChanged", peerConnection.iceConnectionState);
      };
      $1615705ecc6adca3$exports.default.log("Listening for data channel");
      peerConnection.ondatachannel = function(evt) {
        $1615705ecc6adca3$exports.default.log("Received data channel");
        var dataChannel = evt.channel;
        var connection = provider.getConnection(peerId, connectionId);
        connection.initialize(dataChannel);
      };
      $1615705ecc6adca3$exports.default.log("Listening for remote stream");
      peerConnection.ontrack = function(evt) {
        $1615705ecc6adca3$exports.default.log("Received remote stream");
        var stream = evt.streams[0];
        var connection = provider.getConnection(peerId, connectionId);
        if (connection.type === $60fadef21a2daafc$export$3157d57b4135e3bc.Media) {
          var mediaConnection = connection;
          _this._addStreamToMediaConnection(stream, mediaConnection);
        }
      };
    };
    $77f14d3e81888156$export$89e6bb5ad64bf4a2.prototype.cleanup = function() {
      $1615705ecc6adca3$exports.default.log("Cleaning up PeerConnection to " + this.connection.peer);
      var peerConnection = this.connection.peerConnection;
      if (!peerConnection)
        return;
      this.connection.peerConnection = null;
      peerConnection.onicecandidate = peerConnection.oniceconnectionstatechange = peerConnection.ondatachannel = peerConnection.ontrack = function() {
      };
      var peerConnectionNotClosed = peerConnection.signalingState !== "closed";
      var dataChannelNotClosed = false;
      if (this.connection.type === $60fadef21a2daafc$export$3157d57b4135e3bc.Data) {
        var dataConnection = this.connection;
        var dataChannel = dataConnection.dataChannel;
        if (dataChannel)
          dataChannelNotClosed = !!dataChannel.readyState && dataChannel.readyState !== "closed";
      }
      if (peerConnectionNotClosed || dataChannelNotClosed)
        peerConnection.close();
    };
    $77f14d3e81888156$export$89e6bb5ad64bf4a2.prototype._makeOffer = function() {
      return $77f14d3e81888156$var$__awaiter(this, void 0, Promise, function() {
        var peerConnection, provider, offer, payload, dataConnection, err_2, err_1_1;
        return $77f14d3e81888156$var$__generator(this, function(_a2) {
          switch (_a2.label) {
            case 0:
              peerConnection = this.connection.peerConnection;
              provider = this.connection.provider;
              _a2.label = 1;
            case 1:
              _a2.trys.push([
                1,
                7,
                ,
                8
              ]);
              return [
                4,
                peerConnection.createOffer(this.connection.options.constraints)
              ];
            case 2:
              offer = _a2.sent();
              $1615705ecc6adca3$exports.default.log("Created offer.");
              if (this.connection.options.sdpTransform && typeof this.connection.options.sdpTransform === "function")
                offer.sdp = this.connection.options.sdpTransform(offer.sdp) || offer.sdp;
              _a2.label = 3;
            case 3:
              _a2.trys.push([
                3,
                5,
                ,
                6
              ]);
              return [
                4,
                peerConnection.setLocalDescription(offer)
              ];
            case 4:
              _a2.sent();
              $1615705ecc6adca3$exports.default.log("Set localDescription:", offer, "for:".concat(this.connection.peer));
              payload = {
                sdp: offer,
                type: this.connection.type,
                connectionId: this.connection.connectionId,
                metadata: this.connection.metadata,
                browser: $06cb531ed7840f78$export$7debb50ef11d5e0b.browser
              };
              if (this.connection.type === $60fadef21a2daafc$export$3157d57b4135e3bc.Data) {
                dataConnection = this.connection;
                payload = $77f14d3e81888156$var$__assign($77f14d3e81888156$var$__assign({}, payload), {
                  label: dataConnection.label,
                  reliable: dataConnection.reliable,
                  serialization: dataConnection.serialization
                });
              }
              provider.socket.send({
                type: $60fadef21a2daafc$export$adb4a1754da6f10d.Offer,
                payload,
                dst: this.connection.peer
              });
              return [
                3,
                6
              ];
            case 5:
              err_2 = _a2.sent();
              if (err_2 != "OperationError: Failed to set local offer sdp: Called in wrong state: kHaveRemoteOffer") {
                provider.emitError($60fadef21a2daafc$export$9547aaa2e39030ff.WebRTC, err_2);
                $1615705ecc6adca3$exports.default.log("Failed to setLocalDescription, ", err_2);
              }
              return [
                3,
                6
              ];
            case 6:
              return [
                3,
                8
              ];
            case 7:
              err_1_1 = _a2.sent();
              provider.emitError($60fadef21a2daafc$export$9547aaa2e39030ff.WebRTC, err_1_1);
              $1615705ecc6adca3$exports.default.log("Failed to createOffer, ", err_1_1);
              return [
                3,
                8
              ];
            case 8:
              return [
                2
              ];
          }
        });
      });
    };
    $77f14d3e81888156$export$89e6bb5ad64bf4a2.prototype._makeAnswer = function() {
      return $77f14d3e81888156$var$__awaiter(this, void 0, Promise, function() {
        var peerConnection, provider, answer, err_3, err_1_2;
        return $77f14d3e81888156$var$__generator(this, function(_a2) {
          switch (_a2.label) {
            case 0:
              peerConnection = this.connection.peerConnection;
              provider = this.connection.provider;
              _a2.label = 1;
            case 1:
              _a2.trys.push([
                1,
                7,
                ,
                8
              ]);
              return [
                4,
                peerConnection.createAnswer()
              ];
            case 2:
              answer = _a2.sent();
              $1615705ecc6adca3$exports.default.log("Created answer.");
              if (this.connection.options.sdpTransform && typeof this.connection.options.sdpTransform === "function")
                answer.sdp = this.connection.options.sdpTransform(answer.sdp) || answer.sdp;
              _a2.label = 3;
            case 3:
              _a2.trys.push([
                3,
                5,
                ,
                6
              ]);
              return [
                4,
                peerConnection.setLocalDescription(answer)
              ];
            case 4:
              _a2.sent();
              $1615705ecc6adca3$exports.default.log("Set localDescription:", answer, "for:".concat(this.connection.peer));
              provider.socket.send({
                type: $60fadef21a2daafc$export$adb4a1754da6f10d.Answer,
                payload: {
                  sdp: answer,
                  type: this.connection.type,
                  connectionId: this.connection.connectionId,
                  browser: $06cb531ed7840f78$export$7debb50ef11d5e0b.browser
                },
                dst: this.connection.peer
              });
              return [
                3,
                6
              ];
            case 5:
              err_3 = _a2.sent();
              provider.emitError($60fadef21a2daafc$export$9547aaa2e39030ff.WebRTC, err_3);
              $1615705ecc6adca3$exports.default.log("Failed to setLocalDescription, ", err_3);
              return [
                3,
                6
              ];
            case 6:
              return [
                3,
                8
              ];
            case 7:
              err_1_2 = _a2.sent();
              provider.emitError($60fadef21a2daafc$export$9547aaa2e39030ff.WebRTC, err_1_2);
              $1615705ecc6adca3$exports.default.log("Failed to create answer, ", err_1_2);
              return [
                3,
                8
              ];
            case 8:
              return [
                2
              ];
          }
        });
      });
    };
    $77f14d3e81888156$export$89e6bb5ad64bf4a2.prototype.handleSDP = function(type, sdp) {
      return $77f14d3e81888156$var$__awaiter(this, void 0, Promise, function() {
        var peerConnection, provider, self2, err_4;
        return $77f14d3e81888156$var$__generator(this, function(_a2) {
          switch (_a2.label) {
            case 0:
              sdp = new RTCSessionDescription(sdp);
              peerConnection = this.connection.peerConnection;
              provider = this.connection.provider;
              $1615705ecc6adca3$exports.default.log("Setting remote description", sdp);
              self2 = this;
              _a2.label = 1;
            case 1:
              _a2.trys.push([
                1,
                5,
                ,
                6
              ]);
              return [
                4,
                peerConnection.setRemoteDescription(sdp)
              ];
            case 2:
              _a2.sent();
              $1615705ecc6adca3$exports.default.log("Set remoteDescription:".concat(type, " for:").concat(this.connection.peer));
              if (!(type === "OFFER"))
                return [
                  3,
                  4
                ];
              return [
                4,
                self2._makeAnswer()
              ];
            case 3:
              _a2.sent();
              _a2.label = 4;
            case 4:
              return [
                3,
                6
              ];
            case 5:
              err_4 = _a2.sent();
              provider.emitError($60fadef21a2daafc$export$9547aaa2e39030ff.WebRTC, err_4);
              $1615705ecc6adca3$exports.default.log("Failed to setRemoteDescription, ", err_4);
              return [
                3,
                6
              ];
            case 6:
              return [
                2
              ];
          }
        });
      });
    };
    $77f14d3e81888156$export$89e6bb5ad64bf4a2.prototype.handleCandidate = function(ice) {
      return $77f14d3e81888156$var$__awaiter(this, void 0, Promise, function() {
        var candidate, sdpMLineIndex, sdpMid, peerConnection, provider, err_5;
        return $77f14d3e81888156$var$__generator(this, function(_a2) {
          switch (_a2.label) {
            case 0:
              $1615705ecc6adca3$exports.default.log("handleCandidate:", ice);
              candidate = ice.candidate;
              sdpMLineIndex = ice.sdpMLineIndex;
              sdpMid = ice.sdpMid;
              peerConnection = this.connection.peerConnection;
              provider = this.connection.provider;
              _a2.label = 1;
            case 1:
              _a2.trys.push([
                1,
                3,
                ,
                4
              ]);
              return [
                4,
                peerConnection.addIceCandidate(new RTCIceCandidate({
                  sdpMid,
                  sdpMLineIndex,
                  candidate
                }))
              ];
            case 2:
              _a2.sent();
              $1615705ecc6adca3$exports.default.log("Added ICE candidate for:".concat(this.connection.peer));
              return [
                3,
                4
              ];
            case 3:
              err_5 = _a2.sent();
              provider.emitError($60fadef21a2daafc$export$9547aaa2e39030ff.WebRTC, err_5);
              $1615705ecc6adca3$exports.default.log("Failed to handleCandidate, ", err_5);
              return [
                3,
                4
              ];
            case 4:
              return [
                2
              ];
          }
        });
      });
    };
    $77f14d3e81888156$export$89e6bb5ad64bf4a2.prototype._addTracksToConnection = function(stream, peerConnection) {
      $1615705ecc6adca3$exports.default.log("add tracks from stream ".concat(stream.id, " to peer connection"));
      if (!peerConnection.addTrack)
        return $1615705ecc6adca3$exports.default.error("Your browser does't support RTCPeerConnection#addTrack. Ignored.");
      stream.getTracks().forEach(function(track) {
        peerConnection.addTrack(track, stream);
      });
    };
    $77f14d3e81888156$export$89e6bb5ad64bf4a2.prototype._addStreamToMediaConnection = function(stream, mediaConnection) {
      $1615705ecc6adca3$exports.default.log("add stream ".concat(stream.id, " to media connection ").concat(mediaConnection.connectionId));
      mediaConnection.addStream(stream);
    };
    return $77f14d3e81888156$export$89e6bb5ad64bf4a2;
  }();
  var $0b3b332fd86c5202$exports = {};
  $parcel$export($0b3b332fd86c5202$exports, "BaseConnection", () => $0b3b332fd86c5202$export$23a2a68283c24d80, (v) => $0b3b332fd86c5202$export$23a2a68283c24d80 = v);
  var $0b3b332fd86c5202$var$__extends = function() {
    var extendStatics = function(d1, b1) {
      extendStatics = Object.setPrototypeOf || {
        __proto__: []
      } instanceof Array && function(d, b) {
        d.__proto__ = b;
      } || function(d, b) {
        for (var p in b)
          if (Object.prototype.hasOwnProperty.call(b, p))
            d[p] = b[p];
      };
      return extendStatics(d1, b1);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var $0b3b332fd86c5202$export$23a2a68283c24d80 = function(_super) {
    $0b3b332fd86c5202$var$__extends($0b3b332fd86c5202$export$23a2a68283c24d802, _super);
    function $0b3b332fd86c5202$export$23a2a68283c24d802(peer, provider, options) {
      var _this = _super.call(this) || this;
      _this.peer = peer;
      _this.provider = provider;
      _this.options = options;
      _this._open = false;
      _this.metadata = options.metadata;
      return _this;
    }
    Object.defineProperty($0b3b332fd86c5202$export$23a2a68283c24d802.prototype, "open", {
      get: function() {
        return this._open;
      },
      enumerable: false,
      configurable: true
    });
    return $0b3b332fd86c5202$export$23a2a68283c24d802;
  }($ac9b757d51178e15$exports.EventEmitter);
  var $353dee38f9ab557b$var$__extends = function() {
    var extendStatics = function(d1, b1) {
      extendStatics = Object.setPrototypeOf || {
        __proto__: []
      } instanceof Array && function(d, b) {
        d.__proto__ = b;
      } || function(d, b) {
        for (var p in b)
          if (Object.prototype.hasOwnProperty.call(b, p))
            d[p] = b[p];
      };
      return extendStatics(d1, b1);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var $353dee38f9ab557b$var$__assign = function() {
    $353dee38f9ab557b$var$__assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
      }
      return t;
    };
    return $353dee38f9ab557b$var$__assign.apply(this, arguments);
  };
  var $353dee38f9ab557b$var$__values = function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m)
      return m.call(o);
    if (o && typeof o.length === "number")
      return {
        next: function() {
          if (o && i >= o.length)
            o = void 0;
          return {
            value: o && o[i++],
            done: !o
          };
        }
      };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  };
  var $353dee38f9ab557b$export$4a84e95a2324ac29 = function(_super) {
    $353dee38f9ab557b$var$__extends($353dee38f9ab557b$export$4a84e95a2324ac292, _super);
    function $353dee38f9ab557b$export$4a84e95a2324ac292(peerId, provider, options) {
      var _this = _super.call(this, peerId, provider, options) || this;
      _this._localStream = _this.options._stream;
      _this.connectionId = _this.options.connectionId || $353dee38f9ab557b$export$4a84e95a2324ac292.ID_PREFIX + $06cb531ed7840f78$export$7debb50ef11d5e0b.randomToken();
      _this._negotiator = new $77f14d3e81888156$exports.Negotiator(_this);
      if (_this._localStream)
        _this._negotiator.startConnection({
          _stream: _this._localStream,
          originator: true
        });
      return _this;
    }
    Object.defineProperty($353dee38f9ab557b$export$4a84e95a2324ac292.prototype, "type", {
      get: function() {
        return $60fadef21a2daafc$export$3157d57b4135e3bc.Media;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty($353dee38f9ab557b$export$4a84e95a2324ac292.prototype, "localStream", {
      get: function() {
        return this._localStream;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty($353dee38f9ab557b$export$4a84e95a2324ac292.prototype, "remoteStream", {
      get: function() {
        return this._remoteStream;
      },
      enumerable: false,
      configurable: true
    });
    $353dee38f9ab557b$export$4a84e95a2324ac292.prototype.addStream = function(remoteStream) {
      $1615705ecc6adca3$exports.default.log("Receiving stream", remoteStream);
      this._remoteStream = remoteStream;
      _super.prototype.emit.call(this, "stream", remoteStream);
    };
    $353dee38f9ab557b$export$4a84e95a2324ac292.prototype.handleMessage = function(message) {
      var type = message.type;
      var payload = message.payload;
      switch (message.type) {
        case $60fadef21a2daafc$export$adb4a1754da6f10d.Answer:
          this._negotiator.handleSDP(type, payload.sdp);
          this._open = true;
          break;
        case $60fadef21a2daafc$export$adb4a1754da6f10d.Candidate:
          this._negotiator.handleCandidate(payload.candidate);
          break;
        default:
          $1615705ecc6adca3$exports.default.warn("Unrecognized message type:".concat(type, " from peer:").concat(this.peer));
          break;
      }
    };
    $353dee38f9ab557b$export$4a84e95a2324ac292.prototype.answer = function(stream, options) {
      var e_1, _a2;
      if (options === void 0)
        options = {};
      if (this._localStream) {
        $1615705ecc6adca3$exports.default.warn("Local stream already exists on this MediaConnection. Are you answering a call twice?");
        return;
      }
      this._localStream = stream;
      if (options && options.sdpTransform)
        this.options.sdpTransform = options.sdpTransform;
      this._negotiator.startConnection($353dee38f9ab557b$var$__assign($353dee38f9ab557b$var$__assign({}, this.options._payload), {
        _stream: stream
      }));
      var messages = this.provider._getMessages(this.connectionId);
      try {
        for (var messages_1 = $353dee38f9ab557b$var$__values(messages), messages_1_1 = messages_1.next(); !messages_1_1.done; messages_1_1 = messages_1.next()) {
          var message = messages_1_1.value;
          this.handleMessage(message);
        }
      } catch (e_1_1) {
        e_1 = {
          error: e_1_1
        };
      } finally {
        try {
          if (messages_1_1 && !messages_1_1.done && (_a2 = messages_1.return))
            _a2.call(messages_1);
        } finally {
          if (e_1)
            throw e_1.error;
        }
      }
      this._open = true;
    };
    $353dee38f9ab557b$export$4a84e95a2324ac292.prototype.close = function() {
      if (this._negotiator) {
        this._negotiator.cleanup();
        this._negotiator = null;
      }
      this._localStream = null;
      this._remoteStream = null;
      if (this.provider) {
        this.provider._removeConnection(this);
        this.provider = null;
      }
      if (this.options && this.options._stream)
        this.options._stream = null;
      if (!this.open)
        return;
      this._open = false;
      _super.prototype.emit.call(this, "close");
    };
    $353dee38f9ab557b$export$4a84e95a2324ac292.ID_PREFIX = "mc_";
    return $353dee38f9ab557b$export$4a84e95a2324ac292;
  }($0b3b332fd86c5202$exports.BaseConnection);
  var $3356170d7bce7f20$exports = {};
  $parcel$export($3356170d7bce7f20$exports, "DataConnection", () => $3356170d7bce7f20$export$d365f7ad9d7df9c9, (v) => $3356170d7bce7f20$export$d365f7ad9d7df9c9 = v);
  var $3014d862dcc9946b$exports = {};
  $parcel$export($3014d862dcc9946b$exports, "EncodingQueue", () => $3014d862dcc9946b$export$c6913ae0ed687038, (v) => $3014d862dcc9946b$export$c6913ae0ed687038 = v);
  var $3014d862dcc9946b$var$__extends = function() {
    var extendStatics = function(d1, b1) {
      extendStatics = Object.setPrototypeOf || {
        __proto__: []
      } instanceof Array && function(d, b) {
        d.__proto__ = b;
      } || function(d, b) {
        for (var p in b)
          if (Object.prototype.hasOwnProperty.call(b, p))
            d[p] = b[p];
      };
      return extendStatics(d1, b1);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var $3014d862dcc9946b$export$c6913ae0ed687038 = function(_super) {
    $3014d862dcc9946b$var$__extends($3014d862dcc9946b$export$c6913ae0ed6870382, _super);
    function $3014d862dcc9946b$export$c6913ae0ed6870382() {
      var _this = _super.call(this) || this;
      _this.fileReader = new FileReader();
      _this._queue = [];
      _this._processing = false;
      _this.fileReader.onload = function(evt) {
        _this._processing = false;
        if (evt.target)
          _this.emit("done", evt.target.result);
        _this.doNextTask();
      };
      _this.fileReader.onerror = function(evt) {
        $1615705ecc6adca3$exports.default.error("EncodingQueue error:", evt);
        _this._processing = false;
        _this.destroy();
        _this.emit("error", evt);
      };
      return _this;
    }
    Object.defineProperty($3014d862dcc9946b$export$c6913ae0ed6870382.prototype, "queue", {
      get: function() {
        return this._queue;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty($3014d862dcc9946b$export$c6913ae0ed6870382.prototype, "size", {
      get: function() {
        return this.queue.length;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty($3014d862dcc9946b$export$c6913ae0ed6870382.prototype, "processing", {
      get: function() {
        return this._processing;
      },
      enumerable: false,
      configurable: true
    });
    $3014d862dcc9946b$export$c6913ae0ed6870382.prototype.enque = function(blob) {
      this.queue.push(blob);
      if (this.processing)
        return;
      this.doNextTask();
    };
    $3014d862dcc9946b$export$c6913ae0ed6870382.prototype.destroy = function() {
      this.fileReader.abort();
      this._queue = [];
    };
    $3014d862dcc9946b$export$c6913ae0ed6870382.prototype.doNextTask = function() {
      if (this.size === 0)
        return;
      if (this.processing)
        return;
      this._processing = true;
      this.fileReader.readAsArrayBuffer(this.queue.shift());
    };
    return $3014d862dcc9946b$export$c6913ae0ed6870382;
  }($ac9b757d51178e15$exports.EventEmitter);
  var $3356170d7bce7f20$var$__extends = function() {
    var extendStatics = function(d1, b1) {
      extendStatics = Object.setPrototypeOf || {
        __proto__: []
      } instanceof Array && function(d, b) {
        d.__proto__ = b;
      } || function(d, b) {
        for (var p in b)
          if (Object.prototype.hasOwnProperty.call(b, p))
            d[p] = b[p];
      };
      return extendStatics(d1, b1);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var $3356170d7bce7f20$var$__values = function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m)
      return m.call(o);
    if (o && typeof o.length === "number")
      return {
        next: function() {
          if (o && i >= o.length)
            o = void 0;
          return {
            value: o && o[i++],
            done: !o
          };
        }
      };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  };
  var $3356170d7bce7f20$export$d365f7ad9d7df9c9 = function(_super) {
    $3356170d7bce7f20$var$__extends($3356170d7bce7f20$export$d365f7ad9d7df9c92, _super);
    function $3356170d7bce7f20$export$d365f7ad9d7df9c92(peerId, provider, options) {
      var _this = _super.call(this, peerId, provider, options) || this;
      _this.stringify = JSON.stringify;
      _this.parse = JSON.parse;
      _this._buffer = [];
      _this._bufferSize = 0;
      _this._buffering = false;
      _this._chunkedData = {};
      _this._encodingQueue = new $3014d862dcc9946b$exports.EncodingQueue();
      _this.connectionId = _this.options.connectionId || $3356170d7bce7f20$export$d365f7ad9d7df9c92.ID_PREFIX + $06cb531ed7840f78$export$7debb50ef11d5e0b.randomToken();
      _this.label = _this.options.label || _this.connectionId;
      _this.serialization = _this.options.serialization || $60fadef21a2daafc$export$89f507cf986a947.Binary;
      _this.reliable = !!_this.options.reliable;
      _this._encodingQueue.on("done", function(ab) {
        _this._bufferedSend(ab);
      });
      _this._encodingQueue.on("error", function() {
        $1615705ecc6adca3$exports.default.error("DC#".concat(_this.connectionId, ": Error occured in encoding from blob to arraybuffer, close DC"));
        _this.close();
      });
      _this._negotiator = new $77f14d3e81888156$exports.Negotiator(_this);
      _this._negotiator.startConnection(_this.options._payload || {
        originator: true
      });
      return _this;
    }
    Object.defineProperty($3356170d7bce7f20$export$d365f7ad9d7df9c92.prototype, "type", {
      get: function() {
        return $60fadef21a2daafc$export$3157d57b4135e3bc.Data;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty($3356170d7bce7f20$export$d365f7ad9d7df9c92.prototype, "dataChannel", {
      get: function() {
        return this._dc;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty($3356170d7bce7f20$export$d365f7ad9d7df9c92.prototype, "bufferSize", {
      get: function() {
        return this._bufferSize;
      },
      enumerable: false,
      configurable: true
    });
    $3356170d7bce7f20$export$d365f7ad9d7df9c92.prototype.initialize = function(dc) {
      this._dc = dc;
      this._configureDataChannel();
    };
    $3356170d7bce7f20$export$d365f7ad9d7df9c92.prototype._configureDataChannel = function() {
      var _this = this;
      if (!$06cb531ed7840f78$export$7debb50ef11d5e0b.supports.binaryBlob || $06cb531ed7840f78$export$7debb50ef11d5e0b.supports.reliable)
        this.dataChannel.binaryType = "arraybuffer";
      this.dataChannel.onopen = function() {
        $1615705ecc6adca3$exports.default.log("DC#".concat(_this.connectionId, " dc connection success"));
        _this._open = true;
        _this.emit("open");
      };
      this.dataChannel.onmessage = function(e) {
        $1615705ecc6adca3$exports.default.log("DC#".concat(_this.connectionId, " dc onmessage:"), e.data);
        _this._handleDataMessage(e);
      };
      this.dataChannel.onclose = function() {
        $1615705ecc6adca3$exports.default.log("DC#".concat(_this.connectionId, " dc closed for:"), _this.peer);
        _this.close();
      };
    };
    $3356170d7bce7f20$export$d365f7ad9d7df9c92.prototype._handleDataMessage = function(_a2) {
      var _this = this;
      var data = _a2.data;
      var datatype = data.constructor;
      var isBinarySerialization = this.serialization === $60fadef21a2daafc$export$89f507cf986a947.Binary || this.serialization === $60fadef21a2daafc$export$89f507cf986a947.BinaryUTF8;
      var deserializedData = data;
      if (isBinarySerialization) {
        if (datatype === Blob) {
          $06cb531ed7840f78$export$7debb50ef11d5e0b.blobToArrayBuffer(data, function(ab) {
            var unpackedData = $06cb531ed7840f78$export$7debb50ef11d5e0b.unpack(ab);
            _this.emit("data", unpackedData);
          });
          return;
        } else if (datatype === ArrayBuffer)
          deserializedData = $06cb531ed7840f78$export$7debb50ef11d5e0b.unpack(data);
        else if (datatype === String) {
          var ab1 = $06cb531ed7840f78$export$7debb50ef11d5e0b.binaryStringToArrayBuffer(data);
          deserializedData = $06cb531ed7840f78$export$7debb50ef11d5e0b.unpack(ab1);
        }
      } else if (this.serialization === $60fadef21a2daafc$export$89f507cf986a947.JSON)
        deserializedData = this.parse(data);
      if (deserializedData.__peerData) {
        this._handleChunk(deserializedData);
        return;
      }
      _super.prototype.emit.call(this, "data", deserializedData);
    };
    $3356170d7bce7f20$export$d365f7ad9d7df9c92.prototype._handleChunk = function(data) {
      var id = data.__peerData;
      var chunkInfo = this._chunkedData[id] || {
        data: [],
        count: 0,
        total: data.total
      };
      chunkInfo.data[data.n] = data.data;
      chunkInfo.count++;
      this._chunkedData[id] = chunkInfo;
      if (chunkInfo.total === chunkInfo.count) {
        delete this._chunkedData[id];
        var data_1 = new Blob(chunkInfo.data);
        this._handleDataMessage({
          data: data_1
        });
      }
    };
    $3356170d7bce7f20$export$d365f7ad9d7df9c92.prototype.close = function() {
      this._buffer = [];
      this._bufferSize = 0;
      this._chunkedData = {};
      if (this._negotiator) {
        this._negotiator.cleanup();
        this._negotiator = null;
      }
      if (this.provider) {
        this.provider._removeConnection(this);
        this.provider = null;
      }
      if (this.dataChannel) {
        this.dataChannel.onopen = null;
        this.dataChannel.onmessage = null;
        this.dataChannel.onclose = null;
        this._dc = null;
      }
      if (this._encodingQueue) {
        this._encodingQueue.destroy();
        this._encodingQueue.removeAllListeners();
        this._encodingQueue = null;
      }
      if (!this.open)
        return;
      this._open = false;
      _super.prototype.emit.call(this, "close");
    };
    $3356170d7bce7f20$export$d365f7ad9d7df9c92.prototype.send = function(data, chunked) {
      if (!this.open) {
        _super.prototype.emit.call(this, "error", new Error("Connection is not open. You should listen for the `open` event before sending messages."));
        return;
      }
      if (this.serialization === $60fadef21a2daafc$export$89f507cf986a947.JSON)
        this._bufferedSend(this.stringify(data));
      else if (this.serialization === $60fadef21a2daafc$export$89f507cf986a947.Binary || this.serialization === $60fadef21a2daafc$export$89f507cf986a947.BinaryUTF8) {
        var blob = $06cb531ed7840f78$export$7debb50ef11d5e0b.pack(data);
        if (!chunked && blob.size > $06cb531ed7840f78$export$7debb50ef11d5e0b.chunkedMTU) {
          this._sendChunks(blob);
          return;
        }
        if (!$06cb531ed7840f78$export$7debb50ef11d5e0b.supports.binaryBlob)
          this._encodingQueue.enque(blob);
        else
          this._bufferedSend(blob);
      } else
        this._bufferedSend(data);
    };
    $3356170d7bce7f20$export$d365f7ad9d7df9c92.prototype._bufferedSend = function(msg) {
      if (this._buffering || !this._trySend(msg)) {
        this._buffer.push(msg);
        this._bufferSize = this._buffer.length;
      }
    };
    $3356170d7bce7f20$export$d365f7ad9d7df9c92.prototype._trySend = function(msg) {
      var _this = this;
      if (!this.open)
        return false;
      if (this.dataChannel.bufferedAmount > $3356170d7bce7f20$export$d365f7ad9d7df9c92.MAX_BUFFERED_AMOUNT) {
        this._buffering = true;
        setTimeout(function() {
          _this._buffering = false;
          _this._tryBuffer();
        }, 50);
        return false;
      }
      try {
        this.dataChannel.send(msg);
      } catch (e) {
        $1615705ecc6adca3$exports.default.error("DC#:".concat(this.connectionId, " Error when sending:"), e);
        this._buffering = true;
        this.close();
        return false;
      }
      return true;
    };
    $3356170d7bce7f20$export$d365f7ad9d7df9c92.prototype._tryBuffer = function() {
      if (!this.open)
        return;
      if (this._buffer.length === 0)
        return;
      var msg = this._buffer[0];
      if (this._trySend(msg)) {
        this._buffer.shift();
        this._bufferSize = this._buffer.length;
        this._tryBuffer();
      }
    };
    $3356170d7bce7f20$export$d365f7ad9d7df9c92.prototype._sendChunks = function(blob) {
      var e_1, _a2;
      var blobs = $06cb531ed7840f78$export$7debb50ef11d5e0b.chunk(blob);
      $1615705ecc6adca3$exports.default.log("DC#".concat(this.connectionId, " Try to send ").concat(blobs.length, " chunks..."));
      try {
        for (var blobs_1 = $3356170d7bce7f20$var$__values(blobs), blobs_1_1 = blobs_1.next(); !blobs_1_1.done; blobs_1_1 = blobs_1.next()) {
          var blob_1 = blobs_1_1.value;
          this.send(blob_1, true);
        }
      } catch (e_1_1) {
        e_1 = {
          error: e_1_1
        };
      } finally {
        try {
          if (blobs_1_1 && !blobs_1_1.done && (_a2 = blobs_1.return))
            _a2.call(blobs_1);
        } finally {
          if (e_1)
            throw e_1.error;
        }
      }
    };
    $3356170d7bce7f20$export$d365f7ad9d7df9c92.prototype.handleMessage = function(message) {
      var payload = message.payload;
      switch (message.type) {
        case $60fadef21a2daafc$export$adb4a1754da6f10d.Answer:
          this._negotiator.handleSDP(message.type, payload.sdp);
          break;
        case $60fadef21a2daafc$export$adb4a1754da6f10d.Candidate:
          this._negotiator.handleCandidate(payload.candidate);
          break;
        default:
          $1615705ecc6adca3$exports.default.warn("Unrecognized message type:", message.type, "from peer:", this.peer);
          break;
      }
    };
    $3356170d7bce7f20$export$d365f7ad9d7df9c92.ID_PREFIX = "dc_";
    $3356170d7bce7f20$export$d365f7ad9d7df9c92.MAX_BUFFERED_AMOUNT = 8388608;
    return $3356170d7bce7f20$export$d365f7ad9d7df9c92;
  }($0b3b332fd86c5202$exports.BaseConnection);
  var $9e85b3e1327369e6$exports = {};
  $parcel$export($9e85b3e1327369e6$exports, "API", () => $9e85b3e1327369e6$export$2c4e825dc9120f87, (v) => $9e85b3e1327369e6$export$2c4e825dc9120f87 = v);
  var $9e85b3e1327369e6$var$__awaiter = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var $9e85b3e1327369e6$var$__generator = function(thisArg, body) {
    var _ = {
      label: 0,
      sent: function() {
        if (t[0] & 1)
          throw t[1];
        return t[1];
      },
      trys: [],
      ops: []
    }, f, y, t, g;
    return g = {
      next: verb(0),
      "throw": verb(1),
      "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
      return this;
    }), g;
    function verb(n) {
      return function(v) {
        return step([
          n,
          v
        ]);
      };
    }
    function step(op) {
      if (f)
        throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
            return t;
          if (y = 0, t)
            op = [
              op[0] & 2,
              t.value
            ];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return {
                value: op[1],
                done: false
              };
            case 5:
              _.label++;
              y = op[1];
              op = [
                0
              ];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2])
                _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [
            6,
            e
          ];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5)
        throw op[1];
      return {
        value: op[0] ? op[1] : void 0,
        done: true
      };
    }
  };
  var $9e85b3e1327369e6$export$2c4e825dc9120f87 = function() {
    function $9e85b3e1327369e6$export$2c4e825dc9120f872(_options) {
      this._options = _options;
    }
    $9e85b3e1327369e6$export$2c4e825dc9120f872.prototype._buildRequest = function(method) {
      var protocol = this._options.secure ? "https" : "http";
      var _a2 = this._options, host = _a2.host, port = _a2.port, path2 = _a2.path, key = _a2.key;
      var url = new URL("".concat(protocol, "://").concat(host, ":").concat(port).concat(path2).concat(key, "/").concat(method));
      url.searchParams.set("ts", "".concat(Date.now()).concat(Math.random()));
      url.searchParams.set("version", $0d1ed891c5cb27c0$exports.version);
      return fetch(url.href, {
        referrerPolicy: this._options.referrerPolicy
      });
    };
    $9e85b3e1327369e6$export$2c4e825dc9120f872.prototype.retrieveId = function() {
      return $9e85b3e1327369e6$var$__awaiter(this, void 0, Promise, function() {
        var response, error_1, pathError;
        return $9e85b3e1327369e6$var$__generator(this, function(_a2) {
          switch (_a2.label) {
            case 0:
              _a2.trys.push([
                0,
                2,
                ,
                3
              ]);
              return [
                4,
                this._buildRequest("id")
              ];
            case 1:
              response = _a2.sent();
              if (response.status !== 200)
                throw new Error("Error. Status:".concat(response.status));
              return [
                2,
                response.text()
              ];
            case 2:
              error_1 = _a2.sent();
              $1615705ecc6adca3$exports.default.error("Error retrieving ID", error_1);
              pathError = "";
              if (this._options.path === "/" && this._options.host !== $06cb531ed7840f78$export$7debb50ef11d5e0b.CLOUD_HOST)
                pathError = " If you passed in a `path` to your self-hosted PeerServer, you'll also need to pass in that same path when creating a new Peer.";
              throw new Error("Could not get an ID from the server." + pathError);
            case 3:
              return [
                2
              ];
          }
        });
      });
    };
    $9e85b3e1327369e6$export$2c4e825dc9120f872.prototype.listAllPeers = function() {
      return $9e85b3e1327369e6$var$__awaiter(this, void 0, Promise, function() {
        var response, helpfulError, error_2;
        return $9e85b3e1327369e6$var$__generator(this, function(_a2) {
          switch (_a2.label) {
            case 0:
              _a2.trys.push([
                0,
                2,
                ,
                3
              ]);
              return [
                4,
                this._buildRequest("peers")
              ];
            case 1:
              response = _a2.sent();
              if (response.status !== 200) {
                if (response.status === 401) {
                  helpfulError = "";
                  if (this._options.host === $06cb531ed7840f78$export$7debb50ef11d5e0b.CLOUD_HOST)
                    helpfulError = "It looks like you're using the cloud server. You can email team@peerjs.com to enable peer listing for your API key.";
                  else
                    helpfulError = "You need to enable `allow_discovery` on your self-hosted PeerServer to use this feature.";
                  throw new Error("It doesn't look like you have permission to list peers IDs. " + helpfulError);
                }
                throw new Error("Error. Status:".concat(response.status));
              }
              return [
                2,
                response.json()
              ];
            case 2:
              error_2 = _a2.sent();
              $1615705ecc6adca3$exports.default.error("Error retrieving list peers", error_2);
              throw new Error("Could not get list peers from the server." + error_2);
            case 3:
              return [
                2
              ];
          }
        });
      });
    };
    return $9e85b3e1327369e6$export$2c4e825dc9120f872;
  }();
  var $26088d7da5b03f69$var$__extends = function() {
    var extendStatics = function(d1, b1) {
      extendStatics = Object.setPrototypeOf || {
        __proto__: []
      } instanceof Array && function(d, b) {
        d.__proto__ = b;
      } || function(d, b) {
        for (var p in b)
          if (Object.prototype.hasOwnProperty.call(b, p))
            d[p] = b[p];
      };
      return extendStatics(d1, b1);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var $26088d7da5b03f69$var$__assign = function() {
    $26088d7da5b03f69$var$__assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
      }
      return t;
    };
    return $26088d7da5b03f69$var$__assign.apply(this, arguments);
  };
  var $26088d7da5b03f69$var$__values = function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m)
      return m.call(o);
    if (o && typeof o.length === "number")
      return {
        next: function() {
          if (o && i >= o.length)
            o = void 0;
          return {
            value: o && o[i++],
            done: !o
          };
        }
      };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  };
  var $26088d7da5b03f69$var$__read = function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m)
      return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
        ar.push(r.value);
    } catch (error3) {
      e = {
        error: error3
      };
    } finally {
      try {
        if (r && !r.done && (m = i["return"]))
          m.call(i);
      } finally {
        if (e)
          throw e.error;
      }
    }
    return ar;
  };
  var $26088d7da5b03f69$var$PeerOptions = function() {
    function PeerOptions() {
    }
    return PeerOptions;
  }();
  var $26088d7da5b03f69$export$ecd1fc136c422448 = function(_super) {
    $26088d7da5b03f69$var$__extends($26088d7da5b03f69$export$ecd1fc136c4224482, _super);
    function $26088d7da5b03f69$export$ecd1fc136c4224482(id1, options) {
      var _this = _super.call(this) || this;
      _this._id = null;
      _this._lastServerId = null;
      _this._destroyed = false;
      _this._disconnected = false;
      _this._open = false;
      _this._connections = /* @__PURE__ */ new Map();
      _this._lostMessages = /* @__PURE__ */ new Map();
      var userId;
      if (id1 && id1.constructor == Object)
        options = id1;
      else if (id1)
        userId = id1.toString();
      options = $26088d7da5b03f69$var$__assign({
        debug: 0,
        host: $06cb531ed7840f78$export$7debb50ef11d5e0b.CLOUD_HOST,
        port: $06cb531ed7840f78$export$7debb50ef11d5e0b.CLOUD_PORT,
        path: "/",
        key: $26088d7da5b03f69$export$ecd1fc136c4224482.DEFAULT_KEY,
        token: $06cb531ed7840f78$export$7debb50ef11d5e0b.randomToken(),
        config: $06cb531ed7840f78$export$7debb50ef11d5e0b.defaultConfig,
        referrerPolicy: "strict-origin-when-cross-origin"
      }, options);
      _this._options = options;
      if (_this._options.host === "/")
        _this._options.host = window.location.hostname;
      if (_this._options.path) {
        if (_this._options.path[0] !== "/")
          _this._options.path = "/" + _this._options.path;
        if (_this._options.path[_this._options.path.length - 1] !== "/")
          _this._options.path += "/";
      }
      if (_this._options.secure === void 0 && _this._options.host !== $06cb531ed7840f78$export$7debb50ef11d5e0b.CLOUD_HOST)
        _this._options.secure = $06cb531ed7840f78$export$7debb50ef11d5e0b.isSecure();
      else if (_this._options.host == $06cb531ed7840f78$export$7debb50ef11d5e0b.CLOUD_HOST)
        _this._options.secure = true;
      if (_this._options.logFunction)
        $1615705ecc6adca3$exports.default.setLogFunction(_this._options.logFunction);
      $1615705ecc6adca3$exports.default.logLevel = _this._options.debug || 0;
      _this._api = new $9e85b3e1327369e6$exports.API(options);
      _this._socket = _this._createServerConnection();
      if (!$06cb531ed7840f78$export$7debb50ef11d5e0b.supports.audioVideo && !$06cb531ed7840f78$export$7debb50ef11d5e0b.supports.data) {
        _this._delayedAbort($60fadef21a2daafc$export$9547aaa2e39030ff.BrowserIncompatible, "The current browser does not support WebRTC");
        return _this;
      }
      if (!!userId && !$06cb531ed7840f78$export$7debb50ef11d5e0b.validateId(userId)) {
        _this._delayedAbort($60fadef21a2daafc$export$9547aaa2e39030ff.InvalidID, 'ID "'.concat(userId, '" is invalid'));
        return _this;
      }
      if (userId)
        _this._initialize(userId);
      else
        _this._api.retrieveId().then(function(id) {
          return _this._initialize(id);
        }).catch(function(error3) {
          return _this._abort($60fadef21a2daafc$export$9547aaa2e39030ff.ServerError, error3);
        });
      return _this;
    }
    Object.defineProperty($26088d7da5b03f69$export$ecd1fc136c4224482.prototype, "id", {
      get: function() {
        return this._id;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty($26088d7da5b03f69$export$ecd1fc136c4224482.prototype, "options", {
      get: function() {
        return this._options;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty($26088d7da5b03f69$export$ecd1fc136c4224482.prototype, "open", {
      get: function() {
        return this._open;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty($26088d7da5b03f69$export$ecd1fc136c4224482.prototype, "socket", {
      get: function() {
        return this._socket;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty($26088d7da5b03f69$export$ecd1fc136c4224482.prototype, "connections", {
      get: function() {
        var e_1, _a2;
        var plainConnections = /* @__PURE__ */ Object.create(null);
        try {
          for (var _b = $26088d7da5b03f69$var$__values(this._connections), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = $26088d7da5b03f69$var$__read(_c.value, 2), k = _d[0], v = _d[1];
            plainConnections[k] = v;
          }
        } catch (e_1_1) {
          e_1 = {
            error: e_1_1
          };
        } finally {
          try {
            if (_c && !_c.done && (_a2 = _b.return))
              _a2.call(_b);
          } finally {
            if (e_1)
              throw e_1.error;
          }
        }
        return plainConnections;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty($26088d7da5b03f69$export$ecd1fc136c4224482.prototype, "destroyed", {
      get: function() {
        return this._destroyed;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty($26088d7da5b03f69$export$ecd1fc136c4224482.prototype, "disconnected", {
      get: function() {
        return this._disconnected;
      },
      enumerable: false,
      configurable: true
    });
    $26088d7da5b03f69$export$ecd1fc136c4224482.prototype._createServerConnection = function() {
      var _this = this;
      var socket = new $31d11a8d122cb4b7$exports.Socket(this._options.secure, this._options.host, this._options.port, this._options.path, this._options.key, this._options.pingInterval);
      socket.on($60fadef21a2daafc$export$3b5c4a4b6354f023.Message, function(data) {
        _this._handleMessage(data);
      });
      socket.on($60fadef21a2daafc$export$3b5c4a4b6354f023.Error, function(error3) {
        _this._abort($60fadef21a2daafc$export$9547aaa2e39030ff.SocketError, error3);
      });
      socket.on($60fadef21a2daafc$export$3b5c4a4b6354f023.Disconnected, function() {
        if (_this.disconnected)
          return;
        _this.emitError($60fadef21a2daafc$export$9547aaa2e39030ff.Network, "Lost connection to server.");
        _this.disconnect();
      });
      socket.on($60fadef21a2daafc$export$3b5c4a4b6354f023.Close, function() {
        if (_this.disconnected)
          return;
        _this._abort($60fadef21a2daafc$export$9547aaa2e39030ff.SocketClosed, "Underlying socket is already closed.");
      });
      return socket;
    };
    $26088d7da5b03f69$export$ecd1fc136c4224482.prototype._initialize = function(id) {
      this._id = id;
      this.socket.start(id, this._options.token);
    };
    $26088d7da5b03f69$export$ecd1fc136c4224482.prototype._handleMessage = function(message) {
      var e_2, _a2;
      var type = message.type;
      var payload = message.payload;
      var peerId = message.src;
      switch (type) {
        case $60fadef21a2daafc$export$adb4a1754da6f10d.Open:
          this._lastServerId = this.id;
          this._open = true;
          this.emit("open", this.id);
          break;
        case $60fadef21a2daafc$export$adb4a1754da6f10d.Error:
          this._abort($60fadef21a2daafc$export$9547aaa2e39030ff.ServerError, payload.msg);
          break;
        case $60fadef21a2daafc$export$adb4a1754da6f10d.IdTaken:
          this._abort($60fadef21a2daafc$export$9547aaa2e39030ff.UnavailableID, 'ID "'.concat(this.id, '" is taken'));
          break;
        case $60fadef21a2daafc$export$adb4a1754da6f10d.InvalidKey:
          this._abort($60fadef21a2daafc$export$9547aaa2e39030ff.InvalidKey, 'API KEY "'.concat(this._options.key, '" is invalid'));
          break;
        case $60fadef21a2daafc$export$adb4a1754da6f10d.Leave:
          $1615705ecc6adca3$exports.default.log("Received leave message from ".concat(peerId));
          this._cleanupPeer(peerId);
          this._connections.delete(peerId);
          break;
        case $60fadef21a2daafc$export$adb4a1754da6f10d.Expire:
          this.emitError($60fadef21a2daafc$export$9547aaa2e39030ff.PeerUnavailable, "Could not connect to peer ".concat(peerId));
          break;
        case $60fadef21a2daafc$export$adb4a1754da6f10d.Offer:
          var connectionId = payload.connectionId;
          var connection = this.getConnection(peerId, connectionId);
          if (connection) {
            connection.close();
            $1615705ecc6adca3$exports.default.warn("Offer received for existing Connection ID:".concat(connectionId));
          }
          if (payload.type === $60fadef21a2daafc$export$3157d57b4135e3bc.Media) {
            var mediaConnection = new $353dee38f9ab557b$exports.MediaConnection(peerId, this, {
              connectionId,
              _payload: payload,
              metadata: payload.metadata
            });
            connection = mediaConnection;
            this._addConnection(peerId, connection);
            this.emit("call", mediaConnection);
          } else if (payload.type === $60fadef21a2daafc$export$3157d57b4135e3bc.Data) {
            var dataConnection = new $3356170d7bce7f20$exports.DataConnection(peerId, this, {
              connectionId,
              _payload: payload,
              metadata: payload.metadata,
              label: payload.label,
              serialization: payload.serialization,
              reliable: payload.reliable
            });
            connection = dataConnection;
            this._addConnection(peerId, connection);
            this.emit("connection", dataConnection);
          } else {
            $1615705ecc6adca3$exports.default.warn("Received malformed connection type:".concat(payload.type));
            return;
          }
          var messages = this._getMessages(connectionId);
          try {
            for (var messages_1 = $26088d7da5b03f69$var$__values(messages), messages_1_1 = messages_1.next(); !messages_1_1.done; messages_1_1 = messages_1.next()) {
              var message_1 = messages_1_1.value;
              connection.handleMessage(message_1);
            }
          } catch (e_2_1) {
            e_2 = {
              error: e_2_1
            };
          } finally {
            try {
              if (messages_1_1 && !messages_1_1.done && (_a2 = messages_1.return))
                _a2.call(messages_1);
            } finally {
              if (e_2)
                throw e_2.error;
            }
          }
          break;
        default:
          if (!payload) {
            $1615705ecc6adca3$exports.default.warn("You received a malformed message from ".concat(peerId, " of type ").concat(type));
            return;
          }
          var connectionId = payload.connectionId;
          var connection = this.getConnection(peerId, connectionId);
          if (connection && connection.peerConnection)
            connection.handleMessage(message);
          else if (connectionId)
            this._storeMessage(connectionId, message);
          else
            $1615705ecc6adca3$exports.default.warn("You received an unrecognized message:", message);
          break;
      }
    };
    $26088d7da5b03f69$export$ecd1fc136c4224482.prototype._storeMessage = function(connectionId, message) {
      if (!this._lostMessages.has(connectionId))
        this._lostMessages.set(connectionId, []);
      this._lostMessages.get(connectionId).push(message);
    };
    $26088d7da5b03f69$export$ecd1fc136c4224482.prototype._getMessages = function(connectionId) {
      var messages = this._lostMessages.get(connectionId);
      if (messages) {
        this._lostMessages.delete(connectionId);
        return messages;
      }
      return [];
    };
    $26088d7da5b03f69$export$ecd1fc136c4224482.prototype.connect = function(peer, options) {
      if (options === void 0)
        options = {};
      if (this.disconnected) {
        $1615705ecc6adca3$exports.default.warn("You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect, or call reconnect on this peer if you believe its ID to still be available.");
        this.emitError($60fadef21a2daafc$export$9547aaa2e39030ff.Disconnected, "Cannot connect to new Peer after disconnecting from server.");
        return;
      }
      var dataConnection = new $3356170d7bce7f20$exports.DataConnection(peer, this, options);
      this._addConnection(peer, dataConnection);
      return dataConnection;
    };
    $26088d7da5b03f69$export$ecd1fc136c4224482.prototype.call = function(peer, stream, options) {
      if (options === void 0)
        options = {};
      if (this.disconnected) {
        $1615705ecc6adca3$exports.default.warn("You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect.");
        this.emitError($60fadef21a2daafc$export$9547aaa2e39030ff.Disconnected, "Cannot connect to new Peer after disconnecting from server.");
        return;
      }
      if (!stream) {
        $1615705ecc6adca3$exports.default.error("To call a peer, you must provide a stream from your browser's `getUserMedia`.");
        return;
      }
      var mediaConnection = new $353dee38f9ab557b$exports.MediaConnection(peer, this, $26088d7da5b03f69$var$__assign($26088d7da5b03f69$var$__assign({}, options), {
        _stream: stream
      }));
      this._addConnection(peer, mediaConnection);
      return mediaConnection;
    };
    $26088d7da5b03f69$export$ecd1fc136c4224482.prototype._addConnection = function(peerId, connection) {
      $1615705ecc6adca3$exports.default.log("add connection ".concat(connection.type, ":").concat(connection.connectionId, " to peerId:").concat(peerId));
      if (!this._connections.has(peerId))
        this._connections.set(peerId, []);
      this._connections.get(peerId).push(connection);
    };
    $26088d7da5b03f69$export$ecd1fc136c4224482.prototype._removeConnection = function(connection) {
      var connections = this._connections.get(connection.peer);
      if (connections) {
        var index = connections.indexOf(connection);
        if (index !== -1)
          connections.splice(index, 1);
      }
      this._lostMessages.delete(connection.connectionId);
    };
    $26088d7da5b03f69$export$ecd1fc136c4224482.prototype.getConnection = function(peerId, connectionId) {
      var e_3, _a2;
      var connections = this._connections.get(peerId);
      if (!connections)
        return null;
      try {
        for (var connections_1 = $26088d7da5b03f69$var$__values(connections), connections_1_1 = connections_1.next(); !connections_1_1.done; connections_1_1 = connections_1.next()) {
          var connection = connections_1_1.value;
          if (connection.connectionId === connectionId)
            return connection;
        }
      } catch (e_3_1) {
        e_3 = {
          error: e_3_1
        };
      } finally {
        try {
          if (connections_1_1 && !connections_1_1.done && (_a2 = connections_1.return))
            _a2.call(connections_1);
        } finally {
          if (e_3)
            throw e_3.error;
        }
      }
      return null;
    };
    $26088d7da5b03f69$export$ecd1fc136c4224482.prototype._delayedAbort = function(type, message) {
      var _this = this;
      setTimeout(function() {
        _this._abort(type, message);
      }, 0);
    };
    $26088d7da5b03f69$export$ecd1fc136c4224482.prototype._abort = function(type, message) {
      $1615705ecc6adca3$exports.default.error("Aborting!");
      this.emitError(type, message);
      if (!this._lastServerId)
        this.destroy();
      else
        this.disconnect();
    };
    $26088d7da5b03f69$export$ecd1fc136c4224482.prototype.emitError = function(type, err) {
      $1615705ecc6adca3$exports.default.error("Error:", err);
      var error3;
      if (typeof err === "string")
        error3 = new Error(err);
      else
        error3 = err;
      error3.type = type;
      this.emit("error", error3);
    };
    $26088d7da5b03f69$export$ecd1fc136c4224482.prototype.destroy = function() {
      if (this.destroyed)
        return;
      $1615705ecc6adca3$exports.default.log("Destroy peer with ID:".concat(this.id));
      this.disconnect();
      this._cleanup();
      this._destroyed = true;
      this.emit("close");
    };
    $26088d7da5b03f69$export$ecd1fc136c4224482.prototype._cleanup = function() {
      var e_4, _a2;
      try {
        for (var _b = $26088d7da5b03f69$var$__values(this._connections.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
          var peerId = _c.value;
          this._cleanupPeer(peerId);
          this._connections.delete(peerId);
        }
      } catch (e_4_1) {
        e_4 = {
          error: e_4_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a2 = _b.return))
            _a2.call(_b);
        } finally {
          if (e_4)
            throw e_4.error;
        }
      }
      this.socket.removeAllListeners();
    };
    $26088d7da5b03f69$export$ecd1fc136c4224482.prototype._cleanupPeer = function(peerId) {
      var e_5, _a2;
      var connections = this._connections.get(peerId);
      if (!connections)
        return;
      try {
        for (var connections_2 = $26088d7da5b03f69$var$__values(connections), connections_2_1 = connections_2.next(); !connections_2_1.done; connections_2_1 = connections_2.next()) {
          var connection = connections_2_1.value;
          connection.close();
        }
      } catch (e_5_1) {
        e_5 = {
          error: e_5_1
        };
      } finally {
        try {
          if (connections_2_1 && !connections_2_1.done && (_a2 = connections_2.return))
            _a2.call(connections_2);
        } finally {
          if (e_5)
            throw e_5.error;
        }
      }
    };
    $26088d7da5b03f69$export$ecd1fc136c4224482.prototype.disconnect = function() {
      if (this.disconnected)
        return;
      var currentId = this.id;
      $1615705ecc6adca3$exports.default.log("Disconnect peer with ID:".concat(currentId));
      this._disconnected = true;
      this._open = false;
      this.socket.close();
      this._lastServerId = currentId;
      this._id = null;
      this.emit("disconnected", currentId);
    };
    $26088d7da5b03f69$export$ecd1fc136c4224482.prototype.reconnect = function() {
      if (this.disconnected && !this.destroyed) {
        $1615705ecc6adca3$exports.default.log("Attempting reconnection to server with ID ".concat(this._lastServerId));
        this._disconnected = false;
        this._initialize(this._lastServerId);
      } else if (this.destroyed)
        throw new Error("This peer cannot reconnect to the server. It has already been destroyed.");
      else if (!this.disconnected && !this.open)
        $1615705ecc6adca3$exports.default.error("In a hurry? We're still trying to make the initial connection!");
      else
        throw new Error("Peer ".concat(this.id, " cannot reconnect because it is not disconnected from the server!"));
    };
    $26088d7da5b03f69$export$ecd1fc136c4224482.prototype.listAllPeers = function(cb) {
      var _this = this;
      if (cb === void 0)
        cb = function(_) {
        };
      this._api.listAllPeers().then(function(peers) {
        return cb(peers);
      }).catch(function(error3) {
        return _this._abort($60fadef21a2daafc$export$9547aaa2e39030ff.ServerError, error3);
      });
    };
    $26088d7da5b03f69$export$ecd1fc136c4224482.DEFAULT_KEY = "peerjs";
    return $26088d7da5b03f69$export$ecd1fc136c4224482;
  }($ac9b757d51178e15$exports.EventEmitter);
  var $70d766613f57b014$export$2e2bcd8739ae039 = $26088d7da5b03f69$exports.Peer;

  // backend/networking/requests.ts
  var joinRoom = (roomId, ownPeerId) => {
    fetch(`/rooms/${roomId}/join`, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        peer_id: ownPeerId
      })
    }).then((res) => res.json()).then(() => console.log("Requested to join room")).catch((e) => console.error("Error in joining room : ", e));
  };

  // node_modules/xstate/es/_virtual/_tslib.js
  var __assign = function() {
    __assign = Object.assign || function __assign2(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  function __rest(s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  }
  function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m)
      return m.call(o);
    if (o && typeof o.length === "number")
      return {
        next: function() {
          if (o && i >= o.length)
            o = void 0;
          return { value: o && o[i++], done: !o };
        }
      };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }
  function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m)
      return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
        ar.push(r.value);
    } catch (error3) {
      e = { error: error3 };
    } finally {
      try {
        if (r && !r.done && (m = i["return"]))
          m.call(i);
      } finally {
        if (e)
          throw e.error;
      }
    }
    return ar;
  }
  function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar)
            ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  }

  // node_modules/xstate/es/types.js
  var ActionTypes;
  (function(ActionTypes2) {
    ActionTypes2["Start"] = "xstate.start";
    ActionTypes2["Stop"] = "xstate.stop";
    ActionTypes2["Raise"] = "xstate.raise";
    ActionTypes2["Send"] = "xstate.send";
    ActionTypes2["Cancel"] = "xstate.cancel";
    ActionTypes2["NullEvent"] = "";
    ActionTypes2["Assign"] = "xstate.assign";
    ActionTypes2["After"] = "xstate.after";
    ActionTypes2["DoneState"] = "done.state";
    ActionTypes2["DoneInvoke"] = "done.invoke";
    ActionTypes2["Log"] = "xstate.log";
    ActionTypes2["Init"] = "xstate.init";
    ActionTypes2["Invoke"] = "xstate.invoke";
    ActionTypes2["ErrorExecution"] = "error.execution";
    ActionTypes2["ErrorCommunication"] = "error.communication";
    ActionTypes2["ErrorPlatform"] = "error.platform";
    ActionTypes2["ErrorCustom"] = "xstate.error";
    ActionTypes2["Update"] = "xstate.update";
    ActionTypes2["Pure"] = "xstate.pure";
    ActionTypes2["Choose"] = "xstate.choose";
  })(ActionTypes || (ActionTypes = {}));
  var SpecialTargets;
  (function(SpecialTargets2) {
    SpecialTargets2["Parent"] = "#_parent";
    SpecialTargets2["Internal"] = "#_internal";
  })(SpecialTargets || (SpecialTargets = {}));

  // node_modules/xstate/es/actionTypes.js
  var start = ActionTypes.Start;
  var stop = ActionTypes.Stop;
  var raise = ActionTypes.Raise;
  var send = ActionTypes.Send;
  var cancel = ActionTypes.Cancel;
  var nullEvent = ActionTypes.NullEvent;
  var assign = ActionTypes.Assign;
  var after = ActionTypes.After;
  var doneState = ActionTypes.DoneState;
  var log2 = ActionTypes.Log;
  var init = ActionTypes.Init;
  var invoke = ActionTypes.Invoke;
  var errorExecution = ActionTypes.ErrorExecution;
  var errorPlatform = ActionTypes.ErrorPlatform;
  var error = ActionTypes.ErrorCustom;
  var update = ActionTypes.Update;
  var choose = ActionTypes.Choose;
  var pure = ActionTypes.Pure;

  // node_modules/xstate/es/constants.js
  var STATE_DELIMITER = ".";
  var EMPTY_ACTIVITY_MAP = {};
  var DEFAULT_GUARD_TYPE = "xstate.guard";
  var TARGETLESS_KEY = "";

  // node_modules/xstate/es/environment.js
  var IS_PRODUCTION = false;

  // node_modules/xstate/es/utils.js
  var _a;
  function matchesState(parentStateId, childStateId, delimiter) {
    if (delimiter === void 0) {
      delimiter = STATE_DELIMITER;
    }
    var parentStateValue = toStateValue(parentStateId, delimiter);
    var childStateValue = toStateValue(childStateId, delimiter);
    if (isString(childStateValue)) {
      if (isString(parentStateValue)) {
        return childStateValue === parentStateValue;
      }
      return false;
    }
    if (isString(parentStateValue)) {
      return parentStateValue in childStateValue;
    }
    return Object.keys(parentStateValue).every(function(key) {
      if (!(key in childStateValue)) {
        return false;
      }
      return matchesState(parentStateValue[key], childStateValue[key]);
    });
  }
  function getEventType(event2) {
    try {
      return isString(event2) || typeof event2 === "number" ? "".concat(event2) : event2.type;
    } catch (e) {
      throw new Error("Events must be strings or objects with a string event.type property.");
    }
  }
  function toStatePath(stateId, delimiter) {
    try {
      if (isArray(stateId)) {
        return stateId;
      }
      return stateId.toString().split(delimiter);
    } catch (e) {
      throw new Error("'".concat(stateId, "' is not a valid state path."));
    }
  }
  function isStateLike(state) {
    return typeof state === "object" && "value" in state && "context" in state && "event" in state && "_event" in state;
  }
  function toStateValue(stateValue, delimiter) {
    if (isStateLike(stateValue)) {
      return stateValue.value;
    }
    if (isArray(stateValue)) {
      return pathToStateValue(stateValue);
    }
    if (typeof stateValue !== "string") {
      return stateValue;
    }
    var statePath = toStatePath(stateValue, delimiter);
    return pathToStateValue(statePath);
  }
  function pathToStateValue(statePath) {
    if (statePath.length === 1) {
      return statePath[0];
    }
    var value = {};
    var marker = value;
    for (var i = 0; i < statePath.length - 1; i++) {
      if (i === statePath.length - 2) {
        marker[statePath[i]] = statePath[i + 1];
      } else {
        marker[statePath[i]] = {};
        marker = marker[statePath[i]];
      }
    }
    return value;
  }
  function mapValues(collection, iteratee) {
    var result = {};
    var collectionKeys = Object.keys(collection);
    for (var i = 0; i < collectionKeys.length; i++) {
      var key = collectionKeys[i];
      result[key] = iteratee(collection[key], key, collection, i);
    }
    return result;
  }
  function mapFilterValues(collection, iteratee, predicate) {
    var e_1, _a2;
    var result = {};
    try {
      for (var _b = __values(Object.keys(collection)), _c = _b.next(); !_c.done; _c = _b.next()) {
        var key = _c.value;
        var item = collection[key];
        if (!predicate(item)) {
          continue;
        }
        result[key] = iteratee(item, key, collection);
      }
    } catch (e_1_1) {
      e_1 = {
        error: e_1_1
      };
    } finally {
      try {
        if (_c && !_c.done && (_a2 = _b.return))
          _a2.call(_b);
      } finally {
        if (e_1)
          throw e_1.error;
      }
    }
    return result;
  }
  var path = function(props) {
    return function(object) {
      var e_2, _a2;
      var result = object;
      try {
        for (var props_1 = __values(props), props_1_1 = props_1.next(); !props_1_1.done; props_1_1 = props_1.next()) {
          var prop = props_1_1.value;
          result = result[prop];
        }
      } catch (e_2_1) {
        e_2 = {
          error: e_2_1
        };
      } finally {
        try {
          if (props_1_1 && !props_1_1.done && (_a2 = props_1.return))
            _a2.call(props_1);
        } finally {
          if (e_2)
            throw e_2.error;
        }
      }
      return result;
    };
  };
  function nestedPath(props, accessorProp) {
    return function(object) {
      var e_3, _a2;
      var result = object;
      try {
        for (var props_2 = __values(props), props_2_1 = props_2.next(); !props_2_1.done; props_2_1 = props_2.next()) {
          var prop = props_2_1.value;
          result = result[accessorProp][prop];
        }
      } catch (e_3_1) {
        e_3 = {
          error: e_3_1
        };
      } finally {
        try {
          if (props_2_1 && !props_2_1.done && (_a2 = props_2.return))
            _a2.call(props_2);
        } finally {
          if (e_3)
            throw e_3.error;
        }
      }
      return result;
    };
  }
  function toStatePaths(stateValue) {
    if (!stateValue) {
      return [[]];
    }
    if (isString(stateValue)) {
      return [[stateValue]];
    }
    var result = flatten(Object.keys(stateValue).map(function(key) {
      var subStateValue = stateValue[key];
      if (typeof subStateValue !== "string" && (!subStateValue || !Object.keys(subStateValue).length)) {
        return [[key]];
      }
      return toStatePaths(stateValue[key]).map(function(subPath) {
        return [key].concat(subPath);
      });
    }));
    return result;
  }
  function flatten(array) {
    var _a2;
    return (_a2 = []).concat.apply(_a2, __spreadArray([], __read(array), false));
  }
  function toArrayStrict(value) {
    if (isArray(value)) {
      return value;
    }
    return [value];
  }
  function toArray(value) {
    if (value === void 0) {
      return [];
    }
    return toArrayStrict(value);
  }
  function mapContext(mapper, context, _event) {
    var e_5, _a2;
    if (isFunction(mapper)) {
      return mapper(context, _event.data);
    }
    var result = {};
    try {
      for (var _b = __values(Object.keys(mapper)), _c = _b.next(); !_c.done; _c = _b.next()) {
        var key = _c.value;
        var subMapper = mapper[key];
        if (isFunction(subMapper)) {
          result[key] = subMapper(context, _event.data);
        } else {
          result[key] = subMapper;
        }
      }
    } catch (e_5_1) {
      e_5 = {
        error: e_5_1
      };
    } finally {
      try {
        if (_c && !_c.done && (_a2 = _b.return))
          _a2.call(_b);
      } finally {
        if (e_5)
          throw e_5.error;
      }
    }
    return result;
  }
  function isBuiltInEvent(eventType) {
    return /^(done|error)\./.test(eventType);
  }
  function isPromiseLike(value) {
    if (value instanceof Promise) {
      return true;
    }
    if (value !== null && (isFunction(value) || typeof value === "object") && isFunction(value.then)) {
      return true;
    }
    return false;
  }
  function isBehavior(value) {
    return value !== null && typeof value === "object" && "transition" in value && typeof value.transition === "function";
  }
  function partition(items, predicate) {
    var e_6, _a2;
    var _b = __read([[], []], 2), truthy = _b[0], falsy = _b[1];
    try {
      for (var items_1 = __values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
        var item = items_1_1.value;
        if (predicate(item)) {
          truthy.push(item);
        } else {
          falsy.push(item);
        }
      }
    } catch (e_6_1) {
      e_6 = {
        error: e_6_1
      };
    } finally {
      try {
        if (items_1_1 && !items_1_1.done && (_a2 = items_1.return))
          _a2.call(items_1);
      } finally {
        if (e_6)
          throw e_6.error;
      }
    }
    return [truthy, falsy];
  }
  function updateHistoryStates(hist, stateValue) {
    return mapValues(hist.states, function(subHist, key) {
      if (!subHist) {
        return void 0;
      }
      var subStateValue = (isString(stateValue) ? void 0 : stateValue[key]) || (subHist ? subHist.current : void 0);
      if (!subStateValue) {
        return void 0;
      }
      return {
        current: subStateValue,
        states: updateHistoryStates(subHist, subStateValue)
      };
    });
  }
  function updateHistoryValue(hist, stateValue) {
    return {
      current: stateValue,
      states: updateHistoryStates(hist, stateValue)
    };
  }
  function updateContext(context, _event, assignActions, state) {
    if (!IS_PRODUCTION) {
      warn(!!context, "Attempting to update undefined context");
    }
    var updatedContext = context ? assignActions.reduce(function(acc, assignAction) {
      var e_7, _a2;
      var assignment = assignAction.assignment;
      var meta = {
        state,
        action: assignAction,
        _event
      };
      var partialUpdate = {};
      if (isFunction(assignment)) {
        partialUpdate = assignment(acc, _event.data, meta);
      } else {
        try {
          for (var _b = __values(Object.keys(assignment)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var key = _c.value;
            var propAssignment = assignment[key];
            partialUpdate[key] = isFunction(propAssignment) ? propAssignment(acc, _event.data, meta) : propAssignment;
          }
        } catch (e_7_1) {
          e_7 = {
            error: e_7_1
          };
        } finally {
          try {
            if (_c && !_c.done && (_a2 = _b.return))
              _a2.call(_b);
          } finally {
            if (e_7)
              throw e_7.error;
          }
        }
      }
      return Object.assign({}, acc, partialUpdate);
    }, context) : context;
    return updatedContext;
  }
  var warn = function() {
  };
  if (!IS_PRODUCTION) {
    warn = function(condition, message) {
      var error3 = condition instanceof Error ? condition : void 0;
      if (!error3 && condition) {
        return;
      }
      if (console !== void 0) {
        var args = ["Warning: ".concat(message)];
        if (error3) {
          args.push(error3);
        }
        console.warn.apply(console, args);
      }
    };
  }
  function isArray(value) {
    return Array.isArray(value);
  }
  function isFunction(value) {
    return typeof value === "function";
  }
  function isString(value) {
    return typeof value === "string";
  }
  function toGuard(condition, guardMap) {
    if (!condition) {
      return void 0;
    }
    if (isString(condition)) {
      return {
        type: DEFAULT_GUARD_TYPE,
        name: condition,
        predicate: guardMap ? guardMap[condition] : void 0
      };
    }
    if (isFunction(condition)) {
      return {
        type: DEFAULT_GUARD_TYPE,
        name: condition.name,
        predicate: condition
      };
    }
    return condition;
  }
  function isObservable(value) {
    try {
      return "subscribe" in value && isFunction(value.subscribe);
    } catch (e) {
      return false;
    }
  }
  var symbolObservable = /* @__PURE__ */ function() {
    return typeof Symbol === "function" && Symbol.observable || "@@observable";
  }();
  var interopSymbols = (_a = {}, _a[symbolObservable] = function() {
    return this;
  }, _a[Symbol.observable] = function() {
    return this;
  }, _a);
  function isMachine(value) {
    return !!value && "__xstatenode" in value;
  }
  function isActor(value) {
    return !!value && typeof value.send === "function";
  }
  var uniqueId = /* @__PURE__ */ function() {
    var currentId = 0;
    return function() {
      currentId++;
      return currentId.toString(16);
    };
  }();
  function toEventObject(event2, payload) {
    if (isString(event2) || typeof event2 === "number") {
      return __assign({
        type: event2
      }, payload);
    }
    return event2;
  }
  function toSCXMLEvent(event2, scxmlEvent) {
    if (!isString(event2) && "$$type" in event2 && event2.$$type === "scxml") {
      return event2;
    }
    var eventObject = toEventObject(event2);
    return __assign({
      name: eventObject.type,
      data: eventObject,
      $$type: "scxml",
      type: "external"
    }, scxmlEvent);
  }
  function toTransitionConfigArray(event2, configLike) {
    var transitions = toArrayStrict(configLike).map(function(transitionLike) {
      if (typeof transitionLike === "undefined" || typeof transitionLike === "string" || isMachine(transitionLike)) {
        return {
          target: transitionLike,
          event: event2
        };
      }
      return __assign(__assign({}, transitionLike), {
        event: event2
      });
    });
    return transitions;
  }
  function normalizeTarget(target) {
    if (target === void 0 || target === TARGETLESS_KEY) {
      return void 0;
    }
    return toArray(target);
  }
  function reportUnhandledExceptionOnInvocation(originalError, currentError, id) {
    if (!IS_PRODUCTION) {
      var originalStackTrace = originalError.stack ? " Stacktrace was '".concat(originalError.stack, "'") : "";
      if (originalError === currentError) {
        console.error("Missing onError handler for invocation '".concat(id, "', error was '").concat(originalError, "'.").concat(originalStackTrace));
      } else {
        var stackTrace = currentError.stack ? " Stacktrace was '".concat(currentError.stack, "'") : "";
        console.error("Missing onError handler and/or unhandled exception/promise rejection for invocation '".concat(id, "'. ") + "Original error: '".concat(originalError, "'. ").concat(originalStackTrace, " Current error is '").concat(currentError, "'.").concat(stackTrace));
      }
    }
  }
  function evaluateGuard(machine, guard, context, _event, state) {
    var guards = machine.options.guards;
    var guardMeta = {
      state,
      cond: guard,
      _event
    };
    if (guard.type === DEFAULT_GUARD_TYPE) {
      return ((guards === null || guards === void 0 ? void 0 : guards[guard.name]) || guard.predicate)(context, _event.data, guardMeta);
    }
    var condFn = guards === null || guards === void 0 ? void 0 : guards[guard.type];
    if (!condFn) {
      throw new Error("Guard '".concat(guard.type, "' is not implemented on machine '").concat(machine.id, "'."));
    }
    return condFn(context, _event.data, guardMeta);
  }
  function toInvokeSource(src) {
    if (typeof src === "string") {
      return {
        type: src
      };
    }
    return src;
  }
  function toObserver(nextHandler, errorHandler, completionHandler) {
    if (typeof nextHandler === "object") {
      return nextHandler;
    }
    var noop = function() {
      return void 0;
    };
    return {
      next: nextHandler,
      error: errorHandler || noop,
      complete: completionHandler || noop
    };
  }
  function createInvokeId(stateNodeId, index) {
    return "".concat(stateNodeId, ":invocation[").concat(index, "]");
  }

  // node_modules/xstate/es/actions.js
  var initEvent = /* @__PURE__ */ toSCXMLEvent({
    type: init
  });
  function getActionFunction(actionType, actionFunctionMap) {
    return actionFunctionMap ? actionFunctionMap[actionType] || void 0 : void 0;
  }
  function toActionObject(action, actionFunctionMap) {
    var actionObject;
    if (isString(action) || typeof action === "number") {
      var exec = getActionFunction(action, actionFunctionMap);
      if (isFunction(exec)) {
        actionObject = {
          type: action,
          exec
        };
      } else if (exec) {
        actionObject = exec;
      } else {
        actionObject = {
          type: action,
          exec: void 0
        };
      }
    } else if (isFunction(action)) {
      actionObject = {
        type: action.name || action.toString(),
        exec: action
      };
    } else {
      var exec = getActionFunction(action.type, actionFunctionMap);
      if (isFunction(exec)) {
        actionObject = __assign(__assign({}, action), {
          exec
        });
      } else if (exec) {
        var actionType = exec.type || action.type;
        actionObject = __assign(__assign(__assign({}, exec), action), {
          type: actionType
        });
      } else {
        actionObject = action;
      }
    }
    return actionObject;
  }
  var toActionObjects = function(action, actionFunctionMap) {
    if (!action) {
      return [];
    }
    var actions2 = isArray(action) ? action : [action];
    return actions2.map(function(subAction) {
      return toActionObject(subAction, actionFunctionMap);
    });
  };
  function toActivityDefinition(action) {
    var actionObject = toActionObject(action);
    return __assign(__assign({
      id: isString(action) ? action : actionObject.id
    }, actionObject), {
      type: actionObject.type
    });
  }
  function raise2(event2) {
    if (!isString(event2)) {
      return send2(event2, {
        to: SpecialTargets.Internal
      });
    }
    return {
      type: raise,
      event: event2
    };
  }
  function resolveRaise(action) {
    return {
      type: raise,
      _event: toSCXMLEvent(action.event)
    };
  }
  function send2(event2, options) {
    return {
      to: options ? options.to : void 0,
      type: send,
      event: isFunction(event2) ? event2 : toEventObject(event2),
      delay: options ? options.delay : void 0,
      id: options && options.id !== void 0 ? options.id : isFunction(event2) ? event2.name : getEventType(event2)
    };
  }
  function resolveSend(action, ctx, _event, delaysMap) {
    var meta = {
      _event
    };
    var resolvedEvent = toSCXMLEvent(isFunction(action.event) ? action.event(ctx, _event.data, meta) : action.event);
    var resolvedDelay;
    if (isString(action.delay)) {
      var configDelay = delaysMap && delaysMap[action.delay];
      resolvedDelay = isFunction(configDelay) ? configDelay(ctx, _event.data, meta) : configDelay;
    } else {
      resolvedDelay = isFunction(action.delay) ? action.delay(ctx, _event.data, meta) : action.delay;
    }
    var resolvedTarget = isFunction(action.to) ? action.to(ctx, _event.data, meta) : action.to;
    return __assign(__assign({}, action), {
      to: resolvedTarget,
      _event: resolvedEvent,
      event: resolvedEvent.data,
      delay: resolvedDelay
    });
  }
  var resolveLog = function(action, ctx, _event) {
    return __assign(__assign({}, action), {
      value: isString(action.expr) ? action.expr : action.expr(ctx, _event.data, {
        _event
      })
    });
  };
  var cancel2 = function(sendId) {
    return {
      type: cancel,
      sendId
    };
  };
  function start2(activity) {
    var activityDef = toActivityDefinition(activity);
    return {
      type: ActionTypes.Start,
      activity: activityDef,
      exec: void 0
    };
  }
  function stop2(actorRef) {
    var activity = isFunction(actorRef) ? actorRef : toActivityDefinition(actorRef);
    return {
      type: ActionTypes.Stop,
      activity,
      exec: void 0
    };
  }
  function resolveStop(action, context, _event) {
    var actorRefOrString = isFunction(action.activity) ? action.activity(context, _event.data) : action.activity;
    var resolvedActorRef = typeof actorRefOrString === "string" ? {
      id: actorRefOrString
    } : actorRefOrString;
    var actionObject = {
      type: ActionTypes.Stop,
      activity: resolvedActorRef
    };
    return actionObject;
  }
  var assign2 = function(assignment) {
    return {
      type: assign,
      assignment
    };
  };
  function after2(delayRef, id) {
    var idSuffix = id ? "#".concat(id) : "";
    return "".concat(ActionTypes.After, "(").concat(delayRef, ")").concat(idSuffix);
  }
  function done(id, data) {
    var type = "".concat(ActionTypes.DoneState, ".").concat(id);
    var eventObject = {
      type,
      data
    };
    eventObject.toString = function() {
      return type;
    };
    return eventObject;
  }
  function doneInvoke(id, data) {
    var type = "".concat(ActionTypes.DoneInvoke, ".").concat(id);
    var eventObject = {
      type,
      data
    };
    eventObject.toString = function() {
      return type;
    };
    return eventObject;
  }
  function error2(id, data) {
    var type = "".concat(ActionTypes.ErrorPlatform, ".").concat(id);
    var eventObject = {
      type,
      data
    };
    eventObject.toString = function() {
      return type;
    };
    return eventObject;
  }
  function resolveActions(machine, currentState, currentContext, _event, actions2, preserveActionOrder) {
    if (preserveActionOrder === void 0) {
      preserveActionOrder = false;
    }
    var _a2 = __read(preserveActionOrder ? [[], actions2] : partition(actions2, function(action) {
      return action.type === assign;
    }), 2), assignActions = _a2[0], otherActions = _a2[1];
    var updatedContext = assignActions.length ? updateContext(currentContext, _event, assignActions, currentState) : currentContext;
    var preservedContexts = preserveActionOrder ? [currentContext] : void 0;
    var resolvedActions = flatten(otherActions.map(function(actionObject) {
      var _a3;
      switch (actionObject.type) {
        case raise:
          return resolveRaise(actionObject);
        case send:
          var sendAction = resolveSend(actionObject, updatedContext, _event, machine.options.delays);
          if (!IS_PRODUCTION) {
            warn(
              !isString(actionObject.delay) || typeof sendAction.delay === "number",
              "No delay reference for delay expression '".concat(actionObject.delay, "' was found on machine '").concat(machine.id, "'")
            );
          }
          return sendAction;
        case log2:
          return resolveLog(actionObject, updatedContext, _event);
        case choose: {
          var chooseAction = actionObject;
          var matchedActions = (_a3 = chooseAction.conds.find(function(condition) {
            var guard = toGuard(condition.cond, machine.options.guards);
            return !guard || evaluateGuard(machine, guard, updatedContext, _event, currentState);
          })) === null || _a3 === void 0 ? void 0 : _a3.actions;
          if (!matchedActions) {
            return [];
          }
          var _b = __read(resolveActions(machine, currentState, updatedContext, _event, toActionObjects(toArray(matchedActions), machine.options.actions), preserveActionOrder), 2), resolvedActionsFromChoose = _b[0], resolvedContextFromChoose = _b[1];
          updatedContext = resolvedContextFromChoose;
          preservedContexts === null || preservedContexts === void 0 ? void 0 : preservedContexts.push(updatedContext);
          return resolvedActionsFromChoose;
        }
        case pure: {
          var matchedActions = actionObject.get(updatedContext, _event.data);
          if (!matchedActions) {
            return [];
          }
          var _c = __read(resolveActions(machine, currentState, updatedContext, _event, toActionObjects(toArray(matchedActions), machine.options.actions), preserveActionOrder), 2), resolvedActionsFromPure = _c[0], resolvedContext = _c[1];
          updatedContext = resolvedContext;
          preservedContexts === null || preservedContexts === void 0 ? void 0 : preservedContexts.push(updatedContext);
          return resolvedActionsFromPure;
        }
        case stop: {
          return resolveStop(actionObject, updatedContext, _event);
        }
        case assign: {
          updatedContext = updateContext(updatedContext, _event, [actionObject], currentState);
          preservedContexts === null || preservedContexts === void 0 ? void 0 : preservedContexts.push(updatedContext);
          break;
        }
        default:
          var resolvedActionObject = toActionObject(actionObject, machine.options.actions);
          var exec_1 = resolvedActionObject.exec;
          if (exec_1 && preservedContexts) {
            var contextIndex_1 = preservedContexts.length - 1;
            resolvedActionObject = __assign(__assign({}, resolvedActionObject), {
              exec: function(_ctx) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                  args[_i - 1] = arguments[_i];
                }
                exec_1.apply(void 0, __spreadArray([preservedContexts[contextIndex_1]], __read(args), false));
              }
            });
          }
          return resolvedActionObject;
      }
    }).filter(function(a) {
      return !!a;
    }));
    return [resolvedActions, updatedContext];
  }

  // node_modules/xstate/es/serviceScope.js
  var serviceStack = [];
  var provide = function(service, fn) {
    serviceStack.push(service);
    var result = fn(service);
    serviceStack.pop();
    return result;
  };
  var consume = function(fn) {
    return fn(serviceStack[serviceStack.length - 1]);
  };

  // node_modules/xstate/es/Actor.js
  function createNullActor(id) {
    var _a2;
    return _a2 = {
      id,
      send: function() {
        return void 0;
      },
      subscribe: function() {
        return {
          unsubscribe: function() {
            return void 0;
          }
        };
      },
      getSnapshot: function() {
        return void 0;
      },
      toJSON: function() {
        return {
          id
        };
      }
    }, _a2[symbolObservable] = function() {
      return this;
    }, _a2;
  }
  function createInvocableActor(invokeDefinition, machine, context, _event) {
    var _a2;
    var invokeSrc = toInvokeSource(invokeDefinition.src);
    var serviceCreator = (_a2 = machine === null || machine === void 0 ? void 0 : machine.options.services) === null || _a2 === void 0 ? void 0 : _a2[invokeSrc.type];
    var resolvedData = invokeDefinition.data ? mapContext(invokeDefinition.data, context, _event) : void 0;
    var tempActor = serviceCreator ? createDeferredActor(serviceCreator, invokeDefinition.id, resolvedData) : createNullActor(invokeDefinition.id);
    tempActor.meta = invokeDefinition;
    return tempActor;
  }
  function createDeferredActor(entity, id, data) {
    var tempActor = createNullActor(id);
    tempActor.deferred = true;
    if (isMachine(entity)) {
      var initialState_1 = tempActor.state = provide(void 0, function() {
        return (data ? entity.withContext(data) : entity).initialState;
      });
      tempActor.getSnapshot = function() {
        return initialState_1;
      };
    }
    return tempActor;
  }
  function isActor2(item) {
    try {
      return typeof item.send === "function";
    } catch (e) {
      return false;
    }
  }
  function isSpawnedActor(item) {
    return isActor2(item) && "id" in item;
  }
  function toActorRef(actorRefLike) {
    var _a2;
    return __assign((_a2 = {
      subscribe: function() {
        return {
          unsubscribe: function() {
            return void 0;
          }
        };
      },
      id: "anonymous",
      getSnapshot: function() {
        return void 0;
      }
    }, _a2[symbolObservable] = function() {
      return this;
    }, _a2), actorRefLike);
  }

  // node_modules/xstate/es/stateUtils.js
  var isLeafNode = function(stateNode) {
    return stateNode.type === "atomic" || stateNode.type === "final";
  };
  function getChildren(stateNode) {
    return Object.keys(stateNode.states).map(function(key) {
      return stateNode.states[key];
    });
  }
  function getAllStateNodes(stateNode) {
    var stateNodes = [stateNode];
    if (isLeafNode(stateNode)) {
      return stateNodes;
    }
    return stateNodes.concat(flatten(getChildren(stateNode).map(getAllStateNodes)));
  }
  function getConfiguration(prevStateNodes, stateNodes) {
    var e_1, _a2, e_2, _b, e_3, _c, e_4, _d;
    var prevConfiguration = new Set(prevStateNodes);
    var prevAdjList = getAdjList(prevConfiguration);
    var configuration = new Set(stateNodes);
    try {
      for (var configuration_1 = __values(configuration), configuration_1_1 = configuration_1.next(); !configuration_1_1.done; configuration_1_1 = configuration_1.next()) {
        var s = configuration_1_1.value;
        var m = s.parent;
        while (m && !configuration.has(m)) {
          configuration.add(m);
          m = m.parent;
        }
      }
    } catch (e_1_1) {
      e_1 = {
        error: e_1_1
      };
    } finally {
      try {
        if (configuration_1_1 && !configuration_1_1.done && (_a2 = configuration_1.return))
          _a2.call(configuration_1);
      } finally {
        if (e_1)
          throw e_1.error;
      }
    }
    var adjList = getAdjList(configuration);
    try {
      for (var configuration_2 = __values(configuration), configuration_2_1 = configuration_2.next(); !configuration_2_1.done; configuration_2_1 = configuration_2.next()) {
        var s = configuration_2_1.value;
        if (s.type === "compound" && (!adjList.get(s) || !adjList.get(s).length)) {
          if (prevAdjList.get(s)) {
            prevAdjList.get(s).forEach(function(sn) {
              return configuration.add(sn);
            });
          } else {
            s.initialStateNodes.forEach(function(sn) {
              return configuration.add(sn);
            });
          }
        } else {
          if (s.type === "parallel") {
            try {
              for (var _e = (e_3 = void 0, __values(getChildren(s))), _f = _e.next(); !_f.done; _f = _e.next()) {
                var child = _f.value;
                if (child.type === "history") {
                  continue;
                }
                if (!configuration.has(child)) {
                  configuration.add(child);
                  if (prevAdjList.get(child)) {
                    prevAdjList.get(child).forEach(function(sn) {
                      return configuration.add(sn);
                    });
                  } else {
                    child.initialStateNodes.forEach(function(sn) {
                      return configuration.add(sn);
                    });
                  }
                }
              }
            } catch (e_3_1) {
              e_3 = {
                error: e_3_1
              };
            } finally {
              try {
                if (_f && !_f.done && (_c = _e.return))
                  _c.call(_e);
              } finally {
                if (e_3)
                  throw e_3.error;
              }
            }
          }
        }
      }
    } catch (e_2_1) {
      e_2 = {
        error: e_2_1
      };
    } finally {
      try {
        if (configuration_2_1 && !configuration_2_1.done && (_b = configuration_2.return))
          _b.call(configuration_2);
      } finally {
        if (e_2)
          throw e_2.error;
      }
    }
    try {
      for (var configuration_3 = __values(configuration), configuration_3_1 = configuration_3.next(); !configuration_3_1.done; configuration_3_1 = configuration_3.next()) {
        var s = configuration_3_1.value;
        var m = s.parent;
        while (m && !configuration.has(m)) {
          configuration.add(m);
          m = m.parent;
        }
      }
    } catch (e_4_1) {
      e_4 = {
        error: e_4_1
      };
    } finally {
      try {
        if (configuration_3_1 && !configuration_3_1.done && (_d = configuration_3.return))
          _d.call(configuration_3);
      } finally {
        if (e_4)
          throw e_4.error;
      }
    }
    return configuration;
  }
  function getValueFromAdj(baseNode, adjList) {
    var childStateNodes = adjList.get(baseNode);
    if (!childStateNodes) {
      return {};
    }
    if (baseNode.type === "compound") {
      var childStateNode = childStateNodes[0];
      if (childStateNode) {
        if (isLeafNode(childStateNode)) {
          return childStateNode.key;
        }
      } else {
        return {};
      }
    }
    var stateValue = {};
    childStateNodes.forEach(function(csn) {
      stateValue[csn.key] = getValueFromAdj(csn, adjList);
    });
    return stateValue;
  }
  function getAdjList(configuration) {
    var e_5, _a2;
    var adjList = /* @__PURE__ */ new Map();
    try {
      for (var configuration_4 = __values(configuration), configuration_4_1 = configuration_4.next(); !configuration_4_1.done; configuration_4_1 = configuration_4.next()) {
        var s = configuration_4_1.value;
        if (!adjList.has(s)) {
          adjList.set(s, []);
        }
        if (s.parent) {
          if (!adjList.has(s.parent)) {
            adjList.set(s.parent, []);
          }
          adjList.get(s.parent).push(s);
        }
      }
    } catch (e_5_1) {
      e_5 = {
        error: e_5_1
      };
    } finally {
      try {
        if (configuration_4_1 && !configuration_4_1.done && (_a2 = configuration_4.return))
          _a2.call(configuration_4);
      } finally {
        if (e_5)
          throw e_5.error;
      }
    }
    return adjList;
  }
  function getValue(rootNode, configuration) {
    var config = getConfiguration([rootNode], configuration);
    return getValueFromAdj(rootNode, getAdjList(config));
  }
  function has(iterable, item) {
    if (Array.isArray(iterable)) {
      return iterable.some(function(member) {
        return member === item;
      });
    }
    if (iterable instanceof Set) {
      return iterable.has(item);
    }
    return false;
  }
  function nextEvents(configuration) {
    return __spreadArray([], __read(new Set(flatten(__spreadArray([], __read(configuration.map(function(sn) {
      return sn.ownEvents;
    })), false)))), false);
  }
  function isInFinalState(configuration, stateNode) {
    if (stateNode.type === "compound") {
      return getChildren(stateNode).some(function(s) {
        return s.type === "final" && has(configuration, s);
      });
    }
    if (stateNode.type === "parallel") {
      return getChildren(stateNode).every(function(sn) {
        return isInFinalState(configuration, sn);
      });
    }
    return false;
  }
  function getMeta(configuration) {
    if (configuration === void 0) {
      configuration = [];
    }
    return configuration.reduce(function(acc, stateNode) {
      if (stateNode.meta !== void 0) {
        acc[stateNode.id] = stateNode.meta;
      }
      return acc;
    }, {});
  }
  function getTagsFromConfiguration(configuration) {
    return new Set(flatten(configuration.map(function(sn) {
      return sn.tags;
    })));
  }

  // node_modules/xstate/es/State.js
  function stateValuesEqual(a, b) {
    if (a === b) {
      return true;
    }
    if (a === void 0 || b === void 0) {
      return false;
    }
    if (isString(a) || isString(b)) {
      return a === b;
    }
    var aKeys = Object.keys(a);
    var bKeys = Object.keys(b);
    return aKeys.length === bKeys.length && aKeys.every(function(key) {
      return stateValuesEqual(a[key], b[key]);
    });
  }
  function isStateConfig(state) {
    if (typeof state !== "object" || state === null) {
      return false;
    }
    return "value" in state && "_event" in state;
  }
  function bindActionToState(action, state) {
    var exec = action.exec;
    var boundAction = __assign(__assign({}, action), {
      exec: exec !== void 0 ? function() {
        return exec(state.context, state.event, {
          action,
          state,
          _event: state._event
        });
      } : void 0
    });
    return boundAction;
  }
  var State = /* @__PURE__ */ function() {
    function State2(config) {
      var _this = this;
      var _a2;
      this.actions = [];
      this.activities = EMPTY_ACTIVITY_MAP;
      this.meta = {};
      this.events = [];
      this.value = config.value;
      this.context = config.context;
      this._event = config._event;
      this._sessionid = config._sessionid;
      this.event = this._event.data;
      this.historyValue = config.historyValue;
      this.history = config.history;
      this.actions = config.actions || [];
      this.activities = config.activities || EMPTY_ACTIVITY_MAP;
      this.meta = getMeta(config.configuration);
      this.events = config.events || [];
      this.matches = this.matches.bind(this);
      this.toStrings = this.toStrings.bind(this);
      this.configuration = config.configuration;
      this.transitions = config.transitions;
      this.children = config.children;
      this.done = !!config.done;
      this.tags = (_a2 = Array.isArray(config.tags) ? new Set(config.tags) : config.tags) !== null && _a2 !== void 0 ? _a2 : /* @__PURE__ */ new Set();
      this.machine = config.machine;
      Object.defineProperty(this, "nextEvents", {
        get: function() {
          return nextEvents(_this.configuration);
        }
      });
    }
    State2.from = function(stateValue, context) {
      if (stateValue instanceof State2) {
        if (stateValue.context !== context) {
          return new State2({
            value: stateValue.value,
            context,
            _event: stateValue._event,
            _sessionid: null,
            historyValue: stateValue.historyValue,
            history: stateValue.history,
            actions: [],
            activities: stateValue.activities,
            meta: {},
            events: [],
            configuration: [],
            transitions: [],
            children: {}
          });
        }
        return stateValue;
      }
      var _event = initEvent;
      return new State2({
        value: stateValue,
        context,
        _event,
        _sessionid: null,
        historyValue: void 0,
        history: void 0,
        actions: [],
        activities: void 0,
        meta: void 0,
        events: [],
        configuration: [],
        transitions: [],
        children: {}
      });
    };
    State2.create = function(config) {
      return new State2(config);
    };
    State2.inert = function(stateValue, context) {
      if (stateValue instanceof State2) {
        if (!stateValue.actions.length) {
          return stateValue;
        }
        var _event = initEvent;
        return new State2({
          value: stateValue.value,
          context,
          _event,
          _sessionid: null,
          historyValue: stateValue.historyValue,
          history: stateValue.history,
          activities: stateValue.activities,
          configuration: stateValue.configuration,
          transitions: [],
          children: {}
        });
      }
      return State2.from(stateValue, context);
    };
    State2.prototype.toStrings = function(stateValue, delimiter) {
      var _this = this;
      if (stateValue === void 0) {
        stateValue = this.value;
      }
      if (delimiter === void 0) {
        delimiter = ".";
      }
      if (isString(stateValue)) {
        return [stateValue];
      }
      var valueKeys = Object.keys(stateValue);
      return valueKeys.concat.apply(valueKeys, __spreadArray([], __read(valueKeys.map(function(key) {
        return _this.toStrings(stateValue[key], delimiter).map(function(s) {
          return key + delimiter + s;
        });
      })), false));
    };
    State2.prototype.toJSON = function() {
      var _a2 = this;
      _a2.configuration;
      _a2.transitions;
      var tags = _a2.tags;
      _a2.machine;
      var jsonValues = __rest(_a2, ["configuration", "transitions", "tags", "machine"]);
      return __assign(__assign({}, jsonValues), {
        tags: Array.from(tags)
      });
    };
    State2.prototype.matches = function(parentStateValue) {
      return matchesState(parentStateValue, this.value);
    };
    State2.prototype.hasTag = function(tag) {
      return this.tags.has(tag);
    };
    State2.prototype.can = function(event2) {
      var _a2;
      if (IS_PRODUCTION) {
        warn(!!this.machine, "state.can(...) used outside of a machine-created State object; this will always return false.");
      }
      var transitionData = (_a2 = this.machine) === null || _a2 === void 0 ? void 0 : _a2.getTransitionData(this, event2);
      return !!(transitionData === null || transitionData === void 0 ? void 0 : transitionData.transitions.length) && transitionData.transitions.some(function(t) {
        return t.target !== void 0 || t.actions.length;
      });
    };
    return State2;
  }();

  // node_modules/xstate/es/scheduler.js
  var defaultOptions = {
    deferEvents: false
  };
  var Scheduler = /* @__PURE__ */ function() {
    function Scheduler2(options) {
      this.processingEvent = false;
      this.queue = [];
      this.initialized = false;
      this.options = __assign(__assign({}, defaultOptions), options);
    }
    Scheduler2.prototype.initialize = function(callback) {
      this.initialized = true;
      if (callback) {
        if (!this.options.deferEvents) {
          this.schedule(callback);
          return;
        }
        this.process(callback);
      }
      this.flushEvents();
    };
    Scheduler2.prototype.schedule = function(task) {
      if (!this.initialized || this.processingEvent) {
        this.queue.push(task);
        return;
      }
      if (this.queue.length !== 0) {
        throw new Error("Event queue should be empty when it is not processing events");
      }
      this.process(task);
      this.flushEvents();
    };
    Scheduler2.prototype.clear = function() {
      this.queue = [];
    };
    Scheduler2.prototype.flushEvents = function() {
      var nextCallback = this.queue.shift();
      while (nextCallback) {
        this.process(nextCallback);
        nextCallback = this.queue.shift();
      }
    };
    Scheduler2.prototype.process = function(callback) {
      this.processingEvent = true;
      try {
        callback();
      } catch (e) {
        this.clear();
        throw e;
      } finally {
        this.processingEvent = false;
      }
    };
    return Scheduler2;
  }();

  // node_modules/xstate/es/registry.js
  var children = /* @__PURE__ */ new Map();
  var sessionIdIndex = 0;
  var registry = {
    bookId: function() {
      return "x:".concat(sessionIdIndex++);
    },
    register: function(id, actor) {
      children.set(id, actor);
      return id;
    },
    get: function(id) {
      return children.get(id);
    },
    free: function(id) {
      children.delete(id);
    }
  };

  // node_modules/xstate/es/devTools.js
  function getGlobal() {
    if (typeof globalThis !== "undefined") {
      return globalThis;
    }
    if (typeof self !== "undefined") {
      return self;
    }
    if (typeof window !== "undefined") {
      return window;
    }
    if (typeof global !== "undefined") {
      return global;
    }
    if (!IS_PRODUCTION) {
      console.warn("XState could not find a global object in this environment. Please let the maintainers know and raise an issue here: https://github.com/statelyai/xstate/issues");
    }
  }
  function getDevTools() {
    var global2 = getGlobal();
    if (global2 && "__xstate__" in global2) {
      return global2.__xstate__;
    }
    return void 0;
  }
  function registerService(service) {
    if (!getGlobal()) {
      return;
    }
    var devTools = getDevTools();
    if (devTools) {
      devTools.register(service);
    }
  }

  // node_modules/xstate/es/behaviors.js
  function spawnBehavior(behavior, options) {
    if (options === void 0) {
      options = {};
    }
    var state = behavior.initialState;
    var observers = /* @__PURE__ */ new Set();
    var mailbox = [];
    var flushing = false;
    var flush = function() {
      if (flushing) {
        return;
      }
      flushing = true;
      while (mailbox.length > 0) {
        var event_1 = mailbox.shift();
        state = behavior.transition(state, event_1, actorCtx);
        observers.forEach(function(observer) {
          return observer.next(state);
        });
      }
      flushing = false;
    };
    var actor = toActorRef({
      id: options.id,
      send: function(event2) {
        mailbox.push(event2);
        flush();
      },
      getSnapshot: function() {
        return state;
      },
      subscribe: function(next, handleError, complete) {
        var observer = toObserver(next, handleError, complete);
        observers.add(observer);
        observer.next(state);
        return {
          unsubscribe: function() {
            observers.delete(observer);
          }
        };
      }
    });
    var actorCtx = {
      parent: options.parent,
      self: actor,
      id: options.id || "anonymous",
      observers
    };
    state = behavior.start ? behavior.start(actorCtx) : state;
    return actor;
  }

  // node_modules/xstate/es/interpreter.js
  var DEFAULT_SPAWN_OPTIONS = {
    sync: false,
    autoForward: false
  };
  var InterpreterStatus;
  (function(InterpreterStatus2) {
    InterpreterStatus2[InterpreterStatus2["NotStarted"] = 0] = "NotStarted";
    InterpreterStatus2[InterpreterStatus2["Running"] = 1] = "Running";
    InterpreterStatus2[InterpreterStatus2["Stopped"] = 2] = "Stopped";
  })(InterpreterStatus || (InterpreterStatus = {}));
  var Interpreter = /* @__PURE__ */ function() {
    function Interpreter2(machine, options) {
      var _this = this;
      if (options === void 0) {
        options = Interpreter2.defaultOptions;
      }
      this.machine = machine;
      this.scheduler = new Scheduler();
      this.delayedEventsMap = {};
      this.listeners = /* @__PURE__ */ new Set();
      this.contextListeners = /* @__PURE__ */ new Set();
      this.stopListeners = /* @__PURE__ */ new Set();
      this.doneListeners = /* @__PURE__ */ new Set();
      this.eventListeners = /* @__PURE__ */ new Set();
      this.sendListeners = /* @__PURE__ */ new Set();
      this.initialized = false;
      this.status = InterpreterStatus.NotStarted;
      this.children = /* @__PURE__ */ new Map();
      this.forwardTo = /* @__PURE__ */ new Set();
      this.init = this.start;
      this.send = function(event2, payload) {
        if (isArray(event2)) {
          _this.batch(event2);
          return _this.state;
        }
        var _event = toSCXMLEvent(toEventObject(event2, payload));
        if (_this.status === InterpreterStatus.Stopped) {
          if (!IS_PRODUCTION) {
            warn(false, 'Event "'.concat(_event.name, '" was sent to stopped service "').concat(_this.machine.id, '". This service has already reached its final state, and will not transition.\nEvent: ').concat(JSON.stringify(_event.data)));
          }
          return _this.state;
        }
        if (_this.status !== InterpreterStatus.Running && !_this.options.deferEvents) {
          throw new Error('Event "'.concat(_event.name, '" was sent to uninitialized service "').concat(
            _this.machine.id,
            '". Make sure .start() is called for this service, or set { deferEvents: true } in the service options.\nEvent: '
          ).concat(JSON.stringify(_event.data)));
        }
        _this.scheduler.schedule(function() {
          _this.forward(_event);
          var nextState = _this.nextState(_event);
          _this.update(nextState, _event);
        });
        return _this._state;
      };
      this.sendTo = function(event2, to) {
        var isParent = _this.parent && (to === SpecialTargets.Parent || _this.parent.id === to);
        var target = isParent ? _this.parent : isString(to) ? _this.children.get(to) || registry.get(to) : isActor(to) ? to : void 0;
        if (!target) {
          if (!isParent) {
            throw new Error("Unable to send event to child '".concat(to, "' from service '").concat(_this.id, "'."));
          }
          if (!IS_PRODUCTION) {
            warn(false, "Service '".concat(_this.id, "' has no parent: unable to send event ").concat(event2.type));
          }
          return;
        }
        if ("machine" in target) {
          target.send(__assign(__assign({}, event2), {
            name: event2.name === error ? "".concat(error2(_this.id)) : event2.name,
            origin: _this.sessionId
          }));
        } else {
          target.send(event2.data);
        }
      };
      var resolvedOptions = __assign(__assign({}, Interpreter2.defaultOptions), options);
      var clock = resolvedOptions.clock, logger = resolvedOptions.logger, parent = resolvedOptions.parent, id = resolvedOptions.id;
      var resolvedId = id !== void 0 ? id : machine.id;
      this.id = resolvedId;
      this.logger = logger;
      this.clock = clock;
      this.parent = parent;
      this.options = resolvedOptions;
      this.scheduler = new Scheduler({
        deferEvents: this.options.deferEvents
      });
      this.sessionId = registry.bookId();
    }
    Object.defineProperty(Interpreter2.prototype, "initialState", {
      get: function() {
        var _this = this;
        if (this._initialState) {
          return this._initialState;
        }
        return provide(this, function() {
          _this._initialState = _this.machine.initialState;
          return _this._initialState;
        });
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(Interpreter2.prototype, "state", {
      get: function() {
        if (!IS_PRODUCTION) {
          warn(this.status !== InterpreterStatus.NotStarted, "Attempted to read state from uninitialized service '".concat(this.id, "'. Make sure the service is started first."));
        }
        return this._state;
      },
      enumerable: false,
      configurable: true
    });
    Interpreter2.prototype.execute = function(state, actionsConfig) {
      var e_1, _a2;
      try {
        for (var _b = __values(state.actions), _c = _b.next(); !_c.done; _c = _b.next()) {
          var action = _c.value;
          this.exec(action, state, actionsConfig);
        }
      } catch (e_1_1) {
        e_1 = {
          error: e_1_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a2 = _b.return))
            _a2.call(_b);
        } finally {
          if (e_1)
            throw e_1.error;
        }
      }
    };
    Interpreter2.prototype.update = function(state, _event) {
      var e_2, _a2, e_3, _b, e_4, _c, e_5, _d;
      var _this = this;
      state._sessionid = this.sessionId;
      this._state = state;
      if (this.options.execute) {
        this.execute(this.state);
      }
      this.children.forEach(function(child) {
        _this.state.children[child.id] = child;
      });
      if (this.devTools) {
        this.devTools.send(_event.data, state);
      }
      if (state.event) {
        try {
          for (var _e = __values(this.eventListeners), _f = _e.next(); !_f.done; _f = _e.next()) {
            var listener = _f.value;
            listener(state.event);
          }
        } catch (e_2_1) {
          e_2 = {
            error: e_2_1
          };
        } finally {
          try {
            if (_f && !_f.done && (_a2 = _e.return))
              _a2.call(_e);
          } finally {
            if (e_2)
              throw e_2.error;
          }
        }
      }
      try {
        for (var _g = __values(this.listeners), _h = _g.next(); !_h.done; _h = _g.next()) {
          var listener = _h.value;
          listener(state, state.event);
        }
      } catch (e_3_1) {
        e_3 = {
          error: e_3_1
        };
      } finally {
        try {
          if (_h && !_h.done && (_b = _g.return))
            _b.call(_g);
        } finally {
          if (e_3)
            throw e_3.error;
        }
      }
      try {
        for (var _j = __values(this.contextListeners), _k = _j.next(); !_k.done; _k = _j.next()) {
          var contextListener = _k.value;
          contextListener(this.state.context, this.state.history ? this.state.history.context : void 0);
        }
      } catch (e_4_1) {
        e_4 = {
          error: e_4_1
        };
      } finally {
        try {
          if (_k && !_k.done && (_c = _j.return))
            _c.call(_j);
        } finally {
          if (e_4)
            throw e_4.error;
        }
      }
      var isDone = isInFinalState(state.configuration || [], this.machine);
      if (this.state.configuration && isDone) {
        var finalChildStateNode = state.configuration.find(function(sn) {
          return sn.type === "final" && sn.parent === _this.machine;
        });
        var doneData = finalChildStateNode && finalChildStateNode.doneData ? mapContext(finalChildStateNode.doneData, state.context, _event) : void 0;
        try {
          for (var _l = __values(this.doneListeners), _m = _l.next(); !_m.done; _m = _l.next()) {
            var listener = _m.value;
            listener(doneInvoke(this.id, doneData));
          }
        } catch (e_5_1) {
          e_5 = {
            error: e_5_1
          };
        } finally {
          try {
            if (_m && !_m.done && (_d = _l.return))
              _d.call(_l);
          } finally {
            if (e_5)
              throw e_5.error;
          }
        }
        this.stop();
      }
    };
    Interpreter2.prototype.onTransition = function(listener) {
      this.listeners.add(listener);
      if (this.status === InterpreterStatus.Running) {
        listener(this.state, this.state.event);
      }
      return this;
    };
    Interpreter2.prototype.subscribe = function(nextListenerOrObserver, _, completeListener) {
      var _this = this;
      if (!nextListenerOrObserver) {
        return {
          unsubscribe: function() {
            return void 0;
          }
        };
      }
      var listener;
      var resolvedCompleteListener = completeListener;
      if (typeof nextListenerOrObserver === "function") {
        listener = nextListenerOrObserver;
      } else {
        listener = nextListenerOrObserver.next.bind(nextListenerOrObserver);
        resolvedCompleteListener = nextListenerOrObserver.complete.bind(nextListenerOrObserver);
      }
      this.listeners.add(listener);
      if (this.status === InterpreterStatus.Running) {
        listener(this.state);
      }
      if (resolvedCompleteListener) {
        this.onDone(resolvedCompleteListener);
      }
      return {
        unsubscribe: function() {
          listener && _this.listeners.delete(listener);
          resolvedCompleteListener && _this.doneListeners.delete(resolvedCompleteListener);
        }
      };
    };
    Interpreter2.prototype.onEvent = function(listener) {
      this.eventListeners.add(listener);
      return this;
    };
    Interpreter2.prototype.onSend = function(listener) {
      this.sendListeners.add(listener);
      return this;
    };
    Interpreter2.prototype.onChange = function(listener) {
      this.contextListeners.add(listener);
      return this;
    };
    Interpreter2.prototype.onStop = function(listener) {
      this.stopListeners.add(listener);
      return this;
    };
    Interpreter2.prototype.onDone = function(listener) {
      this.doneListeners.add(listener);
      return this;
    };
    Interpreter2.prototype.off = function(listener) {
      this.listeners.delete(listener);
      this.eventListeners.delete(listener);
      this.sendListeners.delete(listener);
      this.stopListeners.delete(listener);
      this.doneListeners.delete(listener);
      this.contextListeners.delete(listener);
      return this;
    };
    Interpreter2.prototype.start = function(initialState) {
      var _this = this;
      if (this.status === InterpreterStatus.Running) {
        return this;
      }
      this.machine._init();
      registry.register(this.sessionId, this);
      this.initialized = true;
      this.status = InterpreterStatus.Running;
      var resolvedState = initialState === void 0 ? this.initialState : provide(this, function() {
        return isStateConfig(initialState) ? _this.machine.resolveState(initialState) : _this.machine.resolveState(State.from(initialState, _this.machine.context));
      });
      if (this.options.devTools) {
        this.attachDev();
      }
      this.scheduler.initialize(function() {
        _this.update(resolvedState, initEvent);
      });
      return this;
    };
    Interpreter2.prototype.stop = function() {
      var e_6, _a2, e_7, _b, e_8, _c, e_9, _d, e_10, _e;
      var _this = this;
      try {
        for (var _f = __values(this.listeners), _g = _f.next(); !_g.done; _g = _f.next()) {
          var listener = _g.value;
          this.listeners.delete(listener);
        }
      } catch (e_6_1) {
        e_6 = {
          error: e_6_1
        };
      } finally {
        try {
          if (_g && !_g.done && (_a2 = _f.return))
            _a2.call(_f);
        } finally {
          if (e_6)
            throw e_6.error;
        }
      }
      try {
        for (var _h = __values(this.stopListeners), _j = _h.next(); !_j.done; _j = _h.next()) {
          var listener = _j.value;
          listener();
          this.stopListeners.delete(listener);
        }
      } catch (e_7_1) {
        e_7 = {
          error: e_7_1
        };
      } finally {
        try {
          if (_j && !_j.done && (_b = _h.return))
            _b.call(_h);
        } finally {
          if (e_7)
            throw e_7.error;
        }
      }
      try {
        for (var _k = __values(this.contextListeners), _l = _k.next(); !_l.done; _l = _k.next()) {
          var listener = _l.value;
          this.contextListeners.delete(listener);
        }
      } catch (e_8_1) {
        e_8 = {
          error: e_8_1
        };
      } finally {
        try {
          if (_l && !_l.done && (_c = _k.return))
            _c.call(_k);
        } finally {
          if (e_8)
            throw e_8.error;
        }
      }
      try {
        for (var _m = __values(this.doneListeners), _o = _m.next(); !_o.done; _o = _m.next()) {
          var listener = _o.value;
          this.doneListeners.delete(listener);
        }
      } catch (e_9_1) {
        e_9 = {
          error: e_9_1
        };
      } finally {
        try {
          if (_o && !_o.done && (_d = _m.return))
            _d.call(_m);
        } finally {
          if (e_9)
            throw e_9.error;
        }
      }
      if (!this.initialized) {
        return this;
      }
      __spreadArray([], __read(this.state.configuration), false).sort(function(a, b) {
        return b.order - a.order;
      }).forEach(function(stateNode) {
        var e_11, _a3;
        try {
          for (var _b2 = __values(stateNode.definition.exit), _c2 = _b2.next(); !_c2.done; _c2 = _b2.next()) {
            var action = _c2.value;
            _this.exec(action, _this.state);
          }
        } catch (e_11_1) {
          e_11 = {
            error: e_11_1
          };
        } finally {
          try {
            if (_c2 && !_c2.done && (_a3 = _b2.return))
              _a3.call(_b2);
          } finally {
            if (e_11)
              throw e_11.error;
          }
        }
      });
      this.children.forEach(function(child) {
        if (isFunction(child.stop)) {
          child.stop();
        }
      });
      try {
        for (var _p = __values(Object.keys(this.delayedEventsMap)), _q = _p.next(); !_q.done; _q = _p.next()) {
          var key = _q.value;
          this.clock.clearTimeout(this.delayedEventsMap[key]);
        }
      } catch (e_10_1) {
        e_10 = {
          error: e_10_1
        };
      } finally {
        try {
          if (_q && !_q.done && (_e = _p.return))
            _e.call(_p);
        } finally {
          if (e_10)
            throw e_10.error;
        }
      }
      this.scheduler.clear();
      this.initialized = false;
      this.status = InterpreterStatus.Stopped;
      registry.free(this.sessionId);
      return this;
    };
    Interpreter2.prototype.batch = function(events) {
      var _this = this;
      if (this.status === InterpreterStatus.NotStarted && this.options.deferEvents) {
        if (!IS_PRODUCTION) {
          warn(false, "".concat(events.length, ' event(s) were sent to uninitialized service "').concat(this.machine.id, '" and are deferred. Make sure .start() is called for this service.\nEvent: ').concat(JSON.stringify(event)));
        }
      } else if (this.status !== InterpreterStatus.Running) {
        throw new Error(
          "".concat(events.length, ' event(s) were sent to uninitialized service "').concat(this.machine.id, '". Make sure .start() is called for this service, or set { deferEvents: true } in the service options.')
        );
      }
      this.scheduler.schedule(function() {
        var e_12, _a2;
        var nextState = _this.state;
        var batchChanged = false;
        var batchedActions = [];
        var _loop_1 = function(event_12) {
          var _event = toSCXMLEvent(event_12);
          _this.forward(_event);
          nextState = provide(_this, function() {
            return _this.machine.transition(nextState, _event);
          });
          batchedActions.push.apply(batchedActions, __spreadArray([], __read(nextState.actions.map(function(a) {
            return bindActionToState(a, nextState);
          })), false));
          batchChanged = batchChanged || !!nextState.changed;
        };
        try {
          for (var events_1 = __values(events), events_1_1 = events_1.next(); !events_1_1.done; events_1_1 = events_1.next()) {
            var event_1 = events_1_1.value;
            _loop_1(event_1);
          }
        } catch (e_12_1) {
          e_12 = {
            error: e_12_1
          };
        } finally {
          try {
            if (events_1_1 && !events_1_1.done && (_a2 = events_1.return))
              _a2.call(events_1);
          } finally {
            if (e_12)
              throw e_12.error;
          }
        }
        nextState.changed = batchChanged;
        nextState.actions = batchedActions;
        _this.update(nextState, toSCXMLEvent(events[events.length - 1]));
      });
    };
    Interpreter2.prototype.sender = function(event2) {
      return this.send.bind(this, event2);
    };
    Interpreter2.prototype.nextState = function(event2) {
      var _this = this;
      var _event = toSCXMLEvent(event2);
      if (_event.name.indexOf(errorPlatform) === 0 && !this.state.nextEvents.some(function(nextEvent) {
        return nextEvent.indexOf(errorPlatform) === 0;
      })) {
        throw _event.data.data;
      }
      var nextState = provide(this, function() {
        return _this.machine.transition(_this.state, _event);
      });
      return nextState;
    };
    Interpreter2.prototype.forward = function(event2) {
      var e_13, _a2;
      try {
        for (var _b = __values(this.forwardTo), _c = _b.next(); !_c.done; _c = _b.next()) {
          var id = _c.value;
          var child = this.children.get(id);
          if (!child) {
            throw new Error("Unable to forward event '".concat(event2, "' from interpreter '").concat(this.id, "' to nonexistant child '").concat(id, "'."));
          }
          child.send(event2);
        }
      } catch (e_13_1) {
        e_13 = {
          error: e_13_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a2 = _b.return))
            _a2.call(_b);
        } finally {
          if (e_13)
            throw e_13.error;
        }
      }
    };
    Interpreter2.prototype.defer = function(sendAction) {
      var _this = this;
      this.delayedEventsMap[sendAction.id] = this.clock.setTimeout(function() {
        if (sendAction.to) {
          _this.sendTo(sendAction._event, sendAction.to);
        } else {
          _this.send(sendAction._event);
        }
      }, sendAction.delay);
    };
    Interpreter2.prototype.cancel = function(sendId) {
      this.clock.clearTimeout(this.delayedEventsMap[sendId]);
      delete this.delayedEventsMap[sendId];
    };
    Interpreter2.prototype.exec = function(action, state, actionFunctionMap) {
      if (actionFunctionMap === void 0) {
        actionFunctionMap = this.machine.options.actions;
      }
      var context = state.context, _event = state._event;
      var actionOrExec = action.exec || getActionFunction(action.type, actionFunctionMap);
      var exec = isFunction(actionOrExec) ? actionOrExec : actionOrExec ? actionOrExec.exec : action.exec;
      if (exec) {
        try {
          return exec(context, _event.data, {
            action,
            state: this.state,
            _event
          });
        } catch (err) {
          if (this.parent) {
            this.parent.send({
              type: "xstate.error",
              data: err
            });
          }
          throw err;
        }
      }
      switch (action.type) {
        case send:
          var sendAction = action;
          if (typeof sendAction.delay === "number") {
            this.defer(sendAction);
            return;
          } else {
            if (sendAction.to) {
              this.sendTo(sendAction._event, sendAction.to);
            } else {
              this.send(sendAction._event);
            }
          }
          break;
        case cancel:
          this.cancel(action.sendId);
          break;
        case start: {
          if (this.status !== InterpreterStatus.Running) {
            return;
          }
          var activity = action.activity;
          if (!this.state.activities[activity.id || activity.type]) {
            break;
          }
          if (activity.type === ActionTypes.Invoke) {
            var invokeSource = toInvokeSource(activity.src);
            var serviceCreator = this.machine.options.services ? this.machine.options.services[invokeSource.type] : void 0;
            var id = activity.id, data = activity.data;
            if (!IS_PRODUCTION) {
              warn(
                !("forward" in activity),
                "`forward` property is deprecated (found in invocation of '".concat(activity.src, "' in in machine '").concat(this.machine.id, "'). ") + "Please use `autoForward` instead."
              );
            }
            var autoForward = "autoForward" in activity ? activity.autoForward : !!activity.forward;
            if (!serviceCreator) {
              if (!IS_PRODUCTION) {
                warn(false, "No service found for invocation '".concat(activity.src, "' in machine '").concat(this.machine.id, "'."));
              }
              return;
            }
            var resolvedData = data ? mapContext(data, context, _event) : void 0;
            if (typeof serviceCreator === "string") {
              return;
            }
            var source = isFunction(serviceCreator) ? serviceCreator(context, _event.data, {
              data: resolvedData,
              src: invokeSource,
              meta: activity.meta
            }) : serviceCreator;
            if (!source) {
              return;
            }
            var options = void 0;
            if (isMachine(source)) {
              source = resolvedData ? source.withContext(resolvedData) : source;
              options = {
                autoForward
              };
            }
            this.spawn(source, id, options);
          } else {
            this.spawnActivity(activity);
          }
          break;
        }
        case stop: {
          this.stopChild(action.activity.id);
          break;
        }
        case log2:
          var label = action.label, value = action.value;
          if (label) {
            this.logger(label, value);
          } else {
            this.logger(value);
          }
          break;
        default:
          if (!IS_PRODUCTION) {
            warn(false, "No implementation found for action type '".concat(action.type, "'"));
          }
          break;
      }
      return void 0;
    };
    Interpreter2.prototype.removeChild = function(childId) {
      var _a2;
      this.children.delete(childId);
      this.forwardTo.delete(childId);
      (_a2 = this.state) === null || _a2 === void 0 ? true : delete _a2.children[childId];
    };
    Interpreter2.prototype.stopChild = function(childId) {
      var child = this.children.get(childId);
      if (!child) {
        return;
      }
      this.removeChild(childId);
      if (isFunction(child.stop)) {
        child.stop();
      }
    };
    Interpreter2.prototype.spawn = function(entity, name, options) {
      if (isPromiseLike(entity)) {
        return this.spawnPromise(Promise.resolve(entity), name);
      } else if (isFunction(entity)) {
        return this.spawnCallback(entity, name);
      } else if (isSpawnedActor(entity)) {
        return this.spawnActor(entity, name);
      } else if (isObservable(entity)) {
        return this.spawnObservable(entity, name);
      } else if (isMachine(entity)) {
        return this.spawnMachine(entity, __assign(__assign({}, options), {
          id: name
        }));
      } else if (isBehavior(entity)) {
        return this.spawnBehavior(entity, name);
      } else {
        throw new Error('Unable to spawn entity "'.concat(name, '" of type "').concat(typeof entity, '".'));
      }
    };
    Interpreter2.prototype.spawnMachine = function(machine, options) {
      var _this = this;
      if (options === void 0) {
        options = {};
      }
      var childService = new Interpreter2(machine, __assign(__assign({}, this.options), {
        parent: this,
        id: options.id || machine.id
      }));
      var resolvedOptions = __assign(__assign({}, DEFAULT_SPAWN_OPTIONS), options);
      if (resolvedOptions.sync) {
        childService.onTransition(function(state) {
          _this.send(update, {
            state,
            id: childService.id
          });
        });
      }
      var actor = childService;
      this.children.set(childService.id, actor);
      if (resolvedOptions.autoForward) {
        this.forwardTo.add(childService.id);
      }
      childService.onDone(function(doneEvent) {
        _this.removeChild(childService.id);
        _this.send(toSCXMLEvent(doneEvent, {
          origin: childService.id
        }));
      }).start();
      return actor;
    };
    Interpreter2.prototype.spawnBehavior = function(behavior, id) {
      var actorRef = spawnBehavior(behavior, {
        id,
        parent: this
      });
      this.children.set(id, actorRef);
      return actorRef;
    };
    Interpreter2.prototype.spawnPromise = function(promise, id) {
      var _a2;
      var _this = this;
      var canceled = false;
      var resolvedData;
      promise.then(function(response) {
        if (!canceled) {
          resolvedData = response;
          _this.removeChild(id);
          _this.send(toSCXMLEvent(doneInvoke(id, response), {
            origin: id
          }));
        }
      }, function(errorData) {
        if (!canceled) {
          _this.removeChild(id);
          var errorEvent = error2(id, errorData);
          try {
            _this.send(toSCXMLEvent(errorEvent, {
              origin: id
            }));
          } catch (error3) {
            reportUnhandledExceptionOnInvocation(errorData, error3, id);
            if (_this.devTools) {
              _this.devTools.send(errorEvent, _this.state);
            }
            if (_this.machine.strict) {
              _this.stop();
            }
          }
        }
      });
      var actor = (_a2 = {
        id,
        send: function() {
          return void 0;
        },
        subscribe: function(next, handleError, complete) {
          var observer = toObserver(next, handleError, complete);
          var unsubscribed = false;
          promise.then(function(response) {
            if (unsubscribed) {
              return;
            }
            observer.next(response);
            if (unsubscribed) {
              return;
            }
            observer.complete();
          }, function(err) {
            if (unsubscribed) {
              return;
            }
            observer.error(err);
          });
          return {
            unsubscribe: function() {
              return unsubscribed = true;
            }
          };
        },
        stop: function() {
          canceled = true;
        },
        toJSON: function() {
          return {
            id
          };
        },
        getSnapshot: function() {
          return resolvedData;
        }
      }, _a2[symbolObservable] = function() {
        return this;
      }, _a2);
      this.children.set(id, actor);
      return actor;
    };
    Interpreter2.prototype.spawnCallback = function(callback, id) {
      var _a2;
      var _this = this;
      var canceled = false;
      var receivers = /* @__PURE__ */ new Set();
      var listeners2 = /* @__PURE__ */ new Set();
      var emitted;
      var receive = function(e) {
        emitted = e;
        listeners2.forEach(function(listener) {
          return listener(e);
        });
        if (canceled) {
          return;
        }
        _this.send(toSCXMLEvent(e, {
          origin: id
        }));
      };
      var callbackStop;
      try {
        callbackStop = callback(receive, function(newListener) {
          receivers.add(newListener);
        });
      } catch (err) {
        this.send(error2(id, err));
      }
      if (isPromiseLike(callbackStop)) {
        return this.spawnPromise(callbackStop, id);
      }
      var actor = (_a2 = {
        id,
        send: function(event2) {
          return receivers.forEach(function(receiver) {
            return receiver(event2);
          });
        },
        subscribe: function(next) {
          var observer = toObserver(next);
          listeners2.add(observer.next);
          return {
            unsubscribe: function() {
              listeners2.delete(observer.next);
            }
          };
        },
        stop: function() {
          canceled = true;
          if (isFunction(callbackStop)) {
            callbackStop();
          }
        },
        toJSON: function() {
          return {
            id
          };
        },
        getSnapshot: function() {
          return emitted;
        }
      }, _a2[symbolObservable] = function() {
        return this;
      }, _a2);
      this.children.set(id, actor);
      return actor;
    };
    Interpreter2.prototype.spawnObservable = function(source, id) {
      var _a2;
      var _this = this;
      var emitted;
      var subscription = source.subscribe(function(value) {
        emitted = value;
        _this.send(toSCXMLEvent(value, {
          origin: id
        }));
      }, function(err) {
        _this.removeChild(id);
        _this.send(toSCXMLEvent(error2(id, err), {
          origin: id
        }));
      }, function() {
        _this.removeChild(id);
        _this.send(toSCXMLEvent(doneInvoke(id), {
          origin: id
        }));
      });
      var actor = (_a2 = {
        id,
        send: function() {
          return void 0;
        },
        subscribe: function(next, handleError, complete) {
          return source.subscribe(next, handleError, complete);
        },
        stop: function() {
          return subscription.unsubscribe();
        },
        getSnapshot: function() {
          return emitted;
        },
        toJSON: function() {
          return {
            id
          };
        }
      }, _a2[symbolObservable] = function() {
        return this;
      }, _a2);
      this.children.set(id, actor);
      return actor;
    };
    Interpreter2.prototype.spawnActor = function(actor, name) {
      this.children.set(name, actor);
      return actor;
    };
    Interpreter2.prototype.spawnActivity = function(activity) {
      var implementation = this.machine.options && this.machine.options.activities ? this.machine.options.activities[activity.type] : void 0;
      if (!implementation) {
        if (!IS_PRODUCTION) {
          warn(false, "No implementation found for activity '".concat(activity.type, "'"));
        }
        return;
      }
      var dispose = implementation(this.state.context, activity);
      this.spawnEffect(activity.id, dispose);
    };
    Interpreter2.prototype.spawnEffect = function(id, dispose) {
      var _a2;
      this.children.set(id, (_a2 = {
        id,
        send: function() {
          return void 0;
        },
        subscribe: function() {
          return {
            unsubscribe: function() {
              return void 0;
            }
          };
        },
        stop: dispose || void 0,
        getSnapshot: function() {
          return void 0;
        },
        toJSON: function() {
          return {
            id
          };
        }
      }, _a2[symbolObservable] = function() {
        return this;
      }, _a2));
    };
    Interpreter2.prototype.attachDev = function() {
      var global2 = getGlobal();
      if (this.options.devTools && global2) {
        if (global2.__REDUX_DEVTOOLS_EXTENSION__) {
          var devToolsOptions = typeof this.options.devTools === "object" ? this.options.devTools : void 0;
          this.devTools = global2.__REDUX_DEVTOOLS_EXTENSION__.connect(__assign(__assign({
            name: this.id,
            autoPause: true,
            stateSanitizer: function(state) {
              return {
                value: state.value,
                context: state.context,
                actions: state.actions
              };
            }
          }, devToolsOptions), {
            features: __assign({
              jump: false,
              skip: false
            }, devToolsOptions ? devToolsOptions.features : void 0)
          }), this.machine);
          this.devTools.init(this.state);
        }
        registerService(this);
      }
    };
    Interpreter2.prototype.toJSON = function() {
      return {
        id: this.id
      };
    };
    Interpreter2.prototype[symbolObservable] = function() {
      return this;
    };
    Interpreter2.prototype.getSnapshot = function() {
      if (this.status === InterpreterStatus.NotStarted) {
        return this.initialState;
      }
      return this._state;
    };
    Interpreter2.defaultOptions = {
      execute: true,
      deferEvents: true,
      clock: {
        setTimeout: function(fn, ms) {
          return setTimeout(fn, ms);
        },
        clearTimeout: function(id) {
          return clearTimeout(id);
        }
      },
      logger: /* @__PURE__ */ console.log.bind(console),
      devTools: false
    };
    Interpreter2.interpret = interpret;
    return Interpreter2;
  }();
  var resolveSpawnOptions = function(nameOrOptions) {
    if (isString(nameOrOptions)) {
      return __assign(__assign({}, DEFAULT_SPAWN_OPTIONS), {
        name: nameOrOptions
      });
    }
    return __assign(__assign(__assign({}, DEFAULT_SPAWN_OPTIONS), {
      name: uniqueId()
    }), nameOrOptions);
  };
  function spawn(entity, nameOrOptions) {
    var resolvedOptions = resolveSpawnOptions(nameOrOptions);
    return consume(function(service) {
      if (!IS_PRODUCTION) {
        var isLazyEntity = isMachine(entity) || isFunction(entity);
        warn(!!service || isLazyEntity, 'Attempted to spawn an Actor (ID: "'.concat(isMachine(entity) ? entity.id : "undefined", '") outside of a service. This will have no effect.'));
      }
      if (service) {
        return service.spawn(entity, resolvedOptions.name, resolvedOptions);
      } else {
        return createDeferredActor(entity, resolvedOptions.name);
      }
    });
  }
  function interpret(machine, options) {
    var interpreter = new Interpreter(machine, options);
    return interpreter;
  }

  // node_modules/xstate/es/invokeUtils.js
  function toInvokeSource2(src) {
    if (typeof src === "string") {
      var simpleSrc = {
        type: src
      };
      simpleSrc.toString = function() {
        return src;
      };
      return simpleSrc;
    }
    return src;
  }
  function toInvokeDefinition(invokeConfig) {
    return __assign(__assign({
      type: invoke
    }, invokeConfig), {
      toJSON: function() {
        invokeConfig.onDone;
        invokeConfig.onError;
        var invokeDef = __rest(invokeConfig, ["onDone", "onError"]);
        return __assign(__assign({}, invokeDef), {
          type: invoke,
          src: toInvokeSource2(invokeConfig.src)
        });
      }
    });
  }

  // node_modules/xstate/es/StateNode.js
  var NULL_EVENT = "";
  var STATE_IDENTIFIER = "#";
  var WILDCARD = "*";
  var EMPTY_OBJECT = {};
  var isStateId = function(str) {
    return str[0] === STATE_IDENTIFIER;
  };
  var createDefaultOptions = function() {
    return {
      actions: {},
      guards: {},
      services: {},
      activities: {},
      delays: {}
    };
  };
  var validateArrayifiedTransitions = function(stateNode, event2, transitions) {
    var hasNonLastUnguardedTarget = transitions.slice(0, -1).some(function(transition) {
      return !("cond" in transition) && !("in" in transition) && (isString(transition.target) || isMachine(transition.target));
    });
    var eventText = event2 === NULL_EVENT ? "the transient event" : "event '".concat(event2, "'");
    warn(!hasNonLastUnguardedTarget, "One or more transitions for ".concat(eventText, " on state '").concat(stateNode.id, "' are unreachable. ") + "Make sure that the default transition is the last one defined.");
  };
  var StateNode = /* @__PURE__ */ function() {
    function StateNode2(config, options, _context, _stateInfo) {
      var _this = this;
      if (_context === void 0) {
        _context = "context" in config ? config.context : void 0;
      }
      var _a2;
      this.config = config;
      this._context = _context;
      this.order = -1;
      this.__xstatenode = true;
      this.__cache = {
        events: void 0,
        relativeValue: /* @__PURE__ */ new Map(),
        initialStateValue: void 0,
        initialState: void 0,
        on: void 0,
        transitions: void 0,
        candidates: {},
        delayedTransitions: void 0
      };
      this.idMap = {};
      this.tags = [];
      this.options = Object.assign(createDefaultOptions(), options);
      this.parent = _stateInfo === null || _stateInfo === void 0 ? void 0 : _stateInfo.parent;
      this.key = this.config.key || (_stateInfo === null || _stateInfo === void 0 ? void 0 : _stateInfo.key) || this.config.id || "(machine)";
      this.machine = this.parent ? this.parent.machine : this;
      this.path = this.parent ? this.parent.path.concat(this.key) : [];
      this.delimiter = this.config.delimiter || (this.parent ? this.parent.delimiter : STATE_DELIMITER);
      this.id = this.config.id || __spreadArray([this.machine.key], __read(this.path), false).join(this.delimiter);
      this.version = this.parent ? this.parent.version : this.config.version;
      this.type = this.config.type || (this.config.parallel ? "parallel" : this.config.states && Object.keys(this.config.states).length ? "compound" : this.config.history ? "history" : "atomic");
      this.schema = this.parent ? this.machine.schema : (_a2 = this.config.schema) !== null && _a2 !== void 0 ? _a2 : {};
      this.description = this.config.description;
      if (!IS_PRODUCTION) {
        warn(!("parallel" in this.config), 'The "parallel" property is deprecated and will be removed in version 4.1. '.concat(this.config.parallel ? "Replace with `type: 'parallel'`" : "Use `type: '".concat(this.type, "'`"), " in the config for state node '").concat(this.id, "' instead."));
      }
      this.initial = this.config.initial;
      this.states = this.config.states ? mapValues(this.config.states, function(stateConfig, key) {
        var _a3;
        var stateNode = new StateNode2(stateConfig, {}, void 0, {
          parent: _this,
          key
        });
        Object.assign(_this.idMap, __assign((_a3 = {}, _a3[stateNode.id] = stateNode, _a3), stateNode.idMap));
        return stateNode;
      }) : EMPTY_OBJECT;
      var order = 0;
      function dfs(stateNode) {
        var e_1, _a3;
        stateNode.order = order++;
        try {
          for (var _b = __values(getChildren(stateNode)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var child = _c.value;
            dfs(child);
          }
        } catch (e_1_1) {
          e_1 = {
            error: e_1_1
          };
        } finally {
          try {
            if (_c && !_c.done && (_a3 = _b.return))
              _a3.call(_b);
          } finally {
            if (e_1)
              throw e_1.error;
          }
        }
      }
      dfs(this);
      this.history = this.config.history === true ? "shallow" : this.config.history || false;
      this._transient = !!this.config.always || (!this.config.on ? false : Array.isArray(this.config.on) ? this.config.on.some(function(_a3) {
        var event2 = _a3.event;
        return event2 === NULL_EVENT;
      }) : NULL_EVENT in this.config.on);
      this.strict = !!this.config.strict;
      this.onEntry = toArray(this.config.entry || this.config.onEntry).map(function(action) {
        return toActionObject(action);
      });
      this.onExit = toArray(this.config.exit || this.config.onExit).map(function(action) {
        return toActionObject(action);
      });
      this.meta = this.config.meta;
      this.doneData = this.type === "final" ? this.config.data : void 0;
      this.invoke = toArray(this.config.invoke).map(function(invokeConfig, i) {
        var _a3, _b;
        if (isMachine(invokeConfig)) {
          var invokeId = createInvokeId(_this.id, i);
          _this.machine.options.services = __assign((_a3 = {}, _a3[invokeId] = invokeConfig, _a3), _this.machine.options.services);
          return toInvokeDefinition({
            src: invokeId,
            id: invokeId
          });
        } else if (isString(invokeConfig.src)) {
          var invokeId = invokeConfig.id || createInvokeId(_this.id, i);
          return toInvokeDefinition(__assign(__assign({}, invokeConfig), {
            id: invokeId,
            src: invokeConfig.src
          }));
        } else if (isMachine(invokeConfig.src) || isFunction(invokeConfig.src)) {
          var invokeId = invokeConfig.id || createInvokeId(_this.id, i);
          _this.machine.options.services = __assign((_b = {}, _b[invokeId] = invokeConfig.src, _b), _this.machine.options.services);
          return toInvokeDefinition(__assign(__assign({
            id: invokeId
          }, invokeConfig), {
            src: invokeId
          }));
        } else {
          var invokeSource = invokeConfig.src;
          return toInvokeDefinition(__assign(__assign({
            id: createInvokeId(_this.id, i)
          }, invokeConfig), {
            src: invokeSource
          }));
        }
      });
      this.activities = toArray(this.config.activities).concat(this.invoke).map(function(activity) {
        return toActivityDefinition(activity);
      });
      this.transition = this.transition.bind(this);
      this.tags = toArray(this.config.tags);
    }
    StateNode2.prototype._init = function() {
      if (this.__cache.transitions) {
        return;
      }
      getAllStateNodes(this).forEach(function(stateNode) {
        return stateNode.on;
      });
    };
    StateNode2.prototype.withConfig = function(options, context) {
      var _a2 = this.options, actions2 = _a2.actions, activities = _a2.activities, guards = _a2.guards, services = _a2.services, delays = _a2.delays;
      return new StateNode2(this.config, {
        actions: __assign(__assign({}, actions2), options.actions),
        activities: __assign(__assign({}, activities), options.activities),
        guards: __assign(__assign({}, guards), options.guards),
        services: __assign(__assign({}, services), options.services),
        delays: __assign(__assign({}, delays), options.delays)
      }, context !== null && context !== void 0 ? context : this.context);
    };
    StateNode2.prototype.withContext = function(context) {
      return new StateNode2(this.config, this.options, context);
    };
    Object.defineProperty(StateNode2.prototype, "context", {
      get: function() {
        return isFunction(this._context) ? this._context() : this._context;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateNode2.prototype, "definition", {
      get: function() {
        return {
          id: this.id,
          key: this.key,
          version: this.version,
          context: this.context,
          type: this.type,
          initial: this.initial,
          history: this.history,
          states: mapValues(this.states, function(state) {
            return state.definition;
          }),
          on: this.on,
          transitions: this.transitions,
          entry: this.onEntry,
          exit: this.onExit,
          activities: this.activities || [],
          meta: this.meta,
          order: this.order || -1,
          data: this.doneData,
          invoke: this.invoke,
          description: this.description,
          tags: this.tags
        };
      },
      enumerable: false,
      configurable: true
    });
    StateNode2.prototype.toJSON = function() {
      return this.definition;
    };
    Object.defineProperty(StateNode2.prototype, "on", {
      get: function() {
        if (this.__cache.on) {
          return this.__cache.on;
        }
        var transitions = this.transitions;
        return this.__cache.on = transitions.reduce(function(map, transition) {
          map[transition.eventType] = map[transition.eventType] || [];
          map[transition.eventType].push(transition);
          return map;
        }, {});
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateNode2.prototype, "after", {
      get: function() {
        return this.__cache.delayedTransitions || (this.__cache.delayedTransitions = this.getDelayedTransitions(), this.__cache.delayedTransitions);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateNode2.prototype, "transitions", {
      get: function() {
        return this.__cache.transitions || (this.__cache.transitions = this.formatTransitions(), this.__cache.transitions);
      },
      enumerable: false,
      configurable: true
    });
    StateNode2.prototype.getCandidates = function(eventName) {
      if (this.__cache.candidates[eventName]) {
        return this.__cache.candidates[eventName];
      }
      var transient = eventName === NULL_EVENT;
      var candidates = this.transitions.filter(function(transition) {
        var sameEventType = transition.eventType === eventName;
        return transient ? sameEventType : sameEventType || transition.eventType === WILDCARD;
      });
      this.__cache.candidates[eventName] = candidates;
      return candidates;
    };
    StateNode2.prototype.getDelayedTransitions = function() {
      var _this = this;
      var afterConfig = this.config.after;
      if (!afterConfig) {
        return [];
      }
      var mutateEntryExit = function(delay, i) {
        var delayRef = isFunction(delay) ? "".concat(_this.id, ":delay[").concat(i, "]") : delay;
        var eventType = after2(delayRef, _this.id);
        _this.onEntry.push(send2(eventType, {
          delay
        }));
        _this.onExit.push(cancel2(eventType));
        return eventType;
      };
      var delayedTransitions = isArray(afterConfig) ? afterConfig.map(function(transition, i) {
        var eventType = mutateEntryExit(transition.delay, i);
        return __assign(__assign({}, transition), {
          event: eventType
        });
      }) : flatten(Object.keys(afterConfig).map(function(delay, i) {
        var configTransition = afterConfig[delay];
        var resolvedTransition = isString(configTransition) ? {
          target: configTransition
        } : configTransition;
        var resolvedDelay = !isNaN(+delay) ? +delay : delay;
        var eventType = mutateEntryExit(resolvedDelay, i);
        return toArray(resolvedTransition).map(function(transition) {
          return __assign(__assign({}, transition), {
            event: eventType,
            delay: resolvedDelay
          });
        });
      }));
      return delayedTransitions.map(function(delayedTransition) {
        var delay = delayedTransition.delay;
        return __assign(__assign({}, _this.formatTransition(delayedTransition)), {
          delay
        });
      });
    };
    StateNode2.prototype.getStateNodes = function(state) {
      var _a2;
      var _this = this;
      if (!state) {
        return [];
      }
      var stateValue = state instanceof State ? state.value : toStateValue(state, this.delimiter);
      if (isString(stateValue)) {
        var initialStateValue = this.getStateNode(stateValue).initial;
        return initialStateValue !== void 0 ? this.getStateNodes((_a2 = {}, _a2[stateValue] = initialStateValue, _a2)) : [this, this.states[stateValue]];
      }
      var subStateKeys = Object.keys(stateValue);
      var subStateNodes = [this];
      subStateNodes.push.apply(subStateNodes, __spreadArray([], __read(flatten(subStateKeys.map(function(subStateKey) {
        return _this.getStateNode(subStateKey).getStateNodes(stateValue[subStateKey]);
      }))), false));
      return subStateNodes;
    };
    StateNode2.prototype.handles = function(event2) {
      var eventType = getEventType(event2);
      return this.events.includes(eventType);
    };
    StateNode2.prototype.resolveState = function(state) {
      var stateFromConfig = state instanceof State ? state : State.create(state);
      var configuration = Array.from(getConfiguration([], this.getStateNodes(stateFromConfig.value)));
      return new State(__assign(__assign({}, stateFromConfig), {
        value: this.resolve(stateFromConfig.value),
        configuration,
        done: isInFinalState(configuration, this),
        tags: getTagsFromConfiguration(configuration),
        machine: this.machine
      }));
    };
    StateNode2.prototype.transitionLeafNode = function(stateValue, state, _event) {
      var stateNode = this.getStateNode(stateValue);
      var next = stateNode.next(state, _event);
      if (!next || !next.transitions.length) {
        return this.next(state, _event);
      }
      return next;
    };
    StateNode2.prototype.transitionCompoundNode = function(stateValue, state, _event) {
      var subStateKeys = Object.keys(stateValue);
      var stateNode = this.getStateNode(subStateKeys[0]);
      var next = stateNode._transition(stateValue[subStateKeys[0]], state, _event);
      if (!next || !next.transitions.length) {
        return this.next(state, _event);
      }
      return next;
    };
    StateNode2.prototype.transitionParallelNode = function(stateValue, state, _event) {
      var e_2, _a2;
      var transitionMap = {};
      try {
        for (var _b = __values(Object.keys(stateValue)), _c = _b.next(); !_c.done; _c = _b.next()) {
          var subStateKey = _c.value;
          var subStateValue = stateValue[subStateKey];
          if (!subStateValue) {
            continue;
          }
          var subStateNode = this.getStateNode(subStateKey);
          var next = subStateNode._transition(subStateValue, state, _event);
          if (next) {
            transitionMap[subStateKey] = next;
          }
        }
      } catch (e_2_1) {
        e_2 = {
          error: e_2_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a2 = _b.return))
            _a2.call(_b);
        } finally {
          if (e_2)
            throw e_2.error;
        }
      }
      var stateTransitions = Object.keys(transitionMap).map(function(key) {
        return transitionMap[key];
      });
      var enabledTransitions = flatten(stateTransitions.map(function(st) {
        return st.transitions;
      }));
      var willTransition = stateTransitions.some(function(st) {
        return st.transitions.length > 0;
      });
      if (!willTransition) {
        return this.next(state, _event);
      }
      var entryNodes = flatten(stateTransitions.map(function(t) {
        return t.entrySet;
      }));
      var configuration = flatten(Object.keys(transitionMap).map(function(key) {
        return transitionMap[key].configuration;
      }));
      return {
        transitions: enabledTransitions,
        entrySet: entryNodes,
        exitSet: flatten(stateTransitions.map(function(t) {
          return t.exitSet;
        })),
        configuration,
        source: state,
        actions: flatten(Object.keys(transitionMap).map(function(key) {
          return transitionMap[key].actions;
        }))
      };
    };
    StateNode2.prototype._transition = function(stateValue, state, _event) {
      if (isString(stateValue)) {
        return this.transitionLeafNode(stateValue, state, _event);
      }
      if (Object.keys(stateValue).length === 1) {
        return this.transitionCompoundNode(stateValue, state, _event);
      }
      return this.transitionParallelNode(stateValue, state, _event);
    };
    StateNode2.prototype.getTransitionData = function(state, event2) {
      return this._transition(state.value, state, toSCXMLEvent(event2));
    };
    StateNode2.prototype.next = function(state, _event) {
      var e_3, _a2;
      var _this = this;
      var eventName = _event.name;
      var actions2 = [];
      var nextStateNodes = [];
      var selectedTransition;
      try {
        for (var _b = __values(this.getCandidates(eventName)), _c = _b.next(); !_c.done; _c = _b.next()) {
          var candidate = _c.value;
          var cond = candidate.cond, stateIn = candidate.in;
          var resolvedContext = state.context;
          var isInState = stateIn ? isString(stateIn) && isStateId(stateIn) ? state.matches(toStateValue(this.getStateNodeById(stateIn).path, this.delimiter)) : matchesState(toStateValue(stateIn, this.delimiter), path(this.path.slice(0, -2))(state.value)) : true;
          var guardPassed = false;
          try {
            guardPassed = !cond || evaluateGuard(this.machine, cond, resolvedContext, _event, state);
          } catch (err) {
            throw new Error("Unable to evaluate guard '".concat(cond.name || cond.type, "' in transition for event '").concat(eventName, "' in state node '").concat(this.id, "':\n").concat(err.message));
          }
          if (guardPassed && isInState) {
            if (candidate.target !== void 0) {
              nextStateNodes = candidate.target;
            }
            actions2.push.apply(actions2, __spreadArray([], __read(candidate.actions), false));
            selectedTransition = candidate;
            break;
          }
        }
      } catch (e_3_1) {
        e_3 = {
          error: e_3_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a2 = _b.return))
            _a2.call(_b);
        } finally {
          if (e_3)
            throw e_3.error;
        }
      }
      if (!selectedTransition) {
        return void 0;
      }
      if (!nextStateNodes.length) {
        return {
          transitions: [selectedTransition],
          entrySet: [],
          exitSet: [],
          configuration: state.value ? [this] : [],
          source: state,
          actions: actions2
        };
      }
      var allNextStateNodes = flatten(nextStateNodes.map(function(stateNode) {
        return _this.getRelativeStateNodes(stateNode, state.historyValue);
      }));
      var isInternal = !!selectedTransition.internal;
      var reentryNodes = isInternal ? [] : flatten(allNextStateNodes.map(function(n) {
        return _this.nodesFromChild(n);
      }));
      return {
        transitions: [selectedTransition],
        entrySet: reentryNodes,
        exitSet: isInternal ? [] : [this],
        configuration: allNextStateNodes,
        source: state,
        actions: actions2
      };
    };
    StateNode2.prototype.nodesFromChild = function(childStateNode) {
      if (childStateNode.escapes(this)) {
        return [];
      }
      var nodes = [];
      var marker = childStateNode;
      while (marker && marker !== this) {
        nodes.push(marker);
        marker = marker.parent;
      }
      nodes.push(this);
      return nodes;
    };
    StateNode2.prototype.escapes = function(stateNode) {
      if (this === stateNode) {
        return false;
      }
      var parent = this.parent;
      while (parent) {
        if (parent === stateNode) {
          return false;
        }
        parent = parent.parent;
      }
      return true;
    };
    StateNode2.prototype.getActions = function(transition, currentContext, _event, prevState) {
      var e_4, _a2, e_5, _b;
      var prevConfig = getConfiguration([], prevState ? this.getStateNodes(prevState.value) : [this]);
      var resolvedConfig = transition.configuration.length ? getConfiguration(prevConfig, transition.configuration) : prevConfig;
      try {
        for (var resolvedConfig_1 = __values(resolvedConfig), resolvedConfig_1_1 = resolvedConfig_1.next(); !resolvedConfig_1_1.done; resolvedConfig_1_1 = resolvedConfig_1.next()) {
          var sn = resolvedConfig_1_1.value;
          if (!has(prevConfig, sn)) {
            transition.entrySet.push(sn);
          }
        }
      } catch (e_4_1) {
        e_4 = {
          error: e_4_1
        };
      } finally {
        try {
          if (resolvedConfig_1_1 && !resolvedConfig_1_1.done && (_a2 = resolvedConfig_1.return))
            _a2.call(resolvedConfig_1);
        } finally {
          if (e_4)
            throw e_4.error;
        }
      }
      try {
        for (var prevConfig_1 = __values(prevConfig), prevConfig_1_1 = prevConfig_1.next(); !prevConfig_1_1.done; prevConfig_1_1 = prevConfig_1.next()) {
          var sn = prevConfig_1_1.value;
          if (!has(resolvedConfig, sn) || has(transition.exitSet, sn.parent)) {
            transition.exitSet.push(sn);
          }
        }
      } catch (e_5_1) {
        e_5 = {
          error: e_5_1
        };
      } finally {
        try {
          if (prevConfig_1_1 && !prevConfig_1_1.done && (_b = prevConfig_1.return))
            _b.call(prevConfig_1);
        } finally {
          if (e_5)
            throw e_5.error;
        }
      }
      var doneEvents = flatten(transition.entrySet.map(function(sn2) {
        var events = [];
        if (sn2.type !== "final") {
          return events;
        }
        var parent = sn2.parent;
        if (!parent.parent) {
          return events;
        }
        events.push(
          done(sn2.id, sn2.doneData),
          done(parent.id, sn2.doneData ? mapContext(sn2.doneData, currentContext, _event) : void 0)
        );
        var grandparent = parent.parent;
        if (grandparent.type === "parallel") {
          if (getChildren(grandparent).every(function(parentNode) {
            return isInFinalState(transition.configuration, parentNode);
          })) {
            events.push(done(grandparent.id));
          }
        }
        return events;
      }));
      transition.exitSet.sort(function(a, b) {
        return b.order - a.order;
      });
      transition.entrySet.sort(function(a, b) {
        return a.order - b.order;
      });
      var entryStates = new Set(transition.entrySet);
      var exitStates = new Set(transition.exitSet);
      var _c = __read([flatten(Array.from(entryStates).map(function(stateNode) {
        return __spreadArray(__spreadArray([], __read(stateNode.activities.map(function(activity) {
          return start2(activity);
        })), false), __read(stateNode.onEntry), false);
      })).concat(doneEvents.map(raise2)), flatten(Array.from(exitStates).map(function(stateNode) {
        return __spreadArray(__spreadArray([], __read(stateNode.onExit), false), __read(stateNode.activities.map(function(activity) {
          return stop2(activity);
        })), false);
      }))], 2), entryActions = _c[0], exitActions = _c[1];
      var actions2 = toActionObjects(exitActions.concat(transition.actions).concat(entryActions), this.machine.options.actions);
      return actions2;
    };
    StateNode2.prototype.transition = function(state, event2, context) {
      if (state === void 0) {
        state = this.initialState;
      }
      var _event = toSCXMLEvent(event2);
      var currentState;
      if (state instanceof State) {
        currentState = context === void 0 ? state : this.resolveState(State.from(state, context));
      } else {
        var resolvedStateValue = isString(state) ? this.resolve(pathToStateValue(this.getResolvedPath(state))) : this.resolve(state);
        var resolvedContext = context !== null && context !== void 0 ? context : this.machine.context;
        currentState = this.resolveState(State.from(resolvedStateValue, resolvedContext));
      }
      if (!IS_PRODUCTION && _event.name === WILDCARD) {
        throw new Error("An event cannot have the wildcard type ('".concat(WILDCARD, "')"));
      }
      if (this.strict) {
        if (!this.events.includes(_event.name) && !isBuiltInEvent(_event.name)) {
          throw new Error("Machine '".concat(this.id, "' does not accept event '").concat(_event.name, "'"));
        }
      }
      var stateTransition = this._transition(currentState.value, currentState, _event) || {
        transitions: [],
        configuration: [],
        entrySet: [],
        exitSet: [],
        source: currentState,
        actions: []
      };
      var prevConfig = getConfiguration([], this.getStateNodes(currentState.value));
      var resolvedConfig = stateTransition.configuration.length ? getConfiguration(prevConfig, stateTransition.configuration) : prevConfig;
      stateTransition.configuration = __spreadArray([], __read(resolvedConfig), false);
      return this.resolveTransition(stateTransition, currentState, currentState.context, _event);
    };
    StateNode2.prototype.resolveRaisedTransition = function(state, _event, originalEvent) {
      var _a2;
      var currentActions = state.actions;
      state = this.transition(state, _event);
      state._event = originalEvent;
      state.event = originalEvent.data;
      (_a2 = state.actions).unshift.apply(_a2, __spreadArray([], __read(currentActions), false));
      return state;
    };
    StateNode2.prototype.resolveTransition = function(stateTransition, currentState, context, _event) {
      var e_6, _a2;
      var _this = this;
      if (_event === void 0) {
        _event = initEvent;
      }
      var configuration = stateTransition.configuration;
      var willTransition = !currentState || stateTransition.transitions.length > 0;
      var resolvedStateValue = willTransition ? getValue(this.machine, configuration) : void 0;
      var historyValue = currentState ? currentState.historyValue ? currentState.historyValue : stateTransition.source ? this.machine.historyValue(currentState.value) : void 0 : void 0;
      var actions2 = this.getActions(stateTransition, context, _event, currentState);
      var activities = currentState ? __assign({}, currentState.activities) : {};
      try {
        for (var actions_1 = __values(actions2), actions_1_1 = actions_1.next(); !actions_1_1.done; actions_1_1 = actions_1.next()) {
          var action = actions_1_1.value;
          if (action.type === start) {
            activities[action.activity.id || action.activity.type] = action;
          } else if (action.type === stop) {
            activities[action.activity.id || action.activity.type] = false;
          }
        }
      } catch (e_6_1) {
        e_6 = {
          error: e_6_1
        };
      } finally {
        try {
          if (actions_1_1 && !actions_1_1.done && (_a2 = actions_1.return))
            _a2.call(actions_1);
        } finally {
          if (e_6)
            throw e_6.error;
        }
      }
      var _b = __read(resolveActions(this, currentState, context, _event, actions2, this.machine.config.preserveActionOrder), 2), resolvedActions = _b[0], updatedContext = _b[1];
      var _c = __read(partition(resolvedActions, function(action2) {
        return action2.type === raise || action2.type === send && action2.to === SpecialTargets.Internal;
      }), 2), raisedEvents = _c[0], nonRaisedActions = _c[1];
      var invokeActions = resolvedActions.filter(function(action2) {
        var _a3;
        return action2.type === start && ((_a3 = action2.activity) === null || _a3 === void 0 ? void 0 : _a3.type) === invoke;
      });
      var children2 = invokeActions.reduce(function(acc, action2) {
        acc[action2.activity.id] = createInvocableActor(action2.activity, _this.machine, updatedContext, _event);
        return acc;
      }, currentState ? __assign({}, currentState.children) : {});
      var resolvedConfiguration = willTransition ? stateTransition.configuration : currentState ? currentState.configuration : [];
      var isDone = isInFinalState(resolvedConfiguration, this);
      var nextState = new State({
        value: resolvedStateValue || currentState.value,
        context: updatedContext,
        _event,
        _sessionid: currentState ? currentState._sessionid : null,
        historyValue: resolvedStateValue ? historyValue ? updateHistoryValue(historyValue, resolvedStateValue) : void 0 : currentState ? currentState.historyValue : void 0,
        history: !resolvedStateValue || stateTransition.source ? currentState : void 0,
        actions: resolvedStateValue ? nonRaisedActions : [],
        activities: resolvedStateValue ? activities : currentState ? currentState.activities : {},
        events: [],
        configuration: resolvedConfiguration,
        transitions: stateTransition.transitions,
        children: children2,
        done: isDone,
        tags: currentState === null || currentState === void 0 ? void 0 : currentState.tags,
        machine: this
      });
      var didUpdateContext = context !== updatedContext;
      nextState.changed = _event.name === update || didUpdateContext;
      var history = nextState.history;
      if (history) {
        delete history.history;
      }
      var isTransient = !isDone && (this._transient || configuration.some(function(stateNode) {
        return stateNode._transient;
      }));
      if (!willTransition && (!isTransient || _event.name === NULL_EVENT)) {
        return nextState;
      }
      var maybeNextState = nextState;
      if (!isDone) {
        if (isTransient) {
          maybeNextState = this.resolveRaisedTransition(maybeNextState, {
            type: nullEvent
          }, _event);
        }
        while (raisedEvents.length) {
          var raisedEvent = raisedEvents.shift();
          maybeNextState = this.resolveRaisedTransition(maybeNextState, raisedEvent._event, _event);
        }
      }
      var changed = maybeNextState.changed || (history ? !!maybeNextState.actions.length || didUpdateContext || typeof history.value !== typeof maybeNextState.value || !stateValuesEqual(maybeNextState.value, history.value) : void 0);
      maybeNextState.changed = changed;
      maybeNextState.history = history;
      maybeNextState.tags = getTagsFromConfiguration(maybeNextState.configuration);
      return maybeNextState;
    };
    StateNode2.prototype.getStateNode = function(stateKey) {
      if (isStateId(stateKey)) {
        return this.machine.getStateNodeById(stateKey);
      }
      if (!this.states) {
        throw new Error("Unable to retrieve child state '".concat(stateKey, "' from '").concat(this.id, "'; no child states exist."));
      }
      var result = this.states[stateKey];
      if (!result) {
        throw new Error("Child state '".concat(stateKey, "' does not exist on '").concat(this.id, "'"));
      }
      return result;
    };
    StateNode2.prototype.getStateNodeById = function(stateId) {
      var resolvedStateId = isStateId(stateId) ? stateId.slice(STATE_IDENTIFIER.length) : stateId;
      if (resolvedStateId === this.id) {
        return this;
      }
      var stateNode = this.machine.idMap[resolvedStateId];
      if (!stateNode) {
        throw new Error("Child state node '#".concat(resolvedStateId, "' does not exist on machine '").concat(this.id, "'"));
      }
      return stateNode;
    };
    StateNode2.prototype.getStateNodeByPath = function(statePath) {
      if (typeof statePath === "string" && isStateId(statePath)) {
        try {
          return this.getStateNodeById(statePath.slice(1));
        } catch (e) {
        }
      }
      var arrayStatePath = toStatePath(statePath, this.delimiter).slice();
      var currentStateNode = this;
      while (arrayStatePath.length) {
        var key = arrayStatePath.shift();
        if (!key.length) {
          break;
        }
        currentStateNode = currentStateNode.getStateNode(key);
      }
      return currentStateNode;
    };
    StateNode2.prototype.resolve = function(stateValue) {
      var _a2;
      var _this = this;
      if (!stateValue) {
        return this.initialStateValue || EMPTY_OBJECT;
      }
      switch (this.type) {
        case "parallel":
          return mapValues(this.initialStateValue, function(subStateValue, subStateKey) {
            return subStateValue ? _this.getStateNode(subStateKey).resolve(stateValue[subStateKey] || subStateValue) : EMPTY_OBJECT;
          });
        case "compound":
          if (isString(stateValue)) {
            var subStateNode = this.getStateNode(stateValue);
            if (subStateNode.type === "parallel" || subStateNode.type === "compound") {
              return _a2 = {}, _a2[stateValue] = subStateNode.initialStateValue, _a2;
            }
            return stateValue;
          }
          if (!Object.keys(stateValue).length) {
            return this.initialStateValue || {};
          }
          return mapValues(stateValue, function(subStateValue, subStateKey) {
            return subStateValue ? _this.getStateNode(subStateKey).resolve(subStateValue) : EMPTY_OBJECT;
          });
        default:
          return stateValue || EMPTY_OBJECT;
      }
    };
    StateNode2.prototype.getResolvedPath = function(stateIdentifier) {
      if (isStateId(stateIdentifier)) {
        var stateNode = this.machine.idMap[stateIdentifier.slice(STATE_IDENTIFIER.length)];
        if (!stateNode) {
          throw new Error("Unable to find state node '".concat(stateIdentifier, "'"));
        }
        return stateNode.path;
      }
      return toStatePath(stateIdentifier, this.delimiter);
    };
    Object.defineProperty(StateNode2.prototype, "initialStateValue", {
      get: function() {
        var _a2;
        if (this.__cache.initialStateValue) {
          return this.__cache.initialStateValue;
        }
        var initialStateValue;
        if (this.type === "parallel") {
          initialStateValue = mapFilterValues(this.states, function(state) {
            return state.initialStateValue || EMPTY_OBJECT;
          }, function(stateNode) {
            return !(stateNode.type === "history");
          });
        } else if (this.initial !== void 0) {
          if (!this.states[this.initial]) {
            throw new Error("Initial state '".concat(this.initial, "' not found on '").concat(this.key, "'"));
          }
          initialStateValue = isLeafNode(this.states[this.initial]) ? this.initial : (_a2 = {}, _a2[this.initial] = this.states[this.initial].initialStateValue, _a2);
        } else {
          initialStateValue = {};
        }
        this.__cache.initialStateValue = initialStateValue;
        return this.__cache.initialStateValue;
      },
      enumerable: false,
      configurable: true
    });
    StateNode2.prototype.getInitialState = function(stateValue, context) {
      this._init();
      var configuration = this.getStateNodes(stateValue);
      return this.resolveTransition({
        configuration,
        entrySet: configuration,
        exitSet: [],
        transitions: [],
        source: void 0,
        actions: []
      }, void 0, context !== null && context !== void 0 ? context : this.machine.context, void 0);
    };
    Object.defineProperty(StateNode2.prototype, "initialState", {
      get: function() {
        var initialStateValue = this.initialStateValue;
        if (!initialStateValue) {
          throw new Error("Cannot retrieve initial state from simple state '".concat(this.id, "'."));
        }
        return this.getInitialState(initialStateValue);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateNode2.prototype, "target", {
      get: function() {
        var target;
        if (this.type === "history") {
          var historyConfig = this.config;
          if (isString(historyConfig.target)) {
            target = isStateId(historyConfig.target) ? pathToStateValue(this.machine.getStateNodeById(historyConfig.target).path.slice(this.path.length - 1)) : historyConfig.target;
          } else {
            target = historyConfig.target;
          }
        }
        return target;
      },
      enumerable: false,
      configurable: true
    });
    StateNode2.prototype.getRelativeStateNodes = function(relativeStateId, historyValue, resolve) {
      if (resolve === void 0) {
        resolve = true;
      }
      return resolve ? relativeStateId.type === "history" ? relativeStateId.resolveHistory(historyValue) : relativeStateId.initialStateNodes : [relativeStateId];
    };
    Object.defineProperty(StateNode2.prototype, "initialStateNodes", {
      get: function() {
        var _this = this;
        if (isLeafNode(this)) {
          return [this];
        }
        if (this.type === "compound" && !this.initial) {
          if (!IS_PRODUCTION) {
            warn(false, "Compound state node '".concat(this.id, "' has no initial state."));
          }
          return [this];
        }
        var initialStateNodePaths = toStatePaths(this.initialStateValue);
        return flatten(initialStateNodePaths.map(function(initialPath) {
          return _this.getFromRelativePath(initialPath);
        }));
      },
      enumerable: false,
      configurable: true
    });
    StateNode2.prototype.getFromRelativePath = function(relativePath) {
      if (!relativePath.length) {
        return [this];
      }
      var _a2 = __read(relativePath), stateKey = _a2[0], childStatePath = _a2.slice(1);
      if (!this.states) {
        throw new Error("Cannot retrieve subPath '".concat(stateKey, "' from node with no states"));
      }
      var childStateNode = this.getStateNode(stateKey);
      if (childStateNode.type === "history") {
        return childStateNode.resolveHistory();
      }
      if (!this.states[stateKey]) {
        throw new Error("Child state '".concat(stateKey, "' does not exist on '").concat(this.id, "'"));
      }
      return this.states[stateKey].getFromRelativePath(childStatePath);
    };
    StateNode2.prototype.historyValue = function(relativeStateValue) {
      if (!Object.keys(this.states).length) {
        return void 0;
      }
      return {
        current: relativeStateValue || this.initialStateValue,
        states: mapFilterValues(this.states, function(stateNode, key) {
          if (!relativeStateValue) {
            return stateNode.historyValue();
          }
          var subStateValue = isString(relativeStateValue) ? void 0 : relativeStateValue[key];
          return stateNode.historyValue(subStateValue || stateNode.initialStateValue);
        }, function(stateNode) {
          return !stateNode.history;
        })
      };
    };
    StateNode2.prototype.resolveHistory = function(historyValue) {
      var _this = this;
      if (this.type !== "history") {
        return [this];
      }
      var parent = this.parent;
      if (!historyValue) {
        var historyTarget = this.target;
        return historyTarget ? flatten(toStatePaths(historyTarget).map(function(relativeChildPath) {
          return parent.getFromRelativePath(relativeChildPath);
        })) : parent.initialStateNodes;
      }
      var subHistoryValue = nestedPath(parent.path, "states")(historyValue).current;
      if (isString(subHistoryValue)) {
        return [parent.getStateNode(subHistoryValue)];
      }
      return flatten(toStatePaths(subHistoryValue).map(function(subStatePath) {
        return _this.history === "deep" ? parent.getFromRelativePath(subStatePath) : [parent.states[subStatePath[0]]];
      }));
    };
    Object.defineProperty(StateNode2.prototype, "stateIds", {
      get: function() {
        var _this = this;
        var childStateIds = flatten(Object.keys(this.states).map(function(stateKey) {
          return _this.states[stateKey].stateIds;
        }));
        return [this.id].concat(childStateIds);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateNode2.prototype, "events", {
      get: function() {
        var e_7, _a2, e_8, _b;
        if (this.__cache.events) {
          return this.__cache.events;
        }
        var states = this.states;
        var events = new Set(this.ownEvents);
        if (states) {
          try {
            for (var _c = __values(Object.keys(states)), _d = _c.next(); !_d.done; _d = _c.next()) {
              var stateId = _d.value;
              var state = states[stateId];
              if (state.states) {
                try {
                  for (var _e = (e_8 = void 0, __values(state.events)), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var event_1 = _f.value;
                    events.add("".concat(event_1));
                  }
                } catch (e_8_1) {
                  e_8 = {
                    error: e_8_1
                  };
                } finally {
                  try {
                    if (_f && !_f.done && (_b = _e.return))
                      _b.call(_e);
                  } finally {
                    if (e_8)
                      throw e_8.error;
                  }
                }
              }
            }
          } catch (e_7_1) {
            e_7 = {
              error: e_7_1
            };
          } finally {
            try {
              if (_d && !_d.done && (_a2 = _c.return))
                _a2.call(_c);
            } finally {
              if (e_7)
                throw e_7.error;
            }
          }
        }
        return this.__cache.events = Array.from(events);
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(StateNode2.prototype, "ownEvents", {
      get: function() {
        var events = new Set(this.transitions.filter(function(transition) {
          return !(!transition.target && !transition.actions.length && transition.internal);
        }).map(function(transition) {
          return transition.eventType;
        }));
        return Array.from(events);
      },
      enumerable: false,
      configurable: true
    });
    StateNode2.prototype.resolveTarget = function(_target) {
      var _this = this;
      if (_target === void 0) {
        return void 0;
      }
      return _target.map(function(target) {
        if (!isString(target)) {
          return target;
        }
        var isInternalTarget = target[0] === _this.delimiter;
        if (isInternalTarget && !_this.parent) {
          return _this.getStateNodeByPath(target.slice(1));
        }
        var resolvedTarget = isInternalTarget ? _this.key + target : target;
        if (_this.parent) {
          try {
            var targetStateNode = _this.parent.getStateNodeByPath(resolvedTarget);
            return targetStateNode;
          } catch (err) {
            throw new Error("Invalid transition definition for state node '".concat(_this.id, "':\n").concat(err.message));
          }
        } else {
          return _this.getStateNodeByPath(resolvedTarget);
        }
      });
    };
    StateNode2.prototype.formatTransition = function(transitionConfig) {
      var _this = this;
      var normalizedTarget = normalizeTarget(transitionConfig.target);
      var internal = "internal" in transitionConfig ? transitionConfig.internal : normalizedTarget ? normalizedTarget.some(function(_target) {
        return isString(_target) && _target[0] === _this.delimiter;
      }) : true;
      var guards = this.machine.options.guards;
      var target = this.resolveTarget(normalizedTarget);
      var transition = __assign(__assign({}, transitionConfig), {
        actions: toActionObjects(toArray(transitionConfig.actions)),
        cond: toGuard(transitionConfig.cond, guards),
        target,
        source: this,
        internal,
        eventType: transitionConfig.event,
        toJSON: function() {
          return __assign(__assign({}, transition), {
            target: transition.target ? transition.target.map(function(t) {
              return "#".concat(t.id);
            }) : void 0,
            source: "#".concat(_this.id)
          });
        }
      });
      return transition;
    };
    StateNode2.prototype.formatTransitions = function() {
      var e_9, _a2;
      var _this = this;
      var onConfig;
      if (!this.config.on) {
        onConfig = [];
      } else if (Array.isArray(this.config.on)) {
        onConfig = this.config.on;
      } else {
        var _b = this.config.on, _c = WILDCARD, _d = _b[_c], wildcardConfigs = _d === void 0 ? [] : _d, strictTransitionConfigs_1 = __rest(_b, [typeof _c === "symbol" ? _c : _c + ""]);
        onConfig = flatten(Object.keys(strictTransitionConfigs_1).map(function(key) {
          if (!IS_PRODUCTION && key === NULL_EVENT) {
            warn(false, "Empty string transition configs (e.g., `{ on: { '': ... }}`) for transient transitions are deprecated. Specify the transition in the `{ always: ... }` property instead. " + 'Please check the `on` configuration for "#'.concat(_this.id, '".'));
          }
          var transitionConfigArray = toTransitionConfigArray(key, strictTransitionConfigs_1[key]);
          if (!IS_PRODUCTION) {
            validateArrayifiedTransitions(_this, key, transitionConfigArray);
          }
          return transitionConfigArray;
        }).concat(toTransitionConfigArray(WILDCARD, wildcardConfigs)));
      }
      var eventlessConfig = this.config.always ? toTransitionConfigArray("", this.config.always) : [];
      var doneConfig = this.config.onDone ? toTransitionConfigArray(String(done(this.id)), this.config.onDone) : [];
      if (!IS_PRODUCTION) {
        warn(!(this.config.onDone && !this.parent), 'Root nodes cannot have an ".onDone" transition. Please check the config of "'.concat(this.id, '".'));
      }
      var invokeConfig = flatten(this.invoke.map(function(invokeDef) {
        var settleTransitions = [];
        if (invokeDef.onDone) {
          settleTransitions.push.apply(settleTransitions, __spreadArray([], __read(toTransitionConfigArray(String(doneInvoke(invokeDef.id)), invokeDef.onDone)), false));
        }
        if (invokeDef.onError) {
          settleTransitions.push.apply(settleTransitions, __spreadArray([], __read(toTransitionConfigArray(String(error2(invokeDef.id)), invokeDef.onError)), false));
        }
        return settleTransitions;
      }));
      var delayedTransitions = this.after;
      var formattedTransitions = flatten(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], __read(doneConfig), false), __read(invokeConfig), false), __read(onConfig), false), __read(eventlessConfig), false).map(function(transitionConfig) {
        return toArray(transitionConfig).map(function(transition) {
          return _this.formatTransition(transition);
        });
      }));
      try {
        for (var delayedTransitions_1 = __values(delayedTransitions), delayedTransitions_1_1 = delayedTransitions_1.next(); !delayedTransitions_1_1.done; delayedTransitions_1_1 = delayedTransitions_1.next()) {
          var delayedTransition = delayedTransitions_1_1.value;
          formattedTransitions.push(delayedTransition);
        }
      } catch (e_9_1) {
        e_9 = {
          error: e_9_1
        };
      } finally {
        try {
          if (delayedTransitions_1_1 && !delayedTransitions_1_1.done && (_a2 = delayedTransitions_1.return))
            _a2.call(delayedTransitions_1);
        } finally {
          if (e_9)
            throw e_9.error;
        }
      }
      return formattedTransitions;
    };
    return StateNode2;
  }();

  // node_modules/xstate/es/Machine.js
  function createMachine(config, options) {
    return new StateNode(config, options);
  }

  // node_modules/xstate/es/index.js
  var assign3 = assign2;
  var send3 = send2;

  // backend/ConnectionSupervisor/machine.ts
  var import_actions7 = __toESM(require_actions());

  // backend/ConnectionWorker/machine.ts
  var import_actions5 = __toESM(require_actions());

  // backend/networking/webrtc.ts
  function getWebRTCClient(metadata) {
    debugger;
    let conn;
    return new Promise((res, rej) => {
      conn = window._host_peer.connect(metadata);
      conn.on("open", () => {
        console.log(`connection to ${metadata} has been opened`);
        res(conn);
      });
    });
  }

  // backend/ConnectionWorker/eventHelpers.ts
  var createIncomingAction = (connectionId, event2, data) => ({
    type: "INCOMING_ACTION",
    connection_id: connectionId,
    payload: {
      event: event2,
      data
    }
  });

  // backend/ConnectionWorker/types.ts
  var metadataExists = (metadata) => !!metadata && metadata !== "";

  // backend/ConnectionWorker/machine.ts
  var ConnectionWorkerMachine = createMachine(
    {
      preserveActionOrder: true,
      tsTypes: {},
      schema: {
        context: {},
        events: {}
      },
      context: {
        incoming_queue: [],
        outgoing_queue: [],
        last_heartbeat: void 0,
        connection_metadata: void 0,
        worker_key: void 0,
        connection_ref: null
      },
      id: "ConnectionWorkerMachine",
      initial: "idle",
      states: {
        idle: {
          on: {
            CONNECT: {
              actions: "registerConnectionInfo",
              target: "connecting"
            }
          }
        },
        connecting: {
          invoke: {
            id: "getWebRTCClient",
            src: (ctx) => __async(void 0, null, function* () {
              return yield getWebRTCClient(ctx.connection_metadata);
            }),
            onDone: {
              actions: ["sendSelfConnected"]
            },
            onError: {
              actions: [
                "sendConnectionFail",
                (_, evt) => console.error("Error connecting to remote client : ", evt.data)
              ],
              target: "idle"
            }
          },
          on: {
            CONNECTED: {
              target: "connected"
            }
          }
        },
        connected: {
          entry: ["sendConnected", "saveConnectionRef"],
          invoke: {
            id: "rxtxLoop",
            src: (ctx) => (cb, onReceive) => {
              if (!ctx.connection_ref) {
                throw new Error("Connection does not exists");
              }
              ctx.connection_ref.onmessage = (message) => {
                const parsedMessage = JSON.parse(message);
                console.log(
                  `[connection-worker] received incoming message : ${message}`
                );
                if (!metadataExists(ctx.connection_metadata)) {
                  throw new Error("Metadata does not exists");
                }
                cb(
                  createIncomingAction(
                    ctx.connection_metadata,
                    parsedMessage.event,
                    parsedMessage.data
                  )
                );
              };
              onReceive((e) => {
                if (!ctx.connection_ref) {
                  throw new Error("Connection does not exists");
                }
                switch (e.type) {
                  case "GAMEPLAY_UPDATE":
                    ctx.connection_ref.send(JSON.stringify(e.payload));
                    break;
                  default:
                    console.error("Receieved event not recognized : ", e);
                }
              });
            }
          },
          on: {
            GAMEPLAY_UPDATE: {
              actions: ["forwardGameplayEvent"]
            },
            INCOMING_ACTION: {
              actions: "forwardToSupervisor"
            }
          }
        }
      }
    },
    {
      actions: {
        registerConnectionInfo: assign3({
          connection_metadata: (_, evt) => evt.metadata,
          worker_key: (_, evt) => evt.worker_key
        }),
        saveConnectionRef: assign3({
          connection_ref: (_, evt) => evt.connection
        }),
        sendSelfConnected: send3((_, evt) => ({
          type: "CONNECTED",
          connection: evt.data
        })),
        sendConnected: (0, import_actions5.sendParent)((ctx) => ({
          type: "PLAYER_CONNECTED",
          worker_key: ctx.worker_key
        })),
        sendConnectionFail: (0, import_actions5.sendParent)((ctx) => ({
          type: "PLAYER_CONNECTION_FAIL",
          worker_key: ctx.worker_key
        })),
        forwardGameplayEvent: send3((_, evt) => evt, { to: "rxtxLoop" }),
        forwardToSupervisor: (0, import_actions5.sendParent)((_, evt) => evt)
      }
    }
  );
  var machine_default = ConnectionWorkerMachine;

  // backend/gameplay/machine.ts
  var import_actions6 = __toESM(require_actions());

  // backend/gameplay/events.ts
  var createGameplayUpdate = (payloadType, targets = null, payloadData = {}) => ({
    type: "GAMEPLAY_UPDATE",
    targets,
    payload: {
      type: payloadType,
      data: payloadData
    }
  });
  var IncomingGameplayEvents = /* @__PURE__ */ ((IncomingGameplayEvents2) => {
    IncomingGameplayEvents2["START_GAME"] = "gameplay.start_game";
    IncomingGameplayEvents2["BID"] = "gameplay.bid.player_bid";
    IncomingGameplayEvents2["FOLD"] = "gameplay.bid.player_fold";
    IncomingGameplayEvents2["TRUMP_CHOSEN"] = "gameplay.pre_play.trump_chosen";
    IncomingGameplayEvents2["ADD_MELD"] = "gameplay.pre_play.player_add_meld";
    IncomingGameplayEvents2["COMMIT_MELDS"] = "gameplay.pre_play.player_commit_melds";
    IncomingGameplayEvents2["PLAY_CARD"] = "gameplay.play.player_play_card";
    return IncomingGameplayEvents2;
  })(IncomingGameplayEvents || {});

  // backend/gameplay/Deck.ts
  var Card = class {
    constructor(key, rank, suit, points, value = 0) {
      this.key = key;
      this.suit = suit;
      this.rank = rank;
      this.points = points;
      this.value = value;
    }
    isSuit(suit) {
      return this.suit === suit;
    }
  };
  var shuffle = (keys) => {
    let currentIndex = keys.length, randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [keys[currentIndex], keys[randomIndex]] = [
        keys[randomIndex],
        keys[currentIndex]
      ];
    }
    return keys;
  };
  var createRegistry = () => {
    const registry3 = {};
    const cardinalInfo = [
      ["9", 0, 0],
      ["J", 1, 0],
      ["Q", 2, 5],
      ["K", 3, 5],
      ["10", 4, 10],
      ["A", 5, 10]
    ];
    const suits = ["clubs", "diamonds", "hearts", "spades"];
    for (const suit of suits) {
      for (const [rank, value, points] of cardinalInfo) {
        const key = `${rank}${suit.toUpperCase()[0]}`;
        registry3[key] = new Card(key, rank, suit, points, value);
      }
    }
    return registry3;
  };
  var registry2 = createRegistry();
  var Deck_default = {
    getNewHands: () => {
      const hands = [];
      const keys = [
        ...Object.keys(registry2),
        ...Object.keys(registry2)
      ];
      const shuffledKeys = shuffle(keys);
      while (shuffledKeys.length) {
        hands.push(shuffledKeys.splice(0, 12));
      }
      return hands;
    },
    getCardFromKey: (key) => registry2[key]
  };

  // backend/gameplay/constants.ts
  var WINNING_SCORE = 1500;

  // backend/gameplay/GameplayHelpers.ts
  var LAST_TRICK_POINTS = 10;
  var NUM_PLAYERS = 4;
  var getPlayerTeam = (playerId) => playerId % 2;
  var sortCardsHighLow = ({ key: lkey }, { key: rkey }) => Deck_default.getCardFromKey(rkey).value - Deck_default.getCardFromKey(lkey).value;
  var sortPlaysOfSuit = (plays, suit) => plays.filter(({ key }) => Deck_default.getCardFromKey(key).isSuit(suit)).sort(sortCardsHighLow);
  var getWinningPlay = (plays, trump) => {
    const ledSuit = Deck_default.getCardFromKey(plays[0].key).suit;
    const ledSuitPlays = sortPlaysOfSuit(plays, ledSuit);
    const trumpSuitPlays = sortPlaysOfSuit(plays, trump);
    return trumpSuitPlays.length ? trumpSuitPlays[0] : ledSuitPlays[0];
  };
  var didBidderMakeBid = (ctx) => {
    const { bidWinner, bids } = ctx.bid;
    const bidWinnerPoints = ctx.round.points[getPlayerTeam(bidWinner)];
    return bidWinnerPoints[0] + bidWinnerPoints[1] >= bids[bidWinner];
  };
  var isGamePlayOver = (ctx) => ctx.game.score.some((score) => score >= WINNING_SCORE);
  var getPlayPoints = (hands, isLastTrick = false) => hands.reduce((tally, { key }) => tally + Deck_default.getCardFromKey(key).points, 0) + (isLastTrick && LAST_TRICK_POINTS || 0);
  var getIsLastTrick = (playerHands) => playerHands.every((hand) => hand.length === 0);
  var getNextPlayer = (currPlayer) => (currPlayer + 1) % NUM_PLAYERS;
  var allButPlayer = (player) => [...Array(NUM_PLAYERS).keys()].filter((_, idx) => idx !== player);

  // backend/gameplay/Meld.ts
  var POINTS_BY_MELD_TYPE = {
    marriage: 20,
    "royal-marriage": 40,
    "trump-nine": 10,
    flush: 150,
    pinochle: 40,
    "four-A": 100,
    "four-J": 40,
    "four-Q": 60,
    "four-K": 80
  };
  var getMeldPoints = (meld) => POINTS_BY_MELD_TYPE[meld.type];

  // backend/gameplay/machine.ts
  var GameMachine = createMachine(
    {
      preserveActionOrder: true,
      tsTypes: {},
      schema: {
        context: {},
        events: {}
      },
      id: "fullGameMachine",
      initial: "pre_game",
      type: "compound",
      context: {
        turn: 1,
        bid: {
          status: [true, true, true, true],
          bids: [0, 0, 0, 0],
          bidWinner: 0
        },
        meld: [[], [], [], []],
        play: {
          winning_player: null,
          currentPlays: [],
          pastPlays: [],
          playerHands: [],
          trump: null
        },
        round: {
          points: [
            [0, 0],
            [0, 0]
          ]
        },
        game: {
          score: [0, 0],
          dealer: 0
        }
      },
      states: {
        pre_game: {
          on: {
            START_GAME: {
              target: "round_in_progress",
              actions: "sendGameStart"
            }
          }
        },
        round_in_progress: {
          id: "roundMachine",
          initial: "round_start_epsilon",
          type: "compound",
          states: {
            round_start_epsilon: {
              always: {
                target: "bid",
                actions: ["sendRoundStart", "dealCards", "sendCards"]
              }
            },
            bid: {
              id: "bidMachine",
              initial: "awaiting_bid",
              entry: [(0, import_actions6.log)("starting bid", "[gameplay]"), "setStartingTurn"],
              states: {
                awaiting_bid: {
                  entry: [
                    (0, import_actions6.log)("awaiting next bid", "[gameplay]"),
                    "promptPlayerBid"
                  ],
                  on: {
                    BID: {
                      target: "bid_choice_pseudostate",
                      actions: ["playerBid", "sendPlayerBid"]
                    },
                    FOLD: {
                      target: "bid_choice_pseudostate",
                      actions: ["playerFold", "sendPlayerFold"]
                    }
                  }
                },
                bid_choice_pseudostate: {
                  entry: [
                    (ctx, evt) => (0, import_actions6.log)(
                      `bid turn executed by player ${ctx.turn}, type: ${evt.type}, value: ${evt.type == "BID" ? evt.value : null}`,
                      "[gameplay]"
                    )
                  ],
                  always: [
                    {
                      target: "bid_winner",
                      cond: "isBiddingWon",
                      actions: ["nextTurnBid"]
                    },
                    {
                      target: "awaiting_bid",
                      actions: ["nextTurnBid"]
                    }
                  ]
                },
                bid_winner: {
                  entry: [
                    (ctx, evt) => (0, import_actions6.log)(
                      `player ${ctx.turn} has won the bid at ${ctx.bid.bids[ctx.turn]}`,
                      "[gameplay]"
                    ),
                    "sendBidWinner"
                  ],
                  always: {
                    target: "#prePlayMachine.awaiting_trump"
                  }
                }
              }
            },
            pre_play: {
              id: "prePlayMachine",
              type: "compound",
              initial: "awaiting_trump",
              states: {
                awaiting_trump: {
                  entry: [
                    (ctx) => (0, import_actions6.log)(
                      `awaiting player ${ctx.turn} to choose trump`,
                      "[gameplay]"
                    ),
                    "promptTrumpChoice"
                  ],
                  on: {
                    TRUMP_CHOSEN: {
                      target: "meld_submission",
                      actions: ["setTrump", "sendTrumpChosen"]
                    }
                  }
                },
                meld_submission: {
                  id: "meldSubmissionMachine",
                  entry: [
                    (ctx, evt) => (0, import_actions6.log)(`meld submission phase`, "[gameplay]"),
                    "promptMeldSubmission"
                  ],
                  initial: "no_submit",
                  states: {
                    no_submit: {
                      entry: (ctx, evt) => (0, import_actions6.log)(`awaiting first meld`, "[gameplay]"),
                      on: {
                        COMMIT_MELDS: {
                          target: "one_submit",
                          actions: "sendCommitMelds"
                        }
                      }
                    },
                    one_submit: {
                      entry: (ctx, evt) => (0, import_actions6.log)(`awaiting second meld`, "[gameplay]"),
                      on: {
                        COMMIT_MELDS: {
                          target: "two_submit",
                          actions: "sendCommitMelds"
                        }
                      }
                    },
                    two_submit: {
                      entry: (ctx, evt) => (0, import_actions6.log)(`awaiting third meld`, "[gameplay]"),
                      on: {
                        COMMIT_MELDS: {
                          target: "three_submit",
                          actions: "sendCommitMelds"
                        }
                      }
                    },
                    three_submit: {
                      entry: (ctx, evt) => (0, import_actions6.log)(`awaiting fourth meld`, "[gameplay]"),
                      on: {
                        COMMIT_MELDS: {
                          target: "#playMachine",
                          actions: "sendCommitMelds"
                        }
                      }
                    }
                  },
                  on: {
                    ADD_MELD: {
                      actions: ["addMeld", "sendAddMeld"]
                    }
                  }
                }
              }
            },
            play: {
              id: "playMachine",
              entry: ["sendPlayStart", "promptPlayTurn"],
              initial: "pos_a",
              states: {
                pos_a: {
                  on: {
                    PLAY_CARD: {
                      target: "pos_b",
                      actions: [
                        "playCard",
                        "sendPlayerPlayCard",
                        "nextTurnPlay",
                        "promptPlayTurn"
                      ]
                    }
                  }
                },
                pos_b: {
                  on: {
                    PLAY_CARD: {
                      target: "pos_c",
                      actions: [
                        "playCard",
                        "sendPlayerPlayCard",
                        "nextTurnPlay",
                        "promptPlayTurn"
                      ]
                    }
                  }
                },
                pos_c: {
                  on: {
                    PLAY_CARD: {
                      target: "pos_d",
                      actions: [
                        "playCard",
                        "sendPlayerPlayCard",
                        "nextTurnPlay",
                        "promptPlayTurn"
                      ]
                    }
                  }
                },
                pos_d: {
                  on: {
                    PLAY_CARD: {
                      target: "trick_end",
                      actions: ["playCard", "sendPlayerPlayCard"]
                    }
                  }
                },
                trick_end: {
                  entry: ["saveTrickWinner", "tallyTrickPoints", "sendTrickEnd"],
                  always: [
                    {
                      target: "#roundMachine.round_end_pseudo_state",
                      cond: "isPlayOver"
                    },
                    {
                      target: "pos_a",
                      actions: ["newTrick", "promptPlayTurn"]
                    }
                  ]
                }
              }
            },
            round_end_pseudo_state: {
              always: [
                {
                  target: "round_end",
                  actions: ["updateTeamScores"],
                  cond: "didBidderMakeBid"
                },
                {
                  target: "round_end",
                  actions: ["handleBidNotMade"]
                }
              ]
            },
            round_end: {
              always: [
                {
                  target: "#fullGameMachine.post_game",
                  cond: "isGamePlayOver"
                },
                {
                  target: "#roundMachine",
                  actions: ["sendRoundStats", "resetRound", "changeDealer"]
                }
              ]
            },
            history: {
              type: "history",
              history: "deep"
            }
          }
        },
        post_game: {
          on: {
            NEW_GAME: { target: "pre_game" }
          }
        },
        failed_heartbeat: {
          on: {
            RESUMED_HEARTBEAT: { target: "round_in_progress.history" }
          }
        }
      },
      on: {
        FAILED_HEARTBEAT: { target: "failed_heartbeat" }
      }
    },
    {
      guards: {
        isBiddingWon: (ctx, _) => ctx.bid.status.filter((st) => st).length === 1,
        isPlayOver: (ctx, _) => getIsLastTrick(ctx.play.playerHands),
        isGamePlayOver,
        didBidderMakeBid
      },
      actions: {
        dealCards: assign3({
          play: (ctx, _) => __spreadProps(__spreadValues({}, ctx.play), {
            playerHands: Deck_default.getNewHands()
          })
        }),
        sendGameStart: (0, import_actions6.sendParent)(createGameplayUpdate("lobby.game_start")),
        sendRoundStart: (0, import_actions6.sendParent)(
          (ctx) => createGameplayUpdate("gameplay.pre_play.round_start", null, {
            dealer: ctx.game.dealer
          })
        ),
        sendCards: (0, import_actions6.pure)(
          (ctx) => ctx.play.playerHands.map(
            (hand, idx) => (0, import_actions6.sendParent)(
              createGameplayUpdate("gameplay.player_cards", [idx], { hand })
            )
          )
        ),
        promptPlayerBid: (0, import_actions6.sendParent)(
          (ctx) => createGameplayUpdate("gameplay.bid.awaiting_bid", null, {
            player: ctx.turn
          })
        ),
        playerBid: assign3({
          bid: (ctx, evt) => {
            const updatedBids = ctx.bid.bids.map(
              (bid, idx) => idx == ctx.turn ? evt.value : bid
            );
            return __spreadProps(__spreadValues({}, ctx.bid), {
              bids: updatedBids,
              bidWinner: updatedBids.indexOf(Math.max(...updatedBids))
            });
          }
        }),
        sendPlayerBid: (0, import_actions6.sendParent)(
          (ctx, evt) => createGameplayUpdate(
            "gameplay.bid.player_bid",
            allButPlayer(ctx.turn),
            {
              player: ctx.turn,
              bid: evt.value
            }
          )
        ),
        playerFold: assign3({
          bid: (ctx, _) => __spreadProps(__spreadValues({}, ctx.bid), {
            status: ctx.bid.status.map(
              (st, idx) => idx == ctx.turn ? false : st
            )
          })
        }),
        sendPlayerFold: (0, import_actions6.sendParent)(
          (ctx, evt) => createGameplayUpdate(
            "gameplay.bid.player_fold",
            allButPlayer(ctx.turn),
            {
              player: ctx.turn
            }
          )
        ),
        nextTurnBid: assign3({
          turn: (ctx, _) => {
            let currentTurn = ctx.turn;
            while (true) {
              currentTurn = getNextPlayer(currentTurn);
              if (ctx.bid.status[currentTurn]) {
                break;
              }
            }
            return currentTurn;
          }
        }),
        sendBidWinner: (0, import_actions6.sendParent)(
          (ctx) => createGameplayUpdate("gameplay.bid.bid_winner", null, {
            player: ctx.turn
          })
        ),
        promptTrumpChoice: (0, import_actions6.sendParent)(
          (ctx) => createGameplayUpdate("gameplay.pre_play.trump_choosing", null, {
            player: ctx.turn
          })
        ),
        setTrump: assign3({
          play: (ctx, evt) => __spreadProps(__spreadValues({}, ctx.play), {
            trump: evt.trump
          })
        }),
        sendTrumpChosen: (0, import_actions6.sendParent)(
          (ctx, evt) => createGameplayUpdate(
            "gameplay.pre_play.trump_chosen",
            allButPlayer(ctx.turn),
            { trump: evt.trump }
          )
        ),
        promptMeldSubmission: (0, import_actions6.sendParent)(
          () => createGameplayUpdate("gameplay.pre_play.awaiting_melds")
        ),
        addMeld: assign3({
          meld: (ctx, evt) => {
            const { meld, player } = evt;
            return ctx.meld.map(
              (entry, idx) => idx === player ? [...entry, meld] : entry
            );
          },
          round: (ctx, evt) => {
            const { player, meld } = evt;
            return {
              points: ctx.round.points.map((points, idx) => {
                return idx === getPlayerTeam(player) ? [
                  points[0] + getMeldPoints(meld),
                  points[1]
                ] : points;
              })
            };
          }
        }),
        sendAddMeld: (0, import_actions6.sendParent)(
          (ctx, evt) => createGameplayUpdate(
            "gameplay.pre_play.player_meld_added",
            allButPlayer(evt.player),
            { meld: evt.meld, player: evt.player, points: ctx.round.points }
          )
        ),
        sendCommitMelds: (0, import_actions6.sendParent)(
          (ctx, evt) => createGameplayUpdate(
            "gameplay.pre_play.player_melds_committed",
            allButPlayer(evt.player),
            { player: evt.player }
          )
        ),
        sendPlayStart: (0, import_actions6.sendParent)(
          (ctx, evt) => createGameplayUpdate("gameplay.play.play_start", null)
        ),
        promptPlayTurn: (0, import_actions6.sendParent)(
          (ctx, evt) => createGameplayUpdate("gameplay.play.player_turn", null, {
            player: ctx.turn
          })
        ),
        playCard: assign3({
          play: (ctx, evt) => {
            const { player, key } = evt;
            return __spreadProps(__spreadValues({}, ctx.play), {
              currentPlays: [...ctx.play.currentPlays, { key, player }],
              playerHands: ctx.play.playerHands.map((hand, idx) => {
                if (idx === player) {
                  return hand.filter((card) => card !== key);
                }
                return hand;
              })
            });
          }
        }),
        sendPlayerPlayCard: (0, import_actions6.sendParent)(
          (ctx, evt) => createGameplayUpdate(
            "gameplay.play.player_play_card",
            allButPlayer(evt.player),
            { player: evt.player, card: evt.key }
          )
        ),
        nextTurnPlay: assign3({
          turn: (ctx, _) => getNextPlayer(ctx.turn)
        }),
        saveTrickWinner: assign3({
          play: (ctx, _) => {
            const { currentPlays, trump } = ctx.play;
            const { player: winningPlayer } = getWinningPlay(
              currentPlays,
              trump
            );
            return __spreadProps(__spreadValues({}, ctx.play), {
              winning_player: winningPlayer
            });
          }
        }),
        tallyTrickPoints: assign3({
          round: (ctx, _) => {
            const {
              playerHands,
              currentPlays,
              winning_player: winningPlayer
            } = ctx.play;
            const isLastTrick = getIsLastTrick(playerHands);
            return {
              points: ctx.round.points.map(
                (teamPoints, idx) => idx === getPlayerTeam(winningPlayer) ? [
                  teamPoints[0],
                  teamPoints[1] + getPlayPoints(currentPlays, isLastTrick)
                ] : teamPoints
              )
            };
          }
        }),
        sendTrickEnd: (0, import_actions6.sendParent)((ctx, evt) => {
          return createGameplayUpdate("gameplay.play.trick_end", null, {
            winning_player: ctx.play.winning_player,
            points: ctx.round.points,
            is_last_trick: getIsLastTrick(ctx.play.playerHands)
          });
        }),
        sendRoundStats: (0, import_actions6.sendParent)(
          (ctx, evt) => createGameplayUpdate("gameplay.post_play.round_end", null, {
            score: ctx.game.score,
            has_made_bid: didBidderMakeBid(ctx),
            game_over: isGamePlayOver(ctx)
          })
        ),
        newTrick: assign3({
          turn: (ctx, _) => {
            const { currentPlays, trump } = ctx.play;
            const { player: winningPlayer } = getWinningPlay(
              currentPlays,
              trump
            );
            return winningPlayer;
          },
          play: (ctx, _) => __spreadProps(__spreadValues({}, ctx.play), {
            winning_player: null,
            currentPlays: [],
            pastPlays: [...ctx.play.pastPlays, ctx.play.currentPlays]
          })
        }),
        handleBidNotMade: assign3({
          game: (ctx, _) => __spreadProps(__spreadValues({}, ctx.game), {
            score: ctx.game.score.map(
              (score, idx) => idx === getPlayerTeam(ctx.bid.bidWinner) ? score - ctx.bid.bids[ctx.bid.bidWinner] : score + ctx.round.points[idx][0] + ctx.round.points[idx][1]
            )
          })
        }),
        updateTeamScores: assign3({
          game: (ctx, _) => {
            return __spreadProps(__spreadValues({}, ctx.game), {
              score: ctx.game.score.map(
                (score, idx) => score + ctx.round.points[idx][0] + ctx.round.points[idx][1]
              )
            });
          }
        }),
        resetRound: assign3({
          play: (_ctx, _) => ({
            winning_player: null,
            currentPlays: [],
            pastPlays: [],
            playerHands: [],
            trump: null
          }),
          bid: (_ctx, _) => ({
            status: [true, true, true, true],
            bids: [0, 0, 0, 0],
            bidWinner: 0
          }),
          meld: (_ctx, _) => [[], [], [], []],
          round: (_ctx, _) => ({
            points: [
              [0, 0],
              [0, 0]
            ]
          })
        }),
        changeDealer: assign3({
          game: (ctx, _) => __spreadProps(__spreadValues({}, ctx.game), {
            dealer: getNextPlayer(ctx.game.dealer)
          })
        }),
        setStartingTurn: assign3({
          turn: (ctx, _) => getNextPlayer(ctx.game.dealer)
        })
      }
    }
  );
  var machine_default2 = GameMachine;

  // backend/ConnectionSupervisor/events.ts
  var LobbyEvents = /* @__PURE__ */ ((LobbyEvents2) => {
    LobbyEvents2["JOIN_ROOM"] = "lobby.join_room";
    LobbyEvents2["START_GAME"] = "lobby.start_game";
    return LobbyEvents2;
  })(LobbyEvents || {});

  // backend/ConnectionSupervisor/eventHelpers.ts
  var getWorkerId = (metadata) => `connection_worker_${metadata}`;
  var createLobbyUpdate = (payloadType, srcPlayer = null, payloadData = {}) => ({
    type: "GAMEPLAY_UPDATE",
    src_player: srcPlayer,
    payload: {
      type: payloadType,
      data: payloadData
    }
  });
  var createIncomingGameplayEvent = (event2) => ({
    type: "INCOMING_GAME_EVENT",
    event: event2
  });
  var getEventDomain = (event2) => {
    const _includes = (obj, field) => Object.values(obj).includes(field);
    if (_includes(LobbyEvents, event2)) {
      return "lobby";
    }
    if (_includes(IncomingGameplayEvents, event2)) {
      return "gameplay";
    }
  };
  var processIncomingGameEvent = (e) => {
    switch (e.event) {
      case "gameplay.start_game" /* START_GAME */:
        return createIncomingGameplayEvent({
          type: "START_GAME"
        });
      case "gameplay.bid.player_bid" /* BID */:
        return createIncomingGameplayEvent({
          type: "BID",
          value: e.data.value
        });
      case "gameplay.bid.player_fold" /* FOLD */:
        return createIncomingGameplayEvent({
          type: "FOLD",
          isHez: false
        });
      case "gameplay.pre_play.trump_chosen" /* TRUMP_CHOSEN */:
        return createIncomingGameplayEvent({
          type: "TRUMP_CHOSEN",
          trump: e.data.trump
        });
      case "gameplay.pre_play.player_add_meld" /* ADD_MELD */:
        return createIncomingGameplayEvent({
          type: "ADD_MELD",
          meld: e.data.meld,
          player: e.data.player
        });
      case "gameplay.pre_play.player_commit_melds" /* COMMIT_MELDS */:
        return createIncomingGameplayEvent({
          type: "COMMIT_MELDS",
          player: e.data.player
        });
      case "gameplay.play.player_play_card" /* PLAY_CARD */:
        return createIncomingGameplayEvent({
          type: "PLAY_CARD",
          key: e.data.card,
          player: e.data.player
        });
      default:
        console.log("incoming game event type not recognized : ", e.event);
        return null;
    }
  };
  var processIncomingLobbyEvent = (e) => {
    switch (e.event) {
      case "lobby.start_game" /* START_GAME */:
        return { type: "START_GAME" };
      default:
        return null;
    }
  };
  var processIncomingAction = (e) => {
    switch (getEventDomain(e.event)) {
      case "gameplay":
        return processIncomingGameEvent(e);
      case "lobby":
        return processIncomingLobbyEvent(e);
      default:
        console.log("not gameplay nor lobby");
        return null;
    }
  };
  var parseSupervisorEvent = (e) => {
    if (e.type === "INCOMING_ACTION") {
      return processIncomingAction(e.payload);
    }
  };

  // backend/ConnectionSupervisor/lobbyHelpers.ts
  var _getRandomIdx = () => Math.floor(Math.random() * 4);
  var shuffleConnectedWorkerKeys = (connectedWorkers) => {
    const shuffledWorkers = [null, null, null, null];
    for (const worker of connectedWorkers) {
      let nextIdx = _getRandomIdx();
      while (shuffledWorkers[nextIdx] !== null) {
        nextIdx = _getRandomIdx();
      }
      shuffledWorkers[nextIdx] = worker;
    }
    return shuffledWorkers;
  };

  // backend/ConnectionSupervisor/machine.ts
  var ConnectionSupervisorMachine = createMachine(
    {
      preserveActionOrder: true,
      tsTypes: {},
      schema: {
        context: {},
        events: {}
      },
      context: {
        connected_workers: {},
        pending_workers: {},
        player_info: {},
        workers_x_player_ids: [],
        gameplay_ref: null
      },
      id: "ConnectionSupervisorMachine",
      initial: "waiting",
      entry: assign3({
        gameplay_ref: () => spawn(machine_default2, "gameplay_machine")
      }),
      states: {
        waiting: {
          on: {
            PLAYER_CONNECTED: [
              {
                target: "waiting_pseudostate",
                actions: [
                  "upgradePendingWorker",
                  "announceNewPlayer",
                  "sendRoomDescription"
                ],
                cond: "pendingWorkerExists"
              }
            ],
            PLAYER_CONNECTION_FAIL: {
              actions: "removePendingWorker"
            },
            PLAYER_JOIN_REQUEST: {
              actions: ["createPendingWorker", "connectPendingWorker"],
              cond: "roomNotFull"
            }
          }
        },
        waiting_pseudostate: {
          always: [
            {
              target: "active",
              cond: "allPlayersConnected"
            },
            {
              target: "waiting"
            }
          ]
        },
        active: {
          entry: "sendPlayersConnected",
          invoke: {
            id: "connection_supervisor_listener",
            src: () => (cb, onReceive) => {
              onReceive((e) => {
                const parsedEvent = parseSupervisorEvent(e);
                if (!parsedEvent) {
                  console.error("Unrecognized supervisor event : ", e);
                  return;
                }
                cb(parsedEvent);
              });
            }
          },
          on: {
            GAMEPLAY_UPDATE: {
              actions: "forwardGameplayUpdate"
            },
            INCOMING_ACTION: {
              actions: "forwardToListener"
            },
            INCOMING_GAME_EVENT: {
              actions: "forwardToGameplayMachine"
            },
            PLAYER_DISCONNECT: {
              target: "waiting",
              actions: "clearWorker"
            },
            START_GAME: {
              actions: ["createTeams", "sendTeams", "sendStartToGameplayMachine"]
            }
          }
        }
      },
      on: {
        FAILED_HEARTBEAT: {
          actions: "handleFailedHeartbeat"
        }
      }
    },
    {
      guards: {
        allPlayersConnected: (ctx, _) => Object.keys(ctx.connected_workers).length === 4,
        pendingWorkerExists: (ctx, { worker_key }) => !!ctx.pending_workers[worker_key],
        roomNotFull: (ctx, _) => Object.keys(ctx.connected_workers).length + Object.keys(ctx.pending_workers).length < 4
      },
      actions: {
        forwardToListener: (0, import_actions7.send)((_, evt) => evt, {
          to: "connection_supervisor_listener"
        }),
        forwardGameplayUpdate: (0, import_actions7.pure)((ctx, evt) => {
          const targetWorkers = evt.targets ? evt.targets.map(
            (target) => ctx.connected_workers[ctx.workers_x_player_ids[target]]
          ) : Object.values(ctx.connected_workers);
          return targetWorkers.map((wkr) => (0, import_actions7.send)(evt, { to: () => wkr }));
        }),
        announceNewPlayer: (0, import_actions7.pure)((ctx, evt) => {
          const workerKey = evt.worker_key;
          return Object.entries(ctx.connected_workers).filter(([key, _]) => workerKey !== key).map(
            ([_, worker]) => (0, import_actions7.send)(
              (ctx2) => createLobbyUpdate("lobby.player_join", null, {
                player_info: {
                  name: ctx2.player_info[workerKey].name,
                  id: workerKey
                }
              }),
              { to: () => worker }
            )
          );
        }),
        sendRoomDescription: (0, import_actions7.send)(
          (ctx) => createLobbyUpdate("lobby.room_description", null, {
            players: Object.keys(ctx.connected_workers).map((wkr) => ({
              name: ctx.player_info[wkr].name,
              id: wkr
            }))
          }),
          {
            to: (ctx, evt) => ctx.connected_workers[evt.worker_key]
          }
        ),
        handleFailedHeartbeat: () => {
        },
        createPendingWorker: assign3((ctx, evt) => {
          const encodedId = window.btoa(evt.connection_info);
          return {
            pending_workers: __spreadProps(__spreadValues({}, ctx.pending_workers), {
              [encodedId]: spawn(
                machine_default,
                getWorkerId(evt.connection_info)
              )
            }),
            player_info: __spreadProps(__spreadValues({}, ctx.player_info), {
              [encodedId]: {
                connection_info: evt.connection_info,
                name: evt.name
              }
            })
          };
        }),
        connectPendingWorker: (0, import_actions7.send)(
          (_, evt) => ({
            type: "CONNECT",
            metadata: evt.connection_info,
            worker_key: window.btoa(evt.connection_info)
          }),
          {
            to: (_, evt) => getWorkerId(evt.connection_info)
          }
        ),
        upgradePendingWorker: assign3((ctx, evt) => {
          const workerKey = evt.worker_key;
          const _a2 = ctx.pending_workers, { [workerKey]: connectedWorker } = _a2, otherWorkers = __objRest(_a2, [__restKey(workerKey)]);
          return {
            connected_workers: __spreadProps(__spreadValues({}, ctx.connected_workers), {
              [workerKey]: connectedWorker
            }),
            pending_workers: otherWorkers
          };
        }),
        removePendingWorker: assign3({
          pending_workers: (ctx, evt) => {
            delete ctx.pending_workers[evt.id];
            return ctx.pending_workers;
          }
        }),
        sendPlayersConnected: (0, import_actions7.pure)(
          (ctx) => Object.values(ctx.connected_workers).map(
            (worker) => (0, import_actions7.send)(createLobbyUpdate("lobby.all_players_connected", null), {
              to: () => worker
            })
          )
        ),
        clearWorker: () => {
        },
        forwardToGameplayMachine: (0, import_actions7.send)((_, evt) => evt.event, {
          to: "gameplay_machine"
        }),
        createTeams: assign3((ctx) => {
          const connectedWorkers = Object.keys(ctx.connected_workers);
          return {
            workers_x_player_ids: shuffleConnectedWorkerKeys(connectedWorkers)
          };
        }),
        sendTeams: (0, import_actions7.pure)((ctx) => {
          return Object.values(ctx.connected_workers).map(
            (worker) => (0, import_actions7.send)(
              createLobbyUpdate("lobby.player_teams", null, {
                teams: [
                  [ctx.workers_x_player_ids[0], ctx.workers_x_player_ids[2]],
                  [ctx.workers_x_player_ids[1], ctx.workers_x_player_ids[3]]
                ]
              }),
              {
                to: () => worker
              }
            )
          );
        }),
        sendStartToGameplayMachine: (0, import_actions7.send)(
          { type: "START_GAME" },
          { to: "gameplay_machine" }
        )
      }
    }
  );
  var machine_default3 = ConnectionSupervisorMachine;

  // lobby.ts
  var lobby = interpret(machine_default3);
  lobby.start();
  var lobby_default = lobby;

  // test_app/game.js
  function createPlayer(isHost) {
    const container2 = document.createElement("div");
    container2.classList.add("player");
    container2.innerHTML = `
    <p>${window.location.href}</p>
    <h3>${isHost ? "HOST" : "Player "}</h3>
    <div id='hand-container'>
      
    </div>
    <button type="button" id='playcard-btn'>Play Card</button>
    <div>
      <textarea placeholder='bid' id='bid-area'></textarea>
      <button type='button' id='bid-btn'>Bid</button>
      <button type='button' id='pass-btn'>Pass</button>
      <button type='button' id='hez-btn'>Hez</button>
    </div>
    ${!isHost && `
      <div>
        <button class='network-join' id='join-room' disabled>Start</button>
        <button class='network-leave' id='leave-room' disabled>End</button>
      </div>
      ` || ""}
  `;
    return container2;
  }
  var container = document.getElementById("player-container");
  container.append(createPlayer(IS_HOST));
  window._host_peer = new $70d766613f57b014$export$2e2bcd8739ae039();
  window.peer = new $70d766613f57b014$export$2e2bcd8739ae039();
  window.peer.on("open", (id) => {
    console.log("Connected to Peer server, my id is ", id);
    if (!IS_HOST) {
      document.getElementById("join-room").removeAttribute("disabled");
    } else {
      lobby_default.send({
        type: "PLAYER_JOIN_REQUEST",
        connection_info: window.peer.id,
        name: "host"
      });
    }
  });
  window.peer.on("connection", (conn) => {
    console.log("Just connected to ", conn.peer);
    if (!IS_HOST) {
      document.getElementById("join-room").setAttribute("disabled", true);
      document.getElementById("leave-room").removeAttribute("disabled");
    }
    conn.on("data", (data) => console.log(data));
  });
  var evtSource;
  if (IS_HOST) {
    evtSource = new EventSource(`/listen/${window._room_id}`);
    evtSource.onmessage = (e) => {
      const { event: event2, peer_id: peerId } = JSON.parse(e.data);
      switch (event2) {
        case "player_join_request":
          lobby_default.send({
            type: "PLAYER_JOIN_REQUEST",
            connection_info: peerId,
            name: "Nick"
          });
          break;
        default:
          console.log("unrecognized SSE event : ", event2);
      }
    };
  } else {
    document.getElementById("join-room").addEventListener("click", () => joinRoom(window._room_id, window.peer.id));
  }
})();
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
