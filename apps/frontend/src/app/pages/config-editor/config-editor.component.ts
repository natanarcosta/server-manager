import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { ConfigSchema } from '../../models/types';

@Component({
  selector: 'app-config-editor',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatButtonModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatSelectModule, MatSlideToggleModule, MatSnackBarModule,
  ],
  template: `
    <div class="config-page">
      <a [routerLink]="['/servers', serverId]" class="back-link">
        <mat-icon>arrow_back</mat-icon> Back to Server
      </a>
      <h1 class="page-title">Configuration Editor</h1>

      <div class="config-form" *ngIf="schema">
        <div class="form-field" *ngFor="let key of schemaKeys">
          <div *ngIf="schema[key].type === 'string'">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ schema[key].label }}</mat-label>
              <input matInput [(ngModel)]="values[key]" [placeholder]="schema[key].description || ''">
              <mat-hint *ngIf="schema[key].description">{{ schema[key].description }}</mat-hint>
            </mat-form-field>
          </div>

          <div *ngIf="schema[key].type === 'number'">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ schema[key].label }}</mat-label>
              <input matInput type="number"
                [(ngModel)]="values[key]"
                [min]="schema[key].min ?? null"
                [max]="schema[key].max ?? null"
                [placeholder]="schema[key].description || ''">
              <mat-hint *ngIf="schema[key].description">{{ schema[key].description }}</mat-hint>
            </mat-form-field>
          </div>

          <div *ngIf="schema[key].type === 'boolean'" class="toggle-field">
            <mat-slide-toggle [(ngModel)]="values[key]">
              {{ schema[key].label }}
            </mat-slide-toggle>
            <span class="field-hint" *ngIf="schema[key].description">{{ schema[key].description }}</span>
          </div>

          <div *ngIf="schema[key].type === 'select'">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>{{ schema[key].label }}</mat-label>
              <mat-select [(ngModel)]="values[key]">
                <mat-option *ngFor="let opt of schema[key].options" [value]="opt">
                  {{ opt }}
                </mat-option>
              </mat-select>
              <mat-hint *ngIf="schema[key].description">{{ schema[key].description }}</mat-hint>
            </mat-form-field>
          </div>
        </div>

        <div class="form-actions">
          <button mat-raised-button color="primary" (click)="save()" [disabled]="saving">
            <mat-icon>save</mat-icon> {{ saving ? 'Saving...' : 'Save Configuration' }}
          </button>
        </div>
      </div>

      <div class="loading" *ngIf="!schema">Loading configuration...</div>
    </div>
  `,
  styles: [`
    .config-page { padding: 24px; max-width: 800px; }
    .back-link { display: flex; align-items: center; gap: 4px; color: #a6adc8; text-decoration: none; margin-bottom: 16px; font-size: 14px; }
    .back-link:hover { color: #cdd6f4; }
    .page-title { font-size: 24px; font-weight: 700; color: #cdd6f4; margin-bottom: 24px; }
    .config-form { display: flex; flex-direction: column; gap: 16px; }
    .form-field { }
    .full-width { width: 100%; }
    .toggle-field { display: flex; flex-direction: column; gap: 4px; padding: 12px 0; }
    .field-hint { font-size: 12px; color: #6c7086; }
    .form-actions { display: flex; justify-content: flex-end; margin-top: 16px; }
    .loading { text-align: center; color: #6c7086; padding: 40px; }
    ::ng-deep .mat-mdc-form-field { color: #cdd6f4; }
    ::ng-deep .mdc-text-field--outlined .mdc-notched-outline__leading,
    ::ng-deep .mdc-text-field--outlined .mdc-notched-outline__notch,
    ::ng-deep .mdc-text-field--outlined .mdc-notched-outline__trailing {
      border-color: #45475a !important;
    }
    ::ng-deep .mat-mdc-input-element { color: #cdd6f4 !important; }
    ::ng-deep .mat-mdc-form-field-hint { color: #6c7086; }
  `]
})
export class ConfigEditorComponent implements OnInit {
  serverId = 0;
  schema: ConfigSchema | null = null;
  schemaKeys: string[] = [];
  values: Record<string, any> = {};
  saving = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.serverId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadConfig();
  }

  loadConfig(): void {
    this.api.getServerConfig(this.serverId).subscribe((res) => {
      this.schema = res.schema;
      this.schemaKeys = Object.keys(res.schema);
      this.values = { ...res.values };

      for (const key of this.schemaKeys) {
        if (this.values[key] === undefined && res.schema[key].defaultValue !== undefined) {
          this.values[key] = res.schema[key].defaultValue;
        }
      }
    });
  }

  save(): void {
    this.saving = true;
    this.api.updateServerConfig(this.serverId, this.values).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Configuration saved', 'OK', { duration: 3000 });
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Failed to save configuration', 'OK', { duration: 3000 });
      },
    });
  }
}
