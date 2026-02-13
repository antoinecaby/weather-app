import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

type DailyRow = {
  date: string;
  tempMax: number;
  weatherCode: number;
};

function formatDateToDDMM(isoDate: string) {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}`;
}

function weatherEmoji(code: number) {
  if (code === 0) return "☀️";
  if ([1, 2, 3].includes(code)) return "⛅️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67].includes(code)) return "🌧️";
  if ([71, 73, 75, 77].includes(code)) return "❄️";
  if ([80, 81, 82].includes(code)) return "🌧️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌤️";
}

export default function CityView() {
  const { ville } = useLocalSearchParams<{ ville?: string }>();
  const cityName = useMemo(() => (ville ? String(ville) : "Ville"), [ville]);

  const [apparentTemperature, setApparentTemperature] = useState<number | null>(
    null,
  );
  const [dailyForecast, setDailyForecast] = useState<DailyRow[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  const loadFavorites = async () => {
    const fav = await AsyncStorage.getItem("favorites");
    if (!fav) return [];

    return JSON.parse(fav) as string[];
  };

  const checkIfFavorite = async () => {
    const favs = await loadFavorites();
    setIsFavorite(favs.includes(cityName));
  };

  const toggleFavorite = async () => {
    const favs = await loadFavorites();

    if (favs.includes(cityName)) {
      const newFavs = favs.filter((v) => v !== cityName);
      await AsyncStorage.setItem("favorites", JSON.stringify(newFavs));
      setIsFavorite(false);
    } else {
      const newFavs = [...favs, cityName];
      await AsyncStorage.setItem("favorites", JSON.stringify(newFavs));
      setIsFavorite(true);
    }
  };

  const getLoc = (ville: string) => {
    return fetch(
      "https://geocoding-api.open-meteo.com/v1/search?name=" +
        encodeURIComponent(ville) +
        "&count=1&language=fr&format=json",
    )
      .then((response) => response.json())
      .then((json) => {
        const lat = json.results?.[0]?.latitude;
        const lon = json.results?.[0]?.longitude;

        if (lat == null || lon == null) return;

        return getMeteo(String(lat), String(lon));
      });
  };

  const getMeteo = (latitude: string, longitude: string) => {
    return fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=" +
        latitude +
        "&longitude=" +
        longitude +
        "&daily=weather_code,apparent_temperature_max&current=weather_code,apparent_temperature",
    )
      .then((response) => response.json())
      .then((json) => {
        setApparentTemperature(json.current?.apparent_temperature ?? null);

        const times: string[] = json.daily?.time ?? [];
        const temps: number[] = json.daily?.apparent_temperature_max ?? [];
        const codes: number[] = json.daily?.weather_code ?? [];

        const rows: DailyRow[] = times.map((t, i) => ({
          date: formatDateToDDMM(t),
          tempMax: Number(temps[i]),
          weatherCode: Number(codes[i]),
        }));

        setDailyForecast(rows);
      });
  };

  useEffect(() => {
    const v = cityName.trim();
    if (!v) return;

    getLoc(v);
    checkIfFavorite();
  }, [cityName]);

  return (
    <LinearGradient
      colors={["#245EE8", "#1C91F5", "#1CC7F8"]}
      style={{ flex: 1 }}
    >
      <View style={{ padding: 10 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginHorizontal: 30,
            marginTop: 30,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 40, fontWeight: "500" }}>
            {cityName}
          </Text>

          <Pressable onPress={toggleFavorite}>
            <Text style={{ fontSize: 35 }}>{isFavorite ? "⭐" : "☆"}</Text>
          </Pressable>
        </View>

        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 80,
            marginHorizontal: 30,
            marginBottom: 10,
            fontWeight: "300",
          }}
        >
          {apparentTemperature != null ? Math.round(apparentTemperature) : "--"}
          °C
        </Text>

        <View style={{ marginTop: 40, paddingHorizontal: 30 }}>
          <View style={{ flexDirection: "row", marginBottom: 14 }}>
            <Text
              style={{
                color: "#FFF",
                fontSize: 26,
                flex: 1,
                fontWeight: "500",
              }}
            >
              Date
            </Text>
            <Text
              style={{
                color: "#FFF",
                fontSize: 26,
                flex: 1,
                fontWeight: "500",
                textAlign: "center",
              }}
            >
              Température
            </Text>
            <Text
              style={{
                color: "#FFF",
                fontSize: 26,
                width: 70,
                fontWeight: "500",
                textAlign: "right",
              }}
            >
              Météo
            </Text>
          </View>

          {dailyForecast.map((row, idx) => (
            <View
              key={`${row.date}-${idx}`}
              style={{
                flexDirection: "row",
                paddingVertical: 6,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFF", fontSize: 28, flex: 1 }}>
                {row.date}
              </Text>

              <Text
                style={{
                  color: "#FFF",
                  fontSize: 28,
                  flex: 1,
                  textAlign: "center",
                }}
              >
                {Math.round(row.tempMax)}°C
              </Text>

              <Text style={{ fontSize: 28, width: 70, textAlign: "right" }}>
                {weatherEmoji(row.weatherCode)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}
