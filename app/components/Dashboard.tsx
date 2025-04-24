import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BarChart2, Home, MessageSquare, User } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import HomePage from "./HomeScreen";
import Chatbot from "./Chatbot";
import MapScreen from "./MapScreen";
import DoctorBooking from "./DoctorBooking";
// Create placeholder screens
function HomeScreen() {
  return (
   <HomePage/>
  );
}

function DataScreen() {
  return (
    <MapScreen/>
  );
}

function ChatbotScreen() {
  return (
  <Chatbot/>
  );
}

function ProfileScreen() {
  return (
  <DoctorBooking/>
  );
}

const Tab = createBottomTabNavigator();

export default function Dashboard() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#8E8E93",
    
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 10 ,
          borderTopWidth: 0,
          borderRadius: 20,
          backgroundColor: "#0C171A",
          marginHorizontal: 20,
          marginBottom: 20,
        },
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Home stroke={color} width={size} height={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Data"
        component={DataScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <BarChart2 stroke={color} width={size} height={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MessageSquare stroke={color} width={size} height={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <User stroke={color} width={size} height={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
