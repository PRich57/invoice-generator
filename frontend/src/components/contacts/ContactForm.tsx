import React, { useEffect, useRef, useState } from 'react';
import { Autocomplete, Box, Button, TextField, Typography, useTheme, useMediaQuery } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input';
import { useSnackbar } from 'notistack';
import { useContactForm } from '../../hooks/useContactForm';
import LoadingSpinner from '../common/LoadingSpinner';
import { Loader } from '@googlemaps/js-api-loader';
import ListboxComponent from '../common/ListboxComponent';

const PLACES_API_KEY = process.env.PLACES_API_KEY;

interface ContactFormProps {
    id?: string;
}

function loadScript(src: string) {
    return new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            resolve();
        };
        script.onerror = (err) => {
            reject(err);
        };
        document.head.appendChild(script);
    });
}

const ContactForm: React.FC<ContactFormProps> = ({ id }) => {
    const { formik, isLoading, isSubmitting } = useContactForm();
    const [phone, setPhone] = useState('');
    const { enqueueSnackbar } = useSnackbar();
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
    const placesService = useRef<google.maps.places.PlacesService | null>(null);

    useEffect(() => {
        const loader = new Loader({
            apiKey: PLACES_API_KEY!,
            libraries: ['places'],
            version: 'weekly',
        });

        loader.importLibrary('places')
            .then(() => {
                autocompleteService.current = new google.maps.places.AutocompleteService();
                placesService.current = new google.maps.places.PlacesService(document.createElement('div'));
                setIsScriptLoaded(true);
            })
            .catch((err) => {
                console.error('Error loading Google Maps script:', err);
                enqueueSnackbar('Failed to load address autocomplete. Please enter address manually.', { variant: 'error' });
            });
    }, [enqueueSnackbar]);

    const handlePhoneChange = (newValue: string) => {
        setPhone(newValue);
        formik.setFieldValue('phone', newValue);
    };

    const handleStreetAddressChange = (event: React.ChangeEvent<{}>, value: string) => {
        if (!value) {
            setPredictions([]);
            return;
        }

        if (!autocompleteService.current) {
            enqueueSnackbar('Address autocomplete is not available. Please enter address manually.',
                { variant: 'warning' }
            );
            return;
        }

        autocompleteService.current.getPlacePredictions({ input: value }, (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                setPredictions(predictions);
            } else {
                setPredictions([]);
                if (status !== google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    enqueueSnackbar('Error fetching address suggestions. Please try again or enter manually.', { variant: 'error' });
                }
            }
        });
    };

    const handleAddressSelect = (value: google.maps.places.AutocompletePrediction | null) => {
        if (!value || !placesService.current) {
            enqueueSnackbar('Unable to fetch address details. Please enter manually.', { variant: 'warning' });
            return;
        }

        const placeId = value.place_id;
        const request = {
            placeId,
            fields: ['address_components', 'formatted_address'],
        };

        placesService.current.getDetails(request, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
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
                enqueueSnackbar('Failed to fetch address details. Please enter manually.',
                    { variant: 'error' }
                );
            }
        });
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ maxWidth: isMobile ? '100%' : 700, margin: 'auto' }}>         
            <TextField
                fullWidth
                margin="normal"
                name="name"
                label="Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                size={isMobile ? "small" : "medium"}
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
                size={isMobile ? "small" : "medium"}
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
                size={isMobile ? "small" : "medium"}
            />

            <MuiTelInput
                value={phone}
                onChange={handlePhoneChange}
                defaultCountry="US"
                fullWidth
                name="phone"
                label="Phone"
                margin="normal"
                size={isMobile ? "small" : "medium"}
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
                    ListboxComponent={ListboxComponent}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Street Address"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            error={formik.touched.street_address && Boolean(formik.errors.street_address)}
                            helperText={formik.touched.street_address && formik.errors.street_address}
                            size={isMobile ? "small" : "medium"}
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
                    size={isMobile ? "small" : "medium"}
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
                size={isMobile ? "small" : "medium"}
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
                size={isMobile ? "small" : "medium"}
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
                size={isMobile ? "small" : "medium"}
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
                size={isMobile ? "small" : "medium"}
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
                size={isMobile ? "small" : "medium"}
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
                size={isMobile ? "small" : "medium"}
            />

            <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ 
                    mt: 3,
                    width: isMobile ? '100%' : 'auto',
                }}
                disabled={isSubmitting}
                size={isMobile ? "small" : "medium"}
            >
                {isSubmitting ? 'Submitting...' : id ? 'Update Contact' : 'Create Contact'}
            </Button>
        </Box>
    );
};

export default ContactForm;