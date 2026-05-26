export interface CUPOM {
    vehicleToCupom: any;
    collectCategoriesToModal: any;
    collectFormattedServicesToModal: any;
    establishment: Establishment;
    discount: number;
}

export type Establishment = {
    id: number;
    userId: number;
    active: boolean;
    corSystem: string;
    document: string;
    nameByCompany: string;
    type: string;
    coupon?: Coupon | null;
    created_at_formatted: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
};

export type Coupon = {
    info?: string | null;
};
