#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Constants and Definitions
#define RELAY_PIN 15
#define LCD_ADDR 0x27
#define LCD_COLS 16
#define LCD_ROWS 2
#define NO_SIGNAL_TIMEOUT_MS 20000
#define DISPLAY_LOGO_TIMEOUT_MS NO_SIGNAL_TIMEOUT_MS

// LCD Initialization
LiquidCrystal_I2C lcd(LCD_ADDR, LCD_COLS, LCD_ROWS);

// Time Management
unsigned long lastDisplayTime = 0;
unsigned long lastStrobeTime = 0;

// State Variables
bool isDisplayingLogo = false;

// Function Prototypes
bool parseItemCommand(const String& command, String& itemName, String& itemPrice, String& total);
bool parseAmountCommand(const String& command, String& paymentMethod, String& amount);
void setStrobe(bool state);
void displayKinoCafe();
void displayItemData(const String& itemName, const String& itemPrice, const String& total);
void displayAmountData(const String& paymentMethod, const String& amount);
void processCommand(const String& command);

// Helper Functions

/**
 * @brief Splits a string in the format "itemName|itemPrice|total" into its components.
 *
 * @param input The input string.
 * @param itemName Output parameter for the item name.
 * @param itemPrice Output parameter for the item price.
 * @param total Output parameter for the total.
 * @return true if parsing was successful, false otherwise.
 */
bool parseItemCommand(const String& command, String& itemName, String& itemPrice, String& total) {
  int firstDelimiter = command.indexOf('|');
  int secondDelimiter = command.indexOf('|', firstDelimiter + 1);

  if (firstDelimiter == -1 || secondDelimiter == -1) {
    Serial.println("parseItemCommand: Invalid format. Expected 'itemName|itemPrice|total'");
    return false;
  }

  itemName = command.substring(0, firstDelimiter);
  itemPrice = command.substring(firstDelimiter + 1, secondDelimiter);
  total = command.substring(secondDelimiter + 1);
  return true;
}

/**
 * @brief Splits a string in the format "paymentMethod|amount" into its components.
 *
 * @param input The input string.
 * @param paymentMethod Output parameter for the payment method.
 * @param amount Output parameter for the amount.
 * @return true if parsing was successful, false otherwise.
 */
bool parseAmountCommand(const String& command, String& paymentMethod, String& amount) {
  int delimiter = command.indexOf('|');

  if (delimiter == -1) {
    Serial.println("parseAmountCommand: Invalid format. Expected 'paymentMethod|amount'");
    return false;
  }

  paymentMethod = command.substring(0, delimiter);
  amount = command.substring(delimiter + 1);
  return true;
}

/**
 * @brief Sets the strobe relay to the specified state and updates related variables.
 *
 * @param state true for HIGH (strobe on logically, relay off physically due to inversion), false for LOW (strobe off logically, relay on physically).
 */
void setStrobe(bool state) {
  lastStrobeTime = millis();
  int relayState = !state;  // Inverted logic for relay
  Serial.print("Setting strobe alarm to ");
  Serial.print(state ? "on" : "off");
  Serial.print(" = digital ");
  Serial.println(relayState ? "HIGH" : "LOW");
  digitalWrite(RELAY_PIN, relayState);
}

/**
 * @brief Displays the "Kino Cafe" logo on the LCD.
 * Prevents redisplaying if already displaying logo.
 */
void displayKinoCafe() {
  if (isDisplayingLogo) {
    return;
  }
  isDisplayingLogo = true;
  lcd.clear();
  Serial.println("Displaying Kino Cafe");
  lcd.setCursor(6, 0);
  lcd.print("Kino");
  lcd.setCursor(6, 1);
  lcd.print("Cafe");
}

/**
 * @brief Displays item data on the LCD.
 *
 * @param itemName The name of the item.
 * @param itemPrice The price of the item.
 * @param total The total amount.
 */
void displayItemData(const String& itemName, const String& itemPrice, const String& total) {
  lcd.clear();
  delay(100);  // Small delay for clear to take effect
  lcd.setCursor(0, 0);
  lcd.print(itemName);

  lcd.setCursor(0, 1);
  lcd.print("EUR");
  lcd.print(itemPrice);

  lcd.setCursor(total.length() == 4 ? 10 : 9, 1);  // Adjust position for total display
  lcd.print("->");
  lcd.print(total);
}

/**
 * @brief Displays amount data on the LCD.
 *
 * @param paymentMethod The payment method.
 * @param amount The amount paid.
 */
void displayAmountData(const String& paymentMethod, const String& amount) {
  lcd.clear();
  delay(100);  // Small delay for clear to take effect
  lcd.setCursor(0, 0);
  lcd.print(paymentMethod);

  lcd.setCursor(amount.length() == 4 ? 1 : 0, 1);
  lcd.print("Totale: EUR");
  lcd.print(amount);
}


/**
 * @brief Processes incoming commands from the serial port.
 *
 * @param command The command string received.
 */
void processCommand(const String& command) {
  isDisplayingLogo = false;  // New command received, no longer displaying logo

  String itemName, itemPrice, total;
  String paymentMethod, amount;

  if (parseItemCommand(command, itemName, itemPrice, total)) {
    displayItemData(itemName, itemPrice, total);
    lastDisplayTime = millis();  // Update last signal time
  } else if (parseAmountCommand(command, paymentMethod, amount)) {
    displayAmountData(paymentMethod, amount);
    lastDisplayTime = millis();  // Update last signal time
  } else if (command == "strobeOn") {
    setStrobe(true);
  } else if (command == "strobeOff") {
    setStrobe(false);
  } else {
    isDisplayingLogo = true;  // If invalid command, revert to logo display on timeout
    Serial.println("Invalid command");
  }
}

// Arduino Setup Function
void setup() {
  pinMode(RELAY_PIN, OUTPUT);

  Serial.begin(9600);
  Serial.println("Serial started");

  Wire.begin();  // Initialize Wire library for I2C
  lcd.init();
  lcd.backlight();

  setStrobe(false);  // Initialize strobe off

  displayKinoCafe();           // Display logo on boot
  lastDisplayTime = millis();  // Initialize last display time to prevent immediate logo re-display
}

// Arduino Main Loop
void loop() {
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();  // Remove leading/trailing whitespaces
    Serial.print("Command received: ");
    Serial.println(command);

    processCommand(command);
  }

  // Strobe Auto-Timeout
  if (millis() - lastStrobeTime > NO_SIGNAL_TIMEOUT_MS) {
    setStrobe(false);  // Turn off strobe after timeout
    Serial.println("Strobe auto-timeout");
  }

  // Display Logo Timeout
  if (millis() - lastDisplayTime > DISPLAY_LOGO_TIMEOUT_MS) {
    displayKinoCafe();
  }
}