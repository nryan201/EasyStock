import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { ProductModalComponent } from '../components/product-modal/product-modal.component';
import { CategoryModalComponent } from '../components/category-modal/category-modal.component';
import { PasswordCheckModalComponent } from '../components/app-password-check-modal/app-password-check-modal.component';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ProductModalComponent, CategoryModalComponent, PasswordCheckModalComponent],
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
  productToDelete: any = null;
  passwordModalVisible = false;
  actionAfterPassword: 'edit' | 'delete' | null = null;



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
      // ➤ Ajout d’un nouveau produit
      this.http.post<any>('http://localhost:5200/api/products', product).subscribe(res => {
        product.id = res.id;
        this.products.push(product);
        this.modalVisible = false;

        // ➤ Créer un mouvement initial
        const mouvement = {
          productId: product.id,
          quantity: product.stock,
          movementType: 'IN'
        };

        this.http.post('http://localhost:5200/api/mouvements', mouvement).subscribe(() => {
          console.log('✅ Mouvement créé pour le produit :', mouvement);
          this.refreshChart(); // 🔄 met à jour le graphe global
        });
      }, err => {
        console.error('❌ Erreur lors de la création du produit', err);
      });

    } else {
      // ➤ Modification du produit existant
      const index = this.products.findIndex(p => p.id === product.id);
      const ancienStock = this.products[index]?.stock ?? 0;
      const difference = product.stock - ancienStock;

      this.http.put(`http://localhost:5200/api/products/${product.id}`, product).subscribe({
        next: () => {
          if (index > -1) {
            this.products[index] = product;
          }
          this.modalVisible = false;

          if (difference !== 0) {
            const mouvement = {
              productId: product.id,
              quantity: Math.abs(difference),
              movementType: difference > 0 ? 'IN' : 'OUT'
            };

            this.http.post('http://localhost:5200/api/mouvements', mouvement).subscribe(() => {
              console.log('🔁 Mouvement enregistré pour modification de stock');
              this.refreshChart(); // 🔄 recharge graphe global
            });
          } else {
            this.refreshChart(); // 🔄 juste recharger si stock identique
          }
        },
        error: (err) => {
          console.error('❌ Erreur lors de la modification du produit', err);
        }
      });
    }
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
    this.router.navigate(['/home']);
  }
  get isModeratorOrAdmin(): boolean {
    const role = sessionStorage.getItem('role');
    return role === 'admin' || role === 'moderator';
  }
  confirmDelete(product: any) {
    if (!product || !product.id) {
      console.error("❌ Produit invalide :", product);
      return;
    }

    console.log("🛑 Demande de suppression pour :", product);

    this.productToDelete = product;
    this.actionAfterPassword = 'delete'; // 🔥 C’était peut-être oublié ici
    this.passwordModalVisible = true;
  }

  handlePasswordConfirmed(adminPassword: string) {
    if (!this.productToDelete || !this.actionAfterPassword) {
      console.warn("❌ Aucune action ou produit à traiter.");
      return;
    }

    const action = this.actionAfterPassword;
    const product = this.productToDelete;

    console.log("🔐 Action demandée :", action);
    console.log("🔐 Produit ciblé :", product);
    console.log("🔐 Mot de passe entré :", adminPassword);

    if (action === 'delete') {
      console.log("➡️ Création du mouvement OUT pour suppression...");

      const mouvement = {
        productId: product.id,
        quantity: product.stock,
        movementType: 'OUT'
      };

      this.http.post('http://localhost:5200/api/mouvements', mouvement).subscribe({
        next: () => {
          console.log("✅ Mouvement OUT créé :", mouvement);

          console.log("➡️ Envoi de la requête de suppression avec mot de passe...");
          this.http.post('http://localhost:5200/api/products/delete-with-password', {
            productId: product.id,
            adminPassword
          }).subscribe({
            next: () => {
              console.log("🗑️ Produit supprimé avec succès :", product.name);

              this.products = this.products.filter(p => p.id !== product.id);
              console.log("📦 Liste des produits mise à jour :", this.products);

              this.refreshChart();
              console.log("📊 Graphique mis à jour.");

              this.resetPasswordModalState();
              console.log("✅ État du modal réinitialisé.");
            },
            error: (err) => {
              console.error("❌ Erreur lors de la suppression :", err);
              alert("Mot de passe incorrect ou erreur lors de la suppression.");
            }
          });
        },
        error: (err) => {
          console.error("❌ Erreur lors de la création du mouvement OUT :", err);
          alert("Erreur lors de la création du mouvement OUT.");
        }
      });
    }

    if (action === 'edit') {
      console.log("✏️ Ouverture du modal de modification après validation du mot de passe...");
      this.resetPasswordModalState();
      this.openModal('edit', product);
    }
  }



  refreshChart() {
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

  resetPasswordModalState() {
    this.passwordModalVisible = false;
    this.productToDelete = null;
    this.actionAfterPassword = null;
  }
  confirmEdit(product: any) {
    this.productToDelete = product; // on peut renommer en productToEdit si tu préfères
    this.passwordModalVisible = true;
    this.actionAfterPassword = 'edit';
  }









}
