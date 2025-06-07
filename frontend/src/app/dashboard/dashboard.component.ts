import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { ProductModalComponent } from '../components/product-modal/product-modal.component';
import { CategoryModalComponent } from '../components/category-modal/category-modal.component';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ProductModalComponent, CategoryModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  chart: Chart | undefined;
  categories: { id: number; name: string }[] = [];
  products: any[] = [];
  username: string = '';
  currentProduct: any = { name: '', stock: 0, categoryId: null };
  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    // Récupérer le nom d'utilisateur du localStorage
    if (typeof window !== 'undefined') {
      this.username = localStorage.getItem('username') || 'Utilisateur';
    } else {
      this.username = 'Utilisateur';
    }


    // Chargement des catégories
    this.http.get<any[]>('http://localhost:5200/api/categories')
      .subscribe({
        next: (data) => {
          this.categories = data;
          console.log('Catégories récupérées :', this.categories);
        },
        error: (err) => {
          console.error('Erreur lors du chargement des catégories', err);
        }
      });
    // Chargement des produits
    this.http.get<any[]>('http://localhost:5200/api/products')
      .subscribe({
        next: (data) => {
          this.products = data;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des produits', err);
        }
      });

    // Chargement de l'évolution d'un produit test (ID 1)
    const productId = 1;

    this.http.get<any[]>(`http://localhost:5200/api/products/evolution/${productId}`)
      .subscribe({
        next: (data) => {
          const labels = data.map(d => d.date);
          const values = data.map(d => d.stock);
          this.initChart(labels, values);
        },
        error: (err) => {
          console.error('Erreur lors du chargement de l\'évolution du stock', err);
          // Créer un graphique vide en cas d'erreur
          this.initChart([], []);
        }
      });
  }

  initChart(labels: string[], values: number[]) {
    if (typeof document === 'undefined') return;
    const canvas = document.getElementById('stockChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Stock cumulé',
          data: values,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          tension: 0.3,
          fill: true,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  logout() {
    // Supprimer les informations d'authentification
    localStorage.removeItem('username');
    localStorage.removeItem('role');

    // Rediriger vers la page de connexion
    this.router.navigate(['/login']);
  }
  getOutOfStockCount(): number {
    return this.products.filter(p => p.stock === 0).length;
  }
  modalVisible = false;
  modalMode: 'add' | 'edit' = 'add';



  openModal(mode: 'add' | 'edit', product: any = { name: '', stock: 0 }) {
    this.modalMode = mode;
    this.currentProduct = { ...product };
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
  }

  saveProduct(product: any) {
    if (this.modalMode === 'add') {
      console.log('Produit envoyé :', JSON.stringify(product));


      this.http.post('http://localhost:5200/api/products', product).subscribe(() => {
        this.products.push(product);
        this.modalVisible = false;
      });
    } else {
      const index = this.products.findIndex(p => p.name === this.currentProduct.name);
      if (index > -1) {
        this.products[index] = product;
      }
      this.modalVisible = false;
    }
  }


  deleteProduct(product: any) {
    // TODO : remplacer par un vrai appel DELETE
    this.products = this.products.filter(p => p.name !== product.name);
  }
  categoryModalVisible = false;
  newCategoryName = '';

  openCategoryModal() {
    this.categoryModalVisible = true;
  }

  closeCategoryModal() {
    this.categoryModalVisible = false;
  }

  saveCategory(name: string) {
    this.http.post('http://localhost:5200/api/categories', { name }).subscribe(() => {
      this.categories.push({ id: this.categories.length + 1, name }); // 🔁 tu peux recharger depuis l'API si besoin
      this.categoryModalVisible = false;
    });
  }

}
