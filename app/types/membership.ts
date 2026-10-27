export type UserRole = "user" | "admin" | "member";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email?: string | null;
  role: UserRole | string;
  active?: boolean;
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

export interface MembershipPlan {
  id: string;
  title: string;
  price: number;
  durationDays: number;
  benefits: string[];
  requiredDocuments: DocumentRequirement[];
  active: boolean;
  order: number;
  description?: string;
}

export interface DocumentRequirement {
  key: string;
  label: string;
  accept?: string;
  required?: boolean;
  maxMb?: number;
}

export type PersonType = "natural" | "legal";

export interface NaturalApplication {
  firstName: string;
  lastName: string;
  fatherName: string;
  nationalCode: string;
  birthDate: string;
  gender: string;
  mobile: string;
  email: string;
  phone: string;
  educationLevel: string;
  fieldOfStudy: string;
  university: string;
  jobTitle: string;
  organization: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
}

export interface LegalApplication {
  organizationName: string;
  organizationType: string;
  nationalId: string;
  registrationNumber: string;
  economicCode: string;
  establishedAt: string;
  ceoName: string;
  representativeFirstName: string;
  representativeLastName: string;
  representativeNationalCode: string;
  representativeRole: string;
  representativeMobile: string;
  email: string;
  phone: string;
  website: string;
  activity: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
}

export interface MembershipDocument {
  id?: string;
  key: string;
  name: string;
  url: string;
  contentType?: string;
}

export type ApplicationStatus =
  "draft" | "pending" | "approved" | "rejected" | "paid" | "expired";

export interface MembershipApplication {
  id: string;
  planId: string;
  planTitle?: string;
  personType: PersonType;
  status: ApplicationStatus | string;
  price?: number;
  discountCode?: string | null;
  finalPrice?: number;
  rejectionReason?: string | null;
  natural?: Partial<NaturalApplication> | null;
  legal?: Partial<LegalApplication> | null;
  documents?: MembershipDocument[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DiscountQuote {
  valid: boolean;
  code?: string;
  amount?: number;
  finalPrice?: number;
  message?: string;
}

export interface PaymentRecord {
  id: string;
  applicationId?: string;
  amount: number;
  status: string;
  createdAt?: string;
  reference?: string;
}

export interface MembershipCardInfo {
  status: string;
  expiresAt?: string | null;
  planTitle?: string | null;
  memberCode?: string | null;
}

export interface AdminStats {
  users?: number;
  applications?: number;
  pendingApplications?: number;
  memberships?: number;
  payments?: number;
  revenue?: number;
}

export interface DiscountCode {
  id: string;
  code: string;
  type: "percent" | "fixed" | string;
  amount: number;
  active: boolean;
  expiresAt?: string | null;
  maxUses?: number | null;
  usedCount?: number;
  planIds?: string[];
}

export interface AdminUser extends AuthUser {
  createdAt?: string;
}

export interface ContentRecord {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  body?: string;
  contentHtml?: string;
  bodyHtml?: string;
  date?: string;
  status?: string;
  order?: number;
  image?: string;
  [key: string]: unknown;
}
