# shine-office-module

> **WARNING:** Version 7.X is *not* backwards compatible with any version below.

## Installation

To install this library, run:

```bash
$ npm install shine-office-module --save
```

## Consuming your library

Once you have published your library to npm, you can import your library in any Angular application by running:

```bash
$ npm install shine-office-module
```

and then from your Angular `AppModule`:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

// Import your library
import { OfficeModule } from 'shine-office-module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,

    // Specify your library as an import
    OfficeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Once your library is imported, you can use its components, directives and pipes in your Angular application:

```typescript
import {OfficeService} from 'office.service.ts';

@Component({...})
export class MyComponent {
  
  constructor(private officeService: OfficeService)
  
  openFile(entry: NodeMinimal) {
    this.officeService.view(entry);
    this.officeService.edit(entry);
  }
}
```

## API

| call  |   |   |   |   |
|---|---|---|---|---|
| view()  |   |   |   |   |
| edit()  |   |   |   |   |
|   |   |   |   |   |

## Development

To generate all `*.js`, `*.d.ts` and `*.metadata.json` files:

```bash
$ npm run build
```

To lint all `*.ts` files:

```bash
$ npm run lint
```

## License

MIT © [Kasper Reijnders](mailto:kasper.reijnders@incentro.com)
