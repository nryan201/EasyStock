import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  id?: number;
  name: string;
  stock: number;
  categoryId: number | null;
}

@Component({
  selector: 'app-product-modal',
  standalone: true,
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class ProductModalComponent implements AfterViewInit {
  @Input() visible = false;
  @Input() product: Product = { name: '', stock: 0, categoryId: null };
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() categories: { id: number; name: string }[] = [];
  @Input() allProducts: Product[] = [];

  @Output() save = new EventEmitter<Product>();
  @Output() close = new EventEmitter<void>();
  @ViewChild('nameInput') nameInput!: ElementRef;

  errorMessage: string = '';

  ngAfterViewInit() {
    if (this.visible && this.nameInput) {
      setTimeout(() => {
        this.nameInput.nativeElement.focus();
      }, 100);
    }
  }

  onSubmit() {
    const nameExists = this.allProducts.some(p =>
      p.name.trim().toLowerCase() === this.product.name.trim().toLowerCase() &&
      p.id !== this.product.id
    );

    if (nameExists) {
      this.errorMessage = '❌ Ce nom de produit existe déjà.';
      return;
    }

    this.errorMessage = '';
    this.save.emit({ ...this.product });
  }

  onCancel() {
    this.errorMessage = '';
    this.close.emit();
  }

  onBackdropClick(event: Event) {
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
