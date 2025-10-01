import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { NgChartsModule } from 'ng2-charts';
import { NgxChartsModule, ColorHelper } from '@swimlane/ngx-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    NgChartsModule,
    NgxChartsModule
  ],
  template: `
    <div class="charts-container">
      <h1>Charts & Analytics</h1>
      
      <mat-tab-group>
        <mat-tab label="Line Charts">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Sales Trend</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart
                [data]="lineChartData"
                [options]="lineChartOptions"
                [type]="lineChartType">
              </canvas>
            </mat-card-content>
          </mat-card>
        </mat-tab>

        <mat-tab label="Bar Charts">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Monthly Revenue</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <ngx-charts-bar-vertical
                [results]="barChartData()"
                [xAxis]="true"
                [yAxis]="true"
                [showXAxisLabel]="true"
                [showYAxisLabel]="true"
                xAxisLabel="Month"
                yAxisLabel="Revenue">
              </ngx-charts-bar-vertical>
            </mat-card-content>
          </mat-card>
        </mat-tab>

        <mat-tab label="Pie Charts">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Market Share</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <ngx-charts-pie-chart
                [results]="pieChartData()"
                [legend]="true"
                [labels]="true">
              </ngx-charts-pie-chart>
            </mat-card-content>
          </mat-card>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .charts-container {
      padding: 20px;
    }
    mat-card {
      margin: 20px 0;
      height: 500px;
    }
    mat-card-content {
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class ChartsComponent implements OnInit {
  // Chart.js Line Chart
  lineChartType: ChartType = 'line';
  lineChartData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [65, 59, 80, 81, 56, 55],
        label: 'Sales',
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ]
  };
  
  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      }
    }
  };

  // NGX Charts data
  barChartData = signal([
    { name: 'Jan', value: 8940000 },
    { name: 'Feb', value: 5000000 },
    { name: 'Mar', value: 7200000 },
    { name: 'Apr', value: 6200000 },
    { name: 'May', value: 9500000 },
    { name: 'Jun', value: 8100000 }
  ]);

  pieChartData = signal([
    { name: 'Product A', value: 40 },
    { name: 'Product B', value: 25 },
    { name: 'Product C', value: 20 },
    { name: 'Product D', value: 15 }
  ]);

  colorScheme: any = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  ngOnInit(): void {
    // Initialize charts if needed
  }
}