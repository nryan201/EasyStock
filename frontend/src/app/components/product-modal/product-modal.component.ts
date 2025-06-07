import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class ProductModalComponent implements AfterViewInit {
  @Input() visible = false;
  @Input() product = { name: '', stock: 0, categoryId: null };
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() categories: { id: number; name: string }[] = [];

  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();
  @ViewChild('nameInput') nameInput!: ElementRef;

  ngAfterViewInit() {
    // Focus automatique sur l'input nom quand la modal s'ouvre
    if (this.visible && this.nameInput) {
      setTimeout(() => {
        this.nameInput.nativeElement.focus();
      }, 100);
    }
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.save.emit({ ...this.product });
    }
  }

  onCancel() {
    this.close.emit();
  }

  onBackdropClick(event: Event) {
    // Fermer la modal si on clique sur le backdrop
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  isFormValid(): boolean {
    return !!(
      this.product.name?.trim() &&
      this.product.stock >= 0 &&
      this.product.categoryId
    );
  }
}
