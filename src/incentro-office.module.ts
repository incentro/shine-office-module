import {ModuleWithProviders, NgModule} from '@angular/core';
import {OfficeActionsService} from './office-actions.service';
import {SampleModule} from "../newtester/src";
import {SampleService} from "../newtester/src/sample.service";

@NgModule({
  imports: [],
  exports: [],
  declarations: [],
  providers: [OfficeActionsService],
})
export class IncentroOfficeModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IncentroOfficeModule,
      providers: [OfficeActionsService]
    };
  }
}
