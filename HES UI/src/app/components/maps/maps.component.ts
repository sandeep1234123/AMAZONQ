import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-maps',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    GoogleMapsModule
  ],
  template: `
    <div class="maps-container">
      <h1>Interactive Maps</h1>
      
      <mat-card>
        <mat-card-header>
          <mat-card-title>Location Overview</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <google-map
            [center]="center()"
            [zoom]="zoom()"
            [options]="options"
            width="100%"
            height="400px">
            
            <map-marker
              *ngFor="let marker of markers()"
              [position]="marker.position"
              [title]="marker.title"
              [options]="marker.options">
            </map-marker>
          </google-map>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .maps-container {
      padding: 20px;
    }
    mat-card {
      margin: 20px 0;
    }
    google-map {
      border-radius: 8px;
      overflow: hidden;
    }
  `]
})
export class MapsComponent implements OnInit {
  center = signal<google.maps.LatLngLiteral>({ lat: 40.7128, lng: -74.0060 });
  zoom = signal(10);
  
  options: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    maxZoom: 20,
    minZoom: 4,
  };

  markers = signal([
    {
      position: { lat: 40.7128, lng: -74.0060 },
      title: 'New York City',
      options: {
        animation: google.maps.Animation.DROP,
      }
    },
    {
      position: { lat: 40.7589, lng: -73.9851 },
      title: 'Times Square',
      options: {
        animation: google.maps.Animation.DROP,
      }
    }
  ]);

  ngOnInit(): void {
    // Initialize map if needed
  }
}