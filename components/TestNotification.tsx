import { Button } from "react-native";
import React from "react";
import { displayNotification } from "../background";

const TestNotification = () => {
  return (
    <Button
      title="Display Notification"
      onPress={() =>
        displayNotification(
          "Test",
          "Background Notifications Work Even In Killed State"
        )
      }
    />
  );
};

export default TestNotification;
