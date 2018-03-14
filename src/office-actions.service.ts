import { Injectable } from '@angular/core';

/**
 * OfficeActionsService uses the Alfresco Office Services link to open documents.
 */

@Injectable()
export class OfficeActionsService {
  userAgent = navigator.userAgent.toLowerCase();


  editOnline(entry, ecmHost) {
    let filepath = entry.path.name;
    let position = filepath.split('/', 2).join('/').length;
    filepath = filepath.slice(position) + '/' + entry.name;
    let url = ecmHost + '/alfresco/aos' + filepath;
    let extension = entry.name.substring(entry.name.lastIndexOf('.') + 1, entry.name.length);
    this.triggerEditOnlineAos(url, extension);
  }

  private triggerEditOnlineAos(onlineEditUrlAos, fileExtension) {
    let protocolHandler = this.getProtocolForFileExtension(fileExtension);

    // detect if we are on a supported operating system
    if (!this.isWin() && !this.isMac()) {
      alert('This feature is only available on Windows or Mac OS X.');
      return;
    }

    this.launchMsOfficeProtocolHandler(protocolHandler, onlineEditUrlAos);
  }

  private launchMsOfficeProtocolHandler(protocolHandler, url) {
    let protocolHandlerPresent = false;
    let input = document.createElement('input');
    let inputTop = document.body.scrollTop + 10;

    input.setAttribute('style', 'z-index: 1000; background-color: rgba(0, 0, 0, 0); border: none; outline: none; position: absolute; left: 10px; top: ' + inputTop + 'px;');
    document.getElementsByTagName('body')[0].appendChild(input);
    input.focus();
    input.onblur = function () {
      protocolHandlerPresent = true;
    };

    location.href = protocolHandler + ':ofe%7Cu%7C' + url;;
    setTimeout(function () {
      input.onblur = null;
      input.remove();
      if (!protocolHandlerPresent) {
        alert('U gebruikt een versie van Microsoft Office die niet door Alfresco wordt ondersteund. Probeer Microsoft Office bij te werken.');
      }
    }, 2000);
  }


  isWin() {
    return (this.userAgent.indexOf('win') !== -1);
  }

  isMac() {
    return (this.userAgent.indexOf('mac') !== -1);
  }


  getProtocolForFileExtension(fileExtension) {
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

}
