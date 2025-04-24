import React from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sensor Placement Overview</Text>
      <View style={styles.imageWrapper}>
        <ImageBackground
          source={require("../../assets/images/image.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center", 
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "left",
    marginVertical: 25,
    marginTop: 50,
    marginLeft: 20,
 
  },
  imageWrapper: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 300, 
    height: 400, 
  },
});

