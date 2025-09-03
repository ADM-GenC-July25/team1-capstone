import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ThemeService } from '../services/theme.service';
import { ShipmentService, ShipmentTracking } from '../services/shipment.service';

@Component({
  selector: 'app-shipment-tracking',
  imports: [CommonModule, DatePipe],
  templateUrl: './shipment-tracking.html',
  styleUrl: './shipment-tracking.css'
})
export class ShipmentTrackingComponent implements OnInit, OnDestroy {
  // Theme service integration
  get isDarkMode() {
    return this.themeService.isDarkMode;
  }

  // Overlay state management
  showDetailsOverlay = signal(false);
  selectedShipment = signal<ShipmentTracking | null>(null);

  // Shipments data and loading state
  shipments = signal<ShipmentTracking[]>([]);
  isLoading = signal(false);
  error = signal<string>('');

  constructor(private themeService: ThemeService, private shipmentService: ShipmentService) {
    // Initialize any necessary data or services here
  }

  ngOnInit() {
    this.loadShipments();
  }

  ngOnDestroy() {
    // Cleanup logic when the component is destroyed
  }

  // Load shipments from backend
  loadShipments() {
    this.isLoading.set(true);
    this.error.set('');

    this.shipmentService.getUserShipments().subscribe({
      next: (shipments) => {
        this.shipments.set(shipments);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set('Failed to load shipments. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading shipments:', error);
      }
    });
  }

  // Add methods to handle shipment tracking functionality
  trackShipment(shipmentId: number) {
    // Logic to track a shipment by its ID - could refresh single shipment
    this.shipmentService.getShipmentDetails(shipmentId).subscribe({
      next: (shipment) => {
        // Update the shipment in the list
        const currentShipments = this.shipments();
        const index = currentShipments.findIndex(s => s.transactionId === shipmentId);
        if (index !== -1) {
          currentShipments[index] = shipment;
          this.shipments.set([...currentShipments]);
        }
      },
      error: (error) => {
        console.error('Error tracking shipment:', error);
      }
    });
  }

  viewDetails(shipmentId: number) {
    // Find the shipment and show details overlay
    const shipment = this.shipments().find(s => s.transactionId === shipmentId);
    if (shipment) {
      this.selectedShipment.set(shipment);
      this.showDetailsOverlay.set(true);
    }
  }

  closeDetailsOverlay() {
    this.showDetailsOverlay.set(false);
    this.selectedShipment.set(null);
  }

  getShipmentDetails(shipmentId: number) {
    // Logic to retrieve shipment details
    return this.shipments().find(s => s.transactionId === shipmentId);
  }

  canCancelShipment(shipment: ShipmentTracking): boolean {
    return shipment.status === 'Processing';
  }

  cancelShipment(shipmentId: number) {
    // Logic to cancel a shipment (only if status is 'Processing')
    const shipment = this.shipments().find(s => s.transactionId === shipmentId);
    if (shipment && shipment.status === 'Processing') {
      // In a real implementation, you'd call a backend API to cancel
      // For now, we'll just update the local state
      shipment.status = 'Cancelled';
      this.shipments.set([...this.shipments()]);
      console.log(`Shipment ${shipmentId} has been cancelled`);
    }
  }

  // Helper methods for status styling
  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'processing': return 'status-processing';
      case 'in transit': return 'status-in-transit';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  }

  // Helper method to format dates
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }


}
