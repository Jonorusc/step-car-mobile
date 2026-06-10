import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

export type BillingStatus = 'PENDING' | 'PAYMENTED';

export type BillingIndicators = {
    total_closures_year: number;
    total_amount: number;
    total_paid_amount: number;
    total_paid_closures: number;
    total_pending_amount: number;
    total_pending_closures: number;
};

export type Billing = {
    id: number;
    company_id: number;
    date_start: string;
    date_end: string;
    status: BillingStatus;
    invoiced_amount: number;
    description: string;
    path: string;
    document_url: string;
    total_vehicles?: number;
    total_services?: number;
    created_at: string;
    updated_at: string;
};

export type BillingListResponse = {
    current_page: number;
    data: Billing[];
    first_page_url: string;
    last_page: number;
    last_page_url: string;
    next_page_url: string;
    per_page: number;
    prev_page_url: string | null;
    total: number;
};

export type BillingRecordService = {
    id: number;
    closure_vehicle_id: number;
    service_id: number;
    service_name: string;
    category_id: number;
    category_name: string;
    price: number;
    quantity: number;
    executed_at: string;
    created_at?: string;
    updated_at?: string;
};

export type BillingRecord = {
    id: number;
    company_billing_closure_id: number;
    vehicle_id: number;
    vehicle_plate: string;
    vehicle_model: string;
    vehicle_color: string;
    vehicle_discount: number;
    services: BillingRecordService[];
    created_at?: string;
    updated_at?: string;
};

export type BillingRecordListResponse = {
    current_page: number;
    data: BillingRecord[];
    per_page: number;
    total: number;
    last_page: number;
};

export const useBillingIndicators = (companyId: number) => {
    return useQuery<BillingIndicators>({
        queryKey: ['billingIndicators', companyId],
        queryFn: async () => {
            const { data } = await api.get(`/companies/${companyId}/billings/closing/indicators`, {
                baseURL: api.defaults.baseURL?.replace('/v1', '/v2')
            });
            return data.data;
        },
        enabled: !!companyId,
    });
};

type UseListBillingsParams = {
    companyId: number;
    date_start?: string;
    date_end?: string;
    status?: string;
    limit_per_page?: number;
    page?: number;
};

export const useListBillings = ({ companyId, date_start, date_end, status, limit_per_page, page }: UseListBillingsParams) => {
    return useQuery<BillingListResponse>({
        queryKey: ['listBillings', companyId, date_start, date_end, status, limit_per_page, page],
        queryFn: async () => {
            const { data } = await api.get(`/companies/${companyId}/billings/closing`, {
                baseURL: api.defaults.baseURL?.replace('/v1', '/v2'),
                params: {
                    date_start,
                    date_end,
                    status,
                    limit_per_page,
                    page
                }
            });
            return data.data;
        },
        enabled: !!companyId,
    });
};

export const useBillingDetail = (companyId: number, closingId: number) => {
    return useQuery<Billing>({
        queryKey: ['billingDetail', companyId, closingId],
        queryFn: async () => {
            const { data } = await api.get(`/companies/${companyId}/billings/closing/${closingId}`, {
                baseURL: api.defaults.baseURL?.replace('/v1', '/v2')
            });
            return data.data;
        },
        enabled: !!companyId && !!closingId,
    });
};

type UseListBillingRecordsParams = {
    companyId: number;
    closingId: number;
    date_start?: string;
    date_end?: string;
    plate?: string;
    model?: string;
    color?: string;
    price_min?: number;
    price_max?: number;
    limit_per_page?: number;
    page?: number;
};

export const useListBillingRecords = ({
    companyId, closingId, date_start, date_end, plate, model, color, price_min, price_max, limit_per_page, page
}: UseListBillingRecordsParams) => {
    return useQuery<BillingRecordListResponse>({
        queryKey: ['listBillingRecords', companyId, closingId, date_start, date_end, plate, model, color, price_min, price_max, limit_per_page, page],
        queryFn: async () => {
            const { data } = await api.get(`/companies/${companyId}/billings/closing/${closingId}/records`, {
                baseURL: api.defaults.baseURL?.replace('/v1', '/v2'),
                params: {
                    date_start, date_end, plate, model, color, price_min, price_max, limit_per_page, page
                }
            });
            return data.data;
        },
        enabled: !!companyId && !!closingId,
    });
};

type CreateBillingPayload = {
    date_start: string;
    date_end: string;
    status?: string;
    description?: string;
};

export const useCreateBilling = (companyId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateBillingPayload) => {
            const { data } = await api.post(`/companies/${companyId}/billings/closing`, payload, {
                baseURL: api.defaults.baseURL?.replace('/v1', '/v2')
            });
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['listBillings', companyId] });
            queryClient.invalidateQueries({ queryKey: ['billingIndicators', companyId] });
        }
    });
};

type UpdateBillingPayload = {
    date_start?: string;
    date_end?: string;
    status?: string;
    description?: string;
};

export const useUpdateBilling = (companyId: number, closingId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: UpdateBillingPayload) => {
            const { data } = await api.put(`/companies/${companyId}/billings/closing/${closingId}`, payload, {
                baseURL: api.defaults.baseURL?.replace('/v1', '/v2')
            });
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['listBillings', companyId] });
            queryClient.invalidateQueries({ queryKey: ['billingDetail', companyId, closingId] });
            queryClient.invalidateQueries({ queryKey: ['billingIndicators', companyId] });
        }
    });
};

export const useUpdateBillingStatus = (companyId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ closingId, status }: { closingId: number; status: string }) => {
            const { data } = await api.patch(`/companies/${companyId}/billings/closing/${closingId}/status`, { status }, {
                baseURL: api.defaults.baseURL?.replace('/v1', '/v2')
            });
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['listBillings', companyId] });
            queryClient.invalidateQueries({ queryKey: ['billingDetail', companyId] });
            queryClient.invalidateQueries({ queryKey: ['billingIndicators', companyId] });
        }
    });
};

export const useDeleteBilling = (companyId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (closingId: number) => {
            const { data } = await api.delete(`/companies/${companyId}/billings/closing/${closingId}`, {
                baseURL: api.defaults.baseURL?.replace('/v1', '/v2')
            });
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['listBillings', companyId] });
            queryClient.invalidateQueries({ queryKey: ['billingIndicators', companyId] });
        }
    });
};

export const useSendBillingReport = (companyId: number) => {
    return useMutation({
        mutationFn: async (closingId: number) => {
            const { data } = await api.post(`/companies/${companyId}/billings/closing/${closingId}/report/send`, {}, {
                baseURL: api.defaults.baseURL?.replace('/v1', '/v2')
            });
            return data.data;
        }
    });
};
