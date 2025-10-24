import supabase from '@/db/supabase';

export async function saveCustomerToDB({
  conduitCustomerId,
  businessLegalName,
  country,
  isDirectSetup,
  email,
  phone,
  password,
  userId = null,
  recordType = 0,
  businessInformation = {}
}: {
  conduitCustomerId: string;
  businessLegalName: string;
  country: string;
  isDirectSetup: boolean;
  email: string;
  phone: string;
  password: string;
  userId?: number | null;
  recordType?: number;
  businessInformation?: any;
}) {
  const { data, error } = await supabase.rpc('create_business', {
    p_conduit_id: conduitCustomerId,
    p_business_name: businessLegalName,
    p_business_email: email,
    p_business_phone: phone,
    p_password: password,
    p_user_id: userId,
    p_record_type: recordType,

    // Opcionales (si recordType === 1)
    p_kyb_setup_by: businessInformation.kybSetupBy ?? 'client',
    p_is_direct_setup: isDirectSetup,

    p_business_legal_name: businessLegalName,
    p_business_trade_name: businessInformation.businessTradeName,
    p_industry: businessInformation.industry,
    p_entity_type: businessInformation.entityType,
    p_website: businessInformation.website,
    p_registered_date: businessInformation.registeredDate,

    p_tax_identification_number: businessInformation.taxIdentificationNumber,
    p_tax_classification: businessInformation.taxClassification,
    p_entity_taxed_as: businessInformation.entityTaxedAs,
    p_naics_code: businessInformation.naicsCode,
    p_business_entity_id: businessInformation.businessEntityId,
    p_is_financial_institution: businessInformation.isFinancialInstitution,
    p_regulator_name: businessInformation.regulatorName,

    p_registered_street_line1: businessInformation.registeredAddress?.streetLine1,
    p_registered_street_line2: businessInformation.registeredAddress?.streetLine2,
    p_registered_city: businessInformation.registeredAddress?.city,
    p_registered_state: businessInformation.registeredAddress?.state,
    p_registered_postal_code: businessInformation.registeredAddress?.postalCode,
    p_registered_country: businessInformation.registeredAddress?.country,

    p_operating_street_line1: businessInformation.operatingAddress?.streetLine1,
    p_operating_street_line2: businessInformation.operatingAddress?.streetLine2,
    p_operating_city: businessInformation.operatingAddress?.city,
    p_operating_state: businessInformation.operatingAddress?.state,
    p_operating_postal_code: businessInformation.operatingAddress?.postalCode,
    p_operating_country: businessInformation.operatingAddress?.country,

    p_mailing_street_line1: businessInformation.mailingAddress?.streetLine1,
    p_mailing_street_line2: businessInformation.mailingAddress?.streetLine2,
    p_mailing_city: businessInformation.mailingAddress?.city,
    p_mailing_state: businessInformation.mailingAddress?.state,
    p_mailing_postal_code: businessInformation.mailingAddress?.postalCode,
    p_mailing_country: businessInformation.mailingAddress?.country,

    p_is_subsidiary: businessInformation.isSubsidiary,
    p_is_operating: businessInformation.isOperating,

    p_ach_incoming_monthly: businessInformation.anticipatedMonthlyVolume?.ach?.incoming,
    p_ach_outgoing_monthly: businessInformation.anticipatedMonthlyVolume?.ach?.outgoing,
    p_wire_incoming_monthly: businessInformation.anticipatedMonthlyVolume?.wire?.incoming,
    p_wire_outgoing_monthly: businessInformation.anticipatedMonthlyVolume?.wire?.outgoing,
    p_check_incoming_monthly: businessInformation.anticipatedMonthlyVolume?.check?.incoming,
    p_check_outgoing_monthly: businessInformation.anticipatedMonthlyVolume?.check?.outgoing,

    p_expected_average_daily_balance: businessInformation.expectedAverageDailyBalance,
    p_has_advisor: businessInformation.hasAdvisor,
    p_business_description: businessInformation.businessDescription,
    p_business_entity_type: businessInformation.businessEntityType
  });

  if (error) throw new Error(error.message);
  return data;
}
