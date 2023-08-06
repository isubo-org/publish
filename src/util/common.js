import { enumReleaseTagType } from "../constant/enum.js";

export function protoStringCall(val) {
  return Object.prototype.toString.call(val);
}

export function isArray(val) {
  return protoStringCall(val) === '[object Array]';
}


export function isNonNullObject(val) {
  return val && protoStringCall(val) === '[object Object]';
}

/**
 * @template SrcType
 * @template ExtendType
 * 
 * @param {SrcType} data 
 * @param {function(SrcType): ExtendType} cb 
 * @returns {SrcType & ExtendType}
 */
export function ctx(data, cb) {
  return defineConstStruct({
    ...cb(data),
    ...data
  });
}

/**
 * @template DataType extends Object
 * @param {DataType} data
 * @returns {DataType}
 */
export function defineConstStruct(data) {
  const isBasicRefStruct = (val) => isArray(val) || isNonNullObject(val);
  if (!isBasicRefStruct(data)) {
    return data;
  }

  const ret = isArray(data) ? [] : {};

  if (isArray(data)) {
    ['push', 'pop', 'shift', 'splice'].forEach(funcName => {
      Object.defineProperty(ret, funcName, {
        value: new Function(),
        writable: false,
        enumerable: false,
        configurable: false
      });
    });
  }

  const setDisWritableVal = (value) => ({
    value: defineConstStruct(value),
    writable: false,
    enumerable: true,
    configurable: false
  });
  const param = {};

  for (const [key, val] of Object.entries(data)) {
    param[key] = setDisWritableVal(val);
  }
  Object.defineProperties(ret, param);

  return ret;
}

export function getVersionNUms(version) {
  const verNums = version.split('.').slice(0, 3).map(s => parseInt(s));
  return verNums;
}

/**
 * @param {string} version 
 * @returns {boolean}
 */
export function isReleaseVersion(version) {
  const verNums = getVersionNUms(version);
  return verNums.join('.') === version;
}

export function parseTagFrom({ version }) {
  for (const tag of Object.values(enumReleaseTagType)) {
    if (version.includes(tag)) {
      return tag;
    }
  }

  return '';
}
