import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#BB86FC',
        },
        secondary: {
            main: '#03DAC6',
        },
        background: {
            default: '#121212',
            paper: '#1F1F1F',
        },
        text: {
            primary: '#E1E1E1',
            secondary: '#9E9E9E',
        },
        error: {
            main: '#CF6679',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontSize: '2.5rem',
        },
        h2: {
            fontSize: '2rem',
        },
        h3: {
            fontSize: '1.75rem',
        },
        h4: {
            fontSize: '1.5rem',
        },
        h5: {
            fontSize: '1.25rem',
        },
        h6: {
            fontSize: '1rem',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '20px',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    background: 'linear-gradient(145deg, #2C2C2C 0%, #1F1F1F 100%)',
                    borderRadius: '10px',
                },
            },
        },
    },
});

darkTheme = responsiveFontSizes(darkTheme);

export default darkTheme;