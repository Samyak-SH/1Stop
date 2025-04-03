#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// #define POLLING_TIME 3000 //in millisecond, 3000ms = 3s

const char* ssid = "POCO X5 Pro 5G";
const char* password = "password";
const char* serverURL = "http://192.168.161.58:3000";
const char* pollURL = "http://192.168.161.58:3000/poll";
const char* cameraURL = "http://192.168.161.58:3000/updatedensity";

//function signatures
StaticJsonDocument<100> POST(String url, StaticJsonDocument<100> parsedPayload);
StaticJsonDocument<300> GET(String url);
String getPublicIp();
void getGeoLocation(String ip);
String getWiFiStatus(wl_status_t status);

void setup() {
    Serial.begin(115200);
    WiFi.begin(ssid, password);

    Serial.println("Connecting to WiFi...");

    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.print(": WiFi Status = ");
        Serial.println(getWiFiStatus(WiFi.status())); // Log failure reason
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nConnected to WiFi!");
        Serial.print("IP Address: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("\nFailed to connect to WiFi");
    }
}

//simulate movement for now
double latitude[] = {
        13.1220, 13.1238, 13.1252, 13.1278, 13.1305, 
        13.1309, 13.1310, 13.1311, 13.1313, 13.1327, 
        13.1333, 13.1351, 13.1372, 13.1383, 13.1386, 
        13.1388, 13.1390, 13.1391, 13.1393, 13.1401, 
        13.1417, 13.1432, 13.1436, 13.1438, 13.1439, 
        13.1440, 13.1450, 13.1461, 13.1474, 13.1487, 
        13.1499, 13.1507, 13.1509, 13.1511, 13.1513 
};

double longitude[] = {
        77.6106, 77.6114, 77.6121, 77.6135, 77.6147, 
        77.6150, 77.6150, 77.6151, 77.6152, 77.6158, 
        77.6161, 77.6170, 77.6175, 77.6174, 77.6175, 
        77.6175, 77.6175, 77.6175, 77.6175, 77.6175, 
        77.6174, 77.6174, 77.6174, 77.6174, 77.6174, 
        77.6175, 77.6176, 77.6177, 77.6179, 77.6186, 
        77.6192, 77.6197, 77.6196, 77.6197, 77.6197 
};

double stopsX[] = {
  13.1311, 13.1389, 13.1437, 13.1512
};

double stopsY[] = {
  77.6150, 77.6173, 77.6172, 77.6203
};

int LONG_POLLING_TIME = 3000;//7s
int SHORT_POLLING_TIME = 1000;//3s
int CAPTURE_POLLING_TIME = 15000;//15s
short int MAX_BUS_STOPS = 4;
short int destination_bus_stop = 0;
short int take_photo_counter = 0;
short int count = 0;
bool going = true;

void loop() {

  if (WiFi.status() == WL_CONNECTED) {
    StaticJsonDocument<300> response = GET("http://172.19.96.1:8000/test");
    const char* message = response["message"];
    Serial.println(message);
    Serial.print("count : ");
    Serial.println(count);

    StaticJsonDocument<100> parsedPayload;
    parsedPayload["origin_lat"] = latitude[count];
    parsedPayload["origin_lon"] = longitude[count];
    parsedPayload["dest_lat"] = stopsX[destination_bus_stop];
    parsedPayload["dest_lon"] = stopsY[destination_bus_stop];
    parsedPayload["busNo"] = "298M";

    if(take_photo_counter % 3 == 0){
      StaticJsonDocument<100> parsedResponse = POST(cameraURL, parsedPayload);
      const char* response = parsedResponse["message"];
      take_photo_counter = (take_photo_counter + 1)%3;
      Serial.print("Photo response : ");
      Serial.println(response);
      return;
    }

    StaticJsonDocument<100> parsedResponse = POST(pollURL, parsedPayload);
    int nearBusStop = parsedResponse["nearBusStop"];
    if(nearBusStop == 1){
      Serial.println("nearBusStop");
      count = (count + 1)%35;
      int changeStop = parsedResponse["changeStop"];
      if(changeStop == 1){
        Serial.print("changing stop : ");
        destination_bus_stop = (destination_bus_stop+1) % MAX_BUS_STOPS;
        Serial.println(destination_bus_stop);
      }
      take_photo_counter = (take_photo_counter+1)%5;
      delay(SHORT_POLLING_TIME);
    }
    else{
      take_photo_counter = (take_photo_counter+1)%3;
      Serial.println("not near bustop");
      count = (count + 1)%35;
      delay(LONG_POLLING_TIME);
    }
  }
  else{
    delay(100);
  }

}

//function to send post request
StaticJsonDocument<100> POST(String url, StaticJsonDocument<100> parsedPayload){
  Serial.print("sending post req to : ");
  Serial.println(url);

  StaticJsonDocument<100> parsedResponse;
  String unparsedPayload, unparsedResponse;

  serializeJson(parsedPayload, unparsedPayload);//json-->string

  HTTPClient http;

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  Serial.println("Connected to server for post");

  // Serial.println("Sending: " + unparsedPayload);

  int response = http.POST(unparsedPayload);//send payload to server and receive response

  if (response > 0) {
      unparsedResponse = http.getString();//collect response string
      // Serial.println("Response: " + unparsedResponse);
  } else {
      Serial.println("Error in HTTP request");
  }
  
  DeserializationError error = deserializeJson(parsedResponse, unparsedResponse);//string-->json
  if(error){
    Serial.print("JSON parsed fail : ");
    Serial.print(error.f_str());
    return parsedResponse;
  }
  http.end();
  return parsedResponse;
}

//function to send get request
StaticJsonDocument<300> GET(String url) {
    StaticJsonDocument<300> parsedResponse;
    String unparsedResponse;

    HTTPClient http;
    http.begin(url);
    Serial.println("\nConnected to the server for GET request");
    

    int response = http.GET();
    // delay(5000);
    Serial.println("Waiting for response...");

    int responseSize = http.getSize();
    Serial.print("response size : ");
    Serial.println(responseSize);

    if (response > 0) {
        unparsedResponse = http.getString();
        Serial.println("Raw Response: " + unparsedResponse); // Debugging output
    } else {
        Serial.print("Error in HTTP request ");
        Serial.println(response);
    }

    DeserializationError error = deserializeJson(parsedResponse, unparsedResponse);
    if (error) {
        Serial.print("JSON Parse Failed: ");
        Serial.println(error.f_str());
    }
    
    http.end();
    return parsedResponse;
}


// Function to get human-readable WiFi status messages
String getWiFiStatus(wl_status_t status) {
    switch (status) {
        case WL_IDLE_STATUS:   return "Idle";
        case WL_NO_SSID_AVAIL: return "SSID Not Found";
        case WL_SCAN_COMPLETED: return "Scan Completed";
        case WL_CONNECTED:     return "Connected";
        case WL_CONNECT_FAILED: return "Connection Failed (Wrong password?)";
        case WL_CONNECTION_LOST: return "Connection Lost";
        case WL_DISCONNECTED:  return "Disconnected";
        default:               return "Unknown Status";
    }
}
