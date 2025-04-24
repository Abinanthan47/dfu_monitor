import {
  Activity,
  AlertTriangle,
  Bell,
  ChevronDown,
  Footprints,
  Gauge,
  Heart,
  Home,
  MoreHorizontal,
  ThermometerSnowflake,
  ThermometerSun,
  User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Vibration,
  Platform,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Polygon,
  Polyline,
  Stop,
} from "react-native-svg";

// AlertCard component for showing health alerts
interface AlertCardProps {
  temp1: string;
  temp2: string;
  healPressure: string;
  ballPressure: string;
  onClose?: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({
  temp1,
  temp2,
  healPressure,
  ballPressure,
  onClose,
}) => {
  let message = "";
  let show = false;
  let alertType: "temp" | "pressure" | "heart" | "oxygen" | null = null;

  // Check for abnormal temperature 1
  if (parseFloat(temp1) > 38 || parseFloat(temp1) < 35) {
    message = `Abnormal Temperature 1: ${temp1}°C`;
    show = true;
    alertType = "temp";
  }
  // Check for abnormal temperature 2
  else if (parseFloat(temp2) > 38 || parseFloat(temp2) < 35) {
    message = `Abnormal Temperature 2: ${temp2}°C`;
    show = true;
    alertType = "temp";
  }
  // Check for abnormal heel pressure - changed threshold to 400 as requested
  else if (parseFloat(healPressure) > 400) {
    message = `High Heel Pressure Alert: ${healPressure} kPa`;
    show = true;
    alertType = "pressure";
  }
  // Check for abnormal ball pressure - changed threshold to 400 as requested
  else if (parseFloat(ballPressure) > 400) {
    message = `High Ball Pressure Alert: ${ballPressure} kPa`;
    show = true;
    alertType = "pressure";
  }

  if (
    !show ||
    temp1 === "--" ||
    temp2 === "--" ||
    healPressure === "--" ||
    ballPressure === "--"
  )
    return null;

  // Different colors for different alert types
  const getAlertStyle = () => {
    switch (alertType) {
      case "temp":
        return {
          backgroundColor: "#FFF4E5",
          borderColor: "#FF9800",
          iconColor: "#FF9800",
        };
      case "pressure":
        return {
          backgroundColor: "#FFE5E5",
          borderColor: "#FF2D55",
          iconColor: "#FF2D55",
        };
      default:
        return {
          backgroundColor: "#ffebee",
          borderColor: "#d32f2f",
          iconColor: "#d32f2f",
        };
    }
  };

  const alertStyle = getAlertStyle();

  return (
    <View
      style={[
        styles.alertCard,
        {
          backgroundColor: alertStyle.backgroundColor,
          borderLeftColor: alertStyle.borderColor,
        },
      ]}
    >
      <View style={styles.alertIconContainer}>
        <AlertTriangle stroke={alertStyle.iconColor} width={24} height={24} />
      </View>
      <View style={styles.alertContent}>
        <Text style={[styles.alertText, { color: alertStyle.borderColor }]}>
          {message}
        </Text>
        <Text style={styles.alertSubtext}>Please check sensor readings</Text>
      </View>
      {onClose && (
        <TouchableOpacity style={styles.alertCloseButton} onPress={onClose}>
          <Text style={{ color: alertStyle.borderColor, fontSize: 20 }}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Replace with your actual ThingSpeak channel ID and API key
const THINGSPEAK_CHANNEL_ID = "2886060";
const THINGSPEAK_API_KEY = "BB01C4AEGT9EOYJC";
const THINGSPEAK_URL = `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds/last.json?api_key=${THINGSPEAK_API_KEY}`;

// Get screen width for responsive design
const screenWidth = Dimensions.get("window").width;

// Function to generate mock data for the heart rate chart
const generateChartData = () => {
  // Generate data points with subtle variation between 75-78 as requested
  const points = [];
  for (let i = 0; i < 12; i++) {
    // Create subtle variation within 75-78 range
    let variation = Math.sin((i / 11) * Math.PI * 2) * 1.5;
    points.push(76.5 + variation); // Centers around 76.5 with ±1.5 variation
  }
  return points;
};

// Get a random SpO2 value between 95-97%
const getRandomSpO2 = () => {
  return Math.floor(Math.random() * 3) + 95; // Random between 95-97
};

export default function HomePage() {
  const [temp1, setTemp1] = useState("--");
  const [temp2, setTemp2] = useState("--");
  const [healPressure, setHealPressure] = useState("--");
  const [ballPressure, setBallPressure] = useState("--");
  const [heartRate, setHeartRate] = useState("76"); // Constant in 75-78 range
  const [spo2, setSpo2] = useState("96"); // Constant in 95-97% range
  const [chartData, setChartData] = useState(generateChartData());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const [alertTriggered, setAlertTriggered] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(THINGSPEAK_URL);
      const data = await response.json();

      // Field1 is temperature 1 and field2 is temperature 2
      if (data && data.field1) {
        setTemp1(parseFloat(data.field1).toFixed(1));
      }

      if (data && data.field2) {
        setTemp2(parseFloat(data.field2).toFixed(1));
      }

      // Field3 is heal pressure and field4 is ball pressure
      if (data && data.field3) {
        const healP = parseFloat(data.field3).toFixed(1);
        setHealPressure(healP);
        
        // Check if pressure > 400 to trigger alert with vibration
        if (parseFloat(healP) > 400 && !alertTriggered) {
          setAlertTriggered(true);
          setShowAlert(true);
          // Vibrate on high pressure
          if (Platform.OS === 'ios' || Platform.OS === 'android') {
            Vibration.vibrate([0, 500, 200, 500]);
          }
        }
      }

      if (data && data.field4) {
        const ballP = parseFloat(data.field4).toFixed(1);
        setBallPressure(ballP);
        
        // Check if pressure > 400 to trigger alert with vibration
        if (parseFloat(ballP) > 400 && !alertTriggered) {
          setAlertTriggered(true);
          setShowAlert(true);
          // Vibrate on high pressure
          if (Platform.OS === 'ios' || Platform.OS === 'android') {
            Vibration.vibrate([0, 500, 200, 500]);
          }
        }
      }

      // Set constant values as requested
      // Randomly choose within the specified range for natural variation
      setHeartRate((Math.random() * 3 + 75).toFixed(0)); // 75-78 bpm
      setSpo2(getRandomSpO2().toString()); // 95-97%
      
      // Update chart data based on constant heart rate range
      setChartData(generateChartData());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up interval to fetch data every 30 seconds
    const interval = setInterval(fetchData, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Function to render the line chart - modernized
  const renderLineChart = () => {
    if (chartData.length === 0) return null;

    const maxValue = Math.max(...chartData);
    const minValue = Math.min(...chartData);
    // Ensure we have a reasonable range for scaling
    const range = Math.max(10, maxValue - minValue) * 1.2;

    // Chart dimensions and padding
    const chartHeight = 120;
    const paddingBottom = 10;
    const paddingLeft = 10;
    const paddingRight = 10;

    // Calculate chart width based on screen width and card padding
    const chartWidth = screenWidth - 80; // Adjusted for better margins

    // Calculate points for the polyline
    const pointsString = chartData
      .map((value, index) => {
        // Normalize value to chart height (invert Y since SVG coords start from top)
        const normalizedY =
          chartHeight - ((value - minValue) / range) * chartHeight;
        const x =
          (index / (chartData.length - 1)) *
            (chartWidth - paddingLeft - paddingRight) +
          paddingLeft;
        return `${x},${normalizedY}`;
      })
      .join(" ");

    // Create fill points for the area below the line
    const fillPoints =
      `${paddingLeft},${chartHeight} ` +
      pointsString +
      ` ${chartWidth - paddingRight},${chartHeight}`;

    // Use a gradient color
    const gradientColors = {
      start: "#FF2D55",
      middle: "#FF3B6A",
      end: "#FF5E8F",
    };

    return (
      <View style={styles.lineChartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          <Text style={styles.axisLabel}>{Math.ceil(maxValue)}</Text>
          <Text style={styles.axisLabel}>{Math.round((maxValue + minValue) / 2)}</Text>
          <Text style={styles.axisLabel}>{Math.floor(minValue)}</Text>
        </View>

        {/* Chart */}
        <View style={styles.graphContainer}>
          <Svg width={chartWidth} height={chartHeight + paddingBottom}>
            {/* Gradient fill under the line */}
            <Defs>
              <LinearGradient
                id="gradientFill"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <Stop offset="0%" stopColor={gradientColors.start} stopOpacity="0.2" />
                <Stop offset="100%" stopColor={gradientColors.end} stopOpacity="0.05" />
              </LinearGradient>
            </Defs>

            {/* Background grid lines */}
            {[0.25, 0.5, 0.75].map((position, index) => (
              <Path
                key={`grid-${index}`}
                d={`M ${paddingLeft} ${chartHeight * position} H ${chartWidth - paddingRight}`}
                stroke="#f0f0f0"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
            ))}

            {/* Filled area below the line */}
            <Polygon points={fillPoints} fill="url(#gradientFill)" />

            {/* The actual line - with smoother curve */}
            <Polyline
              points={pointsString}
              fill="none"
              stroke={gradientColors.middle}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points - show fewer points for cleaner look */}
            {chartData.map((value, index) => {
              // Only show some points for cleaner look
              if (index % 3 !== 0 && index !== chartData.length - 1) return null;
              
              const x =
                (index / (chartData.length - 1)) *
                  (chartWidth - paddingLeft - paddingRight) +
                paddingLeft;
              const y =
                chartHeight - ((value - minValue) / range) * chartHeight;

              return (
                <Circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="white"
                  stroke={gradientColors.start}
                  strokeWidth="2"
                />
              );
            })}
          </Svg>

          {/* X-axis labels */}
          <View style={styles.xAxisLabels}>
            <Text style={styles.axisLabel}>3m</Text>
            <Text style={styles.axisLabel}>2m</Text>
            <Text style={styles.axisLabel}>1m</Text>
            <Text style={styles.axisLabel}>Now</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.iconButton}>
            <Home stroke="#000" width={22} height={22} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>DFU Monitor</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell stroke="#000" width={22} height={22} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <User stroke="#fff" width={22} height={22} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title and Week Selector */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Your Statistics</Text>
        <TouchableOpacity style={styles.weekSelector}>
          <Text style={styles.weekText}>This Week</Text>
          <ChevronDown stroke="#000" width={16} height={16} />
        </TouchableOpacity>
      </View>

      {/* Alert Card for abnormal readings */}
      {showAlert && (parseFloat(healPressure) > 400 || parseFloat(ballPressure) > 400) && (
        <AlertCard
          temp1={temp1}
          temp2={temp2}
          healPressure={healPressure}
          ballPressure={ballPressure}
          onClose={() => setShowAlert(false)}
        />
      )}

      {/* Heart Rate & SpO2 Card */}
      <View style={styles.vitalSignsCard}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Heart stroke="#FF2D55" width={18} height={18} />
          </View>
          <Text style={styles.cardTitle}>Heart Rate & SpO2</Text>
          <TouchableOpacity>
            <MoreHorizontal stroke="#000" width={20} height={20} />
          </TouchableOpacity>
        </View>

        {/* Heart Rate and SpO2 Values */}
        <View style={styles.vitalSignsContainer}>
          <View style={styles.vitalSignBox}>
            <Activity stroke="#FF2D55" width={20} height={20} style={styles.vitalIcon} />
            <View>
              <Text style={styles.vitalLabel}>Heart Rate</Text>
              <Text style={styles.vitalSignValueText}>
                {loading ? "--" : heartRate}{" "}
                <Text style={styles.vitalSignUnit}>bpm</Text>
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.vitalSignBox}>
            <View style={styles.spo2IconContainer}>
              <Text style={styles.spo2Icon}>O₂</Text>
            </View>
            <View>
              <Text style={styles.vitalLabel}>SpO2</Text>
              <Text style={styles.vitalSignValueText}>
                {loading ? "--" : spo2}{" "}
                <Text style={styles.vitalSignUnit}>%</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Line Chart */}
        {renderLineChart()}
      </View>

      {/* Variables Section */}
      <View style={styles.variablesHeader}>
        <Text style={styles.variablesTitle}>Variables</Text>
        <TouchableOpacity onPress={fetchData} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Health Metrics Cards - First Row */}
      <View style={styles.metricsContainer}>
        {/* Temperature 1 Card */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={[styles.metricIconContainer, { backgroundColor: "#F0F9FF" }]}>
              <ThermometerSnowflake stroke="#0091EA" width={16} height={16} />
            </View>
            <Text style={styles.metricTitle}>Temperature 1</Text>
          </View>
          <View style={styles.metricValue}>
            {loading ? (
              <ActivityIndicator size="small" color="#0091EA" />
            ) : (
              <>
                <Text style={[styles.valueNumber, { color: "#0091EA" }]}>{temp1}</Text>
                <Text style={styles.valueUnit}>°C</Text>
              </>
            )}
          </View>
          <Text style={styles.updateText}>
            Updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </Text>
        </View>

        {/* Temperature 2 Card */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={[styles.metricIconContainer, { backgroundColor: "#FFF5E6" }]}>
              <ThermometerSun stroke="#FF9500" width={16} height={16} />
            </View>
            <Text style={styles.metricTitle}>Temperature 2</Text>
          </View>
          <View style={styles.metricValue}>
            {loading ? (
              <ActivityIndicator size="small" color="#FF9500" />
            ) : (
              <>
                <Text style={[styles.valueNumber, { color: "#FF9500" }]}>{temp2}</Text>
                <Text style={styles.valueUnit}>°C</Text>
              </>
            )}
          </View>
          <Text style={styles.updateText}>
            Updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </Text>
        </View>
      </View>

      {/* Health Metrics Cards - Second Row */}
      <View style={[styles.metricsContainer, { marginTop: 15 }]}>
        {/* Heal Pressure Card */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={[styles.metricIconContainer, { backgroundColor: "#F6F2FF" }]}>
              <Footprints stroke="#8E44AD" width={16} height={16} />
            </View>
            <Text style={styles.metricTitle}>Heel Pressure</Text>
          </View>
          <View style={styles.metricValue}>
            {loading ? (
              <ActivityIndicator size="small" color="#8E44AD" />
            ) : (
              <>
                <Text 
                  style={[
                    styles.valueNumber, 
                    { color: parseFloat(healPressure) > 400 ? "#FF2D55" : "#8E44AD" }
                  ]}
                >
                  {healPressure}
                </Text>
                <Text style={styles.valueUnit}>kPa</Text>
              </>
            )}
          </View>
          <Text style={styles.updateText}>
            Updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </Text>
        </View>

        {/* Ball Pressure Card */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={[styles.metricIconContainer, { backgroundColor: "#E6F7FF" }]}>
              <Gauge stroke="#2196F3" width={16} height={16} />
            </View>
            <Text style={styles.metricTitle}>Ball Pressure</Text>
          </View>
          <View style={styles.metricValue}>
            {loading ? (
              <ActivityIndicator size="small" color="#2196F3" />
            ) : (
              <>
                <Text 
                  style={[
                    styles.valueNumber, 
                    { color: parseFloat(ballPressure) > 400 ? "#FF2D55" : "#2196F3" }
                  ]}
                >
                  {ballPressure}
                </Text>
                <Text style={styles.valueUnit}>kPa</Text>
              </>
            )}
          </View>
          <Text style={styles.updateText}>
            Updated: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </Text>
        </View>
     </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFC",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: "row",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF2D55",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  weekSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  weekText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 5,
  },
  vitalSignsCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFECEF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  vitalSignsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#F9FAFC",
    borderRadius: 16,
    padding: 16,
  },
  vitalSignBox: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  vitalIcon: {
    marginRight: 12,
  },
  spo2IconContainer: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  spo2Icon: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#5E72E4",
  },
  vitalLabel: {
    fontSize: 12,
    color: "#8898AA",
    marginBottom: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 16,
  },
  vitalSignValueText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  vitalSignUnit: {
    fontSize: 12,
    color: "#8898AA",
    fontWeight: "normal",
  },
  lineChartContainer: {
    flexDirection: "row",
    marginTop: 10,
    height: 150,
  },
  yAxisLabels: {
    width: 30,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 8,
    paddingVertical: 10,
  },
  graphContainer: {
    flex: 1,
  },
  xAxisLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 5,
  },
  axisLabel: {
    fontSize: 10,
    color: "#8898AA",
  },
  variablesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  variablesTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  refreshButton: {
    backgroundColor: "#F9FAFC",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  refreshButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#5E72E4",
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  metricIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  metricValue: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 45,
  },
  valueNumber: {
    fontSize: 32,
    fontWeight: "bold",
    marginRight: 5,
  },
  valueUnit: {
    fontSize: 14,
    color: "#8898AA",
    marginBottom: 5,
  },
  updateText: {
    fontSize: 10,
    color: "#8898AA",
    marginTop: 8,
  },
  alertCard: {
    flexDirection: "row",
    backgroundColor: "#FFE5E5",
    borderLeftWidth: 4,
    borderColor: "#FF2D55",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#FF2D55",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
  },
  alertIconContainer: {
    marginRight: 16,
    justifyContent: "center",
  },
  alertContent: {
    flex: 1,
  },
  alertText: {
    color: "#FF2D55",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  alertSubtext: {
    color: "#666",
    fontSize: 12,
  },
  alertCloseButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
});