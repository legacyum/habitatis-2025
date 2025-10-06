import { useState } from 'react';

// Local energy estimator to replace missing import
function energyEstimator({
    people,
    habVolume_m3,
    desiredTempC,
    outsideTempC,
    insulationU,
}: {
    people: number;
    habVolume_m3: number;
    desiredTempC: number;
    outsideTempC: number;
    insulationU: number;
}) {
    const volume = Math.max(habVolume_m3, 0);
    const deltaT = Math.max(desiredTempC - outsideTempC, 0);
    const side_m = Math.cbrt(volume);
    const areaEnvelope_m2 = Number.isFinite(side_m) ? 6 * side_m * side_m : 0;
    const internalGains_W = Math.max(people, 0) * 80; // ~80W/person
    const heatLoss_W = Math.max(insulationU, 0) * areaEnvelope_m2 * deltaT;
    const net_W = Math.max(heatLoss_W - internalGains_W, 0);
    const daily_kWh = (net_W * 24) / 1000;
    return { daily_kWh, areaEnvelope_m2, net_W };
}

function EnergyEstimatorModule() {
    const [people, setPeople] = useState(4);
    const [volume, setVolume] = useState(300); // m3
    const [inside, setInside] = useState(22);
    const [outside, setOutside] = useState(-40);
    const [u, setU] = useState(0.4);
    const { daily_kWh, areaEnvelope_m2, net_W } = energyEstimator({
        people,
        habVolume_m3: volume,
        desiredTempC: inside,
        outsideTempC: outside,
        insulationU: u,
    });

    return (
        <div className="space-y-4 p-4 rounded-lg bg-black/30 border border-white/10" aria-label="Estimador energético">
            <h3 className="text-xl font-semibold">Demanda Energética</h3>
            <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs uppercase tracking-wide">
                    Personas{' '}
                    <input
                        className="mt-1 w-full rounded bg-white/10 px-2 py-1"
                        type="number"
                        value={people}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPeople(parseInt(e.target.value) || 0)}
                    />
                </label>
                <label className="text-xs uppercase tracking-wide">
                    Volumen (m³){' '}
                    <input
                        className="mt-1 w-full rounded bg-white/10 px-2 py-1"
                        type="number"
                        value={volume}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVolume(parseFloat(e.target.value) || 0)}
                    />
                </label>
                <label className="text-xs uppercase tracking-wide">
                    Temp. Interior (°C){' '}
                    <input
                        className="mt-1 w-full rounded bg-white/10 px-2 py-1"
                        type="number"
                        value={inside}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInside(parseFloat(e.target.value) || 0)}
                    />
                </label>
                <label className="text-xs uppercase tracking-wide">
                    Temp. Exterior (°C){' '}
                    <input
                        className="mt-1 w-full rounded bg-white/10 px-2 py-1"
                        type="number"
                        value={outside}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOutside(parseFloat(e.target.value) || 0)}
                    />
                </label>
                <label className="text-xs uppercase tracking-wide">
                    U (W/m²K){' '}
                    <input
                        className="mt-1 w-full rounded bg-white/10 px-2 py-1"
                        type="number"
                        value={u}
                        step={0.05}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setU(parseFloat(e.target.value) || 0)}
                    />
                </label>
            </div>
            <div className="text-sm space-y-1">
                <p><span className="font-medium">Energía diaria:</span> {daily_kWh.toFixed(1)} kWh/día</p>
                <p><span className="font-medium">Área envolvente estimada:</span> {areaEnvelope_m2.toFixed(1)} m²</p>
                <p><span className="font-medium">Pérdida neta:</span> {net_W.toFixed(0)} W</p>
            </div>
        </div>
    );
}

export default EnergyEstimatorModule;
