"use client";

import React from "react";

/**
 * NorthIndianChart renders a traditional diamond-style astrology chart using SVG.
 * Expects a structured `houses` object from the backend:
 * {
 *   1: { sign: number, planets: [string, ...] },
 *   ...
 *   12: { sign: number, planets: [...] }
 * }
 */
export default function NorthIndianChart({ chart }) {
    console.log("NorthIndianChart rendering with:", chart);

    if (!chart || !chart.houses) {
        return null;
    }

    const { houses } = chart;

    // Diamond points and house paths
    // Using a 400x400 viewBox
    return (
        <div className="relative w-full aspect-square max-w-lg mx-auto overflow-hidden rounded-2xl bg-[#2b004b]/40 border border-[#ff4fa3]/20 shadow-[0_0_20px_rgba(255,79,163,0.1)] backdrop-blur-sm p-4">
            <svg viewBox="0 0 400 400" width="100%" height="100%" className="drop-shadow-[0_0_15px_rgba(255,79,163,0.1)]">
                {/* Outer Square */}
                <rect x="10" y="10" width="380" height="380" fill="none" stroke="#ff4fa3" strokeWidth="2" opacity="0.6" />

                {/* Main Diagonals */}
                <line x1="10" y1="10" x2="390" y2="390" stroke="#ff4fa3" strokeWidth="2" opacity="0.4" />
                <line x1="390" y1="10" x2="10" y2="390" stroke="#ff4fa3" strokeWidth="2" opacity="0.4" />

                {/* Inner Diamond */}
                <path d="M200 10 L390 200 L200 390 L10 200 Z" fill="none" stroke="#ff4fa3" strokeWidth="2" opacity="0.8" />

                {/* Render Houses */}
                {Object.entries(houses).map(([hNum, data]) => {
                    const houseIndex = parseInt(hNum);
                    const pos = getHouseContentPosition(houseIndex);

                    return (
                        <g key={houseIndex}>
                            {/* Sign Number */}
                            <text
                                x={pos.signX}
                                y={pos.signY}
                                textAnchor="middle"
                                className="fill-[#ff4fa3] font-bold text-[14px]"
                            >
                                {data.sign}
                            </text>

                            {/* Planets */}
                            <g transform={`translate(${pos.planetsX}, ${pos.planetsY})`}>
                                {data.planets.map((planet, pIdx) => (
                                    <text
                                        key={pIdx}
                                        y={pIdx * 14}
                                        textAnchor="middle"
                                        className="fill-white font-medium text-[10px] uppercase tracking-tighter"
                                    >
                                        {planet.substring(0, 2)}
                                    </text>
                                ))}
                            </g>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

function getHouseContentPosition(house) {
    // Coordinates based on a 400x400 viewbox
    const mapping = {
        1: { signX: 200, signY: 105, planetsX: 200, planetsY: 130 },
        2: { signX: 105, signY: 55, planetsX: 105, planetsY: 80 },
        3: { signX: 55, signY: 105, planetsX: 55, planetsY: 130 },
        4: { signX: 105, signY: 200, planetsX: 105, planetsY: 220 },
        5: { signX: 55, signY: 295, planetsX: 55, planetsY: 315 },
        6: { signX: 105, signY: 345, planetsX: 105, planetsY: 365 },
        7: { signX: 200, signY: 295, planetsX: 200, planetsY: 315 },
        8: { signX: 295, signY: 345, planetsX: 295, planetsY: 365 },
        9: { signX: 345, signY: 295, planetsX: 345, planetsY: 315 },
        10: { signX: 295, signY: 200, planetsX: 295, planetsY: 220 },
        11: { signX: 345, signY: 105, planetsX: 345, planetsY: 130 },
        12: { signX: 295, signY: 55, planetsX: 295, planetsY: 80 },
    };
    return mapping[house];
}
