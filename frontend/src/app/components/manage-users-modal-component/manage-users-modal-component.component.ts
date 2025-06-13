import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

@Component({
  selector: "app-manage-users-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./manage-users-modal-component.component.html",
  styleUrls: ["./manage-users-modal-component.component.scss"],
})
export class ManageUsersModalComponent {
  @Input() visible = false
  @Input() users: any[] = []
  @Input() currentUsername = ""
  @Output() updateRole = new EventEmitter<{ userId: number; role: string }>()
  @Output() close = new EventEmitter<void>()

  // Table state
  searchTerm = ""
  sortColumn = ""
  sortDirection: "asc" | "desc" = "asc"
  selectedUsers: number[] = []
  bulkRole = ""

  // Pagination
  currentPage = 0
  pageSize = 10

  get otherUsers(): any[] {
    return this.users.filter((user) => user.username !== this.currentUsername)
  }

  get filteredUsers(): any[] {
    let filtered = this.otherUsers

    // Recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (user) => user.username.toLowerCase().includes(term) || user.email.toLowerCase().includes(term),
      )
    }

    // Tri
    if (this.sortColumn) {
      filtered = filtered.sort((a, b) => {
        const aVal = a[this.sortColumn]
        const bVal = b[this.sortColumn]
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        return this.sortDirection === "asc" ? comparison : -comparison
      })
    }

    return filtered
  }

  get paginatedUsers(): any[] {
    const start = this.currentPage * this.pageSize
    const end = start + this.pageSize
    return this.filteredUsers.slice(start, end)
  }

  onSearch() {
    this.currentPage = 0 // Reset to first page when searching
  }

  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc"
    } else {
      this.sortColumn = column
      this.sortDirection = "asc"
    }
  }

  getSortClass(column: string): string {
    if (this.sortColumn !== column) return ""
    return this.sortDirection
  }

  // Selection methods
  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedUsers = []
    } else {
      this.selectedUsers = this.paginatedUsers.map((user) => user.id)
    }
  }

  toggleUserSelection(userId: number) {
    const index = this.selectedUsers.indexOf(userId)
    if (index > -1) {
      this.selectedUsers.splice(index, 1)
    } else {
      this.selectedUsers.push(userId)
    }
  }

  isUserSelected(userId: number): boolean {
    return this.selectedUsers.includes(userId)
  }

  isAllSelected(): boolean {
    return this.paginatedUsers.length > 0 && this.paginatedUsers.every((user) => this.isUserSelected(user.id))
  }

  isIndeterminate(): boolean {
    const selectedCount = this.paginatedUsers.filter((user) => this.isUserSelected(user.id)).length
    return selectedCount > 0 && selectedCount < this.paginatedUsers.length
  }

  // Role management
  onRoleChange(userId: number, newRole: string) {
    this.updateRole.emit({ userId, role: newRole })
  }

  onBulkRoleChange() {
    if (this.bulkRole && this.selectedUsers.length > 0) {
      this.selectedUsers.forEach((userId) => {
        this.updateRole.emit({ userId, role: this.bulkRole })
      })
      this.selectedUsers = []
      this.bulkRole = ""
    }
  }

  applyBulkActions() {
    if (this.bulkRole) {
      this.onBulkRoleChange()
    }
  }

  // Pagination methods
  getTotalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize)
  }

  getStartIndex(): number {
    return this.currentPage * this.pageSize
  }

  getEndIndex(): number {
    return Math.min(this.getStartIndex() + this.pageSize, this.filteredUsers.length)
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages()
    const pages = []
    const maxVisible = 5

    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible)

    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible)
    }

    for (let i = start; i < end; i++) {
      pages.push(i)
    }

    return pages
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--
    }
  }

  nextPage() {
    if (this.currentPage < this.getTotalPages() - 1) {
      this.currentPage++
    }
  }

  goToPage(page: number) {
    this.currentPage = page
  }

  // Utility methods
  getRoleIcon(role: string): string {
    switch (role) {
      case "admin":
        return "👑"
      case "moderator":
        return "🛡️"
      default:
        return "👤"
    }
  }

  getRoleText(role: string): string {
    switch (role) {
      case "admin":
        return "Administrateur"
      case "moderator":
        return "Modérateur"
      default:
        return "Utilisateur"
    }
  }

  getRoleClass(role: string): string {
    return role
  }

  getUserStatus(user: any): string {
    // Simuler un statut basé sur une logique métier
    return Math.random() > 0.5 ? "En ligne" : "Hors ligne"
  }

  getUserStatusClass(user: any): string {
    return this.getUserStatus(user) === "En ligne" ? "online" : "offline"
  }

  confirmDeleteUser(user: any) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.username} ?`)) {
      // Émettre un événement de suppression
      console.log("Suppression de l'utilisateur:", user)
    }
  }

  emitClose() {
    this.close.emit()
    this.resetState()
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.emitClose()
    }
  }

  trackByUserId(index: number, user: any): number {
    return user.id
  }

  private resetState() {
    this.searchTerm = ""
    this.sortColumn = ""
    this.sortDirection = "asc"
    this.selectedUsers = []
    this.bulkRole = ""
    this.currentPage = 0
  }
}
