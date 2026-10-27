export type UserRole = "user" | "admin";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email?: string | null;
  nationalCode?: string | null;
  role: UserRole | string;
  active?: boolean;
  isActive?: boolean;
}

export interface LoginInput {
  mobile: string;
  password: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  mobile: string;
  password: string;
}

export type MembershipCategory =
  "regular" | "associate" | "student" | "legal_entity" | "honorary";

export type PersonType = "natural" | "legal";

export interface MembershipPlan {
  id: string;
  title: string;
  category: MembershipCategory | string;
  personType: PersonType | string;
  durationMonths: number;
  price: number;
  benefits: string[];
  description?: string;
  requiredDocuments: string[];
  isActive: boolean;
  sortOrder: number;
}

export interface DocumentRequirement {
  key: string;
  label: string;
  accept?: string;
  required?: boolean;
}

export type EducationStatus =
  "masters_graduate" | "phd_student" | "phd_graduate" | "other";

export type FieldOfStudy =
  | "technology_management"
  | "science_technology_policy"
  | "entrepreneurship"
  | "futures_studies"
  | "other_related";

export type DocumentType =
  "personnel_photo" | "latest_degree" | "student_card" | "resume" | "company_logo";

export interface ApplicationFields {
  educationStatus?: EducationStatus | string;
  fieldOfStudy?: FieldOfStudy | string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  nationalCode?: string;
  fatherName?: string;
  birthDate?: string;
  email?: string;
  university?: string;
  address?: string;
  postalCode?: string;
  companyName?: string;
  fieldOfActivity?: string;
  companyPhone?: string;
  nationalId?: string;
  ceoFullName?: string;
  representativeName?: string;
  representativePosition?: string;
  representativePhone?: string;
}

export interface ApplicationDocument {
  fileId: string;
  uploadedAt?: string;
}

export type ApplicationStatus =
  "draft" | "pending_payment" | "pending_review" | "approved" | "rejected";

export interface MembershipApplication extends ApplicationFields {
  id: string;
  userId?: string;
  planId: string;
  planTitle?: string;
  status: ApplicationStatus | string;
  membershipState?: "active" | "expired";
  documents?: Record<string, ApplicationDocument>;
  membershipNumber?: string;
  approvedAt?: string;
  expiresAt?: string;
  rejectionReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DiscountQuote {
  valid: boolean;
  discountCodeId?: string;
  discountAmount?: number;
  finalPrice?: number;
  message?: string;
}

export type PaymentStatus = "pending" | "success" | "failed" | "cancelled";

export interface PaymentRecord {
  id: string;
  userId?: string;
  applicationId?: string;
  amount: number;
  discountAmount?: number;
  finalAmount?: number;
  status: PaymentStatus | string;
  authority?: string;
  refId?: string;
  verifiedAt?: string;
  createdAt?: string;
}

export interface PaymentStart {
  paymentId: string;
  redirectUrl: string;
  authority: string;
}

export interface AdminStats {
  applicationsByStatus?: Record<string, number>;
  revenue?: number;
  successfulPayments?: number;
}

export type DiscountType = "percent" | "fixed";

export interface DiscountCode {
  id: string;
  code: string;
  type: DiscountType | string;
  value: number;
  maxDiscount?: number;
  validFrom?: string | null;
  validUntil?: string | null;
  totalUsageLimit?: number | null;
  usageCount?: number;
  perUserLimit?: number | null;
  allowedPlans?: string[];
  isActive: boolean;
}

export interface AdminUser extends AuthUser {
  createdAt?: string;
}

export interface ContentSeo {
  title?: string;
  description?: string;
  image?: string;
}

export interface ContentRecord {
  id?: string;
  slug?: string;
  publicId?: string;
  status?: string;
  publishedAt?: string;
  sortOrder?: number;
  seo?: ContentSeo;
  payload?: Record<string, unknown>;
  title?: string;
  [key: string]: unknown;
}
