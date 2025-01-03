import { createMachine, assign, createActor } from "xstate";

// Define the State Machine for the EV Charging Machine
const evChargingMachine = createMachine({
  id: "evCharging",
  initial: "Idle",
  context: {
    message: "",
  },
  states: {
    Idle: {
      entry: assign({
        message: "Please plug in your Vehicle to Charge!",
      }),
      // To test the state transition
      on: {
        START_CHARGING: "Charging",
        ATTEMPT_AUTHORIZATION: "Authorized",
      },
    },
    Authorized: {
      entry: assign({
        message: "Vehicle Authorized! Please plug in your Vehicle to Charge!",
      }),
      on: {
        AUTHORIZATION_SUCCESS: "Starting",
        AUTHORIZATION_FAILED: "AuthorizationFailed",
      },
    },
    AuthorizationFailed: {
      entry: assign({
        message:
          "Vehicle Authorization Failed! Please try again or Contact Support team!",
      }),
    },
    Starting: {
      entry: assign({
        message: "Preparing the Charging Process",
      }),
      on: {
        CHARGING_STARTED: "Charging",
      },
    },
    Charging: {
      entry: assign({
        message: "Charging in Progress!",
      }),
      // After 5 seconds, transition to Idle state automatically
      after: {
        5000: "Stopped",
      },
    },
    Stopped: {
      entry: assign({
        message: "Charging Stopped!",
      }),
      after: {
        2000: "Idle",
      },
    },
  },
});

// Create an Actor for the EV Charging Machine
const evChargingActor = createActor(evChargingMachine);

// Subscribe to the Actor
evChargingActor.subscribe((state) => {
  console.log(state.context.message);
});

// Start the Actor
evChargingActor.start();

// Simulate user evetn to Change the state from Idle to Charging
// evChargingActor.send({ type: "START_CHARGING" });
evChargingActor.send({ type: "ATTEMPT_AUTHORIZATION" });
// evChargingActor.send({ type: "AUTHORIZATION_FAILED" });
evChargingActor.send({ type: "AUTHORIZATION_SUCCESS" });
evChargingActor.send({ type: "CHARGING_STARTED" });
