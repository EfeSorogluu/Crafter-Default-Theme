import { useApi } from '@/lib/hooks/useApi';
import { BACKEND_URL } from '../constants/base';

export interface Report {
    id: string;
    reportedUserId: string;
    reporterUserId: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
    // Diğer alanlar backend'e göre eklenebilir
}

export const useReportService = () => {
    const { post } = useApi({ baseUrl: BACKEND_URL, useWebsiteId: true });

    // Rapor oluştur
    const createReport = async (reportedUserId: string, data: { reason: string, reportType: string }): Promise<Report> => {
        const response = await post<Report>(`/reports/${reportedUserId}`, data);
        return response.data;
    };

    return {
        createReport,
    };
}; 