import { GoogleGenAI } from "@google/genai";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";

const GEMINI_API_KEY = "AIzaSyC4piyUThMfwAaByWzgdlxCjx2RHFZHtsE";
const THINGSPEAK_API_URL =
  "https://api.thingspeak.com/channels/2886060/feeds/last.json?api_key=BB01C4AEGT9EOYJC";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const followUpSuggestions = [
  "Suggest a diet plan",
  "What are warning signs?",
  "How to reduce foot pressure?",
  "Exercise tips for diabetes",
  "When should I see a doctor?",
];

export default function HealthAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [healthContext, setHealthContext] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHealthData();
  }, []);

  async function fetchHealthData() {
    try {
      const response = await fetch(THINGSPEAK_API_URL);
      const data = await response.json();

      const context = `As an AI health assistant, analyze the data for diabetic foot ulcer monitoring, suggest treatment if needed, give alerts for abnormal values, recommend daily activities, and provide a suitable diet plan. User's latest health data: heart rate 78 bpm, SpO₂ 97%, heel pressure ${data.field3} kPa, ball pressure ${data.field4} kPa, temperature1 ${data.field1}°C, temperature2 ${data.field2}°C. User is diabetic.`;
      setHealthContext(context);
    } catch (error) {
      console.error("Failed to fetch health data:", error);
    }
  }

  async function sendMessage(userInput: string) {
    if (!userInput.trim()) return;

    const newMessage: Message = { role: "user", text: userInput };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: `${healthContext}\n\nUser Query: ${userInput}` }],
          },
        ],
      });

      const botReplyText =
        response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate a response.";

      const botReply: Message = { role: "assistant", text: botReplyText };
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setLoading(false);
    }
  }

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.role === "user" ? styles.userBubble : styles.assistantBubble,
      ]}
    >
      {item.role === "assistant" ? (
        <Markdown style={markdownStyles}>{item.text}</Markdown>
      ) : (
        <Text style={[styles.messageText]}>{item.text}</Text>
      )}
    </View>
  );

  const handleFollowUpClick = (question: string) => {
    sendMessage(question);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>🩺 Health Assistant</Text>
      {!loading && messages.length === 0 && (
        <View style={styles.faqContainer}>
          <Text style={styles.faqTitle}>Frequently Asked Questions:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {followUpSuggestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.faqButton}
                onPress={() => handleFollowUpClick(question)}
              >
                <Text style={styles.faqButtonText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, index) => index.toString()}
        style={styles.chat}
        contentContainerStyle={{ paddingVertical: 20 }}
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Analyzing your health data...</Text>
        </View>
      )}
      {!loading && messages.length > 0 && (
        <View style={styles.followUpContainer}>
          <Text style={styles.followUpTitle}>💬 Follow-up questions:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {followUpSuggestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.followUpButton}
                onPress={() => handleFollowUpClick(question)}
              >
                <Text style={styles.followUpButtonText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask something..."
          value={input}
          onChangeText={setInput}
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => sendMessage(input)}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 50,
    textAlign: "center",
    color: "#333",
  },
  chat: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageBubble: {
    maxWidth: "100%",
    padding: 14,
    marginVertical: 6,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: "#007bff",
    alignSelf: "flex-end",
  },
  assistantBubble: {
    backgroundColor: "#e9ecef",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  input: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f1f3f5",
    borderRadius: 20,
    marginRight: 8,
    fontSize: 16,
    color: "#333",
  },
  sendButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  loadingContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 8,
    color: "#007bff",
    fontSize: 16,
  },
  followUpContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f1f3f5",
  },
  followUpTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  followUpButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  followUpButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  faqContainer: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: "#fff",
    marginTop: 50,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 18,
    color: "#333",
  },
  faqButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  faqButtonText: {
    color: "#fff",
    fontSize: 14,
  },
});

const markdownStyles: any = {
  text: {
    fontSize: 16,
    color: "#333",
  },
  strong: {
    fontWeight: "bold",
  },
  em: {
    fontStyle: "italic",
  },
  bullet_list: {
    paddingLeft: 20,
  },
  list_item: {
    marginVertical: 4,
  },
};
