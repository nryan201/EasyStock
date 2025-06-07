import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-modal.component.html',
  styleUrls: ['./category-modal.component.scss']
})
export class CategoryModalComponent implements AfterViewInit {
  @Input() visible = false;
  @Output() save = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();
  @ViewChild('categoryInput') categoryInput!: ElementRef;

  categoryName: string = '';

  ngAfterViewInit() {
    // Focus automatique sur l'input quand la modal s'ouvre
    if (this.visible && this.categoryInput) {
      setTimeout(() => {
        this.categoryInput.nativeElement.focus();
      }, 100);
    }
  }

  onSubmit() {
    if (this.categoryName.trim()) {
      this.save.emit(this.categoryName.trim());
      this.categoryName = '';
    }
  }

  onCancel() {
    this.close.emit();
    this.categoryName = '';
  }

  onBackdropClick(event: Event) {
    // Fermer la modal si on clique sur le backdrop
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
