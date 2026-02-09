// Rain User Types

export interface RainUserAddress {
    line1?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    countryCode?: string;
}

export interface RainUserLink {
    url: string;
    params: {
        userId: string;
        signature: string;
    };
}

export type RainApplicationStatus =
    | 'needsVerification'
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'inReview';

export interface RainUser {
    rain_user_id: string;
    customer_id: string;
    is_active: boolean;
    is_terms_of_service_accepted: boolean;
    address: RainUserAddress | null;
    phone_country_code: string | null;
    phone_number: string | null;
    application_status: RainApplicationStatus;
    application_external_verification_link: RainUserLink | null;
    application_completion_link: RainUserLink | null;
    application_reason: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateRainUserInput {
    rain_user_id: string;
    customer_id: string;
    is_active?: boolean;
    is_terms_of_service_accepted?: boolean;
    address?: RainUserAddress;
    phone_country_code?: string;
    phone_number?: string;
    application_status?: RainApplicationStatus;
    application_external_verification_link?: RainUserLink;
    application_completion_link?: RainUserLink;
    application_reason?: string;
}

export interface UpdateRainUserInput {
    is_active?: boolean;
    is_terms_of_service_accepted?: boolean;
    address?: RainUserAddress;
    phone_country_code?: string;
    phone_number?: string;
    application_status?: RainApplicationStatus;
    application_external_verification_link?: RainUserLink;
    application_completion_link?: RainUserLink;
    application_reason?: string;
}
