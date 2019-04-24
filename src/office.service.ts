import {Injectable} from "@angular/core";
import {NodeMinimal} from "@alfresco/adf-content-services";
import {Observable, Subject, throwError} from "rxjs";
import {AppConfigService} from "@alfresco/adf-core";

@Injectable()
export class OfficeService {

  static DEFAULT_TIMEOUT = 2000;

  static OPTIONS = {
    VIEW: 'ofv',
    EDIT: 'ofe',
    NEW_FROM_TEMPLATE: 'nft'
  };

  timeout = OfficeService.DEFAULT_TIMEOUT;
  userAgent = navigator.userAgent.toLowerCase();
  ecmHost;

  constructor(private appConfigService: AppConfigService) {
  }

  view(entry: NodeMinimal, timeout: number): Observable<any> {
    this.timeout = timeout || OfficeService.DEFAULT_TIMEOUT;

    return this.open(entry, OfficeService.OPTIONS.VIEW);
  }

  edit(entry: NodeMinimal, timeout: number): Observable<any> {
    this.timeout = timeout || OfficeService.DEFAULT_TIMEOUT;

    return this.open(entry, OfficeService.OPTIONS.EDIT);
  }

  private open(entry, option): Observable<any> {
    this.ecmHost = this.appConfigService.get('ecmHost');
    const url = this.getUrl(entry);
    if (!this.isCompatible()) {
      return throwError({messageKey: 'OFFICE.WINDOWS_MAC_ONLY'});
    }

    const protocol = this.getProtocol(entry);
    return this.launchMsOfficeProtocolHandler(protocol, url, option);
  }

  private launchMsOfficeProtocolHandler(protocolHandler, url, option): Observable<any> {
    let protocolHandlerPresent = false;
    const input = document.createElement('input');
    const inputTop = document.body.scrollTop + 10;
    const obs = new Subject<any>();

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

    location.href = `${protocolHandler}:${option}%7Cu%7C${url}`;

    if (this.timeout > 0) {
      setTimeout(() => {
        input.onblur = null;
        input.remove();
        if (!protocolHandlerPresent) {
          obs.error({messageKey: 'OFFICE.TIMEOUT'});
        } else {
          obs.next({messageKey: 'OFFICE.DOCUMENT_OPENED'});
        }
        obs.complete();
      }, this.timeout);
    }

    return obs.asObservable();
  }

  private isCompatible() {
    return (this.isWin() || this.isMac());
  }

  private isWin() {
    return (this.userAgent.indexOf('win') !== -1);
  }

  private isMac() {
    return (this.userAgent.indexOf('mac') !== -1);
  }


  private getPath(path, name) {
    let filepath = path.name;
    const position = filepath.split('/', 2).join('/').length;
    return filepath.slice(position) + '/' + name;
  }

  private getUrl(entry: NodeMinimal) {
    const filepath = this.getPath(entry.path, entry.name);

    return this.ecmHost + '/alfresco/aos' + filepath;
  }

  private getProtocol(entry: NodeMinimal) {
    return DocumentTypes.getProtocolByMimeType(entry.content.mimeType);
  }
}

interface DocumentMimeType {
  extensions: string[];
  mimeTypes: string[];
  protocol: string;
}

class DocumentTypes {
  static types: DocumentMimeType[] = [
    {
      extensions: [
        'doc',
        'docx',
        'docm',
        'dot',
        'dotx',
        'dotm'
      ],
      mimeTypes: [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-word.document.macroEnabled.12',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
        'application/vnd.ms-word.template.macroEnabled.12'
      ],
      protocol: 'ms-word'
    },
    {
      extensions: [
        'xls',
        'xlsx',
        'xlsb',
        'xlsm',
        'xlt',
        'xltx',
        'xltm'
      ],
      mimeTypes: [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
        'application/vnd.ms-excel.sheet.macroEnabled.12',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
        'application/vnd.ms-excel.template.macroEnabled.12'
      ],
      protocol: 'ms-excel'
    },
    {
      extensions: [
        'ppt',
        'pptx',
        'pot',
        'potx',
        'potm',
        'pptm',
        'pps',
        'ppsx',
        'ppam',
        'ppsm',
        'sldx',
        'sldm'
      ],
      mimeTypes: [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.openxmlformats-officedocument.presentationml.template',
        'application/vnd.ms-powerpoint.template.macroEnabled.12',
        'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
        'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
        'application/vnd.ms-powerpoint.addin.macroEnabled.12',
        'application/vnd.ms-powerpoint.slideshow.macroEnabled.12',
        'application/vnd.openxmlformats-officedocument.presentationml.slide',
        'application/vnd.ms-powerpoint.slide.macroenabled.12'
      ],
      protocol: 'ms-powerpoint'
    },
    {
      extensions: [
        'vsd',
        'vdw',
        'vsdm',
        'vsdx',
        'vss',
        'vssm',
        'vssx',
        'vst',
        'vstm',
        'vstx'
      ],
      mimeTypes: [
        'application/vnd.visio',
        'application/vnd.ms-visio.drawing.macroEnabled',
        'application/vnd.visio2013',
        'application/vnd.ms-visio.stencil.macroEnabled',
        'application/vnd.ms-visio.stencil',
        'application/vnd.ms-visio.template.macroEnabled',
        'application/vnd.ms-visio.template'
      ],
      protocol: 'ms-visio'
    },
    {
      extensions: [
        'mpp',
        'mpt'
      ],
      mimeTypes: [
        'application/vnd.ms-project'
      ],
      protocol: 'ms-project'
    }
  ];


  static getProtocolByMimeType(mimeType: string) {
    let protocol = '';
    DocumentTypes.types.forEach(type => {
      if (type.mimeTypes.indexOf(mimeType) > -1) {
        protocol = type.protocol;
      }
    });
    return protocol;
  }

  static getProtocolByExtension(extension: string) {
    let protocol = '';
    DocumentTypes.types.forEach(type => {
      if (type.extensions.indexOf(extension) > -1) {
        protocol = type.protocol;
      }
    });
    return protocol;
  }
}
