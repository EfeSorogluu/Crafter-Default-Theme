import { useApi } from '@/lib/hooks/useApi';
import { BACKEND_URL } from '../constants/base';
import { StaffForm, StaffFormApplication, StaffFormApplicationValue } from '../types/staff-form';

export const useStaffFormService = () => {
    const { get, post } = useApi({ baseUrl: BACKEND_URL, useWebsiteId: true });

    // Tüm formları getir
    const getForms = async (): Promise<StaffForm[]> => {
        const response = await get<StaffForm[]>('/staff-forms', {}, true);
        return response.data;
    };

    // Tek bir formu id veya slug ile getir
    const getForm = async (idOrSlug: string): Promise<StaffForm> => {
        const response = await get<StaffForm>(`/staff-forms/${idOrSlug}`, {}, true);
        return response.data;
    };

    // Formu başvuru olarak yanıtla (tüm inputlar tek seferde)
    const submitFormApplication = async (
        formId: string,
        values: StaffFormApplicationValue[]
    ): Promise<StaffFormApplication> => {
        const response = await post<StaffFormApplication>(
            `/staff-forms/${formId}/apply`,
            { values },
            {},
            true
        );
        return response.data;
    };

    // Kullanıcının kendi başvurularını getir
    const getMyApplications = async (): Promise<StaffFormApplication[]> => {
        const response = await get<StaffFormApplication[]>(
            `/staff-forms/applications`,
            {},
            true
        );
        return response.data;
    };

    return {
        getForms,
        getForm,
        submitFormApplication,
        getMyApplications,
    };
};