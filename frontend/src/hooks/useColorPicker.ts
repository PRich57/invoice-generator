import { useState, useEffect, useRef } from 'react';

export const useColorPicker = () => {
    const [colorPickerOpen, setColorPickerOpen] = useState<Record<string, boolean>>({});
    const colorPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
                setColorPickerOpen(prevState => Object.fromEntries(
                    Object.entries(prevState).map(([key]) => [key, false])
                ));
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleColorPicker = (key: string) => {
        setColorPickerOpen(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return { colorPickerOpen, toggleColorPicker, colorPickerRef };
};