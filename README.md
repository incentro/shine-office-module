# OfficeActionsService

This module is created for the Alfresco ADF and will not work without ADF.


## Usage

Install via npm.

```bash
npm install --save incentro-adf-office-module
```

Include the module in your angular module
```typescript
@NgModule({
  imports: [
    IncentroOfficeModule,
    ...
  ]
})
```

To use the service add it to your component and call the function with a MinimalNodeEntry and the ECM Host.
```typescript
@Component(...)
export class ExampleComponent {
  constructor(private officeActionsService: OfficeActionsService,
              private appConfigService: AppConfigService) {
    
  }
  
  openInOffice(event) {
    const ecmHost = this.appConfigService.get('ecmHost');
    this.officeActionsService.editOnline(event.value.entry, ecmHost);
  }
}
```
