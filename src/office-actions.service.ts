import {Injectable} from '@angular/core';

/**
 * OfficeActionsService uses the Alfresco Office Services link to open documents.
 */

@Injectable()
export class OfficeActionsService {

  DEFAULT_TIMEOUT = 2000;
  timeout;
  userAgent = navigator.userAgent.toLowerCase();

  messages = {
    'WINDOWS_MAC_ONLY': 'Deze feature werkt alleen op Windows en Mac OS X.',
    'TIMEOUT': 'U gebruikt een versie van Microsoft Office die niet door Alfresco wordt ondersteund. Probeer Microsoft Office bij te werken.'
  };

  /**
   *
   * @param entry NodeEntry
   * @param ecmHost
   * @param timeout (optional) in ms if it is 0 the timeout will not be set at all.
   * @param messages (optional) {'WINDOWS_MAC_ONLY', 'TIMEOUT'} Translated strings
   * @param openByMimeType (optional) boolean representing whether the correct protocol is chosen by the mimetype. false if not set.
   */
  editOnline(entry, ecmHost, timeout?, messages?, openByMimeType?) {
    if (messages) {
      this.updateMessages(messages);
    }

    this.timeout = timeout || this.DEFAULT_TIMEOUT;

    let filepath = entry.path.name;
    const position = filepath.split('/', 2).join('/').length;
    filepath = filepath.slice(position) + '/' + entry.name;
    const url = ecmHost + '/alfresco/aos' + filepath;
    if (openByMimeType) {
      const mimeType = entry.content.mimeType;
      this.triggerEditOnlineAosByMimeType(url, mimeType);
    } else {
      const extension = entry.name.substring(entry.name.lastIndexOf('.') + 1, entry.name.length);
      this.triggerEditOnlineAosByExtension(url, extension);
    }
  }

  private updateMessages(messages) {
    if (messages.TIMEOUT) {
      this.messages.TIMEOUT = messages.TIMEOUT;
    }
    if (messages.WINDOWS_MAC_ONLY) {
      this.messages.WINDOWS_MAC_ONLY = messages.WINDOWS_MAC_ONLY;
    }
  }

  private triggerEditOnlineAosByExtension(onlineEditUrlAos, fileExtension) {
    const protocolHandler = OfficeActionsService.getProtocolForFileExtension(fileExtension);
    this.checkSupportedOSAndLaunch(protocolHandler, onlineEditUrlAos);
  }

  private triggerEditOnlineAosByMimeType(onlineEditUrlAos, mimeType) {
    const protocolHandler = OfficeActionsService.getProtocolForMimeType(mimeType);
    this.checkSupportedOSAndLaunch(protocolHandler, onlineEditUrlAos);
  }

  private checkSupportedOSAndLaunch(protocolHandler, onlineEditUrlAos) {
    // detect if we are on a supported operating system
    if (!this.isWin() && !this.isMac()) {
      alert(this.messages.WINDOWS_MAC_ONLY);
      return;
    }

    this.launchMsOfficeProtocolHandler(protocolHandler, onlineEditUrlAos);
  }

  private launchMsOfficeProtocolHandler(protocolHandler, url) {
    let protocolHandlerPresent = false;
    const input = document.createElement('input');
    const inputTop = document.body.scrollTop + 10;

    input.setAttribute('style', `
      z-index: 1000; 
      background-color: rgba(0, 0, 0, 0); 
      border: none; 
      outline: none; 
      position: absolute; 
      left: 10px; 
      top: ${inputTop}px;
    `);
    document.getElementsByTagName('body')[0].appendChild(input);
    input.focus();
    input.onblur = function () {
      protocolHandlerPresent = true;
    };

    location.href = protocolHandler + ':ofe%7Cu%7C' + url;

    const TIMEOUT_MESSAGE = this.messages.TIMEOUT;
    if (this.timeout > 0) {
      setTimeout(() => {
        input.onblur = null;
        input.remove();
        if (!protocolHandlerPresent) {
          alert(TIMEOUT_MESSAGE);
        }
      }, this.timeout);
    }
  }


  isWin() {
    return (this.userAgent.indexOf('win') !== -1);
  }

  isMac() {
    return (this.userAgent.indexOf('mac') !== -1);
  }


  static getProtocolForFileExtension(fileExtension) {
    let msProtocolNames = {
      'doc': 'ms-word',
      'docx': 'ms-word',
      'docm': 'ms-word',
      'dot': 'ms-word',
      'dotx': 'ms-word',
      'dotm': 'ms-word',
      'xls': 'ms-excel',
      'xlsx': 'ms-excel',
      'xlsb': 'ms-excel',
      'xlsm': 'ms-excel',
      'xlt': 'ms-excel',
      'xltx': 'ms-excel',
      'xltm': 'ms-excel',
      'ppt': 'ms-powerpoint',
      'pptx': 'ms-powerpoint',
      'pot': 'ms-powerpoint',
      'potx': 'ms-powerpoint',
      'potm': 'ms-powerpoint',
      'pptm': 'ms-powerpoint',
      'pps': 'ms-powerpoint',
      'ppsx': 'ms-powerpoint',
      'ppam': 'ms-powerpoint',
      'ppsm': 'ms-powerpoint',
      'sldx': 'ms-powerpoint',
      'sldm': 'ms-powerpoint'
    };
    return msProtocolNames[fileExtension];
  }

  static getProtocolForMimeType(mimeType) {
    let msProtocolNames = {
      'application/msword': 'ms-word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'ms-word',
      'application/vnd.ms-word.document.macroEnabled.12': 'ms-word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.template': 'ms-word',
      'application/vnd.ms-word.template.macroEnabled.12': 'ms-word',
      'application/vnd.ms-excel': 'ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'ms-excel',
      'application/vnd.ms-excel.sheet.binary.macroEnabled.12': 'ms-excel',
      'application/vnd.ms-excel.sheet.macroEnabled.12': 'ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.template': 'ms-excel',
      'application/vnd.ms-excel.template.macroEnabled.12': 'ms-excel',
      'application/vnd.ms-powerpoint': 'ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.template': 'ms-powerpoint',
      'application/vnd.ms-powerpoint.template.macroEnabled.12': 'ms-powerpoint',
      'application/vnd.ms-powerpoint.presentation.macroEnabled.12': 'ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.slideshow': 'ms-powerpoint',
      'application/vnd.ms-powerpoint.addin.macroEnabled.12': 'ms-powerpoint',
      'application/vnd.ms-powerpoint.slideshow.macroEnabled.12': 'ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.slide': 'ms-powerpoint',
      'application/vnd.ms-powerpoint.slide.macroenabled.12': 'ms-powerpoint'
    };
    return msProtocolNames[mimeType];
  }

}
