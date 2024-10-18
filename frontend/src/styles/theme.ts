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
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    background: '#2C2C2C',
                    fontFamily: 'sans-serif',
                    color: '#BB86FC'
                },
                arrow: {
                    color: '#2C2C2C',
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiInputLabel-root': {
                        backgroundColor: 'transparent',
                        padding: '0 4px',
                        '&.Mui-focused': {
                            color: '#BB86FC',
                        },
                    },
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.23)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#BB86FC',
                        },
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
                },
            },
        },
    },
});

darkTheme = responsiveFontSizes(darkTheme);

export default darkTheme;