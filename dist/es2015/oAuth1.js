var _dec, _class;

import { inject } from 'aurelia-dependency-injection';
import { authUtils } from './authUtils';
import { Storage } from './storage';
import { Popup } from './popup';
import { BaseConfig } from './baseConfig';

export let OAuth1 = (_dec = inject(Storage, Popup, BaseConfig), _dec(_class = class OAuth1 {
  constructor(storage, popup, config) {
    this.storage = storage;
    this.config = config;
    this.popup = popup;
    this.defaults = {
      url: null,
      name: null,
      popupOptions: null,
      redirectUri: null,
      authorizationEndpoint: null
    };
  }

  open(options, userData) {
    let current = authUtils.extend({}, this.defaults, options);

    let serverUrl = this.config.current.baseUrl ? authUtils.joinUrl(this.config.current.baseUrl, current.url) : current.url;

    if (this.config.current.platform !== 'mobile') {
      this.popup = this.popup.open('', current.name, current.popupOptions, current.redirectUri);
    }

    return this.config.current.client.post(serverUrl).then(response => {
      if (this.config.current.platform === 'mobile') {
        this.popup = this.popup.open([current.authorizationEndpoint, this.buildQueryString(response)].join('?'), current.name, current.popupOptions, current.redirectUri);
      } else {
        this.popup.popupWindow.location = [current.authorizationEndpoint, this.buildQueryString(response)].join('?');
      }

      let popupListener = this.config.current.platform === 'mobile' ? this.popup.eventListener(current.redirectUri) : this.popup.pollPopup();

      return popupListener.then(result => this.exchangeForToken(result, userData, current));
    });
  }

  exchangeForToken(oauthData, userData, current) {
    let data = authUtils.extend({}, userData, oauthData);
    let exchangeForTokenUrl = this.config.current.baseUrl ? authUtils.joinUrl(this.config.current.baseUrl, current.url) : current.url;
    let credentials = this.config.current.withCredentials ? 'include' : 'same-origin';

    return this.config.current.client.post(exchangeForTokenUrl, data, { credentials: credentials });
  }

  buildQueryString(obj) {
    let str = [];

    authUtils.forEach(obj, (value, key) => str.push(encodeURIComponent(key) + '=' + encodeURIComponent(value)));

    return str.join('&');
  }
}) || _class);