import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-add-server-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <div class="title-left">
        <div class="title-icon">
          <mat-icon>dns</mat-icon>
        </div>
        <div class="title-text">
          <div class="title">Add server</div>
          <div class="subtitle">Register an existing dedicated server install</div>
        </div>
      </div>
      <button mat-icon-button class="close-btn" (click)="close()" aria-label="Close">
        <mat-icon>close</mat-icon>
      </button>
    </h2>

    <div mat-dialog-content class="dialog-content">
      <form [formGroup]="form" class="form">
        <div class="grid grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" placeholder="My Palworld Server">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Game</mat-label>
            <mat-select formControlName="game">
              <mat-option value="palworld">Palworld</mat-option>
              <mat-option value="enshrouded">Enshrouded</mat-option>
              <mat-option value="windrose">Windrose</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Install path</mat-label>
          <input matInput formControlName="path" placeholder="C:\\servers\\palworld">
        </mat-form-field>

        <div class="grid grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Exe path</mat-label>
            <input matInput formControlName="exePath" placeholder="C:\\servers\\palworld\\PalServer.exe">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Config path</mat-label>
            <input matInput formControlName="configPath" placeholder="C:\\servers\\palworld\\Pal\\Saved\\Config\\WindowsServer\\PalWorldSettings.ini">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Save path</mat-label>
          <input matInput formControlName="savePath" placeholder="C:\\servers\\palworld\\Pal\\Saved">
        </mat-form-field>

        <div class="grid grid-3">
          <mat-form-field appearance="outline">
            <mat-label>Steam App ID</mat-label>
            <input matInput formControlName="steamAppId" placeholder="2394010">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Game port</mat-label>
            <input matInput type="number" formControlName="gamePort" placeholder="8211">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Query port</mat-label>
            <input matInput type="number" formControlName="queryPort" placeholder="27015">
          </mat-form-field>
        </div>
      </form>
    </div>

    <div mat-dialog-actions align="end" class="actions">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid || saving">
        <mat-icon *ngIf="saving">hourglass_top</mat-icon>
        <span>{{ saving ? 'Saving...' : 'Create' }}</span>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    :host ::ng-deep .add-server-dialog-panel .mat-mdc-dialog-container {
      --mdc-dialog-container-color: #1e1e2e;
      --mdc-dialog-subhead-color: #cdd6f4;
      --mdc-dialog-supporting-text-color: #a6adc8;
    }

    :host ::ng-deep .add-server-dialog-panel .mat-mdc-dialog-surface {
      background: #1e1e2e;
      border: 1px solid #313244;
      border-radius: 14px;
      box-shadow: 0 18px 60px rgba(0, 0, 0, 0.55);
      overflow: hidden;
    }

    :host ::ng-deep .add-server-dialog-panel .mdc-dialog__title,
    :host ::ng-deep .add-server-dialog-panel .mdc-dialog__content,
    :host ::ng-deep .add-server-dialog-panel .mdc-dialog__actions {
      color: #cdd6f4;
    }

    .dialog-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 18px 20px 10px;
      border-bottom: 1px solid #313244;
      width: 100%;
      box-sizing: border-box;
    }

    .title-left { display: flex; align-items: center; gap: 12px; }
    .title-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(59, 130, 246, 0.18);
      border: 1px solid rgba(59, 130, 246, 0.35);
      display: grid;
      place-items: center;
      color: #89b4fa;
    }
    .title-icon mat-icon { width: 22px; height: 22px; font-size: 22px; }
    .title { font-size: 16px; font-weight: 700; color: #cdd6f4; line-height: 1.2; }
    .subtitle { font-size: 12px; color: #a6adc8; margin-top: 2px; }

    .close-btn {
      color: #a6adc8;
    }

    .dialog-content {
      width: min(920px, calc(100vw - 48px));
      max-height: calc(100vh - 220px);
      overflow: auto;
      padding: 16px 20px;
      box-sizing: border-box;
    }

    .form { display: flex; flex-direction: column; gap: 12px; }

    .grid { display: grid; gap: 12px; align-items: start; }
    .grid-2 { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
    .grid-3 { grid-template-columns: minmax(200px, 1.2fr) minmax(160px, 1fr) minmax(160px, 1fr); }

    mat-form-field { width: 100%; }

    @media (max-width: 820px) {
      .grid-2, .grid-3 { grid-template-columns: 1fr; }
      .dialog-content { width: min(720px, calc(100vw - 24px)); padding: 14px 16px; }
      .dialog-title { padding: 16px 16px 10px; }
    }

    .actions {
      padding: 8px 20px 16px;
      border-top: 1px solid #313244;
    }

    :host ::ng-deep .add-server-dialog-panel .mat-mdc-button,
    :host ::ng-deep .add-server-dialog-panel .mat-mdc-raised-button {
      border-radius: 10px;
    }

    :host ::ng-deep .mdc-text-field--outlined .mdc-notched-outline__leading,
    :host ::ng-deep .mdc-text-field--outlined .mdc-notched-outline__notch,
    :host ::ng-deep .mdc-text-field--outlined .mdc-notched-outline__trailing {
      border-color: #45475a !important;
    }

    :host ::ng-deep .mdc-floating-label {
      font-size: 12px;
      max-width: calc(100% - 24px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    :host ::ng-deep .mat-mdc-input-element { color: #cdd6f4 !important; }
    :host ::ng-deep .mat-mdc-select-value { color: #cdd6f4 !important; }
    :host ::ng-deep .mat-mdc-form-field-label { color: #a6adc8 !important; }
    :host ::ng-deep .mat-mdc-select-arrow { color: #a6adc8 !important; }

    :host ::ng-deep .mat-mdc-form-field-hint,
    :host ::ng-deep .mat-mdc-form-field-error {
      color: #a6adc8;
    }

    :host ::ng-deep .mat-mdc-dialog-title {
      padding: 0;
      margin: 0;
    }
  `],
})
export class AddServerDialogComponent {
  saving = false;

  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private dialogRef = inject(MatDialogRef<AddServerDialogComponent>);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    game: ['palworld', [Validators.required]],
    path: ['', [Validators.required]],
    exePath: ['', [Validators.required]],
    configPath: ['', [Validators.required]],
    savePath: ['', [Validators.required]],
    steamAppId: ['', [Validators.required]],
    queryPort: [27015, [Validators.required, Validators.min(1)]],
    gamePort: [8211, [Validators.required, Validators.min(1)]],
  });

  close(): void {
    this.dialogRef.close(null);
  }

  save(): void {
    if (this.form.invalid || this.saving) return;

    this.saving = true;
    const value = this.form.getRawValue();

    this.api.createServer({
      name: value.name!,
      game: value.game!,
      path: value.path!,
      exePath: value.exePath!,
      configPath: value.configPath!,
      savePath: value.savePath!,
      steamAppId: value.steamAppId!,
      queryPort: Number(value.queryPort),
      gamePort: Number(value.gamePort),
    }).subscribe({
      next: (created) => {
        this.saving = false;
        this.dialogRef.close(created);
      },
      error: () => {
        this.saving = false;
      },
    });
  }
}
