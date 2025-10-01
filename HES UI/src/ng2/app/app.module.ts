import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, UrlHandlingStrategy } from '@angular/router';
import { UpgradeModule } from '@angular/upgrade/static';
import { AppComponent } from './app.component';
import { AgmCoreModule } from '@agm/core';
declare var angular: any;

export class CustomHandlingStrategy implements UrlHandlingStrategy {
  shouldProcessUrl(url) {
    return url.toString().startsWith('/hes') || url.toString() === '/';
  }
  extract(url) {
    return url; }
  merge(url, whole) {
    return url; }
}

angular.module('myApp')
@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AgmCoreModule.forRoot({
      libraries: ['places'],
      apiKey: 'AIzaSyBKEaXzFCW5XFpDbZ0-DaTOMjrIsWsXHIw'
    }),
    BrowserModule,
    UpgradeModule,
    RouterModule.forRoot([
      {
        path: 'hes',
        pathMatch: 'full',
        redirectTo: 'ng2-route'
      },
    ],
    {
      useHash: true,
      enableTracing: true
    }
    )
  ],
  entryComponents: [
  ],
  providers: [
    { provide: UrlHandlingStrategy, useClass: CustomHandlingStrategy }
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}

