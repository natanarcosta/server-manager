import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-log-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="log-viewer" #logContainer>
      <div class="log-line" *ngFor="let line of lines">{{ line }}</div>
      <div class="log-empty" *ngIf="lines.length === 0">No logs available</div>
    </div>
  `,
  styles: [`
    .log-viewer {
      background: #11111b;
      border: 1px solid #313244;
      border-radius: 8px;
      padding: 12px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 12px;
      max-height: 400px;
      overflow-y: auto;
      color: #a6adc8;
    }
    .log-line {
      padding: 2px 0;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .log-empty {
      color: #6c7086;
      text-align: center;
      padding: 20px;
    }
  `]
})
export class LogViewerComponent implements OnChanges, AfterViewChecked {
  @Input() lines: string[] = [];
  @ViewChild('logContainer') logContainer!: ElementRef;
  private shouldScroll = true;

  ngOnChanges(_changes: SimpleChanges): void {
    this.shouldScroll = true;
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.logContainer) {
      const el = this.logContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScroll = false;
    }
  }
}
