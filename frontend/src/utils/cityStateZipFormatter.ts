export const formatCityStateZip = (contact: any) => {
    const { city, state, postal_code } = contact;
    const cityState = city && state ? `${city}, ${state}` : city || state || '';
    const zip = postal_code ? ` ${postal_code}` : '';
    return `${cityState}${zip}`.trim();
};