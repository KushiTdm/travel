import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Cloud, CloudFog, CloudLightning, CloudRain, Sun } from 'lucide-react';

interface Props {
  place: string;
  lat: number;
  lon: number;
}

type Kind = 'clear' | 'cloudy' | 'fog' | 'rain' | 'storm';

// WMO weather codes: https://open-meteo.com/en/docs
function kindFromCode(code: number): Kind {
  if (code === 0 || code === 1) return 'clear';
  if (code === 2 || code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 95) return 'storm';
  return 'rain';
}

const icons = { clear: Sun, cloudy: Cloud, fog: CloudFog, rain: CloudRain, storm: CloudLightning };

function WeatherWidget({ place, lat, lon }: Props) {
  const { t } = useTranslation();
  const [state, setState] = useState<{ temp: number; kind: Kind } | 'error' | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setState(null);
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`,
      { signal: controller.signal },
    )
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) =>
        setState({ temp: Math.round(j.current.temperature_2m), kind: kindFromCode(j.current.weather_code) }),
      )
      .catch((e) => {
        if (e?.name !== 'AbortError') setState('error');
      });
    return () => controller.abort();
  }, [lat, lon]);

  if (state === null) return <div className="h-16 animate-pulse rounded-lg bg-surface-200" />;
  if (state === 'error') return <p className="text-sm text-surface-500">{t('weather.unavailable')}</p>;

  const Icon = icons[state.kind];
  return (
    <div className="flex items-center gap-3 rounded-lg border border-surface-200 bg-white p-4">
      <Icon className="w-8 h-8 text-accent-600" />
      <div>
        <p className="text-sm text-surface-500">{t('weather.title', { place })}</p>
        <p className="font-semibold text-primary-800">
          {state.temp}°C · {t(`weather.${state.kind}`)}
        </p>
        <p className="text-xs text-surface-400">{t('weather.feelsNote')}</p>
      </div>
    </div>
  );
}

export default WeatherWidget;
