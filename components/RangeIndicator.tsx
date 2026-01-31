import React from 'react';

interface RangeIndicatorProps {
    label: string;
    value: string;
    min: number;
    max: number;
    optimalMin?: number;
    optimalMax?: number;
    unit?: string;
}

const RangeIndicator: React.FC<RangeIndicatorProps> = ({
    label,
    value,
    min,
    max,
    optimalMin,
    optimalMax,
    unit = ''
}) => {
    if (!value) return null;

    const numValue = parseInt(value);
    if (isNaN(numValue)) return null;

    let status: 'critical' | 'warning' | 'normal' = 'normal';
    let color = 'text-emerald-600';
    let bgColor = 'bg-emerald-50';
    let icon = '✓';

    if (numValue < min || numValue > max) {
        status = 'critical';
        color = 'text-red-600';
        bgColor = 'bg-red-50';
        icon = '⚠️';
    } else if (optimalMin && optimalMax) {
        if (numValue < optimalMin || numValue > optimalMax) {
            status = 'warning';
            color = 'text-amber-600';
            bgColor = 'bg-amber-50';
            icon = '⚡';
        }
    }

    return (
        <div className={`mt-1 p-2 rounded-lg ${bgColor} flex items-center gap-2 text-xs`}>
            <span className="text-base">{icon}</span>
            <span className={`font-bold ${color}`}>
                {numValue}{unit}
            </span>
            <span className="text-slate-500 text-[10px]">
                (Normal: {optimalMin || min}-{optimalMax || max}{unit})
            </span>
        </div>
    );
};

export default RangeIndicator;
