import { View, Text, TextInput, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const [ville, setVille] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  const loadFavorites = async () => {
    const fav = await AsyncStorage.getItem("favorites");
    if (fav) {
      setFavorites(JSON.parse(fav));
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <LinearGradient
      colors={["#245EE8", "#1C91F5", "#1CC7F8"]}
      style={{ flex: 1 }}
    >
      <View style={{ padding: 10 }}>
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 40,
            margin: 30,
            fontWeight: "500",
          }}
        >
          Météo
        </Text>

        <TextInput
          placeholder="Entrez une ville..."
          placeholderTextColor="#FFFFFF99"
          value={ville}
          onChangeText={setVille}
          style={{
            borderWidth: 1,
            borderColor: "#FFFFFF",
            borderRadius: 10,
            padding: 20,
            color: "#FFFFFF",
            fontSize: 20,
            marginBottom: 10,
          }}
        />

        <Pressable
          onPress={() => {
            const v = ville.trim();
            if (!v) return;

            router.push({
              pathname: "/(tabs)/cityView",
              params: { ville: v },
            });
          }}
        >
          <Text
            style={{
              backgroundColor: "#1CC7F8",
              borderWidth: 1,
              borderColor: "#1CC7F8",
              borderRadius: 10,
              padding: 10,
              fontSize: 20,
              color: "#FFFFFF",
              textAlign: "center",
            }}
          >
            Rechercher {ville}
          </Text>
        </Pressable>

        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 22,
            fontWeight: "500",
            marginTop: 40,
            marginBottom: 15,
            marginLeft: 30,
          }}
        >
          Villes favorites
        </Text>

        {favorites.length === 0 ? (
          <Text style={{ color: "#FFFFFF", marginLeft: 30, fontSize: 18 }}>
            Aucun favori pour le moment.
          </Text>
        ) : (
          favorites.map((fav, idx) => (
            <Pressable
              key={idx}
              onPress={() => {
                router.push({
                  pathname: "/(tabs)/cityView",
                  params: { ville: fav },
                });
              }}
              style={{
                marginHorizontal: 30,
                marginBottom: 12,
                padding: 15,
                borderRadius: 15,
                backgroundColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "500" }}>
                {fav}
              </Text>
            </Pressable>
          ))
        )}
      </View>
    </LinearGradient>
  );
}
