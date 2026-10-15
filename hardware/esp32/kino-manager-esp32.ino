#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// display is at 0x27
LiquidCrystal_I2C lcd(0x27, 16, 2);

unsigned long lastSignalTime = 0;             // Variable to store the last time a signal was received
const unsigned long noSignalTimeout = 20000;  // 20 seconds timeout

bool splitItemString(const String& input, String& itemName, String& itemPrice, String& total) {
  // Find the positions of the delimiters
  int firstDelimiter = input.indexOf('|');
  int secondDelimiter = input.indexOf('|', firstDelimiter + 1);

  // Check if the delimiters are found
  if (firstDelimiter == -1 || secondDelimiter == -1) {
    return false;  // Invalid input format
  }

  // Extract the parts as strings
  itemName = input.substring(0, firstDelimiter);
  itemPrice = input.substring(firstDelimiter + 1, secondDelimiter);
  total = input.substring(secondDelimiter + 1);

  return true;  // Success
}

bool splitAmountString(const String& input, String& paymentMethod, String& amount) {
  // Find the position of the delimiter
  int delimiter = input.indexOf('|');

  // Check if the delimiter is found
  if (delimiter == -1) {
    return false;  // Invalid input format
  }

  // Extract the parts as strings
  paymentMethod = input.substring(0, delimiter);
  amount = input.substring(delimiter + 1);

  return true;  // Success
}

bool clearFlag = false;

void displayKinoCafe() {
  if (!clearFlag) {
    clearFlag = true;
    lcd.clear();
  }
  lcd.setCursor(6, 0);
  lcd.print("Kino");
  lcd.setCursor(6, 1);
  lcd.print("Cafe");
}

void setup() {
  Serial.begin(9600);

  lcd.init();
  lcd.backlight();

  // Display "Kino Cafe" on boot
  displayKinoCafe();
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');

    String itemName, itemPrice, total;

    // Call the function
    if (splitItemString(command, itemName, itemPrice, total)) {
      lcd.clear();
      sleep(0.1);
      // Print the results
      lcd.setCursor(0, 0);
      lcd.print(itemName);

      lcd.setCursor(0, 1);
      lcd.print("EUR");  // Assuming itemPrice is a price, adding a dollar sign for clarity
      lcd.print(itemPrice);

      lcd.setCursor(total.length() == 4 ? 10 : 9, 1);  // Adjust position for total display
      lcd.print("->");
      lcd.print(total);

      // Update the last signal time
      lastSignalTime = millis();
    } else if (splitAmountString(command, itemName, itemPrice)) {
      lcd.clear();
      sleep(0.1);
      // Print the results
      lcd.setCursor(0, 0);
      lcd.print(itemName);

      lcd.setCursor(itemPrice.length() == 4 ? 1 : 0, 1);
      lcd.print("Totale: EUR");
      lcd.print(itemPrice);

      // Update the last signal time
      lastSignalTime = millis();
    } else {
      Serial.println("Invalid input format!");
    }
    clearFlag = false;
  }

  // Check if 20 seconds have passed since the last signal
  if (millis() - lastSignalTime > noSignalTimeout) {
    displayKinoCafe();
  }
}