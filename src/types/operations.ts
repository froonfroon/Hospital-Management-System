export type WorkflowStatus =
  | "draft"
  | "submitted"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "in_progress"
  | "completed"
  | "cancelled";

// A. Billing and Cashier
export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  departmentId: string;
  serviceDate: string;
  grossAmount: number;
  insuranceDiscount: number;
  copayAmount: number;
  netPayable: number;
  paymentStatus: "unpaid" | "partially_paid" | "settled" | "disputed";
  paymentMethod?: "cash" | "mada" | "visa" | "mastercard" | "insurance_direct";
  cashierName?: string;
  settledAt?: string;
}

// B. Insurance and Claims
export interface InsuranceClaim {
  id: string;
  claimNumber: string;
  payerName: string; // e.g. Tawuniya, Bupa, Al-Rajhi
  policyNumber: string;
  patientName: string;
  patientMrn: string;
  serviceCategory: "Inpatient Admission" | "Emergency Trauma" | "Surgical Suite" | "Day Case";
  claimedAmount: number;
  approvedAmount?: number;
  deductibleAmount: number;
  submissionDate: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "denied" | "appealed";
  preAuthCode?: string;
  denialReason?: string;
}

// D. Inventory and Warehouse
export interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: "Pharmaceuticals" | "Surgical Consumables" | "IV Fluids" | "PPE & Infection Control" | "Laboratory Reagents";
  warehouseLocation: string; // e.g. Central Pharmacy Warehouse, Aisle 4
  currentStock: number;
  minimumThreshold: number;
  reorderQuantity: number;
  unitOfMeasure: "box" | "vial" | "pack" | "bottle" | "ampoule";
  unitCost: number;
  expiryDate: string;
  batchNumber: string;
  stockStatus: "optimal" | "low_stock" | "critical" | "expired";
}

// E. Procurement and Suppliers
export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  orderDate: string;
  expectedDelivery: string;
  totalCost: number;
  status: "draft" | "pending_director_approval" | "approved" | "dispatched" | "partially_received" | "fulfilled";
  requisitionDepartment: string;
  itemsCount: number;
}

// H. Equipment and Biomedical Maintenance
export interface BiomedicalDevice {
  id: string;
  assetTag: string;
  deviceName: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  departmentId: string;
  departmentName: string;
  criticality: "life_support" | "diagnostic" | "therapeutic" | "general";
  status: "operational" | "due_preventive_maintenance" | "under_repair" | "out_of_service";
  lastCalibrationDate: string;
  nextCalibrationDate: string;
  assignedBioEngineer: string;
}

// K. Central Sterile Services Department (CSSD)
export interface CSSDBatch {
  id: string;
  batchCode: string;
  sterilizerId: string; // Autoclave 1, Plasma Sterilizer 2
  cycleType: "Steam 134C" | "Low Temp Gas Plasma" | "Flash Sterilization";
  traySets: string[]; // e.g. Laparotomy Tray #4, Ortho Drill Set #2
  startTime: string;
  endTime: string;
  biologicalIndicator: "negative_passed" | "positive_failed" | "incubating";
  chemicalIntegrator: "pass" | "fail";
  operatorName: string;
  releasedToDepartment?: string;
  status: "cycle_in_progress" | "quarantine_testing" | "released_sterile" | "rejected_reprocess";
}

// L. Dietary and Clinical Nutrition
export interface DietaryOrder {
  id: string;
  patientId: string;
  patientName: string;
  roomBed: string;
  dietType: "Regular" | "Diabetic (NIDDM)" | "Renal (Low Potassium)" | "Cardiac (Low Sodium)" | "NPO (Nothing by Mouth)" | "Clear Liquid";
  meal: "Breakfast" | "Lunch" | "Dinner";
  allergies: string[];
  clinicalNotes: string;
  preparationStatus: "ordered" | "prep_kitchen" | "tray_assembled" | "dispatched_ward" | "delivered";
}

// M. Emergency Ambulance Fleet
export interface AmbulanceDispatch {
  id: string;
  callSign: string; // e.g. Mobile ICU 01
  vehiclePlate: string;
  type: "Advanced Life Support (ALS)" | "Basic Life Support (BLS)" | "Neonatal Transport (MICU)";
  crew: {
    paramedicLead: string;
    emtDriver: string;
  };
  status: "station_ready" | "dispatched" | "en_route_scene" | "on_scene" | "transporting_hospital" | "decontaminating";
  currentLocation: string;
  assignedEmergencyCase?: string;
  etaMinutes?: number;
}

// O. Quality Management & Incident Reporting (OVR)
export interface IncidentReport {
  id: string;
  ovrNumber: string; // Occurrence Variance Report
  incidentDate: string;
  departmentId: string;
  category: "Medication Variance" | "Patient Fall" | "Equipment Malfunction" | "Hospital Acquired Infection" | "Near Miss";
  severityLevel: "near_miss" | "minor_no_harm" | "moderate_harm" | "sentinel_event";
  description: string;
  reportedByRole: string;
  investigationStatus: "reported" | "under_rca" | "corrective_action_pending" | "resolved_closed";
  rootCauseSummary?: string;
}

// P. Patient Complaints & Feedback
export interface PatientComplaint {
  id: string;
  ticketNumber: string;
  patientName: string;
  patientPhone: string;
  departmentId: string;
  subject: string;
  details: string;
  priority: "high" | "medium" | "low";
  loggedAt: string;
  resolutionStatus: "open" | "in_review_patient_relations" | "patient_contacted" | "resolved_signed_off";
  assignedOfficer: string;
  resolutionNotes?: string;
}
