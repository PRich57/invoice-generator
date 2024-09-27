import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Box, Autocomplete } from '@mui/material';
import { useContactForm } from '../../hooks/useContactForm';
import LoadingSpinner from '../common/LoadingSpinner';
import { MuiTelInput } from 'mui-tel-input';

const PLACES_API_KEY = process.env.PLACES_API_KEY;

function loadScript(src: string) {
    return new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => {
            resolve();
        };
        script.onerror = (err) => {
            reject(err);
        };
        document.head.appendChild(script);
    });
}

interface ContactFormProps {
    id?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ id }) => {
    const { formik, isLoading, isSubmitting } = useContactForm();
    const [phone, setPhone] = useState('');

    const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
    const placesService = useRef<google.maps.places.PlacesService | null>(null);

    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    useEffect(() => {
        const src = `https://maps.googleapis.com/maps/api/js?key=${PLACES_API_KEY}&libraries=places`;

        loadScript(src)
            .then(() => {
                autocompleteService.current = new google.maps.places.AutocompleteService();
                placesService.current = new google.maps.places.PlacesService(document.createElement('div'));
                setIsScriptLoaded(true);
            })
            .catch((err) => {
                console.error('Error loading Google Maps script:', err);
            });
    }, []);

    const handlePhoneChange = (newValue: string) => {
        setPhone(newValue);
        // const parsedNumber = parsedNumber(newValue);
        formik.setFieldValue('phone', newValue);
    };

    const handleStreetAddressChange = (event: React.ChangeEvent<{}>, value: string) => {
        if (!value) {
            setPredictions([]);
            return;
        }

        if (!autocompleteService.current) return;

        autocompleteService.current.getPlacePredictions({ input: value }, (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                setPredictions(predictions);
            } else {
                setPredictions([]);
            }
        });
    };

    const handleAddressSelect = (value: google.maps.places.AutocompletePrediction | null) => {
        if (!value || !placesService.current) return;

        const placeId = value.place_id;
        const request = {
            placeId,
            fields: ['address_components', 'formatted_address'],
        };

        placesService.current.getDetails(request, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                // Parse the address components and update formik values
                const addressComponents = place.address_components || [];

                const streetNumber = addressComponents.find((component) =>
                    component.types.includes('street_number')
                )?.long_name || '';
                const route = addressComponents.find((component) =>
                    component.types.includes('route')
                )?.long_name || '';
                const city = addressComponents.find((component) =>
                    component.types.includes('locality')
                )?.long_name || '';
                const state = addressComponents.find((component) =>
                    component.types.includes('administrative_area_level_1')
                )?.short_name || '';
                const postalCode = addressComponents.find((component) =>
                    component.types.includes('postal_code')
                )?.long_name || '';
                const country = addressComponents.find((component) =>
                    component.types.includes('country')
                )?.long_name || '';

                formik.setValues({
                    ...formik.values,
                    street_address: `${streetNumber} ${route}`.trim(),
                    city,
                    state,
                    postal_code: postalCode,
                    country,
                });
            } else {
                console.error('Error getting place details:', status);
            }
        });
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ maxWidth: 600, margin: 'auto' }}>
            <TextField
                fullWidth
                margin="normal"
                name="name"
                label="Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
            />

            <TextField
                fullWidth
                margin="normal"
                name="company"
                label="Company"
                value={formik.values.company}
                onChange={formik.handleChange}
                error={formik.touched.company && Boolean(formik.errors.company)}
                helperText={formik.touched.company && formik.errors.company}
            />

            <TextField
                fullWidth
                margin="normal"
                name="email"
                label="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
            />

            <MuiTelInput
                value={phone}
                onChange={handlePhoneChange}
                defaultCountry="US"
                fullWidth
                name="phone"
                label="Phone"
                margin="normal"
            />

            {isScriptLoaded && (
                <Autocomplete
                    freeSolo
                    options={predictions}
                    getOptionLabel={(option) => (typeof option === 'string' ? option : option.description)}
                    inputValue={formik.values.street_address}
                    onInputChange={(event, value) => {
                        formik.setFieldValue('street_address', value);
                        handleStreetAddressChange(event, value);
                    }}
                    onChange={(event, value) => {
                        if (value && typeof value !== 'string') {
                            handleAddressSelect(value);
                        }
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Street Address"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            error={formik.touched.street_address && Boolean(formik.errors.street_address)}
                            helperText={formik.touched.street_address && formik.errors.street_address}
                        />
                    )}
                />
            )}

            {!isScriptLoaded && (
                <TextField
                    fullWidth
                    margin="normal"
                    name="street_address"
                    label="Street Address"
                    value={formik.values.street_address}
                    onChange={formik.handleChange}
                    error={formik.touched.street_address && Boolean(formik.errors.street_address)}
                    helperText={formik.touched.street_address && formik.errors.street_address}
                />
            )}

            <TextField
                fullWidth
                margin="normal"
                name="address_line2"
                label="Address Line 2"
                value={formik.values.address_line2}
                onChange={formik.handleChange}
                error={formik.touched.address_line2 && Boolean(formik.errors.address_line2)}
                helperText={formik.touched.address_line2 && formik.errors.address_line2}
            />

            <TextField
                fullWidth
                margin="normal"
                name="city"
                label="City"
                value={formik.values.city}
                onChange={formik.handleChange}
                error={formik.touched.city && Boolean(formik.errors.city)}
                helperText={formik.touched.city && formik.errors.city}
            />

            <TextField
                fullWidth
                margin="normal"
                name="state"
                label="State"
                value={formik.values.state}
                onChange={formik.handleChange}
                error={formik.touched.state && Boolean(formik.errors.state)}
                helperText={formik.touched.state && formik.errors.state}
            />

            <TextField
                fullWidth
                margin="normal"
                name="postal_code"
                label="Postal Code"
                value={formik.values.postal_code}
                onChange={formik.handleChange}
                error={formik.touched.postal_code && Boolean(formik.errors.postal_code)}
                helperText={formik.touched.postal_code && formik.errors.postal_code}
            />

            <TextField
                fullWidth
                margin="normal"
                name="country"
                label="Country"
                value={formik.values.country}
                onChange={formik.handleChange}
                error={formik.touched.country && Boolean(formik.errors.country)}
                helperText={formik.touched.country && formik.errors.country}
            />

            <TextField
                fullWidth
                margin="normal"
                name="notes"
                label="Notes"
                multiline
                rows={4}
                value={formik.values.notes}
                onChange={formik.handleChange}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes}
            />

            <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Submitting...' : id ? 'Update Contact' : 'Create Contact'}
            </Button>
        </Box>
    );
};

export default ContactForm;
