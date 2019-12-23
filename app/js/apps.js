"use strict";

function isDefined(object) {
  return typeof object !== 'undefined';
}

function issetval(obj, value) {
  return isDefined(obj[value]) && obj[value] != "null";
}

function isset(obj) {
  return isDefined(obj) && obj != "null";
}

function encrypt(string, secret) {
  return CryptoJS.AES.encrypt(string, secret).toString();
}

function decrypt(string, secret) {
  return CryptoJS.AES.decrypt(string, secret).toString(CryptoJS.enc.Utf8);
}