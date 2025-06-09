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

  // PROPRIETES
  categories: { id: number; name: string }[] = [];
  products: any[] = [];
  filteredProducts: any[] = []; // Pour le filtrage dynamique
  username: string = '';
  currentProduct: any = { name: '', stock: 0, categoryId: null };
  selectedCategoryId: number | null = null;
  chart: Chart | undefined;
  modalVisible = false;
  modalMode: 'add' | 'edit' = 'add';
  categoryModalVisible = false;
  isAdmin: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}


  // INITIALISATION DU COMPOSANT
  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.username = sessionStorage.getItem('username') || 'Utilisateur';
      const role = sessionStorage.getItem('role');
      this.isAdmin = role === 'admin';
    } else {
      this.username = 'Utilisateur';
      this.isAdmin = false;
    }

    // Chargement des catégories
    this.http.get<any[]>('http://localhost:5200/api/categories')
      .subscribe({
        next: (data) => {
          this.categories = data;
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
          this.filteredProducts = data;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des produits', err);
        }
      });

    // Chargement de l'évolution d'un produit test (ID 1)

    this.http.get<any[]>('http://localhost:5200/api/mouvements/evolution-global')
      .subscribe({
        next: (data) => {
          const labels = data.map(d => d.date);
          const values = data.map(d => d.stock);
          this.initChart(labels, values);
        },
        error: (err) => {
          console.error('❌ Erreur chargement global', err);
          this.initChart([], []);
        }
      });

  }

  initChart(labels: string[], values: number[]) {
    if (typeof document === 'undefined') return;
    const canvas = document.getElementById('stockChart') as HTMLCanvasElement;
    if (!canvas) {
      console.warn('⚠️ Canvas non trouvé');
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }


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
  // PRODUITS
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
      this.http.post<any>('http://localhost:5200/api/products', product).subscribe(res => {
        // 1. Ajouter l'ID renvoyé par l'API
        product.id = res.id;
        this.products.push(product);
        this.modalVisible = false;

        // 2. Créer un mouvement "IN"
        const mouvement = {
          productId: product.id,
          quantity: product.stock,
          movementType: 'IN'
        };

        this.http.post('http://localhost:5200/api/mouvements', mouvement).subscribe(() => {
          console.log('✅ Mouvement créé pour le produit :', mouvement);

          // 3. Recharger le graphique global après le mouvement
          this.http.get<any[]>('http://localhost:5200/api/mouvements/evolution-global')
            .subscribe({
              next: (data) => {
                console.log('📊 Données globales après ajout :', data);
                const labels = data.map(d => d.date);
                const values = data.map(d => d.stock);
                this.initChart(labels, values);
              },
              error: (err) => {
                console.error('❌ Erreur lors du rechargement du graphique global :', err);
                this.initChart([], []);
              }
            });
        });
      }, err => {
        console.error('❌ Erreur lors de la création du produit', err);
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

  loadStockEvolution(productId: number) {
    this.http.get<any[]>(`http://localhost:5200/api/products/evolution/${productId}`)
      .subscribe({
        next: (data) => {
          console.log('📈 Données produit :', data);
          const labels = data.map(d => d.date);
          const values = data.map(d => d.stock);
          this.initChart(labels, values);
        },
        error: (err) => {
          console.error('Erreur produit', err);
          this.initChart([], []);
        }
      });
  }

//CATEGORIES

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

  onCategoryClick(categoryId: number) {
    this.selectedCategoryId = categoryId;

    // 🔁 Charger les mouvements (graphe)
    this.http.get<any[]>(`http://localhost:5200/api/mouvements/by-category/${categoryId}`)
      .subscribe({
        next: (data) => {
          const grouped: { [date: string]: number } = {};
          data.forEach(entry => {
            const sign = entry.type === 'IN' ? 1 : -1;
            grouped[entry.date] = (grouped[entry.date] || 0) + sign * entry.quantity;
          });

          const sortedDates = Object.keys(grouped).sort();
          let cumul = 0;
          const labels: string[] = [];
          const values: number[] = [];

          sortedDates.forEach(date => {
            cumul += grouped[date];
            labels.push(date);
            values.push(cumul);
          });

          this.initChart(labels, values);
        },
        error: (err) => {
          console.error("Erreur chargement mouvements catégorie", err);
          this.initChart([], []);
        }
      });
  }

  resetCategory() {
    this.selectedCategoryId = null;

    // Recharge graphe global
    this.http.get<any[]>('http://localhost:5200/api/mouvements/evolution-global')
      .subscribe({
        next: (data) => {
          const labels = data.map(d => d.date);
          const values = data.map(d => d.stock);
          this.initChart(labels, values);
        },
        error: () => {
          this.initChart([], []);
        }
      });
  }
  goToAdmin() {
    if (this.isAdmin) {
      this.router.navigate(['/admin']);
    }
  }

// STATISTIQUES

  getOutOfStockCount(): number {
    return this.products.filter(p => p.stock === 0).length;
  }

  // FILTRAGE DYNAMIQUE DES PRODUITS

  get filteredProducts2() {
    if (!this.selectedCategoryId) {
      return this.products;
    }
    return this.products.filter(p => p.categoryId === this.selectedCategoryId);
  }


  // DECONNEXION

  logout() {
    // Supprimer les informations d'authentification
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('role');

    // Rediriger vers la page de connexion
    this.router.navigate(['/login']);
  }









}
