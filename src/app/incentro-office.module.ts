import {NgModule} from '@angular/core';
import {OfficeActionsService} from './services/office-actions.service';
import {OfficeLauncherService} from './services/office-launcher.service';

@NgModule({
  imports: [],
  declarations: [],
  providers: [
    OfficeActionsService,
    OfficeLauncherService
  ],
  exports: []
})
export class IncentroOfficeModule {
}
