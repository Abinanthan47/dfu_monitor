import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function DoctorBooking() {
  const [patientName, setPatientName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [activeField, setActiveField] = useState(null);

  const handleSubmit = () => {
    if (
      !patientName ||
      !email ||
      !phone ||
      !doctor ||
      !date ||
      !time ||
      !reason
    ) {
      Alert.alert(
        "Missing Information",
        "Please fill out all fields to book your appointment."
      );
      return;
    }
    // For now, just display an alert. Replace with API call as needed.
    Alert.alert(
      "Appointment Confirmed",
      `Thank you ${patientName}!\nYour appointment with Dr. ${doctor} is scheduled for ${date} at ${time}.`,
      [{ text: "OK" }]
    );
    // Clear form
    setPatientName("");
    setEmail("");
    setPhone("");
    setDoctor("");
    setDate("");
    setTime("");
    setReason("");
  };

  const renderInputField = (
    label,
    placeholder,
    value,
    setValue,
    keyboardType = "default",
    multiline = false
  ) => {
    const isActive = activeField === label;

    return (
      <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={[
            styles.input,
            multiline && styles.textArea,
            isActive && styles.activeInput,
          ]}
          placeholder={placeholder}
          placeholderTextColor="#a8a8a8"
          value={value}
          onChangeText={setValue}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          autoCapitalize={label === "Email" ? "none" : "sentences"}
          onFocus={() => setActiveField(label)}
          onBlur={() => setActiveField(null)}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafc" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Book Your Appointment</Text>
            <Text style={styles.subtitle}>Fill in your details below</Text>
          </View>

          <View style={styles.card}>
            {renderInputField(
              "Patient Name",
              "Enter your full name",
              patientName,
              setPatientName
            )}
            {renderInputField(
              "Email Address",
              "you@example.com",
              email,
              setEmail,
              "email-address"
            )}
            {renderInputField(
              "Phone Number",
              "+91 (___) ___-____",
              phone,
              setPhone,
              "phone-pad"
            )}
            {renderInputField("Select Doctor", "Dr. Dinesh", doctor, setDoctor)}

            <View style={styles.dateTimeRow}>
              <View style={styles.dateField}>
                {renderInputField("Date", "YYYY-MM-DD", date, setDate)}
              </View>
              <View style={styles.timeField}>
                {renderInputField("Time", "HH:MM AM/PM", time, setTime)}
              </View>
            </View>

            {renderInputField(
              "Reason for Visit",
              "Briefly describe your symptoms or reason for appointment",
              reason,
              setReason,
              "default",
              true
            )}

            <TouchableOpacity activeOpacity={0.8} onPress={handleSubmit}>
              <LinearGradient
                colors={["#4a6feb", "#5271f2", "#5a78f9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Schedule Appointment</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              By booking an appointment, you agree to our terms and privacy
              policy.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafc",
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9fafc",
  },
  header: {
    marginBottom: 25,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2d3748",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#718096",
    marginBottom: 5,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 25,
    shadowColor: "#718096",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a5568",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f7fafc",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#2d3748",
  },
  activeInput: {
    borderColor: "#5a78f9",
    shadowColor: "#5a78f9",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 2,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateField: {
    flex: 1,
    marginRight: 10,
  },
  timeField: {
    flex: 1,
    marginLeft: 10,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  disclaimer: {
    textAlign: "center",
    fontSize: 12,
    color: "#a0aec0",
    marginTop: 20,
  },
});
