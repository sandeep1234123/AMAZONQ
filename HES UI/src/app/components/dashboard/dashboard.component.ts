import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface DashboardCard {
  title: string;
  value: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      
      <mat-grid-list cols="4" rowHeight="200px" gutterSize="16">
        <mat-grid-tile *ngFor="let card of cards()">
          <mat-card class="dashboard-card" [ngClass]="card.color">
            <mat-card-header>
              <mat-icon mat-card-avatar>{{card.icon}}</mat-icon>
              <mat-card-title>{{card.title}}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="card-value">{{card.value}}</div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>
      </mat-grid-list>

      <mat-card class="recent-activity">
        <mat-card-header>
          <mat-card-title>Recent Activity</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>No recent activity to display.</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button color="primary">VIEW ALL</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }
    .dashboard-card {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .card-value {
      font-size: 2em;
      font-weight: bold;
      text-align: center;
      margin-top: 10px;
    }
    .primary { background-color: #3f51b5; color: white; }
    .accent { background-color: #ff4081; color: white; }
    .warn { background-color: #f44336; color: white; }
    .success { background-color: #4caf50; color: white; }
    .recent-activity {
      margin-top: 20px;
    }
    @media (max-width: 768px) {
      mat-grid-list {
        cols: 2 !important;
      }
    }
    @media (max-width: 480px) {
      mat-grid-list {
        cols: 1 !important;
      }
    }
  `]
})
export class DashboardComponent {
  cards = signal<DashboardCard[]>([
    { title: 'Total Users', value: '1,234', icon: 'people', color: 'primary' },
    { title: 'Revenue', value: '$45,678', icon: 'attach_money', color: 'success' },
    { title: 'Orders', value: '567', icon: 'shopping_cart', color: 'accent' },
    { title: 'Issues', value: '12', icon: 'warning', color: 'warn' }
  ]);
}