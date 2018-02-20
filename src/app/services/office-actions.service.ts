import {OfficeLauncherService} from './office-launcher.service';
import {Injectable} from '@angular/core';


/**
 * OfficeActionsService uses the Alfresco Office Services link to open documents.
 */

@Injectable()
export class OfficeActionsService extends OfficeLauncherService {

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

    // if we have a working PlugIn (ActiveX or NPAPI), use it. Otherwise we use the protocol handler (e.g. Chrome w/o PlugIn)
    if (this.isAvailable()) {
      this.launchOfficeByPlugin(this, onlineEditUrlAos);
    } else {
      this.tryToLaunchOfficeByMsProtocolHandler(this, protocolHandler, onlineEditUrlAos);
    }
  }

  private launchOfficeByPlugin(officeLauncher, url) {
    let checker;
    let isNotIE = (officeLauncher.isFirefox() || officeLauncher.isChrome() || officeLauncher.isSafari());
    if (!officeLauncher.EditDocument(url)) {
      // check if the Plug-In has been blocked
      if (officeLauncher.isControlNotActivated() && isNotIE) {
        checker = window.setInterval(function () {
          if (officeLauncher.isControlActivated()) {
            window.clearInterval(checker);
            window.setTimeout(function () {
              if (!officeLauncher.EditDocument(url) && officeLauncher.getLastControlResult() !== -2) {
                let errorDetails = officeLauncher.getLastControlResult() !== false ? ' (Error code: ' + officeLauncher.getLastControlResult() + ')' : '';
                alert('Microsoft Office kan niet worden geopend.' + errorDetails);
              }
            }, 50);
          }
        }, 250);

        let messageKey = '';
        if (officeLauncher.isFirefox()) {
          messageKey = 'Klik op de werkbalk van Firefox om door te gaan.';
        } else if (officeLauncher.isChrome()) {
          messageKey = 'Klik op de blokkeringsindicator in de adresbalk van Chrome om door te gaan.';
        } else if (officeLauncher.isSafari()) {
          messageKey = 'Klik op Vertrouwen om door te gaan.';
        }
        alert(messageKey);
      } else {
        if (officeLauncher.getLastControlResult() !== -2) {
          // error message only required if user did not cancel (result === -2)
          let errorDetails = officeLauncher.getLastControlResult() !== false ? ' (Error code: ' + officeLauncher.getLastControlResult() + ')' : '';
          alert('Microsoft Office kan niet worden geopend. ' + errorDetails);
        }
      }
    } else {
      console.log('refresh');
    }
  }

  private tryToLaunchOfficeByMsProtocolHandler(officeLauncher, protocolHandler, url) {
    let protocolUrl = protocolHandler + ':ofe%7Cu%7C' + url;
    let protocolHandlerPresent = false;
    let input = document.createElement('input');
    let inputTop = document.body.scrollTop + 10;

    input.setAttribute('style', 'z-index: 1000; background-color: rgba(0, 0, 0, 0); border: none; outline: none; position: absolute; left: 10px; top: ' + inputTop + 'px;');
    document.getElementsByTagName('body')[0].appendChild(input);
    input.focus();
    input.onblur = function () {
      protocolHandlerPresent = true;
    };

    location.href = protocolUrl;
    setTimeout(function () {
      input.onblur = null;
      input.remove();
      if (!protocolHandlerPresent) {
        alert('U gebruikt een versie van Microsoft Office die niet door Alfresco wordt ondersteund. Probeer Microsoft Office bij te werken.');
      }
    }, 500);
  }

  private getProtocolForFileExtension(fileExtension) {
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
