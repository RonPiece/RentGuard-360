/** Accordion state hook - handles controlled (external) vs uncontrolled (internal) expand/collapse. */
import { useState } from 'react';

export function useAccordion({ defaultExpanded = false, controlledExpanded, onToggle }) {
    const [localExpanded, setLocalExpanded] = useState(defaultExpanded);

    const isExpanded = controlledExpanded !== undefined ? controlledExpanded : localExpanded;

    const toggleAccordion = () => {
        if (controlledExpanded === undefined) {
            setLocalExpanded(!isExpanded);
        }
        if (onToggle) {
            onToggle(!isExpanded);
        }
    };

    return { isExpanded, toggleAccordion };
}
