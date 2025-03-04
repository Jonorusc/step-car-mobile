export interface CUPOM {
  vehicleToCupom: any
  collectCategoriesToModal: any
  collectFormattedServicesToModal: any
  establishment: Establishment
}

export type Establishment = {
  id: number
  userId: number
  active: boolean
  corSystem: string
  document: string
  nameByCompany: string
  type: string
  createdAt: string
  updatedAt: string
  deletedAt: string
}
