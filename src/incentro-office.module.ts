import {ModuleWithProviders, NgModule} from '@angular/core';
import {OfficeActionsService} from './office-actions.service';

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
