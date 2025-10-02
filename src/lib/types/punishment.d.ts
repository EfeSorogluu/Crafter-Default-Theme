export interface Punishment {
  id: string;
  name: string;
  uuid: string;
  reason: string;
  operator: string;
  punishmentType: "BAN" | "MUTE" | "KICK" | "WARNING" | "TEMP_BAN" | "TEMP_MUTE" | "TEMP_WARNING" | "IP_BAN" | "NOTE";
  start: string; // ISO timestamp
  end: string; // ISO timestamp or '-1' for permanent
  calculation: string; // Duration calculation
}

export interface PunishmentsConfig {
  type: 'advancedban' | 'litebans';
  isActive: boolean;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
}

export interface SearchPunishmentsParams {
  query: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface GetPunishmentsParams {
  type?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  punishments: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
