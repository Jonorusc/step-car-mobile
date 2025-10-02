export interface CUPOM {
  vehicle: Vehicle
  services: Services[]
  establishment: Establishment
  company: Company | null
  coupon: Coupon | null
}

export interface Vehicle {
  id: number | null
  userId: number | null
  companyId: number | null
  establishmentId: number | null
  color: string
  createdAtFormatted: string
  discount: number
  model: string
  plate: string
  price: number
  createdAt: string | null
  updatedAt: string | null
  deletedAt: string | null
}

export interface Services {
  id: number
  category_name: string
  category_id: number
  name: string
  price: number
  quantity: number
}

export type Establishment = {
  id: number
  name_by_company: string
  active: boolean
  cor_system: string
  document: string
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
}

export interface Company {
  id: number | null
  closing_date?: string | null
  company_name: string
  document: string
  email: string
  establishment_id: number
  fantasy_name: string
  phone: string
  created_at?: string | null
  updated_at?: string | null
  deleted_at?: string | null
}

export type Coupon = {
  id: number
  name_by_company: string | null
  info?: string | null
  print_qrcode: boolean
}