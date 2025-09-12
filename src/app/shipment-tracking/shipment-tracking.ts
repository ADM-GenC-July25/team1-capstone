import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { ShipmentService, ShipmentTracking } from '../services/shipment.service';
import { UserService } from '../services/user.service';
import { ProductService } from '../services/product.service';
import { forkJoin } from 'rxjs';

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
  userAddress = signal<string>('');

  constructor(
    private themeService: ThemeService,
    private shipmentService: ShipmentService,
    private userService: UserService,
    private productService: ProductService,
    private router: Router
  ) {
    // Initialize any necessary data or services here
  }

  ngOnInit() {
    this.loadUserAddress();
    this.loadShipments();
  }

  // Load user delivery address
  loadUserAddress() {
    this.userService.getDeliveryAddress().subscribe({
      next: (address) => {
        this.userAddress.set(address);
      },
      error: (error) => {
        console.error('Error loading user address:', error);
        this.userAddress.set('Address not available');
      }
    });
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
        // Handle empty shipments array immediately
        if (shipments.length === 0) {
          this.shipments.set([]);
          this.isLoading.set(false);
          return;
        }

        // For each shipment, get the transaction details to calculate delivery date
        const shipmentRequests = shipments.map(shipment =>
          this.shipmentService.getTransactionItems(shipment.transactionId)
        );

        forkJoin(shipmentRequests).subscribe({
          next: (transactionItemsResults) => {
            // Merge shipment data with transaction items for accurate delivery calculation
            const enhancedShipments = shipments.map((shipment, index) => {
              const items = transactionItemsResults[index] || [];

              // Get actual delivery days from products
              const maxDeliveryDays = items.length > 0
                ? Math.max(...items.map(item => {
                  const productDetails = this.productService.getProductById(item.productId);
                  return productDetails?.daysToDeliver || 5;
                }))
                : 5;

              const enhanced = {
                ...shipment,
                deliveryAddress: this.userAddress(),
                estimatedDelivery: this.calculateDeliveryDateWithDays(shipment.transactionDate, maxDeliveryDays)
              };
              // Calculate and set the status
              enhanced.status = this.getDisplayStatus(enhanced);
              console.log('Enhanced shipment:', enhanced);
              return enhanced;
            });
            this.shipments.set(enhancedShipments);
            this.isLoading.set(false);
          },
          error: (error) => {
            console.error('Error loading transaction details:', error);
            // Fallback: use shipments without detailed delivery calculation
            const fallbackShipments = shipments.map(shipment => {
              const fallback = {
                ...shipment,
                deliveryAddress: this.userAddress(),
                estimatedDelivery: this.getEstimatedDelivery(shipment)
              };
              // Calculate and set the status for fallback too
              fallback.status = this.getDisplayStatus(fallback);
              console.log('Fallback shipment:', fallback);
              return fallback;
            });
            this.shipments.set(fallbackShipments);
            this.isLoading.set(false);
          }
        });
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
    // Find the shipment and get full details with items
    const shipment = this.shipments().find(s => s.transactionId === shipmentId);
    if (shipment) {

      // Get the transaction items (products)
      this.shipmentService.getTransactionItems(shipmentId).subscribe({
        next: (items) => {
          // Map the backend items to frontend format with product details
          const mappedItems = items.map(item => {
            // Try to get product details from the product service
            const productDetails = this.productService.getProductById(item.productId);

            return {
              productId: item.productId,
              productName: productDetails?.productName || item.productName || `Product #${item.productId}`,
              quantity: item.quantity,
              priceAtPurchase: item.price,
              price: item.price,
              daysToDeliver: productDetails?.daysToDeliver || 5, // Use actual delivery days from product or default to 5
              orderedItemId: item.orderedItemId,
              transactionId: item.transactionId,
              productImage: productDetails?.imageLink || item.productImage
            };
          });

          // Merge shipment with items
          const enhancedShipment = {
            ...shipment,
            items: mappedItems
          };
          this.selectedShipment.set(enhancedShipment);
          this.showDetailsOverlay.set(true);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading transaction items:', error);
          // Fallback: show shipment without items
          this.selectedShipment.set({ ...shipment, items: [] });
          this.showDetailsOverlay.set(true);
          this.isLoading.set(false);
        }
      });
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
    // Since we don't have status from backend yet, assume newer orders can be cancelled
    const orderDate = new Date(shipment.transactionDate);
    const now = new Date();
    const hoursSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
    return hoursSinceOrder < 24; // Can cancel within 24 hours
  }

  cancelShipment(shipmentId: number) {
    // Logic to cancel a shipment
    const shipment = this.shipments().find(s => s.transactionId === shipmentId);
    if (shipment && this.canCancelShipment(shipment)) {
      this.shipmentService.cancelShipmentById(shipmentId).subscribe({
        next: (updatedShipment: string) => {
          console.log('Shipment cancelled successfully:', updatedShipment);
          // Refresh the shipments list to reflect the cancellation
          this.loadShipments();
          this.closeDetailsOverlay();
        },
        error: (error) => {
          console.error('Error cancelling shipment:', error);
        }
      });
    }
  }

  // Helper methods for status styling
  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'processing': return 'status-processing';
      case 'in transit': return 'status-in-transit';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-processing'; // Default to processing for orders
    }
  }

  // Get display status for orders without status
  getDisplayStatus(shipment: ShipmentTracking): string {
    if (shipment.status) {
      return shipment.status;
    }

    // Calculate status based on order age and delivery date
    const orderDate = new Date(shipment.transactionDate);
    const now = new Date();
    const hoursSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

    // Get the estimated delivery date
    const estimatedDeliveryDate = new Date(shipment.estimatedDelivery || this.getEstimatedDelivery(shipment));

    // Debug logging
    console.log('Status calculation for shipment:', shipment.transactionId);
    console.log('Order date:', orderDate);
    console.log('Current time:', now);
    console.log('Hours since order:', hoursSinceOrder);
    console.log('Estimated delivery:', estimatedDeliveryDate);

    // If the estimated delivery date has passed, mark as delivered
    if (now >= estimatedDeliveryDate) {
      console.log('Status: Delivered');
      return 'Delivered';
    }

    // If the order was placed in the last 24 hours, it's still processing
    if (hoursSinceOrder < 24) {
      console.log('Status: Processing');
      return 'Processing';
    }

    // If it's been more than a day but delivery date hasn't passed, it's in transit
    console.log('Status: In Transit');
    return 'In Transit';
  }

  // Helper method to format dates
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get tracking number or generate one
  getTrackingNumber(shipment: ShipmentTracking): string {
    return shipment.trackingNumber || `TRK${shipment.transactionId.toString().padStart(8, '0')}`;
  }

  // Get estimated delivery date
  getEstimatedDelivery(shipment: ShipmentTracking): string {
    if (shipment.estimatedDelivery) {
      return shipment.estimatedDelivery;
    }
    // Generate estimated delivery (5 business days from order)
    const orderDate = new Date(shipment.transactionDate);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    return deliveryDate.toISOString();
  }

  // Calculate delivery date with specific days
  calculateDeliveryDateWithDays(transactionDate: string, days: number): string {
    const orderDate = new Date(transactionDate);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + days);
    return deliveryDate.toISOString();
  }

  // Calculate delivery date based on the longest delivery time from order items
  calculateDeliveryDate(transactionDate: string, items: any[]): string {
    if (!items || items.length === 0) {
      // Fallback to default 5 days if no items
      const orderDate = new Date(transactionDate);
      const deliveryDate = new Date(orderDate);
      deliveryDate.setDate(deliveryDate.getDate() + 5);
      return deliveryDate.toISOString();
    }

    // Find the maximum delivery days from all items
    const maxDeliveryDays = Math.max(...items.map(item => item.daysToDeliver || 5));

    // Add the maximum delivery days to the transaction date
    const orderDate = new Date(transactionDate);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + maxDeliveryDays);

    return deliveryDate.toISOString();
  }

  // Get delivery address from user profile
  getDeliveryAddress(): string {
    return this.userAddress() || 'Address not available';
  }

  // Get formatted delivery address for a specific shipment
  getShipmentDeliveryAddress(shipment: ShipmentTracking): string {
    return shipment.deliveryAddress || this.getDeliveryAddress();
  }

  // Get formatted estimated delivery date for display
  getFormattedEstimatedDelivery(shipment: ShipmentTracking): string {
    const deliveryDate = shipment.estimatedDelivery || this.getEstimatedDelivery(shipment);
    return this.formatDate(deliveryDate);
  }

  // Check if shipment has been delivered based on estimated delivery date
  isDelivered(shipment: ShipmentTracking): boolean {
    const estimatedDelivery = new Date(shipment.estimatedDelivery || this.getEstimatedDelivery(shipment));
    const now = new Date();
    return now >= estimatedDelivery;
  }

  // Navigate to shopping page for users with no shipments
  navigateToShopping() {
    this.router.navigate(['/home']);
  }
}