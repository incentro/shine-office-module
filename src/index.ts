import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from "@alfresco/adf-core";
import {OfficeService} from "./office.service";
import {ContentModule} from "@alfresco/adf-content-services";

export * from './office.service';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    ContentModule
  ],
  declarations: [],
  exports: []
})
export class ShineOfficeModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ShineOfficeModule,
      providers: [OfficeService]
    };
  }
}
