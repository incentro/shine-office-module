import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfficeActionsService } from './office-actions.service';

export * from './office-actions.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
  ],
  exports: [
  ]
})
export class IncentroOfficeModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IncentroOfficeModule,
      providers: [OfficeActionsService]
    };
  }
}
