import { useCallback, useState } from 'react';
import api from '../utils/api';
import { CUPOM } from '../types';

export const useCouponBuilder = () => {
    const [isBuildingCoupon, setIsBuildingCoupon] = useState(false);

    const buildCouponData = useCallback(async (vehicleId: number): Promise<CUPOM | null> => {
        try {
            setIsBuildingCoupon(true);
            const response = await api.get(`/user/vehicle/show/full/${vehicleId}`);
            
            if (!response.data?.data) {
                throw new Error("Invalid response from vehicle full details.");
            }

            const { vehicle, services, company, coupon, establishment } = response.data.data;

            // Group services by category for printing
            const uniqueCategoriesMap = new Map();
            services.forEach((service: any) => {
                if (!uniqueCategoriesMap.has(service.category_id)) {
                    uniqueCategoriesMap.set(service.category_id, {
                        label: service.category_name,
                        value: service.category_id,
                    });
                }
            });
            const collectCategoriesToModal = Array.from(uniqueCategoriesMap.values());

            const cupomData: CUPOM = {
                vehicleToCupom: {
                    ...vehicle,
                    services: services, // inject raw services just in case
                    company: company,
                },
                collectCategoriesToModal,
                collectFormattedServicesToModal: services,
                establishment: {
                    ...establishment,
                    coupon: coupon // inject coupon info
                },
                discount: vehicle.discount || 0,
            };

            return cupomData;
        } catch (error) {
            console.error('[useCouponBuilder] Error building coupon data:', error);
            return null;
        } finally {
            setIsBuildingCoupon(false);
        }
    }, []);

    return { buildCouponData, isBuildingCoupon };
};
