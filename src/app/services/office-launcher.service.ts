import {Injectable} from "@angular/core";

interface ActiveXObject {
    new (s: string): any;
}

declare const ActiveXObject: ActiveXObject;

@Injectable()
export class OfficeLauncherService {

    ACTIVEX_PROGID = {
        sp: 'SharePoint.OpenDocuments',
        ol: 'OfficeLauncherOrg.OpenDocuments'
    };

    NPAPI_MIMETYPE = {
        sp: 'application/x-sharepoint',
        ol: 'application/x-officelauncher'
    };

    userAgent = navigator.userAgent.toLowerCase();


    ruleSet = {};
    pluginOrder = null;
    control = null;
    lastControlResult = null;
    controlNotActivated = false;

    constructor() {
        // apply default rule set
        this.applyRules('ax=sp,ol;npapi=sp,ol;npapi.chrome.mac=ol;sp,ol');
    }


    ViewDocument(url) {
        return this.openDocument(url, true);
    }

    EditDocument(url) {
        return this.openDocument(url, false);
    }

    isAvailable() {
        return this.isAvailableOnPlatform();
    }

    getLastControlResult() {
        return this.lastControlResult;
    }

    isControlBlocked() {
        return (this.isFirefox() || this.isChrome()) && this.controlNotActivated;
    }

    isWin() {
        return (this.userAgent.indexOf('win') !== -1);
    }

    isMac() {
        return (this.userAgent.indexOf('mac') !== -1);
    }

    isIOS() {
        return (this.userAgent.indexOf('ipad') !== -1) || (this.userAgent.indexOf('iphone') !== -1) || (this.userAgent.indexOf('ipod') !== -1);
    }

    isFirefox() {
        return (this.userAgent.indexOf('firefox') !== -1);
    }

    isChrome() {
        return (this.userAgent.indexOf('chrome') !== -1) && (!this.isOpera());
    }

    isSafari() {
        return (this.userAgent.indexOf('safari') !== -1) && (!(this.isChrome() || this.isOpera()));
    }

    isOpera() {
        return (this.userAgent.indexOf('opr') !== -1);
    }

    isIE() {
        return (this.userAgent.indexOf('msie') !== -1) || (this.userAgent.indexOf('trident') !== -1);
    }

    isControlNotActivated() {
        return this.controlNotActivated;
    }

    openDocument(url, readOnly) {
        this.controlNotActivated = false;
        console.log('Opening url = ' + url + ' readOnly = ' + readOnly);
        let control = this.getControl();
        if (control) {
            try {
                let result;
                if (readOnly) {
                    if (!(this.isIE() || control.ViewDocument)) {
                        this.controlNotActivated = true;
                    } else {
                        result = control.ViewDocument(url);
                    }
                } else {
                    if (!(this.isIE() || control.EditDocument)) {
                        this.controlNotActivated = true;
                    } else {
                        result = control.EditDocument(url);
                    }
                }
                this.lastControlResult = result;
                console.log('Control object invoked successfully. result = ' + result);
                if (result === true || result === 0 || result === '0') {
                    return true;
                }
            } catch (e) {
                console.log('Exception invoking control object' + e);
            }
        } else {
            console.log('No control object available.');
        }
        return false;
    }

    isControlActivated() {
        console.log('Checking control activation');
        let control = this.getControl();
        return control && control.ViewDocument;
    }

    getControl() {
        if (this.control) {
            return this.control;
        }
        console.log('No control object available. Creating new one.');
        let pluginOrder = this.getPluginOrder();
        console.log('PlugIn order: ' + pluginOrder);
        if (!(<any>window).ActiveXObject) {
            console.log('Using ActiveX on this platform.');
            this.control = this.createActiveXControl(pluginOrder);
            if (!this.control) {
                console.log('Failed creating Active-X control.');
            }
            return this.control;
        } else {
            console.log('Using NPAPI on this platform.');
            this.control = this.createNPAPIControl(pluginOrder);
            if (!this.control) {
                console.log('Failed creating NPAPI control.');
            }
            return this.control;
        }
    }

    isAvailableOnPlatform() {
        console.log('Detecting availability on this platform.');
        let pluginOrder = this.getPluginOrder();
        console.log('PlugIn order: ' + pluginOrder);
        if (!(<any>window).ActiveXObject) {
            console.log('Using ActiveX on this platform. Trying to create Active-X object to detect if launcher is available on this platform.');
            this.control = this.createActiveXControl(pluginOrder);
            if (this.control) {
                console.log('Successfully created ActiveX object. OfficeLauncher is available on this platform.');
                return true;
            }
        } else {
            console.log('Using NPAPI on this platform.');
            for (let i = 0; i < pluginOrder.length; i++) {
                let pluginTypeId = pluginOrder[i];
                let mimetype = this.NPAPI_MIMETYPE[pluginTypeId];
                if (mimetype) {
                    console.log('Checking availability of ' + mimetype);
                    if (this.isPluginAvailable(mimetype)) {
                        console.log('Is available. OfficeLauncher is available on this platform.');
                        return true;
                    }
                }
            }
        }
        return false;
    }

    createActiveXControl(pluginOrder) {
        for (let i = 0; i < pluginOrder.length; i++) {
            let pluginTypeId = pluginOrder[i];
            console.log('Trying to create ActiveX control for plugin type id "' + pluginTypeId + '"...');
            let progId = this.ACTIVEX_PROGID[pluginTypeId];
            try {
                if (!progId) {
                    console.log('No ActiveX ProgId for plugin type id "' + pluginTypeId + '"');
                    continue;
                }
                console.log('Tying to create ActiveX object with progId "' + progId + '"...');
                let obj = new ActiveXObject(progId);
                if (obj) {
                    console.log('Successfully created ActiveX control: ' + obj);
                    return obj;
                }
            } catch (e) {
                console.log('Exception creating ActiveX control. progId = ' + progId + ' Exception = ' + e);
            }
        }
        console.log('No Active-X Object in plugin order could be created.');
        return null;
    }

    createNPAPIControl(pluginOrder) {
        for (let i = 0; i < pluginOrder.length; i++) {
            let pluginTypeId = pluginOrder[i];
            console.log('Trying to create NPAPI control for plugin type id "' + pluginTypeId + '"...');
            let mimetype = this.NPAPI_MIMETYPE[pluginTypeId];
            try {
                if (!mimetype) {
                    console.log('No NPAPI mimetype for plugin type id "' + pluginTypeId + '"');
                    continue;
                }
                console.log('Tying to create NPAPI object with mimetype "' + mimetype + '"...');
                let obj = this.getNpapiPlugin(mimetype, 'officelauncher-plugin-container-' + pluginTypeId);
                if (obj) {
                    console.log('Successfully created NPAPI control: ' + obj);
                    return obj;
                }
            } catch (e) {
                console.log('Exception creating NPAPI control. mimetype = ' + mimetype + ' Exception = ' + e);
            }
        }
        console.log('No NPAPI Object in plugin order could be created.');
        return null;
    }

    getPluginOrder() {
        if (this.pluginOrder) {
            return this.pluginOrder;
        }
        let selTechnology = this.getTechnologySelector();
        let selBrowser = this.getBrowserSelector();
        let selOS = this.getOSSelector();
        this.pluginOrder = this.ruleSet[selTechnology + '.' + selBrowser + '.' + selOS];
        if (this.pluginOrder) {
            return this.pluginOrder;
        }
        this.pluginOrder = this.ruleSet[selTechnology + '.' + selBrowser];
        if (this.pluginOrder) {
            return this.pluginOrder;
        }
        this.pluginOrder = this.ruleSet[selTechnology];
        if (this.pluginOrder) {
            return this.pluginOrder;
        }
        this.pluginOrder = this.ruleSet[''];
        if (this.pluginOrder) {
            return this.pluginOrder;
        }
        this.pluginOrder = [];
        return this.pluginOrder;
    }

    getTechnologySelector() {
        return (!(<any>window).ActiveXObject) ? 'ax' : 'npapi';
    }

    getBrowserSelector() {
        if (this.isFirefox()) {
            return 'firefox';
        } else if (this.isIE()) {
            return 'ie';
        } else if (this.isChrome()) {
            return 'chrome';
        } else if (this.isSafari()) {
            return 'safari';
        }
        return 'unknown';
    }

    getOSSelector() {
        if (this.isWin()) {
            return 'win';
        } else if (this.isMac()) {
            return 'mac';
        }
        return 'unknown';
    }

    applyRules(rules) {
        let ruleDefs = rules.toLowerCase().split(';');
        for (let i = 0; i < ruleDefs.length; i++) {
            let rule = ruleDefs[i];
            let separatorPos = rule.indexOf('=');
            let selector;
            let pluginOrder;
            if (separatorPos < 0) {
                selector = '';
                pluginOrder = (rule.length > 0) ? rule.split(',') : [];
            } else {
                selector = rule.substring(0, separatorPos);
                rule = rule.substring(separatorPos + 1);
                pluginOrder = (rule.length > 0) ? rule.split(',') : [];
            }
            this.ruleSet[selector] = pluginOrder;
        }
        this.pluginOrder = null;
        this.control = null;
    }

    getNpapiPlugin(mimeType, containerId) {
        let plugin = null;
        try {
            plugin = document.getElementById(containerId);
            if (!plugin) {
                console.log('Trying to create NPAPI plugin. mimeType = ' + mimeType);
                if (this.isPluginAvailable(mimeType)) {
                    let newContainer = document.createElement('object');
                    newContainer.id = containerId;
                    newContainer.type = mimeType;
                    newContainer.width = '0';
                    newContainer.height = '0';
                    newContainer.style.setProperty('visibility', 'hidden', '');
                    document.body.appendChild(newContainer);
                    plugin = document.getElementById(containerId);
                } else {
                    console.log('NPAPI PlugIn is not available. mimeType = ' + mimeType);
                }
            }
        } catch (e) {
            console.log('Exception creating NPAPI PlugIn object. mimeType = ' + mimeType + ' Exception = ' + e);
            plugin = null;
        }
        return plugin;
    }

    isPluginAvailable(mimeType: any) {
        let nav: any = navigator;
        return nav && nav.mimeTypes && nav.mimeTypes[mimeType] && nav.mimeTypes[mimeType].enabledPlugin;
    }

    encodeUrl(url) {
        const URL_ESCAPE_CHARS = '<>\'\"?#@%&`';
        let encoded = '';
        let x = 0;
        for (let i = 0; i < url.length; i++) {
            let charCode = url.charCodeAt(i);
            let c = url.charAt(i);
            if (charCode < 0x80) {
                if ((charCode >= 33) && (charCode <= 122) && (URL_ESCAPE_CHARS.indexOf(c) < 0)) {
                    encoded += url.charAt(i);
                } else {
                    encoded += '%';
                    let s = charCode.toString(16).toUpperCase();
                    if (s.length < 2) {
                        encoded += '0';
                    }
                    encoded += s;
                }
            } else if (charCode < 0x0800) {
                x = (charCode >> 6) | 0xC0;
                encoded += '%' + x.toString(16).toUpperCase();
                x = (charCode & 0x003F) | 0x80;
                encoded += '%' + x.toString(16).toUpperCase();
            } else if ((charCode & 0xFC00) !== 0xD800) {
                x = (charCode >> 12) | 0xE0;
                encoded += '%' + x.toString(16).toUpperCase();
                x = ((charCode >> 6) & 0x003F) | 0x80;
                encoded += '%' + x.toString(16).toUpperCase();
                x = (charCode & 0x003F) | 0x80;
                encoded += '%' + x.toString(16).toUpperCase();
            } else {
                if (i < url.length - 1) {
                    charCode = (charCode & 0x03FF) << 10;
                    i++;
                    charCode = charCode | (url.charCodeAt(i) & 0x03FF);
                    charCode += 0x10000;
                    x = (charCode >> 18) | 0xF0;
                    encoded += '%' + x.toString(16).toUpperCase();
                    x = ((charCode >> 12) & 0x003F) | 0x80;
                    encoded += '%' + x.toString(16).toUpperCase();
                    x = ((charCode >> 6) & 0x003F) | 0x80;
                    encoded += '%' + x.toString(16).toUpperCase();
                    x = (charCode & 0x003F) | 0x80;
                    encoded += '%' + x.toString(16).toUpperCase();
                }
            }
        }
        return encoded;
    }

    dollarEncode(url) {
        const DOLLAR_ESCAPE_CHARS = '$<>\'\"?#@%&`';
        let encoded = '';
        let x = 0;
        for (let i = 0; i < url.length; i++) {
            let charCode = url.charCodeAt(i);
            let c = url.charAt(i);
            if (charCode < 0x80) {
                if ((charCode >= 33) && (charCode <= 122) && (DOLLAR_ESCAPE_CHARS.indexOf(c) < 0)) {
                    encoded += url.charAt(i);
                } else {
                    encoded += '$';
                    let s = charCode.toString(16).toUpperCase();
                    if (s.length < 2) {
                        encoded += '0';
                    }
                    encoded += s;
                }
            } else if (charCode < 0x0800) {
                x = (charCode >> 6) | 0xC0;
                encoded += '$' + x.toString(16).toUpperCase();
                x = (charCode & 0x003F) | 0x80;
                encoded += '$' + x.toString(16).toUpperCase();
            } else if ((charCode & 0xFC00) !== 0xD800) {
                x = (charCode >> 12) | 0xE0;
                encoded += '$' + x.toString(16).toUpperCase();
                x = ((charCode >> 6) & 0x003F) | 0x80;
                encoded += '$' + x.toString(16).toUpperCase();
                x = (charCode & 0x003F) | 0x80;
                encoded += '$' + x.toString(16).toUpperCase();
            } else {
                if (i < url.length - 1) {
                    charCode = (charCode & 0x03FF) << 10;
                    i++;
                    charCode = charCode | (url.charCodeAt(i) & 0x03FF);
                    charCode += 0x10000;
                    x = (charCode >> 18) | 0xF0;
                    encoded += '$' + x.toString(16).toUpperCase();
                    x = ((charCode >> 12) & 0x003F) | 0x80;
                    encoded += '$' + x.toString(16).toUpperCase();
                    x = ((charCode >> 6) & 0x003F) | 0x80;
                    encoded += '$' + x.toString(16).toUpperCase();
                    x = (charCode & 0x003F) | 0x80;
                    encoded += '$' + x.toString(16).toUpperCase();
                }
            }
        }
        return encoded;
    }

}
